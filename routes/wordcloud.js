const express = require('express');
const router = express.Router();
const d3 = require('d3');
const cloud = require('d3-cloud');
const _ = require('lodash');
const Aigle = require('aigle');
Aigle.mixin(_); // make functions of lodash asynchronously
const { JSDOM } = require('jsdom');
var Canvas = require('canvas');

const { Pool } = require('pg');
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

const document = new JSDOM().window.document;

const W = 600;
const H = 600;
const random = d3.randomIrwinHall(2);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

class WordCloud {
	constructor(data_array, recipe_title) {
		this.recipe_title = recipe_title;
		const countMax = d3.max(d3.values(data_array));
		const sizeScale = d3
			.scaleSqrt()
			.domain([0, countMax.count])
			.range([10, 110]);
		const words = data_array.map(function(d) {
			return {
				text: d.texture,
				count: d.count,
				size: sizeScale(d.count),
			};
		});

		this.layout = cloud()
			.size([W, H])
			// .words(data_array)
			.words(words)
			.padding(5)
			.rotate(function() {
				return Math.round(1 - random()) * 1;
			})
			.font('Impact')
			.fontSize(function(d) {
				return d.size;
			})
			.canvas(function() {
				return Canvas.createCanvas(1, 1);
			})
			.spiral('archimedean')
			.random(function() {
				return 0.5;
			})
			.on('end', draw);

		function draw(words) {
			const svg = d3.select(document.body).append('svg');

			svg
				.append('circle')
				.attr('cx', H / 2)
				.attr('cy', W / 2)
				.attr('r', 270)
				.attr('fill', 'lemonchiffon')
				.attr('stroke-width', 3)
				.attr('stroke', 'wheat');

			svg
				.append('text')
				.attr('x', H / 2 - 100)
				.attr('y', W)
				// .style("text-anchor", "middle")
				.text(recipe_title);

			svg
				.attr('width', W)
				.attr('height', H)
				.append('g')
				.attr('transform', 'translate(' + H / 2 + ',' + W / 2 + ')')
				.selectAll('text')
				.data(words)
				.enter()
				.append('text')
				.attr('text-anchor', 'middle')
				.style('font-size', function(d) {
					return d.size + 'px';
				})
				.style('font-family', 'Impact')
				.style('fill', function(d, i) {
					return colorScale(i);
				})
				.attr('text-anchor', 'middle')
				.attr('transform', function(d) {
					return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
				})
				.text(function(d) {
					return d.text;
				});
		}
	}
}

// router.get('/', function(req, res, next) {
//
//   let data = {
//       title: 'data result',
//       content: 'これはGETリクエストで送ったwordcloud.html'
//   };
//   res.render('wordcloud', data);
//
// });

router.post('/', function(req, res, next) {
	console.log(req.body);

	let wordcloud_element = '';
	let each_counter = 0;
	recipe_ids = _.without(Object.values(req.body), '').reverse();
	const counter = Object.keys(recipe_ids).length - 1;

	console.log('-----> 処理するrecipe_id: ', recipe_ids);
	_.each(recipe_ids, recipe_id => {
		(async () => {
			console.log('-----> now: ', recipe_id);

			const client = await pool.connect();

			try {
				const result = await client.query(
					`
                    select texture, count(texture) AS count
                    from recipe_texture
                    where recipe_id = $1
                    group by texture
                    order by count desc;`,
					[recipe_id]
				);

				let temp_texture = [];
				_.forEach(result['rows'], elem => {
					temp_texture.push(elem);
				});

				const q = await client.query(
					`
                    select title from recipes
                    where recipe_id = $1
                    `,
					[recipe_id]
				);
				const recipe_title = q.rows[0].title;
				console.log(recipe_title);

				const newObj = new WordCloud(temp_texture, recipe_title);
				const wordcloud = newObj.layout.start();

				wordcloud_element = document.body.innerHTML;
			} finally {
				client.release();

				if (each_counter == counter) {
					// console.log('------> ここでrenderする  ', wordcloud_element);
					let data = {
						title: 'POST request from index.html',
						content: wordcloud_element,
					};

					res.render('hello', data);
				}
				each_counter += 1;
			}
		})().catch(e => console.log(e.stack));
	}); // the end of _.each
});

module.exports = router;
