import { useState, useEffect } from 'react';

const STORAGE_KEY = 'workshophub_bookmarked_slugs';

export function getBookmarkedSlugs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isWorkshopBookmarked(slug) {
  if (!slug) return false;
  const list = getBookmarkedSlugs();
  return list.includes(slug);
}

export function toggleWorkshopBookmark(slug) {
  if (!slug) return false;
  try {
    const list = getBookmarkedSlugs();
    let updated;
    const exists = list.includes(slug);
    if (exists) {
      updated = list.filter((s) => s !== slug);
    } else {
      updated = [...list, slug];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bookmarks_updated', { detail: { slugs: updated } }));
    return !exists;
  } catch (e) {
    return false;
  }
}

export function useBookmarks() {
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState(getBookmarkedSlugs());

  useEffect(() => {
    const handleUpdate = (e) => {
      setBookmarkedSlugs(e.detail?.slugs || getBookmarkedSlugs());
    };
    window.addEventListener('bookmarks_updated', handleUpdate);
    window.addEventListener('storage', () => setBookmarkedSlugs(getBookmarkedSlugs()));
    return () => {
      window.removeEventListener('bookmarks_updated', handleUpdate);
    };
  }, []);

  const toggle = (slug) => toggleWorkshopBookmark(slug);
  const isBookmarked = (slug) => bookmarkedSlugs.includes(slug);

  return { bookmarkedSlugs, isBookmarked, toggle, count: bookmarkedSlugs.length };
}
