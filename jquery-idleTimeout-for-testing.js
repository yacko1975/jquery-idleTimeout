/**
 * This work is licensed under the MIT License
 *
 * Configurable idle (no activity) timer and logout redirect for jQuery.
 * Works across multiple windows, tabs and iframes from the same domain.
 *
 * Dependencies: JQuery v1.7+, JQuery UI, store.js from https://github.com/marcuswestin/store.js - v1.3.4+
 *
 * Commented and console logged for debugging with Firefox & Firebug or similar
 * version 1.0.8
 **/

/*global jQuery: false, document: false, store: false, clearInterval: false, setInterval: false, setTimeout: false, window: false, alert: false, console: false*/
/*jslint indent: 2, sloppy: true, plusplus: true*/

(function ($) {

  $.fn.idleTimeout = function (options) {
    console.log('start');
    //##############################
    //## Configuration Variables
    //##############################
    var defaults = {
      idleTimeLimit: 30,           // 30 seconds for testing. 'No activity' time limit in seconds. 1200 = 20 Minutes
      redirectUrl: '/logout',      // redirect to this url on timeout logout. Set to "redirectUrl: false" to disable redirect

      // optional custom callback to perform before logout
      customCallback: false,       // set to false for no customCallback
      // customCallback:    function () {    // define optional custom js function
          // perform custom action before logout
      // },

      // configure which activity events to detect
      // http://www.quirksmode.org/dom/events/
      // https://developer.mozilla.org/en-US/docs/Web/Reference/Events
      activityEvents: 'click keypress scroll wheel mousewheel', // separate each event with a space

      // warning dialog box configuration
      enableDialog: true,           // set to false for logout without warning dialog
      dialogDisplayLimit: 20,       // 20 seconds for testing. Time to display the warning dialog before logout (and optional callback) in seconds. 180 = 3 Minutes
      dialogTitle: 'Session Expiration Warning',
      dialogText: 'Because you have been inactive, your session is about to expire.',
      dialogTimeRemaining: 'Time remaining',
      dialogStayLoggedInButton: 'Stay Logged In',
      dialogLogOutNowButton: 'Log Out Now',

      // error message
      errorAlertMessage: 'Please disable "Private Mode", or upgrade to a modern browser. Or perhaps a dependent file missing. Please see: https://github.com/marcuswestin/store.js',

      // server-side session keep-alive timer
      sessionKeepAliveTimer: 600,   // ping the server at this interval in seconds. 600 = 10 Minutes
      // sessionKeepAliveTimer: false, // set to false to disable pings
      sessionKeepAliveUrl: window.location.href // set URL to ping - does not apply if sessionKeepAliveTimer: false
    },

    //##############################
    //## Private Variables
    //##############################
      opts = $.extend(defaults, options),
      checkHeartbeat = 2,         // frequency to check for timeouts in seconds
      origTitle = document.title, // save original browser title
      startKeepSessionAlive, stopKeepSessionAlive, keepSession, activityDetector,
      idleTimer, remainingTimer, checkIdleTimeout, idleTimerLastActivity, startIdleTimer, stopIdleTimer,
      openWarningDialog, dialogTimer, checkDialogTimeout, startDialogTimer, stopDialogTimer, isDialogOpen, destroyWarningDialog,
      countdownDisplay, logoutUser,
      checkForIframes, includeIframes, attachEventIframe; // iframe functionality

    //##############################
    //## Private Functions
    //##############################
    startKeepSessionAlive = function () {

      keepSession = function () {
        if (idleTimerLastActivity === store.get('idleTimerLastActivity')) {
          console.log('start keep session alive function');
          $.get(opts.sessionKeepAliveUrl);
        }
      };

      setInterval(keepSession, (opts.sessionKeepAliveTimer * 1000));
    };

    stopKeepSessionAlive = function () {
      console.log('stop keep session alive function');
      clearInterval(keepSession);
    };

    activityDetector = function () {

      $('body').on(opts.activityEvents, function () {

        if (!opts.enableDialog || (opts.enableDialog && isDialogOpen() !== true)) {
          console.log('activity detected');
          startIdleTimer();
        } else {
          console.log('dialog open. activity ignored');
        }
      });
    };

    checkIdleTimeout = function () {
      var timeNow = $.now(), timeIdleTimeout = (store.get('idleTimerLastActivity') + (opts.idleTimeLimit * 1000));

      if (timeNow > timeIdleTimeout) {
        console.log('timeNow: ' + timeNow + ' > idle ' + timeIdleTimeout);

        if (!opts.enableDialog) { // warning dialog is disabled
          console.log('warning dialog disabled - log out user without warning');
          logoutUser(); // immediately log out user when user is idle for idleTimeLimit
        } else if (opts.enableDialog && isDialogOpen() !== true) {
          console.log('dialog is not open & will be opened');
          openWarningDialog();
          startDialogTimer();
        }
      } else if (store.get('idleTimerLoggedOut') === true) { //a 'manual' user logout?
        console.log('user may have manually logged out? Log out all windows & tabs now.');
        logoutUser();
      } else {
        console.log('idle not yet timed out');
        if (opts.enableDialog && isDialogOpen() === true) {
          console.log('dialog is open & will be closed');
          destroyWarningDialog();
          stopDialogTimer();
        }
      }
    };

    startIdleTimer = function () {
      stopIdleTimer();
      idleTimerLastActivity = $.now();
      store.set('idleTimerLastActivity', idleTimerLastActivity);
      console.log('start idle timer: ' + idleTimerLastActivity);
      idleTimer = setInterval(checkIdleTimeout, (checkHeartbeat * 1000));
    };

    stopIdleTimer = function () {
      clearInterval(idleTimer);
    };

    openWarningDialog = function () {
      var dialogContent = "<div id='idletimer_warning_dialog'><p>" + opts.dialogText + "</p><p style='display:inline'>" + opts.dialogTimeRemaining + ": <div style='display:inline' id='countdownDisplay'></div></p></div>";

      $(dialogContent).dialog({
        buttons: [{
          text: opts.dialogStayLoggedInButton,
          click: function () {
            console.log('Stay Logged In button clicked');
            destroyWarningDialog();
            stopDialogTimer();
            startIdleTimer();
          }
        },
          {
            text: opts.dialogLogOutNowButton,
            click: function () {
              console.log('Log Out Now button clicked');
              logoutUser();
            }
          }
          ],
        closeOnEscape: false,
        modal: true,
        title: opts.dialogTitle,
        open: function () {
          //hide the dialog's upper right corner "x" close button
          $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
        }
      });

      // start the countdown display
      countdownDisplay();

      // change title bar to warning message
      document.title = opts.dialogTitle;

      // stop the session keep-alive ping, if keep-alive is enabled
      if (opts.sessionKeepAliveTimer) {
        stopKeepSessionAlive();
      }
    };

    checkDialogTimeout = function () {
      var timeNow = $.now(), timeDialogTimeout = (store.get('idleTimerLastActivity') + (opts.idleTimeLimit * 1000) + (opts.dialogDisplayLimit * 1000));

      if ((timeNow > timeDialogTimeout) || (store.get('idleTimerLoggedOut') === true)) {
        console.log('timeNow: ' + timeNow + ' > dialog' + timeDialogTimeout);
        logoutUser();
      } else {
        console.log('dialog not yet timed out');
      }
    };

    startDialogTimer = function () {
      dialogTimer = setInterval(checkDialogTimeout, (checkHeartbeat * 1000));
    };

    stopDialogTimer = function () {
      clearInterval(dialogTimer);
      clearInterval(remainingTimer);
    };

    isDialogOpen = function () {
      var dialogOpen = $("#idletimer_warning_dialog").is(":visible");

      if (dialogOpen === true) {
        return true;
      }
      return false;
    };

    destroyWarningDialog = function () {
      console.log('dialog destroyed');
      $("#idletimer_warning_dialog").dialog('destroy').remove();
      document.title = origTitle;

      // restart the session keep-alive ping, if keep-alive is enabled
      if (opts.sessionKeepAliveTimer) {
        startKeepSessionAlive();
      }
    };

    // display remaining time on warning dialog
    countdownDisplay = function () {
      var dialogDisplaySeconds = opts.dialogDisplayLimit, mins, secs;

      remainingTimer = setInterval(function () {
        mins = Math.floor(dialogDisplaySeconds / 60); // minutes
        if (mins < 10) { mins = '0' + mins; }
        secs = dialogDisplaySeconds - (mins * 60); // seconds
        if (secs < 10) { secs = '0' + secs; }
        $('#countdownDisplay').html(mins + ':' + secs);
        dialogDisplaySeconds -= 1;
      }, 1000);
    };

    logoutUser = function () {
      console.log('logout function');
      store.set('idleTimerLoggedOut', true);

      if (opts.sessionKeepAliveTimer) {
        stopKeepSessionAlive();
      }

      if (opts.customCallback) {
        console.log('logout function custom callback');
        opts.customCallback();
      }

      if (opts.redirectUrl) {
        console.log('logout function redirect to URL');
        window.location.href = opts.redirectUrl;
      }
    };

    // document must be in readyState 'complete' before looking for iframes
    checkForIframes = function () {

      var docReadyCheck, isDocReady;

      docReadyCheck = function () {
        if (document.readyState === "complete") {
          console.log('check for iframes, now that the document is complete');
          clearInterval(isDocReady);
          includeIframes();
        }
      };

      isDocReady = setInterval(docReadyCheck, 1000);
    };

    // look for iframes
    includeIframes = function () {
      console.log('include iframes start');

      var foundIframes = document.getElementsByTagName('iframe'), index, iframeItem;

      if (foundIframes.length > 0) { //at least one iframe found
        console.log('iframes found: ' + foundIframes.length);
        // attach events to each iframe found
        for (index = 0; index < foundIframes.length; index++) {

          iframeItem = foundIframes.item(index);

          if (iframeItem.attachEvent) { // IE < 11. Returns a boolean true/false
            console.log('attach event to iframe. Browser IE < 11');
            iframeItem.attachEvent('onload', attachEventIframe(index));
          } else { // IE >= 11 and FF, etc.
            console.log('attach event to iframe. Browser NOT IE < 11');
            iframeItem.addEventListener('load', attachEventIframe(index), false);
          }

        } // end for loop

      } // end if any iframes
    };

    // attach events to each iframe
    attachEventIframe = function (index) {

      var iframe = $('iframe:eq(' + index + ')').contents().find('html');

      iframe.on(opts.activityEvents, function (event) {
        console.log('bubbling iframe activity event to body of page');
        $('body').trigger(event);
      });
    };

    //###############################
    // Build & Return the instance of the item as a plugin
    // This is your construct.
    //###############################
    return this.each(function () {

      if (store.enabled) {
        idleTimerLastActivity = $.now();
        store.set('idleTimerLastActivity', idleTimerLastActivity);
        store.set('idleTimerLoggedOut', false);
      } else {
        alert(opts.errorAlertMessage);
      }

      activityDetector();

      if (opts.sessionKeepAliveTimer) {
        startKeepSessionAlive();
      }

      startIdleTimer();

      checkForIframes();
    });
  };
}(jQuery));