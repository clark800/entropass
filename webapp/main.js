
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
        privateKeyHash: window.localStorage.getItem('privateKeyHash'),
        length: parseInt(document.getElementById('password-length').value, 10),
        resetCount: parseInt(document.getElementById('reset-count').value, 10),
        allowSymbols: document.getElementById('allow-symbols').checked
    }
}

function copy() {
    const inputs = parseInputs();
    const password = generatePassword(inputs.passphrase, inputs.resetCount,
        inputs.privateKeyHash, inputs.domain, inputs.allowSymbols,
        inputs.length);
    return navigator.clipboard.writeText(password);
}

function save() {
    const element = document.getElementById('private-key-hash');
    const privateKeyHash = element.value.toLowerCase();
    if (privateKeyHash.match(/^[a-f0-9]{128}$/)) {
        window.localStorage.setItem('privateKeyHash', privateKeyHash);
        goToPage('generate-page');
    } else if (privateKeyHash === 'skip') {
        window.localStorage.setItem('privateKeyHash', '');
        goToPage('generate-page');
    } else {
        alert('Invalid private key hash');
    }
}

function setup() {
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

function checkClipboard(event) {
    if (event.target.value.length === 0 && 'clipboard' in navigator) {
        return navigator.clipboard.readText().then(text => {
            const hostname = (new URL(text)).hostname;
            event.target.value = hostname;
        }).catch(error => console.error('Error reading clipboard:', error));
    }
}

function onLoad() {
    const privateKeyHash = window.localStorage.getItem('privateKeyHash');
    document.getElementById('domain').addEventListener('click', checkClipboard);
    goToPage(privateKeyHash === null ? 'setup-page' : 'generate-page');
    setup();
}

window.addEventListener('load', onLoad);
