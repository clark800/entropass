
function toggle(id) {
    var element = document.getElementById(id);
    if (element.style.display == 'none')
        element.style.display = 'block';
    else element.style.display = 'none';
}

function copyText(text) {
    return navigator.clipboard.writeText(text);
}

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('service-worker.js').then(registration => {
        console.log('ServiceWorker registration successful', registration)
    }).catch(error => {
        alert('Error: ServiceWorker registration failed: ' + error.toString());
    });
} else {
    alert('Error: navigator.serviceWorker not available');
}
