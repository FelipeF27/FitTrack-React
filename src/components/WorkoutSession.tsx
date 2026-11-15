import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import type { Workout } from '../types/models';
import { useFitTrack } from '../contexts/FitTrackContext';
import { colors } from '../global/themes';
import { Badge, Button, Icon, Screen, ui } from './ui';
import Dialog from './Dialog';

export default function WorkoutSession({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const { completeWorkout, busy } = useFitTrack();
  const [checked, setChecked] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (success) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [success]);
  async function finish() {
    try { await completeWorkout(workout); setSuccess(true); }
    catch { setError('Não foi possível salvar a conclusão. Tente novamente.'); }
  }
  function requestClose() { if (success) onClose(); else setDiscard(true); }
  return <Modal visible animationType="slide" onRequestClose={() => { if (!busy) requestClose(); }}>
    <Screen>
      {success ? <View style={{ flex: 1, justifyContent: 'center', gap: 22, alignItems: 'center' }}><View style={{ backgroundColor: colors.accent, padding: 30, borderRadius: 40 }}><Icon name="emoji-events" size={70} color={colors.navy} /></View><Text style={ui.title}>Mais uma conquista!</Text><Text style={[ui.subtitle, { textAlign: 'center' }]}>{workout.name} foi salvo no seu histórico.{ '\n' }Continue no seu ritmo.</Text><Button title="Voltar aos treinos" onPress={onClose} /></View> : <>
        <View style={ui.between}><Badge>TREINO EM ANDAMENTO</Badge><Button compact title="Fechar" variant="ghost" onPress={requestClose} disabled={busy} /></View>
        <Text style={ui.title}>{workout.name}</Text><Text style={ui.subtitle}>{workout.group} · {workout.exercises.length} exercícios</Text>
        <View style={[ui.card, { backgroundColor: colors.navy, borderColor: colors.navy }]}><Text style={{ color: colors.accent, fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</Text><Text style={{ color: colors.onDarkMuted, fontSize: 13 }}>{checked.length} de {workout.exercises.length} exercícios marcados</Text></View>
        {!!workout.notes && <Text style={ui.subtitle}>{workout.notes}</Text>}
        <Text style={ui.small}>Toque em cada exercício depois de concluir todas as séries.</Text>
        {workout.exercises.map((exercise, i) => {
          const done = checked.includes(exercise.id);
          return <Pressable key={exercise.id} accessibilityRole="checkbox" accessibilityLabel={`Concluir ${exercise.name}`} accessibilityState={{ checked: done, disabled: busy }} disabled={busy} onPress={() => setChecked(current => done ? current.filter(id => id !== exercise.id) : [...current, exercise.id])} style={[ui.card, ui.row, { backgroundColor: done ? colors.soft : colors.white }]}>
            <Icon name={done ? 'check-circle' : 'radio-button-unchecked'} color={done ? colors.primary : colors.muted} /><View style={{ flex: 1, gap: 5 }}><Text style={[ui.text, { fontWeight: '700' }]}>{i + 1}. {exercise.name}</Text><Text style={ui.small}>{exercise.sets} séries × {exercise.reps} repetições</Text></View>
          </Pressable>;
        })}
        {!!error && <Text style={ui.error}>{error}</Text>}
        <Button title="Concluir e salvar no histórico" icon="check" disabled={checked.length !== workout.exercises.length} loading={busy} onPress={() => void finish()} />
      </>}
    </Screen>
    <Dialog visible={discard} title="Encerrar este treino?" description="As marcações desta sessão serão descartadas. Seu treino cadastrado continuará salvo." confirmTitle="Encerrar sem concluir" danger onCancel={() => setDiscard(false)} onConfirm={onClose} />
  </Modal>;
}
