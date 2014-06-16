

function startsWith(string, prefixes) {
    for(var i = 0; i < prefixes.length; i++) {
        if(string.indexOf(prefixes[i]) === 0)
            return true;
    }
    return false;
}

function isVisible(element) {
    return element.offsetWidth > 0 && element.offsetHeight > 0;
}

function isCandidateField(field) {
    var type = field.type ? field.type.toLowerCase() : 'text';
    return (field.value && (type === 'text' || type === 'email') &&
            isVisible(field) && !field.disabled && !field.readOnly);
}

function findUsername(inputFields) {
    if(inputFields.length === 0)
        return null;
    if(inputFields.length === 1)
        return inputFields[0].value;
    var prefixes = ['user', 'email', 'account', 'acct', 'id'];
    for(var i = 0; i < inputFields.length; i++) {
        var name = inputFields[i].getAttribute('name');
        if(name && startsWith(name.toLowerCase(), prefixes))
            return inputFields[i].value;
    }
    return inputFields[0].value;
}

function getUsernameIn(root) {
    var inputFields = root.querySelectorAll('input');
    var candidatesBeforePassword = [];
    var candidatesAfterPassword = [];
    var beforePassword = true;
    for(var i = 0; i < inputFields.length; i++) {
        if(inputFields[i].type.toLowerCase() === 'password') {
            beforePassword = false;
            continue;
        }
        if(isCandidateField(inputFields[i])) {
            if(beforePassword)
                candidatesBeforePassword.push(inputFields[i]);
            else
                candidatesAfterPassword.push(inputFields[i]);
        }
    }
    return (findUsername(candidatesBeforePassword)
            || findUsername(canididatesAfterPassword));
}

function getUsername() {
    var active = document.activeElement;
    if(active.nodeName.toLowerCase() === 'input') {
        var username = getUsernameIn(active.form);
        if(username)
            return username;
    }
    return getUsernameIn(document);
}
