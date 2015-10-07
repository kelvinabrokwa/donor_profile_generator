#!/usr/bin/env bash

dir=$(dirname $0)

rm -rf $dir/donor-profiles

if [ -e $dir/donor-profiles.zip ]; then
  rm donor-profiles.zip;
fi

mkdir donor-profiles

for donor in $dir/donors/*; do
  cp $donor/donor_profile.pdf $dir/donor-profiles/$(basename $donor).pdf
done

zip -r donor-profiles.zip donor-profiles
