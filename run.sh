#!/usr/bin/env bash

rm -rf $dir/graphics $dir/charts
mkdir $dir/graphics $dir/charts

echo 'Creating bar charts...'
node $dir/scripts/bars_viz.js
echo 'Creating bubble charts...'
node $dir/scripts/bubble_viz.js
echo 'Creating radar charts...'
node $dir/scripts/radar_data.js | python3 $dir/scripts/radar.py
echo  'Creating quartile charts..'
node $dir/scripts/quartile_viz.js

echo 'Converting to PNG...'
for image in $dir/graphics/*; do
  if [[ $image == *"svg"* ]];
  then
    echo 'converting -> '$(basename $image);
    convert $image $dir/charts/`echo $(basename $image) | sed s/svg$/png/`;
  else
    mv $dir/$image $dir/charts;
  fi
done

rm -rf $dir/graphics

dir=$(dirname $0)
for image in $dir/charts/*; do
  donor=`echo $image | grep -o 'chart_.*\.png' | sed -e 's/chart_//' -e 's/\.png//'`;
  if [ ! -d $dir/donors/$donor ];
  then
    mkdir $dir/donors/$donor;
  fi
  cp $dir'/charts/bar_chart_'$donor'.png' $dir/../donors/$donor/influence.png
  cp $dir'/charts/bubble_chart_'$donor'.png' $dir/../donors/$donor/advice.png
  cp $dir'/charts/quartile_chart_'$donor'.png' $dir/../donors/$donor/conf2.png
  cp $dir'/charts/radar_chart_'$donor'.png' $dir/../donors/$donor/comp.png
done
