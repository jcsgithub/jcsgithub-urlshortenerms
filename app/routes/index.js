'use strict';

var path = process.cwd();
var Urls = require('../models/urls.js');

module.exports = function (app) {
	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/:short_url')
		.get(function (req, res) {
			Urls
	            .findOne({ 'short_url': req.params.short_url })
	            .select('-_id -__v')
	            .exec(function (err, result) {
	                if (err) { throw err; }
	                
	                if (!result) {
	                	res.status(400).send({ error: "Short URL not found in the database." });
	                } else {
	                	res.redirect(result.original_url);
	                }
	            });
		});
		
	app.route('/new/*')
		.get(function (req, res) {
			var url = req.params[0];
			
			var regExp = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
			if (!regExp.test(url)) { 
				res.status(400).send({ error: "Invalid URL format. Make sure you have a valid protocol and real site." });
			} else {
				Urls
		            .findOne({ 'original_url': url })
		            .select('-_id -__v')
		            .exec(function (err, result) {
		                if (err) { throw err; }
		                
		                if (!result) {
		                	var short_url = randomString(15);
				
							var newUrl = new Urls();
					        newUrl.original_url = url;
					        newUrl.short_url = short_url;
							newUrl.save(function (err) {
								if (err) { throw err; }
								
								res.status(200).send({ original_url: url, short_url: short_url });
							});
		                } else {
		                	res.status(200).send(result);
		                }
		            });
			}
		});
};

function randomString (length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}