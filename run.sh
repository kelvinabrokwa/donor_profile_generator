#!/usr/bin/env bash

dir=$(dirname $0)

rm -rf $dir/graphics $dir/charts
mkdir $dir/graphics $dir/charts

echo 'Creating bar charts...'
node $dir/scripts/bars_viz.js
echo 'Creating bubble charts...'
node $dir/scripts/bubble_viz.js
echo 'Creating radar charts...'
node $dir/scripts/radar_data.js | python $dir/scripts/radar.py
echo  'Creating quartile charts..'
node $dir/scripts/quartile_viz.js

echo 'Converting to PNG...'
for image in $dir/graphics/*; do
  if [[ $image == *"svg"* ]];
  then
    echo 'converting -> '$(basename $image);
    convert -density 500 $image $dir/charts/`echo $(basename $image) | sed s/svg$/png/`;
  else
    mv $dir/$image $dir/charts;
  fi
done

rm -rf $dir/graphics

for image in $dir/charts/*; do
  donor=`echo $image | grep -o 'chart_.*\.png' | sed -e 's/chart_//' -e 's/\.png//'`;

  if [ ! -d $dir/donors/$donor ];
  then
    mkdir $dir/donors/$donor;
  fi

  if [ -e $dir'/assets/maps/'$donor'_map.png' ];
  then
    cp $dir'/assets/maps/'$donor'_map.png' $dir/donors/$donor/map.png
  fi

  if [ -e $dir'/charts/bar_chart_'$donor'.png' ];
  then
    cp $dir'/charts/bar_chart_'$donor'.png' $dir/donors/$donor/influence.png;
  else
    cp $dir'/templates/influence.png' $dir/donors/$donor/influence.png;
  fi

  if [ -e $dir'/charts/bubble_chart_'$donor'.png' ];
  then
    cp $dir'/charts/bubble_chart_'$donor'.png' $dir/donors/$donor/advice.png;
  else
    cp $dir'/templates/advice.png' $dir/donors/$donor/advice.png;
  fi

  if [ -e $dir'/charts/quartile_chart_'$donor'.png' ];
  then
    cp $dir'/charts/quartile_chart_'$donor'.png' $dir/donors/$donor/comp2.png;
  else
    cp $dir'/templates/comp2.png' $dir/donors/$donor/comp2.png;
  fi

  if [ -e $dir'/charts/radar_chart_'$donor'.png' ];
  then
    cp $dir'/charts/radar_chart_'$donor'.png' $dir/donors/$donor/comp.png;
  else
    echo 'radar chart does not exists';
    cp $dir'/templates/comp.png' $dir/donors/$donor/comp.png;
  fi

done

# REMEMBER TO REMOVE THIS
for donor in donors/*; do
  cp $dir'/templates/map.png' $donor;
done

echo 'Creating PDFs...'
python $dir/donor_profile_gen.py
echo 'DONE!'
