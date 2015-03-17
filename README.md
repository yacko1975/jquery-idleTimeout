# jquery-idleTimeout

Highly configurable idle (no activity) timer and logout redirect for jQuery.

**Functions across multiple browser windows, tabs and, optionally, iframes (single or nested) in the same domain.**

Listed on JQuery's Plugin site: http://plugins.jquery.com/idleTimeout/

Requires https://github.com/marcuswestin/store.js which uses localStorage, globalStorage and userData behavior to 'communicate' across multiple browser windows/tabs without cookies or flash.

#### Demo Page - http://jillelaine.github.io/jquery-idleTimeout/

##### Iframes Demo Page - http://jillelaine.github.io/jquery-idleTimeout/iframe-demo.html

**If the warning dialog box is enabled:**
* After the 'idleTimeLimit' amount of user inactivity, the warning dialog box with 2 configurable buttons appear. Default button may be activated with mouse click or press of Enter key.
* Warning dialog includes countdown 'Time remaining' display.
* Browser window/tab title bar(s) display warning if user is inactive for the configured 'idleTimeLimit'. Original browser title restored to all windows/tabs when warning dialog is dismissed.
* Warning dialog will display for the configured 'dialogDisplayLimit' amount of time. If no user activity, idleTimer will redirect to configured 'redirectUrl'.

![Warning Dialog](https://raw.github.com/JillElaine/jquery-idleTimeout/master/warning_dialog.png)

**If the warning dialog box is disabled:**
* After the configured 'idleTimeLimit' amount of user inactivity, idleTimer will redirect to configured 'redirectUrl'.
* No warning dialog box will appear and browser window/tab title bar(s) do not display a warning.

Custom logout (ie: session close) functions may be added to your 'redirectUrl' page or to the optional configuration's 'customCallback'.

#### Communication Across Multiple Browser Windows, Tabs and Iframes in the Same Domain

* Functions across multiple instances of a browser and across multiple tabs within the same domain
* Use **jquery-idleTimeout-iframes.min.js** if detection of activity within iframes is required
* If a window or tab is logged out, all other windows and tabs will log out too.
* If enabled, if **warning dialog** pops up on a window or tab, **warning dialog** appears on all other windows and tabs too.
* If **'Stay Logged In'** button on **warning dialog** is clicked, warning dialogs on all other windows and tabs will be dismissed too.
* If **'Log Out Now'** button on **warning dialog** is clicked, all other windows and tabs will log out too.
* Optional script to add to your site's voluntary (manual) **Logout** button
* If enabled, keep-alive pings server every 10 minutes (default) to prevent server-side session timeout
* Stops server ping if **warning dialog** appears. Restarts server ping if **warning dialog** is dismissed.
* All displayed text may be modified to your desired language

#### Dependencies

* The following dependency is required: https://github.com/marcuswestin/store.js - version 1.3.4 or newer
* Additionally, JQuery version 1.7 or newer and JQuery UI version 1.9 or newer are required.

#### How to Use

Download the minified code, jquery-idleTimeout.min.js or jquery-idleTimeout-iframes.min.js, or download jquery-idleTimeout.js if you want to edit the configuration of the script directly. Upload the .js file and make it available to your website.

Do the same with https://github.com/marcuswestin/store.js: store.min.js.

Call the idle-Timeout script in a 'document.ready' function somewhere on your site. 

Configure the 'redirectUrl' to redirect to your site's logout page.

Use the script with default settings, configure the options when you call the idleTimeout function at run-time, or edit the configuration variables at top of jquery-idleTimeout.js.

##### Run with Defaults

```Javascript
  $(document).ready(function () {
    $(document).idleTimeout({
      redirectUrl:  '/logout' // redirect to this url. Set this value to YOUR site's logout page.
    });
  });
```

##### Configuration May be Overridden at Run-Time

Please see https://github.com/JillElaine/jquery-idleTimeout/blob/master/example.html

#### Additional Iframe Information
Activity can be detected in only iframes **from the same domain** as the parent page. If you require activity detection within iframes, use the jquery-idleTimeout-iframe.min.js script. 

Iframes, both single and nested, that are available within the document at time of page load are detected via a 'check-for-iframes' function, and activity within these iframes is 'bubbled' to the page body.

**Dynamically Added Iframes:** Iframes added *after* the page loads require a recheck-for-iframes. 
* Iframes, single and nested, within **dialogs are automatically rechecked** when the dialog opens. 
* Iframes, single and nested, inserted via javascript to the **body of the document require special handling**: you must manually call the iframe recheck. Add this snippet to the function which inserts the iframe: **$.fn.idleTimeout().iframeRecheck();**
* Note: if multiple iframes are dynamically added very quickly, it's possible that not all iframes will be included in the activity event 'bubbling'.

#### Optional Functionality for Voluntary Logout
If user voluntarily logs out of your site with your 'Logout' button (instead of timing out), you can force all 'same domain' windows/tabs to log out too! Attach a small snippet of javascript to the 'onclick' function of your 'Logout' button.

##### Create 'voluntaryLogoutAll' Function to Attach to Logout Button

```Javascript
  <script type="text/javascript">
      var voluntaryLogoutAll = function () {
        if (store.enabled) {
          store.set('idleTimerLoggedOut', true);
          window.location.href = "/logout";      // redirect to this url. Set this value to YOUR site's logout page.
        } else {
          alert('Please disable "Private Mode", or upgrade to a modern browser. Or perhaps a dependent file missing. Please see: https://github.com/marcuswestin/store.js')
        }
      }
  </script>
```

##### Call the 'voluntaryLogoutAll' Function with the 'onclick' of Your Logout Button

```
<input type="button" value="Logout" onclick="voluntaryLogoutAll()" title="This button will logout ALL 'same domain' Windows/Tabs">
```
##### Possible 'mousemove' bug with Chrome browser (on Windows?)
User g4g4r1n reports 'mousemove' event fires when mouse is still and offers a possible solution. 
https://github.com/JillElaine/jquery-idleTimeout/issues/13

##### Your suggestions and bug reports are appreciated
Use jquery-idleTimeout-for-testing.js with Firefox with Firebug add-on or similar for debugging. Thank you for your feedback.
