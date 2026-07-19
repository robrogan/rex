import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { type } from '../../lib/theme';

/** S11 — Friend profile with "recs between us" affordance (U14, built in A5). */
export default function FriendProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen title="Leul" spec={`S11 · friend: ${id}`}>
      <Text style={type.body}>Recs between us — what I sent them, what they sent me, with statuses.</Text>
    </Screen>
  );
}
