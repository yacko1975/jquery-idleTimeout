# jquery-idleTimeout

Configurable idle (no activity) timer and logout redirect for jQuery.

<strong>Functions across multiple browser windows and tabs within the same domain.</strong>

Requires https://github.com/marcuswestin/store.js which uses localStorage, globalStorage and userData behavior to 'communicate' across multiple browser windows/tabs without cookies or flash.

Listed on JQuery's Plugin site: http://plugins.jquery.com/idleTimeout/

### Demo Page - http://jillelaine.github.io/jquery-idleTimeout/

After the 'idleTimeLimit' amount of user inactivity, a warning dialog box with 2 buttons, 'Stay Logged In' & 'Log Out Now', appears. 'Stay Logged In' button may be activated with mouse click or press of Enter key.

Warning dialog includes countdown 'Time remaining' display.

Browser window/tab title bar(s) display warning if user is inactive for the 'idleTimeLimit'. Original browser title restored to all windows/tabs when warning dialog is dismissed.

Warning dialog will display for the 'dialogDisplayLimit' amount of time. If no user activity, idleTimer will redirect user to configured 'redirectUrl'.

![Warning Dialog](https://raw.github.com/JillElaine/jquery-idleTimeout/master/warning_dialog.png)

Any needed logout (session close) functions may be added to your 'redirectUrl' page or to the optional 'customCallback'.

### Cross browser communication within the same domain

* Functions across multiple instances of a browser and across multiple tabs within the same domain
* If a window or tab is logged out, all other windows and tabs will log out too.
* If warning dialog pops up on a window or tab, warning dialog appears on all other windows and tabs too.
* If 'Stay Logged In' button on warning dialog is clicked, warning dialogs on all other windows and tabs will be dismissed too.
* If 'Log Out Now' button on warning dialog is clicked, all other windows and tabs will log out too.

### Dependencies

The following dependency is required: https://github.com/marcuswestin/store.js - version 1.3.4+

Additionally, JQuery version 1.7+ and JQuery UI are required.

## How to use

Download the jquery-idleTimeout.min.js (minified), or download jquery-idleTimeout.js if you want to edit the configuration of the script directly. Upload the .js file and make it available to your website.

Do the same with https://github.com/marcuswestin/store.js: store.min.js.

Call the idle-Timeout script in a 'document.ready' function somewhere on your site. See the example.html https://github.com/JillElaine/jquery-idleTimeout/blob/master/example.html

Configure the 'redirectUrl' to redirect to a page within your website.

Use the script with default settings or edit the other configuration variables at top of jquery-idleTimeout.js. Or configure the options when you call the idleTimeout function at run-time.

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
      sessionKeepAliveUrl:   '/' // url to ping
    });
  });
```

## Optional functionality
If user manually logs out with a click of your site's 'Logout' button and not with use of the idleTimer function, you can force all 'same domain' windows/tabs to redirect to your 'redirectUrl' page by adding a small snippet of javascript to the Logout button or to the user's 'redirectUrl' page.

Note: all required scripts must be available on the 'redirectUrl' page for this to work.

```Javascript
  <script type="text/javascript">
    $(document).ready(function(){
      if (store.enabled) {
        store.set('idleTimerLoggedOut', true);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }
    });
  </script>
```

### Tested in These Browsers

* Mozilla Firefox v22.0
* Internet Explorer v8

Use jquery-idleTimeout-for-testing.js with Firefox with Firebug add-on or similar for debugging. Thank you for your feedback.
