import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Image, Alert } from 'react-native'
import Constants from 'expo-constants'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native' // para nevagar entre abas
import MapView, { Marker } from 'react-native-maps' // para pegar o mapa
import { SvgUri } from 'react-native-svg' // esse import permite carregar uma svg de um endereço extorna da api

import * as Location from 'expo-location' // com * para poder pegar todas as funções que tem no location
 
// ScrollVIew é para ver vários items 
// o react-native não entende svg então tem que installar um pacote chamado: expo install react-native-svg
// border radius só funciona em View, por isso o mapa esta dentro de uma
// ele faz algo muito bacana com ternaria na lsita de item, para por estilo quando clicar no item tem a funcao tbm


// expo install expo-location, para pegar a localização do usuário e carregar o mapa
import api from '../../services/api'


interface Item {
  id: number;
  name: string;
  image_url:string;
}

interface Point {
  id: number;
  name: string;
  image: string;
  latitude: number;
  longitude: number;
 // items: {
  //  name: string;
 // }[]; // repare no couxeto apra representar que é + que um
}

interface Params {
  uf: string;
  city: string;
}

const Points = () => {
    const navigation = useNavigation()

    const [items, setItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
    const [points, setPoints] = useState<Point[]>([])

    const route = useRoute()
    const routeParams = route.params as Params


    useEffect(() => {
      api.get('items').then(response => {
        setItems(response.data)
      })
    }, [])

    useEffect(() => { // pegando localização do usuário e pedindo permissão
      async function loadPosition(){
        const { status } = await Location.requestPermissionsAsync()

        if( status !== 'granted') {
          Alert.alert('Oooops...', 'Precisamos de sua permissão para obter sua localização')
          return;
        }

        const location = await Location.getCurrentPositionAsync()

        const { latitude, longitude } = location.coords

        setInitialPosition([
          latitude,
          longitude
        ])
      }



      loadPosition();
    }, [])

    
  
    useEffect(() => {
      api.get('points', {
        params: {
          city: routeParams.city,
          uf: routeParams.uf,
          items: selectedItems
        }
      }).then(response => {
        setPoints(response.data)
      })
    }, [selectedItems]) // todo vez que o usuario selecionar um item ele executa essa chamada a api

    function handleNavigateBack(){
        navigation.goBack()
    }

    function handleNavitageToDetail(id: number){ // nevagando para outra rota,
        navigation.navigate('Detail', { point_id: id }) // apenas com a virgula e passar objeto vc será levado para outra rota e passara os dados do objeto apra a mesma
    }

    function handleSelectedItem(id: number){
      const alreadySelected = selectedItems.findIndex(item => item === id)

      if(alreadySelected >= 0) {
        const filteredItems = selectedItems.filter(item => item !== id)

        setSelectedItems(filteredItems)
      } else {
        setSelectedItems([...selectedItems, id ])
      }

    }

    return (
    <>
    <View style={styles.container}>


        <TouchableOpacity onPress={handleNavigateBack}>
            <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}> Bem vindo</Text>
        <Text style={styles.description}> Encontre no mapa um ponto de coleta </Text>

        
        <View style={styles.mapContainer}>
            {initialPosition[0] !== 0 && ( // É um if ternário no react, ele ta vendo se carregou as corrdenadas mostre o mapa
              <MapView 
              style={styles.map} 
              loadingEnabled={initialPosition[0] === 0}
              initialRegion={{
                  latitude: initialPosition[0],
                  longitude: initialPosition[1],
                  latitudeDelta: 0.014,
                  longitudeDelta: 0.014
              }}>
              {points.map(points => (
                <Marker 
                key={String(points.id)}
                onPress={() => handleNavitageToDetail(points.id)}
                style={styles.mapMarker}
                coordinate={{
                      latitude: points.latitude,
                      longitude: points.longitude,
                  }}
                > 
                <View style={styles.mapMarkerContainer}> 
                  <Image style={styles.mapMarkerImage} source={ {uri: points.image} } />
  
                  <Text style={styles.mapMarkerTitle}>{points.name}</Text>
                </View>
  
                </Marker> 
              ))


              }
                 
              </MapView>
            )}
        </View>
    </View>
    

    <View style={styles.itemsContainer}> 

        <ScrollView 
           horizontal 
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={{ paddingHorizontal: 20 }}
        > 
        {items.map(item => (
          <TouchableOpacity 
           key={String(item.id)} 
           style={[
             styles.item,
             selectedItems.includes(item.id) ? styles.selectedItem : {}
           ]} 
           onPress={() => handleSelectedItem(item.id)}> 
             <SvgUri width={42} height={42} uri={item.image_url} />
             <Text style={styles.itemTitle}>{item.name} </Text>
          </TouchableOpacity>
        ))}


       </ScrollView>

    </View>
    </>
     
     )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});


export default Points


