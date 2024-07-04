export const parseQueryStringToNumber = (
  query: string | undefined,
): number | undefined => {
  if (!query) return undefined;
  return parseInt(query);
};

export const parseQueryStringToBoolean = (
  query: string | undefined,
): boolean | undefined => {
  if (!query) return undefined;
  return query.toLowerCase() === 'true';
};
