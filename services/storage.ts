import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const setItem = async (key: string, value: string) => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getItem = async (key: string) => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  }
};

export const deleteItem = async (key: string) => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
