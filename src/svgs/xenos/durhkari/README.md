# dark eldar

黑暗灵族的数据同样残缺不全, 包括阴谋团, 巫灵教派以及血伶人巫会

以及存在疑点, "Soul Drinkers" 到底在指代什么.

+ 阴谋团统一使用前缀 `kabel-of`
+ 血伶人巫会使用前缀 `coven-of`
+ 巫灵教派使用前缀 `cult-of`

``` bash
echo "Haemonculus Covens"
for i in ./*-2.png; do
    echo ${i}
    convert \
        ${i} \
        -alpha extract \
        -negate \
        ${i}.pnm
    potrace \
        ${i}.pnm \
        --svg \
        --opttolerance 1 \
        -o ${i}.svg
done

for i in ./*-1.png; do
    echo ${i}
    convert \
        ${i} \
        -background white \
        -alpha remove \
        -alpha off \
        ${i}.pnm
    potrace \
        ${i}.pnm \
        --svg \
        --opttolerance 1 \
        -o ${i}.svg
done
```
