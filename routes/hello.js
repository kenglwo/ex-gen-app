const express = require('express'),
	router = express.Router(),
	d3 = require('d3'),
	cloud = require('d3-cloud'),
	_ = require('lodash'),
	{ JSDOM } = require('jsdom'),
	Canvas = require('canvas'),
	{ Client } = require('pg');

const client = new Client({
	user: 'postgres',
	host: 'localhost',
	database: 'cookpad',
	password: '5931IT',
	port: 5432,
});

const document = new JSDOM().window.document;
const H = 600;
const W = 600;
const random = d3.randomIrwinHall(2);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

router.get('/', function(req, res, next) {
	async function query(q) {
		await client.connect();
		let res;
		try {
			await client.query('BEGIN');
			try {
				res = await client.query(q);
				console.log('----------> execute query');
				await client.query('COMMIT');
			} catch (err) {
				await client.query('ROLLBACK');
				console.log('This is catch of query');
				throw err;
			}
		} finally {
			console.log('This is finally of query');
			// await client.end()
		}
		return res;
	}

	async function main() {
		try {
			const result = await query(
				' \
            select texture, count(texture) AS count \
            from recipe_texture \
            where recipe_id = \'870e7d67f777deb83dd6e474105ceaec301e092c\' \
            group by texture \
            order by count desc; \
        '
			);

			let temp_texture = [];
			_.forEach(result['rows'], elem => {
				temp_texture.push(elem);
			});

			const countMax = d3.max(d3.values(temp_texture));
			const sizeScale = d3
				.scaleSqrt()
				.domain([0, countMax.count])
				.range([10, 110]);
			const data_array = temp_texture.map(function(d) {
				return {
					text: d.texture,
					count: d.count,
					size: sizeScale(d.count),
				};
			});

			var layout = cloud()
				.size([H, W])
				.words(data_array)
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
				// .spiral("archimedean")
				.random(function() {
					return 0.5;
				})
				.on('end', draw);

			function draw(words) {
				const body = d3
					.select(document.body)
					.append('svg')
					.attr('width', W)
					.attr('height', H)
					.append('g')
					.attr(
						'transform',
						'translate(' +
							layout.size()[0] / 2 +
							',' +
							layout.size()[1] / 2 +
							')'
					)
					.selectAll('text')
					.data(words)
					.enter()
					.append('text')
					.attr('text-anchor', 'middle')
					.style('font-size', function(d) {
						return d.size + 'px';
					})
					.style('font-family', 'Hiragino Kaku Gothic Pro')
					.style('fill', function(d, i) {
						return colorScale(i);
					})
					.style('font-weight', 'bold')
					.attr('text-anchor', 'middle')
					.attr('transform', function(d) {
						return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
					})
					.text(function(d) {
						return d.text;
					});
			}

			const wordcloud = layout.start();
			wordcloud_element = document.body.innerHTML;
			// console.log(wordcloud_element);

			let data = {
				title: 'Test for wordcloud on server side',
				content: wordcloud_element,
			};

			res.render('hello', data, (cache = true));
		} catch (err) {
			// client.end()
			console.log('Error in main() ' + err);
		}
	}

	main();
});

module.exports = router;
