import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../components/IconButton';
import { ProcessedBanner } from '../components/ProcessedBanner';
import { useAiQueue } from '../context/AiQueueContext';

interface CollectionDetailScreenProps {
  navigation: any;
  route: { params: { collectionId: string } };
}

export function CollectionDetailScreen({ navigation, route }: CollectionDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { queue } = useAiQueue();
  const collection = queue.find(c => c.id === route.params.collectionId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton
          name="arrow-left"
          iconColor="#052339"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title} numberOfLines={1}>
          {collection?.subsectionTitle ?? 'Collection'}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ProcessedBanner />

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Collection detail coming soon</Text>
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
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#052339',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#647382',
  },
});
