import React, {useContext, useEffect, useState} from 'react';
import {Button, Image, StyleSheet, Text, View} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import {AxiosContext} from '../context/AxiosContext';
import Client from '../context/httpService';
import Spinner from './Spinner';

const Dashboard = () => {
  const axiosContext = useContext(AxiosContext);
  const authContext = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('idle');

  const loadImage = async () => {
    console.log("xxxx");
    setStatus('loading');
    try {
      const response = await Client.GET({uri:'/cat',params:{}});
      // const response = await Client.POST({uri:'/cat',request:{a:'a', b:'b'}});
      //await axiosContext.authAxios.get('/cat');
      setImage(response.data);
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  // useEffect(()=>{
  //   const sto= setTimeout(()=>{
  //     loadImage();
  //   },1000)
  //   return ()=>{
  //     clearTimeout(sto)
  //   }
  // },[image])
  // if (status === 'loading') {
  //   return <Spinner />;
  // }

  return (
    <View style={styles.container}>
      {
        status === 'loading'?
        <View style={{height:360}}>   
          <Spinner />
        </View>


     :
         <Image
        source={{uri: image}}
        width={300}
        height={500}
        style={styles.image}
      />
      }
     

      <View style={styles.buttonGroup}>
        <Button title="Get Image" onPress={loadImage} />
        <Button title="Logout" onPress={() => authContext.logout()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: '90%',
    height: '50%',
    resizeMode: 'contain',
  },
  buttonGroup: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
});
export default Dashboard;