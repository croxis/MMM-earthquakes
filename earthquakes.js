/*// Map configuration
var width  = 820;
var height = 620;
var rScale = d3.scale.sqrt();
var peoplePerPixel = 50000;
var max_population = [];

// Configuration for the spinning effect
var time = Date.now();
var rotate = [0, 0];
var velocity = [.015, -0];

// set projection type and paremetes
var projection = d3.geo.orthographic()
   .scale(300)
   .translate([(width / 2) + 100, height / 2])
   .clipAngle(90)
   .precision(0.3);

// create path variable, empty svg element and group container
var path = d3.geo.path()
   .projection(projection);
var svg = d3.select("svg");
var g = svg.append("g");

// drawing dark grey spehere as landmass
g.append("path")
   .datum({type: "Sphere"})
   .attr("class", "sphere")
   .attr("d", path)
   .attr("fill", "#0D0D0D");

// loading city locations from geoJSON
d3.json("geonames_cities_100k.geojson", function(error, data) {

         // Handle errors getting and parsing the data
         if (error) { return error; }

         // setting the circle size (not radius!) according to the number of inhabitants per city
         population_array = [];
         for (i = 0; i < data.features.length; i++) {
            population_array.push(data.features[i].properties.population);
         }
         max_population = population_array.sort(d3.descending)[0]
         var rMin = 0;
         var rMax = Math.sqrt(max_population / (peoplePerPixel * Math.PI));
         rScale.domain([0, max_population]);
         rScale.range([rMin, rMax]);

         path.pointRadius(function(d) {
            return d.properties ? rScale(d.properties.population) : 1;

         });

         // Drawing transparent circle markers for cities
         g.selectAll("path.cities").data(data.features)
            .enter().append("path")
            .attr("class", "cities")
            .attr("d", path)
            .attr("fill", "#ffba00")
            .attr("fill-opacity", 0.3);

         // start spinning!
         spinning_globe();
});

function spinning_globe(){
   d3.timer(function() {

      // get current time
      var dt = Date.now() - time;

      // get the new position from modified projection function
      projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);

      // update cities position = redraw
      svg.selectAll("path.cities").attr("d", path);
   });

}*/

Module.register("earthquakes", {  
    defaults: {
        fetchInterval: 5 * 60 * 1000, // How often to fetch from USGS, which updates their feeds every five minutes
        rotationSpeed: 0.01,
        updateInterval: 0.1 * 60 * 1000 // How often to update from the tracker
    },
    // Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);
		// Schedule update interval.
        this.name = "earthquakes";
        this.earthquakes = [];
        this.loaded = false;
		this.sendSocketNotification("UPDATE_EARTHQUAKES", {
        });
        this.sendSocketNotification("GET_EARTHQUAKES", {
        });
    },
    // Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
        Log.info("Earthquake setup");
		if (notification === "EARTHQUAKE_ITEMS") {
			this.generateFeed(payload);
			if (!this.loaded) {
				this.scheduleUpdateInterval();
			}
			this.loaded = true;
		}
    },
    // Override dom generator.
    getDom: function() {
        Log.info("Get Dom Start: " + Object.keys(this.config));
        var wrapper = document.createElement("canvas");
        //wrapper.style="border:1px solid #00FF00;";
        wrapper.height = wrapper.width;
        //Log.info("Width: " + wrapper.width);
        var context = wrapper.getContext("2d");
        var projection = d3.geoOrthographic().scale(wrapper.width/2).translate([wrapper.width / 2, wrapper.width / 2]);
        var path = d3.geoPath(projection, context);
        var globe = {type: "Sphere"};
        var diameter = 960 / 3,
                radius = diameter / 2,
                velocity = this.config.rotationSpeed;
        d3.json("https://d3js.org/world-110m.v1.json", function(error, world) {
            if (error) throw error;
            context.strokeStyle="grey";
            d3.timer(function(elapsed) {
                var angle = velocity * elapsed;
                var rotate = [0, -23, 0];
                rotate[0] = angle, projection.rotate(rotate);
                context.clearRect(0, 0, diameter, diameter);
                context.beginPath(), path(topojson.mesh(world)), context.stroke();
                context.beginPath(), path(globe), context.stroke();
            });
        });
        return wrapper;
    },
    getScripts: function() {
        return[this.file('d3.js'), this.file('topojson.js')]
    },

    generateFeed: function(feeds){
        this.earthquakes = feeds;
    },

    /* scheduleUpdateInterval()
	 * Schedule visual update.
	 */
	scheduleUpdateInterval: function() {
		var self = this;
        Log.info("Scheduling module: " + this.name);
		//self.updateDom();

		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);

        setInterval(function() {
			self.sendSocketNotification("UPDATE_EARTHQUAKES", {
            });
		}, this.config.fetchInterval);

        setInterval(function() {
			self.sendSocketNotification("GET_EARTHQUAKES", {
            });
		}, this.config.updateInterval);
    },


});