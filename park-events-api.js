var _feed = require('feedme');
var _http = require('http');
var _html_to_text = require('html-to-text');

function get_events(park_name, date, callback) {
	_http.get('http://www.trumba.com/calendars/parks-recreation.rss', function(res) {
		var events = [];
		var parser = new _feed();
		parser.on('item', function(item) {
			events.push(parse_event(item));
		});
		res.pipe(parser);
		res.on('end', function() {
			callback(null, events);
		});
	}).on('error', callback);
}

function parse_event(rss_item) {
	var event_info = {};
	rss_item['description'].split('<br/><br/>').forEach(function(item) {
		var text = item.trim();
		if (text.length > 0) {
			if (typeof(event_info['time']) === 'undefined' && / \d{1,2}, \d{4}/.test(text)) {
				var loc_date = parse_loc_date(text);
				event_info['time'] = loc_date.time;
				event_info['location'] = loc_date.location;
			} else if (text.startsWith('<img')) {
				// Not using this for now
			} else if (text.startsWith('<b>')) {
				parse_opt_params(text).forEach(function(opt) {
					event_info[opt.name] = opt.val;
				});
			} else {
				if (typeof(event_info['description']) !== 'undefined') {
					throw new Error('Found description twice');
				}
				event_info['description'] = _html_to_text.fromString(text).trim();
			}
		}
	});

	if (typeof(event_info['name']) !== 'undefined') {
		throw new Error('Namesapce conflict on member "name"');
	}
	event_info['name'] = rss_item['title'];

	if (typeof(event_info['event_link']) !== 'undefined') {
		throw new Error('Namesapce conflict on member "event_link"');
	}
	event_info['event_link'] = rss_item['link'];

	if (typeof(event_info['event_day']) !== 'undefined') {
		throw new Error('Namesapce conflict on member "event_day"');
	}
	event_info['event_day'] = rss_item['category'];

	return event_info;
}

function parse_loc_date(text) {
	var entries = text.split('<br/>').map(function(item) {
		return _html_to_text.fromString(item).trim();
	});

	var location, time;
	if (entries.length === 1) {
		location = 'N/A';
		time = entries[0];
	} else if (entries.length === 2) {
		location = entries[0];
		time = entries[1];
	} else {
		throw new Error('Unexpected location/date parsing result - ' + entries.length + ' entries');
	}

	return {
		location: location,
		time: time
	};
}

function parse_opt_params(text) {
	return text.split('<br/>').map(function(item) {
		var split_point = item.indexOf(':');
		if (split_point < 0) {
			console.log(item);
			throw new Error('Error parsing - couldn\'t find token');
		}

		var name = item.substring(0, split_point);
		name = _html_to_text.fromString(name).trim().toLowerCase().replace(/[\/\s-#]+/g, '_');
		name = name.replace(/_+$/, '').replace(/^_+/, '');

		var val = item.substring(split_point + 1);
		val = _html_to_text.fromString(val).trim();

		return {
			name: name,
			val: val
		}
	});
}

module.exports = {
	get_events: get_events
}
