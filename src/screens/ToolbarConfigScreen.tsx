import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import { IconButton } from '../components/IconButton';
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';
import { useToolbar, ToolbarItemId } from '../context/ToolbarContext';

interface ToolbarConfigScreenProps {
  navigation: any;
}

const ITEM_HEIGHT = 48;

interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

const INITIAL_UTILITIES: ToolbarItem[] = [
  { id: 'torch', label: 'Torch', icon: 'bolt', visible: false },
  { id: 'cya', label: 'CYA', icon: 'shield-halved', visible: false },
];

const INITIAL_AI: ToolbarItem[] = [
  { id: 'gallery', label: 'Gallery Input', icon: 'images', visible: true },
  { id: 'audio', label: 'Audio Input', icon: 'microphone', visible: true },
  { id: 'camera', label: 'Camera Input', icon: 'camera', visible: true },
];

// ─── DraggableRow ────────────────────────────────────────────────────────────

interface DraggableRowProps {
  item: ToolbarItem;
  index: number;
  total: number;
  draggingIndex: SharedValue<number>;
  dragY: SharedValue<number>;
  isLast: boolean;
  onDragStart: (index: number) => void;
  onDragEnd: (fromIndex: number, dy: number) => void;
  onToggle: () => void;
}

function DraggableRow({
  item,
  index,
  total,
  draggingIndex,
  dragY,
  isLast,
  onDragStart,
  onDragEnd,
  onToggle,
}: DraggableRowProps) {
  const gesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .runOnJS(true)
    .onStart(() => {
      onDragStart(index);
    })
    .onUpdate(e => {
      if (draggingIndex.value === index) {
        dragY.value = e.translationY;
      }
    })
    .onEnd(e => {
      if (draggingIndex.value === index) {
        onDragEnd(index, e.translationY);
      }
    })
    .onFinalize(() => {
      if (draggingIndex.value === index) {
        draggingIndex.value = -1;
        dragY.value = withSpring(0);
      }
    });

  const animStyle = useAnimatedStyle(() => {
    const active = draggingIndex.value;
    const dy = dragY.value;

    if (active === index) {
      return {
        transform: [{ translateY: dy }],
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 8,
      };
    }

    if (active < 0) return {};

    const target = Math.max(0, Math.min(total - 1, Math.round(active + dy / ITEM_HEIGHT)));

    if (active < target && index > active && index <= target) {
      return { transform: [{ translateY: -ITEM_HEIGHT }] };
    }
    if (active > target && index >= target && index < active) {
      return { transform: [{ translateY: ITEM_HEIGHT }] };
    }

    return {};
  });

  return (
    <Animated.View style={animStyle}>
      <View style={styles.row}>
        <View style={styles.rowIconWrap}>
          <FontAwesome7Pro name={item.icon} size={18} color="#09334b" />
        </View>
        <Text style={styles.rowLabel}>{item.label}</Text>
        <TouchableOpacity style={styles.rowIconBtn} onPress={onToggle} activeOpacity={0.7}>
          <FontAwesome7Pro
            name={item.visible ? 'eye' : 'eye-slash'}
            size={16}
            color="#4e5e72"
          />
        </TouchableOpacity>
        <GestureDetector gesture={gesture}>
          <Animated.View style={styles.rowIconBtn}>
            <FontAwesome6 name="grip-lines" size={16} color="#4e5e72" />
          </Animated.View>
        </GestureDetector>
      </View>
      {!isLast && <View style={styles.divider} />}
    </Animated.View>
  );
}

// ─── SortableList ─────────────────────────────────────────────────────────────

interface SortableListProps {
  items: ToolbarItem[];
  onReorder: (items: ToolbarItem[]) => void;
  onToggle: (id: string) => void;
  isAi?: boolean;
}

function SortableList({ items, onReorder, onToggle, isAi = false }: SortableListProps) {
  const draggingIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);

  function handleDragStart(fromIndex: number) {
    draggingIndex.value = fromIndex;
    dragY.value = 0;
  }

  function handleDragEnd(fromIndex: number, dy: number) {
    const toIndex = Math.max(
      0,
      Math.min(items.length - 1, fromIndex + Math.round(dy / ITEM_HEIGHT))
    );
    draggingIndex.value = -1;
    dragY.value = 0;
    if (toIndex !== fromIndex) {
      const next = [...items];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      onReorder(next);
    }
  }

  const rows = items.map((item, index) => (
    <DraggableRow
      key={item.id}
      item={item}
      index={index}
      total={items.length}
      draggingIndex={draggingIndex}
      dragY={dragY}
      isLast={index === items.length - 1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onToggle={() => onToggle(item.id)}
    />
  ));

  if (isAi) {
    return (
      <LinearGradient
        colors={['#ebfaff', '#eff1fa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.group}
      >
        {rows}
      </LinearGradient>
    );
  }

  return <View style={styles.group}>{rows}</View>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ToolbarConfigScreen({ navigation }: ToolbarConfigScreenProps) {
  const insets = useSafeAreaInsets();
  const { visibility, setVisibility, resetVisibility } = useToolbar();

  // Order is local; visibility is derived from context
  const [utilityOrder, setUtilityOrder] = useState<ToolbarItem[]>(INITIAL_UTILITIES);
  const [aiOrder, setAiOrder] = useState<ToolbarItem[]>(INITIAL_AI);

  const utilityItems = utilityOrder.map(item => ({ ...item, visible: visibility[item.id as ToolbarItemId] }));
  const aiItems = aiOrder.map(item => ({ ...item, visible: visibility[item.id as ToolbarItemId] }));

  function toggle(id: string) {
    setVisibility(id as ToolbarItemId, !visibility[id as ToolbarItemId]);
  }

  function handleReset() {
    setUtilityOrder(INITIAL_UTILITIES);
    setAiOrder(INITIAL_AI);
    resetVisibility();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <IconButton
          name="arrow-left"
          iconColor="#190042"
          backgroundColor="rgba(0,0,0,0.05)"
          onPress={() => navigation.goBack()}
        />
        <View style={{ flex: 1 }} />
        <TouchableOpacity activeOpacity={0.7} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 96 }]}
      >
        {/* Heading */}
        <Text style={styles.title}>Toolbar Configuration</Text>
        <Text style={styles.subtitle}>Arrange the toolbar so that it fits your needs</Text>

        {/* Utilities */}
        <SectionHeader label="UTILITIES" />
        <SortableList
          items={utilityItems}
          onReorder={setUtilityOrder}
          onToggle={toggle}
        />

        {/* AI Toolbar */}
        <SectionHeader label="AI TOOLBAR" />
        <SortableList
          items={aiItems}
          onReorder={setAiOrder}
          onToggle={toggle}
          isAi
        />
      </ScrollView>

      {/* FAB */}
      <View style={[styles.fabRow, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => navigation.goBack()}>
          <FontAwesome7Pro name="check" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionHeaderRight}>
        <View style={styles.sectionIconBtn}>
          <FontAwesome6 name="grip-lines" size={14} color="#4e5e72" />
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1771b8',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#052339',
    marginTop: 12,
    letterSpacing: -0.44,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 28,
    marginTop: 2,
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 6,
    marginTop: 8,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '400',
    color: '#647382',
    letterSpacing: 1,
    textTransform: 'uppercase',
    lineHeight: 24,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: '#f3f6f7',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 16,
    paddingRight: 6,
    minHeight: ITEM_HEIGHT,
    backgroundColor: 'transparent',
  },
  rowIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#212731',
    paddingHorizontal: 10,
  },
  rowIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ffffff',
    marginLeft: 50,
  },
  fabRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#052339',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
