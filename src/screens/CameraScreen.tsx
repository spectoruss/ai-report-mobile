import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../components/IconButton';
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';

interface CameraScreenProps {
  navigation: any;
  route: { params: { collectionId: string } };
}

export function CameraScreen({ navigation }: CameraScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton
          name="xmark"
          iconColor="#052339"
          backgroundColor="rgba(0,0,0,0.05)"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Camera</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.viewfinder}>
        <FontAwesome7Pro name="camera" size={48} color="#9ca3af" />
        <Text style={styles.placeholder}>Camera coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
    textAlign: 'center',
  },
  viewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#f9fafb',
  },
  placeholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
