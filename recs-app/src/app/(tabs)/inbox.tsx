import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../components';
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
  type InboxItem,
} from '../../lib/notifications';
import { colors, fonts, spacing, type } from '../../lib/theme';

/** Placeholder-grade copy (D3 sets the final tone). */
function notifText(n: InboxItem): string {
  const who = n.actorName ?? 'Someone';
  const title = n.itemTitle ?? 'a book';
  switch (n.type) {
    case 'rec_received':
      return `${who} sent you ${title}`;
    case 'rec_started':
      return `${who} started ${title}`;
    case 'rec_finished':
      return `${who} finished ${title} 🎉`;
    case 'friend_added':
      return `${who} is now your friendo`;
    default:
      return 'Something happened';
  }
}

/** S8 — Notifications inbox (brief A7, U11). */
export default function Inbox() {
  const router = useRouter();
  const { data: items, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const hasUnread = (items ?? []).some((n) => !n.read);

  function onOpen(n: InboxItem) {
    if (!n.read) markRead.mutate(n.id);
    if (n.type === 'friend_added' && n.actorId) router.push(`/friend/${n.actorId}`);
    else if (n.itemId) router.push(`/item/${n.itemId}`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          hasUnread ? (
            <Pressable
              onPress={() => markAll.mutate()}
              accessibilityRole="button"
              style={styles.markAll}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpen(item)}
            accessibilityRole="button"
            style={[styles.row, !item.read && styles.rowUnread]}>
            <Avatar name={item.actorName ?? '?'} uri={item.actorAvatar} size={40} />
            <Text style={styles.text}>{notifText(item)}</Text>
            {!item.read ? <View style={styles.dot} /> : null}
          </Pressable>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary400} style={styles.center} />
          ) : isError ? (
            <Pressable onPress={() => refetch()} style={styles.center} accessibilityRole="button">
              <Text style={type.body}>Couldn&rsquo;t load your inbox. Tap to retry.</Text>
            </Pressable>
          ) : (
            <Text style={[type.body, styles.center]}>No pings yet. Send a book to get things going.</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm },
  markAll: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  markAllText: { fontFamily: fonts.action, fontSize: 14, color: colors.primary400 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardOutline,
  },
  rowUnread: { backgroundColor: colors.primary800 },
  text: { ...type.body, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary400 },
  center: { paddingVertical: spacing.xl, textAlign: 'center' },
});
