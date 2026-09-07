'use client';

import { Check, LogOut, Save, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '../demo/demo-provider';

export function AccountView() {
  const { getCurrentFamily, updateFamilyProfile, signOut } = useDemo();
  const router = useRouter();
  const family = getCurrentFamily();
  const [form, setForm] = useState(() => family ? { firstName: family.firstName, lastName: family.lastName, email: family.email, phone: family.phone, emailUpdates: family.emailUpdates } : { firstName: '', lastName: '', email: '', phone: '', emailUpdates: true });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!family) return;
    const timer = window.setTimeout(() => setForm({ firstName: family.firstName, lastName: family.lastName, email: family.email, phone: family.phone, emailUpdates: family.emailUpdates }), 0);
    return () => window.clearTimeout(timer);
  }, [family]);
  if (!family) return null;
  const set = (key: keyof typeof form, value: string | boolean) => { setSaved(false); setForm((current) => ({ ...current, [key]: value })); };
  const save = (event: React.FormEvent) => { event.preventDefault(); updateFamilyProfile(form); setSaved(true); };
  const leave = () => { signOut(); router.replace('/sign-in'); };
  return <div className="portal-view"><div className="view-intro"><div><p className="eyebrow">Family account</p><h2>Your details</h2><p>Edit the fictional guardian profile used throughout this demo.</p></div><UserRound size={28} className="intro-icon" /></div><form className="card account-form" onSubmit={save}><div className="account-form-heading"><div className="avatar avatar-large">{family.firstName.slice(0, 1)}{family.lastName.slice(0, 1)}</div><div><h3>Guardian profile</h3><p>Used for registration confirmations in the prototype.</p></div></div><div className="registration-grid"><label>First name<input value={form.firstName} onChange={(event) => set('firstName', event.target.value)} /></label><label>Last name<input value={form.lastName} onChange={(event) => set('lastName', event.target.value)} /></label><label>Email<input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} /></label><label>Phone<input value={form.phone} onChange={(event) => set('phone', event.target.value)} /></label></div><label className="toggle-row"><input type="checkbox" checked={form.emailUpdates} onChange={(event) => set('emailUpdates', event.target.checked)} /><span><b>Email updates</b><small>Keep me posted about new fictional sessions.</small></span></label><div className="form-actions"><button className="button" type="submit"><Save size={16} /> Save changes</button>{saved && <span className="saved-message"><Check size={15} /> Saved locally</span>}</div></form><section className="card account-signout"><div><h3>Demo session</h3><p>There is no password or real account behind this prototype.</p></div><button className="button button-outline" type="button" onClick={leave}><LogOut size={16} /> Sign out</button></section></div>;
}
