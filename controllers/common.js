/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {

    website.components.editAtlas = require('./modules/edit-atlas');
    website.components.componentAtlas = require('./modules/component-atlas');

    publics.setSockets = function () {
        var NA = this,
        	io = NA.io;

        io.sockets.on('connection', function (socket) {
        	website.components.editAtlas.sockets.call(NA, socket, true, !NA.webconfig._demo);
        });
    };

    publics.changeVariations = function (params, next) {
        var NA = this,
            variations = params.variations,
            template = variations.common.demo.template[0],
            object;

        variations.file = variations.routeParameters.variation;
        variations.fs = ((variations.languageCode) ? variations.languageCode + "/": "") + variations.routeParameters.variation;
        variations.fc = ((variations.languageCode) ? variations.languageCode + "/": "") + variations.webconfig.commonVariation;

        variations.common.demo.template = [];

        function replaceNames(str, i) {
            return str
                .replace(/%firstname%/g, variations.common.demo.list[i].firstname)
                .replace(/%lastname%/g, variations.common.demo.list[i].lastname);
        }
        function replaceCompany(str, i) {
            return str
                .replace(/%company%/g, variations.common.demo.list[i].company);
        }
        function replaceImage(str, i) {
            return replaceCompany(replaceNames(str, i), i);
        }

        for (var i = 0; i < variations.common.demo.list.length; i++) {
            object = {};
            object.name = replaceNames(template.name, i);
            object.company = replaceCompany(template.company, i);
            object.image = {};
            object.image.src = variations.common.demo.list[i].image;
            object.image.alt = replaceImage(template.image.alt, i);
            variations.common.demo.template.push(object);
        }

        variations = website.components.editAtlas.setFilters.call(NA, variations);
        variations = website.components.componentAtlas.includeComponents.call(NA, variations, "components", "mainTag");

        next(variations);
    };

}(website));

exports.setSockets = website.setSockets;
exports.changeVariations = website.changeVariations;
exports.setModules = website.setModules;
exports.setConfigurations = website.setConfigurations;