import { format, isValid, parseISO, isDate } from 'date-fns'

/**
 * Formats incoming date to a given format, defaults to ISO format
 * @param date - Date to be formatted as Date or ISO string
 * @param dateFormat (optional) - Format to be used for formatting, defaults to ISO format
 */
export const formatDate = (
  date: string | Date,
  dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSX"
): string | undefined => {
  // If value is a Date, then we can simply format it in ISO format
  if (isDate(date)) {
    return format(date as Date, dateFormat)
  }
  // If value is a string, then we need to check if it is valid ISO format
  if (typeof date === 'string') {
    const parsedDate = parseISO(date)
    if (!isValid(parsedDate)) {
      return undefined
    }
    return format(parsedDate, dateFormat)
  }
  return undefined
}
