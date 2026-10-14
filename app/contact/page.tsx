import { SignupForm } from '../../components/site-interactions';
import { SiteFooter, SiteHeader } from '../../components/site-shell';

export const metadata = {
  title: 'Sign up with Rookie Rackets',
  description: 'Sign up for badminton workshops, adult or junior volunteering, or coaching in the Triangle, North Carolina.',
};

export default function Contact() {
  return <main className="signup-page">
    <SiteHeader active="/contact" />
    <section className="signup-intro shell" data-reveal>
      <div className="signup-intro-copy">
        <p className="eyebrow">Rookie Rackets · Triangle, NC</p>
        <h1>Sign up.<br /><em>Get involved.</em></h1>
        <p>Find your place on or around the court. Sign up for a workshop, join as an adult or junior volunteer, or share your skills as a coach.</p>
        <div className="signup-intro-points"><span>01 / Share your details</span><span>02 / We’ll be in touch</span></div>
      </div>
      <figure><img src="/images/team-2026.webp" alt="Rookie Rackets volunteer team on a badminton court" /><figcaption>A community for players, volunteers, and coaches.</figcaption></figure>
    </section>
    <section className="signup-main" data-reveal><div className="shell signup-layout">
      <SignupForm />
      <aside className="signup-aside"><p className="eyebrow">Find your place</p><h2>Play. Volunteer. Coach.</h2><p>Workshops welcome players of all ages and abilities. Adult and junior volunteers support events, equipment setup, outreach, photography, and fundraising. Coaches help players learn and enjoy badminton.</p><div className="signup-aside-note"><strong>What happens next?</strong><span>Our team will contact you about the opportunity you selected. Workshop interest does not reserve an event place; we’ll share available dates and any host requirements.</span></div><a href="mailto:teamrookierackets@gmail.com">Questions? Email our team ↗</a></aside>
    </div></section>
    <SiteFooter />
  </main>;
}
