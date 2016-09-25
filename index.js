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
var bodyParser = require('body-parser');
var Feed = require('feed');
var orm = require('orm');
var striptags = require('striptags');

/**
 *  @note custom packages
 */
var Cipher = require('./public/res/js/lib/cipher.js');
var XMLCleaner = require('./public/res/js/lib/XMLCleaner.js');
var DateHelper = require('./public/res/js/lib/datehelper.js');

/**
 * @note GloBal variables
 **/
var ormdb;
var xmlCleaner = new XMLCleaner();

/**
 *  @note for calling js, and css files, etc...
 **/
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/xml'));
app.set('views', __dirname + '/public/views');
app.set('view engine', 'jade');

/**
 *  @note Connect to our MySQL DataBase
 **/
orm.connect('postgres://wytypydxemgfoa:f43Y1im2HXXQP6fgfj2cVQkcs-@ec2-54-75-228-51.eu-west-1.compute.amazonaws.com:5432/d2u3mq2u7lrm87?ssl=true', function(err, db) {
    if (err) { throw err; }
    ormdb = db;
});
/**
 *  @note for parsing query string in url
 **/
app.use(bodyParser.urlencoded({extended: false}));


/**
 *
 *  @note routes...
 *
**/

/**
 *  @note Get Requests
 **/
app.get('/', function(request, response) {
    response.render('index');
});
/**
 *  @note serve a list of blog posts
 */
app.get('/blog', function(request, response) {

});
/**
 *  @note serve a certain blog with id :id
 */
app.get('/blog/:id', function(request, response) {

});
/**
 *  @note serve our generated rss feeds. each item in the rss feed
 *      is generated from our blog posts in the DB
 */
app.get('/rss', function(request, response) {

});

/**
 *  @note view archive of all requests ever made
 **/
app.get('/archive', function(request, response) {
    /**
     *  @note respond with the transformation
     **/
    response.render('archive');
});

/**
*   @note Post Requests
**/

/**
 *  @note perform an encryption request
 **/
app.post('/enc', function(request, response) {

});
/**
 *  @note for removing requests from the database
 **/
app.post('/removerequest/:id', function(request, response) {

});
/**
 *  @note ajax requests for previous requests from user
 **/
app.post('/requests', function(request, response) {

});

/**
 *  @note ajax request to submit comment on blog post
 **/
app.post('/comment', function(request, response) {

});

/**
 *  @note start an instance of the server
 **/
var server = app.listen((process.env.PORT || 80), function () {
    var hostname = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', hostname, port);
});

/**
 *  @param request
 *  @note gets ip address of remote user
 **/
function getIP(request) {
    var ip = (request.headers['x-forwarded-for'] || request.connection.remoteAddress)
    return xmlCleaner.cleanRemoteAddress(ip);
}
