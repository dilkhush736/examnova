export const PLATFORM_MODES = {
  SIMPLE: "simple",
  PROFESSIONAL: "professional",
  DEVELOPER: "developer",
};

export const MODE_LABELS = {
  [PLATFORM_MODES.SIMPLE]: "Simple Mode",
  [PLATFORM_MODES.PROFESSIONAL]: "Professional Mode",
  [PLATFORM_MODES.DEVELOPER]: "Developer Mode",
};

export const DEVELOPER_UNLOCK_PRICE = 10;

export const MODE_CATALOG = [
  {
    id: PLATFORM_MODES.SIMPLE,
    label: MODE_LABELS[PLATFORM_MODES.SIMPLE],
    badge: "No login required",
    description:
      "Browse the public marketplace, buy uploaded PDFs, and securely download them without creating an account.",
    features: [
      "Public marketplace browsing",
      "Guest PDF purchase and secure download",
      "Best for first-time students",
    ],
  },
  {
    id: PLATFORM_MODES.PROFESSIONAL,
    label: MODE_LABELS[PLATFORM_MODES.PROFESSIONAL],
    badge: "Login required",
    description:
      "Use the AI workflow to upload source material, detect questions, generate answers, and manage your account library.",
    features: [
      "Upload study material",
      "Generate AI PDFs",
      "Download PDFs from your account workspace",
    ],
  },
  {
    id: PLATFORM_MODES.DEVELOPER,
    label: MODE_LABELS[PLATFORM_MODES.DEVELOPER],
    badge: `Rs. ${DEVELOPER_UNLOCK_PRICE} unlock`,
    description:
      "Everything in Professional Mode, plus public marketplace listing and selling tools for your generated PDFs.",
    features: [
      "Publish PDFs publicly",
      "Manage seller listings",
      "Use wallet and withdrawal tools",
    ],
  },
];

export function normalizeModeAccess(user) {
  const storedModeAccess = user?.modeAccess || {};
  const developerUnlocked =
    Boolean(storedModeAccess.developerUnlocked) ||
    Boolean(storedModeAccess.developerUnlockedAt) ||
    Boolean(storedModeAccess.developerUnlockPaymentId) ||
    (Array.isArray(storedModeAccess.availableModes) &&
      storedModeAccess.availableModes.includes(PLATFORM_MODES.DEVELOPER));

  if (!user) {
    return {
      currentMode: PLATFORM_MODES.SIMPLE,
      availableModes: [PLATFORM_MODES.SIMPLE],
      developerUnlocked: false,
      developerUnlockedAt: null,
      developerUnlockAmountInr: DEVELOPER_UNLOCK_PRICE,
      capabilities: {
        canUseAiWorkflow: false,
        canSellMarketplacePdfs: false,
      },
    };
  }

  const availableModes = developerUnlocked
    ? [PLATFORM_MODES.PROFESSIONAL, PLATFORM_MODES.DEVELOPER]
    : [PLATFORM_MODES.PROFESSIONAL];
  const currentMode =
    developerUnlocked && storedModeAccess.currentMode === PLATFORM_MODES.DEVELOPER
      ? PLATFORM_MODES.DEVELOPER
      : PLATFORM_MODES.PROFESSIONAL;

  return {
    currentMode,
    availableModes,
    developerUnlocked,
    developerUnlockedAt: storedModeAccess.developerUnlockedAt || null,
    developerUnlockAmountInr:
      Number(storedModeAccess.developerUnlockAmountInr) || DEVELOPER_UNLOCK_PRICE,
    capabilities: {
      canUseAiWorkflow: true,
      canSellMarketplacePdfs: currentMode === PLATFORM_MODES.DEVELOPER,
    },
  };
}

export function hasProfessionalAccess(modeAccess) {
  return [PLATFORM_MODES.PROFESSIONAL, PLATFORM_MODES.DEVELOPER].includes(
    modeAccess?.currentMode,
  );
}

export function hasDeveloperAccess(modeAccess) {
  return modeAccess?.currentMode === PLATFORM_MODES.DEVELOPER;
}
