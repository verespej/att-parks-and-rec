var _feed = require('feedme');
var _http = require('http');

function get_events(callback) {
	_http.get('http://www.trumba.com/calendars/parks-recreation.rss', function(res) {
		var events = [];
		var parser = new _feed();
		parser.on('item', function(item) {
			events.push(item);
		});
		res.pipe(parser);
		res.on('end', function() {
			callback(null, events);
		});
	}).on('error', callback);
}

module.exports = {
	get_events: get_events
}
