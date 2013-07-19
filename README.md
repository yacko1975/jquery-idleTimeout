# jquery-idleTimeout

Note: This is a fork from the https://github.com/philpalmieri/jquery-idleTimeout project with some modifications I have made

idle Activity Timeout and logout redirect for jQuery with some enhancements

## Demo

Note: This uses the jQuery UI dialog, and UI themes.  I am working on a non UI version – but it may be a while

I have an [active demo here](http://www.philpalmieri.com/js_sandbox/timedLogout/) – it is running on a 30 second timer for the logout, and if you open firebug you will see the keep alive firing every 10 seconds.

## How to use

### Run with defaults
  
  $(document).ready(function(){
    $(document).idleTimeout();
  });


### With Optional Overrides

New overrides added by me (josebalius): customCallback, multipleTabs

  $(document).ready(function(){
    $(document).idleTimeout({
      inactivity: 30000,
      noconfirm: 10000,
      sessionAlive: 10000,
      customCallback: function() {
          // User decided not to stay logged in, perform custom action
      },
      multipleTabs: true // Expect the user to have multiple tabs sync up using https://github.com/marcuswestin/store.js    
    });
  });

## The plugin has a few configuration items so you can customize it for your own needs…

- *inactivity: 1200000* //20 Minute default (how long before showing the notice)
- *sessionAlive: 300000*, //5 minutes default how often to hit alive_url, we use for our ajax interfaces where the page doesn’t change very often. This helps to prevent the logout screen of your app appearing in ajax callbacks.  If you set this to false it won’t send off.
- *alive_url: ‘/path/to/your/imHere/url’*, //send alive ping to this url
- *redirect_url: ‘/js_sandbox/’*, //Where to go when log out
- *click_reset: true*, //Reset timeout on clicks (for ajax interface) – resets the sessionAlive timer, so we are not hitting up your app with alive_url if we just did an ajax call for another  reason.
- *logout_url: ‘/js_sandbox/timedLogout/index.html’* //logout before redirect (url so you can completely destroy the session before redirecting to login screen)
- *dialogTitle: ‘Auto Logout’* //Title for the notice dialog 
- *dialogText: ‘You are about to be signed out due to inactivity.’* //Content text for the notice dialog
- *dialogButton: ‘Stay Logged In’* //Button label to stay logged in
- *customCallback: false // Set this to a function to take over the log out procedure
- *multipleTabs: false // Set this to true if you wish to have your tabs sync up and show the logout modal box at the same time
