

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  DrawerLayoutAndroid
} from 'react-native';

import {Toolbar} from './toolbar.js';

export class SideDrawerLayout extends Component {
  render() {
    var navigationView = (
      <View style={styles.drawer}>
        <Text style={styles.drawer_text}>I'm in the Drawer!</Text>
      </View>
    );
    return (
      <DrawerLayoutAndroid
        ref = {(drawer) => {this.openDrawer = drawer.openDrawer; this.closeDrawer = drawer.closeDrawer;}}
        drawerWidth={300}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={() => navigationView}>
        <View style={styles.page_contents}>
          <Toolbar onClick = {() => {this.openDrawer()} }/>
          {this.props.children}
        </View>
      </DrawerLayoutAndroid>
    );
  }
}


const styles = StyleSheet.create({
  drawer_text: {
    margin: 10, 
    fontSize: 15, 
    textAlign: 'left'
  },
  drawer: {
    flex: 1, 
    backgroundColor: 'orange'
  },
});