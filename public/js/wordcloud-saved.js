// two wordcloud for recipe data
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");

const H = 600;
const W = 600;
const random = d3.random.irwinHall(2);
const colorScale = d3.scale.category20();
// let colorScale_dark = d3.scale.category20b();
// let colorScale_light = d3.scale.category20c();

class Wordcloud {
    constructor(texture, svg_place, max_range, same_array, same_colors) {
        this.max_range = max_range;
        const draw_place = svg_place;
        const countMax = d3.max(d3.values(texture));
        const sizeScale = d3.scale.sqrt().domain([0, countMax.count]).range([10, this.max_range]);
        const words = texture.map(function(d) {
            return {
                text: d.word,
                count: d.count,
                size: sizeScale(d.count) 
            };
        });


      // draw_wordcloud(words) {
     function draw_wordcloud(words) {
        d3.select(draw_place)
        .attr({
            "width": W,
            "height": H
        })
        .append("g")
        .attr("transform", "translate(300,300)")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .attr( "text-anchor","middle")
        .attr( "transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .on("mouseover", function(d){tooltip.style("visibility", "visible");})
        .on("mousemove", function(d){
            tooltip.style("top", (d3.event.pageY-30)+"px")
                   .style("left", (d3.event.pageX+20)+"px")
                   .style("font-size", "50px")
                   .html("count: " + d.count);})
        .on("mouseout", function(d){tooltip.style("visibility", "hidden");})
        .transition()
        .duration(4000)
        .ease("elastic")
        .delay(function(d, i) {return i * 500;})
        .style({
            "fill": "gray",
            "font-size": "10px"
        })
        .text(function(d) { return d.text; })
        .style({
            "font-family": "Impact",
            "font-size": function(d) { return d.size + "px"; },
            "font-weight": "bold",
            "fill": function(d, i) { 
                if (same_array.indexOf(d.text) >= 0){
                    return same_colors[same_array.indexOf(d.text)][1];
                } else if(d.text == "濃厚"){
                    return "#220000";
                } else { return colorScale(i+8); }

            }
        });
    } 

     function set_review(words) {
        d3.select(draw_place)
        .attr({
            "width": W,
            "height": H
        })
        .append("g")
        .attr("transform", "translate(300,300)")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .attr( "text-anchor","middle")
        .attr( "transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .transition()
        .delay(8000)
        .duration(4000)
        .ease("elastic")
        .delay(function(d, i) {return i * 100;})
        .text(function(d) { return d.text; })
        .style({
            "font-family": "Impact",
            "font-size": function(d) { return d.size + "px"; },
            "font-weight": "bold",
            "opacity": 0.8,
            // "fill": function(d, i) { return colorScale(i); }
            "fill": function(d, i) { return "lightgray"; }
        });
    } 

    
     this.draw_texture = d3.layout.cloud()
        .size([W, H])
        .words(words)
        .rotate(function() { return Math.round(1-random()) *1; })
        // .rotate(function() { return Math.round(1-random()) *45; })
        // .rotate(function() { return Math.round(1-random()) *90; })
        .font("Impact")
        .fontSize(function(d) { return (d.size); })
        .padding(10)
        // .spiral("rectangular")
        .spiral("archimedean")
        .random(function() { return 0.5;})
        .on("end", draw_wordcloud);
        // .start();
        
     this.draw_review = d3.layout.cloud()
        .size([W, H])
        .words(words)
        // .rotate(function() { return Math.round(1-random()) *1; })
        // .rotate(function() { return Math.round(1-random()) *45; })
        // .rotate(function() { return Math.round(1-random()) *90; })
        .font("Impact")
        .fontSize(function(d) { return (d.size); })
        .padding(10)
        // .spiral("rectangular")
        .spiral("archimedean")
        .random(function() { return 0.5;})
        .on("end", set_review);
        // .start();
    }    
}


// fetch rsc data from DB

d3.queue()
.defer(d3.csv, "rsc\\recipe1_texture-2.csv")
.defer(d3.csv, "rsc\\recipe1_review.csv")
.defer(d3.csv, "rsc\\recipe2_texture-2.csv")
.defer(d3.csv, "rsc\\recipe2_review.csv")
.await(function(error, recipe1_texture, recipe1_review, recipe2_texture, recipe2_review) {
    if (error) {
        console.error('Oh dear, something went wrong: ' + error);
    }
    else {

        console.log(recipe1_texture);


        let top8_recipe1_textures = recipe1_texture.slice(0,8).map(function(d){return d.word;});
        let top8_recipe2_textures = recipe2_texture.slice(0,8).map(function(d){return d.word;});
        let same_textures = _.intersection(top8_recipe1_textures, top8_recipe2_textures);

        let same_colors = _.map(same_textures, function(d,i){ return [d, colorScale(i)] });

        const recipe1_review_wordcloud = new Wordcloud(recipe1_review, "svg#recipe1", 10, same_textures, same_colors);
        recipe1_review_wordcloud.draw_review.start();

        const recipe1_texture_wordcloud = new Wordcloud(recipe1_texture, "svg#recipe1", 110, same_textures, same_colors);
        recipe1_texture_wordcloud.draw_texture.start();


        const recipe2_review_wordcloud = new Wordcloud(recipe1_review, "svg#recipe2", 10, same_textures, same_colors);
        recipe2_review_wordcloud.draw_review.start();

        const recipe2_texture_wordcloud = new Wordcloud(recipe2_texture, "svg#recipe2", 110, same_textures, same_colors);
        recipe2_texture_wordcloud.draw_texture.start();

    }
});
