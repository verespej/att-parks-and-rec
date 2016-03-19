var _api = require('./park-events-api');

console.log('Getting events');
_api.get_events('park-name', '2016-03-19', function(err, events) {
  if (err) {
    console.log(err);
  } else {
    console.log(events);
  }
  console.log('Done');
});
