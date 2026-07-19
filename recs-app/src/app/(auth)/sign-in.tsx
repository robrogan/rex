import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { useAuth } from '../../lib/auth';
import { colors, radii, spacing, type } from '../../lib/theme';

/** S2 — Sign up / sign in with email OTP (Supabase). Built in A3. */
export default function SignIn() {
  const { signInWithOtp, verifyOtp, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <Screen title="Sign in" spec="S2 · email OTP">
        <Text style={type.body}>
          The backend isn’t connected yet. Add your Supabase keys to `.env`
          (see docs/SUPABASE_SETUP.md), then restart the app.
        </Text>
        <Link href="/tbr" style={type.action}>
          → Skip to app (dev)
        </Link>
      </Screen>
    );
  }

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      await signInWithOtp(email);
      setStage('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code');
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode() {
    setBusy(true);
    setError(null);
    try {
      await verifyOtp(email, code);
      router.replace('/tbr');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Sign in"
      spec={stage === 'email' ? 'S2 · enter your email' : 'S2 · enter the 6-digit code'}>
      {stage === 'email' ? (
        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor={colors.description}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!busy}
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="123456"
          placeholderTextColor={colors.description}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          editable={!busy}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={styles.button}
        disabled={busy}
        onPress={stage === 'email' ? sendCode : confirmCode}>
        {busy ? (
          <ActivityIndicator color={colors.primary800} />
        ) : (
          <Text style={styles.buttonLabel}>
            {stage === 'email' ? 'Send code' : 'Verify'}
          </Text>
        )}
      </Pressable>

      {stage === 'code' ? (
        <Pressable onPress={() => setStage('email')} disabled={busy}>
          <Text style={type.action}>← Use a different email</Text>
        </Pressable>
      ) : (
        <View />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    ...type.body,
    borderWidth: 1,
    borderColor: colors.cardOutline,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.fontOnPrimary,
  },
  button: {
    backgroundColor: colors.primary400,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonLabel: { ...type.action, color: colors.primary800 },
  error: { ...type.body, color: colors.primary400 },
});
