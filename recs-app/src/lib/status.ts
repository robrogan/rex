/**
 * Shared display constants for reading statuses + reactions (briefs A5/A6).
 * Copy here is placeholder-grade — the final tone/wording is a Rob decision (D3).
 */
import type { Reaction, RecStatusValue } from '../types/database';

export const STATUS_LABEL: Record<RecStatusValue, string> = {
  to_read: 'To read',
  started: 'Started',
  finished: 'Finished',
  not_for_me: 'Not for me',
};

/** Order the status sheet presents (U10). */
export const STATUS_FLOW: RecStatusValue[] = ['to_read', 'started', 'finished', 'not_for_me'];

export const REACTION_LABEL: Record<Reaction, string> = {
  loved: 'Loved it',
  liked: 'Liked it',
  not_for_me: 'Not for me',
};

export const REACTION_GLYPH: Record<Reaction, string> = {
  loved: '❤️',
  liked: '👍',
  not_for_me: '🙅',
};

/** Reactions offered when a book is marked finished (U12). */
export const REACTIONS: Reaction[] = ['loved', 'liked', 'not_for_me'];
