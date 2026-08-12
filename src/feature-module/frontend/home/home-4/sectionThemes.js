/**
 * Theme configuration system for DynamicSections.
 *
 * Lookup flow:
 * 1. Read serviceId.fixedType -> match default fixedType theme.
 * 2. Read serviceId.slug -> if custom slug override exists, merge it.
 * 3. Fallback to default medical theme if fixedType/slug unrecognized.
 */

export const DEFAULT_MEDICAL_THEME = {
  icon: "fas fa-stethoscope",
  iconColor: "#7c3aed",
  sectionBg: "linear-gradient(135deg, #e9e6f7 0%, #dcd4fa 100%)",
  headerBadgeBg: "rgba(255, 255, 255, 0.72)",
  headerBadgeText: "#6d3fd1",
  cardHeaderCircleBg: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
  priceBadgeBg: "#7c3aed",
  buttonBg: "#7c3aed",
  viewAllBg: "#ffffff",
  viewAllText: "#6d3fd1",
  animation: "none",
};

export const FIXED_TYPE_THEMES = {
  medicine: {
    icon: "fas fa-pills",
    iconColor: "#7c3aed",
    sectionBg: "linear-gradient(135deg, #e9e6f7 0%, #dcd4fa 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.72)",
    headerBadgeText: "#6d3fd1",
    cardHeaderCircleBg: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    priceBadgeBg: "#7c3aed",
    buttonBg: "#7c3aed",
    viewAllBg: "#ffffff",
    viewAllText: "#6d3fd1",
  },
  doctor: {
    icon: "fas fa-user-md",
    iconColor: "#4f46e5",
    sectionBg: "linear-gradient(135deg, #e5eff8 0%, #cfe5fa 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.78)",
    headerBadgeText: "#0004fd",
    cardHeaderCircleBg: "linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)",
    priceBadgeBg: "#4f46e5",
    buttonBg: "#4f46e5",
    viewAllBg: "#ffffff",
    viewAllText: "#334155",
  },
  labtests: {
    icon: "fas fa-microscope",
    iconColor: "#db2777",
    sectionBg: "linear-gradient(135deg, #f5e3e3 0%, #f8e1e3 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.8)",
    headerBadgeText: "#db2777",
    cardHeaderCircleBg: "linear-gradient(135deg, #ffe4e6 0%, #fff1f2 100%)",
    priceBadgeBg: "#db2777",
    buttonBg: "#db2777",
    viewAllBg: "#ffffff",
    viewAllText: "#be185d",
  },
  hospital: {
    icon: "fas fa-hospital",
    iconColor: "#059669",
    sectionBg: "linear-gradient(135deg, #e6f4ea 0%, #ccebe1 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.8)",
    headerBadgeText: "#047857",
    cardHeaderCircleBg: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
    priceBadgeBg: "#059669",
    buttonBg: "#059669",
    viewAllBg: "#ffffff",
    viewAllText: "#047857",
  },
};

export const SLUG_CUSTOM_THEMES = {
  "rx-medicines": {
    icon: "fas fa-prescription-bottle-alt",
  },
  diabetes: {
    icon: "fas fa-syringe",
    sectionBg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    headerBadgeText: "#0369a1",
    priceBadgeBg: "#0284c7",
    buttonBg: "#0284c7",
  },
  "heart-care": {
    icon: "fas fa-heartbeat",
    sectionBg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)",
    headerBadgeText: "#be123c",
    priceBadgeBg: "#e11d48",
    buttonBg: "#e11d48",
  },
  "skin-care": {
    icon: "fas fa-sparkles",
    sectionBg: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
    headerBadgeText: "#a21caf",
    priceBadgeBg: "#c026d3",
    buttonBg: "#c026d3",
  },
};

/**
 * Evaluates and builds the final section theme according to:
 * Backend API -> section -> serviceId.fixedType -> default theme -> serviceId.slug -> optional custom theme -> render section.
 */
export const getSectionTheme = (serviceId) => {
  const fixedTypeKey = (serviceId?.fixedType || "").toLowerCase();
  const slugKey = (serviceId?.slug || "").toLowerCase();

  const baseTheme = FIXED_TYPE_THEMES[fixedTypeKey] || DEFAULT_MEDICAL_THEME;
  const customTheme = SLUG_CUSTOM_THEMES[slugKey] || {};

  return {
    ...DEFAULT_MEDICAL_THEME,
    ...baseTheme,
    ...customTheme,
  };
};
