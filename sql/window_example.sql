select
	*
from
	(
select
	recipe_id
	, sum(position) over(
		partition by
			recipe_id
	)::int as sum_of_steps
from
	steps
where
	recipe_id='b1eb5b227bbab15f431ed9a952ab9a3cc60aa7c1'
) as tmp
group by recipe_id, tmp.sum_of_steps
;