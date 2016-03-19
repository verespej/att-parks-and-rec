var _bunyan = require('bunyan');
var _uuid = require('uuid');
var _express = require('express');
var _body_parser = require('body-parser');
var _park_events_api = require('./park-events-api');

var _log = new _bunyan({
  name: 'job-scraper',
  streams: [
    {
      stream: process.stdout,
      level: 'info'
    },
    {
      // If log size becomes an issue, can consider 
      // https://www.npmjs.com/package/bunyan-rotating-file-stream
      path: 'errors.log',
      level: 'error',
      type: 'rotating-file',
      period: '1d',
      count: 5
    }
  ],
  serializers: _bunyan.stdSerializers
});

var app = _express();
app.use(_body_parser.json());
app.use(_body_parser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  req.id = _uuid.v4();
  req.log = _log.child({ req_id: req.id });
  res.setHeader('X-Request-Id', req.id);

  _log.info({ req_id: req.id, req: req }, 'Received request');

  res.on('finish', function() {
    req.log.info({
      headers: res._headers,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage
    }, 'Response sent');
  });
  res.on('close', function() {
    req.log.info('Connection terminated');
  });

  next();
});
app.use(_express.static(__dirname + '/static'));

app.set('port', (process.env.PORT || 5000));

_park_events_api.get_events(null, null, function(err, events) {
  if (err) {
    return console.error('Fatal error getting events');
  }
  app.get('/api/events', function(req, res, next) {
    var park_name = req.query.park_name.toLowerCase();
    var filtered = events;
    if (typeof(park_name) !== 'undefined') {
      filtered = events.filter(function(event) {
        var include = (event.location && event.location.toLowerCase().includes(park_name)) || 
          (event.name && event.name.toLowerCase().includes(park_name)) || 
          (event.description && event.description.toLowerCase().includes(park_name)) || 
          (event.neighborhoods && event.neighborhoods.toLowerCase().includes(park_name));
        return include;
      });
    }
    res.json(filtered);
    next();

    /* ON ERRORS:
      req.log.error({ err: err }, '...');
      res.status(500).send('Internal error');
      next(err);
    */
  });

  app.listen(app.get('port'), function() {
    _log.info('Express server started on port ' + app.get('port'));
  });
});
