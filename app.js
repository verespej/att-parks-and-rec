var _api = require('./park-events-api');

console.log('Getting events');
_api.get_events(function(err, events) {
  if (err) {
    console.log(err);
  } else {
    console.log(events);
  }
});
