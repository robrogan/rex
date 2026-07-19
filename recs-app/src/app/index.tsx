import { Redirect } from 'expo-router';

/** Until auth exists (A3), land on onboarding. */
export default function Index() {
  return <Redirect href="/onboarding" />;
}
