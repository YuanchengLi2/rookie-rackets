import Link from 'next/link';
import { CountUp, HeroCarousel } from '../components/motion';
import { GalleryLightbox, Testimonials } from '../components/site-interactions';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import { homepageHeroSlides, photos } from '../lib/site-photos';

const quotes = [
  { quote: 'The members of Rookie Rackets displayed a level of maturity, organization, and professionalism that is truly exemplary for their age. What truly impressed me was their ability to translate that expertise into effective instruction for beginners.', name: 'Kim Collins', role: 'Principal, Carpenter Elementary' },
  { quote: 'Dhruva liked the camp so much. He loves to continue playing. Great camp!', name: 'Dhruva’s dad', role: 'Rookie Rackets parent' },
  { quote: 'Darsh liked participating in Rookie Rackets camp. He said he practiced very well during camp. He always looked forward to coming to camp every day. Happy to say we loved it.', name: 'Megh Gali', role: 'Rookie Rackets parent' },
  { quote: 'Aathira liked the activities and schedule. She also liked the games.', name: 'Aathira’s family', role: 'Rookie Rackets family' },
  { quote: 'My daughter participated in the Rookie Rackets camp, and it was a very good refresher for her as it had been a significant time since she played. She is back in form, and we are really happy with the camp.', name: 'Anil', role: 'Rookie Rackets parent' },
  { quote: 'My son joined his first camp for badminton with Rookie Rackets. He is a basic player, but after the camp I see a very great improvement in all kinds of shots. Above all, the coaches were great; he was looking forward to every day.', name: 'Vijay Kannappan', role: 'Rookie Rackets parent' },
  { quote: 'My son liked it so much. We want to continue.', name: 'Kamal', role: 'Rookie Rackets parent' },
  { quote: 'We had a great one-week summer camp for kids on the autism spectrum through our collaborative efforts between R Journey and Rookie Rackets. Looking forward to future collaboration over the years.', name: 'R Journey team', role: 'Community partner · August 2026' },
];

export default function Home() {
  return <main className="home-page">
    <SiteHeader active="/" />

    <section className="home-hero" data-reveal>
      <div className="home-hero-copy hero-copy-contrast">
        <h1>Rookie Rackets</h1>
        <p className="hero-kicker">Where Birdies Take Flight</p>
        <p className="hero-description"><strong>Making badminton accessible across the triangle!!</strong><br />Free badminton workshops for all ages.<br />No experience or equipment needed.</p>
        <div className="actions"><Link className="button home-button-primary" href="/contact">Join Waitlist →</Link><Link className="button home-button-secondary" href="/events">View Events</Link></div>
        <p className="trust-line">Coached by nationally trained players in Triangle, NC.</p>
      </div>
      <HeroCarousel slides={homepageHeroSlides} />
    </section>

    <section className="benefit-strip" aria-label="Program benefits" data-reveal>
      {[['♢','Free Workshops'],['♧','All Ages'],['⌕','Equipment Included'],['⌁','Expert Coaching'],['♡','Beginners Welcome']].map(([icon,label]) => <span key={label}><i aria-hidden="true">{icon}</i>{label}</span>)}
    </section>

    <section className="home-impact shell" data-reveal>
      <p className="eyebrow">Community impact</p><h2>What we’ve done so far</h2>
      <div className="impact-primary">
        <div><strong><CountUp end={100} />+</strong><span>Introduced to Badminton</span></div>
        <div><strong><CountUp end={8} />+</strong><span>Events — workshops, camps &amp; awareness booths</span></div>
        <div className="impact-people" aria-hidden="true"><span>○</span><span>○</span><span>○</span></div>
        <p>Welcoming beginners, kids with special needs, and underserved students across the Triangle.</p>
      </div>
      <div className="impact-secondary">
        <div><strong><CountUp end={7} />+</strong><span>Partnered with schools &amp; organizations in the Triangle</span></div>
        <div><strong><CountUp end={2} />+</strong><span>Years of operations</span></div>
        <div><strong><CountUp end={100} />%</strong><span>Free all-inclusive workshops</span></div>
        <div><strong><CountUp end={60} />+</strong><span>Combined tournament wins</span></div>
      </div>
    </section>

    <section className="home-gallery shell" data-reveal>
      <div className="home-section-title"><h2>Badminton in action</h2><p>Workshops, camps, and community events.</p></div>
      <div className="approved-mosaic">{photos.slice(0,5).map((photo,index)=><figure className={index===0?'feature':''} key={photo.src}><img src={photo.src} alt={photo.alt}/><figcaption>{photo.caption}</figcaption></figure>)}</div>
      <div className="gallery-action"><GalleryLightbox photos={photos}/><span>{photos.length} moments from our community.</span></div>
    </section>

    <section className="home-testimonials" data-reveal><div className="shell"><div className="home-section-title testimonial-heading"><h2>What people are saying</h2><span>Families &amp; school partners</span></div><div className="approved-testimonial"><img src="/images/indoor-coaching-session.webp" alt="A coach helping a young badminton player"/><Testimonials quotes={quotes}/></div></div></section>

    <section className="home-network shell" data-reveal>
      <div className="network-map" role="img" aria-label="Rookie Rackets partner network">
        <span className="network-core">Rookie<br/>Rackets</span>
        <span className="network-bubble network-carpenter">Carpenter Elementary</span>
        <span className="network-bubble network-tmsa">TMSA Elementary</span>
        <span className="network-bubble network-vibha">Vibha</span>
        <span className="network-bubble network-anurag">Anurag Foundation</span>
        <span className="network-bubble network-boys-club">Raleigh Boys Club</span>
        <span className="network-bubble network-rjourney">RJourney</span>
        <span className="network-bubble network-peak">Peak Sports</span>
      </div>
      <div><h2>Our growing network</h2><p>We work with schools, nonprofit organizations, groups serving neurodivergent kids and underserved populations, sports facilities, and community events across the Triangle.</p><Link className="text-link" href="/contact">Work with us →</Link></div>
    </section>

    <section className="home-cta" data-reveal><div className="shell"><div><p className="eyebrow">Get started</p><h2>Ready to pick up<br/>a racket?</h2><span>Join the waitlist for upcoming sessions.</span></div><Link className="button home-button-primary" href="/contact">Sign Up →</Link><Link className="text-link" href="/faq">Read the FAQ</Link></div></section>
    <SiteFooter />
  </main>;
}
