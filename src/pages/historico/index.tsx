import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useFitTrack } from '../../contexts/FitTrackContext';
import { colors } from '../../global/themes';
import { Badge, Empty, Icon, PageHeading, Screen, ui } from '../../components/ui';
import { formatDate, totalSets, weekSessions } from '../../utils/training';

export default function Historico() {
  const { data } = useFitTrack();
  const [expanded, setExpanded] = useState<string | null>(null);
  return <Screen scroll={false}>
    <PageHeading eyebrow="CADA TREINO CONTA" title="Suas conquistas" subtitle="Um registro de cada passo que você deu." />
    <View style={[ui.card, ui.row, { backgroundColor: colors.navy, borderColor: colors.navy }]}><Icon name="emoji-events" size={36} color={colors.accent} /><View style={{ flex: 1, gap: 4 }}><Text style={{ color: colors.white, fontSize: 23, fontWeight: '800' }}>{data.sessions.length} {data.sessions.length === 1 ? 'treino concluído' : 'treinos concluídos'}</Text><Text style={{ color: colors.onDarkMuted, fontSize: 13 }}>{weekSessions(data.sessions).length} nesta semana</Text></View></View>
    <FlatList data={data.sessions} keyExtractor={item => item.id} contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      ListEmptyComponent={<Empty icon="history" title="Sua história começa agora" description="Comece um treino na aba Treinos, marque os exercícios e conclua a sessão. Sua conquista aparece aqui." />}
      renderItem={({ item }) => <View style={ui.card}>
        <View style={ui.between}><Badge>{item.group}</Badge><Icon name="check-circle" color={colors.primary} /></View>
        <Text style={ui.sectionTitle}>{item.workoutName}</Text><Text style={ui.small}>{formatDate(item.completedAt)} · {new Date(item.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={ui.subtitle}>{item.exercises.length} exercícios · {totalSets(item.exercises)} séries concluídas</Text>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: expanded === item.id }} onPress={() => setExpanded(expanded === item.id ? null : item.id)} style={[ui.between, { minHeight: 40 }]}><Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{expanded === item.id ? 'Ocultar exercícios' : 'Ver exercícios realizados'}</Text><Icon name={expanded === item.id ? 'expand-less' : 'expand-more'} color={colors.primary} /></Pressable>
        {expanded === item.id && item.exercises.map(e => <View key={e.id} style={ui.between}><Text style={[ui.text, { flex: 1 }]}>{e.name}</Text><Text style={ui.small}>{e.sets} × {e.reps}</Text></View>)}
      </View>} />
  </Screen>;
}
