import React, { Component } from 'react';
import {DOMParser} from 'xmldom';
import {
	View,
	Text,
	ListView,
	ScrollView,
	AsyncStorage,
	ActivityIndicator,
	RefreshControl
} from 'react-native';
import {mdl, MKSpinner} from 'react-native-material-kit';

NEXTBUS_BASE_URI = 'http://webservices.nextbus.com/service/publicXMLFeed?';
MUNI = 'sf-muni';

uniqueRouteDirs = function(stops){
	var unique = {};
	var distinct = [];
	for( var i in stops ){
	 if( typeof(unique[stops[i].route + stops[i].direction]) == "undefined"){
	  distinct.push(stops[i]);
	 }
	 unique[stops[i].route + stops[i].direction] = 0;
	}
	return distinct;
}

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

		this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

	  this.state = {
	  	stopList : [],
	  	nearbyStops : [],
	  	currentPosition: 'unknown',
	  	timesLoaded : false,
	  	dataSource: this.ds.cloneWithRows([]),
	  	isRefreshing: false,
	  };
	  this._loadInitialState().then(() => this._setPredictions());
	}

	componentDidMount() {
		setInterval(() => this._setPredictions(), 20000);
	}

	_setPredictions(){
		navigator.geolocation.getCurrentPosition(
      (position) => {
        var currentPosition = JSON.stringify(position);
        this.setState({currentPosition});
        nearbyStops = this._getNearbyStops(position);
        this._getPredictions(nearbyStops);
      },
      (error) => console.log(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
	}

	_getPredictions(stops){
		routeAndTag = stops.map((stop) => `stops=${stop.route}|${stop.tag}`)
		URL = `${NEXTBUS_BASE_URI}command=predictionsForMultiStops&a=${MUNI}&${routeAndTag.join('&')}`;
		console.log(URL)
		getXmlFromApiAsync(URL).then((doc) => {
			predictions = doc.getElementsByTagName('predictions') || [];
			for (var i = 0; i < predictions.length; i++){
				routeTag = predictions[i].getAttribute('routeTag');
				if (predictions[i].getElementsByTagName('direction').length == 0) continue;
				direction = predictions[i].getElementsByTagName('direction')[0].getAttribute('title');
				console.log(JSON.stringify(stops.find((stop) => stop.route == routeTag && stop.direction.slice(0,8) == direction.slice(0,8))));
				console.log('-----------------------------');
				cur_predictions = Array.from(predictions[i].getElementsByTagName('prediction') || []).map((stop) => stop.getAttribute('minutes'));
				console.log(cur_predictions)
				stops.find((stop) => stop.route == routeTag && stop.direction.slice(0,8) == direction.slice(0,8)).predictions = cur_predictions;
			}
			this.setState({ 
				nearbyStops: stops,
				dataSource: this.ds.cloneWithRows(stops),
				timesLoaded: true,
				isRefreshing: false
			});
		})
		.catch((error) => {
	    console.error(error);
	  });
	}

	_getNearbyStops(position){
		var lon = position.coords.longitude;
		var lat = position.coords.latitude;
		var nearbyStops = this.state.stopList.filter((stop) => 
				(Math.pow(parseFloat(stop.lon) - lon, 2) + 
				 Math.pow(parseFloat(stop.lat) - lat, 2)) < .00005);

		nearbyStops.sort((stop1,stop2) => 
				(Math.pow(parseFloat(stop1.lon) - lon, 2) + 
				 Math.pow(parseFloat(stop1.lat) - lat, 2)) -

				(Math.pow(parseFloat(stop2.lon) - lon, 2) + 
				 Math.pow(parseFloat(stop2.lat) - lat, 2))
				);

		nearbyStops = uniqueRouteDirs(nearbyStops);
		return nearbyStops;
	}

	async _loadInitialState(){
		try{
			value = await AsyncStorage.getItem('stopList')
			if(value == null){
				this._loadStops();
				console.log('couldn\'t find stops')
			}
			else {
				this.setState({stopList: JSON.parse(value)})
				console.log('found stops');
			}
	  }
	  catch(err) {
	  	console.log(err);
	  }
	}

	_loadStops(){
		url = `${NEXTBUS_BASE_URI}command=routeConfig&a=${MUNI}&terse`
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
		return (
			<ScrollView
			refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => {this.setState({
							isRefreshing: true
						}); this._setPredictions();}}
            title="Loading..."
            colors={['orange', 'blue', '#ff0000']}
          /> }>
			{this.state.nearbyStops.length > 0 ?
			<ListView
				style={{flex:1}}
        dataSource={this.state.dataSource}
        renderRow={(stop) => stop.predictions!=null && stop.predictions.length > 0 ? <Row {...stop} /> : null}
      />
      : null
    	}
      { this.state.timesLoaded ? null : <Spinner text={"Loading Times..."}/>}
    	</ScrollView>
		);
	}
}

const Row = (props) => (
	<View style={{backgroundColor: 'white', marginBottom: 15}}>
    <Text lineBreakMode="tail" numberOfLines={4} style={{fontSize: 19, fontFamily:'Lato-Regular', padding: 15}}>
      <Text style={{fontFamily: 'Lato-Bold'}}>{props.route}{'\n'}</Text>{props.direction}{'\n'}
      at {props.title}{'\n'}
      <Text style={{fontFamily: 'Lato-Bold'}}>in {props.predictions.map((pred) => pred + ' min').join(', ')} </Text>
    </Text>
  </View>
);

class Spinner extends Component {
	render() {
		return (
			<View style = {{
			marginTop:100,
			flex: 1,
    	justifyContent: 'center',
    	alignItems: 'center'}}>	
	    <ActivityIndicator
	       size="large"
	       color="#E59400"
	     />
	     <Text> {this.props.text} </Text>
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