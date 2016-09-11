'use strict';

import React, { Component, ReactCSSTransitionGroup } from 'react';

import {
  StyleSheet,
  View,
  ToolbarAndroid,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import {MKTextField, MKColor, mdl} from 'react-native-material-kit';

export class Toolbar extends Component {
	constructor(props) {
    super(props);
    this.state = {
    	showSearch: false,
    };
    Icon.getImageSource('search', 24, 'white').then((source) => this.setState({ searchIcon: source }));
  }
	render() {
		return (
			<View style={styles.toolbar_container}>
				<Icon.ToolbarAndroid
				    title="MuniLife"
				    style={styles.toolbar} 
				    actions={[{title: 'search', icon: this.state.searchIcon, show: 'always'}]}
				    onActionSelected={this.onActionSelected.bind(this)}
				    navIconName="bars"
				    titleColor="#fff"
				    iconColor="#fff"
				    onIconClicked={this.props.onClick}>
        	{ this.state.showSearch ? <SearchFilter key='a'/> : null }
        	</Icon.ToolbarAndroid>
			</View>
		);
	}
	onActionSelected(position) {
		if (position === 0){
			this.setState({showSearch: !this.state.showSearch});
		}
	}
}

export class SearchFilter extends Component {
	constructor(props) {
	  super(props);
	
	  this.state = {
	  	fadeAnim: new Animated.Value(0),
	  	h: new Animated.Value(0),
	  	w: new Animated.Value(0),
	  	searchString: ''
	  };
	}

	componentDidMount() {
		Animated.timing(        
       this.state.fadeAnim,  
       {toValue: .6, duration: 300}            
    ).start();

		Animated.timing(        
       this.state.h,  
       {toValue: 56, duration: 200}            
    ).start();
    Animated.timing(        
       this.state.w,  
       {toValue: Dimensions.get('window').width/1.5, duration: 300}            
    ).start();
	}

	handleChange(text){
    this.setState({searchString: text});
  }

	render() {
		var searchString = this.state.searchString.trim().toLowerCase();
		
		// if(searchString.length > 0){
  //       stops = stops.filter( (stop) => stop.route.toLowerCase().match( searchString ) );
  //   }
		return (
			<Animated.View          // Special animatable View
         style={{opacity: this.state.fadeAnim, width: this.state.w}}>
			<TextInput
				autoFocus={true}
				value={this.state.searchString}
				onChangeText={(text) => this.handleChange(text)}
			  placeholder='Filter by Route'
			  placeholderTextColor='white'
			  underlineColorAndroid='white'
			  fontFamily='Lato-Regular'
			  style={styles.search_filter}
			/>
			</Animated.View>
		);
	}
}

const styles = StyleSheet.create({
	toolbar_container: {

  },
  toolbar: {
    height: 56,
    backgroundColor: 'orange',
  },
  search_filter: {
  	height: 50,
  	fontWeight: '100',
  	color:'white',
  	textAlign: 'center'
  },
  search_text: {
  	textAlign: 'center'
  }
});
