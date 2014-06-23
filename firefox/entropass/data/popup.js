
var SETTINGS = {username: 'username', domain: 'domain',
                passwordLength: 'password-length', resetCount: 'reset-count',
                allowSymbols: 'allow-symbols'};
function get(id) { return document.getElementById(id); }
function on(id, evt, cb) { get(id).addEventListener(evt, cb); }
function toggle(id) {
    var element = get(id);
    element.style.display = element.style.display === 'none' ? '' : 'none';
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

/*
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
    on('copy-password', 'click', onCopyPassword);
    on('passphrase', 'input', onPassphraseInput);
    on('toggle-options', 'click', function() {toggle('options');});
}
*/

function withPassword(callback) {
    var passphrase = get('passphrase').value;
    var username = get('username').value;
    var domain = get('domain').value;
    var resetCount = getResetCount();
    var allowSymbols = get('allow-symbols').checked;
    var passwordLength = get('password-length').value;
    self.port.once('private-key-hash', function(privateKeyHash) {
        var password = generatePassword(passphrase, resetCount, privateKeyHash,
            domain, allowSymbols, passwordLength);
        callback(password);
    });
    self.port.emit('get-private-key-hash');
}

function onInsertPassword(event) {
    withPassword(function(password) {
        self.port.emit("insert-password", password);
    });
    event.preventDefault();
}

function onCopyPassword(event) {
    withPassword(function(password) {
        self.port.emit("copy-password", password);
    });
    event.preventDefault();
}

function onToggleOptions(event) {
    var expandHeight = 45;
    var element = get('options');
    if(element.style.display === 'none') {
        element.style.display = '';
        self.port.emit('resize', expandHeight);
    } else {
        element.style.display = 'none';
        self.port.emit('resize', -expandHeight);
    }
    event.preventDefault();
}

function onSettings() {
    self.port.emit('close');
}

function init(domain, username) {
    get('username').value = username;
    get('domain').value = domain;
    get('passphrase').focus();
    on('generate-form', 'submit', onInsertPassword);
    on('copy-password', 'click', onCopyPassword);
    on('toggle-options', 'click', onToggleOptions);
    on('settings', 'click', onSettings);
    on('increment-reset-count', 'click', incrementResetCount);
    on('decrement-reset-count', 'click', decrementResetCount);
}

self.port.on('show', init);
