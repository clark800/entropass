
function isHidden(element) {
    return element.style.display === 'none';
}

function show(element) {
    element.style.display = 'block';
}

function hide(element) {
    element.style.display = 'none';
}

function toggle(id) {
    const element = document.getElementById(id);
    if (isHidden(element))
        show(element);
    else
        hide(element);
}

function goToPage(id) {
    Array.from(document.getElementsByClassName('page')).map(hide);
    show(document.getElementById(id));
}

function parseInputs() {
    return {
        passphrase: document.getElementById('passphrase').value,
        domain: document.getElementById('domain').value,
        privateKeyHash: localStorage.getItem('privateKeyHash'),
        length: parseInt(document.getElementById('password-length').value, 10),
        resetCount: parseInt(document.getElementById('reset-count').value, 10),
        allowSymbols: document.getElementById('allow-symbols').checked
    }
}

function clearInputs() {
    document.getElementById('domain').value = '';
    document.getElementById('passphrase').value = '';
    document.getElementById('password-length').value = '16';
    document.getElementById('reset-count').value = '0';
    document.getElementById('allow-symbols').checked = true;
}

function getPassphraseFingerprint(passphrase) {
    return generatePassword(passphrase, 0, null, '', false, 4);
}

function isValidPassphrase(passphrase) {
    const fingerprint = localStorage.getItem('passphrase-fingerprint');
    if (!fingerprint)
        return true;
    if (passphrase.length === 0)
        return false;    // hashing doesn't work on an empty string
    return getPassphraseFingerprint(passphrase) === fingerprint;
}

function copy() {
    event.target.blur();
    const inputs = parseInputs();
    if (inputs.length < 6 || inputs.length > 80) {
        alert('Invalid password length');
        show(document.getElementById('options'));
        document.getElementById('password-length').focus();
        return;
    }
    if (!isValidPassphrase(inputs.passphrase)) {
        alert('Incorrect passphrase');
        document.getElementById('passphrase').value = '';
        document.getElementById('passphrase').focus();
        return;
    }
    clearInputs();
    const password = generatePassword(inputs.passphrase, inputs.resetCount,
        inputs.privateKeyHash, inputs.domain, inputs.allowSymbols,
        inputs.length);
    return navigator.clipboard.writeText(password);
}

function save() {
    event.target.blur();
    const passphrase = document.getElementById('setup-passphrase').value;
    if (passphrase.length > 0) {
        const fingerprint = getPassphraseFingerprint(passphrase);
        localStorage.setItem('passphrase-fingerprint', fingerprint);
    }

    const element = document.getElementById('private-key-hash');
    const privateKeyHash = element.value.toLowerCase();
    if (privateKeyHash.match(/^[a-f0-9]{128}$/)) {
        localStorage.setItem('privateKeyHash', privateKeyHash);
        goToPage('generate-page');
    } else if (privateKeyHash === 'skip') {
        localStorage.setItem('privateKeyHash', '');
        goToPage('generate-page');
    } else {
        alert('Invalid private key hash');
    }
}

function getPublicSuffixListAge() {
    // returns age of cached public suffix list in days
    const now = new Date();
    const timestamp = localStorage.getItem('public-suffix-list-timestamp');
    if (!timestamp)
        return Infinity;
    const then = Date.parse(timestamp)
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function updatePublicSuffixList() {
    // the publicsuffix.org source does not permit cross-origin access
    //const url = 'https://publicsuffix.org/list/public_suffix_list.dat';
    const url = 'https://raw.githubusercontent.com/publicsuffix/list' +
                '/master/public_suffix_list.dat'

    console.log('Fetching public suffix list');
    return fetch(url, { cache: 'no-cache' }).then(response => {
        if (!response.ok)
            return console.error('Bad response to public suffix list fetch');
        return response.text().then(data => {
            console.log('Saving and loading latest public suffix list');
            localStorage.setItem('public-suffix-list', data);
            localStorage.setItem('public-suffix-list-timestamp', new Date());
            window.loadPublicSuffixList(data);
        })
    }).catch(error => console.error('Public suffix list fetch failed:', error));
}

function initPublicSuffixList() {
    const data = localStorage.getItem('public-suffix-list');
    // first load cached version, then attempt to update and reload
    if (data)
        loadPublicSuffixList(data);
    if (!data || getPublicSuffixListAge() > 30)
        updatePublicSuffixList();
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(error => {
            console.error('ServiceWorker registration failed:', error);
            alert('Error: ServiceWorker registration failed: ' +
                error.toString());
        });
    } else {
        console.error('navigator.serviceWorker not available');
        alert('Error: navigator.serviceWorker not available');
    }
}

function getBaseDomain(hostname) {
    // getBaseDomainFromHost is defined by the public suffix library after
    // loadPublicSuffixList is called, but this is only called if we have the
    // public suffix list downloaded, which is not guaranteed
    if (typeof globalThis.getBaseDomainFromHost === 'function')
        return getBaseDomainFromHost(hostname);   // uses public suffix list
    return hostname;
}

function checkClipboard(event) {
    if (event.target.value.length === 0 && 'clipboard' in navigator) {
        return navigator.clipboard.readText().then(text => {
            const hostname = (new URL(text)).hostname;
            event.target.value = getBaseDomain(hostname);
            document.getElementById('passphrase').focus();
        }).catch(error => console.error('Error reading clipboard:', error));
    }
}

function smoothScrollToTop(pixelsPerMs) {
    // note: 'behavior' parameter of scrollTo does not yet work on iOS
    window.scrollTo({top: Math.max(window.scrollY - pixelsPerMs, 0)});
    if (window.scrollY > 0)
        setTimeout(() => smoothScrollToTop(pixelsPerMs), 1);
}

function onBlur(event) {
    // scroll to top after soft keyboard closes
    // wait and make sure another input didn't get focus
    setTimeout(() => {
        const active = document.activeElement;
        if (!active || active.tagName !== 'INPUT')
            smoothScrollToTop(10);
    }, 10);
}

function onLoad() {
    const privateKeyHash = localStorage.getItem('privateKeyHash');
    const element = document.getElementById('domain');
    element.focus();
    element.addEventListener('click', checkClipboard);
    Array.from(document.getElementsByTagName('input')).map(element =>
        element.addEventListener('blur', onBlur));
    goToPage(privateKeyHash === null ? 'setup-page' : 'generate-page');
    registerServiceWorker();
    initPublicSuffixList();
}

addEventListener('load', onLoad);
