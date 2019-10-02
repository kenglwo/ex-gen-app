const express = require("express"),
  router = express.Router(),
  url = require("url"),
  _ = require("lodash"),
  { JSDOM } = require("jsdom"),
  WordCloud = require("./module"),
  { Pool } = require("pg"),
  pool = new Pool({
    user: "postgres",
    host: "10.83.53.106",
    database: "postgres",
    password: "5931IT",
    port: 5432
  });

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

let document = new JSDOM().window.document;

router.post("/", function(req, res, next) {
  const dish = req.body.dish.trim();
  const texture = req.body.texture.trim();

  console.log("------> 料理名: 「" + dish + "」, 食感語: 「" + texture + "」");

  let recipe_ids_titles = {};
  let recipe_jsons = [];

  (async () => {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
            select 
                m.recipe_id
                , m.title
                , m.description
                , m.advice
                , count(t.texture) as texture_count
                , count(m.recipe_id) over() as recipe_count
            from (
                select
                    recipe_id
                    , title
                    , description
                    , advice
                from recipes
                where title like $1
                group by recipe_id, title, description, advice
            ) as m
            , recipe_texture_445 as t
            where m.recipe_id = t.recipe_id
            and t.texture = $2
            group by m.recipe_id, m.title, m.description, m.advice
            having count(t.texture) > 10
            order by count(t.texture) desc
            limit 10 ;`,
        ["%" + dish + "%", texture]
      );

      if (result["rowCount"] != 0) {
        console.log(
          "------> 検索結果: " + result["rows"][0]["recipe_count"] + "件"
        );
      } else {
        console.log("------> 該当するレシピはありませんでした．");
        res.redirect(302, "http://localhost:3000/noresult");
      }

      _.forEach(result["rows"], elem => {
        // 順番に取り出す or 取り出したあとで並び替える

        recipe_ids_titles[elem["recipe_id"]] = elem["title"];
        const description = elem["description"].trim();
        const advice = elem["advice"].trim();

        let recipe_info = {
          recipe_id: elem["recipe_id"],
          title: elem["title"],
          description: description,
          advice: advice,
          recipe_count: elem["recipe_count"],
          texture_count: elem["texture_count"]
        };
        recipe_jsons.push(recipe_info);
      });
    } finally {
      client.release();
      render_wordcloud(recipe_jsons, dish, texture, 1);
    }
  })().catch(e => console.log(e.stack));

  function render_wordcloud(recipe_jsons, dish, texture, c_index) {
    let each_counter = 0;
    const counter = Object.keys(recipe_jsons).length - 1;
    // let current_page = c_index;

    (async () => {
      const client = await pool.connect();

      _.forEach(recipe_jsons, item => {
        let total_page = Math.floor(item.recipe_count / 10) + 1;

        let total_section = Math.ceil(total_page / 5);
        let current_section =
          c_index % 5 == 0
            ? Math.floor(c_index / 5) - 1
            : Math.floor(c_index / 5);

        (async () => {
          const result = await client.query(
            `
                        select texture, count(texture) AS count
                        from recipe_texture_445
                        where recipe_id = $1
                        group by texture
                        order by count desc;`,
            [item.recipe_id]
          );

          let textures = [];
          _.forEach(result["rows"], elem => {
            textures.push(elem);
          });

          console.log(item["texture_count"], item["title"]);

          const newObj = new WordCloud(textures, item, document);
          const wordcloud = newObj.layout.start();

          if (each_counter == counter) {
            let wordcloud_element = document.body.innerHTML;

            let data = {
              title: "みんなの食感 View Search Result",
              subtitle: item.recipe_count + " recipes found",
              content: wordcloud_element,
              total_page: total_page,
              current_page: c_index,
              current_section: current_section,
              total_section: total_section,
              dish: dish,
              texture: texture,
              filename: "pagenation"
            };

            res.render("hello", data);
            document = new JSDOM().window.document;
          }

          each_counter += 1;
        })().catch(e => console.log(e.stack));
      });

      client.release();
    })().catch(e => console.log(e.stack));
  }
});

module.exports = router;
