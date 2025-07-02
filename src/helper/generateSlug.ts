// Utility function (optional: can move to a helper file)
export const generateSlug = (title: string): string => {
  return title.toLowerCase().trim().replace(/\s+/g, '_');
};
