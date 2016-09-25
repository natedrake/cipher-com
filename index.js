/**
 *  index.js
 *  @author John O'Grady <natedrake> | 14101718
 *  @date 10/11/2015
 *  @note index javascript file... handles routing, server responses/requests,
  *     orm, rss generation, ciphering, parsing url, xml generation
 */
var fs = require("fs");
var express = require('express');
var app = express();

var orm = require('orm');

/**
 *  @note global variables
 **/

var ormdb;

/**
 *  @note for calling js, and css files, etc...
 **/
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/xml'));
app.set('views', __dirname + '/public/views');
app.set('view engine', 'jade');

/**
 *  @note Connect to our PostgreSQL DataBase
 **/
orm.connect('postgres://wytypydxemgfoa:f43Y1im2HXXQP6fgfj2cVQkcs-@ec2-54-75-228-51.eu-west-1.compute.amazonaws.com:5432/d2u3mq2u7lrm87?ssl=true', function(err, db) {
    if (err) { throw err; }
    ormdb = db;
});

/**
 *  @note Get Requests
 **/
app.get('/', function(request, response) {
    response.render('index');
});

var server = app.listen((process.env.PORT || 8080), function () {
    var hostname = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', hostname, port);
});
