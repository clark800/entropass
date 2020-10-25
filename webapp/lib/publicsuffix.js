// usage: loadPublicSuffixList(data); getBaseDomainFromHost('www.example.com')
// reference: http://publicsuffix.org/list/

function PublicSuffixListParser(data) {
    var rules = [];
    var exceptions = [];

    function isMatch(hostLabels, patternLabels) {
        if(hostLabels.length < patternLabels.length)
            return false;
        for(var i = 0; i < patternLabels.length; i++) {
            var patternLabel = patternLabels[patternLabels.length - i - 1];
            var hostLabel = hostLabels[hostLabels.length - i - 1];
            if(patternLabel !== '*' && patternLabel !== hostLabel)
                return false;
        }
        return true;
    }

    function getMatches(hostLabels, list) {
        return list.filter(function(patternLabels) { 
            return isMatch(hostLabels, patternLabels);
        });
    }

    function getPrevailingRule(hostLabels) {
        var matchingExceptions = getMatches(hostLabels, exceptions);
        if(matchingExceptions.length > 0)
            return matchingExceptions[0].slice(1);
        var matchingRules = getMatches(hostLabels, rules);
        if(matchingRules.length === 0)
            return ['*'];
        return matchingRules.sort(function(a, b) {
            return b.length - a.length;
        })[0];
    }

    function decode(label) {
        return label.indexOf('xn--') === 0 ?
            punycode.decode(label.slice(4)) : label;
    }

    this.getBaseDomainFromHost = function(host) {
        if(!host)
            return null;
        var originalHostLabels = host.toLowerCase().split('.');
        var hostLabels = originalHostLabels.map(decode);
        if(hostLabels.length < 2 || hostLabels[0] === '')
            return null;
        var rule = getPrevailingRule(hostLabels);
        if(hostLabels.length <= rule.length)
            return null;
        var start = hostLabels.length - rule.length - 1;
        return originalHostLabels.slice(start).join('.');
    };

    function parse(data) {
        var lines = data.split('\n');
        for(var i = 0; i < lines.length; i++) {
            var rule = lines[i].split(/\s/)[0];            
            if(rule.length > 0 && rule.indexOf('//') !== 0) {
                if(rule[0] === '!') {
                    exceptions.push(rule.slice(1).split('.'));
                } else {
                    rules.push(rule.split('.'));
                }
            }
        }
    }
   
    parse(data);
}

function loadPublicSuffixList(data) {
    var parser = new PublicSuffixListParser(data);
    this.getBaseDomainFromHost = parser.getBaseDomainFromHost;
}

function checkPublicSuffix(host, expectedBaseDomain) {
    var baseDomain = getBaseDomainFromHost(host);
    var success = baseDomain === expectedBaseDomain;
    console.log((success ? 'PASS' : 'FAIL') + ' ' + host + ': ' +
                 baseDomain + ' vs '+ expectedBaseDomain);
}
