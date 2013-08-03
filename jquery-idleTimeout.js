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

(function($) {

  $.fn.idleTimeout = function(options) {
    //##############################
    //## Configuration Variables
    //##############################
    var defaults = {
      idleTimeLimit:        1200000,        // 'No activity' time limit in milliseconds. 1200000 = 20 Minutes
      // idleTimeLimit:     30000,          // 30 seconds for testing
      dialogDisplayLimit:   180000,         // Time to display the dialog before redirect (or callback) in milliseconds. 180000 = 3 Minutes
      //dialogDisplayLimit: 30000,          // 30 seconds for testing
      redirectUrl:          '/logout',      // redirect to this url

      // custom callback to perform before redirect
      customCallback:       false,          // set to false for no customCallback
      // customCallback:    function() {    // define custom js function
          // User is logged out, perform custom action
      // },

      // http://www.quirksmode.org/dom/events/
      // https://developer.mozilla.org/en-US/docs/Web/Reference/Events
      activityEvents:       'click keypress scroll wheel mousewheel mousemove', // separate each event with a space
      //activityEvents:     'click keypress scroll wheel mousewheel', // customize events for testing - remove mousemove

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
    var start_idle_timer = function() {
      clearTimeout(idleTimer);
      clearTimeout(dialogTimer);

      lastIdleTimerStart = $.now();

      if (store.enabled) {
        store.set("lastIdleTimerStart", lastIdleTimerStart);
        store.set('idleTimeoutDialogWarning', false);
        store.set('idleTimeoutLoggedOut', false);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }

      idleTimer = setTimeout(start_dialog_timer, opts.idleTimeLimit);
    };

    var get_warning_dialog = function() {
      var warningDialog = $(dialogContent).dialog({
        buttons: {
          "Log Out Now": function() {
            perform_logout_procedure();
          },
          "Stay Logged In": function() {
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

    var storage_event_reactor = function(event) {
      if (event.key != 'lastIdleTimerStart') {

        if (store.get('idleTimeoutDialogWarning') == true) {
          get_warning_dialog();
        } else if (store.get('idleTimeoutDialogWarning') == false) {
          destroy_warning_dialog();
          clearTimeout(dialogTimer);
        }

        if (store.get('idleTimeoutLoggedOut') == true) {
          perform_logout_procedure();
        }
      }
    };

    var start_dialog_timer = function() {
      clearTimeout(idleTimer);

      if (store.enabled) {
        if (lastIdleTimerStart === store.get('lastIdleTimerStart')) {
          store.set('idleTimeoutDialogWarning', true);
          get_warning_dialog();
          dialogTimer = setTimeout(perform_logout_procedure, opts.dialogDisplayLimit);
        }
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }
    };

    var perform_logout_procedure = function() {
      clearInterval(keepSessionAlive);
      clearTimeout(idleTimer);
      clearTimeout(dialogTimer);

      if (store.enabled) {
        store.set('idleTimeoutLoggedOut', true);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }

      if (opts.customCallback) {
        opts.customCallback();
      }

      if (opts.redirectUrl) {
        window.location.href = opts.redirectUrl;
      }
    };

    if (opts.sessionKeepAliveTimer) {
      var keep_session = function() {
        $.get(opts.sessionKeepAliveUrl);
      };

      keepSessionAlive = setInterval(keep_session, opts.sessionKeepAliveTimer);
    }

    //###############################
    // Build & Return the instance of the item as a plugin
    // This is basically your construct.
    //###############################
    return this.each(function() {
      start_idle_timer();

      $('body').on(opts.activityEvents, function() {
        var dialogOpen = $('#dialog_warning_box').dialog('isOpen');

        if (dialogOpen !== true) {
          start_idle_timer();
        }
      });

      window.addEventListener('storage', storage_event_reactor, false);
    });
  }
})(jQuery);

