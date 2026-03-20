# Mobile Application Standards

## Overview
Standards for mobile application development using React Native, focusing on native performance, cross-platform compatibility, and excellent user experience.

## Project Architecture

### Recommended Tech Stack
```yaml
# Mobile Framework
mobile_framework: React Native 0.73+
navigation: React Navigation 6+
state_management: Zustand + React Query
ui_components: NativeBase / React Native Elements
styling: StyleSheet + React Native Reanimated

# Development Tools
package_manager: npm / yarn
bundler: Metro (built-in)
testing: Jest + React Native Testing Library
e2e_testing: Detox

# Backend Integration
api_client: Axios + React Query
real_time: Socket.io / Firebase Realtime
push_notifications: Firebase Cloud Messaging
analytics: Firebase Analytics / Mixpanel

# Deployment
ios_deployment: App Store Connect
android_deployment: Google Play Console
ci_cd: GitHub Actions + Fastlane
crash_reporting: Crashlytics / Sentry
```

## Alternative Perspective
**Counter-point**: React Native might not be the best choice for all mobile apps. Native development (Swift/Kotlin) or Flutter could provide better performance and platform-specific features, especially for graphics-intensive or hardware-dependent applications.

## Project Structure Standards

### React Native App Structure
```
mobile-app/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   ├── forms/           # Form components
│   │   └── navigation/      # Navigation components
│   │
│   ├── screens/             # Screen components
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignUpScreen.tsx
│   │   ├── Home/
│   │   │   ├── HomeScreen.tsx
│   │   │   └── components/
│   │   └── Profile/
│   │
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   │
│   ├── services/           # API and external services
│   │   ├── api/
│   │   ├── auth/
│   │   ├── notifications/
│   │   └── storage/
│   │
│   ├── stores/             # State management
│   │   ├── auth-store.ts
│   │   ├── user-store.ts
│   │   └── app-store.ts
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   └── useLocation.ts
│   │
│   ├── utils/              # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   │
│   ├── assets/             # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── types/              # TypeScript definitions
│       ├── api.ts
│       ├── navigation.ts
│       └── user.ts
│
├── android/                # Android-specific code
├── ios/                    # iOS-specific code
├── __tests__/              # Test files
├── metro.config.js         # Metro bundler config
├── react-native.config.js  # RN configuration
└── app.json               # App configuration
```

## Navigation Architecture

### React Navigation Setup
```typescript
// navigation/types.ts
export type RootStackParamList = {
  Auth: undefined
  App: undefined
}

export type AuthStackParamList = {
  Login: undefined
  SignUp: undefined
  ForgotPassword: undefined
}

export type AppTabParamList = {
  Home: undefined
  Search: { query?: string }
  Profile: { userId: string }
  Settings: undefined
}
```

### Navigation Implementation
```typescript
// navigation/AppNavigator.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '@/hooks/useAuth'
import AuthNavigator from './AuthNavigator'
import TabNavigator from './TabNavigator'
import { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

### Tab Navigation
```typescript
// navigation/TabNavigator.tsx
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen, SearchScreen, ProfileScreen, SettingsScreen } from '@/screens'
import { TabIcon } from '@/components/navigation'
import { AppTabParamList } from './types'

const Tab = createBottomTabNavigator<AppTabParamList>()

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId: 'current' }}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="user" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
```

## Component Patterns

### Screen Component Structure
```typescript
// screens/Home/HomeScreen.tsx
import React from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Header, FeedCard, LoadingSpinner, ErrorMessage } from '@/components'
import { feedService } from '@/services'
import { styles } from './HomeScreen.styles'

export default function HomeScreen() {
  const {
    data: feed,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['feed'],
    queryFn: feedService.getFeed,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Home" />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {feed?.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
```

### Component Styling
```typescript
// screens/Home/HomeScreen.styles.ts
import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
})
```

### Reusable Components
```typescript
// components/common/Button.tsx
import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    (disabled || loading) && styles.disabled,
    style,
  ]

  const titleStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={titleStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#8E8E93',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabled: {
    backgroundColor: '#E5E5EA',
  },
  smallSize: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  mediumSize: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  largeSize: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: '#007AFF',
  },
  disabledText: {
    color: '#8E8E93',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
})
```

## State Management

### Mobile-Optimized Store
```typescript
// stores/app-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState, AppStateStatus } from 'react-native'

interface MobileAppState {
  // App lifecycle
  appState: AppStateStatus
  isOnline: boolean

  // User preferences
  theme: 'light' | 'dark' | 'system'
  notifications: {
    enabled: boolean
    sound: boolean
    vibration: boolean
  }

  // Cache management
  cacheVersion: string
  lastSync: string | null

  actions: {
    setAppState: (state: AppStateStatus) => void
    setOnlineStatus: (online: boolean) => void
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    updateNotificationSettings: (settings: Partial<MobileAppState['notifications']>) => void
    clearCache: () => void
    updateLastSync: () => void
  }
}

