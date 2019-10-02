var express = require('express'),
	router = express.Router();

router.get('/', function(req, res, next) {
	let msg = 'no recipe found ...';

	res.render('noresult', {
		title: 'みんなの食感 View',
		message: msg,
	});
});

module.exports = router;
