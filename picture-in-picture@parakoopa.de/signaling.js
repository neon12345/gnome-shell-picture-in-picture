"use strict";

// Global modules
const GObject = imports.gi.GObject;

// Helper to disconnect more signals at once
var SignalConnector = GObject.registerClass({
       GTypeName: 'PictureInPicture.SignalConnector',
   }, class PictureInPicture.SignalConnector extends GObject.Object {
    
    constructor() {
        this._connections = [];
    },

    tryConnect(actor, signal, callback) {
        try {
            let handle = actor.connect(signal, callback);
            this._connections.push({
                actor: actor,
                handle: handle
            });
        }

        catch (e) {
            logError(e, "SignalConnector.tryConnect failed");
        }
    },

    tryConnectAfter(actor, signal, callback) {
        try {
            let handle = actor.connect_after(signal, callback);
            this._connections.push({
                actor: actor,
                handle: handle
            });
        }

        catch (e) {
            logError(e, "SignalConnector.tryConnectAfter failed");
        }
    },

    disconnectAll() {
        for (let i = 0; i < this._connections.length; i++) {
            try {
                let connection = this._connections[i];
                connection.actor.disconnect(connection.handle);
                this._connections[i] = null;
            }

            catch (e) {
                logError(e, "SignalConnector.disconnectAll failed");
            }
        }
        this._connections = [];
    }
});
