import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FitTrackProvider } from './src/contexts/FitTrackContext';
import AppNavigation from './src/navigation/AppNavigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <FitTrackProvider>
        <StatusBar style="dark" />
        <AppNavigation />
      </FitTrackProvider>
    </SafeAreaProvider>
  );
}
