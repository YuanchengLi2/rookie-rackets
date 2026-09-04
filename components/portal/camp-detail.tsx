'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, CreditCard, MapPin, MessageCircle, ReceiptText, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { ConsentType } from '../../lib/demo/types';
import { formatDemoDate, getProgram, getRegistrationAttendance, getRegistrationConsents, getRegistrationSessions } from '../../lib/demo/selectors';
import { useDemo } from '../demo/demo-provider';
import { DemoFileButton } from '../demo/demo-file-preview';
import { EmptyState, StatusBadge } from '../demo/demo-ui';
import { DemoModal } from '../demo/overlay';

const consentLabels: Record<ConsentType, { label: string; description: string; required: boolean }> = {
  'participation-waiver': { label: 'Participation waiver', description: 'Activity waiver for this camp.', required: true },
  'program-acknowledgment': { label: 'Camp details', description: 'Confirms you reviewed the camp information.', required: true },
  'pickup-policy': { label: 'Pickup policy', description: 'Arrival and pickup expectations.', required: true },
  'photo-video': { label: 'Photo and video permission', description: 'Optional. It is completely okay to decline.', required: false },
};

export function CampDetail({ registrationId }: { registrationId: string }) {
  const { state, reportAbsence, acceptWaitlistOffer, updateConsent } = useDemo();
  const registration = state.registrations.find((item) => item.id === registrationId && item.familyId === 'family-demo');
  const program = registration ? getProgram(state, registration.programId) : undefined;
  const sessions = registration ? getRegistrationSessions(state, registration) : [];
  const attendance = registration ? getRegistrationAttendance(state, registration.id) : [];
  const consents = registration ? getRegistrationConsents(state, registration.id) : [];
  const payment = registration ? state.payments.find((item) => item.registrationId === registration.id) : undefined;
  const receipt = payment?.receiptFileId ? state.files.find((item) => item.id === payment.receiptFileId) : undefined;
  const futureSessions = sessions.filter((session) => session.date >= state.demoDate && session.status === 'scheduled');
  const [absenceOpen, setAbsenceOpen] = useState(false);
  const [sessionId, setSessionId] = useState(futureSessions[0]?.id ?? '');
  const [note, setNote] = useState('');
  const attendanceBySession = new Map(attendance.map((item) => [item.sessionId, item.status]));

  if (!registration || !program) return <EmptyState title="Camp not found" description="This camp may have been reset or does not belong to this family." action={<Link className="button" href="/portal/camps">Back to My Camps</Link>} />;

  const submitAbsence = () => {
    if (!sessionId) return;
    reportAbsence(registration.id, sessionId, note);
    setAbsenceOpen(false);
    setNote('');
  };

  return <div className="portal-view"><Link className="back-link" href="/portal/camps"><ArrowLeft size={16} /> My Camps</Link><div className="detail-heading"><div><p className="eyebrow">{registration.childFirstName} {registration.childLastName}</p><h2>{program.name}</h2><p>{program.venue}</p></div><StatusBadge status={registration.registrationStatus} /></div>
    {registration.registrationStatus === 'offer-sent' && <div className="portal-callout"><div><b>Your spot is ready</b><p>Accept it to move this camp from the waitlist to confirmed.</p></div><button className="button" onClick={() => acceptWaitlistOffer(registration.id)} type="button">Accept spot <CheckCircle2 size={16} /></button></div>}

    <section className="card camp-section"><div className="section-heading"><h3>Dates</h3><CalendarDays size={18} /></div><div className="session-list">{sessions.length ? sessions.map((session) => <div className="session-row" key={session.id}><div><b>{formatDemoDate(session.date, { weekday: 'short', month: 'short', day: 'numeric' })}</b><span><Clock3 size={14} /> {session.startTime}–{session.endTime}</span><span><MapPin size={14} /> {session.location}</span></div><StatusBadge status={attendanceBySession.get(session.id) ?? (session.status === 'completed' ? 'completed' : 'not-marked')} /></div>) : <p className="muted-copy">No dates are attached to this historical camp.</p>}</div>{futureSessions.length > 0 && <button className="button button-outline" type="button" onClick={() => setAbsenceOpen(true)}>Report an absence</button>}</section>

    <div className="detail-grid camp-detail-grid"><section className="card camp-section"><div className="section-heading"><h3>Forms</h3><CheckCircle2 size={18} /></div><div className="form-records">{consents.map((consent) => { const meta = consentLabels[consent.type]; const action = consent.type === 'photo-video' ? (consent.accepted ? 'Decline photos' : 'Allow photos') : (consent.accepted ? 'Change response' : 'Accept'); return <div className="form-row" key={consent.id}><div className={`form-state ${consent.accepted ? 'is-complete' : ''}`}><CheckCircle2 size={18} /></div><div><b>{meta.label} · {meta.required ? 'required' : 'optional'}</b><p>{meta.description}</p><small>{consent.accepted ? `Completed${consent.acceptedAt ? ` ${formatDemoDate(consent.acceptedAt)}` : ''}` : 'Not accepted'}</small></div><button type="button" className="button button-outline" onClick={() => updateConsent(registration.id, consent.type, !consent.accepted)}>{action}</button></div>; })}</div></section>

      <section className="card camp-section"><div className="section-heading"><h3>Payment</h3><CreditCard size={18} /></div><div className="camp-payment"><strong>{program.price === 0 ? 'Free camp' : `$${program.price.toFixed(2)}`}</strong><StatusBadge status={payment?.status ?? registration.paymentStatus} /><p>{program.price === 0 ? 'No payment is needed.' : payment?.note ?? 'Payment details for this camp.'}</p>{payment && <div className="camp-receipt"><ReceiptText size={17} /><span><b>{payment.receiptNumber}</b><small>{payment.paymentDate ? formatDemoDate(payment.paymentDate) : 'Payment pending'}</small></span></div>}{receipt && <DemoFileButton file={receipt} label="Open receipt preview" />}</div></section>
    </div>

    <section className="card camp-section"><div className="section-heading"><h3>Player details</h3><UserRound size={18} /></div><dl className="detail-list"><div><dt>Player</dt><dd>{registration.childFirstName} {registration.childLastName} · {registration.grade} · {registration.skillLevel}</dd></div><div><dt>Guardian</dt><dd>{registration.guardianFirstName} {registration.guardianLastName}<br />{registration.guardianEmail}<br />{registration.guardianPhone}</dd></div><div><dt>Emergency contact</dt><dd>{registration.emergencyName} · {registration.emergencyRelationship}<br />{registration.emergencyPhone}</dd></div><div><dt>What to bring</dt><dd>{program.whatToBring.join(' · ')}{program.equipmentProvided ? ' · Racket provided' : ''}</dd></div></dl><p className="detail-contact"><MessageCircle size={15} /> Questions? {program.contact}</p></section>

    <DemoModal open={absenceOpen} title="Report an absence" onClose={() => setAbsenceOpen(false)}><p className="modal-description">Choose the date your player will miss.</p><label>Camp date<select value={sessionId} onChange={(event) => setSessionId(event.target.value)}>{futureSessions.map((session) => <option key={session.id} value={session.id}>{formatDemoDate(session.date, { weekday: 'short', month: 'short', day: 'numeric' })}</option>)}</select></label><label>Note <span>(optional)</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Out of town" /></label><div className="modal-actions"><button className="button button-outline" onClick={() => setAbsenceOpen(false)} type="button">Cancel</button><button className="button" onClick={submitAbsence} type="button">Save absence</button></div></DemoModal>
  </div>;
}
