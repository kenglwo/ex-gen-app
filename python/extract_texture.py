# -*- coding: utf-8 -*-
import sys
import os
import psycopg2
import MeCab
import codecs
from collections import Counter
from wordcloud import WordCloud,STOPWORDS
import matplotlib.pyplot as plt

#### 比較するレシピの食感と料理名、出力ファイル名の設定 ----------------------------------------------------
want_texture = 'だし巻き卵'
want_dish    = '' 

output_file_texture1 = 'cake_texture.csv'
output_file_review1 = 'cake_review.csv'

output_file_texture2 = 'dasimaki2_texture.csv'
output_file_review2 = 'dasimaki2_review.csv'
#### -------------------------------------------------------------------------------------------------------

conn = psycopg2.connect(host="localhost" , port=5432, database="postgres", user="postgres", password="5931IT")
conn.rollback()
cur = conn.cursor()

def count_freq_of_textures(row, filename):
    """テクスチャの頻度を数える"""

    array = []

    for value in row:
        array.append(value[0].replace(' ','') + ' ')

    # 頻度の算出
    c = Counter(array)
    output = "word,count" + "\n"
    for i in c.most_common():
        output += str(i[0].strip()) + "," + str(i[1]) + "\n"

    with codecs.open(filename, 'w', 'utf-8') as file:
        file.write(output)
    return output

def count_freq_of_reviews(input, filename):
    """レビューの全語の頻度を数える"""

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
    output = "word,count" + "\n"
    for word, cnt in counter.most_common():
        output += word + "," + str(cnt) + "\n"
    
    with codecs.open(filename, 'w', 'utf-8') as file:
        file.write(output)
    return output


#テクスチャ数の多い上位2つのレシピIDとタイトルを返す関数
def get_recipe_id_title(texture, dish_name):
    
    cur.execute("select id, title, count(texture) as number_of_texture \
            from recipes, tsukurepos_order \
            where \
                title like %s \
            and title like %s \
            and recipes.id = tsukurepos_order.recipe_id \
            group by id, title \
            having count(texture) > 0 \
            ;", ('%'+texture+'%','%'+dish_name+'%') \
    )

    table_data = cur.fetchall()
    write = ''
    dic = {}
    array = []
    for data in table_data:

    # テクスチャ数 : レシピID
        dic[data[2]] = data[0]
        array.append(data[2])
        array.sort()

    max1ID = ''
    max2ID = ''
    try:
        max1ID = dic[array[-1]]
        max2ID = dic[array[-2]]
    except :
        print(want_texture + " ・ " + want_dish + " に該当する複数のレシピがありませんでした")
        sys.exit()

    # タイトル
    max1Title = ''
    max2Title = ''
    for row in table_data:
        if(row[0] == max1ID):
            max1Title = row[1]
        elif row[0] == max2ID:
            max2Title = row[1]

    output = [max1ID, max2ID, max1Title, max2Title]
    return output


recipe_ids = get_recipe_id_title(want_texture, want_dish) 
recipe_id = "870e7d67f777deb83dd6e474105ceaec301e092c"


#レビューから食感表現を抽出
sql1 = "select texture from tsukurepos_order where recipe_id = %s;" % ("'" + recipe_id + "'")
# sql2 = "select texture from tsukurepos_order where recipe_id = %s;" % ("'" + recipe_id + "'")
cur.execute(sql1)
texture_data1 = cur.fetchall()
# cur.execute(sql2)
# texture_data2 = cur.fetchall()

#レビューの全語を抽出
sql1 = "select message from tsukurepos where recipe_id = %s;" % ("'" + recipe_id + "'")
# sql2 = "select message from tsukurepos where recipe_id = %s;" % ("'" + recipe_ids[1] + "'")
cur.execute(sql1)
review_data1 = cur.fetchall()
# cur.execute(sql2)
# review_data2 = cur.fetchall()

cur.close()
conn.close()

texture1 = count_freq_of_textures(texture_data1, output_file_texture1)
# texture2 = count_freq_of_textures(texture_data2, output_file_texture2)

count_freq_of_reviews(review_data1, output_file_review1)
# count_freq_of_reviews(review_data2, output_file_review2)

#----------------------------------------------------------------------------------------------------------
# pythonでword cloudによる食感表現の可視化
# fpath = "C:\\Users\\ueno\\AppData\\Local\\Programs\\Python\\Python35-32\\Lib\\site-packages\\matplotlib\\mpl-data\\fonts\\ttf\\ipaexg.ttf"
# stopwords = set(STOPWORDS)
#
# spaced_texture1 = ''
# array = texture1.split('\n')
# for row in array:
#     data = row.split(',')
#     if len(data) == 2 and not data[0] == "word":
#         spaced_texture1 += ( data[0] + " " ) * int(data[1])
#
# spaced_texture2 = ''
# array = texture2.split('\n')
# for row in array:
#     data = row.split(',')
#     if len(data) == 2 and not data[0] == "word":
#         spaced_texture2 += ( data[0] + " " ) * int(data[1])
#
# wordcloud = WordCloud(background_color="white", font_path=fpath ,width=800, height=700,stopwords=stopwords).generate(spaced_texture1)
# plt.figure(figsize=(15,12))
# # plt.figure(1)
# plt.subplot(121)
# plt.title(recipe_ids[2])
# plt.imshow(wordcloud)
# plt.axis("off")
#
# wordcloud = WordCloud(background_color="white", font_path=fpath ,width=800, height=700,stopwords=stopwords).generate(spaced_texture2)
# # plt.figure(2)
# plt.subplot(122)
# plt.title(recipe_ids[3])
# plt.imshow(wordcloud)
# plt.axis("off")
# plt.show()
