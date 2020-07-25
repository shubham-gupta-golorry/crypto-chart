// @flow

import React, { Component, PureComponent } from 'react';

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';

import moment from 'moment';
import { LineChart } from 'react-native-chart-kit'

import {
  arrayOf, bool, func, node, number, object, shape, string,
} from 'prop-types';

const subscription = {
  "type": "subscribe",
  "channels": [
    {
      name: "ticker",
      product_ids: ["BTC-USD"]
    }
  ]
};

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: "#FFFFFF",
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `rgba(244, 125, 49, ${opacity})`,
  strokeWidth: 3,
  barPercentage: 0.5,
};

const screenWidth = Math.round(Dimensions.get('window').width);


export class MainScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isConnected: false,
      chartData: {},
    };
    this.data = [];
  }

  componentDidMount() {
    this._connect();
  }

  _updateData = (dataObj) => {
    this.data.push(dataObj);
    this._getChartData();
  }

  _connect = () => {
    var ws = new WebSocket("wss://ws-feed.gdax.com");

    ws.onopen = () => {
        ws.send(JSON.stringify(subscription));
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      const dataObj = {
        price: response.price,
        time: response.time,
      };
      this._updateData(dataObj);
    };

    ws.onclose = e => {
        console.log(
            `Socket is closed. Reconnect will be attempted in bla bla second.`,
            e.reason
        );
    };

    ws.onerror = err => {
        console.error(
            "Socket encountered error: ",
            err.message,
            "Closing socket"
        );

        ws.close();
    };
}

_getChartData = () => {
  dataArray = this.data;
  const labelsArray = [];
  const chartDataArray = [];
  for (i=0;i<dataArray.length;i++) {
    const priceRaw = dataArray[i].price;
    const price = parseFloat(priceRaw);
    let time = dataArray[i].time;
    if (price == NaN || time == undefined){
      continue;
    }
    else {
      time = moment(time).format('LTS');
      labelsArray.push(time);
      chartDataArray.push(price);
    }
  }
  const finalData =  {
    labels: labelsArray,
    datasets: [
      {
      data: chartDataArray,
      }
    ],
  };
  if(finalData.labels.length >= 1){
    this.setState({isLoading: false, chartData: finalData})
  }
}

  render() {
    const { isLoading, chartData } = this.state;
    return (
      <View style= {Styles.container}>
        {isLoading ?
          <ActivityIndicator
            size = "large"
          />
          :
          <View>
            <Text style = {{ fontSize: 16, textAlign: 'center', }}>BTC</Text>
            <LineChart
              data={chartData}
              width={screenWidth}
              height={512}
              verticalLabelRotation={30}
              chartConfig={chartConfig}
              bezier
              withDots = {false}
              yAxisSuffix = "$"
              withInnerLines = {false}
              xAxisInterval = {10}
            />
          </View>
        }
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  container:{
    flex:1,
    padding: 10,
    alignItems: 'center'

  },
})
