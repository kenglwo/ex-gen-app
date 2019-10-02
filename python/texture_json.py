#!/usr/bin/python3
# -*- coding: utf-8 -*-

import codecs
import pprint

HIRA_TEXTURE = codecs.open('texture_hiragana.txt', 'r', 'utf8')
ENG_TEXTURE = codecs.open('english_texture.txt', 'r', 'utf8')
f = codecs.open('texture.js', 'w', 'utf8')

hira_array = []
for line in HIRA_TEXTURE:
    hira_array.append(line.strip())

eng_array = []
for line in ENG_TEXTURE:
    eng_array.append(line.strip())


data = ''
for hira, eng in zip(hira_array, eng_array):
    data = '"{0}": "{1}",\n'.format(hira, eng)
    f.write(data)
    print(data)

f.close()
