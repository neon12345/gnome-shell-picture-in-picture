"use strict";

// Global modules
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Util = imports.misc.util;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

// Internal modules
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const PopupSliderMenuItem = Me.imports.popupSliderMenuItem.PopupSliderMenuItem;
const Bundle = Me.imports.bundle;
const Polygnome = Me.imports.polygnome;
const Preview = Me.imports.preview;

// Utilities
const getWorkspaceWindowsArray = Polygnome.getWorkspaceWindowsArray;
const spliceTitle = Bundle.spliceTitle;

// Preview default values
const MIN_ZOOM = Preview.MIN_ZOOM;
const MAX_ZOOM = Preview.MAX_ZOOM;
const MAX_CROP_RATIO = Preview.MAX_CROP_RATIO;
const DEFAULT_ZOOM = Preview.DEFAULT_ZOOM;
const DEFAULT_CROP_RATIO = Preview.DEFAULT_CROP_RATIO;

var WindowCornerIndicator = GObject.registerClass({
       GTypeName: 'PictureInPicture_indicator',
   }, class PictureInPicture_indicator extends PanelMenu.Button {
    
    constructor() {
        super(null, "PictureInPicture_indicator");
    }

    // Handler to turn preview on / off
    _onMenuIsEnabled(item) {
        (item.state) ? this.preview.show() : this.preview.hide();
    }

    _updateSliders() {
        this.menuZoom.value = this.preview.zoom;
        this.menuZoomLabel.label.set_text("Monitor Zoom:  " + Math.floor(this.preview.zoom * 100).toString() + "%");

        this.menuLeftCrop.value = this.preview.leftCrop;
        this.menuRightCrop.value = this.preview.rightCrop;
        this.menuTopCrop.value = this.preview.topCrop;
        this.menuBottomCrop.value = this.preview.bottomCrop;
    }

    _onZoomChanged(source, value) {
        this.preview.zoom = value;
        this._updateSliders();
        this.preview.emit("zoom-changed");
    }

    _onLeftCropChanged(source, value) {
        this.preview.leftCrop = value;
        this._updateSliders();
        this.preview.emit("crop-changed");
    }

    _onRightCropChanged(source, value) {
        this.preview.rightCrop = value;
        this._updateSliders();
        this.preview.emit("crop-changed");
    }

    _onTopCropChanged(source, value) {
        this.preview.topCrop = value;
        this._updateSliders();
        this.preview.emit("crop-changed");
    }

    _onBottomCropChanged(source, value) {
        this.preview.bottomCrop = value;
        this._updateSliders();
        this.preview.emit("crop-changed");
    }

    _onSettings() {
        Util.trySpawnCommandLine("gnome-shell-extension-prefs picture-in-picture@parakoopa.de");
    }

    // Update windows list and other menus before menu pops up
    _onUserTriggered() {
        this.menuIsEnabled.setToggleState(this.preview.visible);
        this.menuIsEnabled.reactive = this.preview.window;
        this._updateSliders()
        this.menuWindows.menu.removeAll();
        getWorkspaceWindowsArray().forEach(function(workspace, i) {
            if (i > 0) {
                this.menuWindows.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            }

            // Populate window list on submenu
            workspace.windows.forEach(function(window) {
                if(window.is_skip_taskbar()) return;
                let winMenuItem = new PopupMenu.PopupMenuItem(spliceTitle(window.get_title()));
                winMenuItem.connect("activate", (function() {
                    this.preview.window = window;
                    this.preview.show();
                }).bind(this));

                this.menuWindows.menu.addMenuItem(winMenuItem);
            }, this);
        }, this);
    }

    enable() {

        // Add icon
        this.icon = new St.Icon({
            icon_name: "tv-symbolic",
            style_class: "system-status-icon"
        });
        this.add_actor(this.icon);

        // Prepare Menu...

        // 1. Preview ON/OFF
        this.menuIsEnabled = new PopupMenu.PopupSwitchMenuItem("Preview", false, {
            hover: false,
            reactive: true
        });
        this.menuIsEnabled.connect("toggled", this._onMenuIsEnabled.bind(this));
        this.menu.addMenuItem(this.menuIsEnabled);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // 2. Windows list
        this.menuWindows = new PopupMenu.PopupSubMenuMenuItem("Windows");
        this.menu.addMenuItem(this.menuWindows);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // 3a. Zoom label
        this.menuZoomLabel = new PopupMenu.PopupMenuItem("", {
            activate: false,
            reactive: false
        });
        this.menu.addMenuItem(this.menuZoomLabel);

        // 3b, Zoom slider
        this.menuZoom = new PopupSliderMenuItem(false, DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, 0.005); // slider step: 0.5%
        this.menuZoom.connect("changed", () => {this._onZoomChanged(this.menuZoom, this.menuZoom.value);});
        this.menu.addMenuItem(this.menuZoom);

        // 4. Crop Sliders
        this.menuCrop = new PopupMenu.PopupSubMenuMenuItem("Crop");
        this.menu.addMenuItem(this.menuCrop);

        this.menuTopCrop = new PopupSliderMenuItem("Top", DEFAULT_CROP_RATIO, 0.0, MAX_CROP_RATIO);
        this.menuTopCrop.connect("changed", () => {this._onTopCropChanged(this.menuTopCrop, this.menuTopCrop.value);});
        this.menuCrop.menu.addMenuItem(this.menuTopCrop);

        this.menuLeftCrop = new PopupSliderMenuItem("Left", DEFAULT_CROP_RATIO, 0.0, MAX_CROP_RATIO);
        this.menuLeftCrop.connect("changed", () => {this._onLeftCropChanged(this.menuLeftCrop, this.menuLeftCrop.value);});
        this.menuCrop.menu.addMenuItem(this.menuLeftCrop);

        this.menuRightCrop = new PopupSliderMenuItem("Right", DEFAULT_CROP_RATIO, 0.0, MAX_CROP_RATIO);
        this.menuRightCrop.connect("changed", () => {this._onRightCropChanged(this.menuRightCrop, this.menuRightCrop.value);});
        this.menuCrop.menu.addMenuItem(this.menuRightCrop);

        this.menuBottomCrop = new PopupSliderMenuItem("Bottom", DEFAULT_CROP_RATIO, 0.0, MAX_CROP_RATIO);
        this.menuBottomCrop.connect("changed", () => {this._onBottomCropChanged(this.menuBottomCrop, this.menuBottomCrop.value);});
        this.menuCrop.menu.addMenuItem(this.menuBottomCrop);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // 5. Settings
        this.menuSettings = new PopupMenu.PopupMenuItem("Settings");
        this.menuSettings.connect("activate", this._onSettings.bind(this));
        this.menu.addMenuItem(this.menuSettings);

        this.connect("enter-event", this._onUserTriggered.bind(this));

    }

    disable() {
        this.menu.removeAll();
    }
});
