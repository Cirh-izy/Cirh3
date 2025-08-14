// App.tsx
import React, { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import AppNavigator from './src/navigation/tabnavigator'
import Bootstrapper from './src/utils/bootstrapper'   // 👈 nuevo
import { ensureAnonSession } from './src/utils/firebase'

export default function App() {

  useEffect(() => {
    (async () => { await ensureAnonSession(); })();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {/* Arranca sesión, restaura grupo, cache y listeners */}
          <Bootstrapper />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}