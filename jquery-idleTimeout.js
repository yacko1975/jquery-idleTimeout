//######
//## This work is licensed under the Creative Commons Attribution-Share Alike 3.0
//## United States License. To view a copy of this license,
//## visit http://creativecommons.org/licenses/by-sa/3.0/us/ or send a letter
//## to Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA.
//######

// Dependency: https://github.com/marcuswestin/store.js - version 1.3.4+

// Thanks to https://github.com/philpalmieri/jquery-idleTimeout & https://github.com/josebalius/jquery-idleTimeout
// Modified By: Jill Elaine
// Email: jillelaine01(at)gmail(dot)com

// version 1.0.2

(function($) {

  $.fn.idleTimeout = function(options) {
    //##############################
    //## Configuration Variables
    //##############################
    var defaults = {
      idleTimeLimit:      1200000,        // 'No activity' time limit in milliseconds. 1200000 = 20 Minutes
      dialogDisplayLimit: 180000,         // Time to display the warning dialog before redirect (and optional callback) in milliseconds. 180000 = 3 Minutes
      redirectUrl:        '/logout',      // redirect to this url

      // optional custom callback to perform before redirect
      customCallback:       false,          // set to false for no customCallback
      // customCallback:    function() {    // define optional custom js function
          // perform custom action before logout
      // },

      // configure which activity events to detect
      // http://www.quirksmode.org/dom/events/
      // https://developer.mozilla.org/en-US/docs/Web/Reference/Events
      activityEvents:       'click keypress scroll wheel mousewheel mousemove', // separate each event with a space

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
    var idleTimer, dialogTimer, idleTimerLastActivity;
    var checkHeartbeat = 2000; // frequency to check for timeouts - 2000 = 2 seconds.

    //##############################
    //## Private Functions
    //##############################

    var open_warning_dialog = function() {
      var dialogContent = "<div id='idletimer_warning_dialog'><p>" + opts.dialogText + "</p></div>";

      var warningDialog = $(dialogContent).dialog({
        buttons: {
          "Stay Logged In": function() {
            destroy_warning_dialog();
            stop_dialog_timer();
            start_idle_timer();
          },
          "Log Out Now": function() {
            logout_user();
          }
        },
        closeOnEscape: false,
        modal: true,
        title: opts.dialogTitle
      });

      // hide the dialog's upper right corner "x" close button
      $('.ui-dialog-titlebar-close').css('display', 'none');
    };

    var is_dialog_open = function() {
      var dialogOpen = $('#idletimer_warning_dialog').dialog('isOpen');

      if (dialogOpen === true) {
        return true;
      } else {
        return false;
      }
    };

    var destroy_warning_dialog = function() {
      $(".ui-dialog-content").dialog('destroy').remove();
    };

    var checkIdleTimeout = function() {
      var timeNow = $.now();
      var timeIdleTimeout = (store.get('idleTimerLastActivity') + opts.idleTimeLimit);

      if (timeNow > timeIdleTimeout) {
        if (is_dialog_open() !== true) {
          open_warning_dialog();
          start_dialog_timer();
        }
      } else if (store.get('idleTimerLoggedOut') === true) { //a 'manual' user logout?
        logout_user();
      } else {
        if (is_dialog_open() === true) {
          destroy_warning_dialog();
          stop_dialog_timer();
        }
      }
    };

    var start_idle_timer = function() {
      stop_idle_timer();
      idleTimerLastActivity = $.now();
      store.set('idleTimerLastActivity', idleTimerLastActivity);
      idleTimer = setInterval(checkIdleTimeout, checkHeartbeat);
    };

    var stop_idle_timer = function() {
      clearInterval(idleTimer);
    };

    var checkDialogTimeout = function() {
      var timeNow = $.now();
      var timeDialogTimeout = (store.get('idleTimerLastActivity') + opts.idleTimeLimit + opts.dialogDisplayLimit);

      if ((timeNow > timeDialogTimeout) || (store.get('idleTimerLoggedOut') === true)) {
        logout_user();
      }
    };

    var start_dialog_timer = function() {
      dialogTimer = setInterval(checkDialogTimeout, checkHeartbeat);
    };

    var stop_dialog_timer = function() {
      clearInterval(dialogTimer);
    };

    var logout_user = function() {
      store.set('idleTimerLoggedOut', true);

      if (opts.customCallback) {
        opts.customCallback();
      }

      if (opts.redirectUrl) {
        window.location.href = opts.redirectUrl;
      }
    };

    var activity_detector = function() {

      $('body').on(opts.activityEvents, function() {

        if (is_dialog_open() !== true) {
          start_idle_timer();
        }
      });
    };

    var keep_session_alive = function() {

      if (opts.sessionKeepAliveTimer) {
        var keep_session = function() {
          if (idleTimerLastActivity == store.get('idleTimerLastActivity')) {
            $.get(opts.sessionKeepAliveUrl);
          }
        };

        setInterval(keep_session, opts.sessionKeepAliveTimer);
      }
    };

    //###############################
    // Build & Return the instance of the item as a plugin
    // This is your construct.
    //###############################
    return this.each(function() {

      if (store.enabled) {
        idleTimerLastActivity = $.now();
        store.set('idleTimerLastActivity', idleTimerLastActivity);
        store.set('idleTimerLoggedOut', false);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }

      activity_detector();

      keep_session_alive();

      start_idle_timer();
    });
  }
})(jQuery);
