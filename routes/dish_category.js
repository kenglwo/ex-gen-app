const d3 = require('d3'),
	{ JSDOM } = require('jsdom'),
	_ = require('lodash');

let document = new JSDOM().window.document;

function render_svg(dish_category_info) {
	// const container_width = d3
	// 	.select('#dish_category_left_container')
	// 	.attr('width');
	// console.log(container_width);

	const colors = d3.scaleOrdinal(d3.schemeSet3);

	var size = { width: 15, height: 300 };
	var margin = { top: 10, bottom: 10, right: 10, left: 30 };

	//dataset for stacked bar chart
	var dataset = [
		{
			焼きそば: 34,
			炒め: 64,
			蒸し: 46,
			鍋: 69,
			丼: 22,
			お好み焼き: 102,
			うどん: 20,
			ラーメン: 4,
			パスタ: 8,
			スープ: 9,
		},
	];

	let y_max = 0;
	let key_array = [];
	for (const key in dataset[0]) {
		key_array.push(key);
		y_max += dataset[0][key];
	}

	const stack = d3.stack().keys(key_array);

	//データを積み上げた状態の配列を作る。
	const series = stack(dataset);

	//xスケールを作成
	var xScale = d3
		.scaleBand()
		.domain(d3.range(dataset.length))
		.range([0, size.width])
		.paddingInner(0.05);

	//yスケールでは、バーの高さの最大値を計算する。

	var yScale = d3
		.scaleLinear()
		.domain([0, y_max])
		.range([0, size.height]);

	const svg_dish_category = d3
		.select(document.body)
		.append('svg')
		.attr('width', size.width)
		.attr('height', size.height);

	// 行ごとのデータのためにグループを作成
	const groups = svg_dish_category
		.selectAll('g')
		.data(series)
		.enter()
		.append('g')
		.style('fill', function(d, i) {
			return colors(i);
		});

	const rects = groups
		.selectAll('rect')
		.data(function(d) {
			return d;
		})
		.enter()
		.append('rect')
		.attr('x', function(d, i) {
			return xScale(i);
		})
		.attr('y', function(d) {
			return yScale(d[0]); //バーの下辺のy座標
		})
		.attr('width', xScale.bandwidth())
		.attr('height', function(d) {
			return yScale(d[1]) - yScale(d[0]); // 高さを計算
		});

	// recipe_posted_graph

	let posted_date_info = {};
	let tmp_json = {};

	for (const key in dish_category_info) {
		if (!posted_date_info[key]) posted_date_info[key] = [];

		const posted_date_array = dish_category_info[key]['posted_date'].sort();

		tmp_json[key] = {};

		_.forEach(posted_date_array, value => {
			const posted_year = value.split('-')[0];

			const data = { date: posted_year, value: 1 };

			// posted_date_info[key].push(data);

			if (tmp_json[key][posted_year]) {
				tmp_json[key][posted_year] += 1;
			} else {
				tmp_json[key][posted_year] = 1;
			}
		});
	}

	for (const key in tmp_json) {
		const date_values = tmp_json[key];

		for (const date in date_values) {
			// console.log(`${key} : ${date}, ${data[date]}`);
			const date_value_json = { date: date, value: date_values[date] };
			posted_date_info[key].push(date_value_json);
		}
	}

	// console.log(posted_date_info['お好み焼き']);
	// console.log(posted_date_info);

	var dataset;

	var size = { width: 220, height: 300 };
	var margin = { top: 10, bottom: 40, right: 10, left: 40 };

	// 2. SVG領域の設定
	var svg = d3
		.select(document.body)
		.append('svg')
		.attr('width', size.width)
		.attr('height', size.height);

	var timeparser = d3.timeParse('%Y');
	dataset = posted_date_info['お好み焼き'].map(function(d) {
		return { date: timeparser(d.date), value: d.value };
	});

	var xScale = d3
		.scaleTime()
		.domain([
			d3.min(dataset, function(d) {
				return d.date;
			}),
			d3.max(dataset, function(d) {
				return d.date;
			}),
		])
		.range([margin.left, size.width - margin.right]);

	var yScale = d3
		.scaleLinear()
		.domain([
			0,
			d3.max(dataset, function(d) {
				return d.value;
			}),
		])
		.range([size.height - margin.bottom, margin.top]);

	var axisx = d3
		.axisBottom(xScale)
		.ticks(4)
		.tickFormat(d3.timeFormat('%Y'));

	var axisy = d3.axisLeft(yScale);

	svg
		.append('g')
		.attr(
			'transform',
			'translate(' + 0 + ',' + (size.height - margin.bottom) + ')'
		)
		.call(axisx)
		.append('text')
		.attr('fill', 'black')
		.attr('x', (size.width - margin.left - margin.right) / 2 + margin.left)
		.attr('y', 30)
		.attr('text-anchor', 'middle')
		.attr('font-size', '7pt')
		.attr('font-weight', 'bold')
		.text('posted year');

	svg
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
		.call(axisy)
		.append('text')
		.attr('fill', 'black')
		.attr('x', -(size.height - margin.top - margin.bottom) / 2 - margin.top)
		.attr('y', -25)
		.attr('transform', 'rotate(-90)')
		.attr('text-anchor', 'middle')
		.attr('font-weight', 'bold')
		.attr('font-size', '7pt')
		.text('recipes');

	let loop_index = 0;
	for (const key in posted_date_info) {
		// posted_date_info.forEach((key, index) => {
		// dataset = dataset.map(function(d) {
		dataset = posted_date_info[key].map(function(d) {
			return { date: timeparser(d.date), value: d.value };
		});

		var line = d3
			.line()
			.x(d => {
				return xScale(d.date);
			})
			.y(d => {
				return yScale(d.value);
			});

		svg
			.append('path')
			.datum(dataset)
			.attr('fill', 'none')
			.style('stroke', function(d) {
				return colors(loop_index);
			})
			.attr('stroke-linejoin', 'round')
			.attr('stroke-linecap', 'round')
			.attr('stroke-width', 1.5)
			.attr('d', line);

		loop_index += 1;
	}

	const dish_category_left = document.body.innerHTML;
	document = new JSDOM().window.document;

	// step_ingre_graph

	var dataset = [];

	for (const key in dish_category_info) {
		var steps_ingre_array = [];
		const average_steps = _.chain(dish_category_info[key]['num_of_steps'])
			.mean()
			.round(0)
			.value();

		const average_ingredients = _.chain(
			dish_category_info[key]['num_of_ingredients']
		)
			.mean()
			.round(0)
			.value();

		steps_ingre_array.push(average_steps);
		steps_ingre_array.push(average_ingredients);
		dataset.push(steps_ingre_array);
	}

	var width = 246;
	var height = 175;
	var margin = { top: 20, bottom: 30, right: 10, left: 40 };

	var svg = d3
		.select(document.body)
		.append('svg')
		.attr('width', width)
		.attr('height', height);

	var xScale = d3
		.scaleLinear()
		.domain([
			d3.min(dataset, function(d) {
				return d[0];
			}),
			d3.max(dataset, function(d) {
				return d[0];
			}),
		])
		.range([margin.left, width - margin.right]);

	var yScale = d3
		.scaleLinear()
		.domain([
			d3.min(dataset, function(d) {
				return d[1];
			}),
			d3.max(dataset, function(d) {
				return d[1];
			}),
		])
		.range([height - margin.bottom, margin.top]);

	// 4. 軸の表示
	var axisx = d3.axisBottom(xScale).ticks(5);
	var axisy = d3.axisLeft(yScale).ticks(5);

	svg
		.append('g')
		.attr('transform', 'translate(' + 0 + ',' + (height - margin.bottom) + ')')
		.call(axisx)
		.append('text')
		.attr('fill', 'black')
		.attr('x', (width - margin.left - margin.right) / 2 + margin.left)
		.attr('y', 28)
		.attr('text-anchor', 'middle')
		.attr('font-size', '7pt')
		.attr('font-weight', 'bold')
		.text('ingredients');

	svg
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
		.call(axisy)
		.append('text')
		.attr('fill', 'black')
		.attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top)
		// .attr('x', -50)
		.attr('y', -30)
		.attr('transform', 'rotate(-90)')
		.attr('text-anchor', 'middle')
		.attr('font-weight', 'bold')
		.attr('font-size', '7pt')
		.text('cooking steps');

	// 5. プロットの表示
	svg
		.append('g')
		.selectAll('circle')
		.data(dataset)
		.enter()
		.append('circle')
		.attr('cx', function(d) {
			return xScale(d[0]);
		})
		.attr('cy', function(d) {
			return yScale(d[1]);
		})
		.attr('r', 4)
		.style('fill', function(d, i) {
			return colors(i);
		});

	// review_num_graph

	var dataset = [];

	for (var key in dish_category_info) {
		const num_of_reviews = dish_category_info[key]['num_of_reviews'];
		dataset.push({ dish_category: key, value: num_of_reviews });

		const average_reviews = _.chain(dish_category_info[key]['num_of_reviews'])
			.mean()
			.round(0)
			.value();
	}
	// console.log(dataset);

	var size2 = { width: 246, height: 175 };
	var margin = { top: 30, bottom: 30, right: 10, left: 40 };

	var svg = d3
		.select(document.body)
		.append('svg')
		.attr('width', size2.width)
		.attr('height', size2.height);

	var xScale = d3
		.scaleBand()
		// .rangeRound([margin.lefft, size2.width - margin.right])
		.rangeRound([margin.left, size2.width - margin.right])
		.padding(0.1)
		.domain(
			dataset.map(function(d) {
				return d.dish_category;
			})
		);

	var axisx = d3.axisBottom(xScale);

	var yScale = d3
		.scaleLinear()
		.domain([
			0,
			d3.max(dataset, function(d) {
				return d.value;
			}),
		])
		.range([size2.height - margin.bottom, margin.bottom]);

	var axisy = d3.axisLeft(yScale).ticks(5);

	svg
		.append('g')
		.attr(
			'transform',
			'translate(' + 0 + ',' + (size2.height - margin.bottom) + ')'
		)
		.call(axisx)
		.attr('text-anchor', 'middle')
		.attr('font-size', '5pt');

	svg
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
		.call(axisy)
		.append('text')
		.attr('fill', 'black')
		.attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top)
		.attr('y', -30)
		.attr('transform', 'rotate(-90)')
		.attr('text-anchor', 'middle')
		.attr('font-weight', 'bold')
		.attr('font-size', '7pt')
		.text('recipes');

	svg
		.append('g')
		// .attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
		.selectAll('rect')
		.data(dataset)
		.enter()
		.append('rect')
		.attr('x', function(d, i) {
			// return i * 20;
			// console.log(xScale(d.dish_category));
			return xScale(d.dish_category);
		})
		.attr('y', function(d) {
			return yScale(d.value);
		})
		// .attr('width', 10)
		.attr('width', xScale.bandwidth())
		.attr('height', function(d) {
			return size2.height - margin.bottom - yScale(d.value);
		})
		.style('fill', function(d, i) {
			return colors(i);
		});

	const dish_category_right = document.body.innerHTML;

	document = new JSDOM().window.document;
	return { left: dish_category_left, right: dish_category_right };
}

module.exports.render_svg = render_svg;
