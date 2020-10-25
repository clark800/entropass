
function toggleOptions() {
    var element = document.getElementById('options');
    if (element.style.display == 'none')
        element.style.display = 'block';
    else element.style.display = 'none';
}

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
        element.setSelectionRange(0, element.value.length);
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
    // note: navigator.clipboard.writeText is simpler, but requires that the
    // webapp be hosted with https and isn't available in older versions of iOS
    var element = document.getElementById('password');
    element.value = text;
    copyToClipboard(element);
    element.value = '';
}
