with tmp as (
select
	t1.title as category_title, t2.recipe_id
from
	search_categories as t1
	join  search_category_recipes as t2 on t1.id=t2.search_category_id
where
	t2.recipe_id='053e9bebf96e7a6aa13d2b1091b32c070a1d7165'
)

select
	t1.recipe_id, t2.category_title, t1.title
from
	recipes as t1
	join tmp as t2 on t1.recipe_id=t2.recipe_id
where
	t1.recipe_id in(
	select recipe_id from tmp)
;
