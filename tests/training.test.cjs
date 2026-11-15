const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Executa os módulos TypeScript reais, substituindo apenas o armazenamento nativo.
function loadTS(file, imports = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(name => {
    if (name in imports) return imports[name];
    throw new Error(`Dependência inesperada no teste: ${name}`);
  }, module, module.exports);
  return module.exports;
}
const training = loadTS('src/utils/training.ts');
const exercise = { id: 'supino', name: 'Supino', sets: 3, reps: 12 };
const workout = { id: 'a', name: 'Treino A', group: 'Peito', notes: '', exercises: [exercise], createdAt: '2026-11-10T12:00:00Z' };

test('formulário rejeita valores vazios, fracionários e fora dos limites', () => {
  for (const [name, sets, reps] of [['', '3', '12'], ['Supino', '0', '12'], ['Supino', '21', '12'], ['Supino', '2.5', '12'], ['Supino', '3', '101'], ['Supino', '3', '0']]) {
    assert.ok(training.validateExercise(name, sets, reps));
  }
  assert.equal(training.validateExercise('Supino', '20', '100'), null);
  assert.equal(training.totalSets([exercise, { ...exercise, sets: 4 }]), 7);
});
test('busca ignora acentos e cadastro rejeita e-mail inválido', () => {
  assert.equal(training.normalize('BRAÇOS'), 'bracos');
  assert.ok(training.validEmail('aluno@example.com'));
  for (const email of ['aluno', 'aluno@', 'aluno @example.com', '@example.com']) assert.equal(training.validEmail(email), false);
});
test('semana começa na segunda e exclui domingo anterior e datas futuras', () => {
  const today = new Date(2026, 10, 10, 12);
  const sessions = [new Date(2026, 10, 8, 23, 59), new Date(2026, 10, 9), new Date(2026, 10, 10, 11), new Date(2026, 10, 11)].map((d, i) => ({ id: String(i), completedAt: d.toISOString() }));
  assert.deepEqual(training.weekSessions(sessions, today).map(s => s.id), ['1', '2']);
  assert.equal(training.weekSessions(sessions, new Date(2026, 10, 15, 12)).length, 3);
});
test('armazenamento rejeita estruturas danificadas em vez de sobrescrever dados', () => {
  assert.deepEqual(training.parseTraining({ workouts: [workout], sessions: [] }).workouts, [workout]);
  for (const value of [null, {}, { workouts: [{}], sessions: [] }, { workouts: [{ ...workout, exercises: [] }], sessions: [] }, { workouts: [], sessions: [{ completedAt: 'ontem' }] }]) {
    assert.throws(() => training.parseTraining(value));
  }
});
test('API envia o formato correto, valida os dados e salva cache', async () => {
  const cache = new Map();
  const storage = { setItem: async (k, v) => cache.set(k, v), getItem: async k => cache.get(k) ?? null };
  const api = loadTS('src/services/exercises.ts', { '@react-native-async-storage/async-storage': storage });
  const row = { id: 'a', name: 'Push-up', primaryMuscles: ['chest'], equipment: 'body only', level: 'beginner', instructions: ['Step one'], images: [] };
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, api.EXERCISES_API);
    assert.equal(options.headers.Accept, 'application/vnd.github.raw+json');
    return { ok: true, json: async () => [row] };
  };
  try {
    const result = await api.fetchExercises(new AbortController().signal);
    assert.equal(result.source, 'online');
    const cached = await api.readCachedExercises();
    assert.equal(cached.source, 'cache');
    assert.deepEqual(cached.exercises, [row]);
    global.fetch = async () => ({ ok: false, status: 403 });
    await assert.rejects(api.fetchExercises(new AbortController().signal), /limite temporário/);
    assert.deepEqual((await api.readCachedExercises()).exercises, [row]);
    assert.throws(() => api.parseExercises({ message: 'erro' }));
    assert.throws(() => api.parseExercises([{ id: 'quebrado' }]));
  } finally { global.fetch = originalFetch; }
});
test('catálogo online continua disponível quando a gravação do cache falha', async () => {
  const api = loadTS('src/services/exercises.ts', { '@react-native-async-storage/async-storage': { setItem: async () => { throw new Error('Sem espaço'); } } });
  const row = { id: 'a', name: 'Push-up', primaryMuscles: ['chest'], equipment: null, level: 'beginner', instructions: [], images: [] };
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => [row] });
  try { assert.equal((await api.fetchExercises(new AbortController().signal)).exercises.length, 1); }
  finally { global.fetch = originalFetch; }
});
