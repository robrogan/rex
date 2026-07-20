import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../components';
import {
  useFriends,
  useRecsBetween,
  type RecBetween,
} from '../../lib/friends';
import { REACTION_GLYPH, STATUS_LABEL } from '../../lib/status';
import { colors, fonts, radii, spacing, type } from '../../lib/theme';

/** S11 — Friend profile with the "recs between us" affordance (brief A5, U14). */
export default function FriendProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: friends } = useFriends();
  const friend = friends?.find((f) => f.id === id);
  const name = friend?.display_name ?? 'Friend';

  const { data, isLoading, isError } = useRecsBetween(id);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={name} uri={friend?.avatar} size={72} />
          <Text style={styles.name}>{name}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary400} />
        ) : isError ? (
          <Text style={styles.error}>Couldn&apos;t load your recs together.</Text>
        ) : (
          <>
            <RecGroup
              heading={`You sent ${name}`}
              recs={data?.sent ?? []}
              emptyText={`You haven't recommended anything to ${name} yet.`}
            />
            <RecGroup
              heading={`${name} sent you`}
              recs={data?.received ?? []}
              emptyText={`${name} hasn't recommended anything to you yet.`}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecGroup({
  heading,
  recs,
  emptyText,
}: {
  heading: string;
  recs: RecBetween[];
  emptyText: string;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeading}>{heading}</Text>
      {recs.length === 0 ? (
        <Text style={styles.hint}>{emptyText}</Text>
      ) : (
        recs.map((rec) => <RecRow key={rec.id} rec={rec} />)
      )}
    </View>
  );
}

function RecRow({ rec }: { rec: RecBetween }) {
  const status = rec.status ?? 'to_read';
  const reactionGlyph = rec.reaction ? REACTION_GLYPH[rec.reaction] : undefined;
  return (
    <View style={styles.row}>
      <View style={styles.thumb}>
        {rec.coverUrl ? (
          <Image source={{ uri: rec.coverUrl }} style={styles.thumbImg} contentFit="cover" />
        ) : (
          <Text style={styles.thumbEmoji}>📚</Text>
        )}
      </View>
      <View style={styles.rowBody}>
        <Text style={type.cardTitle} numberOfLines={2}>
          {rec.title}
        </Text>
        {rec.author ? (
          <Text style={type.author} numberOfLines={1}>
            {rec.author}
          </Text>
        ) : null}
        {rec.note ? (
          <Text style={styles.note} numberOfLines={2}>
            &ldquo;{rec.note}&rdquo;
          </Text>
        ) : null}
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {reactionGlyph ? `${reactionGlyph} ` : ''}
            {STATUS_LABEL[status]}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl * 2 },
  header: { alignItems: 'center', gap: spacing.sm },
  name: { ...type.heading },
  group: { gap: spacing.md },
  groupHeading: { ...type.action, color: colors.font },
  hint: { ...type.description },
  error: { ...type.body, color: colors.description },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardOutline,
    borderRadius: radii.sm,
    backgroundColor: colors.bg,
  },
  thumb: {
    width: 64,
    height: 96,
    borderRadius: radii.xs,
    backgroundColor: colors.coverPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbEmoji: { fontSize: 28, opacity: 0.85 },
  rowBody: { flex: 1, gap: 4, minWidth: 0, justifyContent: 'center' },
  note: { ...type.meta, fontStyle: 'italic' },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary400,
  },
  statusText: { fontFamily: fonts.action, fontSize: 14, color: colors.primary400 },
});
