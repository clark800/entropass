
function get(id) { return document.getElementById(id); }

function setValue(id, value) { 
    var element = get(id);
    var nodeName = element.nodeName.toLowerCase();
    var type = element.type ? element.type.toLowerCase() : null;
    if(nodeName === 'span') {
        element.innerHTML = value.toString();
    } else if(nodeName === 'input' && type === 'checkbox') {
        element.checked = value;
    } else {
        element.value = value;
    }
}

function getValue(id) {
    var element = get(id);
    var nodeName = element.nodeName.toLowerCase();
    var type = element.type ? element.type.toLowerCase() : null;
    if(nodeName === 'span') {
        return element.innerHTML;
    } else if(nodeName === 'input' && type === 'checkbox') {
        return element.checked;
    } else {
        return element.value;
    }
}

function readSettings(mapping) {
    var settings = {};
    for(var key in mapping) {
        if(mapping.hasOwnProperty(key))
            settings[key] = getValue(mapping[key]);
    }
    return settings;
}

function showSettings(settings, mapping) {
    for(var key in settings) {
        if(settings.hasOwnProperty(key) && mapping.hasOwnProperty(key))
            setValue(mapping[key], settings[key]);
    }
}
