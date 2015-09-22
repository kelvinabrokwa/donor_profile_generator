var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var parse = require('csv-parse');
var R = require('ramda');
var xmlserializer = require('xmlserializer');

var dataCSV = fs.readFileSync(path.join(__dirname, 'data/data.csv'), { encoding: 'utf-8' });
var countryCSV = fs.readFileSync(path.join(__dirname, 'data/country.csv'), { encoding: 'utf-8' });

var countryKeys, data;

parseCountries(countryCSV);

function parseCountries(csv) {
  countryKeys = {};
  var header = true;
  var countryCSVParser = parse();
  var record;

  countryCSVParser.on('readable', function() {
    while (record = countryCSVParser.read()) {
      if (!header) {
        countryKeys[record[0]] = record[3];
      } else {
        header = false;
      }
    }
  });

  countryCSVParser.on('finish', function() {
    parseData(dataCSV);
  });

  countryCSVParser.write(csv);

  countryCSVParser.end();
}

function parseData(csv) {
  data = [];
  var header = true;
  var row, record, head;

  var dataCSVParser = parse();

  dataCSVParser.on('readable', function() {
    while (record = dataCSVParser.read()) {
      if (!header) {
        row = {};
        for (var i = 0; i < record.length; i++) {
          row[head[i]] = record[i];
        }
        data.push(row);
      } else {
        head = record;
        header = false;
      }
    }
  });

  dataCSVParser.on('finish', function() {
    generateBarChartData(data);
  });

  dataCSVParser.write(csv);

  dataCSVParser.end();
}

function generateBarChartData(rawData) {
  var barData = rawData.map(function(donor) {

    var donorData = {};

    donorData.name = donor['Name of Donor'];

    var q21Keys = Object.keys(donor).filter(function(key) {
      return key.indexOf('Q21_C') > -1;
    });

    var order = function(a, b) { return parseInt(a.q21) - parseInt(b.q21); };
    donorData.top5 = R.take(5, R.sort(order, q21Keys.map(function(key) {
      var countryCode = key.match(/C\d*$/)[0];
      return {
        countryName: countryKeys[countryCode],
        q14: parseInt(donor['Q14_' + countryCode] || 0),
        q25: parseInt(donor['Q25_' + countryCode] || 0),
        q21: donor[key]
      };
    })));

    return donorData;
  });
  writeChartsToDisk(barData);
}

function writeChartsToDisk(barData, i) {
  if (!i) i = 0;
  var donorData = barData[i].top5.map(function(d) {
    return {
      group: d.countryName,
      q14: d.q14 || 0,
      q21: d.q21 || 0
    };
  });
  var scripts = [
    'http://d3js.org/d3.v3.min.js',
    path.join('file://', __dirname, 'd3_bars.js')
  ];
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html>',
    scripts: scripts,
    done: function(err, window) {
      if (err) {
        console.log('Error generating bar chart for:', barData[i].name);
        return console.log(err);
      }
      var svg = window.getChart(donorData);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'bar_chart_' + barData[i].name + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      if (++i < barData.length) writeChartsToDisk(barData, i);
    }
  });
}
