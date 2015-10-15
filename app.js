var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');

var config = require('./config');

require('./config/passport/jwt-passport')(passport);
require('./lib/cassandra-odm').connect(config.get('cassandra:nodes'), config.get('cassandra:keyspace'));
var routes = require('./routes/index')(passport);
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use(passport.initialize());
//app.use(passport.session());

app.use(routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        if (res.statusCode === 500) {
            console.log(err.message);
            console.log(err.stack);
        }
        res.send({
            message: err.message,
            error: {}
        });
    });
} else {
// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: {}
        });
    });
}

module.exports = app;
