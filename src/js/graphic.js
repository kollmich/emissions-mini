import cleanData from './clean-data';

const MARGIN = {
  top: 20,
  bottom: 60,
  left: 200,
  right: 50
}

const FONT_SIZE = 12;
const GOLDEN_REC = 0.618
const GOLDEN_RAT = 1.618
let width = 0;
let height = 0;
let emissionsData = null;
let $transTime = 0;
/* global d3 */
const $section = d3.select('#main');
const $graphic = $section.select('.scroll__graphic');
const $text = $section.select('.scroll__text');
const $step = $text.selectAll('.step');

const $chart = $graphic.select('.graphic__chart');
const $svg = $chart.select('svg');
const $gVis = $svg.select('.g-vis');
const $gAxis = $svg.select('.g-axis');


function getScaleXemission(data) {
  return d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.savings_kg)])
    .range([0, width])
    .nice();
}

function getScaleYemission(data) {
  return d3
    .scaleBand()
    .domain(data.sort((a, b) => a.savings_kg - b.savings_kg).map(d => d.activity))
    .range([height, 0])
    .padding(1);
}


function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr("x"),
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")) ? parseFloat(text.attr("dy")) : 0,
      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(" "))
      if (tspan.node().getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(" "))
        line = [word]
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
      }
    }
  })
}


function cleveland() {
  const data = emissionsData;
  const scaleX = getScaleXemission(data);
  const scaleY = getScaleYemission(data);

    //AXES
    const axisY = d3.axisLeft(scaleY)
      .tickPadding(FONT_SIZE / 2);

    $gAxis.select('.axis--y')
      .call(axisY)
      .at({
        transform: `translate(${MARGIN.left},${MARGIN.top})`
      });

    const axisX = d3.axisBottom(scaleX)
      .tickPadding(FONT_SIZE / 2)
      .tickFormat(d3.format("d"));

    $gAxis.select('.axis--x')
      .call(axisX)
      .at({
        transform: `translate(${MARGIN.left},${height+MARGIN.top})`
      });

    //INVISIBLE STROKES
    // $gAxis.select('.axis--y path')
    //   .style("stroke", "#fff");

    // $gAxis.selectAll('.axis--y line')
    //   .style("stroke", "#fff");

    // $gAxis.select('.axis--x path')
    //   .style("stroke", "#fff");

    //VIZ
    //define .emission objects carrying datapoints
    const $emission= $gVis
      .select('.emissions')
      .selectAll('.emission')
      .data(data);

    const $emissionEnter = $emission.enter().append('g.emission');

    // //update paths/circles/rects with .merge  
    const $emissionMerge = $emissionEnter.merge($emission);

    const $tooltip = d3.select("body").append("div.tooltip")
      .st({
        "position": "absolute",
        "z-index": "10",
        "visibility": "hidden",
        "padding": "5px",
        "background-color": "white",
        "opacity": "0.8",
        "border": "1px solid #ddd",
        "border-radius": "5%",
        "max-width": "200px"
      })
      .st({
        "text-align": "center",
      });

    $emissionEnter
      .append('line')
      .on("mouseover", function(){
        $gVis.select('.callout')
          .selectAll('*')
          .remove();
        return $tooltip.style("visibility", "visible").text(Math.floor(this.__data__['savings_kg']) + ' kg carbon dioxide')
      })
      .on("mousemove", function(){return $tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
      .on("mouseout", function(){return $tooltip.style("visibility", "hidden");});

    $emissionMerge
      .selectAll('.emission line')
      .at({
        x1: function (d) {
          return scaleX(0);
        },
        x2: function (d) {
          return scaleX(d.savings_kg);
        },
        y1: function (d) {
          return scaleY(d.activity);
        },
        y2: function (d) {
          return scaleY(d.activity);
        }
      });

    //add emission circles  
    // $emissionEnter.append('circle.old')
    //   .on("mouseover", function(){
    //     $gVis.select('.callout')
    //       .selectAll('*')
    //       .remove();
    //     return $tooltip.style("visibility", "visible").text(Math.floor(this.__data__['savings_kg']) + ' kg carbon dioxide')
    //   })
    //   .on("mousemove", function(){return $tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    //   .on("mouseout", function(){return $tooltip.style("visibility", "hidden");});

    // $emissionMerge
    //   .selectAll('circle.old')
    //   .at({
    //     cx: function (d) {
    //       return scaleX(d.savings_kg);
    //     },
    //     cy: function (d) {
    //       return scaleY(d.activity);
    //     },
    //     r: 1 + width * 0.015
    //   });
}

function updateDimensions() {
  const h = window.innerHeight;
  width = $chart.node().offsetWidth - MARGIN.left - MARGIN.right;
  height = Math.floor(h * 0.8) - MARGIN.top - MARGIN.bottom;
}


function resize() {
  updateDimensions();
  $svg.at({
    width: width + MARGIN.left + MARGIN.right,
    height: height + MARGIN.top + MARGIN.bottom
  });
  $gVis.at('transform', `translate(${MARGIN.left},${MARGIN.top})`);
  $step.st('height', Math.floor(window.innerHeight * 0.3));
  cleveland();
}

function loadData() {
  return new Promise((resolve, reject) => {
    d3.loadData('assets/data/emissions_data.csv', (err, response) => {
      if (err) reject(err)
      emissionsData = cleanData.cleanData(response[0]).filter(function(d) {
        return d.activity != "Buy green energy" 
        && d.activity != "Hang-dry clothes" 
        && d.activity != "Switch electric car to car free"   
        && d.activity != "Replace typical car with hybrid"    
        && d.activity != "Wash clothes in cold water"     
        && d.activity != "Upgrade light bulbs"     
      });
      console.log(emissionsData);
      resolve();
    });
  })
}

function init() {
  loadData().then(() => {
    //console.log(emissionsData);
    // cleveland();
    resize();
  });
}

export default {
  init,
  resize
};
