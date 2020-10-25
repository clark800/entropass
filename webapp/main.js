
function toggle(id) {
    var element = document.getElementById(id);
    if (element.style.display === 'none')
        element.style.display = 'block';
    else element.style.display = 'none';
}

function copyText(text) {
    return navigator.clipboard.writeText(text);
}

function copyPassword() {
    const passphrase = document.getElementById('passphrase').value;
    const domain = document.getElementById('domain').value;
    const privateKeyHash = '';
    const length = parseInt(document.getElementById('password-length').value, 10);
    const resetCount = parseInt(document.getElementById('reset-count').value, 10);
    const allowSymbols = document.getElementById('allow-symbols').checked;
    const password = generatePassword(passphrase, resetCount, privateKeyHash,
        domain, allowSymbols, length);
    return copyText(password);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(error => {
        console.error('ServiceWorker registration failed:', error);
        alert('Error: ServiceWorker registration failed: ' + error.toString());
    });
} else {
    console.error('navigator.serviceWorker not available');
    alert('Error: navigator.serviceWorker not available');
}