export const useMobileAppStore = create<MobileAppState>()(
  persist(
    (set, get) => ({
      appState: AppState.currentState,
      isOnline: true,
      theme: 'system',
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
      },
      cacheVersion: '1.0.0',
      lastSync: null,

      actions: {
        setAppState: (appState) => set({ appState }),
        setOnlineStatus: (isOnline) => set({ isOnline }),
        setTheme: (theme) => set({ theme }),
        updateNotificationSettings: (settings) =>
          set((state) => ({
            notifications: { ...state.notifications, ...settings }
          })),
        clearCache: () => set({ lastSync: null }),
        updateLastSync: () => set({ lastSync: new Date().toISOString() })
      }
    }),
    {
      name: 'mobile-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        notifications: state.notifications,
        cacheVersion: state.cacheVersion,
        lastSync: state.lastSync,
      }),
    }
  )
)
```

## Native Features Integration

### Permissions Management
```typescript
// hooks/usePermissions.ts
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import {
  request,
  check,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions'

type PermissionType = 'camera' | 'location' | 'notifications' | 'microphone'

const PERMISSION_MAP: Record<PermissionType, Permission> = {
  camera: Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
  location: Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  microphone: Platform.OS === 'ios'
    ? PERMISSIONS.IOS.MICROPHONE
    : PERMISSIONS.ANDROID.RECORD_AUDIO,
  notifications: Platform.OS === 'ios'
    ? PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY
    : PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
}

export function usePermissions(permissionType: PermissionType) {
  const [status, setStatus] = useState<string>(RESULTS.UNAVAILABLE)
  const [loading, setLoading] = useState(true)

  const permission = PERMISSION_MAP[permissionType]

  const checkPermission = async () => {
    try {
      const result = await check(permission)
      setStatus(result)
      return result
    } catch (error) {
      console.error('Permission check failed:', error)
      setStatus(RESULTS.UNAVAILABLE)
      return RESULTS.UNAVAILABLE
    } finally {
      setLoading(false)
    }
  }

  const requestPermission = async () => {
    try {
      setLoading(true)
      const result = await request(permission)
      setStatus(result)
      return result
    } catch (error) {
      console.error('Permission request failed:', error)
      setStatus(RESULTS.UNAVAILABLE)
      return RESULTS.UNAVAILABLE
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPermission()
  }, [])

  return {
    status,
    loading,
    granted: status === RESULTS.GRANTED,
    denied: status === RESULTS.DENIED,
    blocked: status === RESULTS.BLOCKED,
    checkPermission,
    requestPermission,
  }
}
```

### Push Notifications
```typescript
// services/notifications.ts
import messaging from '@react-native-firebase/messaging'
import { Platform } from 'react-native'
import PushNotification from 'react-native-push-notification'

class NotificationService {
  async initialize() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL

      if (!enabled) {
        throw new Error('Push notification permission denied')
      }
    }

    // Configure local notifications
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('Local notification:', notification)
      },
      requestPermissions: Platform.OS === 'ios',
    })

    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage)
    })

    // Get FCM token
    const token = await messaging().getToken()
    return token
  }

  async onMessage(handler: (message: any) => void) {
    return messaging().onMessage(handler)
  }

  async onTokenRefresh(handler: (token: string) => void) {
    return messaging().onTokenRefresh(handler)
  }

  async showLocalNotification(title: string, message: string, data?: any) {
    PushNotification.localNotification({
      title,
      message,
      userInfo: data,
      playSound: true,
      soundName: 'default',
    })
  }

  async scheduleNotification(
    title: string,
    message: string,
    date: Date,
    data?: any
  ) {
    PushNotification.localNotificationSchedule({
      title,
      message,
      date,
      userInfo: data,
      playSound: true,
      soundName: 'default',
    })
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications()
  }
}

export const notificationService = new NotificationService()
```

## Alternative Perspective
**Counter-point**: Complex permission and notification management can make the app feel heavy and intrusive. Sometimes a simpler approach with basic functionality leads to better user experience than trying to integrate every available native feature.

## Performance Optimization

### Image Optimization
```typescript
// components/common/OptimizedImage.tsx
import React from 'react'
import { Image, ImageProps } from 'react-native'
import FastImage, { FastImageProps } from 'react-native-fast-image'

interface OptimizedImageProps extends Omit<FastImageProps, 'source'> {
  source: { uri: string } | number
  fallback?: number
  placeholder?: number
}

export default function OptimizedImage({
  source,
  fallback,
  placeholder,
  ...props
}: OptimizedImageProps) {
  if (typeof source === 'number') {
    // Local image - use regular Image component
    return <Image source={source} {...(props as ImageProps)} />
  }

  return (
    <FastImage
      source={{
        uri: source.uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      defaultSource={placeholder}
      fallback={fallback}
      {...props}
    />
  )
}
```

### List Performance
```typescript
// components/common/OptimizedList.tsx
import React, { useCallback } from 'react'
import { FlatList, ListRenderItem, FlatListProps } from 'react-native'

interface OptimizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[]
  renderItem: ListRenderItem<T>
  keyExtractor: (item: T, index: number) => string
}

export default function OptimizedList<T>({
  data,
  renderItem,
  keyExtractor,
  ...props
}: OptimizedListProps<T>) {
  const getItemLayout = useCallback(
    (data: T[] | null | undefined, index: number) => ({
      length: 80, // Adjust based on your item height
      offset: 80 * index,
      index,
    }),
    []
  )

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
      {...props}
    />
  )
}
```

This mobile application standard provides a comprehensive foundation for building performant, feature-rich React Native applications with proper navigation, state management, and native platform integration.