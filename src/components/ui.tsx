import React, { forwardRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../global/themes';

export const ui = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.muted },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },
  text: { fontSize: 15, lineHeight: 23, color: colors.ink },
  small: { fontSize: 12, lineHeight: 18, color: colors.muted },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: '800', color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 22, borderWidth: 1, borderColor: colors.line, gap: 12 },
  divider: { height: 1, backgroundColor: colors.line },
  error: { backgroundColor: colors.errorBg, padding: 14, borderRadius: 12, color: colors.danger, fontSize: 14, lineHeight: 21 },
});
export function Screen({ children, scroll = true, style }: { children: React.ReactNode; scroll?: boolean; style?: ViewStyle }) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ padding: 24, paddingBottom: 40, gap: 24, flexGrow: 1 }, style]}>{children}</ScrollView>
        : <View style={[{ flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 20 }, style]}>{children}</View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function Icon({ name, size = 24, color = colors.ink }: { name: React.ComponentProps<typeof MaterialIcons>['name']; size?: number; color?: string }) {
  return <MaterialIcons name={name} size={size} color={color} />;
}
export function Button({ title, onPress, variant = 'primary', icon, loading = false, disabled = false, compact = false }: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ComponentProps<typeof MaterialIcons>['name']; loading?: boolean; disabled?: boolean; compact?: boolean;
}) {
  const backgroundColor = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.accent : variant === 'danger' ? colors.errorBg : 'transparent';
  const color = variant === 'primary' ? colors.white : variant === 'danger' ? colors.danger : colors.ink;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || loading }} disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => ({ backgroundColor, borderRadius: 15, minHeight: compact ? 42 : 54, paddingHorizontal: compact ? 14 : 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: disabled || loading ? 0.5 : pressed ? 0.75 : 1 })}>
    {loading ? <ActivityIndicator color={color} /> : icon ? <Icon name={icon} color={color} size={20} /> : null}
    <Text style={{ color, fontSize: compact ? 13 : 15, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
  </Pressable>;
}
export const Field = forwardRef<React.ComponentRef<typeof TextInput>, TextInputProps & { label: string }>(function Field({ label, style, ...props }, ref) {
  return <View style={{ gap: 8 }}>
    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>{label}</Text>
    <TextInput ref={ref} accessibilityLabel={label} placeholderTextColor={colors.placeholder} {...props}
      style={[{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 52, fontSize: 16, color: colors.ink }, style]} />
  </View>;
});
export function Badge({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <View style={{ alignSelf: 'flex-start', backgroundColor: dark ? colors.darkSurface : colors.soft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
    <Text style={{ color: dark ? colors.accent : colors.navy, fontSize: 11, fontWeight: '700' }}>{children}</Text>
  </View>;
}
export function Empty({ icon = 'fitness-center', title, description, action }: { icon?: React.ComponentProps<typeof MaterialIcons>['name']; title: string; description: string; action?: React.ReactNode }) {
  return <View style={[ui.card, { alignItems: 'center', paddingVertical: 36, gap: 14 }]}>
    <View style={{ padding: 18, borderRadius: 24, backgroundColor: colors.soft }}><Icon name={icon} size={32} color={colors.primary} /></View>
    <Text style={[ui.sectionTitle, { textAlign: 'center' }]}>{title}</Text>
    <Text style={[ui.subtitle, { textAlign: 'center' }]}>{description}</Text>{action}
  </View>;
}
export function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <View style={{ gap: 8 }}><View style={ui.between}><Text style={ui.eyebrow}>{eyebrow}</Text>{action}</View><Text style={ui.title}>{title}</Text><Text style={ui.subtitle}>{subtitle}</Text></View>;
}
