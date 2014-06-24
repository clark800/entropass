var self = require('sdk/self');
var pageMod = require('sdk/page-mod');
var ss = require('sdk/simple-storage');

function getSyncData() {
    var syncData = {};
    for(var key in ss.storage) {
        if(ss.storage.hasOwnProperty(key) && key.indexOf('site:') === 0)
            syncData[key] = ss.storage[key];
    }
    return syncData;
}

function saveSetting(key, value) {
    if(value)
        ss.storage[key] = value;
    else
        delete ss.storage[key];
}

pageMod.PageMod({
    include: self.data.url('options.html'),
    contentScriptFile: [
        self.data.url('lib/pbkdf2.js'),
        self.data.url('lib/sha512.js'),
        self.data.url('lib/base64.js'),
        self.data.url('lib/typedarrays.js'),
        self.data.url('lib/qrcode.js'),
        self.data.url('lib/entropass.js'),
        self.data.url('options.js')
    ],
    onAttach: function(worker) {
        worker.port.emit('attach',
            ss.storage.privateKeyHash,
            getSyncData(),
            ss.storage.defaultPasswordLength);
        worker.port.on('save-setting', saveSetting);
    }
});
