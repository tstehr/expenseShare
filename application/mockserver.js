// Module dependencies.
var application_root = __dirname,
	express = require('express'), //Web framework
	path = require('path'); //Utilities for dealing with file paths

//Create server
var app = express();

// Configure server

//parses request body and populates request.body
app.use(express.bodyParser());

//Where to serve static content
app.use(express.static(path.join(application_root, 'site')));

//perform route lookup based on url and HTTP method
app.use(app.router);

//Show all errors in development
app.use(express.errorHandler({
	dumpExceptions: true, 
	showStack: true 
}));


// WARNING: ugly code begins here
// <uglycode>

// TODO user authentification
// https://github.com/visionmedia/express/tree/master/examples/auth

/**
 * since we don't really care about data persistance right now, just store 
 * all data into an object server side. makes it work, but you loose all data 
 * when you shut down the server.
 */
var createMockRESTInterface = function (app, name, elements, makeId) {
	console.log('Creating REST-mock for ' + name);

	// getting all elements
	app.get('/api/' + name, function (req, res) {	
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(elements));
	});

	// getting one element 
	app.get('/api/' + name + '/:id', function (req, res) {
		res.set('Content-type', 'application/json; charset=utf8');

		var found = elements.some(function (element) {
			if (element.id.toString() === req.params.id) {
				res.send(JSON.stringify(element));
				return true;
			}
		});

		if (!found) {
			res.send('false');
		}
	});

	// adding an element
	app.post('/api/' + name, function (req, res) {
		var element = {};
		Object.keys(req.body).forEach(function (key) {
			element[key] = req.body[key];
		});
		element.id = makeId();

		console.log(element);

		elements.push(element);

		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(element));
	});

	// updating an existing element
	app.put('/api/' + name + '/:id', function (req, res) {
		elements.some(function (element) {
			if (element.id.toString() === req.params.id) {
				Object.keys(req.body).forEach(function (key) {
					element[key] = req.body[key];
				});
				res.set('Content-type', 'application/json; charset=utf8');
				res.send(JSON.stringify(element));
				return true;
			}
		});
	});

	// removing an element 
	app.delete('/api/' + name + '/:id', function (req, res) {
		var sc = elements.some(function (element, index) {
			if (element.id === parseInt(req.params.id, 10)) {
				console.log(elements);
				elements.splice(index, 1);
				console.log(elements);
				return true;
			}
		});
		if (sc) {
			res.send('true');
		} else {
			res.send('false');
		}
	});
};

var makeId = (function () {
	var id = 1;

	var ret = function () {
		return id++;
	};

	ret.set = function (start) {
		id = start;
	};

	return ret;
}());

makeId.set(500);

createMockRESTInterface(app, 'persons', [{
	id: 1,
	name: 'Müller'
}, {
	id: 2,
	name: 'Meier'
}, {
	id: 3,
	name: 'Schultze'
}, {
	id: 4,
	name: 'Hans'
}, {
	id: 5,
	name: 'Wurst'
}], makeId);

createMockRESTInterface(app, 'participations', [{
	id: 100,
	person: 1,
	expense: 200, 
	amount: 100,
	participating: true
}, {
	id: 101,
	person: 2,
	expense: 200, 
	amount: 10,
	participating: true
}, {
	id: 102,
	person: 2,
	expense: 201, 
	amount: 10,
	participating: true
}, {
	id: 103,
	person: 3,
	expense: 201,
	amount: 30
}], makeId);

createMockRESTInterface(app, 'expenses', [{
	id: 200,
	description: 'Wrappen',
	participations: [100, 101]
}, {
	id: 201,
	description: 'Burger',
	participations: [102, 103]
}, {
	id: makeId(),
	description: 'Spaghetti'
}, {
	id: makeId(),
	description: 'Kartoffelsalat'
}, {
	id: makeId(),
	description: 'Der Gerät'
}], makeId);

createMockRESTInterface(app, 'months', [{
	id: '2013-05',
	expenses: [200, 201]
}], makeId);


app.get('*', function (req, res) {
	res.sendfile(path.join(application_root, 'site/index.html'));
});

// </uglycode>


//Start server
var port = 4242;

app.listen(port, function() {
	console.log('Express server listening on port %d in %s mode', port, app.settings.env );
});
