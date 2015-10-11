
/**
 * @unit-test-setup
 * @ignore
 */
function setup() {
  require('Common');
}

function baseline() {
}

/**
 * @see {Notification}
 * @example
 */
function run($utils) {
  var ismac = (require('os').platform().toLowerCase() === "darwin" || require('os').platform().toLowerCase() === "mac");
  /* @hidden */ if(ismac) $utils = require('../../../../tools/utilities.js');
  Notification.requestPermission(function(result) {
    /* @hidden */ $utils.assert(result);
    // If we get the OK we'll send up a new notificaiton.
    if(result) {
      // Create a new notification
      var notify = new Notification();
      // Set a title, the very top part of notification @img{assets/notifications_title_mac.png}
      notify.title = "Title";
      // Set a subtitle, the next set of text as part of notification @img{assets/notifications_sub-title_mac.png}
      notify.subtitle = "Sub-Title";
      // Set the long-form text of the notification @img{assets/notifications_text_mac.png}
      notify.text = "Main text for the notify";
      // Request a 'bong' when it runs.
      notify.sound = true;
      // The text for the button at @img{assets/notifications_main_button.png}
      notify.buttonLabel = "Main";
      // The text for the button at @img{assets/notifications_aux_button.png}
      notify.addEventListener('fired', function() {
        /* @hidden */ if(ismac) {
          /* @hidden */ var xpos = Screens.active.bounds.width - 60;
          /* @hidden */ setTimeout(function() { $utils.clickAt(xpos,60); },1000); //TODO: Find a better way than hardcoding 80.
        /* @hidden */ } else {
          /* @hidden */ var xpos = Screens.active.bounds.width - 80;
          /* @hidden */ setTimeout(function() { $utils.clickAt(xpos, Screens.active.bounds.height - 60); },500);
        /* @hidden */ }
      });
      notify.addEventListener('click', function(args) {
        /* @hidden */ //$utils.assert(args == "button");
        /* @hidden */ if(ismac) process.exit(0); 
        /* @hidden */ else $utils.ok();
      });

      // Throw the notification out.
      notify.dispatch();

      /* @hidden */ $utils.assert(notify.title === 'Title');
      /* @hidden */ $utils.assert(notify.subtitle === 'Sub-Title');
      /* @hidden */ $utils.assert(notify.text === "Main text for the notify");
      /* @hidden */ $utils.assert(notify.sound === true);
      /* @hidden */ $utils.assert(notify.buttonLabel === "Main");
    }
  });
}

/**
 * @unit-test-shutdown
 * @ignore
 */
function shutdown() {
}

module.exports = {
  setup:setup, 
  run:run, 
  shutdown:shutdown, 
  shell:true,
  shell_options:{timeout:5000},
  name:"Notifications",
};