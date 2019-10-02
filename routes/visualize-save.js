const express = require('express'),
	router = express.Router(),
	d3 = require('d3'),
	{ JSDOM } = require('jsdom'),
	Canvas = require('canvas'),
	_ = require('lodash'),
	fs = require('fs'),
	readline = require('readline'),
	MeCab = new require('mecab-async'),
	mecab = new MeCab(),
	{ Pool } = require('pg'),
	pool = new Pool({
		user: 'postgres',
		host: 'localhost',
		database: 'cookpad',
		password: 'Kento012',
		port: 5432,
	});

router.get('/', function(req, res, next) {
	var msg = '';

	res.render('visualize', {
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

	let document = new JSDOM().window.document;
	let msg = '';

	const dish_category = fs
		.readFileSync('./routes/dish_category.txt', 'utf8')
		.trim();
	const dish_category_array = dish_category.split(',');

	let dish_category_info = {};
	_.map(dish_category_array, data => {
		dish_category_info[data] = 0;
	});

	const stream = fs.createReadStream('./routes/recipe_id.txt', 'utf8');
	const reader = readline.createInterface({ input: stream });

	try {
		reader.on('line', recipe_id => {
			(async () => {
				const text = `
				select
					title
				from
					recipes
				where
					recipe_id=$1
				;
					`;
				const values = [recipe_id];
				const client = await pool.connect();

				try {
					const result = await client.query(text, values);

					if (result['rowCount'] != 0) {
						let recipe_title = result.rows[0]['title'];

						_.map(dish_category_array, data => {
							let regex_target = data;
							let regexp = new RegExp('.*' + regex_target + '.*');
							if (recipe_title.match(regexp)) {
								dish_category_info[data] += 1;
							}
						});
					} else {
						// console.log('------> 該当するレシピはありませんでした．');
						// res.redirect(302, 'http://localhost:3000/noresult');
					}
				} catch (err) {
					console.log(err.stack);
				} finally {
					client.release();
					// console.log(dish_category_info);

					// res.render('visualize', {
					// 	title: 'Visualization of Recipe Data',
					// 	content: graph,
					// });
				}
			})().catch(e => console.log(e.stack));
		});
	} catch (err) {
		console.log(err);
	} finally {
		//	create graph
		var dataset = [
			['沈黙の戦艦', 6.4],
			['沈黙の要塞', 4.4],
			['暴走特急', 5.4],
			['沈黙の断崖', 5.0],
			['沈黙の陰謀', 4.1],
			['沈黙のテロリスト', 3.5],
			['沈黙の標的', 3.3],
			['沈黙の聖戦', 4.7],
			['沈黙の追撃', 3.8],
			['沈黙の脱獄', 4.2],
			['沈黙の傭兵', 4.2],
			['沈黙の奪還', 4.1],
			['沈黙のステルス', 3.5],
			['沈黙の激突', 2.7],
			['沈黙の報復', 5.4],
			['沈黙の逆襲', 5.2],
			['沈黙の鎮魂歌', 5.2],
			['沈黙の鉄拳', 5.1],
			['沈黙の復讐', 4.6],
			['S・セガール劇場', 4.8],
			['沈黙の監獄', 4.9],
			['沈黙の処刑軍団', 4.6],
			['沈黙のSHINGEKI/進撃', 3.8],
			['沈黙の執行人', 4.7],
			['沈黙の制裁', 4.5],
			['沈黙の作戦', 3.8],
			['沈黙の帝王', 3.2],
			['沈黙の粛清', 4.2],
			['沈黙の銃弾', 3.9],
			['沈黙の包囲網', 3.4],
			['沈黙のアフガン', 3.2],
			['沈黙の激戦', 3.7],
		];

		let svg = d3
			.select(document.body)
			.append('svg')
			.attr('width', 700)
			.attr('height', 100);

		svg
			.selectAll('rect')
			.data(dataset)
			.enter()
			.append('rect')
			.attr('x', function(d, i) {
				// dがデータ、iが添え字
				// 棒グラフの開始点をずらす
				return i * 20;
			})
			.attr('y', 0)
			.attr('width', 20)
			.attr('height', function(d) {
				// データ配列の１コ目を棒グラフの高さとする
				return d[1];
			});

		let graph = document.body.innerHTML;

		console.log(dish_category_info);

		res.render('visualize', {
			title: 'Visualization of Recipe Data',
			content: graph,
		});
	}
});

module.exports = router;
