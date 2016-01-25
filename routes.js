'use strict';
var router;

var mongo = require('./mongo');
var body_parser = require('body-parser');
var express = require('express');
var account = require('./account.json');

function extractUserName(req) {
	if (!req.headers.authorization) {
			return null;
	}
	var auth = req.headers.authorization.replace(/^Basic /, '');
	var loginInfo = (new Buffer(auth, 'base64')).toString('utf-8').split(':');
	return loginInfo[0];
}

function basicAuthenticate(req, res, next) {
	var auth,
	    login;
	
	if (!req.headers.authorization) {
		return authenticate(res);
	}
	
	console.log('req.headers.authorization:' + req.headers.authorization);
	auth = req.headers.authorization.replace(/^Basic /, '');
	auth = (new Buffer(auth, 'base64')).toString('utf-8');
	login = auth.split(':');

	if (account[login[0]] && account[login[0]] === login[1]) {
			next();
	} else {
			authenticate(res);
	}
}
		
function authenticate(res) {
		var realm = "test";
		res.writeHead(401, {
				'WWW-Authenticate': 'Basic realm="' + realm + '"'
		});
		return res.end('Basic authorization');
}

router = function(app, server) {
	app.use(basicAuthenticate);
	app.use(body_parser.urlencoded({ extended: false }));
	app.use(body_parser.json());
	app.use(express.static(__dirname + '/public'));	
	
	app.all('/*', function(req, res, next) {
		res.contentType('json');
		res.header('Access-Control-Allow-Origin', '*');
		next();
	});
	app.get('/', function(req, res) {
		res.redirect('/index.html');
	});
	app.get('/diary?', function(req, res) {
		var criteria = { user : extractUserName(req)};
		for( var props in req.query) {
			if (req.query.hasOwnProperty(props)) {
				console.log(req.query[props]);
				criteria[props] = req.query[props];
			}
		}
		console.log("criteria : " + criteria);
		mongo.find('diary', criteria, {}, function(list) { res.json(list);});
	});	
	app.get('/diary/:_date', function(req, res) {
		mongo.find('diary', { user: extractUserName(req) , date: req.params._date }, {}, 
			function(list) {
				res.json(list);
			}
		);
	});
	app.get('/template/:_templateName', function(req, res) {
		mongo.find('template', { user: extractUserName(req) , templateName : req.params._templateName}, {},
			function(list) {
				res.json(list);
			}
		);
	});
	app.get('/template?', function(req, res) {
		var criteria = { user : extractUserName(req)};
		for( var props in req.query) {
			if (req.query.hasOwnProperty(props)) {
				console.log(req.query[props]);
				criteria[props] = req.query[props];
			}
		}
		console.log("criteria : " + criteria);
		mongo.find('template', criteria, {}, function(list) { res.json(list);});
	});	

	app.post('/diary', function(req, res) {
		var criteria = {
				user: extractUserName(req), 
				date: req.body.date
		};
		var data = req.body;
		data.user = extractUserName(req);

		mongo.update('diary', criteria, req.body, { upsert : true} , function(result) { res.send(result);});
	});

	app.post('/template', function(req, res) {
		//重複チェックが必要
		console.log(req.body);
		var criteria = { 
			user: extractUserName(req), 
			templateName: req.body.templateName
		};
		var data = req.body;
		data.user = extractUserName(req);

		mongo.update('template', criteria, req.body, { upsert : true}, function(result) { res.send(result);});
	});
	
	app.get('/goal/:_type(year\|month\|week\|day\|other)/:_date', function(req,res) {
		console.log("get goal invoked");
		console.log(req.params);
		mongo.find('goal', { user : extractUserName(req) , type: req.params._type, date: req.params._date }, {}, 
			function(list) {
				res.json(list);
			}
		);
	});

	app.get('/goal?', function(req,res) {
		var criteria = { user : extractUserName(req)};
		for( var props in req.query) {
			if (req.query.hasOwnProperty(props)) {
				console.log(req.query[props]);
				criteria[props] = req.query[props];
			}
		}
		console.log("criteria : " + criteria);
		mongo.find('goal', criteria, {}, function(list) { res.json(list);});
	});

	app.get('/goal/:_type(year\|month\|week\|day\|other)?', function(req,res) {
		console.log("get goal invoked");
		var criteria = { user : extractUserName(req), type: req.params._type };
		for( var props in req.query) {
			if (req.query.hasOwnProperty(props)) {
				console.log(req.query[props]);
				criteria[props] = req.query[props];
			}
		}
		mongo.find('goal', criteria , {}, 
			function(list) {
				res.json(list);
			}
		);
	});

	app.post('/goal', function(req, res) {
		console.log("goal post invoked");
		if (Array.isArray(req.body)) {
			    var	user = extractUserName(req);
				var ids = req.body.map(function(val) {return val._id;});
				var dataSet = req.body.map(function(val) { val.user = user; return val});

				mongo.deleteMany('goal', { _id : { $in : ids}}, function(result) {
						mongo.insert('goal', dataSet, {}, function(result) {
								res.send(result);
						});
				});
		} else {
				var criteria = {
						user: extractUserName(req), 
						date: req.body.date
				};
				var data = req.body;
				data.user = extractUserName(req);
				mongo.update('goal', criteria, data , { upsert : true}, function(result) { res.send(result);});
		}
	});
	
	app.delete('/goal', function(req, res) {
		console.log("goal delete invoked");
		console.log("req.body : " + req.body);
		mongo.deleteMany('goal', req.body, function(result) { res.send(result)});
	});	

	app.delete('/template', function(req, res) {
		console.log("template delete invoked");
		mongo.deleteMany('template', req.body,function(result) { res.send(result)});
	});

	app.delete('/diary', function(req, res) {
		console.log("template delete invoked");
		mongo.deleteMany('template', req.body,function(result) { res.send(result)});
	});
}

module.exports = { router: router};
