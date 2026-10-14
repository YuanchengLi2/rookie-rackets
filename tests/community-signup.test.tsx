import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { SignupForm } from '../components/site-interactions';
import { SiteHeader } from '../components/site-shell';
import { InterestSubmissionSchema, signupTypes, toInterestRpcPayload } from '../lib/data/interest-contract';
import { partitionEventPrograms } from '../lib/data/event-categories';
import type { PublicProgramBundle } from '../lib/data/public-programs';

it('changes grade eligibility by signup type without carrying over the previous grade', async () => {
  const user = userEvent.setup();
  render(<SignupForm />);
  await user.selectOptions(screen.getByLabelText('Sign up as'), 'workshop');
  await user.selectOptions(screen.getByLabelText('Grade'), 'Pre-K');
  await user.selectOptions(screen.getByLabelText('Sign up as'), 'junior-volunteer');
  const grade = screen.getByLabelText('Grade');
  expect(grade).toHaveValue('');
  expect(within(grade).queryByRole('option', { name: 'Pre-K' })).not.toBeInTheDocument();
  expect(within(grade).getAllByRole('option')).toHaveLength(8);
  await user.selectOptions(screen.getByLabelText('Sign up as'), 'adult-volunteer');
  expect(screen.queryByLabelText('Grade')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Age')).toHaveAttribute('min', '18');
  await user.selectOptions(screen.getByLabelText('Sign up as'), 'coach');
  expect(screen.queryByLabelText('Grade')).not.toBeInTheDocument();
});

it('enforces junior eligibility on the server contract and preserves every signup type in storage', () => {
  const base = { fullName: 'Sam Lee', phone: '919-555-0110', email: 'sam@example.com', age: 20, grade: '7th Grade' };
  for (const signupType of Object.keys(signupTypes) as (keyof typeof signupTypes)[]) {
    const submission = InterestSubmissionSchema.parse({ ...base, signupType });
    expect(toInterestRpcPayload(submission).workshop).toBe(signupTypes[signupType]);
  }
  expect(InterestSubmissionSchema.safeParse({ ...base, signupType: 'junior-volunteer', grade: 'Pre-K' }).success).toBe(false);
  expect(InterestSubmissionSchema.safeParse({ ...base, signupType: 'adult-volunteer', age: 15 }).success).toBe(false);
  expect(InterestSubmissionSchema.safeParse({ ...base, signupType: 'workshop', age: 5, grade: 'Pre-K' }).success).toBe(true);
});

it('opens the Events dropdown and dismisses it with Escape or an outside click', async () => {
  const user = userEvent.setup();
  render(<SiteHeader active="/events" />);
  const trigger = screen.getByRole('button', { name: 'Events' });
  expect(screen.queryByRole('link', { name: 'Current Events' })).not.toBeInTheDocument();
  await user.click(trigger);
  expect(screen.getByRole('link', { name: 'Current Events' })).toHaveAttribute('href', '/events#current-events');
  expect(screen.getByRole('link', { name: 'Upcoming Events' })).toHaveAttribute('href', '/events#upcoming-events');
  expect(screen.getByRole('link', { name: 'Past Events' })).toHaveAttribute('href', '/completed-events');
  await user.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  await user.click(document.body);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

it('groups multi-session events by Triangle calendar date, excluding ended and canceled programs', () => {
  const bundle = (id: string, dates: string[], status = 'registration-open') => ({ program: { id, status }, sessions: dates.map(date => ({ date, status: 'scheduled' })) }) as PublicProgramBundle;
  const result = partitionEventPrograms([
    bundle('current', ['2026-10-01', '2026-10-10']),
    bundle('upcoming', ['2026-10-05']),
    bundle('past', ['2026-10-02']),
    bundle('canceled', ['2026-10-10'], 'canceled'),
  ], new Date('2026-10-05T01:00:00Z'));
  expect(result.current.map(item => item.program.id)).toEqual(['current']);
  expect(result.upcoming.map(item => item.program.id)).toEqual(['upcoming']);
});
