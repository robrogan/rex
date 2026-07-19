import { Link } from 'expo-router';
import { Screen } from '../../components/Screen';
import { type } from '../../lib/theme';

/** S7 — Friends list + invite code (built in A5). */
export default function Friends() {
  return (
    <Screen title="Friendos" spec="S7 · invite code share + connect — brief A5">
      <Link href="/friend/leul-demo" style={type.action}>→ Demo friend profile (S11)</Link>
    </Screen>
  );
}
