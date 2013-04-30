// Module dependencies.
var application_root = __dirname,
	express = require('express'), //Web framework
	path = require('path'); //Utilities for dealing with file paths

//Create server
var app = express();

// Configure server
app.configure(function() {
	//parses request body and populates request.body
	app.use(express.bodyParser());

	//perform route lookup based on url and HTTP method
	app.use(app.router);

	//Where to serve static content
	app.use(express.static(path.join(application_root, 'site')));

	//Show all errors in development
	app.use(express.errorHandler({ 
		dumpExceptions: true, 
		showStack: true 
	}));
});


/**
 * since we don't really care about data persistance right now, just store all data into an object server side
*/
(function () {
	var getId = (function () {
		var id = 1;
		return function () {
			return id++;
		};
	}());

	var persons = [
		{
			id: getId(),
			name: "abc"
		},
		{
			id: getId(),
			name: "def"
		}
	];

	// getting all persons
	app.get('/api/persons', function (req, res) {
		res.set('Content-type', 'application/json');

		res.send(JSON.stringify(persons));
	});

	// updating an existing person
	app.put('/api/persons/:id', function (req, res) {
		persons.forEach(function (p) {
			if (p.id === parseInt(req.params.id, 10)) {
				Object.keys(req.body).forEach(function (key) {
					p[key] = req.body[key];
				});
			}
		});
	});
}());



//Start server
var port = 4242;

app.listen(port, function() {
	console.log('Express server listening on port %d in %s mode', port, app.settings.env );
});