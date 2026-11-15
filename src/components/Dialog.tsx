import React from 'react';
import { Modal, Text, View } from 'react-native';
import { colors } from '../global/themes';
import { Button, ui } from './ui';

export default function Dialog({ visible, title, description, confirmTitle = 'Confirmar', danger = false, busy = false, error, onCancel, onConfirm }: {
  visible: boolean; title: string; description: string; confirmTitle?: string;
  danger?: boolean; busy?: boolean; error?: string; onCancel: () => void; onConfirm: () => void;
}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (!busy) onCancel(); }}>
    <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 24 }}>
      <View accessibilityViewIsModal style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 24, gap: 18, width: '100%', maxWidth: 440, alignSelf: 'center' }}>
        <Text style={ui.sectionTitle}>{title}</Text><Text style={ui.subtitle}>{description}</Text>
        {!!error && <Text style={ui.error}>{error}</Text>}
        <Button title={confirmTitle} variant={danger ? 'danger' : 'primary'} loading={busy} onPress={onConfirm} />
        <Button title="Cancelar" variant="ghost" disabled={busy} onPress={onCancel} />
      </View>
    </View>
  </Modal>;
}
