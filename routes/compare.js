var express = require('express'),
	router = express.Router();

router.post('/', function(req, res, next) {
	const compare_json = req.body.compareItem;
	const compareItems_array = JSON.parse(compare_json);
	let content = '';

	function create_card(index, svg_element, recipe_name) {
		return `
                <div class="card style="width: 22rem;">
                <!-- <div class="card alert-warning" style="width: 22rem;"> -->
                    <div class="card-body rounded">
                    <!-- <div class="card-body alert-warning rounded"> -->
                        <label for="checkbox_${index}">
                        <input type="checkbox" id="checkbox_${index}">
                        <h5 class="recipe_title card-title">${recipe_name}</h5>
                        </label>
                        <div class="svg_container">
                            ${svg_element}
                        </div>
                    </div>
                </div>`;
	}

	let recipe_number = 0;

	for (var i in compareItems_array) {
		const recipe_name = compareItems_array[i]['recipe_name'];
		const svg_element = compareItems_array[i]['svg_element'];

		content += create_card(i, svg_element, recipe_name);
		recipe_number += 1;
	}

	res.render('compare', {
		title: 'みんなの食感 View 絞り込み結果 ',
		subtitle: `${recipe_number} 件の絞り込み`,
		content: content,
	});

	delete content;
});

module.exports = router;
