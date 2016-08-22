'use strict';

import React, { Component } from 'react';

import {
  StyleSheet,
  View,
  ToolbarAndroid,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import {MKTextField, MKColor, mdl} from 'react-native-material-kit';

export class Toolbar extends Component {
	constructor(props) {
    super(props);
    this.state = {
    	showSearch: false
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
				    onIconClicked={this.props.onClick}/>
        	{ this.state.showSearch ? <SearchFilter /> : null }
			</View>
		);
	}
	onActionSelected(position) {
		if (position === 0){
			this.setState({showSearch: !this.state.showSearch});
		}
	}
}

const styles = StyleSheet.create({
	toolbar_container: {
		flex: 1,
		alignItems: 'stretch', 
		justifyContent: 'flex-start',
  },
  toolbar: {
    height: 56,
    backgroundColor: 'orange',
  },
  search_filter: {
  	height: 50,
  },
  search_text: {
  	textAlign: 'center'
  }
});


export class SearchFilter extends Component {
	componentDidMount() {
		this.focus();
	}
	render() {
		return (
			<MKTextField
				ref={(textfield) => this.focus = () => textfield.focus() }
			  placeholder='Filter by Route'
			  highlightColor='orange'
			  textInputStyle={styles.search_text}
			  style={styles.search_filter}
			/>
		);
	}
}

