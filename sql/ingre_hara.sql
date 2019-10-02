select
	*
from (
select
	recipe_id
	,  sum(case name
		when '豚肉' then 1
		when 'キャベツ' then 1
		else 0
		end) 
		over(partition by recipe_id) as num
from
	ingredients
) as tmp
where tmp.num=2
;