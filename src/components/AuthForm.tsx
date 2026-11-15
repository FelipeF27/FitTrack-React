import React, { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../types/models';
import { useFitTrack } from '../contexts/FitTrackContext';
import { colors } from '../global/themes';
import { validEmail } from '../utils/training';
import { Button, Field, Icon, Screen, ui } from './ui';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, register, busy } = useFitTrack();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const confirmationRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const isRegister = mode === 'register';

  async function submit() {
    setError('');
    if (!validEmail(email.trim())) { setError('Informe um e-mail válido.'); emailRef.current?.focus(); return; }
    if (!password) { setError('Informe sua senha.'); passwordRef.current?.focus(); return; }
    if (isRegister && password !== confirmation) { setError('As senhas precisam ser iguais.'); confirmationRef.current?.focus(); return; }
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível acessar sua conta.'); }
  }
  return <Screen style={{ paddingTop: 32 }}>
    <View style={ui.between}>
      <View style={ui.row}><View style={{ backgroundColor: colors.navy, padding: 10, borderRadius: 14 }}><Icon name="fitness-center" color={colors.accent} /></View><Text style={{ fontWeight: '900', fontSize: 23, letterSpacing: -1, color: colors.ink }}>fittrack<Text style={{ color: colors.primary }}>.</Text></Text></View>
      <Text style={ui.eyebrow}>SEU RITMO.</Text>
    </View>
    <View style={{ backgroundColor: colors.navy, borderRadius: 28, padding: 26, gap: 18, overflow: 'hidden' }}>
      <View style={ui.between}><Text style={{ color: colors.accent, letterSpacing: 2, fontSize: 10, fontWeight: '800' }}>UM TREINO DE CADA VEZ</Text><Icon name="north-east" color={colors.accent} size={30} /></View>
      <Text style={{ color: colors.white, fontWeight: '800', fontSize: 35, lineHeight: 40, letterSpacing: -1 }}>Pequenos passos.{ '\n' }Grandes conquistas.</Text>
      <Text style={{ color: colors.onDarkMuted, lineHeight: 22, fontSize: 14 }}>Organize seus treinos e acompanhe cada conquista, no seu ritmo.</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>{[38, 60, 84, 108, 132, 154].map((h, i) => <View key={i} style={{ height: 8, flex: 1, backgroundColor: i < 4 ? colors.accent : colors.darkTrack, borderRadius: 4 }} />)}</View>
    </View>
    <View style={{ gap: 8 }}><Text style={ui.title}>{isRegister ? 'Seu primeiro passo.' : 'Bom ter você aqui.'}</Text><Text style={ui.subtitle}>{isRegister ? 'Crie sua conta e comece a organizar seus treinos.' : 'Entre para continuar sua jornada.'}</Text></View>
    <View style={{ gap: 16 }}>
      {isRegister && <Field label="Seu nome" placeholder="Como podemos chamar você?" value={name} onChangeText={setName} autoComplete="name" maxLength={60} returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />}
      <Field ref={emailRef} label="E-mail" placeholder="voce@exemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={120} returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
      <Field ref={passwordRef} label="Senha" placeholder={isRegister ? 'Pelo menos 6 caracteres' : 'Sua senha'} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} maxLength={128} returnKeyType={isRegister ? 'next' : 'go'} onSubmitEditing={() => isRegister ? confirmationRef.current?.focus() : void submit()} />
      <Pressable accessibilityRole="button" onPress={() => setShowPassword(!showPassword)} style={[ui.row, { alignSelf: 'flex-end', minHeight: 36 }]}><Icon name={showPassword ? 'visibility-off' : 'visibility'} size={18} color={colors.muted} /><Text style={ui.small}>{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</Text></Pressable>
      {isRegister && <Field ref={confirmationRef} label="Confirme a senha" placeholder="Digite a senha novamente" value={confirmation} onChangeText={setConfirmation} secureTextEntry={!showPassword} autoCapitalize="none" maxLength={128} returnKeyType="go" onSubmitEditing={() => void submit()} />}
      {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
      <Button title={isRegister ? 'Criar minha conta' : 'Entrar'} icon="arrow-forward" loading={busy} onPress={() => void submit()} />
      <Button title={isRegister ? 'Já tenho conta. Entrar' : 'Primeira vez? Criar conta'} variant="ghost" disabled={busy} onPress={() => isRegister ? navigation.goBack() : navigation.navigate('Cadastro')} />
    </View>
    <Text style={[ui.small, { textAlign: 'center' }]}>Sua conta e seus treinos ficam salvos neste aparelho.</Text>
  </Screen>;
}
