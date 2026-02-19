import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPORT_SECTIONS, Section } from '../data/mockData';

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

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.iconButton}>
          <Text style={styles.iconText}>←</Text>
        </View>
        <Text style={styles.topTitle}>Residential Report</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.syncIcon}>↑☁</Text>
        </TouchableOpacity>
      </View>

      {/* Masthead photo */}
      <View style={styles.masthead}>
        <View style={styles.mastheadPlaceholder}>
          <Text style={styles.mastheadLabel}>🏠 Property Photo</Text>
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
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {/* Left — flashlight + camera */}
        <View style={styles.sideGroup}>
          <TouchableOpacity style={styles.sideBtn}>
            <Text style={styles.sideIcon}>⚡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn}>
            <Text style={styles.sideIcon}>◎</Text>
          </TouchableOpacity>
        </View>

        {/* Center — blue AI pill */}
        <View style={styles.primaryPill}>
          <TouchableOpacity style={styles.pillBtn}>
            <Text style={styles.pillIcon}>📷✦</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pillBtn}>
            <Text style={styles.pillIcon}>🎙✦</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pillBtn}>
            <Text style={styles.pillIcon}>🖼✦</Text>
          </TouchableOpacity>
        </View>

        {/* Right — more */}
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreIcon}>•••</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 20, color: '#052339', fontWeight: '600' },
  syncIcon: { fontSize: 14, color: '#052339' },
  topTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
    textAlign: 'center',
  },
  masthead: {
    height: 96,
    backgroundColor: '#e5e7eb',
    marginBottom: 0,
  },
  mastheadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mastheadLabel: {
    fontSize: 16,
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
    width: 44,
    height: 44,
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 22,
    color: '#6b7280',
    fontWeight: '300',
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
    padding: 4,
    gap: 2,
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  sideIcon: { fontSize: 16, color: '#09334b' },
  primaryPill: {
    flexDirection: 'row',
    backgroundColor: '#0779ac',
    borderRadius: 100,
    padding: 4,
    gap: 2,
  },
  pillBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  pillIcon: { fontSize: 14 },
  moreBtn: {
    width: 48,
    height: 56,
    backgroundColor: '#eef1f7',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    fontSize: 12,
    color: '#09334b',
    letterSpacing: 1,
    transform: [{ rotate: '90deg' }],
  },
});
