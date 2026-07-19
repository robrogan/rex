import { Tabs } from 'expo-router';
import { colors, fonts } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.font,
        headerTitleStyle: { fontFamily: fonts.action },
        tabBarStyle: { backgroundColor: colors.primary800, borderTopColor: colors.bg },
        tabBarActiveTintColor: colors.primary400,
        tabBarInactiveTintColor: colors.font,
        tabBarLabelStyle: { fontFamily: fonts.action },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen name="tbr" options={{ title: 'TBR', headerShown: false }} />
      <Tabs.Screen name="friends" options={{ title: 'Friendos' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="profile" options={{ title: 'Me' }} />
    </Tabs>
  );
}
