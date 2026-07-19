import { Link } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { type } from '../../lib/theme';

/** S1 — Onboarding concept cards (designed in Figma: Follow through / A better friendship / Search and Send). */
export default function Onboarding() {
  return (
    <Screen title="Welcome, choose a path" spec="S1 · swipeable concept cards per Figma">
      <Text style={type.description}>
        Remember all those “must watch” shows your friends mentioned at dinner? Keep track of it all!
      </Text>
      <Link href="/sign-in" style={type.action}>→ Sign in (S2)</Link>
      <Link href="/tbr" style={type.action}>→ Skip to app (dev)</Link>
    </Screen>
  );
}
