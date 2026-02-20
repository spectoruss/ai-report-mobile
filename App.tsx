import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { HomeScreen } from './src/screens/HomeScreen';
import { SectionDetailScreen } from './src/screens/SectionDetailScreen';
import { ToolbarConfigScreen } from './src/screens/ToolbarConfigScreen';
import { AiObservationsScreen } from './src/screens/AiObservationsScreen';
import { CollectionDetailScreen } from './src/screens/CollectionDetailScreen';
import { ItemDetailScreen } from './src/screens/ItemDetailScreen';
import { CommentMatchScreen } from './src/screens/CommentMatchScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { NewSectionScreen } from './src/screens/NewSectionScreen';
import { ToolbarProvider } from './src/context/ToolbarContext';
import { AiQueueProvider } from './src/context/AiQueueContext';
import { navigationRef } from './src/navigation/navigationRef';

export type RootStackParamList = {
  Home: undefined;
  SectionDetail: { sectionId: string };
  ItemDetail: { sectionId: string; subsectionId: string };
  ToolbarConfig: undefined;
  AiObservations: undefined;
  CollectionDetail: { collectionId: string };
  CommentMatch: undefined;
  Camera: { collectionId: string };
  NewSection: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    'FontAwesome7Pro-Regular': require('./assets/Fonts/Font Awesome 7 Pro-Regular-400.otf'),
    'FontAwesome7Pro-Solid': require('./assets/Fonts/Font Awesome 7 Pro-Solid-900.otf'),
  });

  if (!fontsLoaded) return <View style={{ flex: 1 }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1, overflow: 'hidden' }}>
      <SafeAreaProvider>
        <ToolbarProvider>
          <AiQueueProvider>
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SectionDetail" component={SectionDetailScreen} />
                <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
                <Stack.Screen name="ToolbarConfig" component={ToolbarConfigScreen} />
                <Stack.Screen
                  name="AiObservations"
                  component={AiObservationsScreen}
                  options={{ presentation: 'modal' }}
                />
                <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
                <Stack.Screen
                  name="CommentMatch"
                  component={CommentMatchScreen}
                  options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                  name="Camera"
                  component={CameraScreen}
                  options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                  name="NewSection"
                  component={NewSectionScreen}
                  options={{ presentation: 'modal' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </AiQueueProvider>
        </ToolbarProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
