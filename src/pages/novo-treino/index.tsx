import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/models';
import { useFitTrack } from '../../contexts/FitTrackContext';
import { colors } from '../../global/themes';
import { Button, Field, Icon, PageHeading, Screen, ui } from '../../components/ui';
import Dialog from '../../components/Dialog';
import { GROUPS, validateExercise } from '../../utils/training';

type DraftExercise = { id: string; name: string; sets: string; reps: string };
const blank = (name = ''): DraftExercise => ({ id: Crypto.randomUUID(), name, sets: '3', reps: '12' });
export default function NovoTreino({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'NovoTreino'>) {
  const { data, saveWorkout, busy } = useFitTrack();
  const original = data.workouts.find(w => w.id === route.params?.workoutId);
  const [name, setName] = useState(original?.name ?? '');
  const [group, setGroup] = useState(original?.group ?? route.params?.group ?? 'Peito');
  const [notes, setNotes] = useState(original?.notes ?? '');
  const [exercises, setExercises] = useState<DraftExercise[]>(() => original ? original.exercises.map(e => ({ ...e, sets: String(e.sets), reps: String(e.reps) })) : [blank(route.params?.exerciseName)]);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [leaveAction, setLeaveAction] = useState<Parameters<typeof navigation.dispatch>[0] | null>(null);
  const nameRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  usePreventRemove(dirty && !saved, ({ data: event }) => setLeaveAction(event.action));

  function updateExercise(id: string, changes: Partial<DraftExercise>) {
    setDirty(true); setExercises(current => current.map(e => e.id === id ? { ...e, ...changes } : e));
  }
  async function submit() {
    setError('');
    if (!name.trim()) { setError('Dê um nome ao seu treino.'); nameRef.current?.focus(); return; }
    if (!exercises.length) { setError('Adicione pelo menos um exercício.'); return; }
    for (let i = 0; i < exercises.length; i++) {
      const e = exercises[i]; const problem = validateExercise(e.name, e.sets, e.reps);
      if (problem) { setError(`Exercício ${i + 1}: ${problem}`); return; }
    }
    try {
      await saveWorkout({ id: original?.id ?? Crypto.randomUUID(), name: name.trim(), group,
        notes: notes.trim(), createdAt: original?.createdAt ?? new Date().toISOString(),
        exercises: exercises.map(e => ({ id: e.id, name: e.name.trim(), sets: Number(e.sets), reps: Number(e.reps) })),
      });
      setSaved(true);
    } catch { setError('Não foi possível salvar no aparelho. Tente novamente.'); }
  }
  // A navegação ocorre após a atualização que libera o bloqueio de saída.
  React.useEffect(() => { if (saved) navigation.goBack(); }, [saved, navigation]);
  return <Screen>
    <View style={{ alignSelf: 'flex-start' }}><Button compact title="Voltar" icon="arrow-back" variant="ghost" disabled={busy} onPress={() => navigation.goBack()} /></View>
    <PageHeading eyebrow="MONTE SUA ROTINA" title={original ? 'Editar treino' : 'Novo treino'} subtitle="Organize sua ficha com os exercícios da sua rotina." />
    <Field ref={nameRef} label="Nome do treino" placeholder="Ex.: Treino A · Peito e tríceps" value={name} onChangeText={value => { setDirty(true); setName(value); }} maxLength={70} />
    <View style={{ gap: 12 }}><Text style={[ui.text, { fontWeight: '700' }]}>Grupo muscular principal</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{GROUPS.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: group === item }} onPress={() => { setDirty(true); setGroup(item); }} style={{ paddingHorizontal: 17, paddingVertical: 12, borderRadius: 12, backgroundColor: group === item ? colors.primary : colors.white, borderWidth: 1, borderColor: colors.line }}><Text style={{ fontSize: 13, fontWeight: '600', color: group === item ? colors.white : colors.ink }}>{item}</Text></Pressable>)}</ScrollView>
    </View>
    <View style={ui.between}><Text style={ui.sectionTitle}>Exercícios</Text><Text style={ui.small}>{exercises.length} na ficha</Text></View>
    {exercises.map((exercise, index) => <View key={exercise.id} style={ui.card}>
      <View style={ui.between}><Text style={ui.eyebrow}>EXERCÍCIO {String(index + 1).padStart(2, '0')}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Remover exercício ${index + 1}`} onPress={() => { setDirty(true); setExercises(current => current.filter(e => e.id !== exercise.id)); }} style={{ padding: 8 }}><Icon name="close" color={colors.muted} size={20} /></Pressable></View>
      <Field label={`Nome do exercício ${index + 1}`} placeholder="Ex.: Supino reto" value={exercise.name} onChangeText={value => updateExercise(exercise.id, { name: value })} maxLength={100} />
      <View style={ui.row}><View style={{ flex: 1 }}><Field label={`Séries ${index + 1}`} value={exercise.sets} onChangeText={value => updateExercise(exercise.id, { sets: value })} keyboardType="number-pad" maxLength={2} /></View><Text style={ui.subtitle}>×</Text><View style={{ flex: 1 }}><Field label={`Repetições ${index + 1}`} value={exercise.reps} onChangeText={value => updateExercise(exercise.id, { reps: value })} keyboardType="number-pad" maxLength={3} /></View></View>
    </View>)}
    <Button title="Adicionar exercício" variant="secondary" icon="add" disabled={exercises.length >= 30} onPress={() => { setDirty(true); setExercises(current => [...current, blank()]); }} />
    <Field label="Observações (opcional)" placeholder="Ex.: descanso entre séries, ajustes ou lembretes" multiline numberOfLines={3} value={notes} onChangeText={value => { setDirty(true); setNotes(value); }} maxLength={500} style={{ minHeight: 100, textAlignVertical: 'top' }} />
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
    <Button title={original ? 'Salvar alterações' : 'Salvar treino'} icon="check" loading={busy} onPress={() => void submit()} />
    <Dialog visible={!!leaveAction} title="Descartar alterações?" description="As alterações deste formulário ainda não foram salvas." confirmTitle="Descartar e voltar" danger onCancel={() => setLeaveAction(null)} onConfirm={() => { const action = leaveAction; setLeaveAction(null); if (action) navigation.dispatch(action); }} />
  </Screen>;
}
