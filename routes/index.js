var express = require('express'),
	router = express.Router();

router.get('/', function(req, res, next) {
	var msg = '';

	res.render('index', {
		title: 'みんなの食感 View',
		content: msg,
	});
});

module.exports = router;
