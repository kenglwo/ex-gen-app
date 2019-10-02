var express = require('express'),
	router = express.Router();

router.get('/', function(req, res, next) {
	var msg = '';

	res.render('react', {
		title: 'React.js',
		content: msg,
	});
});

module.exports = router;
