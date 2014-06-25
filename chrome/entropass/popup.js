
var SETTINGS = {username: 'username', domain: 'domain',
                passwordLength: 'password-length', resetCount: 'reset-count',
                allowSymbols: 'allow-symbols'};
function on(id, evt, cb) { get(id).addEventListener(evt, cb); }
function toggle(id) {
    var element = get(id);
    element.style.display = element.style.display === 'none' ? '' : 'none';
}

function setClipboard(password) {
    var cmd = 'setClipboard';
    chrome.runtime.sendMessage({command: cmd, text: password});
    chrome.runtime.sendMessage({command: cmd, text: ' ', delay: 10000});
    window.close();
}

function extractHost(url) {
    if(!url)
        return '';
    var sep = url.indexOf('://');
    var start = sep >= 0 ? sep + 3 : 0;
    var slash = url.indexOf('/', start);
    var end = slash >= 0 ? slash : undefined;
    return url.slice(start, end);
}

function withUsername(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, {file: 'username.js'}, function() {
            chrome.tabs.executeScript(tabs[0].id, {
                code: 'getUsername();'}, function(result) { callback(result[0]); }
            );
        });
    });
}

function insertPassword(password) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, {file: 'insert.js'}, function() {
            chrome.tabs.executeScript(tabs[0].id, {
                code: 'insertPassword("' + password + '");'}, function() {
                    window.close();
            });
        });
    });
}

function getResetCount() {
    return parseInt(get('reset-count').innerHTML, 10);
}

function incrementResetCount() {
    get('reset-count').innerHTML = (getResetCount() + 1).toString();
}

function decrementResetCount() {
    var newValue = Math.max(0, getResetCount() - 1);
    get('reset-count').innerHTML = newValue.toString();
}

function withDomain(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var host = extractHost(tabs[0].url);
        var message = {command: 'getDomain', host: host};
        chrome.runtime.sendMessage(message, callback);
    });
}

function saveSiteSettings(settings) {
    withDomain(function(domain) {
        // don't store default values to save space, no default for length
        if(settings.domain === domain)
            delete settings.domain;
        if(settings.resetCount === "0" || settings.resetCount === 0)
            delete settings.resetCount;
        if(settings.allowSymbols === true)
            delete settings.allowSymbols;
        if(settings.username === '')
            delete settings.username;
        settings.timestamp = Date.now();
        saveSettings('site:' + domain, settings);
    });
}

function withPassword(passphrase, settings, callback) {
    saveSiteSettings(settings);
    var storageKey = 'privateKeyHash';
    chrome.storage.local.get(storageKey, function(items) {
        var privateKeyHash = items[storageKey] ? items[storageKey] : '';
        callback(generatePassword(passphrase, parseInt(settings.resetCount, 10),
            privateKeyHash, settings.domain, settings.allowSymbols,
            parseInt(settings.passwordLength, 10)));
    });
}

function withVerifiedPassword(callback, onFail) {
    var settings = readSettings(SETTINGS);
    if(settings.passwordLength < 6 || settings.passwordLength > 80)
        return;
    var domainField = get('domain');
    if(!domainField.value) {
        domainField.setCustomValidity('Domain must not be empty');
        domainField.focus();
        return;
    }
    var passphrase = get('passphrase').value;
    setValue('passphrase', '');

    var storageKeyPassphrase = 'passphrase-hash';
    chrome.storage.local.get(storageKeyPassphrase, function(items) {
        if(items[storageKeyPassphrase]) {
            withPassphraseHash(passphrase, function(hash) {
                if(hash === items[storageKeyPassphrase])
                    withPassword(passphrase, settings, callback);
                else
                    onFail();
            });
        } else {
            withPassword(passphrase, settings, callback);
        }
    });
}

function onInvalidPassphrase() {
    var field = get('passphrase');
    field.setCustomValidity('Different passphrase');
    field.focus();
}

function onGeneratePassword() {
    withVerifiedPassword(insertPassword, onInvalidPassphrase);
    event.preventDefault();
}

function onCopyPassword() {
    withVerifiedPassword(setClipboard, onInvalidPassphrase);
    event.preventDefault();
}

function loadAndShowSiteSettings(mapping, callback) {
    withDomain(function(domain) {
        loadAndShowSettings('site:' + domain, mapping, callback);
    });
}

function onPassphraseInput() {
    get('passphrase').setCustomValidity('');
}

function onDomainInput() {
    get('domain').setCustomValidity('');
}

function loadUsername(settings) {
    withUsername(function(username) {
        get('username').value = (username ? username : settings.username) || '';
        if(username && settings.username && (username !== settings.username))
            get('username').className += 'warning';
    });
}

function init() {
    withDomain(function(domain) {setValue('domain', domain);});
    loadAndShowSettings('global', {defaultPasswordLength: 'password-length'});
    loadAndShowSiteSettings(SETTINGS, loadUsername);
    on('generate-form', 'submit', onGeneratePassword);
    on('increment-reset-count', 'click', incrementResetCount);
    on('decrement-reset-count', 'click', decrementResetCount);
    on('copy-password', 'click', onCopyPassword);
    on('toggle-options', 'click', function() {toggle('options');});
    on('passphrase', 'input', onPassphraseInput);
    on('domain', 'input', onDomainInput);
}

window.onload = init;
