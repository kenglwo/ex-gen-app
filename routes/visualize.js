const express = require('express'),
	router = express.Router(),
	dish_category_module = require('./dish_category.js'),
	remain_ingre = require('./remain_ingre.js'),
	_ = require('lodash'),
	fs = require('fs'),
	readline = require('readline'),
	MeCab = new require('mecab-async'),
	mecab = new MeCab(),
	{ Pool } = require('pg'),
	pool = new Pool({
		user: 'postgres',
		host: '10.83.53.106',
		database: 'postgres',
		password: '5931IT',
		port: 5432,
	});

router.get('/', function(req, res, next) {
	var msg = '';

	res.render('visualize-index', {
		title: 'Visualization of Recipe Data',
		content: msg,
	});
});

router.post('/', function(req, res, next) {
	const dishName = req.body.dishName;
	const mustIngre = req.body.mustIngre.split(' ');
	const optionalIngre = req.body.optionalIngre;
	const excludeIngre = req.body.excludeIngre;
	const seasoning = req.body.seasoning;

	const dish_category = fs
		.readFileSync('./routes/dish_category.txt', 'utf8')
		.trim();
	const dish_category_array = dish_category.split(',');

	let dish_category_info = {};
	_.map(dish_category_array, data => {
		dish_category_info[data] = {};
		dish_category_info[data]['recipe_ids'] = [];
		dish_category_info[data]['recipe_count'] = 0;
		dish_category_info[data]['posted_date'] = [];
		dish_category_info[data]['num_of_steps'] = [];
		dish_category_info[data]['num_of_ingredients'] = [];
		dish_category_info[data]['num_of_reviews'] = 0;
	});

	const stream = fs.readFileSync('./routes/recipe_id.txt', 'utf8').trim();
	const recipe_id_array = stream.split('\n');

	const recipe_count = recipe_id_array.length;
	let count = 0;
	_.map(recipe_id_array, recipe_id => {
		(async () => {
			const text = `
				with steps_view as (
					select
						recipe_id
						, count(*)::int as num_of_steps
					from
						steps
					where
						recipe_id=$1
					group by recipe_id
				), ingredients_view as (
					select
						recipe_id
						, count(*)::int as num_of_ingredients
					from
						ingredients
					where
						recipe_id=$1
					group by recipe_id
				)

				select
					title
					, to_char(published_at, 'YYYY-mm') as posted_date
					, num_of_steps
					, num_of_ingredients
				from
					recipes
					inner join steps_view using (recipe_id)
					inner join ingredients_view using (recipe_id)
				where
					recipe_id=$1
				;
			`;

			const text2 = `
				select
					count(*)::int as num_of_reviews
				from (
					select
						count(*)
					from
						tsukurepos
					where
						recipe_id=$1
					group by recipe_id
				) as tmp
				;
			`;
			const values = [recipe_id];
			const client = await pool.connect();

			try {
				const result = await client.query(text, values);
				const result2 = await client.query(text2, values);

				if (result['rowCount'] != 0) {
					const recipe_title = result.rows[0]['title'];
					const posted_date = result.rows[0]['posted_date'];
					const num_of_steps = result.rows[0]['num_of_steps'];
					const num_of_ingredients = result.rows[0]['num_of_ingredients'];
					const num_of_reviews = result2.rows[0]['num_of_reviews'];

					for (const dish of dish_category_array) {
						// _.map(dish_category_array, data => {
						let regexp = new RegExp('.*' + dish + '.*');
						if (recipe_title.match(regexp)) {
							dish_category_info[dish]['recipe_ids'].push(recipe_id);
							dish_category_info[dish]['recipe_count'] += 1;
							dish_category_info[dish]['posted_date'].push(posted_date);
							dish_category_info[dish]['num_of_steps'].push(num_of_steps);
							dish_category_info[dish]['num_of_ingredients'].push(
								num_of_ingredients
							);
							dish_category_info[dish]['num_of_reviews'] += num_of_reviews;
						}
					}
				} else {
					// console.log('------> 該当するレシピはありませんでした．');
					// res.redirect(302, 'http://localhost:3000/noresult');
				}
				count += 1;
			} catch (err) {
				console.log(err.stack);
			} finally {
				client.release();

				if (count == recipe_count) {
					// console.log(dish_category_info);
					const dish_category_svg = dish_category_module.render_svg(
						dish_category_info
					);

					const remain_ingre_svg = remain_ingre.render_svg(dish_category_info);

					res.render('visualize', {
						title: 'Visualization of Recipe Data',
						dish_category_left: dish_category_svg['left'],
						dish_category_right: dish_category_svg['right'],
						remain_ingre_left: remain_ingre_svg['left'],
						remain_ingre_right: remain_ingre_svg['right'],
					});
				}
			}
		})().catch(e => console.log(e.stack));
	});
});

module.exports = router;
