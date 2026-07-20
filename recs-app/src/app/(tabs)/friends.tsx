import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, PrimaryButton, SecondaryButton } from '../../components';
import { useFriends, useMyProfile, useRedeemInviteCode } from '../../lib/friends';
import { colors, fonts, radii, spacing, type } from '../../lib/theme';

/** S7 — Friends list + invite code (brief A5, U3/U4). */
export default function Friends() {
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <InviteCodeCard />
        <ConnectByCode />
        <FriendsList />
      </ScrollView>
    </SafeAreaView>
  );
}

/** My invite code — share it or copy it so a friend can connect (U3). */
function InviteCodeCard() {
  const { data: profile, isLoading, isError } = useMyProfile();
  const [copied, setCopied] = useState(false);

  const code = profile?.invite_code ?? '';

  async function onShare() {
    if (!code) return;
    await Share.share({ message: `Add me on Recs — my invite code is ${code}` });
  }

  async function onCopy() {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Your invite code</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primary400} />
      ) : isError ? (
        <Text style={styles.error}>Couldn&apos;t load your code — pull to retry.</Text>
      ) : (
        <>
          <Text style={styles.code} selectable>
            {code}
          </Text>
          <Text style={styles.hint}>Share this with a friend so they can add you.</Text>
          <View style={styles.actionRow}>
            <PrimaryButton label="Share" onPress={onShare} style={styles.flex} />
            <SecondaryButton
              label={copied ? 'Copied!' : 'Copy'}
              onPress={onCopy}
              style={styles.flex}
            />
          </View>
        </>
      )}
    </View>
  );
}

/** Enter a friend's code to connect (U3). Calls the redeem_invite_code RPC. */
function ConnectByCode() {
  const [code, setCode] = useState('');
  const redeem = useRedeemInviteCode();

  function onConnect() {
    const trimmed = code.trim();
    if (!trimmed) return;
    redeem.mutate(trimmed, { onSuccess: () => setCode('') });
  }

  return (
    <View style={styles.section}>
      <Text style={styles.cardLabel}>Add a friend</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        placeholder="Enter their code"
        placeholderTextColor={colors.font}
        selectionColor={colors.primary400}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        returnKeyType="done"
        onSubmitEditing={onConnect}
      />
      <PrimaryButton
        label={redeem.isPending ? 'Connecting…' : 'Connect'}
        onPress={onConnect}
        disabled={redeem.isPending || code.trim().length === 0}
      />
      {redeem.isSuccess ? (
        <Text style={styles.success}>
          You&apos;re connected with {redeem.data.display_name ?? 'your friend'}!
        </Text>
      ) : null}
      {redeem.isError ? (
        <Text style={styles.error}>{friendlyError(redeem.error)}</Text>
      ) : null}
    </View>
  );
}

/** My connected friends (U4). Each row deep-links to the friend profile (S11). */
function FriendsList() {
  const { data: friends, isLoading, isError } = useFriends();

  return (
    <View style={styles.section}>
      <Text style={styles.cardLabel}>Your friendos</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primary400} />
      ) : isError ? (
        <Text style={styles.error}>Couldn&apos;t load your friends.</Text>
      ) : friends && friends.length > 0 ? (
        friends.map((f) => (
          <Link key={f.id} href={`/friend/${f.id}`} asChild>
            <Pressable style={({ pressed }) => [styles.friendRow, pressed && styles.pressed]}>
              <Avatar name={f.display_name ?? '?'} uri={f.avatar} size={44} />
              <Text style={styles.friendName}>{f.display_name ?? 'Friend'}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
        ))
      ) : (
        <Text style={styles.hint}>No friendos yet — share your code above.</Text>
      )}
    </View>
  );
}

/** Surface the RPC's raised exceptions as human text. */
function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid invite code/i.test(message)) return "That code doesn't match anyone.";
  if (/cannot add yourself/i.test(message)) return "That's your own code!";
  if (/not authenticated/i.test(message)) return 'Please sign in again.';
  return 'Something went wrong — try again.';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl * 2 },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardOutline,
    borderRadius: radii.sm,
    backgroundColor: colors.primary800,
  },
  section: { gap: spacing.md },
  cardLabel: { ...type.action, color: colors.font },
  code: {
    fontFamily: fonts.action,
    fontSize: 44,
    letterSpacing: 4,
    color: colors.primary400,
  },
  hint: { ...type.description },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  flex: { flex: 1 },
  input: {
    fontFamily: fonts.action,
    fontSize: 22,
    letterSpacing: 3,
    color: colors.fontOnPrimary,
    backgroundColor: colors.primary800,
    borderWidth: 1,
    borderColor: colors.font,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  success: { ...type.body, color: colors.primary400 },
  error: { ...type.body, color: colors.description },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardOutline,
  },
  pressed: { opacity: 0.6 },
  friendName: { ...type.body, flex: 1 },
  chevron: { ...type.heading, color: colors.font },
});
