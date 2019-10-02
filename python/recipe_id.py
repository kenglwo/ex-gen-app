# -*- coding: utf-8 -*-
"""
Created on 2018/05/14 -> 2018/10/08 - 2018/10/10
@author: Kento Shigyo
"""

import sys
import traceback
import logging
import psycopg2
import MeCab
import codecs
from collections import Counter
import csv
import re
import pprint
import jaconv

logging.basicConfig(level=logging.DEBUG, format=' %(asctime)s - %(levelname)s - %(message)s')
# logging.disable(logging.CRITICAL)
logging.debug("---> Program has started <---")

"""
set recipe_id and output filename
"""

# recipe_id = "870e7d67f777deb83dd6e474105ceaec301e092c"  ripiripi
recipe_id = "f208faea5eeaa5a6a1c499e9f6146708472d443d"  #簡単＊超濃厚チョコケーキ
# recipe_id =  "787d0bec3f702bab3623ac2947fc83fd99c37230" #しっとり濃厚

output_file_texture = '../public/rsc/recipe1-texture-2.csv'
# output_file_review = '../public/rsc/ripiripi_review.csv'


def write_out_textures(row, filename):
    """
    count the frequency of texture of a recipe you want
    """

    # convert kata to hira and add up as count of hira
    # add value[0] to a list if 

    dic = {value[0]:value[1] for value in row}
    # import pdb; pdb.set_trace()

    re_katakana = re.compile(r'[\u30A1-\u30F4]+')
    

    for key, value in dic.items():
        if re_katakana.fullmatch(key):
            kana_to_hira = jaconv.kata2hira(key)
            if kana_to_hira in dic.keys():
                dic[kana_to_hira] += value
                dic[key] = 0

    dic = {k:v for k,v in dic.items() if v > 0}


    with codecs.open(filename, 'a', 'utf-8') as file:

        writer = csv.writer(file, delimiter=',')
        writer.writerow([ 'word', 'count' ])
        for texture, count in dic.items():
            writer.writerow([ texture, count ])


def count_freq_of_reviews(input, filename):
    """
    count the frequency of words in reviews of a recipe you want
    """

    input_data = ''

    for value in input:
        input_data += value[0].replace(' ','') + ' '

    # mecabで形態素解析
    m = MeCab.Tagger ("-Ochasen")
    result = m.parseToNode(input_data)

    array = []
    while result:
        data = result.feature.split(",")
        if(not data[0] == '助詞' and not data[0] == '記号'):
            array.append(data[6])

        result = result.next

    # 頻度の算出
    counter = Counter(array)
    
    with codecs.open(filename, 'a', 'utf-8') as file:
        writer = csv.writer(file, delimiter=',')
        writer.writerow([ 'word', 'count' ])

        for word, cnt in counter.most_common():
            writer.writerow([ word, str(cnt) ])
    

try:
    conn = psycopg2.connect(host="localhost" , port=5432, database="cookpad", user="postgres", password="5931IT")
    conn.autocommit = True
    logging.debug("---> PostgreSQL connected <---")
    # conn.rollback()
    cur = conn.cursor()
except :
    logging.debug("---> Cannot connect to PostgreSQL <---")
    traceback.print_exc()
    conn.rollback()
    conn.close()
    sys.exit()



cur.execute(" \
        select texture, count(texture) as count \
        from recipe_texture where recipe_id = %s \
        group by (recipe_id, texture) \
        order by count desc;" % ("'" + recipe_id + "'"))

texture_data = cur.fetchall()

# extract all words from reviews of a recipe you want
sql2 = " \
        select message \
        from tsukurepos \
        where recipe_id = %s;" % ("'" + recipe_id + "'")
cur.execute(sql2)
review_data = cur.fetchall()

cur.close()
conn.close()

write_out_textures(texture_data, output_file_texture)
# count_freq_of_reviews(review_data, output_file_review)

