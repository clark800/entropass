const {Cc,Ci} = require("chrome");
var buttons = require('sdk/ui/button/action');
var clipboard = require("sdk/clipboard");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"]
                  .getService(Ci.nsIEffectiveTLDService);
var ioService = Cc["@mozilla.org/network/io-service;1"]
                  .getService(Ci.nsIIOService);

var popup = require("sdk/panel").Panel({
    contentURL: self.data.url("popup.html"),
    contentScriptFile: [
        self.data.url('lib/pbkdf2.js'),
        self.data.url('lib/sha512.js'),
        self.data.url('lib/base64.js'),
        self.data.url('lib/entropass.js'),
        self.data.url('popup.js')
    ],
    width: 430,
    height: 110
});

var button = buttons.ActionButton({
    id: "entropass-button",
    label: "Entropass",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onClick: function(state) {
        popup.show({
            position: button
        });
    }
});

popup.on("show", function() {
    var uri = ioService.newURI(tabs.activeTab.url, null, null);
    var domain = eTLDService.getBaseDomain(uri);
    tabs.activeTab.attach({
        contentScriptFile: self.data.url('username.js'),
        contentScript: 'self.postMessage(getUsername());',
        onMessage: function (username) {
            popup.port.emit("show", domain, username);
        }
    });
});

popup.port.on("insert-password", function (password) {
    tabs.activeTab.attach({
        contentScriptFile: self.data.url('insert.js'),
        contentScript: 'insertPassword("' + password + '");'
    });
    popup.hide();
});

popup.port.on("copy-password", function (password) {
    clipboard.set(password);
    popup.hide();
});

popup.port.on('resize', function(change) {
    popup.resize(popup.width, popup.height + change);
});
