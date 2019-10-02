const parse_result = mecab.parse(recipe_title, (err, result) => {
	if (err) throw err;
	let target_title = '';
	for (var data of result) {
		if (data[1] != '記号') {
			if (data[1] == '名詞' || data[1] == '動詞') {
				// console.log(recipe_title);
				// console.log(data[0]);
				// console.log('\n');
				target_title += data[0];
			}
		}
	}
	recipe_title += '\n';
	fs.appendFile('recipe_title.txt', recipe_title, (err, data) => {
		if (err) console.log(err);
		else console.log('write end');
	});
console.log(target_title);
return result;
});




	var width = 400;
	var height = 300;
	var padding = 30;

	let svg = d3
		.select(document.body)
		.append('svg')
		.attr('width', width)
		.attr('height', height);

	var xScale = d3
		.scaleBand()
		.rangeRound([padding, width - padding])
		.padding(0.1)
		.domain(
			dataset.map(function(d) {
				return d.name;
			})
		);

	var yScale = d3
		.scaleLinear()
		.domain([
			0,
			d3.max(dataset, function(d) {
				return d.value;
			}),
		])
		.range([height - padding, padding]);

	svg
		.append('g')
		.attr('transform', 'translate(' + 0 + ',' + (height - padding) + ')')
		.call(d3.axisBottom(xScale));

	svg
		.append('g')
		.attr('transform', 'translate(' + padding + ',' + 0 + ')')
		.call(d3.axisLeft(yScale));

	svg
		.append('g')
		.selectAll('rect')
		.data(dataset)
		.enter()
		.append('rect')
		.attr('x', function(d) {
			return xScale(d.name);
		})
		.attr('y', function(d) {
			return yScale(d.value);
		})
		.attr('width', xScale.bandwidth())
		.attr('height', function(d) {
			return height - padding - yScale(d.value);
		})
		.attr('fill', 'steelblue');



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
