const {Cc,Ci} = require('chrome');
var self = require('sdk/self');
var panel = require('sdk/panel');
var ss = require('sdk/simple-storage');
var clipboard = require('sdk/clipboard');
var tabs = require('sdk/tabs');
var timers = require('sdk/timers');
var eTLDService = Cc['@mozilla.org/network/effective-tld-service;1']
                  .getService(Ci.nsIEffectiveTLDService);
var ioService = Cc['@mozilla.org/network/io-service;1']
                  .getService(Ci.nsIIOService);

var popup = panel.Panel({
    contentURL: self.data.url('popup.html'),
    contentScriptFile: [
        self.data.url('lib/pbkdf2.js'),
        self.data.url('lib/sha512.js'),
        self.data.url('lib/base64.js'),
        self.data.url('lib/entropass.js'),
        self.data.url('settings.js'),
        self.data.url('popup.js')
    ],
    width: 430,
    height: 120
});

popup.on('show', function() {
    var domain = '';
    var uri = ioService.newURI(tabs.activeTab.url, null, null);
    try {domain = eTLDService.getBaseDomain(uri);} catch(e) {}
    var siteSettings = JSON.parse(ss.storage['site:' + domain] || '{}');
    var localSettings = {
        'privateKeyHash': ss.storage.privateKeyHash,
        'passphraseHash': ss.storage.passphraseHash,
        'defaultPasswordLength': ss.storage.defaultPasswordLength
    }
    tabs.activeTab.attach({
        contentScriptFile: self.data.url('username.js'),
        contentScript: 'self.postMessage(getUsername());',
        onMessage: function (username) {
            popup.port.emit('show', domain, username, localSettings,
                            siteSettings);
        }
    });
});

popup.port.on('insert-password', function (password) {
    tabs.activeTab.attach({
        contentScriptFile: self.data.url('insert.js'),
        contentScript: 'insertPassword("' + password + '");'
    });
    popup.hide();
});

popup.port.on('copy-password', function (password) {
    clipboard.set(password);
    timers.setTimeout(function() {clipboard.set('');}, 15000);
    popup.hide();
});

popup.port.on('close', function() {popup.hide();});

popup.port.on('resize', function(change) {
    popup.resize(popup.width, popup.height + change);
});

popup.port.on('save-settings', function(domain, settings) {
    ss.storage['site:' + domain] = JSON.stringify(settings);
});

exports.popup = popup;
