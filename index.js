var $express = require('express');
var $app = $express();



$app.use($express.static(__dirname+'/public'));
$app.set('views', __dirname+'/public/views');
$app.set('view engine', 'jade');

/**
 *  @note GET requests
 **/

$app.get('/', function($request, $response) {
    $response.render('index');
});

var $server = $app.listen((process.env.PORT || 80), function() {
    var $hostname = $server.address().address;
    var $port = $server.address().port;
    console.log("App listening at http://%s:%s", $hostname, $port);
})
