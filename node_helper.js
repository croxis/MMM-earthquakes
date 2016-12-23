var NodeHelper = require("node_helper");
var request = require("request");
module.exports = NodeHelper.create({
    start: function() {
		this.earthquakes = [];

		console.log("Starting node helper for: " + this.name);
		this.updateFeeds();
		this.broadcastFeeds();
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "UPDATE_EARTHQUAKES") {
			console.log("Updating Earthquakes");
			this.updateFeeds();
			return;
		}
		if (notification === "GET_EARTHQUAKES") {
			this.broadcastFeeds();
			return;
		}
	},

	updateFeeds: function() {
		var urls = ['http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
					'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
					'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
					'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson'];
		earthquakes = [];

		for (var url in urls) {
			console.log("Processing URL: " + url)
			request(urls[url], function(error, response, body){
				if (!error && response.statusCode == 200) {
					console.log("Hit")
					var result = JSON.parse(body);
					console.log("Running")
					//console.log(result.features);
					for (var f in result.features){
						var feature = result.features[f];
						var earthquake = {};
						earthquake.longitude = feature.geometry.coordinates[0];
						earthquake.latitude = feature.geometry.coordinates[1];
						earthquake.depth = feature.geometry.coordinates[2];
						earthquake.mag = feature.properties.mag;
						console.log("Earthquake " + f + ": " + earthquake.mag);
						earthquakes.push(earthquake);
					}
				}
			});
			console.log("Earthquakes: " + earthquakes);
		}
	},

	/* broadcastFeeds()
	 * Creates an object with all feed items of the different registered feeds, 
	 * and broadcasts these using sendSocketNotification.
	 * 
	 * Feed list: http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
	 */
	broadcastFeeds: function() {
		this.sendSocketNotification("EARTHQUAKE_ITEMS", earthquakes);
	}
});