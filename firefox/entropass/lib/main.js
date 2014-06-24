var buttons = require('sdk/ui/button/action');
var popup = require('./popup.js');
require('./options.js');

var button = buttons.ActionButton({
    id: 'entropass-button',
    label: 'Entropass',
    icon: {
        '16': './img/icon-16.png',
        '32': './img/icon-32.png',
        '64': './img/icon-64.png'
    },
    onClick: function(state) {
        popup.popup.show({
            position: button
        });
    }
});
