var _api = require('./park-events-api');

console.log('Getting events');
_api.get_events(function(events) {
  console.log(events);
});
