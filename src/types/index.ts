import type {
  CHECK_IN_CADENCE,
  CHECK_IN_DEPTH,
  FAMILY_THEMES,
  VISUAL_THEMES,
  PRIVACY_MODES,
} from "@/lib/constants";

export type CheckInCadence = (typeof CHECK_IN_CADENCE)[number];
export type CheckInDepth = (typeof CHECK_IN_DEPTH)[number];
export type FamilyTheme = (typeof FAMILY_THEMES)[number];
export type VisualTheme = (typeof VISUAL_THEMES)[number];
export type PrivacyMode = (typeof PRIVACY_MODES)[number];
