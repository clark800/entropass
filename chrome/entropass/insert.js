
function insertPasswordAt(password, element) {
    element.value = password;
    setTimeout(function() { element.focus(); }, 10);
    return true;
}

function insertionFailure(message) {
    setTimeout(function() { alert(message); }, 10);
    return false;
}

function insertPassword(password) {
    var active = document.activeElement;
    if(active.nodeName.toLowerCase() === 'input' &&
            active.type.toLowerCase() === 'password' &&
            active.value === '') {
        return insertPasswordAt(password, active);
    }
    var passwordFields = document.querySelectorAll('input[type="password"]');
    if(passwordFields.length === 0) {
        return insertionFailure('No password field found on this site');
    }
    for(var i = 0; i < passwordFields.length; i++) {
        if(passwordFields[i].value === '')
            return insertPasswordAt(password, passwordFields[i]);
    }
    return insertionFailure('No empty password field found on this site');
}
