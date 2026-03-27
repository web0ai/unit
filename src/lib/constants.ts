export const APP_NAME = "Unit";
export const APP_TAGLINE = "Your family, beautifully organized.";

export const CHECK_IN_CADENCE = ["weekly", "biweekly", "monthly"] as const;
export const CHECK_IN_DEPTH = ["short", "less-short", "not-short"] as const;

export const FAMILY_THEMES = ["fruits", "flowers", "plants", "stars"] as const;
export const VISUAL_THEMES = [
  "minimal-light",
  "minimal-dark",
  "funky",
  "sophisticated",
] as const;

export const PILLAR_NAMES = ["us", "connect", "life", "money", "vault"] as const;

export const PRIVACY_MODES = [
  "full-transparency",
  "shared-overview",
  "fully-private",
] as const;
