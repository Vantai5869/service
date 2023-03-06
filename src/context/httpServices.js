import axios from 'axios';
import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';

const refreshToken = async () => {
  try {
    const response = await axios.post('https://48ee-222-254-34-56.ap.ngrok.io/api/refresh-token');
    const newToken = response.data.token;
    return newToken;
  } catch (error) {
    throw new Error('Could not refresh token');
  }
};

const apiMiddleware = ({ dispatch, getState }) => (next) => async (action) => {
  if (action.type.startsWith('api/')) {
    const state = getState();
    const token = state.auth.token;
    const config = {
      ...action.payload.config,
      headers: {
        ...action.payload.config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios(config);
      return next({ ...action, payload: response.data });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        try {
          const newToken = await refreshToken();
          const newConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          const response = await axios(newConfig);
          return next({ ...action, payload: response.data });
        } catch (error) {
          return next({ ...action, error: error.message });
        }
      }
      return next({ ...action, error: error.message });
    }
  }
  return next(action);
};

export const callApi1 = createAsyncThunk('api/callApi1', async () => {
  let response
  try {
   response = await axios.get('https://48ee-222-254-34-56.ap.ngrok.io/api/cat');
    console.log({response})
  } catch (error) {
    console.log({error});
  }
  return response.data;
});

export const callApi2 = createAsyncThunk('api/callApi2', async () => {
  const response = await axios.get('/api/2');
  return response.data;
});

// ...

// const store = configureStore({
//   reducer: {},
//   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiMiddleware),
// });