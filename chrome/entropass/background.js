
var PSLKEY = 'publicSuffixList';
var PSLDATEKEY = 'publicSuffixListLastUpdate';

function today() {
    return (new Date()).toJSON().slice(0, 10);
}

function setClipboard(text) {
    clipboardHolder = document.getElementById('clipboardholder');
    clipboardHolder.value = text;
    clipboardHolder.select();
    document.execCommand('Cut');
}

function download(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
            if(xhr.status === 200 && xhr.responseText.length > 0)
                callback(xhr.responseText);
            else
                console.log('Failed to update public suffix list');
        }
    };
    xhr.send();
}

function pullPublicSuffixList(url, callback) {
    download(url, function(data) {
        var items = {};
        items[PSLKEY] = data;
        chrome.storage.local.set(items);
        loadPublicSuffixList(data);
        if(callback)
            callback();
    });
}

function updatePublicSuffixList() {
    var url = 'http://publicsuffix.org/list/effective_tld_names.dat';
    pullPublicSuffixList(url, function() {
        var items = {};
        items[PSLDATEKEY] = today();
        chrome.storage.local.set(items);
    });
}

function initPublicSuffixList() {
    // first load the list using locally available data so that there
    // is less risk of having the user need it before it is downloaded
    chrome.storage.local.get(PSLKEY, function(items) {
        if(items[PSLKEY]) {
            loadPublicSuffixList(items[PSLKEY]);
        } else {
            var url = chrome.extension.getURL('data/effective_tld_names.dat');
            pullPublicSuffixList(url);
        }
    });
    // now that the local loading has started, check for updates
    chrome.storage.local.get(PSLDATEKEY, function(items) {
        if(items[PSLDATEKEY] !== today())
            updatePublicSuffixList();
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.command === 'setClipboard') {
            var delay = request.delay ? request.delay : 0;
            setTimeout(function() { setClipboard(request.text); }, delay);
        } else if(request.command === 'getDomain') {
            sendResponse(getBaseDomainFromHost(request.host));
        }
    }
);

initPublicSuffixList();
