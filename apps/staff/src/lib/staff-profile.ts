'use client';

import { useSyncExternalStore } from 'react';
import { staff } from './demo-data';

const PROFILE_KEY = 'echoflow_staff_profile';
const PROFILE_UPDATED_EVENT = 'echoflow:staff-profile-updated';
let cachedRaw: string | null | undefined;
let cachedProfile: StaffProfile;

export type StaffProfile = typeof staff & { photoDataUrl?: string | null };

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(PROFILE_UPDATED_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(PROFILE_UPDATED_EVENT, onChange);
  };
}

function getSnapshot(): StaffProfile {
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved === cachedRaw && cachedProfile) return cachedProfile;
  cachedRaw = saved;
  try {
    cachedProfile = saved ? { ...staff, ...JSON.parse(saved) } : staff;
  } catch {
    cachedProfile = staff;
  }
  return cachedProfile;
}

export function useStaffProfile() {
  return useSyncExternalStore<StaffProfile>(subscribe, getSnapshot, () => staff);
}

export function saveStaffProfile(profile: StaffProfile) {
  cachedRaw = JSON.stringify(profile);
  cachedProfile = profile;
  localStorage.setItem(PROFILE_KEY, cachedRaw);
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}
