var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.editAtlas = require('../components/controllers/edit-atlas');
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
			website.components.editAtlas.sockets(socket, NA, true);
		});
	};

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			NA = params.NA;

		variation.file = variation.currentRouteParameters.variation;
		variation.fs = variation.currentRouteParameters.variation;
		variation.fc = variation.webconfig.commonVariation;

		variation = website.components.editAtlas.setFilters(variation, NA);

		mainCallback(variation);
	};

}(website));



exports.changeVariation = website.changeVariation;
exports.loadModules = website.loadModules;
exports.setConfigurations = website.setConfigurations;