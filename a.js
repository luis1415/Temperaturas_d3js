
!(function (d3) {

$("acontent").empty();

var data = [];
function cargarDatos(){
  d3.csv("temperaturas.csv", function(err, datos) {
    data = datos;
    console.log(data);
    graficar(data);
  });
};

cargarDatos();

console.log(data);
var es_ES = {
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["€", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d/%m/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
    "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};

var ES = d3.locale(es_ES);

function graficar(data){

  var margin = {top: 20, right: 80, bottom: 30, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y%m%d").parse;
  var formatDate = d3.time.format("%Y%m%d").parse;
  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    //.interpolate("basis")
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.temperature);
    });

  var svg = d3.select("acontent").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // var data = d3.tsv.parse(myData);
  color.domain(d3.keys(data[0]).filter(function(key) {
    return key !== "date";
  }));
  data.forEach(function(d) {
    d.date = (parseDate(d.date));
  });

  var cities = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {
          date: d.date,
          temperature: +d[name]
        };
      })
    };
  });
  x.domain(d3.extent(data, function(d) {
    return d.date;
  }));
  y.domain([
    d3.min(cities, function(c) {
      return d3.min(c.values, function(v) {
        return v.temperature;
      });
    }),
    d3.max(cities, function(c) {
      return d3.max(c.values, function(v) {
        return v.temperature;
      });
    })
  ]);
  var legend = svg.selectAll('g')
    .data(cities)
    .enter()
    .append('g')
    .attr('class', 'legend');

  legend.append('rect')
    .attr('x', width - 20)
    .attr('y', function(d, i) {
      return i * 20;
    })
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d) {
      return color(d.name);
    });
  legend.append('text')
    .attr('x', width - 8)
    .attr('y', function(d, i) {
      return (i * 20) + 9;
    })
    .text(function(d) {
      return d.name;
    });

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Temperatura (ºC)");
  var city = svg.selectAll(".city")
    .data(cities)
    .enter().append("g")
    .attr("class", "city");
  city.append("path")
    .attr("class", "line")
    .attr("d", function(d) {
      return line(d.values);
    })
    .style("stroke", function(d) {
      return color(d.name);
    });
  city.append("text")
    .datum(function(d) {
      return {
        name: d.name,
        value: d.values[d.values.length - 1]
      };
    })
    .attr("transform", function(d) {
      return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
    })
    .attr("x", 3)
    .attr("dy", ".35em")
    .text(function(d) {
      return d.name;
    });
  var mouseG = svg.append("g")
    .attr("class", "mouse-over-effects");
  mouseG.append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  var lines = document.getElementsByClassName('line');
  var mousePerLine = mouseG.selectAll('.mouse-per-line')
    .data(cities)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");
  mousePerLine.append("circle")
    .attr("r", 10)
    .style("stroke", function(d) {
      return color(d.name);
    })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");
  mousePerLine.append("text")
    .attr("transform", "translate(10,3)");
  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', width) // can't catch mouse events on a g element
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function() { // on mouse out hide line, circles and text
      d3.select(".mouse-line")
        .style("opacity", "0");
      d3.selectAll(".mouse-per-line circle")
        .style("opacity", "0");
      d3.selectAll(".mouse-per-line text")
        .style("opacity", "0");
    })
    .on('mouseover', function() { // on mouse in show line, circles and text
      d3.select(".mouse-line")
        .style("opacity", "1");
      d3.selectAll(".mouse-per-line circle")
        .style("opacity", "1");
      d3.selectAll(".mouse-per-line text")
        .style("opacity", "1");
    })
    .on('mousemove', function() { // mouse moving over canvas
      var mouse = d3.mouse(this);
      d3.select(".mouse-line")
        .attr("d", function() {
          var d = "M" + mouse[0] + "," + height;
          d += " " + mouse[0] + "," + 0;
          return d;
        });
      d3.selectAll(".mouse-per-line")
        .attr("transform", function(d, i) {
          console.log(width/mouse[0])
          var xDate = x.invert(mouse[0]),
              bisect = d3.bisector(function(d) { return d.date; }).right;
              idx = bisect(d.values, xDate);

          var beginning = 0,
              end = lines[i].getTotalLength(),
              target = null;
          while (true){
            target = Math.floor((beginning + end) / 2);
            pos = lines[i].getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                break;
            }
            if (pos.x > mouse[0])      end = target;
            else if (pos.x < mouse[0]) beginning = target;
            else break; //position found
          }

          d3.select(this).select('text')
            .text(y.invert(pos.y).toFixed(2));

          return "translate(" + mouse[0] + "," + pos.y +")";
        });
    });
};

})(d3);
