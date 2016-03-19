var _feed = require('feedme');
var _http = require('http');

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
/*description: 
<location> 'Hangar 30, Magnuson Park <br/>'
<time> 'Sunday, April 10, 2016, 9am&nbsp;&ndash;&nbsp;9pm <br/><br/>'
<detail> 'Public Art show. Admission fee. Contact Northwest Art Alliance for cost and event details. Around 800 people anticipated to attend each day. Friday 4/8 is setup day Show dates are 4/9 &amp; 4/10 Saturday 10am-6pm &amp; Sunday 10am-5pm Building 30&#39;s south parking lot will be closed to public and used as part of the event staging &amp; ADA parking. <br/><br/>'
'<b>Event Types</b>:&nbsp;Arts, Special Events <br/>'
'<b>Neighborhoods</b>:&nbsp;Laurelhurst/Sand Point <br/>'
'<b>Sponsoring Organization</b>:&nbsp;Northwest Art Alliance <br/>'
'<b>Contact</b>:&nbsp;Molly Bryan <br/>'
'<b>Audience</b>:&nbsp;All <br/>'
'<b>Pre-Register</b>:&nbsp;No <br/>'
'<b>Cost</b>:&nbsp;Contact Northwest Art Alliance for cost and event details <br/>'
'<b>More info</b>:&nbsp;<a href="http://nwartalliance.org/events/" target="_blank" title="http://nwartalliance.org/events/">nwartalliance.org&#8230;</a> <br/><br/>'
*/
	var fields = rss_item['description'].split('<br/>');
	console.log(fields.length);
	
	return {
		name: rss_item['title'],
		time: 'asdf',
		address: 'asdf'
	};
}

module.exports = {
	get_events: get_events
}
