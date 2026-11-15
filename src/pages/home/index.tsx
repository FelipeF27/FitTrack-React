import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFitTrack } from '../../contexts/FitTrackContext';
import type { RootStackParamList, TabParamList } from '../../types/models';
import { colors } from '../../global/themes';
import { Badge, Button, Icon, Screen, ui } from '../../components/ui';
import Dialog from '../../components/Dialog';
import { formatDate, weekSessions } from '../../utils/training';

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Home'>, NativeStackNavigationProp<RootStackParamList>>;
export default function Home() {
  const { user, data, logout, busy } = useFitTrack();
  const navigation = useNavigation<Nav>();
  const [showLogout, setShowLogout] = useState(false);
  const [error, setError] = useState('');
  const sessions = weekSessions(data.sessions);
  const progress = Math.min(sessions.length / 3, 1);
  const today = new Date();
  const start = new Date(today); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return <Screen>
    <View style={ui.between}>
      <View style={ui.row}><View style={{ backgroundColor: colors.navy, borderRadius: 14, padding: 10 }}><Icon name="fitness-center" color={colors.accent} /></View><Text style={{ fontSize: 24, fontWeight: '900', color: colors.ink, letterSpacing: -1 }}>fittrack.</Text></View>
      <Button compact title="Sair" icon="logout" variant="ghost" onPress={() => setShowLogout(true)} />
    </View>
    <View style={{ gap: 8 }}><Text style={ui.eyebrow}>SUA JORNADA COMEÇA AQUI</Text><Text style={ui.title}>Vamos nessa,{ '\n' }{user?.name.split(' ')[0]}.</Text><Text style={ui.subtitle}>Mais um dia para cuidar de você.</Text></View>
    <View style={{ borderRadius: 26, backgroundColor: colors.navy, padding: 24, gap: 20 }}>
      <View style={ui.between}><Badge dark>SEU RITMO DA SEMANA</Badge><Icon name="local-fire-department" color={colors.accent} size={30} /></View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}><Text style={{ color: colors.white, fontSize: 54, fontWeight: '800', letterSpacing: -2 }}>{sessions.length}</Text><Text style={{ color: colors.onDarkMuted, fontSize: 16 }}>{sessions.length === 1 ? 'treino concluído' : 'treinos concluídos'}</Text></View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.darkTrack, overflow: 'hidden' }}><View style={{ height: 8, width: `${progress * 100}%`, backgroundColor: colors.accent, borderRadius: 4 }} /></View>
      <Text style={{ color: colors.onDarkMuted, fontSize: 13 }}>{sessions.length >= 3 ? 'Referência de 3 treinos na semana alcançada!' : 'Uma referência de constância: 3 treinos por semana.'}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => {
        const date = new Date(start); date.setDate(start.getDate() + i);
        const done = sessions.some(s => new Date(s.completedAt).toDateString() === date.toDateString());
        return <View key={i} style={{ alignItems: 'center', gap: 8 }}><Text style={{ color: colors.onDarkMuted, fontSize: 11 }}>{day}</Text><View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.accent : colors.darkSurface, borderWidth: date.toDateString() === today.toDateString() ? 1 : 0, borderColor: colors.accent }}>{done ? <Icon name="check" size={18} color={colors.navy} /> : <Text style={{ color: colors.onDarkMuted, fontSize: 11 }}>{date.getDate()}</Text>}</View></View>;
      })}</View>
    </View>
    <View style={ui.row}>{[{ label: 'Treinos criados', value: data.workouts.length, icon: 'fitness-center' as const }, { label: 'Concluídos no total', value: data.sessions.length, icon: 'emoji-events' as const }].map(stat => <View key={stat.label} style={[ui.card, { flex: 1, padding: 17 }]}><Icon name={stat.icon} color={colors.primary} /><Text style={{ color: colors.ink, fontWeight: '800', fontSize: 30 }}>{stat.value}</Text><Text style={ui.small}>{stat.label}</Text></View>)}</View>
    <View style={{ gap: 14 }}><Text style={ui.sectionTitle}>Seu próximo passo</Text>
      <Button title={data.workouts.length ? 'Ver meus treinos' : 'Criar meu primeiro treino'} icon={data.workouts.length ? 'fitness-center' : 'add'} onPress={() => data.workouts.length ? navigation.navigate('Treinos') : navigation.navigate('NovoTreino')} />
      <Button title="Explorar exercícios" variant="secondary" icon="travel-explore" onPress={() => navigation.navigate('Exercicios')} />
    </View>
    {data.sessions[0] && <View style={ui.card}><View style={ui.between}><Text style={ui.eyebrow}>ÚLTIMA CONQUISTA</Text><Icon name="task-alt" color={colors.primary} /></View><Text style={ui.sectionTitle}>{data.sessions[0].workoutName}</Text><Text style={ui.small}>{formatDate(data.sessions[0].completedAt)} · {data.sessions[0].group}</Text></View>}
    <Text style={[ui.small, { textAlign: 'center' }]}>Consistência vale mais que pressa.</Text>
    <Dialog visible={showLogout} title="Sair da conta?" description="Seus treinos continuam salvos neste aparelho. Você pode entrar novamente quando quiser." confirmTitle="Sair" busy={busy} error={error} onCancel={() => { setShowLogout(false); setError(''); }} onConfirm={() => { void logout().catch(() => setError('Não foi possível sair. Tente novamente.')); }} />
  </Screen>;
}
