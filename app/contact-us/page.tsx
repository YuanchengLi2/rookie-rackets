import Link from 'next/link';
import { ContactForm } from '../../components/site-interactions';
import { SiteFooter, SiteHeader } from '../../components/site-shell';

export const metadata = {
  title: 'Contact Rookie Rackets',
  description: 'Send Rookie Rackets a message about events, partnerships, donations, or press in the Triangle, North Carolina.',
};

export default function ContactUs() {
  return <main className="signup-page contact-page">
    <SiteHeader active="/contact-us" />
    <section className="signup-intro shell" data-reveal>
      <div className="signup-intro-copy">
        <p className="eyebrow">Rookie Rackets · Triangle, NC</p>
        <h1>Contact us.<br /><em>We’d love to hear from you.</em></h1>
        <p>Have a question about our events, want to host a workshop, or hope to support the team? Send us a message and a member of our student team will reply.</p>
        <div className="signup-intro-points"><span>01 / Send a message</span><span>02 / We’ll reply by email</span></div>
      </div>
      <figure><img src="/images/community-outreach-mayor.webp" alt="Rookie Rackets team at a community outreach event" /><figcaption>Student-led, community-focused.</figcaption></figure>
    </section>
    <section className="signup-main" data-reveal><div className="shell signup-layout">
      <ContactForm />
      <aside className="signup-aside"><p className="eyebrow">Other ways to reach us</p><h2>Say hello.</h2><p>Based in Cary, North Carolina, we run free badminton workshops across the Triangle.</p><div className="signup-aside-note"><strong>Looking to play, volunteer, or coach?</strong><span>Use our <Link href="/contact">sign-up form</Link> so we can match you with the right opportunity.</span></div><a href="mailto:teamrookierackets@gmail.com">teamrookierackets@gmail.com ↗</a></aside>
    </div></section>
    <SiteFooter />
  </main>;
}
