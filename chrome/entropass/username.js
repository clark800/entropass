
// Username should already be entered when getUsername is called
// so ignore any text fields that are empty
// Assume that the username field comes before the password field
// Look for special names on the input element
// Start looking in form where current focus lies

function startsWith(string, prefixes) {
    for(var i = 0; i < prefixes.length; i++) {
        if(string.indexOf(prefixes[i]) === 0) {
            return true;
        }
    }
    return false;
}

function getUsernameIn(root) {
    var prefixes = ['user', 'email', 'account', 'acct', 'id'];
    var inputFields = root.querySelectorAll('input');
    for(var i = 0; i < inputFields.length; i++) {
        var name = inputFields[i].getAttribute('name');
        if(name && startsWith(name.toLowerCase(), prefixes)) {
            if(inputFields[i].value)
                return inputFields[i].value;
        }
        if(inputFields[i].type.toLowerCase() === 'password') {
            return i > 0 ? inputFields[i-1].value : null;
        }
    }
    return null;
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
