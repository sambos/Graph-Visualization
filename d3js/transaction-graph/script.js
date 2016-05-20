var width = 800,
    height = 800

function getQueryParam(param) {
    var found;
    window.location.search.substr(1).split("&").forEach(function(item) {
        if (param ==  item.split("=")[0]) {
            found = item.split("=")[1];
        }
    });
    return found;
};

function listProperties(obj) {
   var propList = "";
   for(var propName in obj) {
      if(typeof(obj[propName]) != "undefined" && typeof obj[propName] != "function") {
         propList += ("<b>"+ propName +":</b> " + obj[propName]+"<br/>");
      }
   }
return propList;
}

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.select("body").append("p");
        svg.append("svg:defs")
                    .selectAll("marker")
                    .data(["end"]) 
                    .enter().append("svg:marker")
                    .attr("id", String)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 15)
                   // .attr("refY", -1.5)
                    .attr("markerWidth", 10)
                    .attr("markerHeight", 10)
                    .attr("orient", "auto")
                    .append("svg:path")
                    .attr("d", "M0,-5L10,0L0,5")
					 .attr('fill', 'black');
					
var force = d3.layout.force()
    .gravity(.05)
    .distance(70)
    .charge(-100)
    .size([width, height]);
	
var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

var defaultFile = "dag.json";
var jsonFile = getQueryParam("file");
if(jsonFile == null) jsonFile = defaultFile;

d3.json(jsonFile, function(error, json) {
  var edges = [];
    json.Links.forEach(function(e) { 
    var sourceNode = json.Nodes.filter(function(n) { return n.Id === e.Source; })[0],
    targetNode = json.Nodes.filter(function(n) { return n.Id === e.Target; })[0];
    	
    edges.push({source: sourceNode, target: targetNode, value: e.Value});
    });
    
  force
      .nodes(json.Nodes)
      .links(edges)
      .start();

  var link = svg.selectAll(".link")
      .data(edges)
    .enter().append("line")
                    .style("stroke", "red")
                    .style("stroke-width", 1)
				.attr("marker-end", "url(#end)");					
      //.attr("class", "link");

  var node = svg.selectAll(".node")
      .data(json.Nodes)
    .enter().append("g")
      .attr("class", function(d) { return d.Name; })
      .call(force.drag);

  node.append("circle")
      .attr("class", "node")
      .attr("r", 10)
	  .attr("opacity", 0.7)
	  .text(function(d) { return "node"; })
	  .on("mouseover", function(d) { 
			div.transition()        
                .duration(200)      
                .style("opacity", .9);
		div.html(listProperties(d)) 
		.style("left", (d3.event.pageX) + "px")     
        .style("top", (d3.event.pageY - 28) + "px"); 
		})
	  .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
		
  node.append("svg:a")
      .attr("xlink:href", function(d){return d.Url;})
      .append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.Name})

  
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});