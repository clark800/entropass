var buttons = require('sdk/ui/button/action');
var popup = require('./popup.js');
require('./options.js');

var button = buttons.ActionButton({
    id: 'entropass-button',
    label: 'Entropass',
    icon: {
        '16': './icon-16.png',
        '32': './icon-32.png',
        '64': './icon-64.png'
    },
    onClick: function(state) {
        popup.popup.show({
            position: button
        });
    }
});
