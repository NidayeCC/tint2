module.exports = (function() {
  var $ = process.bridge.objc;
  var util = require('Utilities');

  var Control = require('Control');

  /**
   * @class Dialog
   * @description The dialog allows you to ask a question to the user or prompt them 
   *              with a choice prior to the application continuing. Note you can listen
   *              for whether the user makes a choice through the inherited 'click' event,
   *              a parameter is passed into the callback with the value of 'main' or 'aux'
   *              to indicate the pressed button on the dialog.
   * @extends Control
   */

  /**
   * @new
   * @memberof Dialog
   * @description Creates a new Dialog window hidden by default.
   */
  function Dialog(options) {
    var img = null, buttonsSet = false, mainButton = null, auxButton = null;
    options = options || {};
    options.delegates = options.delegates || [];
    options.doNotInitialize = true;
    this.nativeClass = this.nativeClass || $.NSAlert;
    this.nativeViewClass = this.nativeViewClass || $.NSAlert;
    this.native = this.nativeClass('alloc')('init');
    Control.call(this, options);

   /**
    * @member title
    * @type {string}
    * @memberof Dialog
    * @description Gets or sets the caption or title of the dialog modal window.
    */
    util.def(this, "title",
      function() { return this.native('messageText'); },
      function(e) { this.native('setMessageText', $(e)); }
    );

   /**
    * @member message
    * @type {string}
    * @memberof Dialog
    * @description Gets or sets the text shown as a message or question to the user.
    */
    util.def(this, "message",
      function() { return this.native('informativeText'); },
      function(e) { this.native('setInformativeText', $(e)); }
    );

   /**
    * @member mainbutton
    * @type {string}
    * @memberof Dialog
    * @description Gets or sets the text label of the main button.
    */
    util.def(this, "mainbutton",
      function() { return mainButton; },
      function(e) { mainButton = e; }
    );

   /**
    * @member auxbutton
    * @type {string}
    * @memberof Dialog
    * @description Gets or sets the text label of the auxillary button.
    */
    util.def(this, "auxbutton",
      function() { return auxButton; },
      function(e) { auxButton = e; }
    );

   /**
    * @member suppression
    * @type {string}
    * @memberof Dialog
    * @description Gets or sets the text label of the suppress option.
    *              This is useful if you'd like to add an option on the dialog to
    *              not show this dialog again.  Setting this to anything other than
    *              null uses the value as the title and makes the check box visible.
    */
    util.def(this, "suppression",
      function() {
        if(!this.native('showsSuppressionButton')) {
          return null;
        } else {
          return this.native('suppressionButton')('title');
        }
      },
      function(e) {
        this.native('setShowsSuppressionButton', e === null ? $.NO : $.YES);
        if(e !== null) {
          this.native('suppressionButton')('setTitle', $(e));
        }
      }
    );

   /**
    * @member suppressionChecked
    * @type {boolean}
    * @memberof Dialog
    * @description Gets or sets whether the suppression box is checked.
    */
    util.def(this, "suppressionChecked",
      function() {
        if(!this.native('showsSuppressionButton')) {
          return false;
        } else {
          return this.native('suppressionButton')('state') === $.NSOnState ? true : false;
        }
      },
      function(e) {
        if(!this.native('showsSuppressionButton')) {
          return false;
        }
        this.native('suppressionButton')('setState', e === true ? $.NSOnState : $.NSOffState); 
      }
    );

   /**
    * @member icon
    * @type {string}
    * @memberof Dialog
    * @description Gets or sets the image associated with the dialog, by default this will
    *              use the icon from {@link Application#icon}. An image can be any url, including
    *              the app:// schema, or a named system icon resource.
    * @see {Application#icon} 
    */
    util.def(this, 'icon',
      function() { return img; },
      function(e) { 
        img = e;
        e = util.makeNSImage(e);
        if(e) {
          this.native('setIcon', e);
        }
      }
    );


    util.def(this, "type", 
      function() { 
        if(this.native('alertStyle') === $.NSWarningAlertStyle) {
          return "warning";
        } else if (this.native('alertStyle') === $.NSInformationalAlertStyle) {
          return "information";
        } else if (this.native('alertStyle') === $.NSCriticalAlertStyle) {
          return "critical";
        } else {
          return "information";
        }
      },
      function(e) {
        if(e === "warning") {
          this.native('setAlertStyle', $.NSWarningAlertStyle);
        } else if (e === "critical") {
          this.native('setAlertStyle', $.NSCriticalAlertStyle);
        } else {
          this.native('setAlertStyle', $.NSInformationalAlertStyle); 
        }
      }
    );

    //TODO: Doesn't work on MacOSX, unsure why.
    //this.setChild = function(e) { this.native('setAccessoryView',e.nativeView); }

   /**
    * @method open
    * @param {Window}
    * @memberof Dialog
    * @description Opens the dialog and presents it to the user.  An optional window can be passed
    *              into the function to specify which window the dialog may be protecting.  This is
    *              useful as it allows you to prevent any window interaction from happening unitl the
    *              user responds to the dialog.  In OSX this is displayed as a sheet over the window,
    *              on Windows the modal pop-up prevents mouse or keyboard interactions while it's open.
    *              If no window is provided the dialog is opened on top of all or any open windows and
    *              does not prevent users from interacting with any window of the application.
    */
    this.open = function(z) {
      if(!buttonsSet) {
        if(mainButton === null && auxButton !== null) {
          throw new Error("The main button was not defined, however the auxillary button was.  A main button must be set for auxilliary buttons to exist.");
        }

        if(mainButton !== null) {
          this.native('addButtonWithTitle', $(mainButton));
        }
        if(auxButton !== null) {
          this.native('addButtonWithTitle', $(auxButton));
        }
        buttonsSet = true;
      }

      var w = z ? z : $.NSApplication('sharedApplication')('mainWindow');
      if(w) {
        w = w.native ? w.native : w;
        var comp = $(function(self,e) {
          try {
           /**
            * @event click
            * @memberof Dialog
            * @description Fires when the user clicks either the auxillary button or main button
            *              'aux' is passed in to the callback when the auxillary button is pressed.
            *               'main' is passed in to the callback when the main button is pressed.
            */
            if(e === $.NSAlertFirstButtonReturn) {
              this.fireEvent('click',['main']);
            } else {
              this.fireEvent('click',['aux']);
            }
          } catch(e) {
            console.error(e.message);
            console.error(e.stack);
            process.exit(1);
          }
        }.bind(this),[$.void,['?',$.long]]);
        this.native('beginSheetModalForWindow',w,'completionHandler',comp);
      } else {
        var e = this.native('runModal');
        if(e === $.NSAlertFirstButtonReturn) {
          this.fireEvent('click',['main']);
        } else {
          this.fireEvent('click',['aux']);
        }
      }
    }.bind(this);
  }

  Dialog.prototype = Object.create(Control.prototype);
  Dialog.prototype.constructor = Dialog;

  return Dialog;
})();