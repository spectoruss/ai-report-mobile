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
import { ToolbarProvider } from './src/context/ToolbarContext';
import { AiQueueProvider } from './src/context/AiQueueContext';

export type RootStackParamList = {
  Home: undefined;
  SectionDetail: { sectionId: string };
  ToolbarConfig: undefined;
  AiObservations: undefined;
  CollectionDetail: { collectionId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    'FontAwesome7Pro-Regular': require('./assets/Fonts/Font Awesome 7 Pro-Regular-400.otf'),
  });

  if (!fontsLoaded) return <View style={{ flex: 1 }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToolbarProvider>
          <AiQueueProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SectionDetail" component={SectionDetailScreen} />
                <Stack.Screen name="ToolbarConfig" component={ToolbarConfigScreen} />
                <Stack.Screen
                  name="AiObservations"
                  component={AiObservationsScreen}
                  options={{ presentation: 'modal' }}
                />
                <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </AiQueueProvider>
        </ToolbarProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
