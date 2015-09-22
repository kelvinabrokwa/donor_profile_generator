var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var parse = require('csv-parse');
var xmlserializer = require('xmlserializer');

var dataCSV = fs.readFileSync(path.join(__dirname, 'data/data.csv'), { encoding: 'utf-8' });

parseData(dataCSV);

function parseData(csv) {
  var data = [];
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
    generateChartData(data);
  });

  dataCSVParser.write(csv);

  dataCSVParser.end();
}

function generateChartData(csv) {
  var data = csv.map(function(d) {
    return {
      donor: d['Name of Donor'],
      data: [
        +d['Q21_Rank'] || 62,
        +d['Q25_Rank'] || 62,
        +d['Q14_Rank'] || 62
      ]
    };
  });
  writeChartsToDisk(data);
}

function writeChartsToDisk(data, i) {
  if (!i) i = 0;
  var scripts = [
    'http://d3js.org/d3.v3.min.js',
    path.join('file://', __dirname, 'd3_quartiles.js')
  ];
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html>',
    scripts: scripts,
    done: function(err, window) {
      if (err) {
        return;
      }
      var svg = window.getChart(data[i]);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'quartile_chart_' + data[i].donor + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      if (++i < data.length) writeChartsToDisk(data, i);
    }
  });
}
