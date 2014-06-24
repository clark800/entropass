
var GLOBAL = {};
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

function saveSiteSettings(settings) {
    // don't store default values to save space, no default for length
    if(settings.domain === GLOBAL.domain)
        delete settings.domain;
    if(settings.resetCount === '0' || settings.resetCount === 0)
        delete settings.resetCount;
    if(settings.allowSymbols === true)
        delete settings.allowSymbols;
    self.port.emit('save-settings', GLOBAL.domain, settings);
}

function withVerifiedPassword(callback, onFail) {
    var settings = readSettings(SETTINGS);
    if(settings.passwordLength < 6 || settings.passwordLength > 80)
        return;
    var passphrase = get('passphrase').value;
    setValue('passphrase', '');

    if(GLOBAL.passphraseHash) {
        var passphraseHash = generatePassword(
            passphrase, 0, GLOBAL.privateKeyHash, '', true, 80)
        if(passphraseHash === GLOBAL.passphraseHash)
            withPassword(passphrase, settings, callback);
        else
            onFail();
    } else {
        withPassword(passphrase, settings, callback);
    }
}

function onInvalidPassphrase() {
    var field = get('passphrase');
    field.setCustomValidity('Different passphrase');
    field.focus();
}

function loadUsername(username, settings) {
    get('username').value = (username ? username : settings.username) || '';
    if(username && settings.username && (username !== settings.username))
        get('username').className += 'warning';
}

function onPassphraseInput() {
    get('passphrase').setCustomValidity('');
}

function withPassword(passphrase, settings, callback) {
    var resetCount = parseInt(settings.resetCount, 10);
    var passwordLength = parseInt(settings.passwordLength, 10);
    var password = generatePassword(passphrase, resetCount,
        GLOBAL.privateKeyHash, settings.domain, settings.allowSymbols,
        passwordLength);
    callback(password);
    saveSiteSettings(settings);
}

function onInsertPassword(event) {
    withVerifiedPassword(function(password) {
        self.port.emit('insert-password', password);
    }, onInvalidPassphrase);
    event.preventDefault();
}

function onCopyPassword(event) {
    withVerifiedPassword(function(password) {
        self.port.emit('copy-password', password);
    }, onInvalidPassphrase);
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

function collapseOptions() {
    var expandHeight = 45;
    var element = get('options');
    if(element.style.display !== 'none') {
        element.style.display = 'none';
        self.port.emit('resize', -expandHeight);
    }
}

function onSettings() {
    self.port.emit('close');
}

function init(domain, username, localSettings, siteSettings) {
    GLOBAL = localSettings;
    GLOBAL.domain = domain;
    collapseOptions();
    loadUsername(username, siteSettings);
    get('domain').value = domain;
    get('password-length').value = localSettings.defaultPasswordLength || 16;
    showSettings(siteSettings, SETTINGS);
    get('passphrase').focus();
    on('generate-form', 'submit', onInsertPassword);
    on('copy-password', 'click', onCopyPassword);
    on('toggle-options', 'click', onToggleOptions);
    on('settings', 'click', onSettings);
    on('increment-reset-count', 'click', incrementResetCount);
    on('decrement-reset-count', 'click', decrementResetCount);
    on('passphrase', 'input', onPassphraseInput);
}

self.port.on('show', init);
