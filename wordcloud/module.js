const cloud = require("d3-cloud"),
  d3 = require("d3"),
  Canvas = require("canvas"),
  random = d3.randomIrwinHall(2),
  colors20 = [
    "#1f77b4",
    "#aec7e8",
    "#ff7f0e",
    "#ffbb78",
    "#2ca02c",
    "#98df8a",
    "#d62728",
    "#ff9896",
    "#9467bd",
    "#c5b0d5",
    "#8c564b",
    "#c49c94",
    "#e377c2",
    "#f7b6d2",
    "#7f7f7f",
    "#c7c7c7",
    "#bcbd22",
    "#dbdb8d",
    "#17becf",
    "#9edae5"
  ],
  colorScale = d3.scaleOrdinal(colors20);

const W = 310;
const H = 310;

class WordCloud {
  constructor(data_array, json_data, document) {
    const recipe_title = json_data["title"];
    const description = json_data["description"];
    const advice = json_data["advice"];
    const countMax = d3.max(d3.values(data_array));
    const sizeScale = d3
      .scaleLog()
      .domain([1, countMax.count])
      .range([10, 50]);
    const words = data_array.map(function(d) {
      console.log(
        `${d.texture}=> count: ${d.count}, size: ${sizeScale(d.count)}`
      );
      return {
        text: d.texture,
        count: d.count,
        size: sizeScale(d.count)
      };
    });

    this.layout = cloud()
      .size([W, H])
      .words(words)
      .padding(3)
      .rotate(function() {
        return Math.round(1 - random()) * 1;
      })
      .font("Arial")
      .fontSize(function(d) {
        return d.size;
      })
      .canvas(function() {
        return Canvas.createCanvas(1, 1);
      })
      .spiral("archimedean")
      .random(function() {
        return 0.5;
      })
      .on("end", draw);

    function draw(words) {
      const body = d3.select(document.body);
      const recipe_box = body
        .append("div")
        .classed("recipe_box", true)
        .classed("card", true)
        .append("div")
        .classed("card-body", true)
        .classed("card-body alert-warning", true)
        .classed("rounded", true);

      const recipe_box_header = recipe_box
        .append("div")
        .classed("recipe_box_header", true);

      recipe_box_header
        .append("input")
        .attr("type", "checkbox")
        .attr("value", recipe_title)
        .style("float", "left")
        .style("margin-top", "8px")
        .style("margin-right", "15px");

      recipe_box_header
        .append("h3")
        .style("padding-left", "10px")
        .classed("recipe_title", true)
        .classed("card-title", true)
        .style("font-weight", "bold")
        .text(recipe_title);

      const recipe_box_content = recipe_box
        .append("div")
        .classed("container-fluid", true)
        .append("div")
        .classed("row", true);

      const recipe_box_content_left = recipe_box_content
        .append("div")
        .classed("col-sm-6 col-sm-left", true);

      const svg = recipe_box_content_left
        .append("svg")
        .classed("justify-content-center", true);

      svg
        .append("circle")
        .attr("cx", H / 2)
        .attr("cy", W / 2)
        .attr("r", 154)
        .attr("fill", "lemonchiffon")
        // .attr('fill', 'white')
        .attr("stroke-width", 3)
        .attr("stroke", "wheat");

      svg
        .attr("width", W)
        .attr("height", H)
        .append("g")
        .attr("transform", "translate(" + H / 2 + "," + W / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .style("font-size", function(d) {
          return d.size + "px";
        })
        .style("font-family", "Arial")
        .style("fill", function(d, i) {
          // if (i < 10) {
          return colorScale(i);
          // } else {
          // return 'black';
          // return '#3F51B5';
          // }
          // return colorScale(i);
          // return 'black';
        })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) {
          return d.text;
        });

      const recipe_box_content_right = recipe_box_content
        .append("div")
        .classed("col-sm-6 col-sm-right", true);

      // add recipe_description
      recipe_box_content_right
        .append("p")
        .text("Description")
        .classed("card-text", true)
        .style("font-weight", "bold")
        .append("p")
        .classed("description", true)
        .classed("card-text", true)
        .text(description);

      recipe_box_content_right
        .append("p")
        .text("Advice")
        .classed("card-text", true)
        .style("font-weight", "bold")
        .append("p")
        .classed("advice", true)
        .classed("card-text", true)
        .text(advice);
    }
  }
}

module.exports = WordCloud;
