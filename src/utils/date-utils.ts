export function formatDateToYYYYMMDD(date: Date): string {
  if (!date) return '';
  return date.toISOString().substring(0, 10)
}
