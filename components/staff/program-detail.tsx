'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import {
  formatDemoDate,
  getProgram,
  getProgramCapacity,
  getProgramSessions,
  getRegistrationAttendance,
} from '../../lib/demo/selectors';
import type { AttendanceStatus, CoachSlot, CurriculumActivityKind, DemoState, SessionCurriculum, SessionRecord } from '../../lib/demo/types';
import { useDemo } from '../demo/demo-provider';
import { EmptyState, StatusBadge } from '../demo/demo-ui';

const tabs = [
  'Overview',
  'Sessions',
  'Roster',
  'Coaches',
  'Curriculum',
  'Logistics',
  'Communications',
  'Finance',
] as const;

const attendanceStatuses: AttendanceStatus[] = [
  'not-marked',
  'present',
  'late',
  'absent',
  'parent-reported-absence',
  'canceled',
  'walk-in',
];

export function ProgramDetail({ programId, initialTab }: { programId: string; initialTab?: string }) {
  const { state, updateProgram, updateSessionStatus, updateSessionCurriculum, assignCoach, setAttendance, logActivity } = useDemo();
  const program = getProgram(state, programId);
  const startingTab = tabs.includes(initialTab as (typeof tabs)[number]) ? (initialTab as (typeof tabs)[number]) : 'Overview';
  const [tab, setTab] = useState<(typeof tabs)[number]>(startingTab);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    court: false,
    rackets: true,
    signIn: false,
    reminder: false,
  });

  if (!program) {
    return (
      <EmptyState
        title="Program not found"
        description="This record may have been reset or removed."
        action={
          <Link className="staff-button" href="/staff/programs">
            Back to programs
          </Link>
        }
      />
    );
  }

  const sessions = getProgramSessions(state, program.id);
  const registrations = state.registrations.filter((registration) => registration.programId === program.id);
  const capacity = getProgramCapacity(state, program.id);
  const lead = state.coaches.find((coach) => coach.id === program.leadCoachId);

  const logMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    logActivity(`Simulated program message recorded for ${program.name}: ${trimmed}`, 'program');
    setSent(true);
    setMessage('');
  };

  return (
    <div className="staff-page">
      <Link className="staff-back-link" href="/staff/programs">
        <ArrowLeft size={15} /> Programs
      </Link>
      <div className="staff-detail-hero">
        <div>
          <div className="staff-inline-kicker">
            <span className="program-dot" /> {program.visibility} program
          </div>
          <h1>{program.name}</h1>
          <p>{program.description}</p>
        </div>
        <div className="staff-hero-actions">
          <StatusBadge status={program.status} />
          {program.visibility === 'public' && <Link className="staff-button staff-button-outline" href={`/events/${program.slug}`}>View public page</Link>}
          <button
            className="staff-button staff-button-outline"
            type="button"
            onClick={() => updateProgram(program.id, { status: program.status === 'active' ? 'planning' : 'active' })}
          >
            {program.status === 'active' ? 'Move to planning' : 'Mark active'}
          </button>
        </div>
      </div>
      <div className="staff-detail-meta">
        <span>
          <b>Lead</b>
          {lead?.name ?? 'Unassigned'}
        </span>
        <span>
          <b>Venue</b>
          {program.venue}
        </span>
        <span>
          <b>Capacity</b>
          {capacity.used} of {capacity.capacity}
        </span>
        <span>
          <b>Deadline</b>
          {formatDemoDate(program.registrationDeadline)}
        </span>
      </div>
      <div className="staff-tabs" role="tablist" aria-label="Program detail sections">
        {tabs.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? 'active' : ''}
            onClick={() => setTab(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <label className="staff-mobile-tab-select">Program section
        <select value={tab} onChange={(event) => setTab(event.target.value as (typeof tabs)[number])}>
          {tabs.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <section className="staff-tab-panel">
        {tab === 'Overview' && <OverviewTab program={program} leadName={lead?.name} />}
        {tab === 'Sessions' && <SessionsTab sessions={sessions} updateSessionStatus={updateSessionStatus} onOpenRoster={() => setTab('Roster')} />}
        {tab === 'Roster' && (
          <RosterTab
            state={state}
            registrations={registrations}
            sessions={sessions}
            setAttendance={setAttendance}
          />
        )}
        {tab === 'Coaches' && (
          <CoachTab programId={program.id} sessions={sessions} state={state} assignCoach={assignCoach} />
        )}
        {tab === 'Curriculum' && <CurriculumTab sessions={sessions} saveCurriculum={updateSessionCurriculum} />}
        {tab === 'Logistics' && <LogisticsTab checks={checks} setChecks={setChecks} />}
        {tab === 'Communications' && (
          <CommunicationsTab
            message={message}
            sent={sent}
            setMessage={(value) => {
              setMessage(value);
              setSent(false);
            }}
            logMessage={logMessage}
          />
        )}
        {tab === 'Finance' && <FinanceTab programId={program.id} state={state} />}
      </section>
    </div>
  );
}

function OverviewTab({ program, leadName }: { program: NonNullable<ReturnType<typeof getProgram>>; leadName?: string }) {
  return (
    <div className="detail-two-col">
      <div>
        <h2>Program overview</h2>
        <p>{program.description}</p>
        <div className="overview-stat-grid">
          <div>
            <span>Skill level</span>
            <b>{program.skillLevel}</b>
          </div>
          <div>
            <span>Eligibility</span>
            <b>{program.eligibility}</b>
          </div>
          <div>
            <span>Price</span>
            <b>{program.price === 0 ? 'Free' : `$${program.price}`}</b>
          </div>
          <div>
            <span>Lead coach</span>
            <b>{leadName ?? 'Unassigned'}</b>
          </div>
        </div>
      </div>
      <div className="side-note">
        <Flag size={18} />
        <div>
          <b>Next move</b>
          <p>Confirm the final coach roster before the next scheduled session.</p>
          <Link href="/staff/coaches" className="staff-text-link">
            Open coaches <ArrowLeft size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SessionsTab({ sessions, updateSessionStatus, onOpenRoster }: { sessions: SessionRecord[]; updateSessionStatus: (sessionId: string, status: SessionRecord['status']) => void; onOpenRoster: () => void }) {
  return (
    <div>
      <div className="tab-heading">
        <div>
          <h2>Sessions</h2>
          <p>Attendance and session status are local demo records.</p>
        </div>
        <StatusBadge status={`${sessions.length} sessions`} />
      </div>
      <div className="session-table">
        {sessions.length ? (
          sessions.map((session) => (
            <div className="session-table-row" key={session.id}>
              <div>
                <b>{formatDemoDate(session.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</b>
                <small>
                  {session.startTime}–{session.endTime} · {session.location}
                </small>
              </div>
              <span>{session.coachIds.filter(Boolean).length} coaches</span>
              <label className="session-status-control">
                <span className="sr-only">Status for {formatDemoDate(session.date)}</span>
                <select value={session.status} onChange={(event) => updateSessionStatus(session.id, event.target.value as SessionRecord['status'])}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </label>
              <button className="staff-small-button" type="button" onClick={onOpenRoster}>Open roster</button>
            </div>
          ))
        ) : (
          <EmptyState title="No sessions yet" description="Add sessions to this program in the local fixture." />
        )}
      </div>
    </div>
  );
}

function RosterTab({
  state,
  registrations,
  sessions,
  setAttendance,
}: {
  state: DemoState;
  registrations: DemoState['registrations'];
  sessions: SessionRecord[];
  setAttendance: (registrationId: string, sessionId: string, status: AttendanceStatus) => void;
}) {
  return (
    <div>
      <div className="tab-heading">
        <div>
          <h2>Roster & attendance</h2>
          <p>Detailed support notes stay out of the list; open a record when needed.</p>
        </div>
        <span className="muted-copy">
          {registrations.length} registration{registrations.length === 1 ? '' : 's'}
        </span>
      </div>
      {registrations.length ? (
        <div className="roster-table">
          {registrations.map((registration) => {
            const attendance = getRegistrationAttendance(state, registration.id);
            return (
              <div className="roster-row" key={registration.id}>
                <div className="table-primary">
                  <span className="record-avatar">
                    {registration.childFirstName.slice(0, 1)}
                    {registration.childLastName.slice(0, 1)}
                  </span>
                  <span>
                    <b>
                      {registration.childFirstName} {registration.childLastName}
                    </b>
                    <small>
                      {registration.grade} · {registration.registrationStatus}
                    </small>
                  </span>
                </div>
                <div className="attendance-controls">
                  {sessions.length ? (
                    sessions.map((session) => (
                      <label key={session.id}>
                        <span>{formatDemoDate(session.date, { month: 'short', day: 'numeric' })}</span>
                        <select
                          aria-label={`${registration.childFirstName} ${formatDemoDate(session.date)}`}
                          value={attendance.find((item) => item.sessionId === session.id)?.status ?? 'not-marked'}
                          onChange={(event) =>
                            setAttendance(registration.id, session.id, event.target.value as AttendanceStatus)
                          }
                        >
                          {attendanceStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status.replaceAll('-', ' ')}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))
                  ) : (
                    <span className="muted-copy">No sessions</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No registrations yet" description="Public or family demo registrations will appear here." />
      )}
    </div>
  );
}

function CoachTab({
  sessions,
  state,
  assignCoach,
}: {
  programId: string;
  sessions: SessionRecord[];
  state: DemoState;
  assignCoach: (sessionId: string, slot: CoachSlot, coachId: string | null) => void;
}) {
  return (
    <div>
      <div className="tab-heading">
        <div>
          <h2>Coach assignments</h2>
          <p>Availability labels are informational only; there is no automated conflict detection.</p>
        </div>
        <UsersRound size={18} />
      </div>
      <div className="coach-assignment-list">
        {sessions.length ? (
          sessions.map((session) => (
            <div className="coach-assignment-card" key={session.id}>
              <div>
                <b>{formatDemoDate(session.date, { weekday: 'short', month: 'short', day: 'numeric' })}</b>
                <small>
                  {session.startTime} · {session.location}
                </small>
              </div>
              <div className="coach-slot-grid">
                {(['lead', 'coach-2', 'coach-3', 'coach-4'] as CoachSlot[]).map((slot, index) => (
                  <label key={slot}>
                    {slot === 'lead' ? 'Lead' : `Coach ${index + 1}`}
                    <select
                      value={session.coachIds[index] ?? ''}
                      onChange={(event) => assignCoach(session.id, slot, event.target.value || null)}
                    >
                      <option value="">Unassigned</option>
                      {state.coaches
                        .filter((coach) => coach.active)
                        .map((coach) => (
                          <option value={coach.id} key={coach.id}>
                            {coach.name} · {coach.availability}
                          </option>
                        ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No sessions to staff" description="Coach slots will appear when a session is added." />
        )}
      </div>
    </div>
  );
}

function CurriculumTab({ sessions, saveCurriculum }: { sessions: SessionRecord[]; saveCurriculum: (sessionId: string, curriculum: SessionCurriculum) => void }) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '');
  const selectedSession = sessions.find((session) => session.id === sessionId) ?? sessions[0];

  if (!selectedSession) return <EmptyState title="No sessions to plan" description="Curriculum appears after a session is added to the program." />;

  return <CurriculumSessionEditor key={`${selectedSession.id}-${selectedSession.curriculum.updatedAt ?? 'new'}`} sessions={sessions} selectedSession={selectedSession} setSessionId={setSessionId} saveCurriculum={saveCurriculum} />;
}

function CurriculumSessionEditor({ sessions, selectedSession, setSessionId, saveCurriculum }: { sessions: SessionRecord[]; selectedSession: SessionRecord; setSessionId: (id: string) => void; saveCurriculum: (sessionId: string, curriculum: SessionCurriculum) => void }) {
  const [draft, setDraft] = useState<SessionCurriculum>(selectedSession.curriculum);

  const totalMinutes = draft.activities.reduce((total, activity) => total + Math.max(0, Number(activity.minutes) || 0), 0);
  const updateActivity = (id: string, patch: Partial<SessionCurriculum['activities'][number]>) => {
    setDraft((current) => ({ ...current, activities: current.activities.map((activity) => activity.id === id ? { ...activity, ...patch } : activity) }));
  };
  const addActivity = () => {
    const id = `curriculum-${selectedSession.id}-${Date.now()}`;
    setDraft((current) => ({ ...current, activities: [...current.activities, { id, kind: 'skill', title: '', minutes: 10, instructions: '' }] }));
  };

  return (
    <div className="curriculum-editor">
      <div className="tab-heading curriculum-heading">
        <div><h2>Curriculum builder</h2><p>Plan the lesson here. Changes are saved to this session in the local demo.</p></div>
        <div className="curriculum-duration"><ClipboardCheck size={17} /><strong>{totalMinutes}</strong><span>planned minutes</span></div>
      </div>

      <div className="curriculum-session-bar">
        <label>Session to plan
          <select value={selectedSession.id} onChange={(event) => setSessionId(event.target.value)}>
            {sessions.map((session) => <option key={session.id} value={session.id}>{formatDemoDate(session.date, { weekday: 'short', month: 'short', day: 'numeric' })} · {session.startTime}</option>)}
          </select>
        </label>
        <span><b>{selectedSession.location}</b><small>{selectedSession.startTime}–{selectedSession.endTime}{draft.updatedAt ? ` · updated ${formatDemoDate(draft.updatedAt)}` : ''}</small></span>
      </div>

      <label className="curriculum-objective">Session objective
        <input value={draft.objective} onChange={(event) => setDraft((current) => ({ ...current, objective: event.target.value }))} placeholder="What should players be able to do by the end?" />
      </label>

      <div className="curriculum-activity-heading"><div><h3>Lesson flow</h3><p>Build a clear sequence coaches can run from the court.</p></div><button className="staff-button staff-button-outline" type="button" onClick={addActivity}><Plus size={15} /> Add activity</button></div>
      <div className="curriculum-activities">
        {draft.activities.map((activity, index) => (
          <article className="curriculum-activity" key={activity.id}>
            <div className="curriculum-activity-number">{index + 1}</div>
            <div className="curriculum-activity-fields">
              <label>Type
                <select value={activity.kind} onChange={(event) => updateActivity(activity.id, { kind: event.target.value as CurriculumActivityKind })}>
                  <option value="warm-up">Warm-up</option><option value="skill">Skill</option><option value="game">Game</option><option value="cool-down">Cool-down</option>
                </select>
              </label>
              <label className="curriculum-title-field">Activity
                <input value={activity.title} onChange={(event) => updateActivity(activity.id, { title: event.target.value })} placeholder="Activity name" />
              </label>
              <label>Minutes
                <input type="number" min="1" max="120" value={activity.minutes} onChange={(event) => updateActivity(activity.id, { minutes: Number(event.target.value) })} />
              </label>
              <label className="curriculum-instructions-field">Coach instructions
                <textarea rows={2} value={activity.instructions} onChange={(event) => updateActivity(activity.id, { instructions: event.target.value })} placeholder="Setup, cues, and how the activity runs" />
              </label>
            </div>
            <button className="curriculum-remove" type="button" aria-label={`Remove ${activity.title || `activity ${index + 1}`}`} onClick={() => setDraft((current) => ({ ...current, activities: current.activities.filter((item) => item.id !== activity.id) }))}><Trash2 size={16} /></button>
          </article>
        ))}
      </div>

      <label className="curriculum-notes">Coach notes
        <textarea rows={3} value={draft.coachNotes} onChange={(event) => setDraft((current) => ({ ...current, coachNotes: event.target.value }))} placeholder="Equipment, grouping, accessibility, or handoff notes" />
      </label>
      <div className="curriculum-save-bar"><span>This updates the shared program record on this device.</span><button className="staff-button" type="button" disabled={!draft.objective.trim() || !draft.activities.length} onClick={() => saveCurriculum(selectedSession.id, draft)}>Save curriculum</button></div>
    </div>
  );
}

function LogisticsTab({ checks, setChecks }: { checks: Record<string, boolean>; setChecks: React.Dispatch<React.SetStateAction<Record<string, boolean>>> }) {
  const items = [
    ['court', 'Confirm court access'],
    ['rackets', 'Pack loaner rackets'],
    ['signIn', 'Print sign-in sheet'],
    ['reminder', 'Send arrival reminder'],
  ];
  return (
    <div>
      <div className="tab-heading">
        <div>
          <h2>Logistics checklist</h2>
          <p>Checklist toggles are saved for this open screen only in the demo.</p>
        </div>
        <MoreHorizontal size={18} />
      </div>
      <div className="logistics-checks">
        {items.map(([id, label]) => (
          <label key={id}>
            <input
              type="checkbox"
              checked={Boolean(checks[id])}
              onChange={(event) => setChecks((current) => ({ ...current, [id]: event.target.checked }))}
            />
            <span>{checks[id] ? <CheckCircle2 size={17} /> : <Check size={17} />}</span>
            <b>{label}</b>
          </label>
        ))}
      </div>
    </div>
  );
}

function CommunicationsTab({
  message,
  sent,
  setMessage,
  logMessage,
}: {
  message: string;
  sent: boolean;
  setMessage: (value: string) => void;
  logMessage: () => void;
}) {
  return (
    <div>
      <div className="tab-heading">
        <div>
          <h2>Communications</h2>
          <p>Sending is simulated; no email or SMS is delivered.</p>
        </div>
        <MessageSquare size={18} />
      </div>
      <label className="staff-message-box" htmlFor="demo-program-message">
        Demo message
        <textarea
          id="demo-program-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="e.g. Arrival reminder for families"
        />
      </label>
      <div className="modal-actions">
        <button className="staff-button" type="button" onClick={logMessage}>
          Simulate send
        </button>
        {sent && (
          <span className="saved-message">
            <CheckCircle2 size={15} /> Recorded in activity
          </span>
        )}
      </div>
    </div>
  );
}

function FinanceTab({ programId, state }: { programId: string; state: DemoState }) {
  const entries = state.financeEntries.filter((entry) => entry.programId === programId);
  return (
    <div>
      <div className="tab-heading">
        <div>
          <h2>Program finance</h2>
          <p>Local ledger records only; this demo does not process payments.</p>
        </div>
      </div>
      {entries.length ? (
        entries.map((entry) => (
          <div className="finance-line" key={entry.id}>
            <span>{formatDemoDate(entry.date)}</span>
            <b>{entry.description}</b>
            <span>{entry.category}</span>
            <strong className={entry.kind}>
              {entry.kind === 'expense' ? '-' : '+'}${entry.amount.toFixed(2)}
            </strong>
          </div>
        ))
      ) : (
        <EmptyState title="No linked ledger entries" description="Add a finance entry from the Finance page." />
      )}
    </div>
  );
}
