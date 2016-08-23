import React, { Component } from 'react';
import {DOMParser} from 'xmldom';
import {
	View,
	Text,
	ListView,
	AsyncStorage,
	ActivityIndicator
} from 'react-native';
import {mdl, MKSpinner} from 'react-native-material-kit';

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

class Prediction extends Component {
  render() {
    var stop = this.props.stop;
    predictions = setPredictions(stop.predictions);

    return (
      <li className="mdl-list__item mdl-list__item--three-line">
        <span className="mdl-list__item-primary-content">
        <i className="material-icons md-36 md-light mdl-list__item-avatar">directions_bus</i>
          <span>
            Route: {stop.route} -- {predictions.join(', ')}
          </span>
          <span className="mdl-list__item-text-body">
            {stop.direction} at {stop.title}
          </span>
        </span>
      </li>
    );
  }
};

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
	  	nearbyStops : [],
	  	currentPosition: 'unknown',
	  	stopsLoaded : false
	  };
	  this._loadInitialState().then(() => this._getNearbyStops());
	}

	componentDidMount() {
		setInterval(() => this._getNearbyStops(), 20000);
	}

	_getNearbyStops(){
		navigator.geolocation.getCurrentPosition(
      (position) => {
        var currentPosition = JSON.stringify(position);
        this.setState({currentPosition});
        this._closestStops(position);
      },
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
	}

	_closestStops(position){
		var lon = position.coords.longitude;
		var lat = position.coords.latitude;
		var closeStops = this.state.stopList.filter((stop) => 
				(Math.pow(parseFloat(stop.lon) - lon, 2) + 
				 Math.pow(parseFloat(stop.lat) - lat, 2)) < .00005);

		closeStops.sort((stop1,stop2) => 
				(Math.pow(parseFloat(stop1.lon) - lon, 2) + 
				 Math.pow(parseFloat(stop1.lat) - lat, 2)) -

				(Math.pow(parseFloat(stop2.lon) - lon, 2) + 
				 Math.pow(parseFloat(stop2.lat) - lat, 2))
				);

		this.setState({nearbyStops: closeStops});
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
		var stopItems = this.state.nearbyStops.slice(0,20).map((stop) => <Text>{JSON.stringify(stop)}</Text>);
		return (
			<View>	
				{ this.state.nearbyStops.length > 0 ? this.state.nearbyStops.slice(0,20).map((stop) => <Text>{JSON.stringify(stop)}</Text>) : <Spinner/> }
			</View>
		);
	}
}

class Spinner extends Component {
	render() {
		return (
			<View style = {{height: 500, flex: 1,
    	justifyContent: 'center',
    	alignItems: 'center'}}>	
	    <ActivityIndicator
	       size="large"
	       color="orange"
	     />
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