/**
 * LocalStorage utility functions for form data persistence
 */

const PROFILE_CACHE_KEY = 'zhiyecompass_profile_cache';

export interface CachedProfileData {
  ageRange: string;
  province: string;
  city?: string;
  cityLevel: string;
  currentStatus: string;
  education: string;
  industryBackground: string[];
  skills: string[];
  availableTimePerWeek: number;
  startupBudget: string;
  /** 用户选择的其他资源类型 */
  resourceTypes?: string[];
  /** 其他资源详细描述 */
  resourceDescription?: string;
  /** 自定义输入字段 */
  customAgeRange?: string;
  customCityLevel?: string;
  customCurrentStatus?: string;
  customEducation?: string;
  customStartupBudget?: string;
  customIndustryBackground?: string;
  customSkills?: string;
  /** 整体补充说明 */
  overallDescription?: string;
  savedAt: string; // ISO timestamp
}

/**
 * Save profile form data to LocalStorage
 */
export function saveProfileToStorage(data: Omit<CachedProfileData, 'savedAt'>): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheData: CachedProfileData = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to save profile to LocalStorage:', error);
  }
}

/**
 * Load profile form data from LocalStorage
 */
export function loadProfileFromStorage(): CachedProfileData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedProfileData;

    // Validate required fields exist
    if (!data.ageRange && !data.province && !data.skills) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load profile from LocalStorage:', error);
    return null;
  }
}

/**
 * Clear profile form data from LocalStorage
 */
export function clearProfileFromStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear profile from LocalStorage:', error);
  }
}

/**
 * Check if profile data exists in LocalStorage
 */
export function hasStoredProfile(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem(PROFILE_CACHE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Get the saved timestamp of cached profile
 */
export function getProfileSavedTime(): Date | null {
  const data = loadProfileFromStorage();
  if (!data?.savedAt) return null;
  return new Date(data.savedAt);
}
