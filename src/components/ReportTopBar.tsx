import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { IconButton } from './IconButton';
import { FontAwesome7Pro } from './FontAwesome7Pro';
import { FontAwesome7ProSolid } from './FontAwesome7ProSolid';
import { useAiQueue } from '../context/AiQueueContext';
import { AiAssistOverlay } from './AiAssistOverlay';

// Width of the right-side buttons when fully shown:
// 8 (gap) + 48 (sparkles) + 8 (gap) + 48 (ellipsis) = 112
const RIGHT_EXPANDED_W = 112;
// Width of the dismiss button slot when focused:
// 8 (gap) + 48 (button) = 56
const DISMISS_EXPANDED_W = 56;

interface ReportTopBarProps {
  navigation: any;
  onBack?: () => void;
  backIcon?: string;
}

export function ReportTopBar({ navigation, onBack, backIcon = 'arrow-left' }: ReportTopBarProps) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Single driver value — useNativeDriver: false because we animate width
  const rightWidthAnim = useRef(new Animated.Value(RIGHT_EXPANDED_W)).current;
  const dismissWidthAnim = useRef(new Animated.Value(0)).current;

  // Opacity can be derived via interpolation on the same JS-thread values
  const rightOpacity = rightWidthAnim.interpolate({
    inputRange: [0, RIGHT_EXPANDED_W * 0.4, RIGHT_EXPANDED_W],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  const dismissOpacity = dismissWidthAnim.interpolate({
    inputRange: [0, DISMISS_EXPANDED_W * 0.6, DISMISS_EXPANDED_W],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const { queue, processingBySection } = useAiQueue();
  const processingCount = Object.values(processingBySection).reduce((sum, s) => sum + s.count, 0);
  const totalCount = queue.length + processingCount;

  function expandSearch() {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(rightWidthAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(dismissWidthAnim, {
        toValue: DISMISS_EXPANDED_W,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }

  function collapseSearch() {
    inputRef.current?.blur();
    setIsFocused(false);
    setSearchQuery('');
    Animated.parallel([
      Animated.timing(rightWidthAnim, {
        toValue: RIGHT_EXPANDED_W,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(dismissWidthAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }

  function handleSearchSubmit() {
    if (searchQuery.trim()) {
      setSearchVisible(true);
    }
  }

  return (
    <View style={styles.topBar}>
      {/* Search pill — flex: 1 naturally expands as siblings collapse */}
      <View style={styles.searchPill}>
        <FontAwesome7Pro name="magnifying-glass" size={18} color="#09334b" />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#647382"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={expandSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome7Pro name="xmark-circle" size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Dismiss button — slides in from right when focused */}
      <Animated.View
        style={[styles.sideSlot, { width: dismissWidthAnim, opacity: dismissOpacity }]}
        pointerEvents={isFocused ? 'auto' : 'none'}
      >
        <TouchableOpacity style={styles.dismissButton} activeOpacity={0.7} onPress={collapseSearch}>
          <FontAwesome7Pro name="xmark" size={16} color="#052339" />
        </TouchableOpacity>
      </Animated.View>

      {/* Sparkles + ellipsis — slide out when focused */}
      <Animated.View
        style={[styles.sideSlot, { width: rightWidthAnim, opacity: rightOpacity }]}
        pointerEvents={isFocused ? 'none' : 'auto'}
      >
        <View>
          <TouchableOpacity
            style={styles.sparklesButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AiObservations')}
          >
            <FontAwesome7ProSolid name="sparkle" size={18} color="#052339" />
          </TouchableOpacity>
          {totalCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalCount}</Text>
            </View>
          )}
        </View>
        <IconButton
          name="ellipsis-vertical"
          iconColor="#052339"
          backgroundColor="#eef1f7"
          borderRadius={16}
          onPress={() => navigation.navigate('ToolbarConfig')}
        />
      </Animated.View>

      <AiAssistOverlay
        visible={searchVisible}
        initialQuery={searchQuery}
        onClose={() => { setSearchVisible(false); setSearchQuery(''); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    // No gap — spacing is handled by sideSlot leading margin
  },
  searchPill: {
    flex: 1,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#09334b',
    paddingVertical: 0,
    outlineWidth: 0,
    outline: 'none',
    boxShadow: 'none',
    borderWidth: 0,
  } as any,

  // Container for animated side slots — overflow hidden so content clips during animation
  sideSlot: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8, // the inter-element gap
  },

  dismissButton: {
    width: 48,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklesButton: {
    width: 48,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0779ac',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
