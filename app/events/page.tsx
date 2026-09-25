import Link from 'next/link';
import { DynamicPublicPrograms } from '../../components/public/dynamic-programs';
import { GalleryLightbox } from '../../components/site-interactions';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { getPublicPrograms } from '../../lib/data/public-programs';
import { photos } from '../../lib/site-photos';

export const dynamic = 'force-dynamic';

export default async function Events() {
  let programs = [] as Awaited<ReturnType<typeof getPublicPrograms>>;
  let unavailable = false;
  try { programs = await getPublicPrograms(); } catch { unavailable = true; }
  return <main className="events-page"><SiteHeader active="/events" /><section className="events-hero shell" data-reveal><p className="eyebrow">Triangle, NC programs</p><h1>Ongoing &amp; Upcoming Programs</h1><p>Free, inclusive badminton programs delivered with schools and community partners. Participation in partner workshops is coordinated by each host organization; public sign-up is available only for Rookie Rackets-hosted camps.</p><Link className="under-link" href="/contact">Ask about a program →</Link></section>{unavailable ? <section className="shell section"><div className="service-state" role="alert"><h2>Programs are temporarily unavailable</h2><p>Please refresh in a moment or contact the Rookie Rackets team.</p></div></section> : <DynamicPublicPrograms programs={programs} />}<section className="events-gallery shell" data-reveal><div className="home-section-title"><h2>From our sessions</h2><p>What happens when every partner community shows up ready to play.</p></div><div className="event-approved-mosaic"><figure><img src={photos[0].src} alt={photos[0].alt}/><figcaption>{photos[0].caption}</figcaption></figure><div>{photos.slice(1,3).map((photo) => <figure key={photo.src}><img src={photo.src} alt={photo.alt}/><figcaption>{photo.caption}</figcaption></figure>)}</div></div><GalleryLightbox photos={photos}/></section><section className="before-arrive" data-reveal><div className="shell"><h2>Before you arrive</h2><div><span><b>Duration</b>1–2 hours</span><span><b>Location</b>Triangle, NC</span><span><b>Bring</b>Athletic non-marking shoes</span><span><b>We provide</b>Rackets and equipment</span></div><p>Each program is planned for the participants served by its host organization. Beginners are always welcome within those groups.</p></div></section><SiteFooter /></main>;
}
