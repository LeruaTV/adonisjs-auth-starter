import { DateTime } from 'luxon'

export type Interval =
  | 'today'
  | 'week'
  | 'month'
  | 'last_week'
  | 'last_180_days'
  | 'current_year'
  | 'last_year'
  | string // Allow custom date ranges in ISO format ("yyyy-MM-dd", "yyyy-MM-dd/yyy-MM-dd")

export class DateRangeUtil {
  private static getRelativeDate(
    interval: Interval,
    start: DateTime
  ): { start: DateTime; end: DateTime; days: number } {
    const now = start

    switch (interval) {
      case 'today':
      case 'day':
        return { start: now.endOf('day'), end: now.startOf('day'), days: 1 }
      case 'week':
        return { start: now.endOf('week'), end: now.startOf('week'), days: 7 }
      case 'last_week':
        return {
          start: now.minus({ weeks: 1 }).endOf('week'),
          end: now.minus({ weeks: 1 }).endOf('week'),
          days: 7,
        }
      case 'month':
        return {
          start: now.endOf('month'),
          end: now.startOf('month'),
          days: Number(now.endOf('month').toFormat('dd')),
        }
      case 'last_180_days':
        return { start: now.endOf('day'), end: now.minus({ days: 179 }), days: 180 }
      case 'last_year':
        return { start: now.endOf('day'), end: now.minus({ years: 1, days: 1 }), days: 365 }
      default:
        throw new Error(`Unsupported interval: ${interval}`)
    }
  }

  static getDateRange(
    start?: string | DateTime,
    interval?: Interval
  ): {
    start: DateTime
    end: DateTime
    days: number
  } {
    const startDate = start
      ? typeof start === 'string'
        ? DateTime.fromISO(start)
        : start
      : DateTime.now()

    return interval
      ? this.getRelativeDate(interval, startDate)
      : { start: startDate, end: startDate, days: 1 }
  }

  static getDateRangeForQuery(
    start?: string | DateTime,
    interval?: Interval
  ): {
    start: string
    end?: string
    days: number
  } {
    const { start: formattedStart, end, days } = this.getDateRange(start, interval)

    return {
      start: formattedStart.toFormat('yyyy-MM-dd'),
      end: end.toFormat('yyyy-MM-dd') || undefined,
      days,
    }
  }
}
