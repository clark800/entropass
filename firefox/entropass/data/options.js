var GLOBAL = {};
function get(id) { return document.getElementById(id); }
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
        new QRCode(div, GLOBAL.privateKeyHash);
        button.setAttribute('value', 'Hide QR Code');
    }
}

function showPrivateKeyFingerprint(privateKeyHash) {
    var text = privateKeyHash ? sha512(privateKeyHash).slice(0, 8) : '';
    get('private-key-fingerprint').value = text;
}

function savePrivateKeyHash(privateKeyHash) {
    self.port.emit('save-setting', 'privateKeyHash', privateKeyHash);
    GLOBAL.privateKeyHash = privateKeyHash;
    showPrivateKeyFingerprint(privateKeyHash);
    alert('Private key saved successfully!');
}

function confirmOverwritePrivateKey() {
    var msg = 'Are you sure you want to replace the current private key?';
    var hash = get('private-key-fingerprint').value;
    return hash === '' || confirm(msg);
}

function onEnableBackwardsCompatibility(event) {
    if(confirmOverwritePrivateKey()) {
        savePrivateKeyHash('undefined');
    }
    event.preventDefault();
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
            var uint8Array = new unsafeWindow.Uint8Array(reader.result);
            var wordArray = uint8ArrayToWordArray(uint8Array);
            savePrivateKeyHash(sha512(wordArray));
        };
        reader.readAsArrayBuffer(files[0]);
    } else {
        savePrivateKeyHash('');
    }
    get('private-key').value = null;
}

function onSavePrivateKey(event) {
    if(confirmOverwritePrivateKey()) {
        savePrivateKey();
    }
    event.preventDefault();
}

function onSaveDefaultPasswordLength(event) {
    var defaultPasswordLength = get('default-password-length').value;
    if(defaultPasswordLength >= 6 && defaultPasswordLength <= 80) {
        self.port.emit('save-setting', 'defaultPasswordLength',
                       defaultPasswordLength);
    } else {
        alert('Default password length must be between 6 and 80 characters.');
    }
    event.preventDefault();
}

function onSavePassphrase(event, privateKeyHash) {
    var passphrase = get('passphrase').value;
    get('passphrase').value = '';
    var passphraseHash = (passphrase ?
        generatePassword(passphrase, 0, privateKeyHash, '', true, 80)
        : '');
    self.port.emit('save-setting', 'passphraseHash', passphraseHash);
    event.preventDefault();
}

function init(privateKeyHash, syncData, defaultPasswordLength) {
    GLOBAL.privateKeyHash = privateKeyHash;
    showPrivateKeyFingerprint(privateKeyHash);
    get('sync-data').value = JSON.stringify(syncData, null, 4);
    get('default-password-length').value = defaultPasswordLength || 16;
    on('save-private-key', 'click', onSavePrivateKey);
    on('enable-compatibility', 'click', onEnableBackwardsCompatibility);
    on('save-passphrase', 'click', function(event) {
        onSavePassphrase(event, privateKeyHash);
    });
    on('save-default-password-length', 'click', onSaveDefaultPasswordLength);
    on('show-qr-code', 'click', function(event) {
        togglePrivateKeyQRCode();
        event.preventDefault();
    });
}

self.port.on('attach', init);
