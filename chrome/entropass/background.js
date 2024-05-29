
importScripts('lib/punycode.js', 'lib/publicsuffix.js');

var PSLKEY = 'publicSuffixList';
var PSLDATEKEY = 'publicSuffixListLastUpdate';

function today() {
    return (new Date()).toJSON().slice(0, 10);
}

function setClipboard(text) {
  chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.CLIPBOARD],
    justification: 'Write text to the clipboard.'
  }).then(_ => {
      chrome.runtime.sendMessage({
        type: 'copy-data-to-clipboard',
        target: 'offscreen-doc',
        data: text
      });
  });
}

/*
function setClipboard(text) {
    // https://github.com/w3c/editing/issues/458
    navigator.clipboard.clipboard.write(text);
}
*/

function download(url, callback) {
    fetch(url).then(response => {
        if(response.status === 200) {
            response.text().then(callback);
        } else {
            console.log('Failed to update public suffix list');
        }
    });
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
            var url = chrome.runtime.getURL('data/effective_tld_names.dat');
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
            setClipboard(request.text);
            // clear clipboard after 10 seconds
            // note: service workers live for 30 seconds after last activity
            setTimeout(function() { setClipboard(' '); }, 10000);
        } else if(request.command === 'getDomain') {
            getBaseDomainFromHost(request.host).then(sendResponse);
            return true; // keep connection open for async response
        }
    }
);

initPublicSuffixList();
