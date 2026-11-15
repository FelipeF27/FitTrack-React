import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Workout } from '../../types/models';
import { useFitTrack } from '../../contexts/FitTrackContext';
import { Badge, Button, Empty, Field, PageHeading, Screen, ui } from '../../components/ui';
import Dialog from '../../components/Dialog';
import WorkoutSession from '../../components/WorkoutSession';
import { normalize, totalSets } from '../../utils/training';

export default function Treinos() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, deleteWorkout, busy } = useFitTrack();
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState<Workout | null>(null);
  const [active, setActive] = useState<Workout | null>(null);
  const [error, setError] = useState('');
  const filtered = data.workouts.filter(w => normalize(`${w.name} ${w.group}`).includes(normalize(query)));
  async function remove() {
    if (!deleting) return;
    try { await deleteWorkout(deleting.id); setDeleting(null); }
    catch { setError('Não foi possível excluir. Tente novamente.'); }
  }
  return <Screen scroll={false}>
    <PageHeading eyebrow="PLANEJE. TREINE. REPITA." title="Meus treinos" subtitle="Sua rotina, organizada do seu jeito." />
    <Button title="Novo treino" icon="add" onPress={() => navigation.navigate('NovoTreino')} />
    {data.workouts.length > 0 && <Field label="Buscar treino" placeholder="Nome ou grupo muscular" value={query} onChangeText={setQuery} />}
    <FlatList data={filtered} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      ListEmptyComponent={<Empty title={query ? 'Nenhum treino encontrado' : 'O primeiro passo é seu'} description={query ? 'Tente outro nome ou grupo muscular.' : 'Crie sua ficha com os exercícios, séries e repetições da sua rotina.'} />}
      renderItem={({ item, index }) => <View style={ui.card}>
        <View style={ui.between}><Badge>{item.group.toUpperCase()}</Badge><Text style={ui.small}>{String(index + 1).padStart(2, '0')}</Text></View>
        <Text style={ui.sectionTitle}>{item.name}</Text><Text style={ui.small}>{item.exercises.length} exercícios · {totalSets(item.exercises)} séries no total</Text>
        <View style={ui.divider} />
        {item.exercises.slice(0, 3).map(exercise => <View key={exercise.id} style={ui.between}><Text style={[ui.text, { flex: 1 }]}>{exercise.name}</Text><Text style={ui.small}>{exercise.sets} × {exercise.reps}</Text></View>)}
        {item.exercises.length > 3 && <Text style={ui.small}>+ {item.exercises.length - 3} exercícios</Text>}
        <Button title="Começar treino" icon="play-arrow" onPress={() => setActive(item)} disabled={busy} />
        <View style={ui.between}><Button title="Editar" compact variant="ghost" icon="edit" onPress={() => navigation.navigate('NovoTreino', { workoutId: item.id })} disabled={busy} /><Button title="Excluir" compact variant="danger" icon="delete-outline" onPress={() => { setError(''); setDeleting(item); }} disabled={busy} /></View>
      </View>} />
    <Dialog visible={!!deleting} title="Excluir este treino?" description={`“${deleting?.name ?? ''}” será removido. Os treinos já concluídos continuarão no histórico.`} confirmTitle="Excluir treino" danger busy={busy} error={error} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} />
    {active && <WorkoutSession workout={active} onClose={() => setActive(null)} />}
  </Screen>;
}
