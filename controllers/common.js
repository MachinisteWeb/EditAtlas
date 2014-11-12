var website = {};

// Loading modules for this website.
(function (publics) {
	"use strict";

	var privates = {};

	publics.editAtlas = require('../components/controllers/edit-atlas');

	publics.loadModules = function (NA) {
		var modulePath = (NA.webconfig._needModulePath) ? NA.nodeModulesPath : '';
		
		NA.modules.fs = require('fs');
		NA.modules.socketio = require(modulePath + 'socket.io');
		NA.modules.cookie = require(modulePath + 'cookie');

		NA.modules.ejs = website.editAtlas.setFilters(NA.modules.ejs, NA);

		return NA;
	};

}(website));



// Asynchrone
(function (publics) {
	"use strict";

	var privates = {};

	publics.asynchrone = function (params) {
		var socketio = params.socketio,
			NA = params.NA;

		socketio.sockets.on('connection', function (socket) {

			website.editAtlas.sockets(socket, NA);

		});
	};

}(website));



// Set configuration for this website.
(function (publics) {
	"use strict";

	var privates = {};

	publics.setConfigurations = function (NA, callback) {
		var mongoose = NA.modules.mongoose,
			socketio = NA.modules.socketio;

		privates.socketIoInitialisation(socketio, NA, function (socketio) {

			privates.socketIoEvents(socketio, NA);

			callback(NA);					
		});

	};			

	privates.socketIoInitialisation = function (socketio, NA, callback) {
		var optionIo = (NA.webconfig.urlRelativeSubPath) ? { path: NA.webconfig.urlRelativeSubPath + '/socket.io' } : undefined,
			socketio = socketio(NA.server, optionIo),
			cookie = NA.modules.cookie,
			cookieParser = NA.modules.cookieParser;

		socketio.use(function(socket, next) {
			var handshakeData = socket.request;

			if (!handshakeData.headers.cookie) {
                return next(new Error('Cookie de session requis.'));
            }

            handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
            handshakeData.cookie = cookieParser.signedCookies(handshakeData.cookie, NA.webconfig.session.secret);
    		handshakeData.sessionID = handshakeData.cookie[NA.webconfig.session.key];

			NA.sessionStore.load(handshakeData.sessionID, function (error, session) {
                if (error || !session) {
                	return next(new Error('Aucune session récupérée.'));
                } else {
                    handshakeData.session = session;           			
                    next();
                }
            });
		});

    	callback(socketio);
	};

	privates.socketIoEvents = function (socketio, NA) {
		var params = {};

		params.socketio = socketio;
		params.NA = NA;

		website.asynchrone(params);
	};

}(website));

// PreRender
(function (publics) {
	"use strict";

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