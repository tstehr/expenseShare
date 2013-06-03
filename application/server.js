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


// insert db-code here...

//Start server
var port = 4242;

app.listen(port, function() {
	console.log('Express server listening on port %d in %s mode', port, app.settings.env );
});
