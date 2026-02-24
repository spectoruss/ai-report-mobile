import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome7Pro } from './FontAwesome7Pro';
import { useAudioRecording } from '../context/AudioRecordingContext';

const BOTTOM_BAR_CLEARANCE = 73;
const WAVEFORM_BARS = 26;
const SCREEN_WIDTH = Dimensions.get('window').width;

export function AudioBottomSheet() {
  const { isRecording, elapsed, cancelRecording, confirmRecording, isSearchOpen } = useAudioRecording();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);

  // JS driver — translateX for right-side entrance/exit
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // Drives the morph: 0 = full blue pill, 1 = gray recorder
  const morphAnim = useRef(new Animated.Value(0)).current;

  // Confirm button springs from "mic-tap" scale (native driver — isolated node)
  const confirmScale = useRef(new Animated.Value(1.18)).current;

  // Shifts the pill down when search overlay is open
  const searchShiftAnim = useRef(new Animated.Value(0)).current;

  const waveValues = useRef(
    Array.from({ length: WAVEFORM_BARS }, () => new Animated.Value(0.2))
  ).current;
  const waveAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRecording) {
      setMounted(true);
      slideAnim.setValue(SCREEN_WIDTH);
      morphAnim.setValue(0);
      confirmScale.setValue(1.18);

      startWaveform();

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
          tension: 200,
          friction: 22,
        }),
        Animated.timing(morphAnim, {
          toValue: 1,
          duration: 360,
          useNativeDriver: false,
        }),
        Animated.spring(confirmScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 180,
          friction: 13,
        }),
      ]).start();
    } else {
      waveAnimRef.current?.stop();
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 220,
        useNativeDriver: false,
      }).start(() => setMounted(false));
    }
  }, [isRecording]);

  // Shift pill down when search overlay opens, back up when it closes
  useEffect(() => {
    Animated.spring(searchShiftAnim, {
      toValue: isSearchOpen ? BOTTOM_BAR_CLEARANCE : 0,
      useNativeDriver: false,
      tension: 150,
      friction: 20,
    }).start();
  }, [isSearchOpen]);

  function startWaveform() {
    waveAnimRef.current?.stop();
    waveValues.forEach(v => v.setValue(0.2));
    const animations = waveValues.map(val =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 180 + Math.random() * 280,
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: Math.random() * 0.3 + 0.05,
            duration: 180 + Math.random() * 280,
            useNativeDriver: false,
          }),
        ])
      )
    );
    waveAnimRef.current = Animated.parallel(animations);
    waveAnimRef.current.start();
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  if (!mounted) return null;

  // ── Derived animated values ───────────────────────────────────────────────

  const pillBg = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0779ac', '#EEF1F7'],
  });

  const contentOpacity = morphAnim.interpolate({
    inputRange: [0, 0.28, 0.72, 1],
    outputRange: [0, 0, 0.7, 1],
  });

  const cancelOpacity = morphAnim.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0, 1],
  });

  const cancelTranslateX = morphAnim.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [-12, -12, 0],
  });

  return (
    <Animated.View
      style={[
        styles.gradientContainer,
        {
          bottom: insets.bottom + BOTTOM_BAR_CLEARANCE,
          transform: [{ translateX: slideAnim }, { translateY: searchShiftAnim }],
        },
      ]}
    >
      {/* Gradient: transparent at top → white from 65% down */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', '#ffffff']}
        locations={[0, 0.85]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Pill row */}
      <View style={styles.pillRow}>
        {/* Cancel X — slides in from left as morph completes */}
        <Animated.View
          style={{
            opacity: cancelOpacity,
            transform: [{ translateX: cancelTranslateX }],
          }}
        >
          <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording} activeOpacity={0.7}>
            <FontAwesome7Pro name="xmark" size={16} color="#5d5d5d" />
          </TouchableOpacity>
        </Animated.View>

        {/* Main pill — morphs from blue to gray */}
        <Animated.View style={[styles.pill, { backgroundColor: pillBg }]}>
          {/* Waveform + timer — fade in as pill turns gray */}
          <Animated.View style={[styles.waveformRow, { opacity: contentOpacity }]}>
            <View style={styles.waveformArea}>
              {waveValues.map((val, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: val.interpolate({ inputRange: [0, 1], outputRange: [2, 18] }),
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.timer}>{formatTime(elapsed)}</Text>
          </Animated.View>

          {/* Confirm — always visible; springs from mic-tap scale */}
          <Animated.View style={{ transform: [{ scale: confirmScale }] }}>
            <TouchableOpacity style={styles.confirmButton} onPress={confirmRecording} activeOpacity={0.7}>
              <FontAwesome7Pro name="check" size={14} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1001,
    paddingTop: 44, // gradient fade space above pill
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  cancelButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    padding: 4,
    minHeight: 48,
  },
  waveformRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveformArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    height: 24,
    overflow: 'hidden',
  },
  waveBar: {
    width: 2,
    backgroundColor: '#5d5d5d',
    borderRadius: 1000,
    flexShrink: 0,
  },
  timer: {
    color: '#5d5d5d',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  confirmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0779ac',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
