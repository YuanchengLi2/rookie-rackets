import Link from 'next/link';
import { CountUp } from '../../components/motion';
import { SiteFooter, SiteHeader } from '../../components/site-shell';

const eventRecord = [
  { date: 'Aug 2025', name: 'Carpenter Elementary Workshop', description: 'A four-week beginner program introduced students to grip, serves, movement, and cooperative rallies.' },
  { date: 'Feb 22, 2026', name: 'Community Smash', description: 'An open singles and doubles fundraiser with ShuttleZone at Peak Sports helped fund free workshops and community equipment.' },
  { date: 'Mar 4, 11, 18 & 25, 2026', name: 'TMSA Elementary Workshop', description: 'Twelve elementary students learned overhead clears, net play, and footwork during a four-week school program.' },
  { date: 'Apr 25, 2026', name: 'Vibha Pickleball Tournament', description: 'Nathan and Vihaan staffed an awareness booth and introduced families to the Rookie Rackets mission.' },
  { date: 'May 3, 2026', name: 'Anurag Foundation Spring Walk/Run', description: 'Rookie Rackets hosted an awareness booth and badminton demonstration with the Anurag Foundation community.' },
  { date: 'Jul 20–24, 2026', name: 'VIBHA Rookie Rackets Camp', description: 'A five-day camp at Peak Sports gave seven young players structured beginner instruction and court time.' },
  { date: 'Jul 21, 2026', name: 'Wake County Board Presentation', description: 'The student team presented its mission, community partnerships, and plans for expanding access to badminton.' },
  { date: 'Jul 29, 2026', name: 'Passmore Community Event', description: 'Families met the team, learned about free workshops, and tried an accessible introduction to badminton.' },
  { date: 'Aug 3–6, 2026', name: 'Rookie Rackets Summer Camp at Peak Sports', description: 'Eleven participants built serving, rallying, and movement skills during a four-day fundraising camp.' },
  { date: 'Aug 3–6, 2026', name: 'Awareness Booth at Peak Sports Camp', description: 'Rookie Rackets shared its mission and introduced families to its free, inclusive workshops during the summer camp at Peak Sports.' },
  { date: 'Aug 10–14, 2026', name: 'Rookie Rackets & RJourney Camp', description: 'A one-week program created a supportive badminton experience for children on the autism spectrum.' },
  { date: 'Aug 23, 2026', name: 'Vibha DreamMile', description: 'An awareness booth and open-play station invited families to try badminton and meet the team.' },
  { date: 'Aug 28, Sep 11 & 18, 2026', name: 'Raleigh Boys Club Workshops', description: 'Beginner workshops served Raleigh Boys Club participants in grades three through six. The September 4 workshop was canceled; the next session is scheduled for September 25.' },
];

