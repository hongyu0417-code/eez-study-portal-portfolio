import { subjects } from '../data';
import Reveal from '../components/Reveal';
import { Arrow, SiteFooter, SiteHeader } from '../components/SiteChrome';
import ResourceLibrary from '../components/ResourceLibrary';

export default function ResourcesPage() {
  return (
    <main>
      <SiteHeader active="resources" />
      <Reveal className="page-hero-reveal"><section className="page-hero container">
        <div className="eyebrow"><span className="eyebrow-line" /> The resource library</div>
        <h1>Open the right file<br /><span>in seconds.</span></h1>
        <p>Four Semester 1 core courses, organized by subject and resource type. Open each lecture note, paper, tutorial, or folder directly.</p>
        <div className="page-hero-actions"><a className="button button-dark" href="/study-hub">Go to study hub <Arrow /></a><span>Lecture notes · past papers · tutorials · more</span></div>
      </section></Reveal>
      <ResourceLibrary subjects={subjects} yearLabel="Semester 1" heading="Core courses," headingAccent="sorted." intro="Tap a week or file to open the exact Drive document. Use Additional materials when you want the full subject folder." />
      <SiteFooter />
    </main>
  );
}
