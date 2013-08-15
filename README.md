# jquery-idleTimeout

Idle (no activity) timer and logout redirect for jQuery. Works cross-browser with multiple windows and tabs within the same domain.

Edit the configuration options at top of script, or you may configure the options when you call the idleTimeout function at run-time. Configure the 'activityEvents' variable to set which user actions will be considered 'being active'.

Pops up up a warning dialog box with 2 buttons, 'Stay Logged In' & 'Log Out Now', after the 'idleTimeLimit' amount of time of 'inactivity'. Warning dialog will display for the 'dialogDisplayLimit' amount of time.

![Warning Dialog](https://raw.github.com/JillElaine/jquery-idleTimeout/master/warning_dialog.png)

Note: This is a fork from the https://github.com/josebalius/jquery-idleTimeout project.

The following dependency is required: https://github.com/marcuswestin/store.js - version 1.3.4+

Additionally, JQuery version 1.7+ and JQuery UI are required.

### Cross browser communication within the same domain

* Functions across multiple instances of a browser and across multiple tabs in the same browser window within the same domain
* If a window or tab is logged out, all other windows and tabs will log out too.
* If warning dialog pops up on a window or tab, warning dialog appears on all other windows and tabs too.
* If 'Stay Logged In' button on warning dialog is clicked, warning dialogs on all other windows and tabs will disappear too.
* If 'Log Out Now' button on warning dialog is clicked, all other windows and tabs will log out too.

### Tested in These Browsers

* Mozilla Firefox v22.0
* Internet Explorer v8

In beta-testing. Interested in feedback & testing on multiple browsers.
Use jquery-idleTimeout-for-testing.js with Firefox with Firebug add-on for debugging.

## How to use

Open jquery-idleTimeout.js and configure the 'Configuration Variables' for your system or configure at run-time.

### Run with defaults

```Javascript
  $(document).ready(function(){
    $(document).idleTimeout();
  });
```

### Configuration may be overridden at run-time

```Javascript
  $(document).ready(function(){
    $(document).idleTimeout({
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
    });
  });
```

## Optional functionality
If user manually logs out (without use of idleTimer), you can force all other windows & tabs within the same domain to redirect to the 'redirectUrl' page by adding a small snippet of javascript to the user's 'logout' page.

Note that the store.js must be loaded.

```Javascript
  <script type="text/javascript">
    $(document).ready(function(){
      if (store.enabled) {
        store.set('idleTimerLoggedOut', true);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }
    }
  </script>
```

## TODO
Click on browser title bar or on browser tab is not detected as an activity 'event'. See Issue #2.

