/* global d3 */
/* eslint-disable no-multi-spaces */
function getChart(ranks) { // eslint-disable-line no-unused-vars
  var PX_RATIO = 4 / 3;

  var labelData = [
    'Agenda Setting Influence',
    'Helpfulness in Implementation',
    'Usefulness of Advice'
  ];

  var w = 525 * PX_RATIO,
      h = 125 * PX_RATIO;

  var qWidth = 90 * PX_RATIO,
      qHeight = 15 * PX_RATIO,
      qMargin = 10 * PX_RATIO,
      qTransX = 80 * PX_RATIO,
      qTransY = 15 * PX_RATIO;

  var markerW = 6 * PX_RATIO,
      markerH = 30 * PX_RATIO;

  var qAreaW = (4 * qWidth) + (3 * qMargin);

  var numberOfDonors = 62;

  var svg = d3.select('body').append('svg')
    .attr('width', w)
    .attr('height', h);

  var bars = svg.append('g')
    .attr('transform', translation(qTransX, qTransY));

  bars.selectAll('.bars')
    .data([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2])
    .enter()
    .append('rect')
      .attr('x', function(d, i) { return (qWidth + qMargin) * (i % 4); })
      .attr('y', function(d) { return d * 40 * PX_RATIO; })
      .attr('width', qWidth)
      .attr('height', qHeight)
      .attr('fill', '#000')
      .attr('fill', function(d, i) {
        switch (i % 4) {
          case 0:
            return '#92b5d8';
          case 1:
            return '#76b657';
          case 2:
            return '#FFDD75';
          case 3:
            return '#E31E1E';
        }
      });

  var labels = svg.append('g')
    .attr('transform', translation(0, qTransY));

  labels.selectAll('.label')
    .data(labelData)
    .enter()
    .append('text')
      .text(function(d) { return d; })
      .attr('x', 0)
      .attr('y', function(d, i) { return i * 45 * PX_RATIO; })
      .call(wrap);


  svg.append('g').attr('transform', translation(qTransX, 10))
    .selectAll('.description')
    .data(['Best Performing', 'Median', 'Worst Performing'])
    .enter()
    .append('text')
      .text(function(d) { return d; })
      .attr('y', 0)
      .attr('x', function(d, i) {
        switch (i) {
          case 0:
            return 0;
          case 1:
            return qAreaW / 2;
          case 2:
            return qAreaW;
        }
      })
      .attr('text-anchor', function(d, i) {
        switch (i) {
          case 0:
            return 'left';
          case 1:
            return 'middle';
          case 2:
            return 'right';
        }
      });

  // median markers
  svg.append('g').attr('transform', translation(qTransX, qTransY - 10)).selectAll('.marker')
    .data([0, 1, 2])
    .enter()
    .append('rect')
      .attr('x', (qAreaW - markerW) / 2)
      .attr('y', function(d) { return  d * 40 * PX_RATIO; })
      .attr('width', markerW)
      .attr('height', markerH)
      .attr('fill', '#A9A9A9');

  // rank markers
  svg.append('g').attr('transform', translation(qTransX, qTransY - 10)).selectAll('.rankMarker')
    .data(ranks.data)
    .enter()
    .append('rect')
      .attr('x', function(d) { return (d / numberOfDonors) * qAreaW; })
      .attr('y', function(d, i) { return i * 40 * PX_RATIO; })
      .attr('width', markerW)
      .attr('height', markerH)
      .attr('fill', '#000');

  // rank marker labels
  svg.append('g').attr('transform', translation(qTransX, qTransY - 10)).selectAll('.rankMarkerLabel')
    .data(ranks.data)
    .enter()
    .append('text')
      .text(ranks.donor)
      .attr('x', function(d) { return (d / numberOfDonors) * qAreaW + 7; })
      .attr('y', function(d, i) { return i * 40 * PX_RATIO + (markerH) + 5; });

  svg.selectAll('text')
    .style('font-family', 'Helvetica')
    .style('font-size', '14');

  function translation(x, y) {
    return 'translate(' + (x * PX_RATIO) + ',' + (y * PX_RATIO) + ')';
  }

  // remix of http://bl.ocks.org/mbostock/7555321 that will run in jsdom
  // shout out to @mbostock, luh u boo
  function wrap(text) {
    text.each(function() {
      var text = d3.select(this), // eslint-disable-line no-shadow
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr('y'),
          dy = 0,
          tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (line.join().length > 14) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
        }
      }
    });
  }
  return document.getElementsByTagName('svg')[0];
}
