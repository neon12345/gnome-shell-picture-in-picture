"use strict";

// Global modules 
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Slider = imports.ui.slider;
const PopupMenu = imports.ui.popupMenu;

// Internal modules
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Bundle = Me.imports.bundle;

// Utilities
const normalizeRange = Bundle.normalizeRange;
const deNormalizeRange = Bundle.deNormalizeRange;

var PopupSliderMenuItem = GObject.registerClass({
       GTypeName: 'PictureInPicture.PopupSliderMenuItem',
       Signals: { 'changed': {} },
   }, class PopupSliderMenuItem extends PopupMenu.PopupBaseMenuItem {
    
    constructor(text, value, min, max, step, params) {

        this.min = (min !== undefined ? min : 0.0);
        this.max = (max !== undefined ? max : 1.0);
        this.defaultValue = (value !== undefined ? value : (this.max + this.min) / 2.0);
        // *** KNOWN ISSUE: Scrolling may get stucked if step value > 1.0 (and |min-max| is a low value)
        // due to const SLIDER_SCROLL_STEP = 0.02 on js/ui/slider.js ***
        this.step = step;
        params = params || {};

        params.activate = false;

        super(params);

        this.label = new St.Label({
            text: text || ""
        });
        // Setting text to false allow a little bit extra space on the left
        if (text !== false) this.add_child(this.label);

        this.slider = new Slider.Slider({
            value: 0.0,
            x_expand: true, x_align: St.Align.END
        });
        this.value = this.defaultValue;

        // PopupSliderMenuItem emits its own value-change event which provides a normalized value
        this.slider.connect("notify::value", Lang.bind(this, function(x) {
            let normalValue = this.value;
            // Force the slider to set position on a stepped value (if necessary)
            if (this.step !== undefined) this.value = normalValue;
            // Don't through any event if step rounded it to the same value
            if (normalValue !== this._lastValue) this.emit('changed');
            this._lastValue = normalValue;
        }));

        this.actor.add(this.slider);
    }

    get value() {
        return deNormalizeRange(this.slider.value, this.min, this.max, this.step);
    }

    set value(newValue) {
        this._lastValue = normalizeRange(newValue, this.min, this.max, this.step);
        this.slider.value = this._lastValue;
    }
});
