function isiOS() {
    return /iPad|iPhone|iPod/.test(navigator.platform)
}

function selectText(element) {
    if (isiOS()) {
        var range = document.createRange();
        range.selectNodeContents(element);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        element.setSelectionRange(0, 65535);
    } else {
        element.select();
    }
}

function copyToClipboard(element) {
    element.style.visibility = 'visible';
    selectText(element);
    document.execCommand('copy');
    element.blur();
    element.style.visibility = 'hidden';
}

function copyText(text) {
    var element = document.getElementById('password');
    element.value = text;
    copyToClipboard(element);
    element.value = '';
}
