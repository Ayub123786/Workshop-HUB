const STORAGE_KEY = 'workshophub_recently_viewed';
const MAX_ITEMS = 6;

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function recordRecentlyViewed(workshop) {
  if (!workshop || !workshop.slug) return;
  try {
    const existing = getRecentlyViewed();
    const cleanItem = {
      id: workshop._id || workshop.id,
      slug: workshop.slug,
      title: workshop.title,
      category: workshop.category,
      bannerImage: workshop.bannerImage,
      startDate: workshop.startDate,
      statusLabel: workshop.statusLabel || workshop.status,
      viewedAt: new Date().toISOString(),
    };

    const filtered = existing.filter((item) => item.slug !== workshop.slug);
    const updated = [cleanItem, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recently_viewed_updated', { detail: { items: updated } }));
  } catch (e) {
    // ignore localStorage quota errors
  }
}
