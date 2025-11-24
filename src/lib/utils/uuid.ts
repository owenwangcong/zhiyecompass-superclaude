/**
 * UUID generation and management utilities
 */

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getUserUUID(): string {
  if (typeof window === 'undefined') return '';

  const storedUUID = sessionStorage.getItem('zhiyecompass_uuid');
  if (storedUUID) return storedUUID;

  const newUUID = generateUUID();
  sessionStorage.setItem('zhiyecompass_uuid', newUUID);

  // Also set in cookie for persistence
  document.cookie = `zhiyecompass_uuid=${newUUID}; max-age=${7 * 24 * 60 * 60}; path=/`;

  return newUUID;
}

export function getRecommendationIds(): string[] {
  if (typeof window === 'undefined') return [];

  const stored = sessionStorage.getItem('zhiyecompass_rec_ids');
  return stored ? JSON.parse(stored) : [];
}

export function addRecommendationId(id: string): void {
  if (typeof window === 'undefined') return;

  const ids = getRecommendationIds();
  if (!ids.includes(id)) {
    ids.push(id);
    sessionStorage.setItem('zhiyecompass_rec_ids', JSON.stringify(ids));
  }
}
