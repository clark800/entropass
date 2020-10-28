// Copyright (c) 2014 Chris Clark
// requires CryptoJS libraries for SHA-512, PBKDF2, and Base64

var B85CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
               'abcdefghijklmnopqrstuvwxyz' +
               '!#$%&()*+-;<=>?@^_`{|}~';

function b85encodeWord(word) {
    var result = '';
    var powers = [1, 85, 7225, 614125, 52200625];
    for(var i = 0; i < 5; i++)
        result += B85CHARS.charAt(Math.floor((word >>> 0)/powers[4-i]) % 85);
    return result;
}

function b85encode(wordArray) {
    return wordArray.words.map(b85encodeWord).join('');
}

function rpad(str, ch, length) {
    while(str.length < length)
        str += ch;
    return str;
}

function alphanumeric(wordArray) {
    var base64 = CryptoJS.enc.Base64.stringify(wordArray);
    return rpad(base64.replace(/[_\W]/g, ''), '0', base64.length);
}

// privateKeyHash is the SHA-512 hash of the private key in lowercase hex
// or the empty string if no private key is set
function generatePassword(passphrase, resetCount, privateKeyHash, domain,
                           allowSymbols, length) {
    var resetCountString = resetCount > 0 ? resetCount.toString() : '';
    var secret = passphrase + resetCountString + (privateKeyHash || '');
    var hash = CryptoJS.PBKDF2(secret, domain, {keySize: 512/32,
                               iterations: 100, hasher: CryptoJS.algo.SHA512});
    var password = allowSymbols ? b85encode(hash) : alphanumeric(hash);
    return password.slice(0, length);
}
