data = {

'Коля': '''2024-12-01 PPEEI, 2024-12-02 EEPPI, 2024-12-03 EEPPPI, 2024-12-04 PPEEEIIMMM, 2024-12-05 EPPPIISMMM, 2024-12-06 EEEPPISMMM, 2024-12-07 EEEPPISMMM, 2024-12-08 EEEPPSSIMMM, 2024-12-09 EEPI, 2024-12-10 EEESSPPMMM, 2024-12-11 EEEPPSSMMM, 2024-12-12 EEEPPSSMMM, 2024-12-13 EEE, 2024-12-14 EEEPI, 2024-12-15 EEPPI, 2024-12-16 EEPPIS, 2024-12-17 EEPIS, 2024-12-18 EP, 2024-12-19 PPPSIEMMM, 2024-12-20 EEEPIS, 2024-12-21 EPPIS, 2024-12-22 PPIS, 2024-12-23 EPISSS, 2024-12-24 EPPPSSSIMMM, 2024-12-25 PPSSSI, 2024-12-26 EEPPSSIMMM, 2024-12-27 PPPEEEISMMM, 2024-12-28 EEEPPPSSIMMM, 2024-12-29 EPPSSI, 2024-12-30 EEPPSSIIMMM, 2024-12-31 PPPISSEEMMM''',
'Алиса': '''2024-12-02 MMMES, 2024-12-04 S, 2024-12-09 P, 2024-12-11 MMM, 2024-12-12 MMM, 2024-12-15 PS, 2024-12-17 P, 2024-12-18 E, 2024-12-19 EP, 2024-12-21 EP, 2024-12-24 P, 2024-12-28 P, 2024-12-29 PE, 2024-12-30 EPPPI, 2024-12-31 EPPPISMMM''',
'Лёша': '''2024-12-01 ES, 2024-12-02 EEP, 2024-12-03 PES, 2024-12-04 EEESMMM, 2024-12-05 EES, 2024-12-06 EESS, 2024-12-07 EESS, 2024-12-08 SSIIE, 2024-12-09 ESI, 2024-12-10 ESP, 2024-12-11 IISE, 2024-12-12 EI, 2024-12-13 EE, 2024-12-14 EI, 2024-12-15 ES, 2024-12-17 EII, 2024-12-18 IE, 2024-12-19 SEEPMMM, 2024-12-20 EEEPPPSMMM, 2024-12-21 EEEPPP, 2024-12-22 EEEPPPSMMM, 2024-12-23 EEEPPP, 2024-12-24 EEPPS, 2024-12-25 EEEPPS, 2024-12-26 EEPP, 2024-12-27 EP, 2024-12-28 EEEPPPSMMM, 2024-12-29 EEEPPP, 2024-12-30 EEEPPPSMMM, 2024-12-31 ESS''',
'Слава': '''2024-12-03 ESSPPIIMMM, 2024-12-04 II, 2024-12-05 EIIIPPPMMM, 2024-12-06 EII, 2024-12-07 IIE, 2024-12-08 E, 2024-12-09 SP, 2024-12-10 PPES, 2024-12-11 S, 2024-12-12 PP, 2024-12-13 PP, 2024-12-15 PP, 2024-12-16 IIP, 2024-12-17 IP, 2024-12-18 IPSS, 2024-12-19 PSSII, 2024-12-20 IIS, 2024-12-21 II, 2024-12-22 ES, 2024-12-23 E, 2024-12-24 SSEP, 2024-12-25 SS, 2024-12-26 E, 2024-12-27 S, 2024-12-28 EE''',
}


import re

result = {}
print('Результаты декабря:\n')
month = '2024-12'
for k in data:
    if k not in result:
        result[k] = {}
        result[k][month] = [0, 0, 0, 0]
    for i in re.findall(r'\d{4}-\d\d-\d\d [A-Z]+', data[k].split(';;')[0]):
        # ~ month = i[:7]
        # ~ if month in i and month not in result[k]:
            # ~ result[k][month] = [0, 0, 0, 0]
        result[k][month][0] += 15
        if len(re.split(r'E+|P+|I+|S+|M+', i.split()[1])) > 4:
            result[k][month][1] += 15
        result[k][month][2] += len(i.split()[1]) * 5
    r0 = result[k][month][2] + result[k][month][1] + result[k][month][0]
    print(k, '—', r0, 'баллов с бонусами \n  бонус за отмеченные дни — %s \n  бонус за четыре цвета — %s\n' % (result[k][month][0], result[k][month][1]))

"""
Всего -- 1500 (бонус за дни -- 23, бонус за разнообразие -- 23)
"""
