import { Text } from 'react-native';
import { Screen } from '../components/Screen';
import { type } from '../lib/theme';

/** S6 — Share sheet: send to registered friends (toast on success) OR copy public link (built in A5/A9). */
export default function Share() {
  return (
    <Screen title="Share" spec="S6 · modal sheet — brief A5 + A9">
      <Text style={type.body}>· Send to friends (multi-select + note)</Text>
      <Text style={type.body}>· Copy public link (works for non-users)</Text>
    </Screen>
  );
}
