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
    /**
     *  @note define our blog post model
     **/
    var post = ormdb.define('blog', {
        id: Number,
        title: String,
        description: String
    });
    /**
     *  @note find all blog posts and sort accordingly
     **/
    post.find({}, ["id", "Z"], function(error, posts) {
        response.render('blog', {posts: posts});
    });
});
/**
 *  @note serve a certain blog with id :id
 */
app.get('/blog/:id', function(request, response) {
    /**
     *  @note define our blog post model
     **/
    var post = ormdb.define('blog', {
        id: Number,
        title: String,
        description: String
    });
    /**
     *  @note define our comment model
     **/
    var comment = ormdb.define('comments', {
        id: Number,
        body: String,
        posted: Date,
        post: Number,
        comment: Number
    });
    /**
     *  @note find post with given id
     **/
    post.find({id: request.params.id}, 1, function(error, post) {
        /**
         *  @note make sure there are no errors returned from query
         **/
        if (!error) {
            /**
             *  @note find all comments whos post attribute {FK} matches the posts id attribute {PK}
             **/
            comment.find({post: request.params.id}, ["posted", "Z"], function(error, comments) {
                /**
                 *  @note again checking for errors. Always checking for errors :-)
                 **/
                if (!error) {
                    /**
                     *  @note if it's a valid post, render the post with the post
                     *      details and list of comments
                     **/
                    response.render('post', {post: post[0], comments: comments});
                }
            });
        } else {
            /**
             *  @note render our error page 404
             **/
            response.render('error', {});
        }
    });
});
/**
 *  @note serve our generated rss feeds. each item in the rss feed
 *      is generated from our blog posts in the DB
 */
app.get('/rss', function(request, response) {
    /**
     *  @note create our main RSS feed
     **/
    var feed = new Feed({
        title: 'Cipher-com RSS Feed.',
        description: 'RSS feed to track the development stage of Cipher-com',
        link: 'https://cipher-natedrake13.c9users.io',
        image: 'https://cipher-natedrake13.c9users.io/res/img/brand_logo_new.png'
    });
    /**
     *  @note define our post model
     **/
    var post = ormdb.define('blog', {
        id: Number,
        title: String,
        description: String
    });
    /**
     *  @note get all posts in our blog
     **/
    post.find({id: orm.gte(1)}, function(error, posts) {
        /**
         *  @note iterate through the posts
         **/
        for(var key in posts) {
            /**
             *  @note add each post as an item in our RSS feed
             **/
            feed.addItem({
                title: posts[key].title,
                description: posts[key].description,
                link: 'https://cipher-natedrake13.c9users.io/blog/' + posts[key].id
            });
        }
        /**
         *  @note set appropriate headers and send the RSS xml data
         **/
         response.set('Content-Type', 'application/rss+xml');
        response.send(xmlCleaner.cleanRSS(feed.render('rss-2.0')));
    });
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
    /**
     *  @note Define the model of our encryption request object
     **/
    var entry = ormdb.define('requests', {
        id: Number,
        original: String,
        encrypted: String,
        requested: Date,
        ip: String
    });
    /**
     *  @note Create the cipher object, used to encrypt the submitted text
     **/
    var cipher = new Cipher(striptags(request.body.inputtext));
    var encryptedText = '';
    /**
     *  @note check which cipher was selected in request
     **/
    switch(request.body.cipherinput) {
        case 'cae':
            cipher.setOffset(3);
            encryptedText = cipher.caesar();
            break;
        case 'vig':
            encryptedText = cipher.vigenere(request.body.cipherkey);
            break;
        default:
            break;
    }
    /**
     *  @note make sure the user has submitted data
     **/
    if (request.body.inputtext.length >= 1) {
        /**
         *  @note if user submitted data, save it
         **/
        entry.create({
            original: request.body.inputtext,
            encrypted: encryptedText,
            requested: new Date(),
            ip: getIP(request)
        }, function(err, results) {
            if (err) { throw err; }
            updateXML();
        });
        /**
         *  @note send XHTML back to the user
         **/
        response.send(encryptedText);
    } else {
        /**
         *  @note No data submitted to the server
         **/
        response.send('No data submitted, please try again.');
    }
});
/**
 *  @note for removing requests from the database
 **/
app.post('/removerequest/:id', function(request, response) {
    /**
     *  @note define the model of our encryption request object
     **/
    var entry = ormdb.define('requests', {
        id: Number,
        original: String,
        encrypted: String,
        requested: Date,
        ip: String
    });
    /**
     *  @note make sure the id of the post is submitted
     **/
    if (request.params.id) {
        /**
         *  @note find the entry and delete it
         **/
        entry.find({id: request.params.id}).remove(function(error) {
            if (error) { throw error; }
            /**
             *  @note re-write our historical XML data
             **/
            updateXML();
            response.send('200');
        });
    } else {
        /**
         *  @note send errors. There's always errors :-)
         **/
        response.send('No data submitted, please try again.');
    }
});
/**
 *  @note ajax requests for previous requests from user
 **/
app.post('/requests', function(request, response) {
    /**
     *  @note define our request entry model
     **/
    var entry = ormdb.define('requests', {
        id: Number,
        original: String,
        encrypted: String,
        requested: Date,
        ip: String
    });
    /**
     *  @note search the requests relation for any row with an
     *      ip attribute that matches the users ip address
     **/
    entry.find({ip: getIP(request)}, 5, ["id", "Z"], function(error, results) {
        /**
         *  @note always safe to check for errors
         **/
        if (!error) {
            /**
             *  @note check if the user has ever made a request using their current ip address
             **/
            if (!results.length) {
                /**
                 *  @note results, return message to user
                 **/
                response.send('<div class="empty-table">No recent requests. Please submit a request!</div>');
            } else {
                /**
                 *  @note there are some results from the table
                 **/
                var requests = {requests:[]};
                for(var key in results) {
                    /**
                     *  @note iterate through each request and add it to our json string
                     **/
                    requests.requests.push({
                        request: ((results[key]))
                    });
                }

                /**
                 *  @note send the transformed XHTML
                 **/
                //response.send();
            }
        }
    });
});

/**
 *  @note ajax request to submit comment on blog post
 **/
app.post('/comment', function(request, response) {
    /**
     *  @note create a model of our comments table
     **/
    var comment = ormdb.define('comments', {
       id: Number,
       body: String,
       posted: Date,
       post: Number,
       comment: Number
    });
    /**
     *  @note check if the comment body is submitted
     **/
    if (typeof(request.body.comment) !== undefined) {
        /**
         *  @note make sure the comment body contains content
         *      no XSS sanitation. (very insecure)
         **/
        if (request.body.body.length >= 1 ) {
            /**
             *  @note add the comment to the database
             **/
            comment.create({
                body: striptags(request.body.body),
                posted: new Date(),
                post: striptags(request.body.postid)
            }, function(err, results) {
                /**
                 *  @note throw any errors with the insert
                 **/
                if (err) { throw err; }
            });
        }
    }
});

function updateXML() {
    /**
     *  @note model of our requests table
     **/
    var entry = ormdb.define('requests', {
        id: Number,
        original: String,
        encrypted: String,
        requested: Date,
        ip: String
    });

    entry.find({}, function(error, results) {
        /**
         *  @note throw any errors
         **/
        if (error)  { throw error; }

        /**
         *  @note check if the requests.xml file exists
        **/
    });
}

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
