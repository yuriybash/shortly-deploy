var mongoose    = require('mongoose');

var app = require('./server-config.js');
mongoose.connect('mongodb://localhost/shortly'); // connect to mongo database named shortly


var port = process.env.PORT || 4568;

app.listen(port);

console.log('Server now listening on port ' + port);
console.log('With testing logs');
