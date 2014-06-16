
var SETTINGS = {defaultPasswordLength: 'default-password-length'};
function on(id, evt, cb) { get(id).addEventListener(evt, cb); }
function sha512(data) { return CryptoJS.SHA512(data).toString(); }

function togglePrivateKeyQRCode() {
    var div = get('qrcode');
    var button = get('show-qr-code');
    if(div.hasChildNodes()) {
        div.removeAttribute('title');
        while(div.hasChildNodes())
            div.removeChild(div.firstChild);
        button.setAttribute('value', 'Show QR Code');
    } else {
        var storageKey = 'privateKeyHash';
        chrome.storage.local.get(storageKey, function(items) {
            new QRCode(div, items[storageKey]);
            button.setAttribute('value', 'Hide QR Code');
        });
    }
}

function showPrivateKeyFingerprint() {
    var storageKey = 'privateKeyHash';
    chrome.storage.local.get(storageKey, function(items) {
        var privateKey = items[storageKey];
        var text = privateKey ? sha512(privateKey).slice(0, 8) : '';
        get('private-key-fingerprint').value = text;
    });
}

function savePrivateKeyHash(privateKeyHash) {
    var items = {'privateKeyHash': privateKeyHash};
    chrome.storage.local.set(items, showPrivateKeyFingerprint);
}

function uint8ArrayToWordArray(uint8Array) {
    var words = [];
    for(var i = 0; i < uint8Array.length; i++)
        words[i >>> 2] |= (uint8Array[i] & 0xff) << (24 - 8 * (i % 4));
    return CryptoJS.lib.WordArray.create(words, uint8Array.length);
}

function savePrivateKey() {
    var files = get('private-key').files;
    if(files.length > 0) {
        var reader = new FileReader();
        reader.onload = function() {
            var uint8Array = new Uint8Array(reader.result);
            var wordArray = uint8ArrayToWordArray(uint8Array);
            savePrivateKeyHash(sha512(wordArray));
        };
        reader.readAsArrayBuffer(files[0]);
    } else {
        savePrivateKeyHash('');
    }
    get('private-key').value = null;
}

function onSavePrivateKey() {
    var storageKey = 'privateKeyHash';
    var msg = 'Are you sure you want to replace the current private key?';
    chrome.storage.local.get(storageKey, function(items) {
        if(items[storageKey] !== undefined)
            if(!confirm(msg))
                return;
        savePrivateKey();
    });
    event.preventDefault();
}

function onSaveDefaultPasswordLength() {
    var defaultPasswordLength = get('default-password-length').value;
    if(defaultPasswordLength >= 6 && defaultPasswordLength <= 80) {
        var settings = {'defaultPasswordLength': defaultPasswordLength};
        saveSettings('global', settings);
    }
    event.preventDefault();
}

function onSavePassphrase() {
    var passphrase = get('passphrase').value;
    setValue('passphrase') = '';
    if(passphrase === '') {
        chrome.storage.local.remove('passphrase-hash');
    } else {
        withPassphraseHash(passphrase, function(hash) {
            chrome.storage.local.set({'passphrase-hash': hash});
        });
    }
    event.preventDefault();
}

function init() {
    showPrivateKeyFingerprint();
    loadAndShowSettings('global', SETTINGS);
    on('save-private-key', 'click', onSavePrivateKey);
    on('save-passphrase', 'click', onSavePassphrase);
    on('save-default-password-length', 'click', onSaveDefaultPasswordLength);
    on('show-qr-code', 'click', togglePrivateKeyQRCode);
    chrome.storage.sync.get(null, function(items) {
        get('sync-data').value = JSON.stringify(items, null, 4);
    });
}

window.onload = init;
