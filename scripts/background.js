var url = "https://netanki.herokuapp.com/";

/* Listen for external messages (messages from web-pages) */
chrome.runtime.onMessageExternal.addListener(function(msg, sender) {
    if (sender.url == url) {
        /* OK, this page is allowed to communicate with me */
        if (msg.status === "logged in") {
            /* Cool, the user is logged in */
            localStorage.logged = true;
        } else if (msg.status === "logged out") {
            /* How sad, the user is leaving */
            localStorage.logged = false;
        }
    }
});
