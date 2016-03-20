var _feed = require('feedme');
var _http = require('http');
var _html_to_text = require('html-to-text');
var _moment = require('moment');

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
				event_info['location'] = loc_date.location;
				event_info['day'] = loc_date.day;
				event_info['start_time'] = loc_date.start_time;
				event_info['end_time'] = loc_date.end_time;
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

	if (typeof(event_info['guid']) !== 'undefined') {
		throw new Error('Namesapce conflict on member "guid"');
	}
	event_info['guid'] = rss_item['guid'].text;

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

	var location = null, time_text = null, day = null, start_time = null, end_time = null;
	var loc_index = -1;
	var time_index = -1;

	if (entries.length === 1) {
		time_index = 0;
	} else if (entries.length === 2) {
		loc_index = 0;
		time_index = 1;
	} else {
		throw new Error('Unexpected location/date parsing result - ' + entries.length + ' entries');
	}

	if (loc_index >= 0) {
		location = entries[loc_index];
	}

	if (time_index >= 0) {
		var time_parts = entries[time_index].match(/^\w+, (\w+ \d+, \d{4}), ([\w\d:]+) [-–] ([\w\d:]+)/);

		// TODO: Moment doesn't like the format of this date
		day = _moment(time_parts[1]);

		var start_time_text = time_parts[2];
		var end_time_text = time_parts[3];

		var time_regex = /[\d:]+(am|pm)/;
		if (!time_regex.test(start_time_text)) {
			start_time_text += end_time_text.match(/[\d:]+(am|pm)/)[1];
		}

		start_time = day.clone().add(to_24_hour_time(start_time_text), 'h');
		end_time = day.clone().add(to_24_hour_time(end_time_text), 'h');
	}

	return {
		location: location,
		time_text: time_text,
		day: day.format(),
		start_time: start_time.format(),
		end_time: end_time.format()
	};
}

function to_24_hour_time(text) {
	var parts = text.match(/(\d{1,2})(\w{2})/);
	var hour = parseInt(parts[1]) % 12;
	if (parts[2].toLowerCase() === 'pm') {
		hour += 12;
	}
	return hour;
}

function parse_opt_params(text) {
	return text.split('<br/>').map(function(item) {
		var split_point = item.indexOf(':');
		if (split_point < 0) {
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
