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

    publics.changeVariations = function (next, locals) {
        var NA = this,
            template = locals.common.demo.template[0],
            object;

        locals.file = locals.routeParameters.variation;
        locals.fs = ((locals.languageCode) ? locals.languageCode + "/": "") + locals.routeParameters.variation;
        locals.fc = ((locals.languageCode) ? locals.languageCode + "/": "") + locals.webconfig.commonVariation;

        locals.common.demo.template = [];

        function replaceNames(str, i) {
            return str
                .replace(/%firstname%/g, locals.common.demo.list[i].firstname)
                .replace(/%lastname%/g, locals.common.demo.list[i].lastname);
        }
        function replaceCompany(str, i) {
            return str
                .replace(/%company%/g, locals.common.demo.list[i].company);
        }
        function replaceImage(str, i) {
            return replaceCompany(replaceNames(str, i), i);
        }

        for (var i = 0; i < locals.common.demo.list.length; i++) {
            object = {};
            object.name = replaceNames(template.name, i);
            object.company = replaceCompany(template.company, i);
            object.image = {};
            object.image.src = locals.common.demo.list[i].image;
            object.image.alt = replaceImage(template.image.alt, i);
            locals.common.demo.template.push(object);
        }

        locals = website.components.editAtlas.setFilters.call(NA, locals);
        locals = website.components.componentAtlas.includeComponents.call(NA, locals, "components", "mainTag");

        next();
    };

}(website));

exports.setSockets = website.setSockets;
exports.changeVariations = website.changeVariations;
exports.setModules = website.setModules;
exports.setConfigurations = website.setConfigurations;