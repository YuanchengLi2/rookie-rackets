'use client';

import { ArrowRight, BriefcaseBusiness, UsersRound } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useDemo } from './demo-provider';
import { DemoNotice } from './demo-ui';

export function DemoSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInAs } = useDemo();
  const mode = searchParams.get('mode');
  const familyMode = mode === 'login' || mode === 'signup' ? mode : null;
  const next = useMemo(() => {
    const value = searchParams.get('next');
    const isLocalPath = Boolean(value) && !value!.startsWith('//') && !value!.includes('://');
    const isFamilyPath = isLocalPath && (value === '/portal' || value?.startsWith('/portal/') || value?.startsWith('/register/'));
    const isStaffPath = isLocalPath && (value === '/staff' || value?.startsWith('/staff/'));
    return isFamilyPath || isStaffPath ? value : null;
  }, [searchParams]);
  const choose = (role: 'family' | 'staff') => {
    signInAs(role);
    const isAllowed = next && (role === 'family' ? next === '/portal' || next.startsWith('/portal/') || next.startsWith('/register/') : next === '/staff' || next.startsWith('/staff/'));
    const destination = isAllowed ? next : role === 'family' ? '/portal' : '/staff';
    router.replace(destination);
  };
  return <main className="sign-in-page demo-app">
    <div className="sign-in-shell">
      <div className="sign-in-visual"><div className="sign-in-visual-copy"><span className="demo-kicker">Rookie Rackets</span><h1>Everything in one place.</h1><p>A small, friendly prototype for the families and people who make every session happen.</p></div></div>
      <section className="sign-in-content" aria-labelledby="sign-in-heading">
        <span className="demo-kicker">{familyMode ? 'Family access' : 'Demo access'}</span><h2 id="sign-in-heading">{familyMode === 'login' ? 'Welcome back' : familyMode === 'signup' ? 'Create your family account' : 'Choose a demo workspace'}</h2><p>{familyMode === 'login' ? 'Sign in to keep this camp with your family’s dates, forms, and receipts.' : familyMode === 'signup' ? 'Create one simple family account to finish registration and keep camp details together.' : 'There are no passwords or accounts in this prototype. Pick a fictional role to explore the experience.'}</p>
        <DemoNotice />
        {familyMode ? <div className="sign-in-role-grid"><button aria-label={familyMode === 'login' ? 'Sign in and continue' : 'Create account and continue'} className="sign-in-role" type="button" onClick={() => choose('family')}><span className="sign-in-role-icon"><UsersRound size={21} /></span><span><strong>{familyMode === 'login' ? 'Sign in and continue' : 'Create account and continue'}</strong><small>Use the fictional Jordan Lee family account</small></span><ArrowRight size={18} aria-hidden="true" /></button></div> : <div className="sign-in-role-grid">
          <button className="sign-in-role" type="button" onClick={() => choose('family')}><span className="sign-in-role-icon"><UsersRound size={21} /></span><span><strong>Continue as family</strong><small>Jordan Lee · My Rookie Rackets</small></span><ArrowRight size={18} aria-hidden="true" /></button>
          <button className="sign-in-role" type="button" onClick={() => choose('staff')}><span className="sign-in-role-icon"><BriefcaseBusiness size={21} /></span><span><strong>Continue as staff</strong><small>Yuancheng · Rookie Rackets Hub</small></span><ArrowRight size={18} aria-hidden="true" /></button>
        </div>}
        <p className="sign-in-note">Demo changes are stored only in this browser. Reset the demo from any workspace to return to the original walkthrough data.</p>
      </section>
    </div>
  </main>;
}
