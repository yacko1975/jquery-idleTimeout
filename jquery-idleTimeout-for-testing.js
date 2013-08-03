//######
//## This work is licensed under the Creative Commons Attribution-Share Alike 3.0
//## United States License. To view a copy of this license,
//## visit http://creativecommons.org/licenses/by-sa/3.0/us/ or send a letter
//## to Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA.
//######

// Dependency: https://github.com/marcuswestin/store.js - version 1.3.4+

// Thanks to https://github.com/philpalmieri/jquery-idleTimeout & https://github.com/josebalius/jquery-idleTimeout
// Modified By: Jill Elaine
// Email: jillelaine01@gmail.com

// version 1.0
// HEAVILY COMMENTED & LOGGED FOR TESTING & DEBUGGING


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
      redirectUrl:          '/logout',      // redirect to this url

      // custom callback to perform before redirect
      customCallback:       false,          // set to false for no customCallback
      // customCallback:    function() {    // define custom js function
          // User is logged out, perform custom action
      // },

      // activity events to detect
      // http://www.quirksmode.org/dom/events/
      // https://developer.mozilla.org/en-US/docs/Web/Reference/Events
      // JQuery on() method expects a 'space-separated' string of event names
      // activityEvents:       'click keypress scroll wheel mousewheel mousemove', // separate each event with a space
      activityEvents:       'click keypress scroll wheel mousewheel', // customize events for testing - remove mousemove

      //dialog box configuration
      dialogTitle:          'Session Expiration Warning',
      dialogText:           'Because you have been inactive, your session is about to expire.',

      // server-side session keep-alive timer & url
      sessionKeepAliveTimer: 60000, // Ping the server at this interval in milliseconds. 60000 = 1 Minute
      // sessionKeepAliveTimer: false, // Set to false to disable pings.
      sessionKeepAliveUrl:   '/', // url to ping
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

    // start the idle timer function
    var start_idle_timer = function() {
      console.log('start_idle_timer');

      clearTimeout(idleTimer);
      clearTimeout(dialogTimer);

      lastIdleTimerStart = $.now(); // http://api.jquery.com/jQuery.now/

      if (store.enabled) {

        // set storage values for cross-browser functionality
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

    // create the warning dialog function
    var get_warning_dialog = function() {
      var warningDialog = $(dialogContent).dialog({
        buttons: {
          // Button one - immediately log out
          "Log Out Now": function() {
            console.log('user clicked "Log Out Now" button');

            perform_logout_procedure();
          },
          // Button two - stay logged in
          "Stay Logged In": function() {
            console.log('user clicked "Stay Logged In" button');

            destroy_warning_dialog();

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

    var destroy_warning_dialog = function() {
      $(".ui-dialog-content").dialog('destroy').remove();
    };

    // react to a 'storage' event change function
    var storage_event_reactor = function(event) {
      console.log('event key: '+ event.key);

      // ignore lastIdleTimerStart events
      if (event.key != 'lastIdleTimerStart') {

        // warning dialog has appeared on a window or tab?
        if (store.get('idleTimeoutDialogWarning') == true) {
          console.log('pop up the warning dialog on this window or tab');

          // show the popup warning dialog on this window or tab too
          get_warning_dialog();

        } else if (store.get('idleTimeoutDialogWarning') == false) {
          console.log('destroy the warning dialog on this window or tab');

          // destroy & remove the warning dialog on this window or tab
          destroy_warning_dialog();

          // stop the dialogTimer
          clearTimeout(dialogTimer);
        }

        // a window or tab has logged out?
        if (store.get('idleTimeoutLoggedOut') == true) {
          console.log('log out this window or tab');

          // log out this window or tab
          perform_logout_procedure();
        }
      }
    };

    // pop up the warning dialog & start the warning dialog timer function
    var start_dialog_timer = function() {
      console.log('start_dialog_timer');

      clearTimeout(idleTimer);

      if (store.enabled) {
        console.log('last: ' + lastIdleTimerStart + ' stored-lastIdleTimerStart: ' + store.get('lastIdleTimerStart'));

        // if these values are equal, then this is the most recent active window or tab
        if (lastIdleTimerStart === store.get('lastIdleTimerStart')) {
          console.log('This is the active window or tab');

          // set storage idleTimeoutDialogWarning value
          store.set('idleTimeoutDialogWarning', true);

          // get the popup warning dialog
          get_warning_dialog();

          // start the countdown to redirect
          dialogTimer = setTimeout(perform_logout_procedure, opts.dialogDisplayLimit);

        } else {
          console.log('This is NOT the active window or tab');
        }

      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }
    };

    // logout procedure function
    var perform_logout_procedure = function() {
      console.log('perform_logout_procedure');

      clearInterval(keepSessionAlive);
      clearTimeout(idleTimer);
      clearTimeout(dialogTimer);

      if (store.enabled) {
        // set storage idleTimeoutLoggedOut value
        store.set('idleTimeoutLoggedOut', true);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }

      if (opts.customCallback) {
        console.log('custom callback');
        opts.customCallback();
      }

      if (opts.redirectUrl) {
        window.location.href = opts.redirectUrl;
      }
    };

    // if keep-alive sessionKeepAliveTimer value is not false,
    // ping the server at regular intervals to prevent a server idle timeout
    if (opts.sessionKeepAliveTimer) {
      var keep_session = function() {
        console.log('keep session alive function');
        $.get(opts.sessionKeepAliveUrl);
      };

      keepSessionAlive = setInterval(keep_session, opts.sessionKeepAliveTimer);
    }

    //###############################
    // Build & Return the instance of the item as a plugin
    // This is basically your construct.
    //###############################
    return this.each(function() {
      console.log('instance started');

      start_idle_timer();

      // activity detector - restart idle timer if warning dialog is not open
      $('body').on(opts.activityEvents, function() {

          // warning dialog must be destroyed & removed, not just closed, to use this var as a test of dialog 'open-ness'
          var dialogOpen = $('#dialog_warning_box').dialog('isOpen');

          // ignore all activity if the warning dialog is open. Click of buttons on warning dialog are not ignored.
          if (dialogOpen === true) {
            console.log('warning dialog is open - activity ignored');
          } else {
            console.log('warning dialog is closed - timer restarted');

            start_idle_timer();
          }
        });

      // all windows and tabs listen for storage events
      window.addEventListener('storage', storage_event_reactor, false);
    });
  }
})(jQuery);
