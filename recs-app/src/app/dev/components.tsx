import { PropsWithChildren, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Avatar,
  BookCard,
  PrimaryButton,
  RecBadge,
  SearchBar,
  SecondaryButton,
  TabPill,
  TagChip,
} from '../../components';
import { colors, spacing, type } from '../../lib/theme';

const RECS = [{ name: 'Leul' }, { name: 'Nick' }, { name: 'Sarah' }, { name: 'Jon' }];

function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

/** Hidden A2 acceptance gallery — every design-system component in all states. Not linked from the UI. */
export default function ComponentGallery() {
  const [query, setQuery] = useState('');
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Component gallery</Text>
        <Text style={styles.caption}>A2 design system · matches Figma “MVP Drafts”</Text>

        <Section title="TabPill">
          <View style={styles.row}>
            <TabPill label="Books" active />
            <TabPill label="Shows" />
            <TabPill label="Movies" disabled />
          </View>
        </Section>

        <Section title="Buttons">
          <PrimaryButton label="Send this book" />
          <PrimaryButton label="Send this book" disabled />
          <SecondaryButton label="Copy link" />
          <SecondaryButton label="Copy link" disabled />
        </Section>

        <Section title="Avatar">
          <View style={styles.row}>
            <Avatar name="Leul Tesfaye" />
            <Avatar name="Nick" size={32} />
            <Avatar name="Sarah" size={56} />
            <Avatar name="Rob" uri="https://picsum.photos/seed/rob/96" size={56} />
          </View>
        </Section>

        <Section title="SearchBar">
          <SearchBar value={query} onChangeText={setQuery} />
        </Section>

        <Section title="TagChip">
          <View style={styles.row}>
            <TagChip label="Epic Fantasy" />
            <TagChip label="Magic" />
            <TagChip label="Adventure" />
          </View>
        </Section>

        <Section title="RecBadge">
          <RecBadge recommenders={RECS.slice(0, 1)} />
          <RecBadge recommenders={RECS.slice(0, 2)} />
          <RecBadge recommenders={RECS} />
        </Section>

        <Section title="BookCard">
          <BookCard
            title="Oathbringer"
            author="Brandon Sanderson"
            tags={['Epic Fantasy', 'Magic', 'Adventure']}
            recommenders={RECS}
          />
          <BookCard title="The Way of Kings" author="Brandon Sanderson" />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl * 2 },
  h1: { ...type.heading },
  caption: { ...type.description, marginTop: -spacing.sm },
  section: { gap: spacing.md },
  sectionTitle: { ...type.action, color: colors.description },
  sectionBody: { gap: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
});
