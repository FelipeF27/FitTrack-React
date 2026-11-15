import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import type { Profile, TrainingData } from '../types/models';
import { parseTraining } from '../utils/training';

// SecureStore protege os registros no iOS/Android. No navegador, o armazenamento
// local permite testar o protótipo; não é autenticação de produção.
export const privateStorage = {
  get: (key: string) => Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key),
  set: (key: string, value: string) => Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
  remove: (key: string) => Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};
export const SESSION_KEY = 'fittrack.session.v1';
export const hash = (text: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
export const accountKey = async (email: string) => `fittrack.account.${await hash(email.trim().toLowerCase())}`;
export const trainingKey = (id: string) => `@fittrack/training/v1/${id}`;
export async function readTraining(profile: Profile): Promise<TrainingData> {
  const raw = await AsyncStorage.getItem(trainingKey(profile.id));
  if (!raw) return { workouts: [], sessions: [] };
  return parseTraining(JSON.parse(raw));
}
export function writeTraining(profile: Profile, data: TrainingData) {
  return AsyncStorage.setItem(trainingKey(profile.id), JSON.stringify(data));
}
