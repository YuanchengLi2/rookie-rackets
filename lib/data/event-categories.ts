import type { PublicProgramBundle } from './public-programs';

// Use local calendar dates so an event does not move categories at UTC midnight.
export function partitionEventPrograms(programs: PublicProgramBundle[], now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const current: PublicProgramBundle[] = [];
  const upcoming: PublicProgramBundle[] = [];
  for (const bundle of programs) {
    if (['completed', 'canceled', 'archived', 'draft'].includes(bundle.program.status)) continue;
    const dates = bundle.sessions.filter((session) => session.status !== 'canceled').map((session) => session.date).sort();
    if (dates.length) {
      if (dates[dates.length - 1] < today) continue;
      (dates[0] <= today ? current : upcoming).push(bundle);
    } else {
      (bundle.program.status === 'active' ? current : upcoming).push(bundle);
    }
  }
  return { current, upcoming };
}
