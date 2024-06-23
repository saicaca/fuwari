export function formatDateToYYYYMMDD(date: Date): string {
  if (!date) return ''
  return date.toISOString().substring(0, 10)
}

export function genreatePermalinkParams(date: Date): {
  year: string
  month: string
  day: string
} {
  if (!date)
    return {
      year: '',
      month: '',
      day: '',
    }
  const year = date.getFullYear().toString()

  // 确保月份和日期始终有两位数字
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return {
    year,
    month,
    day,
  }
}

export function genreatePermalink(date: Date): string {
  if (!date) return ''
  const { year, month, day } = genreatePermalinkParams(date)
  return `/${year}/${month}/${day}`
}