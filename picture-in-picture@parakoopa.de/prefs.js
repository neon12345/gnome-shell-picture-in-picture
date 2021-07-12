// Global modules
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

// Internal modules
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

const PictureInPictureSettings = Settings.PictureInPictureSettings;

function init() {
    // Nothing
}

const PictureInPicturePrefsWidget = new GObject.Class({
    Name: "PictureInPicture.Prefs.Widget",
    GTypeName: "PictureInPicturePrefsWidget",
    Extends: Gtk.Box,

    _init: function(params) {
        this.parent(params);

        this.margin = 24;
        this.spacing = 6;
        this.orientation = Gtk.Orientation.VERTICAL;

        const settings = new PictureInPictureSettings();

        // 1. Behavior

        /*
        this.append(new Gtk.Label({
            label: "<b>Behavior when mouse is over (UNDER DEVELOPMENT)</b>",
            use_markup: true,
            xalign: 0.0,
            yalign: 0.0
        }));

        let boxBehavior = new Gtk.Box({
            spacing: 6,
            margin_top: 6,
            margin_start: 12,
            orientation: Gtk.Orientation.VERTICAL,
        });


        const behaviors = [
            {
                mode: "seethrough",
                label: "See-through (one click to drive it away)"
            },
            {
                mode: "autohide",
                label: "Hide-and-seek (vanish and turn up automatically)"
            }
        ];

        const currentBehaviorMode = settings.behaviorMode;

        let radio = null;

        behaviors.forEach(function (behavior) {

            radio = new Gtk.ToggleButton({
                active: behavior.mode === currentBehaviorMode,
                label: behavior.label,
                group: radio,
                sensitive: false
            });

            radio.connect("toggled", Lang.bind(this, function(button) {
                if (button.active) {
                    settings.behaviorMode = behavior.mode;
                }
            }));

            boxBehavior.append(radio);
        });

        this.append(boxBehavior);

         */
        
        // 2. Hide on top

        let checkHideOnFocus = new Gtk.CheckButton({
            label: "Hide when the mirrored window is on top",
            active: settings.focusHidden
        });

        checkHideOnFocus.connect("toggled", function(button) {
            settings.focusHidden = button.active;
        });

        let boxHideOnFocus = new Gtk.Box({margin_top: 12, orientation: Gtk.Orientation.VERTICAL});

        boxHideOnFocus.append(checkHideOnFocus);
        this.append(boxHideOnFocus);
    }
});

function buildPrefsWidget() {
    return new PictureInPicturePrefsWidget();
}
