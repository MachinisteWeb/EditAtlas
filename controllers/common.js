/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {

	website.components.editAtlas = require('../components/controllers/edit-atlas');
	website.components.sublimeAtlas = require('../components/controllers/sublime-atlas');
	website.components.socketio = require('../components/controllers/socket-io');

	publics.loadModules = function () {
		var NA = this;

		NA.modules.cookie = require('cookie');
		NA.modules.socketio = require('socket.io');
	};

	publics.setConfigurations = function (next) {
		var NA = this,
			socketio = NA.modules.socketio,
			params = {};

		website.components.socketio.initialisation.call(NA, socketio, function (socketio) {
			params.socketio = socketio;
			website.asynchrones.call(NA, params);
			next();
		});
	};

	publics.asynchrones = function (params) {
		var NA = this,
			socketio = params.socketio;

		socketio.sockets.on('connection', function (socket) {
			website.components.editAtlas.sockets.call(NA, socket, true, !NA.webconfig._demo);
		});
	};

	publics.changeVariation = function (params, mainCallback) {
		var NA = this,
			variation = params.variation,
			template = variation.common.demo.template[0],
			object;

		variation.file = variation.currentRouteParameters.variation;
		variation.fs = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.currentRouteParameters.variation;
		variation.fc = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.webconfig.commonVariation;

		variation.common.demo.template = [];

		function replaceNames(str, i) {
			return str
				.replace(/%firstname%/g, variation.common.demo.list[i].firstname)
				.replace(/%lastname%/g, variation.common.demo.list[i].lastname);
		}
		function replaceCompany(str, i) {
			return str
				.replace(/%company%/g, variation.common.demo.list[i].company);
		}
		function replaceImage(str, i) {
			return replaceCompany(replaceNames(str, i), i);
		}

		for (var i = 0; i < variation.common.demo.list.length; i++) {
			object = {};
			object.name = replaceNames(template.name, i);
			object.company = replaceCompany(template.company, i);
			object.image = {};
			object.image.src = variation.common.demo.list[i].image;
			object.image.alt = replaceImage(template.image.alt, i);
			variation.common.demo.template.push(object);
		}

		variation = website.components.editAtlas.setFilters.call(NA, variation);
		variation = website.components.sublimeAtlas.includeComponents(variation, NA, "components", "mainTag");

		mainCallback(variation);
	};

}(website));



exports.changeVariation = website.changeVariation;
exports.loadModules = website.loadModules;
exports.setConfigurations = website.setConfigurations;