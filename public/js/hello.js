$(function() {
  //add tooltip --------------------------------------------------
  // var tooltip = $("<div>", {
  //   css: {
  //     position: "absolute",
  //     display: "block"
  //   },
  //   class: "myTooltip",
  //   html: "Hi tooltip !"
  // });
  //
  // $("body svg g text").mouseover(elem => {
  //   $(tooltip).css({
  //     top: elem.pageY,
  //     left: elem.pageX
  //   });
  //   $("body").append(tooltip);
  // });
  //
  // $("body svg g text").mouseout(elem => {
  //   $(tooltip).remove();
  // });

  //add "for" to each input --------------------------------------------------
  $("input[type=checkbox]").each((i, inputElement) => {
    $(inputElement).attr("id", "checkbox_" + String(i));
  });

  $("div.recipe_box_header").each((i, elem) => {
    let label = $("<label>", {
      for: "checkbox_" + i,
      css: {
        display: "inline"
      }
    });

    $(elem).wrapInner(label);

    // translation of words in wordcloud

    $("svg > g").each((i, elem) => {
      let text_elements = $(elem).children("text");
      text_elements.each((i, elem) => {
        // $(elem).attr("data-toggle", "tooltip");
        // $(elem).attr("data-placement", "auto");
        // word = $(elem).text();
        // $(elem).attr("title", texture_translation[word]);

        word = $(elem).text();
        // $(elem).text(texture_translation[word]);
        console.log(word);
        // console.log(texture_translation[word]);
      });
    });
  });

  // console.log(texture_translation);

  // tooltip of Bootstrap
  $('[data-toggle="tooltip"]').tooltip();
  //--------------------------------------------------

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

  $("#compareBtn").click(() => {
    let compare_array = [];

    $(":checkbox")
      .filter(":checked")
      .each((i, elem) => {
        let recipe_name = $(elem)
          .next("h3")
          .text();
        // console.log(recipe_name);

        const svg_element = $(elem)
          .closest("div.card-body")
          .find("div.col-sm-left")
          .html();
        // console.log(svg_element);
        compare_array.push({
          recipe_name: recipe_name,
          svg_element: svg_element
        });
      });

    // console.log(svg_array);
    const compare_json = JSON.stringify(compare_array);

    var form = $("form#compareForm");
    $("<input>")
      .attr({
        type: "hidden",
        name: "compareItem",
        value: compare_json
      })
      .appendTo(form);

    $("#compareForm").submit();
  });
  // --------------------------------------------------

  $("div.card-body").on({
    mouseover: function(elem) {
      // $(elem.currentTarget).css('background-color', '#ffe4e1');
    },
    mouseout: function(elem) {
      let if_checked = $(elem.currentTarget)
        .find(":checkbox")
        .prop("checked");
      if (!if_checked) {
        // $(elem.currentTarget).css('background-color', '#fff3cd');
      }
    }
  });

  // --------------------------------------------------

  $(":checkbox").change(elem => {
    if ($(elem.currentTarget).prop("checked") == true) {
      $(elem.currentTarget)
        .closest("div.card-body")
        .css("background-color", "#ffe4e1");
    } else {
      $(elem.currentTarget)
        .closest("div.card-body")
        .css("background-color", "#fff3cd");
    }

    let checked_array = [];
    $(":checkbox").each((i, elem) => {
      checked_array.push($(elem).prop("checked"));
    });
    console.log(checked_array);
    // console.log(checked_array.includes(true));
    if (checked_array.includes(true)) {
      $("button#compareBtn").prop("disabled", false);
    } else {
      $("button#compareBtn").prop("disabled", true);
    }
  });

  // --------------------------------------------------

  // const colors20 = [
  // 		'#1f77b4',
  // 		'#aec7e8',
  // 		'#ff7f0e',
  // 		'#ffbb78',
  // 		'#2ca02c',
  // 		'#98df8a',
  // 		'#d62728',
  // 		'#ff9896',
  // 		'#9467bd',
  // 		'#c5b0d5',
  // 		'#8c564b',
  // 		'#c49c94',
  // 		'#e377c2',
  // 		'#f7b6d2',
  // 		'#7f7f7f',
  // 		'#c7c7c7',
  // 		'#bcbd22',
  // 		'#dbdb8d',
  // 		'#17becf',
  // 		'#9edae5',
  // 	],
  // 	colorScale = d3.scaleOrdinal(colors20);
  const colorScale = d3.scale.category20(); // this d3 is ver. 3
  // const colorScale = d3.scaleOrdinal(d3.schemeCategory20);
  let same_array = [];

  $("svg > g").each((i, elem) => {
    let text_elements = $(elem).children("text");
    let text_array = [];
    text_elements.each((i, elem) => {
      // if (i < 20) {
      text_array.push($(elem).text());
      // }
    });
    same_array.push(text_array);
  });

  let same_textures = _(...same_array)
    .concat()
    .uniq()
    .value();
  _.forEach(same_textures, (value, i) => {
    $(`text:contains(${value})`).css("fill", colorScale(i));
    // $(`text:contains(${value})`).css('fill', 'black');
  });

  $("text").each((i, elem) => {
    const t = $(elem).text();
    $(elem).text(same_textures[t]);
    // console.log(t + " : " + texture[t]);
  });
});
