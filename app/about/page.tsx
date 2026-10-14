import Link from 'next/link';
import { SiteFooter, SiteHeader } from '../../components/site-shell';

const team = [
  { name: 'Adithya Burisetty', role: 'Founder & President', since: 'Since 2024', bio: 'Seven years of competitive experience. Leads the organization and teaches singles strategy and footwork.', photo: '/images/adithya-burisetty.webp' },
  { name: 'Nikhil Peechara', role: 'VP Programs', since: 'Since 2024', bio: 'Five years of competitive experience. Leads program delivery for RJourney and teaches net play and drop shots.', photo: '/images/nikhil-peechara.webp' },
  { name: 'Yuancheng Li', role: 'VP Technology', since: 'Since 2026', bio: 'Builds the technology that supports the team and coaches with an emphasis on confidence and consistency.' },
  { name: 'Aarav Gupta', role: 'VP Programs', since: 'Since 2024', bio: 'Three years of competitive and national-level experience. Leads program delivery for Vibha and supports session planning.', photo: '/images/tanay-kankanala.webp' },
  { name: 'Nathan Kankanala', role: 'VP Curriculum', since: 'Since 2024', bio: 'Six years of competitive badminton experience. Develops beginner fundamentals with a focus on footwork and serve mechanics.', photo: '/images/vihaan-darbha.webp' },
  { name: 'Vihaan Darbha', role: 'Coach', since: 'Since 2026', bio: 'A nationally ranked player who teaches smashes, movement, and confident net play while supporting Rookie Rackets social media.', photo: '/images/nathan-kankanala.webp' },
  { name: 'Ishan Kanchi', role: 'Coach', since: 'Since 2026', bio: 'A patient coach who helps first-time players build control and enjoy their first rallies.', photo: '/images/ishan-kanchi.webp' },
  { name: 'Tanay Kankanala', role: 'Coach', since: 'Since 2026', bio: 'Supports beginner groups, helps every player feel welcome on court, and contributes to Rookie Rackets social media.', photo: '/images/aarav-gupta.webp' },
  { name: 'Srineet Atluri', role: 'Volunteer', since: 'Since 2026', bio: 'Supports Rookie Rackets programs and community events as the organization continues to grow.' },
];

const mentors = [
  { name: 'Coach Hendry', role: 'US National Head Coach, 2023–2024', photo: '/images/coach-hendry.webp', bio: 'National-level leadership and training that helped shape the competitive foundation behind Rookie Rackets.' },
  { name: 'Coach Mark Chandler', role: 'Coach & Psychiatrist', photo: '/images/coach-mark.webp', bio: 'US National Coach trained, with more than six years of beginner coaching. His background in psychiatry helps shape sessions that keep kids engaged and learning.' },
];

export default function About() {
  return <main className="about-page"><SiteHeader active="/about" />
    <section className="about-hero approved-split shell" data-reveal>
      <div>
        <p className="eyebrow">Founded 2024 · 9 volunteers · 501(c)(3)</p>
        <h1>A student-led nonprofit making badminton accessible across the Triangle, NC.</h1>
        <strong className="about-hero-tagline">Nine volunteers and growing. One shared love for the sport.</strong>
        <div className="actions"><Link className="button button-blue" href="/events">View Events →</Link><Link className="plain-link" href="/contact">Sign up</Link></div>
      </div>
      <figure className="core-team-photo"><img src="/images/team-2026.webp" alt="Rookie Rackets volunteer team"/><figcaption>Core Team</figcaption></figure>
    </section>

    <section className="about-story shell" data-reveal>
      <div className="about-story-copy">
        <p className="eyebrow">Our story</p>
        <h2>One Student, One idea.<br/>A growing community.</h2>
        <p>In our own schools, we found that many teachers and students didn&apos;t know what badminton was — a low-cost, low-impact sport you can play almost anywhere, from a gym to a backyard. It welcomes players of every age and every kind of mind, and it builds hand-eye coordination, balance, and overall fitness. A sport with those advantages shouldn&apos;t be overlooked.</p>
        <p>What started as one Wake County high schooler&apos;s idea grew into Rookie Rackets, a 501(c)(3) nonprofit organization, joined by many more like-minded students. Our goal is to keep widening that door, reaching more folks — all ages and abilities — across the Triangle, NC.</p>
      </div>
      <div className="mission-vision-grid">
        <article><h3>Our Mission</h3><strong>Share our love of badminton with the community.</strong><p>We provide free, all-inclusive workshops and demonstration sessions for players of every age, any ability, and any skill level, welcoming anyone who wants to pick up a racket for the first time.</p></article>
        <article><h3>Our Vision</h3><strong>Make badminton accessible for everyone.</strong><p>We envision a community where anyone can pick up a racket and fall in love with badminton, regardless of age, ability, background, or experience.</p></article>
      </div>
    </section>

    <section className="about-team shell" data-reveal>
      <div className="home-section-title"><p className="eyebrow">The student team</p><h2>Meet the core team.</h2><p>Nine volunteers bringing competitive experience, thoughtful instruction, and community energy to every session.</p></div>
      <div className="team-card-grid">{team.map((member) => <article className="team-card" key={member.name}>
        {member.photo ? <img src={member.photo} alt={member.name}/> : <div className="team-card-initials" aria-hidden="true">{member.name.split(' ').map((part) => part[0]).join('')}</div>}
        <div><span>{member.since}</span><h3>{member.name}</h3><strong>{member.role}</strong><p>{member.bio}</p></div>
      </article>)}</div>
      <div className="student-coaching"><h2>Competitive experience.<br/>Beginner-first teaching.</h2><p>Our student coaches bring competitive experience and a love for teaching. They pair national-level training with patient, inclusive instruction and free equipment for participants.</p></div>
      <p className="team-growth-line">Nine volunteers and growing. One shared love for the sport.</p>
    </section>

    <section className="about-coaching" data-reveal><div className="about-coaching-inner shell">
      <div><p className="eyebrow">Supporting our student team</p><h2>Meet our coaching mentors.</h2><p>Coach Hendry and Coach Mark bring their experience to the student coaches who lead Rookie Rackets sessions.</p></div>
      <div className="mentor-grid">{mentors.map((mentor) => <article className="mentor-card" key={mentor.name}><img src={mentor.photo} alt={mentor.name}/><div><p className="eyebrow">Coaching mentor</p><h3>{mentor.name}</h3><strong>{mentor.role}</strong><p>{mentor.bio}</p></div></article>)}</div>
    </div></section>

    <section className="approved-cta" data-reveal><div className="shell"><div><h2>Find your place in the game.</h2><p>Join a workshop, volunteer with our team, or help coach the next generation of players.</p></div><Link className="button" href="/contact">Sign up →</Link><Link href="/events">View Events</Link></div></section><SiteFooter />
  </main>;
}
