import Link from 'next/link';
import { CountUp, HeroCarousel } from '../components/motion';
import { GalleryLightbox, Testimonials } from '../components/site-interactions';
import { SiteFooter, SiteHeader } from '../components/site-shell';

const photos = [
  { src: '/images/story.webp', alt: 'Rookie Rackets coaches leading a school workshop', caption: 'Carpenter Elementary' },
  { src: '/images/coaching.webp', alt: 'A coach helping students learn racket control', caption: 'Beginner coaching' },
  { src: '/images/gallery-action-1.webp', alt: 'Young players practicing over a badminton net', caption: 'Learning at the net' },
  { src: '/images/gallery-action-2.webp', alt: 'A coach helping a first-time player', caption: 'One-on-one guidance' },
  { src: '/images/gallery-certificates.webp', alt: 'Students holding workshop certificates', caption: 'TMSA Elementary' },
  { src: '/images/gallery-outreach.webp', alt: 'Rookie Rackets at a community outreach event', caption: 'Community outreach' },
  { src: '/images/photo-7320.webp', alt: 'Rookie Rackets photo 7320', caption: 'Community snapshot' },
  { src: '/images/photo-7937.webp', alt: 'Rookie Rackets photo 7937', caption: 'Community snapshot' },
  { src: '/images/photo-7953.webp', alt: 'Rookie Rackets photo 7953', caption: 'Community snapshot' },
  { src: '/images/photo-7956.webp', alt: 'Rookie Rackets photo 7956', caption: 'Community snapshot' },
  { src: '/images/photo-8786.webp', alt: 'Rookie Rackets photo 8786', caption: 'TMSA workshop practice' },
  { src: '/images/photo-8787.webp', alt: 'Rookie Rackets photo 8787', caption: 'Learning at the net' },
  { src: '/images/photo-8789.webp', alt: 'Rookie Rackets photo 8789', caption: 'Workshop certificates' },
  { src: '/images/photo-8790.webp', alt: 'Rookie Rackets photo 8790', caption: 'TMSA workshop group' },
  { src: '/images/photo-collage-1.webp', alt: 'Rookie Rackets photo collage one', caption: 'TMSA workshop highlights' },
  { src: '/images/photo-collage-2.webp', alt: 'Rookie Rackets photo collage two', caption: 'TMSA workshop highlights' },
  { src: '/images/photo-collage-3.webp', alt: 'Rookie Rackets photo collage three', caption: 'TMSA workshop highlights' },
];

const quotes = [
  { quote: 'I was impressed by their maturity, organization, and professionalism.', name: 'Kim Collins', role: 'Principal, Carpenter Elementary' },
  { quote: 'The high school students came prepared, stayed committed, and did a wonderful job engaging with our students.', name: 'Zeliha Celiker', role: 'Assistant Principal, TMSA Elementary' },
  { quote: 'Darsh always looked forward to coming to camp every day. We loved it.', name: 'Megh Gali', role: 'Rookie Rackets parent' },
  { quote: 'Dhruva liked the camp so much. He loves to continue playing — great camp!', name: 'Kamalakannan Babuji', role: 'Rookie Rackets parent' },
  { quote: 'She liked the activities, the schedule, and especially the games.', name: 'Shanmuga Balasubrama', role: 'Rookie Rackets parent' },
];

export default function Home() {
  return <main className="home-page">
    <SiteHeader active="/" />

    <section className="home-hero" data-reveal>
      <div className="home-hero-copy hero-copy-panel">
        <h1>Rookie Rackets</h1>
        <p className="hero-kicker">Where Birdies Take Flight</p>
        <p className="hero-description">Free badminton workshops for all ages.<br />No experience or equipment needed.</p>
        <div className="actions"><Link className="button home-button-primary" href="/contact">Join Waitlist →</Link><Link className="button home-button-secondary" href="/events">View Events</Link></div>
        <p className="trust-line">Coached by nationally trained players in NC.</p>
      </div>
      <HeroCarousel slides={photos.slice(0, 4)} />
    </section>

    <section className="benefit-strip" aria-label="Program benefits" data-reveal>
      {[['♢','Free Workshops'],['♧','All Ages'],['⌕','Equipment Included'],['⌁','Expert Coaching'],['♡','Beginners Welcome']].map(([icon,label]) => <span key={label}><i aria-hidden="true">{icon}</i>{label}</span>)}
    </section>

    <section className="home-impact shell" data-reveal>
      <p className="eyebrow">Community impact</p><h2>What we’ve done so far</h2>
      <div className="impact-primary">
        <div><strong><CountUp end={40} /></strong><span>Students trained</span></div>
        <div><strong><CountUp end={6} /></strong><span>Workshops &amp; camps</span></div>
        <div className="impact-people" aria-hidden="true"><span>○</span><span>○</span><span>○</span></div>
        <p>Supporting beginners, kids with special needs, and underserved students.</p>
      </div>
      <div className="impact-secondary">
        <div><strong><CountUp end={20} />+</strong><span>Years training</span></div>
        <div><strong><CountUp end={60} />+</strong><span>Tournaments won</span></div>
        <div><strong><CountUp end={6} />+</strong><span>Years coaching</span></div>
        <div><strong><CountUp end={100} />%</strong><span>Free</span></div>
      </div>
    </section>

    <section className="home-gallery shell" data-reveal>
      <div className="home-section-title"><h2>Badminton in action</h2><p>Workshops, camps, and community events.</p></div>
      <div className="approved-mosaic">{photos.slice(0,5).map((photo,index)=><figure className={index===0?'feature':''} key={photo.src}><img src={photo.src} alt={photo.alt}/><figcaption>{photo.caption}</figcaption></figure>)}</div>
      <div className="gallery-action"><GalleryLightbox photos={photos}/><span>17 moments from our community.</span></div>
    </section>

    <section className="home-coaching shell" data-reveal>
      <h2>Coaching for all ages in NC.</h2><p>Structured sessions led by competitively trained coaches.</p>
      <div className="coaching-benefits"><div><i aria-hidden="true">⌁</i><strong>Skill Development</strong><span>Beginner to advanced.</span></div><div><i aria-hidden="true">◯</i><strong>Inclusive Community</strong><span>Everyone belongs.</span></div><div><i aria-hidden="true">◇</i><strong>Always Free</strong><span>Equipment included.</span></div></div>
    </section>

    <section className="home-testimonials" data-reveal><div className="shell"><div className="home-section-title testimonial-heading"><h2>What people are saying</h2><span>Families &amp; school partners</span></div><div className="approved-testimonial"><img src="/images/story.webp" alt="A coach speaking with young badminton players"/><Testimonials quotes={quotes}/></div></div></section>

    <section className="home-network shell" data-reveal><img src="/images/gallery-outreach.webp" alt="Rookie Rackets volunteers with a community partner"/><div><h2>Our growing network</h2><p>Bringing badminton to schools and communities across the Triangle.</p><div className="network-names"><span>Carpenter Elementary</span><span>TMSA Elementary</span><span>Summer Camps</span><span>Community Events</span></div><Link className="text-link" href="/contact">Work with us →</Link></div></section>

    <section className="home-cta" data-reveal><div className="shell"><div><p className="eyebrow">Get started</p><h2>Ready to pick up<br/>a racket?</h2><span>Join the waitlist for upcoming sessions.</span></div><Link className="button home-button-primary" href="/contact">Sign Up →</Link><Link className="text-link" href="/faq">Read the FAQ</Link></div></section>
    <SiteFooter />
  </main>;
}
