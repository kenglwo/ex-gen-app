# -*- coding: utf-8 -*-
import sys
import os
import psycopg2
import MeCab
import codecs
from collections import Counter


conn = psycopg2.connect(host="10.83.53.106" , port=5432, database="postgres", user="postgres", password="5931IT")
conn.rollback()
cur = conn.cursor()

f_out = codecs.open('./python/toriniku_reviews.txt', 'w', 'utf-8')
# f_out = open('toriniku_reviews.txt', 'w', encoding='utf-8', errors='replace')

recipe_id = "169b17ce6e2b6981909a901da070ea1de2626e89"

texture_array = []

cur.execute("""
    select
        texture
    from
        textures_445
    ;
""")

for row in cur:
    texture_array.append(row[0])


cur.execute("""
    select
        message
    from
        tsukurepos
    where
        recipe_id = %s;
    """ % ("'" + recipe_id + "'"))

review_array= []

for row in cur:
    review = row[0]

    for texture in texture_array:
        if(review.find(texture) != -1):
            review_array.append(review.strip())
            # print(review)


for review in review_array:
    print(review)
    output = '{0};'.format(review)
    # f_out.write(unicode(review, 'utf-8'))
    f_out.write(unicode(output, 'utf-8'))
    # f_out.write('¥n')

cur.close()
conn.close()
f_out.close()
