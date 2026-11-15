import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Exercise, RootStackParamList } from '../../types/models';
import { useExercises } from '../../hooks/useExercises';
import { colors } from '../../global/themes';
import { Badge, Button, Empty, Field, Icon, PageHeading, Screen, ui } from '../../components/ui';
import { equipmentLabels, formatDate, GROUPS, levelLabels, muscleLabels, normalize } from '../../utils/training';
import { exerciseImage } from '../../services/exercises';
import exerciseNames from '../../data/exerciseNames.pt-BR.json';

const portugueseNames: Readonly<Partial<Record<string, string>>> = exerciseNames;

function exerciseName(exercise: Exercise) {
  return Object.hasOwn(portugueseNames, exercise.id)
    ? portugueseNames[exercise.id] ?? exercise.name
    : exercise.name;
}

function ExercisePhoto({ path, large = false }: { path?: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ width: large ? '100%' : 74, height: large ? 220 : 80, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }}>
    {path && !failed ? <Image accessibilityLabel="Demonstração do exercício" source={{ uri: exerciseImage(path) }} style={{ width: '100%', height: '100%' }} resizeMode="contain" onError={() => setFailed(true)} /> : <Icon name="fitness-center" size={large ? 56 : 28} color={colors.primary} />}
  </View>;
}
export default function Exercicios() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { catalog, loading, error, retry } = useExercises();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('Todos');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const selectedName = selected ? exerciseName(selected) : '';
  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    return (catalog?.exercises ?? []).filter(exercise => {
      const groups = exercise.primaryMuscles.map(muscle => muscleLabels[muscle] ?? muscle);
      const equipment = equipmentLabels[exercise.equipment ?? ''];
      const searchText = [exerciseName(exercise), exercise.name, ...groups, equipment].join(' ');
      return (group === 'Todos' || groups.includes(group)) && normalize(searchText).includes(term);
    });
  }, [catalog, query, group]);
  return <Screen scroll={false}>
    <PageHeading eyebrow="DESCUBRA NOVOS MOVIMENTOS" title="Exercícios" subtitle="Explore o catálogo e monte sua próxima ficha." />
    <Field label="Buscar exercício" placeholder="Ex.: supino, peito ou halteres" value={query} onChangeText={setQuery} autoCorrect={false} />
    <View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{['Todos', ...GROUPS.filter(g => g !== 'Corpo todo')].map(item => <Pressable accessibilityRole="button" accessibilityState={{ selected: group === item }} key={item} onPress={() => setGroup(item)} style={{ paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12, backgroundColor: group === item ? colors.primary : colors.white }}><Text style={{ color: group === item ? colors.white : colors.ink, fontWeight: '600', fontSize: 13 }}>{item}</Text></Pressable>)}</ScrollView></View>
    {loading && <View style={ui.row}><ActivityIndicator color={colors.primary} /><Text style={ui.small}>Consultando exercícios…</Text></View>}
    {!!error && <View style={{ gap: 8 }}><Text style={ui.error}>{error}{catalog?.source === 'cache' ? '\nExibindo a última consulta salva.' : ''}</Text><Button compact title="Tentar novamente" icon="refresh" variant="secondary" disabled={loading} onPress={retry} /></View>}
    {catalog && <View style={ui.between}><Text style={ui.small}>{filtered.length} exercícios · {catalog.source === 'cache' ? 'salvos no aparelho' : 'catálogo online'}</Text><Button compact title="Atualizar" variant="ghost" icon="refresh" disabled={loading} onPress={retry} /></View>}
    <FlatList data={filtered} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingBottom: 32 }} initialNumToRender={8}
      ListHeaderComponent={catalog ? <Text style={[ui.small, { marginBottom: 16 }]}>Fonte: Free Exercise DB.{catalog.source === 'cache' ? ` Atualizado em ${formatDate(catalog.fetchedAt)}.` : ''}</Text> : undefined}
      ListEmptyComponent={!loading ? <Empty icon="search-off" title={error && !catalog ? 'Catálogo indisponível' : 'Nenhum exercício encontrado'} description={error && !catalog ? 'Conecte-se à internet e tente novamente. Seus treinos continuam disponíveis nas outras abas.' : 'Experimente outro termo ou grupo muscular.'} /> : undefined}
      renderItem={({ item }) => {
        const name = exerciseName(item);
        return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${name}`} onPress={() => setSelected(item)} style={[ui.card, ui.row, { padding: 14 }]}>
          <ExercisePhoto path={item.images[0]} />
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={[ui.text, { fontWeight: '700' }]}>{name}</Text>
            <Text style={ui.small}>{[...new Set(item.primaryMuscles.map(m => muscleLabels[m] ?? m))].join(' · ')}</Text>
            <Text style={ui.small}>{equipmentLabels[item.equipment ?? ''] ?? item.equipment ?? 'Sem equipamento'} · {levelLabels[item.level] ?? item.level}</Text>
          </View>
          <Icon name="chevron-right" color={colors.muted} />
        </Pressable>;
      }} />
    <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
      {selected && <Screen>
        <View style={ui.between}><Badge>CATÁLOGO DE EXERCÍCIOS</Badge><Button compact title="Fechar" variant="ghost" onPress={() => setSelected(null)} /></View>
        <Text style={ui.title}>{selectedName}</Text><ExercisePhoto key={selected.id} path={selected.images[0]} large />
        <View style={ui.row}><Badge>{levelLabels[selected.level] ?? selected.level}</Badge><Badge>{equipmentLabels[selected.equipment ?? ''] ?? selected.equipment ?? 'Sem equipamento'}</Badge></View>
        <Text style={ui.subtitle}>Grupo: {[...new Set(selected.primaryMuscles.map(m => muscleLabels[m] ?? m))].join(' · ')}</Text>
        <Text style={ui.sectionTitle}>Como executar</Text><Text style={ui.small}>Instruções originais do catálogo, em inglês.</Text>
        {selected.instructions.map((step, i) => <View key={i} style={[ui.row, { alignItems: 'flex-start' }]}><Badge>{String(i + 1).padStart(2, '0')}</Badge><Text style={[ui.text, { flex: 1 }]}>{step}</Text></View>)}
        <Button title="Criar treino com este exercício" icon="add" onPress={() => {
          setSelected(null);
          navigation.navigate('NovoTreino', {
            exerciseName: selectedName,
            group: muscleLabels[selected.primaryMuscles[0]] ?? 'Corpo todo',
          });
        }} />
        <Text style={ui.small}>Fonte: Free Exercise DB · yuhonas / GitHub · domínio público.</Text>
      </Screen>}
    </Modal>
  </Screen>;
}
