import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { REPORT_SECTIONS, Section } from '../data/mockData';
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';
import { ReportTopBar } from '../components/ReportTopBar';
import { ProcessedBanner } from '../components/ProcessedBanner';
import { AiAssistOverlay } from '../components/AiAssistOverlay';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function handleSectionPress(section: Section) {
    navigation.navigate('SectionDetail', { sectionId: section.id });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ReportTopBar
        navigation={navigation}
        backIcon="xmark"
        onBack={() => navigation.goBack()}
        onSearchOpen={(q) => { setSearchQuery(q); setSearchVisible(true); }}
      />
      <ProcessedBanner />
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
              <FontAwesome7Pro name={section.icon} size={18} color="#647382" />
            </View>
            <Text style={styles.listItemText} numberOfLines={1}>{section.title}</Text>
            <View style={styles.listItemRight}>
              <FontAwesome6 name="chevron-right" size={12} color="#6b7280" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.exitButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome7Pro name="arrow-left-from-line" size={16} color="#052339" />
          <Text style={styles.exitLabel}>Exit</Text>
        </TouchableOpacity>
      </View>

      <AiAssistOverlay
        visible={searchVisible}
        initialQuery={searchQuery}
        onClose={() => setSearchVisible(false)}
        onSparklesPress={() => navigation.navigate('AiObservations')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
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
  bottomBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
    backgroundColor: '#ffffff',
    alignItems: 'flex-start',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
  },
  exitLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#052339',
  },
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
});
