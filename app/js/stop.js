import React, { Component } from 'react';
import {DOMParser} from 'xmldom';
import {
	View,
	Text,
	ListView,
	AsyncStorage
} from 'react-native';

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

getXmlFromApiAsync = function(url) {
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

export class NearbyStops extends Component{
	constructor(props) {
		super(props);
	  this.state = {
	  	stopList : [],
	  	nearbyStops : []
	  };
	  this._loadInitialState();
	}

	_loadInitialState(){
		return AsyncStorage.getItem('stopList')
      .then(req => JSON.parse(req))
      .then(json => this.setState({stopList : json}))
      .catch(error => this._loadStops());
	}

	_loadStops(){
		url = `${NEXBUS_BASE_URI}command=routeConfig&a=${MUNI}&terse`
		getXmlFromApiAsync(url).then((doc) => {
			var stopList = this._getAllStops(doc);
			alert(stopList)
			AsyncStorage.setItem('stopList',JSON.stringify(stopList))
      .then(json => this.setState({stopList: stopList}))
      .catch(error => console.log('error!'));
		})
	}

	_getAllStops(doc){
		var stopList = [];
		var routeElements = doc.getElementsByTagName("route");
		for (var i = 0; i < routeElements.length; i++){
			routeStops = new StopList(routeElements[i]);
			stopList = stopList.concat(routeStops.getRouteStops());
		}
		return stopList;
	}

	render() {
		return (
			<View>
				<Text>{JSON.stringify(this.state.stopList[1])}</Text>
			</View>
		);
	}
}

class StopList {
	constructor(route_xml) {
	  this.route = route_xml.getAttribute("tag");
	  this.stops = route_xml.getElementsByTagName("stop");
	  this.directions = route_xml.getElementsByTagName("direction");
	}

	getRouteStops(route_xml){
		var stopList = [];
		for (var s = 0; s < this.stops.length; s++){
			stop = new Stop(this.route, this.stops[s]);
			stopList.push(stop)
		}
		this._setDirections(stopList);
		return stopList;
	}

	_setDirections(stopList) {
	  for (var d = 0; d < this.directions.length; d++){
			dir_stops = this.directions[d].getElementsByTagName("stop");
			for (var s = 0; s < dir_stops.length; s++){
				tag = dir_stops[s].getAttribute('tag');
				for (var i = 0; i < stopList.length; i++){
					if (stopList[i].tag == tag){
						stopList[i].direction = this.directions[d].getAttribute('title');
					}
				}
			}
		}
  }
}