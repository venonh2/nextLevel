//import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { AppLoading } from 'expo'
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto'
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu'
// o expo tem um install para as fontes do google


//import Home from './src/pages/Home'
import Routes from './src/routes'

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Ubuntu_700Bold
  })

  if (!fontsLoaded){ // tratamento enquanto as fontes não carregando ele msotra a seta de cerregando
    return <AppLoading/>
  } 

  return (
  
      <>
        <StatusBar barStyle="dark-content" backgroundColor="transparent"/>
        <Routes />
      </>
    

  );
}

