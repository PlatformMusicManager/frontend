import { ApiTrack } from '../services/platform.service';

function trigrams(str: string): Set<string> {
  const result = new Set<string>();
  for (let i = 0; i <= str.length - 3; i++) {
    result.add(str.slice(i, i + 3));
  }
  return result;
}

function matchesTrigrams(haystack: string, queryTrigrams: Set<string>): boolean {
  const ht = trigrams(haystack);
  for (const tg of queryTrigrams) {
    if (ht.has(tg)) return true;
  }
  return false;
}

export default function searchTracks(tracks: ApiTrack[], query: string): ApiTrack[] {
  const q = query.trim().toLowerCase();
  if (!q) return tracks;

  if (q.length < 3) {
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artists.some((a) => a.username.toLowerCase().includes(q)),
    );
  }

  const qt = trigrams(q);
  return tracks.filter(
    (t) =>
      matchesTrigrams(t.title.toLowerCase(), qt) ||
      t.artists.some((a) => matchesTrigrams(a.username.toLowerCase(), qt)),
  );
}
