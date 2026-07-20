import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, PrimaryButton, SecondaryButton } from '../../components';
import { useAuth } from '../../lib/auth';
import { useMyProfile, useUpdateProfile } from '../../lib/friends';
import { colors, fonts, radii, spacing, type } from '../../lib/theme';

/** S10 — Minimal profile/settings (brief A1/A5): display name, avatar, invite code, sign out. */
export default function Profile() {
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const update = useUpdateProfile();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [copied, setCopied] = useState(false);

  // Seed the fields once the profile loads.
  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? '');
      setAvatar(profile.avatar ?? '');
    }
  }, [profile]);

  const dirty =
    profile != null &&
    (name.trim() !== (profile.display_name ?? '') || avatar.trim() !== (profile.avatar ?? ''));

  function onSave() {
    if (!dirty) return;
    update.mutate({ display_name: name.trim(), avatar: avatar.trim() || null });
  }

  async function onCopyCode() {
    if (!profile?.invite_code) return;
    await Clipboard.setStringAsync(profile.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]} edges={['left', 'right']}>
        <ActivityIndicator color={colors.primary400} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <Avatar name={name || '?'} uri={avatar.startsWith('http') ? avatar : null} size={80} />
        </View>

        <Text style={styles.label}>Display name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.font}
          selectionColor={colors.primary400}
          maxLength={40}
        />

        <Text style={styles.label}>Avatar (emoji or image URL)</Text>
        <TextInput
          style={styles.input}
          value={avatar}
          onChangeText={setAvatar}
          placeholder="😎 or https://…"
          placeholderTextColor={colors.font}
          selectionColor={colors.primary400}
          autoCapitalize="none"
        />

        <PrimaryButton
          label={update.isPending ? 'Saving…' : update.isSuccess && !dirty ? 'Saved ✓' : 'Save'}
          onPress={onSave}
          disabled={!dirty || update.isPending}
        />
        {update.isError ? <Text style={type.body}>Couldn&rsquo;t save — try again.</Text> : null}

        <View style={styles.codeCard}>
          <Text style={styles.label}>Your invite code</Text>
          <Text style={styles.code} selectable>
            {profile.invite_code}
          </Text>
          <SecondaryButton label={copied ? 'Copied!' : 'Copy code'} onPress={onCopyCode} />
        </View>

        <Pressable onPress={() => signOut()} accessibilityRole="button" style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.sm },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.md },
  label: { ...type.action, color: colors.font, marginTop: spacing.sm },
  input: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.fontOnPrimary,
    backgroundColor: colors.primary800,
    borderWidth: 1,
    borderColor: colors.font,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  codeCard: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardOutline,
    borderRadius: radii.sm,
    backgroundColor: colors.primary800,
  },
  code: { fontFamily: fonts.action, fontSize: 36, letterSpacing: 4, color: colors.primary400 },
  signOut: { alignItems: 'center', marginTop: spacing.xl, paddingVertical: spacing.md },
  signOutText: { fontFamily: fonts.action, fontSize: 18, color: colors.description },
});
