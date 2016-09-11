import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';

import { NearbyStops } from '../js/stop'
import { SideDrawerLayout } from '../components/SideDrawer';

export class App extends Component {
  render() {
    return (
      <View style={styles.container}>
      <StatusBar
       backgroundColor="#E59400"
       barStyle="light-content"
      />
      <SideDrawerLayout>
        <NearbyStops/>
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