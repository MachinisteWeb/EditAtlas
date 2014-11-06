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
		var io = params.io,
			NA = params.NA;

		io.sockets.on('connection', function (socket) {

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
			socketio = NA.modules.socketio,
			connect = NA.modules.connect;

		privates.socketIoInitialisation(socketio, NA, function (io) {

			privates.socketIoEvents(io, NA);

			callback(NA);					
		});

	};			

	privates.socketIoInitialisation = function (socketio, NA, callback) {
		var optionIo = (NA.webconfig.urlRelativeSubPath) ? { resource: NA.webconfig.urlRelativeSubPath + '/socket.io' } : undefined,
			io = socketio.listen(NA.server, optionIo),
			connect = NA.modules.connect,
			cookie = NA.modules.cookie;

		io.enable('browser client minification');
		if (NA.webconfig._ioGzip) {
			io.enable('browser client gzip');
		}
		io.set('log level', 1);
		io.enable('browser client cache');
		io.set('browser client expires', 86400000 * 30);
		io.enable('browser client etag');
		io.set('authorization', function (data, accept) {

            // No cookie enable.
            if (!data.headers.cookie) {
                return accept('Session cookie required.', false);
            }

            // First parse the cookies into a half-formed object.
            data.cookie = cookie.parse(data.headers.cookie);

            // Next, verify the signature of the session cookie.
            data.cookie = connect.utils.parseSignedCookies(data.cookie, NA.webconfig.session.secret);
             
            // save ourselves a copy of the sessionID.
            data.sessionID = data.cookie[NA.webconfig.session.key];

			// Accept cookie.
            NA.sessionStore.load(data.sessionID, function (error, session) {
                if (error || !session) {
                    accept("Error", false);
                } else {
                    data.session = session;
                    accept(null, true);
                }
            });

        });

    	callback(io);		
	};

	privates.socketIoEvents = function (io, NA) {
		var params = {};

		params.io = io;
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