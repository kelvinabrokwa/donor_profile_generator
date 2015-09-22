/*  global d3 */
function insertBubbles(data) { //eslint-disable-line no-unused-vars
  var PX_RATIO = 4 / 3;

  var width = 280 * PX_RATIO;
  var height = 130 * PX_RATIO;
  var margin = 35 * PX_RATIO;

  var labelX = 'Official Development Assistance (USD in Millions)';
  var labelY = 'Level of Usefulness of Advice (1-5)';

  var svg = d3.select('.chart')
    .append('svg')
    .attr('attr', 'chart')
    .attr('width', width + 2 * margin)
    .attr('height', height + 2 * margin)
    .append('g')
    .style('font-family', 'Helvetica')
    .style('font-size', '12px')
    .attr('transform', 'translate(' + margin + ',' + margin + ')');

  var x = d3.scale.linear()
    .domain([
      d3.min(data, function(d) { return d.oda; }),
      d3.max(data, function(d) { return d.oda; })
    ])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([
      d3.min(data, function(d) { return d.q14; }),
      d3.max(data, function(d) { return d.q14; })
    ])
    .range([height, 0]);

  var scale = d3.scale.linear()
    .domain([
      d3.min(data, function(d) { return d.q21; }),
      d3.max(data, function(d) { return d.q21; })
    ])
    .range([0, 20]);

  var xAxis = d3.svg.axis().scale(x);
  var yAxis = d3.svg.axis().scale(y).orient('left');

  // y axis
  svg.append('g')
    .attr('class', 'y axis')
    .style('shape-rendering', 'crispEdges')
    .style('stroke', '#000')
    .style('fill', 'none')
    .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin + 1)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text(labelY);

  // x axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .style('shape-rendering', 'crispEdges')
    .style('stroke', '#000')
    .style('fill', 'none')
    .call(xAxis)
    .append('text')
      .attr('x', width / 2)
      .attr('y', margin - 10)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text(labelX);

  // circles
  svg.append('g').selectAll('circle')
    .data(data)
    .enter()
    .insert('circle')
    .attr('opacity', 0.8)
    .attr('r', function(d) { return scale(d.q21) * 1.2; })
    .style('fill', function(d) {
      switch (d.donor) {
        case 'dac':
          return '#76b657';
        case 'nonDac':
          return '#92b5d8';
        case 'multi':
          return '#e66233';
        default:
          if (d.type === 'dac') {
            return '#76b657';
          } else if (d.type === 'nonDac') {
            return '#92b5d8';
          } else {
            return '#e66233';
          }
      }
    })
    .attr('cx', function(d) { return x(d.oda); })
    .attr('cy', function(d) { return y(d.q14); });


  // bubble labels
  svg.append('g').selectAll('.labels')
    .data(data)
    .enter()
    .append('text')
      .text(function(d) { return d.donor.replace(/_/g, ' '); })
      .attr('x', function(d) { return x(d.oda); })
      .attr('y', function(d) { return y(d.q14); })
      .style('text-anchor', 'middle');

  d3.selectAll('text')
    .style('fill', '#000')
    .style('font-family', 'Helvetica')
    .style('font-size', '8')
    .style('font-weight', 'normal')
    .style('stroke', 'none');

  return document.getElementsByTagName('svg')[0];
}
