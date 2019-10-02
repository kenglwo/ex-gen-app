const express = require('express'),
	router = express.Router(),
	url = require('url'),
	_ = require('lodash'),
	MeCab = new require('mecab-async'),
	mecab = new MeCab(),
	{ Pool } = require('pg'),
	{ JSDOM } = require('jsdom');
// const Canvas = require("canvas");

const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'cookpad',
	password: 'Kento012',
	port: 5432,
});
pool.on('error', (err, client) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});

// let document = new JSDOM().window.document;

router.get('/', function(req, res, next) {
	const query = url.parse(req.url, true).query;
	const dish = query.dish;
	const texture = query.texture;
});

function zenkaku2hankaku(val) {
	var regex = /[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g;

	// 入力値の全角を半角の文字に置換
	const value = val
		.replace(regex, function(s) {
			return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
		})
		.replace(/[‐－―]/g, '-') // ハイフンなど
		.replace(/[～〜]/g, '~') // チルダ
		.replace(/　/g, ' '); // スペース

	return value;
}

// function ifCommonWord(array){
// 	const flag = array.some( (value) => { return value === 'ケーキ'; });
// 	return flag
// }
// function recipe_group(isCommonWord, arary){
// 	if(isCommonWord){
// 		const target_index = title_wakachi.indexOf('ケーキ');
// 		return array[target_index - 1];
// 	} else {
// 		pattern = ".*ケーキ$";
// 		const filtered_array = original_array.filter(function(value) { return value.match(/pattern/); });
// 		return filtered_array[0];
// 	}
// }

router.post('/', function(req, res, next) {
	const dish = req.body.dish.trim();
	const texture = req.body.texture.trim();
	console.log(dish, texture);

	let recipe_ids_titles = {};
	let recipe_jsons = [];

	(async () => {
		const client = await pool.connect();

		try {
			const result = await client.query(
				`
				select m.recipe_id, m.title, m.description, m.advice, count(t.texture) as texture_count, count(m.recipe_id) over() as recipe_count
				from (
					select recipe_id, title, description, advice
					from recipes
					where title like $1
					group by recipe_id, title, description, advice
				) as m
				, recipe_texture_445 as t
				where m.recipe_id = t.recipe_id
				and t.texture = $2
				group by m.recipe_id, m.title, m.description, m.advice
				having count(t.texture) > 10
				order by count(t.texture) desc
				;`,
				['%' + dish + '%', texture]
			);
			// limit 10 ;`, ['%'+dish+'%', texture]);

			if (result['rowCount'] != 0) {
				console.log(
					'------> 検索結果: ' + result['rows'][0]['recipe_count'] + '件'
				);
			} else {
				console.log('------> 該当するレシピはありませんでした．');
				res.redirect(302, 'http://localhost:3000/noresult');
			}

			_.forEach(result['rows'], elem => {
				let recipe_title = zenkaku2hankaku(elem['title']);

				recipe_ids_titles[elem['recipe_id']] = recipe_title;
				const description = elem['description'].trim();
				// const advice = elem["advice"].trim();
				const advice = elem['advice'] != null ? elem['advice'].trim() : null;

				// const target_title = recipe_title.replace(/[のな（）\(\)]/g, '');
				const target_title = recipe_title.replace(')', '').replace('(', '');
				const title_wakachi = mecab.wakachiSync(target_title, function(
					err,
					result
				) {
					if (err) throw err;
					return result;
				});

				const commonFlag = title_wakachi.some(value => {
					return value === dish;
				});
				let recipe_group = '';

				if (commonFlag) {
					const target_index = title_wakachi.indexOf(dish);
					if (target_index != 0) {
						recipe_group = title_wakachi[target_index - 1]; //料理名の前の名詞!
					} else {
						recipe_group = 'others';
					}
				} else {
					let regex_target = dish;
					let regexp = new RegExp('.*' + regex_target + '.*');
					const filtered_array = title_wakachi.filter(function(value) {
						return value.match(regexp);
					});
					recipe_group = 'others';
				}

				// console.log(recipe_group);

				let recipe_info = {
					recipe_id: elem['recipe_id'],
					title: recipe_title,
					cluster_group: recipe_group,
					description: description,
					advice: advice,
					recipe_count: elem['recipe_count'],
					texture_count: elem['texture_count'],
				};

				recipe_jsons.push(recipe_info);
			});
		} finally {
			client.release();
			// render_wordcloud(recipe_jsons, dish, texture, c_index);
			let classified_array = _.groupBy(recipe_jsons, 'cluster_group');
			// let classified_array = _(recipe_jsons)
			// 						   .groupBy('cluster_group')
			// 						   .sortBy(function(value){ return  ; })
			// 						   .value();

			// console.log(classified_array);

			let cluster_data = {};

			for (var key in classified_array) {
				const recipe_num = Object.keys(classified_array[key]).length;
				classified_array[key]['cluster_count'] = recipe_num;
			}

			let temp_array = _.orderBy(
				classified_array,
				function(value) {
					return Object.keys(value).length;
				},
				'desc'
			);
			let orderd_cluster_group = _.map(temp_array, function(recipe) {
				return recipe[0]['cluster_group'];
			});

			for (var cluster_group of orderd_cluster_group) {
				const key = '"' + cluster_group + '"';
				cluster_data[key] = [];
			}

			for (var recipes of temp_array) {
				for (var recipe of recipes) {
					// console.log(recipe);
					const cluster_group = '"' + recipe['cluster_group'] + '"';
					cluster_data[cluster_group].push(recipe);
				}
			}

			res.render('overview', {
				title: 'Overview of Resipe Result',
				subtitle: 'cluster of recipes',
				content: cluster_data,
				dishname: dish,
				texture: texture,
			});
		}
	})().catch(e => console.log(e.stack));

	// res.render('overview', recipe_jsons);
});

module.exports = router;
