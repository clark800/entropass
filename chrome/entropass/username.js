
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
    var name = field.nodeName.toLowerCase();
    var type = field.type ? field.type.toLowerCase() : 'text';
    return (name === 'input' && (type === 'text' || type === 'email') &&
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
    if(!root)
        return null;
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
    var username = findUsername(candidatesBeforePassword);
    if(username !== null)
        return username;
    return findUsername(candidatesAfterPassword);
}

function stepBackwards(active) {
    var inputNodes = document.querySelectorAll('input');
    var inputs = Array.prototype.slice.call(inputNodes);
    var index = inputs.indexOf(active);
    if(index >= 0) {
        for(var i = index; i >= 0; i--) {
            if(isCandidateField(inputs[i]))
                return inputs[i].value;
        }
    }
    return null;
}

function getUsername() {
    var active = document.activeElement;
    var form = active.form;
    if(form && form.querySelector('input[type="password"]') !== null) {
        var username = getUsernameIn(form);
        if(username !== null)
            return username;
    }
    var passwordFields = document.querySelectorAll('input[type="password"]');
    for(var i = 0; i < passwordFields.length; i++) {
        var username = getUsernameIn(passwordFields[i].form);
        if(username !== null)
            return username;
    }
    return stepBackwards(active);
}

getUsername();
