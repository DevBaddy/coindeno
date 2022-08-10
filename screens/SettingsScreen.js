import { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/core";
import { Dropdown } from "react-native-element-dropdown";

import { auth } from "../firebase/config";

import AppButton from "../components/AppButton";
import Loading from "../components/Loading";

import configData from "../config.json";

import Colors from "../constants/colors";

const SettingsScreen = () => {
  const navigation = useNavigation();

  const [currencyDropdownValue, setCurrencyDropdownValue] = useState("");
  const [currencyLabel, setCurrencyLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const currencyData = [
    { label: "CAD - Canadian Dollar", value: "cad" },
    { label: "EUR - Euro", value: "eur" },
    { label: "GBP - British Pound Sterling", value: "gbp" },
    { label: "INR - Indian Rupee", value: "inr" },
    { label: "USD - US Dollar", value: "usd" },
    { label: "JPY - Japanese Yen", value: "jpy" },
    { label: "CNY - Chinese Yuan", value: "cny" },
    { label: "RUB - Russian Ruble", value: "rub" },
    { label: "KRW - South Korean Won", value: "krw" },
  ];

  useEffect(() => {
    getCurrencySettingsFromDatabase().then((data) => {
      setIsLoading(false);

      for (let key in data) {
        let currency = data[key].currencyLabel;
        setCurrencyLabel(currency);
      }
    });
  }, []);

  function redirectToHomePage() {
    navigation.replace("Home");
  }

  function saveSettings() {
    if (currencyDropdownValue.label === undefined) {
      alert("Please make edits to your settings to save them!");
      return;
    }

    let currency = {
      currency: currencyDropdownValue.value,
      currencyLabel: currencyDropdownValue.label,
    };

    getCurrencySettingsFromDatabase().then((data) => {
      if (data === null || data === undefined) {
        saveCurrencySettingsToDatabase(currency);
      } else {
        for (let key in data) {
          editCurrencySettings(currency, key);
        }
      }
    });

    alert("Settings Saved!");
  }

  async function getCurrencySettingsFromDatabase() {
    try {
      let url = `${configData.BASE_URL}/${auth.currentUser?.uid}/settings/currency.json`;

      let response = await fetch(url);

      let responseJson = await response.json();

      return responseJson;
    } catch (error) {
      console.error(error);
    }
  }

  async function saveCurrencySettingsToDatabase(currency) {
    let url = `${configData.BASE_URL}/${auth.currentUser?.uid}/settings/currency.json`;

    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(currency),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.json();
  }

  async function editCurrencySettings(currency, id) {
    let url = `${configData.BASE_URL}/${auth.currentUser?.uid}/settings/currency/${id}.json`;

    return await fetch(url, {
      method: "PUT",
      body: JSON.stringify(currency),
    });
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Loading />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <AppButton
          backgroundColor="#EB1D36"
          text="Back"
          textColor={Colors.text}
          onPress={redirectToHomePage}
        />
        <AppButton
          backgroundColor="#377D71"
          text="Save"
          textColor={Colors.text}
          onPress={saveSettings}
        />
      </View>
      <Text style={styles.pageHeader}>Settings</Text>
      <View style={styles.setting}>
        <Text style={styles.settingText}>Preferred Currency:</Text>
        <Dropdown
          data={currencyData}
          style={styles.dropdown}
          selectedTextStyle={styles.selectedTextStyle}
          labelField="label"
          valueField="value"
          placeholder={currencyLabel}
          value={currencyDropdownValue}
          onChange={(value) => setCurrencyDropdownValue(value)}
          fontFamily="poppins-regular"
          placeholderStyle={styles.text}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  pageHeader: {
    fontSize: 45,
    color: Colors.textHeader,
    marginBottom: 20,
    fontFamily: "poppins-medium",
  },
  text: {
    color: Colors.text,
    fontFamily: "poppins-regular",
  },
  setting: {
    width: "90%",
    backgroundColor: Colors.settingBackground,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  settingText: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: "poppins-regular",
  },
  dropdown: {
    marginTop: 20,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  selectedTextStyle: {
    color: Colors.text,
    fontFamily: "poppins-regular",
  },
});

export default SettingsScreen;
