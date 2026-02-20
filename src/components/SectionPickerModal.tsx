import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPORT_SECTIONS } from '../data/mockData';
import { IconButton } from './IconButton';
import { FontAwesome7Pro } from './FontAwesome7Pro';

interface SectionPickerModalProps {
  visible: boolean;
  currentSectionId: string;
  onSelect: (sectionId: string) => void;
  onClose: () => void;
}

export function SectionPickerModal({ visible, currentSectionId, onSelect, onClose }: SectionPickerModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sections</Text>
          <IconButton
            name="xmark"
            iconColor="#052339"
            backgroundColor="#eef1f7"
            borderRadius={16}
            onPress={onClose}
          />
        </View>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {REPORT_SECTIONS.map((section, index) => {
            const isActive = section.id === currentSectionId;
            return (
              <TouchableOpacity
                key={section.id}
                style={[styles.row, isActive && styles.rowActive]}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(section.id);
                  onClose();
                }}
              >
                <Text style={[styles.rowIndex, isActive && styles.rowIndexActive]}>
                  {index + 1}
                </Text>
                <FontAwesome7Pro name={section.icon} size={16} color={isActive ? '#0779ac' : '#647382'} />
                <Text style={[styles.rowTitle, isActive && styles.rowTitleActive]} numberOfLines={1}>
                  {section.title}
                </Text>
                {isActive && (
                  <FontAwesome7Pro name="check" size={14} color="#0779ac" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
  },
  list: { flex: 1 },
  listContent: { paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowActive: {
    backgroundColor: '#f0f9ff',
  },
  rowIndex: {
    width: 24,
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    textAlign: 'center',
  },
  rowIndexActive: {
    color: '#0779ac',
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    color: '#052339',
  },
  rowTitleActive: {
    fontWeight: '600',
  },
});
