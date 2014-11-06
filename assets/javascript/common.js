var website = website || {},
    $body = $('body');

(function (publics) {
    "use strict";

    var optionsSocket;

    if ($body.data('hostname') !== 'localhost') {
        optionsSocket = {
          resource: $body.data('subpath') + (($body.data('subpath')) ? '/' : '') + 'socket.io'
        }
    }

    publics.socket = io.connect(($body.data('hostname') === 'localhost') ? undefined : $body.data('hostname'), optionsSocket);

    publics.addText = function () {
        $(".add-text > span, .add-text > div").each(function () {
            if ($(this).html().indexOf(" [Partie ajoutée côté client]") === -1) {
                $(this).html( $(this).html() + " [Partie ajoutée côté client]" );             
            }
        });
    }
    publics.addAttr = function () {
        $(".add-attr").each(function () {
            if ($(this).attr('href').indexOf(" [Partie ajoutée côté client]") === -1) {
                $(this).attr('href', $(this).attr('href') + " [Partie ajoutée côté client]" );
            }
            if ($(this).attr('title').indexOf(" [Partie ajoutée côté client]") === -1) {
                $(this).attr('title', $(this).attr('title') + " [Partie ajoutée côté client]" );
             }
        });
    }


    publics.init = function () {
        website.editAtlas();

        website.addText();
        website.addAttr();

        website.cleanDataEditAtlas($(".clear"));
    };
}(website));

website.init();