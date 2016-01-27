module.exports = (function() {
  if(global.__TINT.DateWell) {
    return global.__TINT.DateWell;
  }
  var Container = require('Container');
  var Color = require('Color');
  var $ = process.bridge.objc;
  var util = require('Utilities');

  /**
   * @class DateWell
   * @description Creates a date "well" or "view" that allows the user to select a date from a calendar.
   *              A change in the date can be tracked using the "mouseup" event.
   * @extends Container
   */
   /**
    * @new
    * @memberof DateWell
    * @description Creates a new DateWell control.
    */
  function DateWell(properties, options, inherited) {
    options = options || {};
    options.delegates = options.delegates || [];
    this.nativeClass = this.nativeClass || $.NSDatePicker;
    this.nativeViewClass = this.nativeViewClass || $.NSDatePicker;
    Container.call(this, properties, options, inherited || true);
    this.nativeView('setDatePickerStyle', $.NSTextFieldDatePickerStyle);
    this.nativeView('setBordered', $.NO);
    this.nativeView('setDateValue', $.NSDate('date'));
    util.setProperties(this, properties, inherited);
  }

  DateWell.prototype = Object.create(Container.prototype);
  DateWell.prototype.constructor = DateWell;

  /**
   * @member backgroundColor
   * @type {Color}
   * @memberof DateWell
   * @description Gets or sets the background color of the control.
   * @see Color
   */
  Object.defineProperty(DateWell.prototype, 'backgroundColor', {
    get:function() { return new Color(this.nativeView('backgroundColor')); },
    set:function(e) { this.nativeView('setBackgroundColor',new Color(e.native)); }
  });

  // TODO: Not supported on win, what do we do?
  Object.defineProperty(DateWell.prototype, 'transparent', {
    get:function() { return this.nativeView('drawsBackground') === $.YES ? true : false; },
    set:function(e) { this.nativeView('setDrawsBackground',e ? $.YES : $.NO); }
  });

  // TODO: Not supported on win, what do we do?
  Object.defineProperty(DateWell.prototype, 'textColor', {
    get:function() { return new Color(this.nativeView('textColor')); },
    set:function(e) { this.nativeView('setTextColor',e.native); }
  });

  // TODO: Not supported on win, what do we do?
  Object.defineProperty(DateWell.prototype, 'border', {
    get:function() { return this.nativeView('isBordered') === $.YES ? true : false; },
    set:function(e) { this.nativeView('setBordered',e ? $.YES : $.NO); }
  });
  // TODO: Not supported on win, what do we do?
  Object.defineProperty(DateWell.prototype, 'style', {
    get:function() {
      var nsstyle = this.nativeView('datePickerStyle');
      if(nsstyle === $.NSTextFieldAndStepperDatePickerStyle) {
        return "step";
      } else if (nsstyle === $.NSClockAndCalendarDatePickerStyle) {
        return "clock";
      } else {
        return "default";
      }
    },
    set:function(e) {
      if(e === "step") {
        this.nativeView('setDatePickerStyle', $.NSTextFieldAndStepperDatePickerStyle);
      } else if (e === "clock") { 
        this.nativeView('setDatePickerStyle', $.NSClockAndCalendarDatePickerStyle);
      } else if (e === "default") {
        this.nativeView('setDatePickerStyle', $.NSTextFieldDatePickerStyle);
      }
    }
  });

  /**
   * @member range
   * @type {boolean}
   * @memberof DateWell
   * @description Gets or sets whether the user is allowed to select a range of dates rather than one.
   *              The default is false.
   * @default false
   */
  Object.defineProperty(DateWell.prototype, 'range', {
    get:function() { return this.nativeView('datePickerMode') === $.NSRangeDateMode ? true : false; },
    set:function(e) { this.nativeView('setDatePickerMode', e ? $.NSRangeDateMode : $.NSSingleDateMode); }
  });

  /**
   * @member value
   * @type {date}
   * @memberof DateWell
   * @description Gets or sets the selected date as a standard javascript Date object.
   *              The default is now.
   * @default Date.now
   */
  Object.defineProperty(DateWell.prototype, 'value', {
    get:function() { return new Date(this.nativeView('dateValue')('timeIntervalSince1970')*1000); },
    set:function(e) { this.nativeView('setDateValue',$(new Date(e))); }
  });

  global.__TINT.DateWell = DateWell;
  return DateWell;
})();

