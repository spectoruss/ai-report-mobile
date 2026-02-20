import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';
import { FontAwesome7Pro } from './FontAwesome7Pro';

interface AiAssistOverlayProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function AiAssistOverlay({ visible, onClose, initialQuery = '' }: AiAssistOverlayProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
    }
  }, [visible, initialQuery]);

  function handleSubmit() {
    // TODO: handle query submission
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            name="xmark"
            iconColor="#052339"
            backgroundColor="#ffffff"
            onPress={onClose}
          />
          <Text style={styles.headerTitle}>Ai Assist</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Empty state */}
        <View style={styles.emptyState}>
          <View style={styles.aiIconWrap}>
            <FontAwesome7Pro name="sparkles" size={30} color="#0779ac" style={styles.sparkleIcon} />
            <FontAwesome7Pro name="pen" size={22} color="#052339" style={styles.penIcon} />
          </View>
          <Text style={styles.emptyTitle}>
            Enter an observation below to find comments
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Input card */}
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter observation..."
                placeholderTextColor="#9ca3af"
                value={query}
                onChangeText={setQuery}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <FontAwesome7Pro name="arrow-up" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212731',
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 52,
  },
  aiIconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sparkleIcon: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  penIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#052339',
    textAlign: 'center',
    lineHeight: 32,
  },
  spacer: {
    flex: 1,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 16,
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212731',
    paddingHorizontal: 4,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0779ac',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
