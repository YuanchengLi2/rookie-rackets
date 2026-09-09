'use client';

import { ArrowRight, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { createBrowserSupabaseClient } from '../../lib/supabase/browser';
import { safeReturnPath } from '../../lib/supabase/auth';

export function StaffSignIn() {
  const searchParams = useSearchParams();
  const next = useMemo(() => safeReturnPath(searchParams.get('next')), [searchParams]);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    try {
      const result = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false, emailRedirectTo },
      });
      if (result.error) {
        throw result.error;
      }
      setStatus('sent');
    } catch {
      setError('We could not send a sign-in link. Check that this email has staff access and try again.');
      setStatus('idle');
    }
  };

  return (
    <main className="sign-in-page demo-app">
      <div className="sign-in-shell">
        <div className="sign-in-visual">
          <div className="sign-in-visual-copy">
            <span className="demo-kicker">Rookie Rackets</span>
            <h1>Keep every program moving.</h1>
            <p>Secure access for the staff and volunteers running registrations, sessions, partnerships, and finances.</p>
          </div>
        </div>
        <section className="sign-in-content" aria-labelledby="sign-in-heading">
          <span className="demo-kicker">Staff access</span>
          <h2 id="sign-in-heading">Sign in to the operations desk</h2>
          <p>We’ll email a one-time sign-in link to an approved staff address.</p>
          {status === 'sent' ? (
            <div className="demo-notice" role="status">
              <Mail size={18} />
              <span><strong>Check your email.</strong> Open the secure link to finish signing in.</span>
            </div>
          ) : (
            <form className="staff-form" onSubmit={submit}>
              <label htmlFor="staff-email">Staff email
                <input id="staff-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              {error && <p role="alert" className="form-error">{error}</p>}
              <button className="staff-button" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Email sign-in link'} <ArrowRight size={17} />
              </button>
            </form>
          )}
          <p className="sign-in-note">Access is limited to staff approved by a Rookie Rackets administrator.</p>
        </section>
      </div>
    </main>
  );
}
