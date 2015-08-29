var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.editAtlas = require('../components/controllers/edit-atlas');
	website.components.sublimeAtlas = require('../components/controllers/sublime-atlas');
	website.components.socketio = require('../components/controllers/socket-io');

	publics.loadModules = function (NA) {
		NA.modules.cookie = require('cookie');
		NA.modules.socketio = require('socket.io');

		return NA;
	};

	publics.setConfigurations = function (NA, next) {
		var socketio = NA.modules.socketio;

		website.components.socketio.initialisation(socketio, NA, function (socketio, NA) {
			website.components.socketio.events(socketio, NA, function (params) {
				website.asynchrones(params);
				next(NA);
			});
		});
	};

	publics.asynchrones = function (params) {
		var socketio = params.socketio,
			NA = params.NA;

		socketio.sockets.on('connection', function (socket) {
			website.components.editAtlas.sockets(socket, NA, true, !NA.webconfig._demo);
		});
	};

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			NA = params.NA,
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

		variation = website.components.editAtlas.setFilters(variation, NA);
		variation = website.components.sublimeAtlas.includeComponents(variation, NA, "components", "mainTag");

		mainCallback(variation);
	};

}(website));



exports.changeVariation = website.changeVariation;
exports.loadModules = website.loadModules;
exports.setConfigurations = website.setConfigurations;