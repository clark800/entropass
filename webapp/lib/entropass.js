// Copyright (c) 2014-2020 Chris Clark

var B85CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
               'abcdefghijklmnopqrstuvwxyz' +
               '!#$%&()*+-;<=>?@^_`{|}~';

function b85encodeWord(word) {
    var result = '';
    const powers = [1, 85, 7225, 614125, 52200625];
    for(var i = 0; i < 5; i++)
        result += B85CHARS.charAt(Math.floor((word >>> 0)/powers[4-i]) % 85);
    return result;
}

function b85encode(arrayBuffer) {
    var array = []
    const view = new DataView(arrayBuffer);
    for(var i = 0; i < view.byteLength / 4; ++i)
        array.push(view.getUint32(i * 4));
    return array.map(b85encodeWord).join('');
}

function rpad(str, ch, length) {
    while(str.length < length)
        str += ch;
    return str;
}

function alphanumeric(arrayBuffer) {
    const array = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...array));
    return rpad(base64.replace(/[_\W]/g, ''), '0', base64.length);
}

function getKeyMaterial(key) {
    return crypto.subtle.importKey('raw', key, 'PBKDF2', false, ['deriveBits']);
}

function pbkdf2SHA512(key, salt, iterations) {
    return getKeyMaterial(key).then(keyMaterial =>
        crypto.subtle.deriveBits({
            name: 'PBKDF2', hash: 'SHA-512', salt, iterations
        }, keyMaterial, 512)
    );
}

// privateKeyHash is the SHA-512 hash of the private key in lowercase hex
// or the empty string if no private key is set
function generatePassword(passphrase, resetCount, privateKeyHash, domain,
        allowSymbols, length) {
    const resetCountString = resetCount > 0 ? resetCount.toString() : '';
    const secret = passphrase + resetCountString + (privateKeyHash || '');
    const key = (new TextEncoder()).encode(secret);
    const salt = (new TextEncoder()).encode(domain);
    return pbkdf2SHA512(key, salt, 100).then(hash => {
        const password = allowSymbols ? b85encode(hash) : alphanumeric(hash);
        return password.slice(0, length);
    })
}
