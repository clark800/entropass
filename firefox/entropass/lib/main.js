var buttons = require('sdk/ui/button/action');
var clipboard = require("sdk/clipboard");
var tabs = require("sdk/tabs");
var self = require("sdk/self");

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
    popup.port.emit("show");
});

popup.port.on("insert-password", function (password) {
    console.log(password);
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
