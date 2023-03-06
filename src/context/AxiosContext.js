import React, {createContext, useContext} from 'react';
import axios from 'axios';
import {AuthContext} from './AuthContext';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import * as Keychain from 'react-native-keychain';

const AxiosContext = createContext();
const {Provider} = AxiosContext;

const AxiosProvider = ({children}) => {
  const authContext = useContext(AuthContext);

  const authAxios = axios.create({
    baseURL: 'https://48ee-222-254-34-56.ap.ngrok.io/api',
  });

  const publicAxios = axios.create({
    baseURL: 'https://48ee-222-254-34-56.ap.ngrok.io/api',
  });

  authAxios.interceptors.request.use(
    config => {
      console.log(config?.url);
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${authContext.getAccessToken()}`;
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    },
  );
  authAxios.interceptors.response.use(
    config => {
      console.log(config);
      return config;
    },
    error => {
      return Promise.reject(error);
    },
  );

  const refreshAuthLogic = async failedRequest => {
    const data = {
      refreshToken: authContext.authState.refreshToken,
    };

    const options = {
      method: 'POST',
      data,
      url: 'https://48ee-222-254-34-56.ap.ngrok.io/api/refreshToken',
    };

    try {
      console.log("refeshing...")
      const tokenRefreshResponse = await axios(options);
      failedRequest.response.config.headers.Authorization =
        'Bearer ' + tokenRefreshResponse.data.accessToken;

      authContext.setAuthState({
        ...authContext.authState,
        accessToken: tokenRefreshResponse.data.accessToken,
      });

      await Keychain.setGenericPassword(
        'token',
        JSON.stringify({
          accessToken: tokenRefreshResponse.data.accessToken,
          refreshToken: authContext.authState.refreshToken,
        }));
      return await Promise.resolve();
    } catch (e) {
      console.log("-----refresh false");
      authContext.setAuthState({
        accessToken: null,
        refreshToken: null,
      });
    }
  };

  createAuthRefreshInterceptor(authAxios, refreshAuthLogic, {});

  return (
    <Provider
      value={{
        authAxios,
        publicAxios,
      }}>
      {children}
    </Provider>
  );
};

export {AxiosContext, AxiosProvider};