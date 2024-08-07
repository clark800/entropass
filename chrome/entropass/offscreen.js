
function handleMessage(message) {
    if (message.type === 'copy-data-to-clipboard') {
        const textarea = document.getElementById('clipboardholder');
        textarea.value = message.data;
        textarea.select();
        document.execCommand('cut');
        window.close();
    }
}

chrome.runtime.onMessage.addListener(handleMessage);
