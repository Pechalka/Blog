var express = require('express');
var app = express();
var path = require('path');
var http = require('http');

var bodyParser = require('body-parser')
app.use(bodyParser.json());


var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });
app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);


var cms = require('./src/cms');

app.get('/', function (req, res){
    cms.loadPage(null, function(e, result){
        res.render(result.template, result);
    })
});

app.get('/pages/:id', function (req, res){
	cms.loadPage(req.params.id, function(e, result){
        res.render(result.template, result);
    })
});

var Storage = require('./src/Storage');
Storage('pages').makeREST(app, '/api/pages');
Storage('blocks').makeREST(app, '/api/blocks');



app.use(express.static(path.join(__dirname, 'public')));

http.createServer(app).listen(3000, function () {
    console.log('Express server listening on port ' + 3000);
});