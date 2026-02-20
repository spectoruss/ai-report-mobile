import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { REPORT_SECTIONS, Section } from '../data/mockData';
import { IconButton } from '../components/IconButton';
import { ReportTopBar } from '../components/ReportTopBar';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  function handleSectionPress(section: Section) {
    navigation.navigate('SectionDetail', { sectionId: section.id });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.dynamicIsland} />
        <Text style={styles.statusIcons}>▲ ■</Text>
      </View>

      <ReportTopBar navigation={navigation} />

      {/* Masthead photo */}
      <View style={styles.masthead}>
        <View style={styles.mastheadPlaceholder}>
          <FontAwesome6 name="house" size={24} color="#9ca3af" />
          <Text style={styles.mastheadLabel}>Property Photo</Text>
        </View>
      </View>

      {/* Section list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {REPORT_SECTIONS.map(section => (
          <TouchableOpacity
            key={section.id}
            style={styles.listItem}
            onPress={() => handleSectionPress(section)}
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <View style={styles.checkCircle} />
            </View>
            <Text style={styles.listItemText} numberOfLines={1}>{section.title}</Text>
            <View style={styles.listItemRight}>
              <FontAwesome6 name="chevron-right" size={12} color="#6b7280" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.sideGroup}>
          <IconButton name="bolt" iconColor="#09334b" backgroundColor="transparent" />
          <IconButton name="aperture" iconColor="#09334b" backgroundColor="transparent" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  time: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  dynamicIsland: {
    width: 122,
    height: 30,
    backgroundColor: '#000',
    borderRadius: 9999,
  },
  statusIcons: { fontSize: 11, color: '#1f2937' },
  masthead: {
    height: 96,
    backgroundColor: '#e5e7eb',
  },
  mastheadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mastheadLabel: {
    fontSize: 13,
    color: '#9ca3af',
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 8 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    minHeight: 52,
  },
  listItemLeft: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  listItemText: {
    flex: 1,
    fontSize: 18,
    color: '#000000',
    fontWeight: '400',
  },
  listItemRight: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
  },
  sideGroup: {
    flexDirection: 'row',
    backgroundColor: '#eef1f7',
    borderRadius: 100,
  },
});
