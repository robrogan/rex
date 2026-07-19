import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, type } from '../lib/theme';
import { RecBadge } from './RecBadge';
import type { Recommender } from './RecBadge';
import { TagChip } from './TagChip';

type Props = {
  title: string;
  author?: string;
  coverUri?: string | null;
  tags?: string[];
  recommenders?: Recommender[];
};

// Asymmetric "book spine" corners from the Figma card: 8 everywhere, 2 on bottom-left.
const cornerRadii = {
  borderTopLeftRadius: radii.sm,
  borderTopRightRadius: radii.sm,
  borderBottomRightRadius: radii.sm,
  borderBottomLeftRadius: radii.xs,
} as const;

/** BookCard — cover + recommender badge + serif title + genre tags (Figma Home/Detail card). */
export function BookCard({ title, author, coverUri, tags = [], recommenders = [] }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.cover, cornerRadii]}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.coverImg} contentFit="cover" />
        ) : (
          <Text style={styles.coverEmoji}>📚</Text>
        )}
      </View>
      <View style={styles.body}>
        {recommenders.length > 0 ? (
          <View style={styles.badgeRow}>
            <RecBadge recommenders={recommenders} />
          </View>
        ) : null}
        <View style={styles.textBlock}>
          <Text style={type.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          {author ? (
            <Text style={type.author} numberOfLines={1}>
              {author}
            </Text>
          ) : null}
          {tags.length > 0 ? (
            <View style={styles.tags}>
              {tags.map((t) => (
                <TagChip key={t} label={t} />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardOutline,
    backgroundColor: colors.bg,
    ...cornerRadii,
    // Approximates the Figma M3 card elevation.
    shadowColor: colors.primary800,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  cover: {
    width: 141,
    height: 214,
    backgroundColor: colors.coverPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImg: { width: '100%', height: '100%' },
  coverEmoji: { fontSize: 40, opacity: 0.85 },
  body: { flex: 1, justifyContent: 'space-between', minWidth: 0 },
  badgeRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  textBlock: { gap: 7 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
