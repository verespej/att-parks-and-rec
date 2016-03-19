var _feed = require('feedme');
var _request = require('request');
var _streams = require('memory-streams');

function get_events(callback) {
	_request('http://www.trumba.com/calendars/parks-recreation.rss', function(err, res, body) {
		if (err) {
			return callback(err);
		}

		var events = [];
		var reader = new _streams.ReadableStream(body);
		var parser = new _feed();
		parser.on('item', function(item) {
			console.log(item);
		});
		reader.pipe(parser);
		reader.on('error', callback);
		reader.on('end', function() {
			callback(null, events);
		});
	});
}

module.exports = {
	get_events: get_events
}
