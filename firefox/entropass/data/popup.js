
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
    return parseInt(get('reset-count').value, 10);
}

function incrementResetCount() {
    get('reset-count').value = (getResetCount() + 1).toString();
}

function decrementResetCount() {
    var newValue = Math.max(0, getResetCount() - 1);
    get('reset-count').value = newValue.toString();
}

function saveSiteSettings(settings) {
    // don't store default values to save space, no default for length
    if(settings.domain === GLOBAL.domain)
        delete settings.domain;
    if(settings.resetCount === '0' || settings.resetCount === 0)
        delete settings.resetCount;
    if(settings.allowSymbols === true)
        delete settings.allowSymbols;
    if(settings.username === '')
        delete settings.username;
    self.port.emit('save-settings', GLOBAL.domain, settings);
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

    if(GLOBAL.passphraseHash) {
        var passphraseHash = generatePassword(
            passphrase, 0, GLOBAL.privateKeyHash, '', true, 80)
        if(passphraseHash === GLOBAL.passphraseHash)
            withPassword(passphrase, settings, callback);
        else {
            var passphraseField = get('passphrase');
            passphraseField.setCustomValidity('Different passphrase');
            passphraseField.focus();
        }
    } else {
        withPassword(passphrase, settings, callback);
    }
}

function loadUsername(username, settings) {
    var field = get('username');
    field.value = (username ? username : settings.username) || '';
    if(username && settings.username && (username !== settings.username))
        field.className += 'warning';
}

function onPassphraseInput() {
    get('passphrase').setCustomValidity('');
}

function onDomainInput() {
    get('domain').setCustomValidity('');
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
    });
    event.preventDefault();
}

function onCopyPassword(event) {
    withVerifiedPassword(function(password) {
        self.port.emit('copy-password', password);
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

function resetPopup() {
    get('passphrase').value = '';
    get('username').value = '';
    get('domain').value = '';
    get('password-length').value = 16;
    get('reset-count').value = '0';
    get('allow-symbols').checked = true;
    get('passphrase').setCustomValidity('');
    get('username').className = '';
    get('domain').setCustomValidity('');
    collapseOptions();
}

function init(domain, username, localSettings, siteSettings) {
    resetPopup();
    GLOBAL = localSettings;
    GLOBAL.domain = domain;
    get('domain').value = domain;
    get('password-length').value = localSettings.defaultPasswordLength || 16;
    showSettings(siteSettings, SETTINGS);
    loadUsername(username, siteSettings);
    get('passphrase').focus();
    on('generate-form', 'submit', onInsertPassword);
    on('copy-password', 'click', onCopyPassword);
    on('toggle-options', 'click', onToggleOptions);
    on('settings', 'click', onSettings);
    on('increment-reset-count', 'click', incrementResetCount);
    on('decrement-reset-count', 'click', decrementResetCount);
    on('passphrase', 'input', onPassphraseInput);
    on('domain', 'input', onDomainInput);
}

self.port.on('show', init);
