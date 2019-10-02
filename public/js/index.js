$(function() {
	$('form#by_recipe_id').validate({
		rules: {
			recipe_id1: { required: true, rangelength: [40, 40] },
			recipe_id2: { required: true, rangelength: [40, 40] },
			recipe_id3: { required: true, rangelength: [40, 40] },
			recipe_id4: { required: true, rangelength: [40, 40] },
		},

		messages: {
			recipe_id1: {
				required: '&nbsp&nbsp&nbsp&nbspレシピIDを入力してください',
				rangelength: '&nbsp&nbsp&nbsp&nbsp40桁の英数字で入力してください',
			},
			recipe_id2: {
				required: '&nbsp&nbsp&nbsp&nbspレシピIDを入力してください',
				rangelength: '&nbsp&nbsp&nbsp&nbsp40桁の英数字で入力してください',
			},
			recipe_id3: {
				required: '&nbsp&nbsp&nbsp&nbspレシピIDを入力してください',
				rangelength: '&nbsp&nbsp&nbsp&nbsp40桁の英数字で入力してください',
			},
			recipe_id4: {
				required: '&nbsp&nbsp&nbsp&nbspレシピIDを入力してください',
				rangelength: '&nbsp&nbsp&nbsp&nbsp40桁の英数字で入力してください',
			},
		},
	});

	$('select').select2();
});
