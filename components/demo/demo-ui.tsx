'use client';

import type { ReactNode } from 'react';
import { Check, CircleAlert, Info, X } from 'lucide-react';
import { useDemo } from './demo-provider';

const labels: Record<string, string> = {
  'registration-open': 'Registration open', 'parent-reported-absence': 'Parent-reported absence', 'offer-sent': 'Offer sent',
  'follow-up-due': 'Follow-up due', 'active-partner': 'Active partner', 'in-progress': 'In progress', 'not-started': 'Not started',
  'awaiting-reply': 'Awaiting reply', 'not-marked': 'Not marked', 'waived': 'Waived', 'registration-opened': 'Registration open',
  confirmed: 'Confirmed', waitlisted: 'Waitlisted', completed: 'Completed', active: 'Active', planning: 'Planning', done: 'Done', paid: 'Paid', failed: 'Failed', pending: 'Pending', blocked: 'Blocked', canceled: 'Canceled',
};

export function displayStatus(status: string): string {
  return labels[status] ?? status.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function StatusBadge({ status, tone }: { status: string; tone?: 'positive' | 'warning' | 'danger' | 'neutral' }) {
  const inferred = tone ?? (['confirmed', 'active', 'completed', 'done', 'paid', 'active-partner'].includes(status) ? 'positive' : ['failed', 'blocked', 'canceled'].includes(status) ? 'danger' : ['waitlisted', 'offer-sent', 'follow-up-due', 'awaiting-reply', 'planning', 'in-progress'].includes(status) ? 'warning' : 'neutral');
  return <span className={`demo-status demo-status-${inferred}`}><i aria-hidden="true" />{displayStatus(status)}</span>;
}

export function Metric({ label, value, detail, href }: { label: string; value: string | number; detail?: string; href?: string }) {
  const content = <><span className="demo-metric-label">{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</>;
  return href ? <a className="demo-metric" href={href}>{content}</a> : <div className="demo-metric">{content}</div>;
}

export function EmptyState({ title, copy, description, action }: { title: string; copy?: string; description?: string; action?: ReactNode }) {
  return <div className="demo-empty"><Info size={18} aria-hidden="true" /><div><strong>{title}</strong><p>{copy ?? description ?? ''}</p>{action}</div></div>;
}

export function DemoNotice({ children = 'Demo mode · fictional data only. Do not enter real personal, medical, or payment information.' }: { children?: ReactNode }) {
  return <div className="demo-notice"><Info size={16} aria-hidden="true" /><span>{children}</span></div>;
}

export function FieldError({ children }: { children: ReactNode }) {
  return <p className="demo-field-error" role="alert"><CircleAlert size={14} aria-hidden="true" />{children}</p>;
}

export function ToastRegion() {
  const { toast, dismissToast } = useDemo();
  if (!toast) return null;
  return <div className="demo-toast" role="status"><Check size={16} aria-hidden="true" /><span>{toast}</span><button type="button" aria-label="Dismiss notification" onClick={dismissToast}><X size={15} /></button></div>;
}
