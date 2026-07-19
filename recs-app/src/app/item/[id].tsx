import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { type } from '../../lib/theme';

/**
 * S5 — Book detail (designed in Figma). Also the public web route (S12):
 * static content renders for signed-out visitors; dynamic content gated (A9).
 * Gains the U15 "Recommended to…" affordance in A5.
 */
export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen title="Oathbringer" spec={`S5/S12 · item: ${id}`}>
      <Text style={type.body}>Brandon Sanderson</Text>
      <Text style={type.action}>Epic Fantasy · Magic · Adventure</Text>
      <Text style={type.action}>🧑‍🤝‍🧑 3+ Friendos recommended this</Text>
      <Text style={type.description}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
      <Link href="/share" style={type.action}>→ Share (S6)</Link>
      <Link href="/status" style={type.action}>→ Update status (S9)</Link>
    </Screen>
  );
}
