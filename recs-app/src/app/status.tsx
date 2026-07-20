import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../components';
import {
  REACTIONS,
  REACTION_GLYPH,
  REACTION_LABEL,
  STATUS_FLOW,
  STATUS_LABEL,
} from '../lib/status';
import { useSetStatus } from '../lib/tbr';
import { colors, fonts, radii, spacing, type } from '../lib/theme';
import type { Reaction, RecStatusValue } from '../types/database';

function firstParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

/** S9 — Status + reaction sheet (brief A6, U10/U12). Reached from a TBR card. */
export default function Status() {
  const router = useRouter();
  const params = useLocalSearchParams<{ recs?: string; status?: string; title?: string }>();
  const recommendationIds = firstParam(params.recs).split(',').filter(Boolean);
  const title = firstParam(params.title) || 'This book';
  const initial = (firstParam(params.status) as RecStatusValue) || 'to_read';

  const [status, setStatus] = useState<RecStatusValue>(initial);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [note, setNote] = useState('');
  const setStatusMutation = useSetStatus();

  const showReaction = status === 'finished';
  const showNote = status === 'finished' || status === 'not_for_me';
  const canSave = recommendationIds.length > 0 && !setStatusMutation.isPending;

  function onSave() {
    if (recommendationIds.length === 0) return;
    setStatusMutation.mutate(
      {
        recommendationIds,
        status,
        // A `not_for_me` status implies the matching reaction.
        reaction: status === 'not_for_me' ? 'not_for_me' : reaction,
        reactionNote: showNote && note.trim() ? note.trim() : null,
      },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.content}>
      <Text style={type.cardTitle}>{title}</Text>

      {recommendationIds.length === 0 ? (
        <Text style={type.body}>Open a book from your TBR to update its status.</Text>
      ) : (
        <>
          <Text style={styles.label}>Where are you with it?</Text>
          <View style={styles.options}>
            {STATUS_FLOW.map((s) => (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                accessibilityRole="button"
                accessibilityState={{ selected: status === s }}
                style={[styles.option, status === s && styles.optionActive]}>
                <Text style={[styles.optionText, status === s && styles.optionTextActive]}>
                  {STATUS_LABEL[s]}
                </Text>
              </Pressable>
            ))}
          </View>

          {showReaction ? (
            <>
              <Text style={styles.label}>How was it?</Text>
              <View style={styles.options}>
                {REACTIONS.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setReaction(reaction === r ? null : r)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: reaction === r }}
                    style={[styles.option, reaction === r && styles.optionActive]}>
                    <Text style={[styles.optionText, reaction === r && styles.optionTextActive]}>
                      {REACTION_GLYPH[r]} {REACTION_LABEL[r]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {showNote ? (
            <TextInput
              style={styles.note}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note (optional)"
              placeholderTextColor={colors.font}
              selectionColor={colors.primary400}
              maxLength={140}
              multiline
            />
          ) : null}

          <PrimaryButton
            label={setStatusMutation.isPending ? 'Saving…' : 'Save'}
            onPress={onSave}
            disabled={!canSave}
          />
          {setStatusMutation.isError ? (
            <Text style={type.body}>Couldn&rsquo;t save — try again.</Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  label: { ...type.action, color: colors.font, marginTop: spacing.sm },
  options: { gap: spacing.sm },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.font,
  },
  optionActive: { backgroundColor: colors.primary400, borderColor: colors.primary400 },
  optionText: { fontFamily: fonts.action, fontSize: 18, color: colors.font },
  optionTextActive: { color: colors.primary800 },
  note: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.fontOnPrimary,
    backgroundColor: colors.primary800,
    borderWidth: 1,
    borderColor: colors.font,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
