import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList, TabParamList } from '../types/models';
import { useFitTrack } from '../contexts/FitTrackContext';
import { colors } from '../global/themes';
import { Button, Icon, ui } from '../components/ui';
import Login from '../pages/login';
import Cadastro from '../pages/cadastro';
import Home from '../pages/home';
import Treinos from '../pages/treinos';
import NovoTreino from '../pages/novo-treino';
import Exercicios from '../pages/exercicios';
import Historico from '../pages/historico';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const icons = { Home: 'grid-view', Treinos: 'fitness-center', Exercicios: 'travel-explore', Historico: 'history' } as const;
function MainTabs() {
  const insets = useSafeAreaInsets();
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.line, height: 64 + insets.bottom, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 6) },
    tabBarItemStyle: { paddingVertical: 0 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    tabBarIcon: ({ color, size }) => <Icon name={icons[route.name]} color={color} size={size} />,
  })}>
    <Tabs.Screen name="Home" component={Home} options={{ title: 'Início' }} />
    <Tabs.Screen name="Treinos" component={Treinos} options={{ title: 'Treinos' }} />
    <Tabs.Screen name="Exercicios" component={Exercicios} options={{ title: 'Exercícios' }} />
    <Tabs.Screen name="Historico" component={Historico} options={{ title: 'Histórico' }} />
  </Tabs.Navigator>;
}
export default function AppNavigation() {
  const { user, loading, startupError, restore } = useFitTrack();
  if (loading || startupError) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, padding: 32, backgroundColor: colors.background }}>
    <Icon name="fitness-center" size={50} color={colors.primary} /><Text style={ui.title}>fittrack.</Text>
    {loading ? <ActivityIndicator size="large" color={colors.primary} /> : <><Text style={ui.error}>{startupError}</Text><Button title="Tentar novamente" onPress={() => void restore()} /></>}
  </View>;
  return <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.ink, border: colors.line } }}>
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      {user ? <Stack.Group navigationKey={user.id}>
        <Stack.Screen name="Principal" component={MainTabs} />
        <Stack.Screen name="NovoTreino" component={NovoTreino} options={{ gestureEnabled: true }} />
      </Stack.Group> : <Stack.Group navigationKey="guest"><Stack.Screen name="Login" component={Login} /><Stack.Screen name="Cadastro" component={Cadastro} /></Stack.Group>}
    </Stack.Navigator>
  </NavigationContainer>;
}
