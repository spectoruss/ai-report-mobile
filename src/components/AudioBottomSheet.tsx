import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

interface AudioBottomSheetProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (transcript: string) => void;
  inputType?: 'mic' | 'camera' | 'photo';
}

const MOCK_TRANSCRIPTS = [
  'The furnace filter is dirty and needs to be replaced',
  'Heat exchanger shows rust and corrosion needs evaluation',
  'Thermostat is functional and working properly',
  'Ductwork is disconnected in crawlspace needs repair',
  'Carbon monoxide detector is missing recommend installing',
  'Gutters are clogged with debris need cleaning',
  'Foundation has minor cracks typical of settling',
  'Water staining on basement walls past moisture intrusion',
];

const WAVEFORM_BARS = 28;

export function AudioBottomSheet({ visible, onCancel, onConfirm, inputType = 'mic' }: AudioBottomSheetProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const waveValues = useRef(
    Array.from({ length: WAVEFORM_BARS }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    if (visible) {
      setElapsed(0);
      setIsProcessing(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
      animateWaveform();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Tick timer
  useEffect(() => {
    if (!visible || isProcessing) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [visible, isProcessing]);

  function animateWaveform() {
    const animations = waveValues.map(val =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 200 + Math.random() * 300,
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: Math.random() * 0.3 + 0.1,
            duration: 200 + Math.random() * 300,
            useNativeDriver: false,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function handleConfirm() {
    const transcript = MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)];
    onConfirm(transcript);
  }

  const label = inputType === 'mic' ? 'Recording...' : inputType === 'camera' ? 'Processing image...' : 'Analyzing photo...';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onCancel} activeOpacity={1} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.row}>
            {/* Cancel */}
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isProcessing}>
              <FontAwesome6 name="xmark" size={16} color="#ffffff" />
            </TouchableOpacity>

            {/* Center — waveform + timer */}
            <View style={styles.center}>
              {isProcessing ? (
                <View style={styles.processingRow}>
                  <Text style={styles.processingDot}>●</Text>
                  <Text style={styles.processingDot}>●</Text>
                  <Text style={styles.processingDot}>●</Text>
                  <Text style={styles.processingLabel}>Matching comment...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.waveform}>
                    {waveValues.map((val, i) => (
                      <Animated.View
                        key={i}
                        style={[
                          styles.waveBar,
                          {
                            height: val.interpolate({
                              inputRange: [0, 1],
                              outputRange: [3, 20],
                            }),
                            opacity: val.interpolate({
                              inputRange: [0.1, 1],
                              outputRange: [0.3, 1],
                            }),
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.timer}>{formatTime(elapsed)}</Text>
                </>
              )}
            </View>

            {/* Confirm */}
            <TouchableOpacity
              style={[styles.confirmButton, isProcessing && styles.confirmDisabled]}
              onPress={handleConfirm}
              disabled={isProcessing}
            >
              <FontAwesome6 name="check" size={20} color="#052339" />
            </TouchableOpacity>
          </View>

          {/* Home indicator */}
          <View style={styles.homeIndicator} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#052339',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  waveBar: {
    width: 2,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  timer: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  processingDot: {
    color: '#ffffff',
    fontSize: 8,
    opacity: 0.7,
  },
  processingLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  confirmButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 86,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 12,
  },
});
