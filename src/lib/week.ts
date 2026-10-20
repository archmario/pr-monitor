// Week helpers for the "This week" view. Everything is in UTC so the days
// line up exactly with the backend, which starts the week at midnight UTC
// on Monday.

const DAY_MS = 24 * 60 * 60 * 1000;

export interface WeekDay {
  iso: string; // "2026-10-19", the value sent to the API as ?day=
  weekday: string; // "Mon"
  dayOfMonth: number; // 19
  isToday: boolean;
  isFuture: boolean;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfTodayUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function startOfWeekUtc(now: Date = new Date()): Date {
  const today = startOfTodayUtc(now);
  const daysSinceMonday = (today.getUTCDay() + 6) % 7; // getUTCDay: Sun=0, Mon=1
  return new Date(today.getTime() - daysSinceMonday * DAY_MS);
}

export function daysOfThisWeek(now: Date = new Date()): WeekDay[] {
  const monday = startOfWeekUtc(now);
  const todayIso = toIso(startOfTodayUtc(now));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday.getTime() + i * DAY_MS);
    const iso = toIso(date);
    return {
      iso,
      weekday: date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }),
      dayOfMonth: date.getUTCDate(),
      isToday: iso === todayIso,
      isFuture: iso > todayIso,
    };
  });
}

// ISO 8601 week number: weeks start on Monday, and week 1 is the week that
// contains the year's first Thursday.
export function isoWeekNumber(now: Date = new Date()): number {
  const date = startOfTodayUtc(now);
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
}

// "Mon 19 Oct – Sun 25 Oct 2026"
export function weekRangeLabel(now: Date = new Date()): string {
  const monday = startOfWeekUtc(now);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  const short = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' } as const;
  const first = monday.toLocaleDateString('en-GB', short);
  const last = sunday.toLocaleDateString('en-GB', short);
  return `${first} – ${last} ${sunday.getUTCFullYear()}`;
}

// Only accept a ?day= that's a real day in this week, up to today.
export function isSelectableDay(value: string | undefined, now: Date = new Date()): value is string {
  if (!value) return false;
  return daysOfThisWeek(now).some((d) => d.iso === value && !d.isFuture);
}
