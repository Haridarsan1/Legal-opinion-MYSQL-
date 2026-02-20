import { format } from 'date-fns';

/**
 * Formats a date string or Date object into a consistent format (DD/MM/YYYY).
 * Using a fixed format prevents hydration mismatches caused by locale differences
 * between server and client.
 *
 * @param date - The date to format (string or Date object)
 * @param formatStr - Optional format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | number, formatStr: string = 'dd/MM/yyyy'): string {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    // Check for invalid date
    if (isNaN(dateObj.getTime())) return '';
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}
