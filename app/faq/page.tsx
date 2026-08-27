import Link from 'next/link';
import { FaqAccordion } from '../../components/site-interactions';
import { SiteFooter, SiteHeader } from '../../components/site-shell';

const items=[
  {question:'Who can attend Rookie Rackets workshops?',answer:'Workshops are open to everyone, regardless of age or skill level. First-time players and experienced participants are all welcome.'},
  {question:'How much does it cost?',answer:'Nothing. Rookie Rackets is a nonprofit created to remove barriers to badminton, so every workshop is free.'},
  {question:'Do participants need to bring their own equipment?',answer:'No. We provide rackets, birdies, and nets. Just wear athletic shoes and comfortable clothes, and bring water.'},
  {question:'Where are workshops held?',answer:'We work with schools and community partners around Cary, North Carolina 27519. The exact location is shared with registered participants.'},
  {question:'How long is each workshop?',answer:'Most workshops run between one and two hours, depending on the program and age group.'},
  {question:'How do I find out about upcoming sessions?',answer:'Join the list on our contact page and we will email you as soon as dates and registration become available.'},
  {question:'How experienced are the coaches?',answer:'Our volunteer team has more than 20 years of combined training. Our program is shaped by Coach Hendry, a 2023–24 U.S. National Head Coach with six years of beginner coaching experience.'},
  {question:'Is there a limit on how many times a child can attend?',answer:'There is no attendance limit. Individual sessions may have a capacity limit so every participant gets enough coaching time.'},
];

export default function Faq(){return <main className="faq-page"><SiteHeader active="/faq"/><section className="faq-hero shell" data-reveal><p className="eyebrow">Questions &amp; Answers</p><h1>Frequently Asked Questions</h1><p>Everything you need to know before your first session.</p></section><section className="faq-facts" data-reveal><div className="shell"><span>All ages</span><b>•</b><span>Always free</span><b>•</b><span>Equipment provided</span><b>•</b><span>1–2 hour sessions</span></div></section><section className="faq-common shell" data-reveal><h2>Common questions</h2><FaqAccordion items={items}/></section><section className="faq-actions" data-reveal><div className="shell"><div><h2>Still have questions?</h2><p>We’re happy to help.</p><a className="under-link" href="mailto:teamrookierackets@gmail.com">Contact us →</a></div><div><h2>Ready to play?</h2><p>Get notified when new sessions open.</p><Link className="button" href="/contact">Sign Up →</Link></div></div></section><SiteFooter/></main>}
