$(function() {
	//add tooltip --------------------------------------------------
	// var tooltip = $("<div>", {
	//     css: {
	//         'position': 'absolute',
	//         'display': 'block'
	//     },
	//     'class': 'myTooltip',
	//     'html': 'Hi tooltip !'
	// });
	//
	// $('body svg g text').mouseover( (elem) => {
	//    $(tooltip).css({
	//        'top': elem.pageY,
	//        'left': elem.pageX
	//    });
	//    $('body').append(tooltip);
	//
	// });
	//
	// $('body svg g text').mouseout( (elem) => {
	//     $(tooltip).remove();
	// });

	//add "for" to each input --------------------------------------------------

	// var highlight = $("<span>", {
	//     css: {
	//         'background-color': '#FFFF00'
	//     }
	// });
	//
	// $('button#searchBtn').click((elem) => {
	//     // let keyword = $('input#searchText').text()
	//     let keyword = $('input#searchText').val();
	//
	//
	//     $('text').each((i,elem) => {
	//         let t = $(elem).text();
	//         if (t == 'しっとり'){
	//             console.log(t);
	//             $(elem).attr('background-color', '#FFFF00');
	//             $(elem).attr('fill', 'red');
	//             // $(elem).wrap(highlight);
	//         }
	//
	//     });
	//
	//     $('input#searchText').val('');
	// });

	// --------------------------------------------------

	// $('div.card-body').draggable({ axis: "x" });
	// $('svg').draggable({
	//     // axis: "x",
	//     cursor: 'move',
	//     // cursorAt: { bottom: 0 },
	//     cursorAt: { top: 5, left:5 },
	//     opacity: 0.7, helper: "clone",
	// });
	//
	// $('div.drop-area').droppable({
	//     accept : 'svg',
	//     drop : function(event , ui){
	//         $(this)
	//         // .css('background', '#fdf5e6')
	//         .css('border', '2px solid #ffa07a')
	//         .find( "p" )
	//         .html( "ドロップされました" );
	//         console.log("ドロップされました");
	//     }
	// });

	// --------------------------------------------------

	$('#compareBtn').click(() => {
		let compare_array = [];

		$(':checkbox')
			.filter(':checked')
			.each((i, elem) => {
				let recipe_name = $(elem)
					.next('h5')
					.text();

				svg_element = $(elem)
					.closest('div.card-body')
					.find('div.svg_container')
					.html();
				compare_array.push({
					recipe_name: recipe_name,
					svg_element: svg_element,
				});
			});

		compare_json = JSON.stringify(compare_array);

		var form = $('form#compareForm');
		$('<input>')
			.attr({
				type: 'hidden',
				name: 'compareItem',
				value: compare_json,
			})
			.appendTo(form);

		$('#compareForm').submit();
	});
	// --------------------------------------------------

	$('div.card-body').on({
		mouseover: function(elem) {
			// $(elem.currentTarget).css('background-color', '#ffe4e1');
		},
		mouseout: function(elem) {
			let if_checked = $(elem.currentTarget)
				.find(':checkbox')
				.prop('checked');
			if (!if_checked) {
				// $(elem.currentTarget).css('background-color', '#fff3cd');
			}
		},
	});

	// --------------------------------------------------

	$(':checkbox').change(elem => {
		if ($(elem.currentTarget).prop('checked') == true) {
			$(elem.currentTarget)
				.closest('div.card-body')
				.css('background-color', '#ffe4e1');
		} else {
			$(elem.currentTarget)
				.closest('div.card-body')
				.css('background-color', '#fff3cd');
		}

		let checked_array = [];
		$(':checkbox').each((i, elem) => {
			checked_array.push($(elem).prop('checked'));
		});
		console.log(checked_array);
		// console.log(checked_array.includes(true));
		if (checked_array.includes(true)) {
			$('button#compareBtn').prop('disabled', false);
		} else {
			$('button#compareBtn').prop('disabled', true);
		}
	});
});
