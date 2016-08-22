import React, { Component } from 'react';
import {DOMParser} from 'xmldom';

NEXBUS_BASE_URI = 'http://webservices.nextbus.com/service/publicXMLFeed?';
MUNI = 'sf-muni';

class Stop {
	constructor(route, stop_xml) {
		this.route = route;
		this.tag = stop_xml.getAttribute('tag');
		this.title = stop_xml.getAttribute('title');
		this.lat = stop_xml.getAttribute('lat');
		this.lon = stop_xml.getAttribute('lon');
		this.direction = 'NONE';
		this.predictions = [];
	}
}

export class StopList extends Component{
	constructor(props) {
		super(props);
	  this.state = {
	  	stop_list : [],
	  	nearby_stops : []
	  };
	  this._loadInitialState();
	}

	_loadInitialState(){
		this._loadStops();
	}

	_loadStops(){
		url = `${NEXBUS_BASE_URI}command=routeConfig&a=${MUNI}&terse`
		this.getXmlFromApi(url).then((doc) => {
			stop_list = []
			var routeElements = doc.getElementsByTagName("route");
			for (var i = 0; i < routeElements.length; i++){
				this._getRouteStops(routeElements[i]);
			}
		})
		.catch((error) => {
	    console.error(error);
		});
	}

	_getRouteStops(route_xml){
		stop_list = []
		route = route_xml.getAttribute("tag");
		stops = route_xml.getElementsByTagName("stop");
		for (var s = 0; s < stops.length; s++){
			stop = new Stop(route, stops[s]);
			stop_list.push(stop)
		}
		var directions = route_xml.getElementsByTagName("direction");
		this._setDirections(stop_list,directions);
	}

	_setDirections(stop_list, directions) {
	  for (var d = 0; d < directions.length; d++){
			dir_stops = directions[d].getElementsByTagName("stop");
			for (var s = 0; s < dir_stops.length; s++){
				tag = dir_stops[s].getAttribute('tag');
				for (var i = 0; i < stop_list.length; i++){
					if (stop_list[i].tag == tag){
						stop_list[i].direction = directions[d].getAttribute('title');
					}
				}
			}
		}
  }

	getXmlFromApi(url) {
	  return fetch(url)
		  .then((response) => response.text())
		  .then((responseText) => {
		  	var parser = new DOMParser()
		  	var doc = parser.parseFromString(responseText,"text/xml").documentElement
		  	return doc;
		  })
		  .catch((error) => {
		    console.error(error);
		  });
	}
}