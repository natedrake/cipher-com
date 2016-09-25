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

/**
 *  @note for calling js, and css files, etc...
 **/
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/xml'));
app.set('views', __dirname + '/public/views');
app.set('view engine', 'jade');

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
