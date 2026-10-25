// Week helpers for the "This week" view, in the team's local time: Nigeria
// (WAT), UTC+1 all year round. They line up with the backend, which starts
// each day and week at midnight Lagos time (TEAM_UTC_OFFSET_HOURS).
//
// How: teamNow() is "now" shifted forward by the offset, so its UTC fields
// (getUTCDate, getUTCDay...) read as Lagos wall-clock time. Every helper
// below works on that shifted clock with UTC methods.

const DAY_MS = 24 * 60 * 60 * 1000;
const TEAM_UTC_OFFSET_MS = 1 * 60 * 60 * 1000;

export function teamNow(): Date {
  return new Date(Date.now() + TEAM_UTC_OFFSET_MS);
}

// A UTC timestamp (e.g. when a PR was opened) on the team's clock, for display.
export function toTeamClock(utc: Date): Date {
  return new Date(utc.getTime() + TEAM_UTC_OFFSET_MS);
}

// "Mon", for the "Today (Mon)" button.
export function todayWeekdayShort(): string {
  return teamNow().toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

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

export function startOfWeekUtc(now: Date = teamNow()): Date {
  const today = startOfTodayUtc(now);
  const daysSinceMonday = (today.getUTCDay() + 6) % 7; // getUTCDay: Sun=0, Mon=1
  return new Date(today.getTime() - daysSinceMonday * DAY_MS);
}

export function daysOfThisWeek(now: Date = teamNow()): WeekDay[] {
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
export function isoWeekNumber(now: Date = teamNow()): number {
  const date = startOfTodayUtc(now);
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
}

// "Mon 19 Oct – Sun 25 Oct 2026"
export function weekRangeLabel(now: Date = teamNow()): string {
  const monday = startOfWeekUtc(now);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  const short = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' } as const;
  const first = monday.toLocaleDateString('en-GB', short);
  const last = sunday.toLocaleDateString('en-GB', short);
  return `${first} – ${last} ${sunday.getUTCFullYear()}`;
}

// Only accept a ?day= that's a real day in this week, up to today.
export function isSelectableDay(value: string | undefined, now: Date = teamNow()): value is string {
  if (!value) return false;
  return daysOfThisWeek(now).some((d) => d.iso === value && !d.isFuture);
}
