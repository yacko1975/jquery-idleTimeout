//######
//## This work is licensed under the Creative Commons Attribution-Share Alike 3.0
//## United States License. To view a copy of this license,
//## visit http://creativecommons.org/licenses/by-sa/3.0/us/ or send a letter
//## to Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA.
//######
// Dependency: https://github.com/marcuswestin/store.js
// Thanks to https://github.com/philpalmieri/jquery-idleTimeout & https://github.com/josebalius/jquery-idleTimeout
// Modified By: Jill Elaine
// Email: jillelaine01@gmail.com

// HEAVILY COMMENTED

/*
  TODO:
  listen for selection of browser tab as an inactivity event

  FIX:
  When warning dialog box appears, 'active' tab will not stop countdown to logout
    if user clicks to 'inactive' tab and clicks 'Stay Logged In' on dialog box on 'inactive' tab
*/

(function($) {

  $.fn.idleTimeout = function(options) {
    console.log('start');
    //##############################
    //## Configuration Variables
    //##############################
    var defaults = {
      //idleTimeLimit:      1200000,        // 'No activity' time limit in milliseconds. 1200000 = 20 Minutes
      idleTimeLimit:        30000,          // 30 seconds for testing
      //dialogDisplayLimit: 180000,         // Time to display the dialog before redirect (or callback) in milliseconds. 180000 = 3 Minutes
      dialogDisplayLimit:   30000,          // 30 seconds for testing
      redirectUrl:          '/logout', // CAUTION: will be ignored if a customCallback is defined
      customCallback:       false,          // will override redirectUrl if defined

      // activity events to detect
      // http://www.quirksmode.org/dom/events/
      // https://developer.mozilla.org/en-US/docs/Web/Reference/Events
      // JQuery on() method expects a 'space-separated' string of event names
      // activityEvents:       'click keypress scroll wheel mousewheel mousemove', // separate each event with a space
      activityEvents:       'click keypress scroll wheel mousewheel',

      //dialog box configuration
      dialogTitle:          'Auto Logout',
      dialogText:           'You are about to be logged out due to inactivity.',

      // server-side session keep-alive timer & url
      sessionKeepAliveTimer: 60000, // Ping the server at this interval in milliseconds. 60000 = 1 Minute
      sessionKeepAliveUrl:   '/home', // url to ping
    };

    //##############################
    //## Private Variables
    //##############################
    var opts = $.extend(defaults, options);
    var dialogContent = "<div id='dialog_warning_box'><p>" + opts.dialogText + "</p></div>";
    var idleTimer, dialogTimer, lastIdleTimerStart, keepSessionAlive;

    //##############################
    //## Private Functions
    //##############################

    // start the idle timer
    var start_idle_timer = function() {
          console.log('start_idle_timer');

          clearTimeout(idleTimer);
          clearTimeout(dialogTimer);

          lastIdleTimerStart = $.now();

          // store the current time for cross-tab functionality
          if (store.enabled) {
            // inactive tabs listen for storage events
            store.set("lastIdleTimerStart", lastIdleTimerStart);
            store.set('idleTimeoutDialogWarning', false);
            store.set('idleTimeoutLoggedOut', false);

            console.log('start_idle_timer lastIdleTimerStart: ' + store.get("lastIdleTimerStart"));
          } else {
            alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
          }

          // start the countdown before display of warning dialog
          idleTimer = setTimeout(start_dialog_timer, opts.idleTimeLimit);
        };

    var get_warning_dialog = function() {
            // create the warning dialog
            var warningDialog = $(dialogContent).dialog({
              buttons: {
                  // Button one - immediately log out
                  "Log Out Now": function() {
                    console.log('user clicked "Log Out Now" button');

                    // inactive tabs listen for storage events - trigger log out other tabs
                    store.set('idleTimeoutLoggedOut', true);

                    window.location.href = opts.redirectUrl;
                  },
                  // Button two - stay logged in
                  "Stay Logged In": function() {
                    console.log('user clicked "Stay Logged In" button');

                    // destroy & remove dialog so we can later test for its existence
                    $(this).dialog('destroy').remove();

                    // restart the idle timer
                    start_idle_timer();
                  }
                },
              closeOnEscape: false,
              modal: true,
              title: opts.dialogTitle
            });

            // hide the dialog's upper right corner "x" close button
            $('.ui-dialog-titlebar-close').css('display', 'none');
        };

    // pop up the warning dialog & start the warning dialog timer
    var start_dialog_timer = function() {
          console.log('start_dialog_timer');

          clearTimeout(idleTimer);

          if (store.enabled) {

            console.log('last: ' + lastIdleTimerStart + ' stored-lastIdleTimerStart: ' + store.get('lastIdleTimerStart'));

            // if these values are equal, then this is the most recent active tab
            if (lastIdleTimerStart === store.get('lastIdleTimerStart')) {
              console.log('This is the active tab');

              // inactive tabs listen for change in storage values
              store.set('idleTimeoutDialogWarning', true);

              // get the popup warning dialog
              get_warning_dialog();

              // start the countdown to redirect
              dialogTimer = setTimeout(perform_redirect, opts.dialogDisplayLimit);

            } else {
              console.log('This is NOT the active tab');

              // storage event change function
              function storageEventChange(event) {
                // a 'storage' event has occurred

                // warning dialog has appeared on active tab?
                if (store.get('idleTimeoutDialogWarning') == true) {
                  console.log('pop up the warning dialog on the inactive tab');

                  // show the popup warning dialog on the inactive tab too
                  get_warning_dialog();
                } else if (store.get('idleTimeoutDialogWarning') == false) {
                  console.log('close the warning dialog on the inactive tab');

                  // destroy & remove the warning dialog on the inactive tab
                  $(".ui-dialog-content").dialog('destroy').remove();
                }

                // active tab has logged out?
                if (store.get('idleTimeoutLoggedOut') == true) {
                  console.log('log out the inactive tab');

                  // log out the inactive tab
                  window.location.href = opts.redirectUrl;
                }
              }

              // inactive tabs listen for 'storage' events
              window.addEventListener('storage', storageEventChange, false);
            }

          } else {
            alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
          }
        };

    // redirect function
    var perform_redirect = function() {
          console.log('perform_redirect');

          clearInterval(keepSessionAlive);
          clearTimeout(idleTimer);
          clearTimeout(dialogTimer);

          // inactive tabs listen for 'storage' events
          if (store.enabled) {
            store.set('idleTimeoutLoggedOut', true);
          } else {
            alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
          }

          if (opts.customCallback) {
            opts.customCallback(); //customCallback overrides redirectUrl
          } else {
            window.location.href = opts.redirectUrl;
          }
        };

    // ping the server at regular intervals to prevent a server idle timeout
    var keep_session = function() {
          console.log('keep session alive function');
          $.get(opts.sessionKeepAliveUrl);
        };

    keepSessionAlive = setInterval(keep_session, opts.sessionKeepAliveTimer);

    //###############################
    // Build & Return the instance of the item as a plugin
    // This is basically your construct.
    //###############################
    return this.each(function() {
      console.log('instance started');

      start_idle_timer();

      // activity detector - restart idle timer
      $('body').on(opts.activityEvents, function(event) {
          console.log('activity detected');

          // dialog must be destroyed & removed, not just closed, to use this var as a test of dialog 'open-ness'
          var dialogOpen = $('#dialog_warning_box').dialog('isOpen');

          if (dialogOpen === true) {
            console.log('dialog is open - activity ignored');
          } else {
            console.log('dialog is closed - timer restarted');
            start_idle_timer();
          }

        });
    });
  }
})(jQuery);