export default function CompletedEvents() {
  return <main className="completed-page"><SiteHeader active="/completed-events" />
    <section className="completed-hero" data-reveal><div className="shell"><div><p className="eyebrow">Our journey</p><h1>Every session leaves a story behind.</h1><p>Workshops, camps, awareness booths, and community events since 2025.</p><div className="actions"><Link className="button" href="/contact">Join the Waitlist →</Link><Link className="under-link" href="/events">Ongoing &amp; Upcoming Programs</Link></div></div><img src="/images/community-badminton-demo.webp" alt="A Rookie Rackets community badminton demonstration"/></div></section>

    <section className="completed-metrics shell" aria-label="Rookie Rackets impact" data-reveal>
      <span><strong><CountUp end={100}/>+</strong> Introduced to Badminton</span><b>•</b>
      <span><strong><CountUp end={8}/>+</strong> Events — workshops, camps &amp; awareness booths</span><b>•</b>
      <span><strong><CountUp end={7}/>+</strong> Partnered with schools &amp; organizations in the Triangle</span><b>•</b>
      <span><strong><CountUp end={2}/>+</strong> Years of operations</span><b>•</b>
      <span><strong><CountUp end={100}/>%</strong> Free all-inclusive workshops</span><b>•</b>
      <span><strong><CountUp end={60}/>+</strong> Combined tournament wins</span>
    </section>

    <section className="completed-story shell" data-reveal><img src="/images/hero-workshop.webp" alt="Carpenter Elementary workshop"/><div><p className="eyebrow">01 / Where it started</p><h2>Carpenter Elementary</h2><span>Aug 2025 · four-week beginner program</span><blockquote>“Ten beginners arrived without ever holding a racket.”</blockquote><p className="skill-line">Grip · Serve · Rally · Movement</p></div></section>
    <section className="completed-story reverse shell" data-reveal><div><p className="eyebrow">02 / A growing group</p><h2>TMSA Elementary</h2><span>Mar 4, 11, 18 &amp; 25, 2026 · 12 players · 4 weeks</span><blockquote>“Our most diverse group yet, learning across grade levels.”</blockquote><p className="skill-line">Overhead clears · Net play · Footwork</p></div><img src="/images/gallery-certificates.webp" alt="TMSA Elementary students with workshop certificates"/></section>
    <section className="completed-story shell" data-reveal><img src="/images/registration.webp" alt="Community Smash event at Peak Sports"/><div><p className="eyebrow">03 / Funding the mission</p><h2>Community Smash</h2><span>Feb 22, 2026 · Peak Sports Morrisville · with ShuttleZone</span><p>Singles and doubles brought the community together and helped fund free workshops and badminton equipment for community partners.</p><div className="smash-metrics"><span><strong>Open play</strong>singles &amp; doubles</span><span><strong>Fundraiser</strong>supported the mission</span></div></div></section>

    <section className="event-highlights shell" data-reveal>
      <div className="home-section-title"><p className="eyebrow">Community milestones</p><h2>More ways we shared the sport</h2></div>
      <div className="event-highlight-grid">
        <article><img src="/images/vibha-community-booth.webp" alt="Nathan and Vihaan at the Vibha Pickleball Tournament awareness booth"/><span>Apr 25, 2026</span><h3>Vibha Pickleball Tournament</h3><p>Nathan and Vihaan shared the Rookie Rackets mission from an awareness booth at the partner event.</p></article>
        <article><img src="/images/community-outreach-mayor.webp" alt="Rookie Rackets awareness booth at the Anurag Foundation event"/><span>May 3, 2026</span><h3>Anurag Foundation Spring Walk/Run</h3><p>An awareness booth and badminton demonstration brought the sport to the Anurag Foundation community.</p></article>
        <article><img src="/images/peak-sports-summer-camp.webp" alt="Young players at the Peak Sports camp"/><span>Aug 3–6, 2026</span><h3>Awareness Booth at Peak Sports Camp</h3><p>Families learned about Rookie Rackets and its free, inclusive workshops alongside the summer camp.</p></article>
        <article><img src="/images/dreammile-team.webp" alt="Rookie Rackets team at Vibha DreamMile"/><span>Aug 23, 2026</span><h3>Vibha DreamMile</h3><p>An awareness booth and open-play station gave families a chance to try badminton.</p></article>
        <article><img src="/images/raleigh-boys-club.webp" alt="A participant at the Raleigh Boys Club"/><span>Aug 28, Sep 11 &amp; 18, 2026</span><h3>Raleigh Boys Club Workshops</h3><p>A recurring partner program delivered directly for Raleigh Boys Club participants. The Sep 4 session was canceled.</p></article>
      </div>
    </section>

    <section className="summer-record shell" data-reveal><h2>Summer 2026</h2><p>Three hosted camps. Three partnerships. More time on court.</p><div><figure><img src="/images/vibha-summer-camp.webp" alt="Players and coaches at the VIBHA Rookie Rackets summer camp"/><figcaption><strong>VIBHA Rookie Rackets Camp</strong><span>Jul 20–24, 2026</span></figcaption></figure><figure><img src="/images/peak-sports-summer-camp.webp" alt="Young players practicing at the Rookie Rackets Peak Sports camp"/><figcaption><strong>Rookie Rackets Camp at Peak Sports</strong><span>Aug 3–6, 2026</span></figcaption></figure><figure><img src="/images/rjourney-group.webp" alt="RJourney summer camp group"/><figcaption><strong>RJourney Camp</strong><span>Aug 10–14, 2026</span></figcaption></figure></div></section>

    <section className="full-record shell" data-reveal><h2>The full record</h2>{eventRecord.map((event)=><details key={event.name}><summary><span>{event.date}</span><strong>{event.name}</strong><b>+</b></summary><p>{event.description}</p></details>)}</section>
    <section className="approved-cta" data-reveal><div className="shell"><div><h2>Be part of the next story.</h2><p>Join the waitlist for upcoming Rookie Rackets camps.</p></div><Link className="button" href="/contact">Sign Up →</Link><Link href="/events">View Ongoing &amp; Upcoming Programs</Link></div></section><SiteFooter />
  </main>;
}
