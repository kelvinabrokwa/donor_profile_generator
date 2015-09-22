var fs = require('fs');
var path = require('path');
var parse = require('csv-parse');
var extend = require('xtend');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');

var dataCSV = fs.readFileSync(path.join(__dirname, 'data/data.csv'), { encoding: 'utf-8' });
var averageCSV = fs.readFileSync(path.join(__dirname, 'data/averages.csv'), { encoding: 'utf-8' });

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
    parseCSVAverages(averageCSV, data);
  });

  dataCSVParser.write(csv);
  dataCSVParser.end();
}

function parseCSVAverages(csv, data) {
  var averages = [];
  var header = true;
  var record, head;

  var averageCSVParser = parse();

  averageCSVParser.on('readable', function() {
    while (record = averageCSVParser.read()) {
      if (!header) {
        var row = {};
        for (var i = 0; i < record.length; i++) {
          row[head[i]] = record[i];
        }
        averages.push(row);
      } else {
        head = record;
        header = false;
      }
    }
  });

  averageCSVParser.on('finish', function() {
    var bubbleData = generateBubbleChartData(data, averages);
    writeChartsToDisk(bubbleData);
  });

  averageCSVParser.write(csv);
  averageCSVParser.end();
}

function generateBubbleChartData(rawData, averageData) {
  var averageBubbleData = {
    dac: {
      pgc1: {
        q21: +averageData[1]['Q21_PGC1'],
        q14: +averageData[1]['Q14_PGC1'],
        oda: Math.random() * 5
      },
      pgc2: {
        q21: +averageData[1]['Q21_PGC2'],
        q14: +averageData[1]['Q14_PGC2'],
        oda: Math.random() * 5
      },
      pgc3: {
        q21: +averageData[1]['Q21_PGC3'],
        q14: +averageData[1]['Q14_PGC3'],
        oda: Math.random() * 5
      }
    },
    nonDac: {
      pgc1: {
        q21: +averageData[2]['Q21_PGC1'],
        q14: +averageData[2]['Q14_PGC1'],
        oda: Math.random() * 5
      },
      pgc2: {
        q21: +averageData[2]['Q21_PGC2'],
        q14: +averageData[2]['Q14_PGC2'],
        oda: Math.random() * 5
      },
      pgc3: {
        q21: +averageData[2]['Q21_PGC3'],
        q14: +averageData[2]['Q14_PGC3'],
        oda: Math.random() * 5
      }
    },
    multi: {
      pgc1: {
        q21: +averageData[0]['Q21_PGC1'],
        q14: +averageData[0]['Q14_PGC1'],
        oda: Math.random() * 5
      },
      pgc2: {
        q21: +averageData[0]['Q21_PGC2'],
        q14: +averageData[0]['Q14_PGC2'],
        oda: Math.random() * 5
      },
      pgc3: {
        q21: +averageData[0]['Q21_PGC3'],
        q14: +averageData[0]['Q14_PGC3'],
        oda: Math.random() * 5
      }
    }
  };

  var allBubbleData = [];
  var obj, name, type;
  for (var i = 0; i < rawData.length; i++) {
    name = rawData[i]['Name of Donor'];
    if (rawData[i]['Multilateral'])
      type = 'multi';
    else if (rawData[i]['DAC Bilateral'])
      type = 'dac';
    else
      type = 'nonDac';
    obj = {};
    obj[name] = {
      pgc1: {
        type: type,
        q14: +rawData[i]['Q14_PGC1'],
        q21: +rawData[i]['Q21_PGC1'],
        oda: Math.random() * 5
      },
      pgc2: {
        type: type,
        q14: +rawData[i]['Q14_PGC2'],
        q21: +rawData[i]['Q21_PGC2'],
        oda: Math.random() * 5
      },
      pgc3: {
        type: type,
        q14: +rawData[i]['Q14_PGC3'],
        q21: +rawData[i]['Q21_PGC3'],
        oda: Math.random() * 5
      }
    };
    allBubbleData.push(flatten(averageBubbleData).concat(flatten(obj)));
  }
  return allBubbleData;
}

function flatten(d) {
  var flattened = [];
  for (var key in d) {
    for (var sub in d[key]) {
      var bubble = {
        donor: key,
        type: sub
      };
      bubble = extend(bubble, d[key][sub]);
      flattened.push(bubble);
    }
  }
  return flattened;
}

function writeChartsToDisk(bubbleData, i) {
  if (!i) i = 0;
  var donor = bubbleData[i].filter(function(d) {
    return ['multi', 'dac', 'nonDac'].indexOf(d.donor) < 0;
  })[0].donor;
  var scripts = [
    'http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min.js',
    path.join('file://', __dirname, 'd3bubbles.js')
  ];
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html><div class="chart"></div>',
    scripts: scripts,
    done: function(err, window) {
      if (err) throw err;
      var svg = window.insertBubbles(bubbleData[i]);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'bubble_chart_' + donor + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      if (++i < bubbleData.length) writeChartsToDisk(bubbleData, i);
    }
  });
}
