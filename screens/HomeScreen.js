import { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Text, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";

import "intl";
import "intl/locale-data/jsonp/en";

import TickerItem from "../components/TickerItem";
import AppButton from "../components/AppButton";

import { auth } from "../firebase/config";
import { useNavigation } from "@react-navigation/core";

import configData from "../config.json";

const HomeScreen = () => {
  const [tickerData, setTickerData] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    printData();
  }, []);

  function printData() {
    let tickerArray = [];

    let tickers = getTickersFromDatabase();

    tickers.then((data) => {
      for (let key in data) {
        let ticker = {
          key: key,
          name: data[key].name,
        };

        tickerArray.push(ticker);
      }

      let tickersArr = [];

      for (let i = 0; i < tickerArray.length; i++) {
        let tickerInfo = getTickerData(tickerArray[i].name);

        tickerInfo.then((results) => {
          if (results.error) {
            alert(results.error);
            return;
          }

          let ticker = {
            id: results.id,
            key: tickerArray[i].key,
            name: results.name,
            image: results.image.large,
            price: results.market_data.current_price.cad,
          };

          tickersArr.push(ticker);

          tickersArr.sort((a, b) => a.name.localeCompare(b.name));

          setTickerData(tickersArr);
        });
      }
    });
  }

  async function getTickersFromDatabase() {
    try {
      let url = `${configData.BASE_URL}/${auth.currentUser?.uid}/tickers.json`;

      let response = await fetch(url);

      let responseJson = await response.json();

      return responseJson;
    } catch (error) {
      console.error(error);
    }
  }

  async function getTickerData(enteredText) {
    try {
      let response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${enteredText
          .toString()
          .toLowerCase()}`
      );

      let responseJson = await response.json();

      return responseJson;
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteTickerFromDatabase(key) {
    let url = `${configData.BASE_URL}/${auth.currentUser?.uid}/tickers/${key}.json`;

    return await fetch(url, {
      method: "DELETE",
    });
  }

  function deleteTicker(key) {
    Alert.alert("Alert", "Are you sure you want to delete this ticker?", [
      {
        text: "Yes",
        onPress: () => {
          deleteTickerFromDatabase(key);
          printData();
        },
      },
      {
        text: "No",
      },
    ]);
  }

  function handleSignOut() {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  }

  function redirectToAddTickerPage() {
    navigation.replace("Add Ticker");
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.text}>{auth.currentUser?.email}</Text>
          <AppButton
            backgroundColor="#EB1D36"
            text="Log Out"
            textColor="#FFE5B4"
            onPress={handleSignOut}
          />
        </View>
        <View style={styles.addTickerContainer}>
          <AppButton
            backgroundColor="#377D71"
            text="Add Ticker"
            textColor="#FFE5B4"
            onPress={redirectToAddTickerPage}
          />
        </View>
        <View style={styles.tickersContainer}>
          <FlatList
            data={tickerData}
            renderItem={(tickerData) => {
              return (
                <TickerItem
                  name={tickerData.item.name}
                  price={tickerData.item.price}
                  logo={tickerData.item.image}
                  id={tickerData.item.key}
                  onDeleteTicker={deleteTicker}
                />
              );
            }}
          />
        </View>
      </View>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#231955",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  text: {
    color: "#FFE5B4",
  },
  addTickerContainer: {
    width: "100%",
  },
  tickersContainer: {
    flex: 5,
    paddingTop: 10,
    width: "100%",
  },
});
