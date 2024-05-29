
function handleMessage(message) {
    const textarea = document.getElementById('clipboardholder');
    textarea.value = message.data;
    textarea.select();
    document.execCommand('cut');
    window.close();
}

chrome.runtime.onMessage.addListener(handleMessage);
