import { Text } from 'react-native';
import { Screen } from '../components/Screen';
import { type } from '../lib/theme';

/** S9 — Status + reaction sheet: To Read → Started → Finished / Not for me (built in A6). */
export default function Status() {
  return (
    <Screen title="Update status" spec="S9 · modal sheet — brief A6">
      <Text style={type.body}>To Read → Started → Finished (loved / liked / not for me + note)</Text>
    </Screen>
  );
}
