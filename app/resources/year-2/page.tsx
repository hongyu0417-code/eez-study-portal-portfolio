import { year2Subjects } from '../../data';
import Reveal from '../../components/Reveal';
import { Arrow, SiteFooter, SiteHeader } from '../../components/SiteChrome';
import ResourceLibrary from '../../components/ResourceLibrary';

export default function Year2ResourcesPage() {
  return (
    <main>
      <SiteHeader active="resources-s2" />
      <Reveal className="page-hero-reveal"><section className="page-hero container">
        <div className="eyebrow"><span className="eyebrow-line" /> The resource library</div>
        <h1>Semester 2 resources<br /><span>in one place.</span></h1>
        <p>Five Semester 2 subjects with direct links to lecture notes, past papers, tutorials, practical examples, and full subject folders.</p>
        <div className="page-hero-actions"><a className="button button-dark" href="/study-hub">Go to study hub <Arrow /></a><span>Lecture notes · past papers · tutorials · lab files</span></div>
      </section></Reveal>
      <ResourceLibrary subjects={year2Subjects} yearLabel="Semester 2" heading="Five subjects," headingAccent="sorted." intro="Open the exact file you need, or use Additional materials to open the complete subject Drive." />
      <SiteFooter />
    </main>
  );
}
