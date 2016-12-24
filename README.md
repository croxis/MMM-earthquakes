# Module Earthquake
Display recent Earthquakes from the USGS feed

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'earthquakes',
		position: 'top_right',	// This can be any of the regions.
		header: 'Earthquakes',
        	config: {  
			// No Config Yet
            	}
        }
	}
]
````
