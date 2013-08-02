# jquery-idleTimeout

Idle activity timer and logout redirect for jQuery with some modifications from Jose Balius fork. Works with multiple tabs.

Note: This is a fork from the https://github.com/josebalius/jquery-idleTimeout project.

The following dependency is required: https://github.com/marcuswestin/store.js

Additionally, JQuery 1.7+ and JQuery UI are required.

### Code allows for multiple tabs in the browser.
If active tab is logged out, all inactive tabs will log out immediately.
If warning dialog pops up on active tab, warning dialog appears on all inactive tabs too.
Close of warning dialog on any tab will trigger the close of warning dialog on all other tabs.

Heavily commented and lots of console logs. Interested in feedback.

Open jquery-idleTimeout.js and configure the 'Configuration Variables' for your system or configure at run-time

## How to use

### Run with defaults

<pre>
  $(document).ready(function(){
    $(document).idleTimeout();
  });
</pre>

### Configuration may be overridden at run-time

<pre>
  $(document).ready(function(){
    $(document).idleTimeout({
      //idleTimeLimit:      1200000,        // 'No activity' time limit in milliseconds. 1200000 = 20 Minutes
      idleTimeLimit:        30000,          // 30 seconds for testing
      //dialogDisplayLimit: 180000,         // Time to display the dialog before redirect (or callback) in milliseconds. 180000 = 3 Minutes
      dialogDisplayLimit:   30000,          // 30 seconds for testing
      redirectUrl:          '/logout',      // CAUTION: will be ignored if a customCallback is defined
      customCallback:       function() {    // will override redirectUrl if defined
          // User logs out, perform custom action
      },

      // activity events to detect
      // http://www.quirksmode.org/dom/events/
      // https://developer.mozilla.org/en-US/docs/Web/Reference/Events
      // JQuery on() method expects a 'space-separated' string of event names
      // activityEvents:       'click keypress scroll wheel mousewheel mousemove', // separate each event with a space
      activityEvents:       'click keypress scroll wheel mousewheel', // remove detection of 'mousemove' event for testing

      //dialog box configuration
      dialogTitle:          'Auto Logout',
      dialogText:           'You are about to be logged out due to inactivity.',

      // server-side session keep-alive timer & url
      sessionKeepAliveTimer: 60000, // Ping the server at this interval in milliseconds. 60000 = 1 Minute
      sessionKeepAliveUrl:   '/home', // url to ping
    });
  });
</pre>

## TODO
Bug: When warning dialog box appears, 'active' tab will not stop countdown to logout if user clicks to 'inactive' tab and clicks 'Stay Logged In' on dialog box on 'inactive' tab.

Click of tab on browser is not detected as an 'event', and does not change 'active' tab to 'clicked' tab.

Choosing 'Log Out Now' on warning dialog does not run 'customCallback', if it is defined.
