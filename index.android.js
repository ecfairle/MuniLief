import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  StatusBar,
  AsyncStorage
} from 'react-native';


import {SideDrawerLayout} from './app/jsx/sidedrawer.js';
import {NearbyStops} from './app/js/stop.js'

class reactTest extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      
    };
  }

  render() {
    return (
      <View style={styles.container}>
      <StatusBar
       backgroundColor="#E59400"
       barStyle="light-content"
     />
      <SideDrawerLayout>
      <NearbyStops/>
       <View style={styles.row}>
          <View style={styles.col}>
          </View>
        </View>
        </SideDrawerLayout>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
});


AppRegistry.registerComponent('reactTest', () => reactTest);
