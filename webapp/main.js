
function toggle(id) {
    var element = document.getElementById(id);
    if (element.style.display === 'none')
        element.style.display = 'block';
    else element.style.display = 'none';
}

function copyText(text) {
    return navigator.clipboard.writeText(text);
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
