//######
//## This work is licensed under the Creative Commons Attribution-Share Alike 3.0 
//## United States License. To view a copy of this license, 
//## visit http://creativecommons.org/licenses/by-sa/3.0/us/ or send a letter 
//## to Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA.
//######

(function($) {
    $.fn.idleTimeout = function(options) {
        var defaults = {
            inactivity: 1200000, //20 Minutes
            noconfirm: 10000, //10 Seconds
            sessionAlive: 30000, //10 Minutes
            redirect_url: '/js_sandbox/',
            click_reset: true,
            alive_url: '/js_sandbox/',
            logout_url: '/js_sandbox/',
            multipleTabs: false,
            customCallback: false
        };

        //##############################
        //## Private Variables
        //##############################
        var opts = $.extend(defaults, options);
        var liveTimeout, confTimeout, sessionTimeout;
        var modal = "<div id='modal_pop'><p>" + autoLogoutMessage + "</p></div>";
        var dialog;

        //##############################
        //## Private Functions
        //##############################
        var start_liveTimeout = function() {
            clearTimeout(liveTimeout);
            clearTimeout(confTimeout);

            liveTimeout = setTimeout(logout, opts.inactivity);

            if (opts.multipleTabs) {
                if (typeof store !== 'undefined') {
                    store.set("lastKeepAlive", new Date().getTime());
                }
            }

            if (opts.sessionAlive) {
                clearTimeout(sessionTimeout);
                sessionTimeout = setTimeout(keep_session, opts.sessionAlive);
            }
        };

        var logout = function() {
            clearTimeout(sessionTimeout);

            if (opts.multipleTabs) {
                if (typeof store !== 'undefined') {
                    var lastKeepAlive = store.get("lastKeepAlive");
                    var timeElapsed = (new Date().getTime() - lastKeepAlive);

                    if (timeElapsed < opts.inactivity) {
                        var timer = (lastKeepAlive + opts.inactivity) - new Date().getTime();
                        liveTimeout = setTimeout(logout, timer);
                        return;
                    }

                }
            }

            confTimeout = setTimeout(redirect, opts.noconfirm);
            dialog = $(modal).dialog({
                buttons: {"Stay Logged In": function() {
                        $(this).dialog('close');
                        stay_logged_in();
                        console.log(autoLogoutStayLoggedIn);
                    }},
                modal: true,
                title: autoLogoutTitle
            });

        }

        var redirect = function() {
            if (opts.multipleTabs) {
                if (typeof store != 'undefined') {
                    var lastKeepAlive = store.get('lastKeepAlive');
                    var timeElapsed = (new Date().getTime() - lastKeepAlive);

                    if (timeElapsed < opts.noconfirm) {
                        dialog.dialog('close');
                        var timer = (lastKeepAlive + opts.inactivity) - new Date().getTime();
                        liveTimeout = setTimeout(logout, timer);
                        return;
                    }
                }
            }

            if (opts.customCallback) {
                opts.customCallback();
            } else {

                if (opts.logout_url) {
                    $.get(opts.logout_url);
                }

                window.location.href = opts.redirect_url;

            }
        }

        var stay_logged_in = function(el) {
            start_liveTimeout();
            keep_session();
        }

        var keep_session = function() {
            $.get(opts.alive_url);
            clearTimeout(sessionTimeout);
            sessionTimeout = setTimeout(keep_session, opts.sessionAlive);
        }

        //###############################
        //Build & Return the instance of the item as a plugin
        // This is basically your construct.
        //###############################
        return this.each(function() {
            obj = $(this);
            start_liveTimeout();
            if (opts.click_reset) {
                $("body:not(#modal_pop,.ui-widget-overlay)").bind('click', function(e) {
                    if ($('#modal_pop:visible').length == 0)
                        start_liveTimeout();
                });
            }
        });

    };
})(jQuery);
