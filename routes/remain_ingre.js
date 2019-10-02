// assume must_ingredients are "cabbage, portk"
// assume "soup" has been selected in dish_category view

const d3 = require('d3'),
	{ JSDOM } = require('jsdom'),
	_ = require('lodash');

let document = new JSDOM().window.document;
const colors = d3.scaleOrdinal(d3.schemeSet3);

const num_of_ingre_in_hand = 4;

function render_svg(dish_category_info) {
	document = new JSDOM().window.document;

	const num_of_ingredients = dish_category_info['スープ']['num_of_ingredients'];
	const data = _(num_of_ingredients)
		.map(value => value - num_of_ingre_in_hand)
		.groupBy()
		.map((value, key) => {
			return { remain_num: parseInt(key), count: value.length };
		})
		.orderBy(['remain_num'], ['desc'])
		.value();

	// bar chart

	const size = { width: 145, height: 250 };
	const margin = { top: 10, right: 10, bottom: 40, left: 20 };

	// set the ranges
	const xScale = d3.scaleLinear().range([0, size.width]);
	// .ticks(1);
	// .tickFormat(d3.timeFormat('%Y'));

	const yScale = d3
		.scaleBand()
		.range([size.height, 0])
		.padding(0.1);

	var svg = d3
		.select(document.body)
		.append('svg')
		.attr('width', size.width + margin.left + margin.right)
		.attr('height', size.height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Scale the range of the data in the domains
	xScale.domain([
		0,
		d3.max(data, function(d) {
			return d.count;
		}),
	]);

	var axisx = d3.axisBottom(xScale).ticks(3);
	// .tickFormat(d3.timeFormat('%Y'));

	yScale.domain(
		data.map(function(d) {
			return d.remain_num;
		})
	);
	var axisy = d3.axisLeft(yScale);
	//y.domain([0, d3.max(data, function(d) { return d.count; })]);

	// add the x Axis
	svg
		.append('g')
		.attr('transform', 'translate(0,' + size.height + ')')
		.call(axisx)
		.append('text')
		.attr('fill', 'black')
		.attr('x', (size.width - margin.left - margin.right) / 2 + margin.left)
		.attr('y', 30)
		.attr('text-anchor', 'middle')
		.attr('font-size', '7pt')
		.attr('font-weight', 'bold')
		.text('recipes');

	// add the y Axis
	svg
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
		.call(axisy)
		.append('text')
		.attr('fill', 'black')
		.attr('x', -(size.height - margin.top - margin.bottom) / 2 - margin.top)
		.attr('y', -35)
		.attr('transform', 'rotate(-90)')
		.attr('text-anchor', 'middle')
		.attr('font-weight', 'bold')
		.attr('font-size', '7pt')
		.text('ingredients');

	// append the rectangles for the bar chart
	svg
		.selectAll('.bar')
		.data(data)
		.enter()
		.append('rect')
		.attr('class', 'bar')
		.attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
		// .attr('x', function(d) {
		// 	return x(d.count);
		// })
		.attr('width', function(d) {
			return xScale(d.count);
		})
		.attr('y', function(d) {
			return yScale(d.remain_num);
		})
		.attr('height', yScale.bandwidth())
		.style('fill', function(d, i) {
			return colors(3);
		});

	const remain_ingre_left = document.body.innerHTML;
	return { left: remain_ingre_left, right: '' };
}

module.exports.render_svg = render_svg;
