var express = require('express');
var app = express();
var path = require('path');
var http = require('http');

var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });
app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

var lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptate suscipit nihil fugit perspiciatis laboriosam nulla iusto, dicta. Iusto suscipit expedita, rem neque maiores nobis id, nulla, optio, perspiciatis sequi corporis.',
	constants = {
    		tel : '+27834234',
    		address : "melega 5"
    	}
;

app.get('/', function (req, res){
	res.render('page', {
    	title : 'hello CMS',
    	content : lorem,

    	constants : constants,
    	nav : [
    		{ title : 'about', url : "/about"},
    		{ title : 'home', url : "/", active : true }
    	]
    });
});

app.get('/about', function (req, res){
	res.render('page', {
    	title : 'about',
    	content : lorem,

    	constants : constants,
    	nav : [
    		{ title : 'about', url : "/about" , active : true},
    		{ title : 'home', url : "/" }
    	]
    });
});

app.use(express.static(path.join(__dirname, 'public')));

http.createServer(app).listen(3000, function () {
    console.log('Express server listening on port ' + 3000);
});