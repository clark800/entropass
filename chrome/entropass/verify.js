function withPassphraseHash(passphrase, callback) {
    var storageKey = 'private-key-hash';
    chrome.storage.local.get(storageKey, function(items) {
        var privateKeyHash = items[storageKey] ? items[storageKey] : '';
        callback(generatePassword(passphrase, 0, privateKeyHash, '', true, 80));
    });
}