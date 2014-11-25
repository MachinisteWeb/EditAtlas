var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.editAtlas = require('../components/controllers/edit-atlas');
	website.components.socketio = require('../components/controllers/socket-io');

	publics.loadModules = function (NA) {
		NA.modules.cookie = require('cookie');
		NA.modules.socketio = require('socket.io');

		NA.modules.ejs = website.components.editAtlas.setFilters(NA.modules.ejs, NA);

		return NA;
	};

	publics.asynchrones = function (params) {
		var socketio = params.socketio,
			NA = params.NA;

		socketio.sockets.on('connection', function (socket) {
			website.components.editAtlas.sockets(socket, NA);
		});
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

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation;

		variation.file = variation.pageParameters.variation;
		variation.fs = variation.pageParameters.variation;
		variation.fc = variation.webconfig.commonVariation;

		mainCallback(variation);
	};

}(website));



exports.preRender = website.preRender;
exports.loadModules = website.loadModules;
exports.setConfigurations = website.setConfigurations;