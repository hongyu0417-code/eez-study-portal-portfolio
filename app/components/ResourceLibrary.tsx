import { Arrow } from './SiteChrome';
import Reveal from './Reveal';
import type { Subject } from '../data';

type ResourceLibraryProps = {
  subjects: Subject[];
  yearLabel: string;
  heading: string;
  headingAccent: string;
  intro: string;
};

export default function ResourceLibrary({ subjects, yearLabel, heading, headingAccent, intro }: ResourceLibraryProps) {
  return (
    <section className="resource-library container">
      <Reveal className="library-intro-reveal"><div className="library-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> {yearLabel}</div><h2>{heading} <span>{headingAccent}</span></h2></div><p>{intro}</p></div></Reveal>
      <div className="resource-subject-list">
        {subjects.map((subject, subjectIndex) => (
          <Reveal className="resource-subject-reveal" key={subject.id} delay={0.04 * subjectIndex}>
            <article id={subject.id} className={`resource-subject resource-${subject.color}`}>
            <div className="resource-subject-head"><div className="subject-heading-mark"><span className="subject-icon">{subject.icon}</span><div><span className="subject-meta">{subject.code}</span><h3>{subject.name}</h3></div></div><a className="folder-link" href={subject.folderUrl} target="_blank" rel="noreferrer">Full subject Drive <Arrow /></a></div>
            <p className="resource-description">{subject.description}</p>
            <Reveal className="advice-card-reveal" delay={0.02}>
              <details className="advice-card" open>
                <summary><span className="advice-label">How to study this subject</span><span className="accordion-plus">＋</span></summary>
                <div className="advice-body"><p>{subject.advice.summary}</p><ul>{subject.advice.points.map((point) => <li key={point}>{point}</li>)}</ul><a href={subject.advice.sourceUrl} target="_blank" rel="noreferrer">Read the study tips <Arrow /></a></div>
              </details>
            </Reveal>
            <div className="resource-accordions">
              {subject.groups.map((group, index) => (
                <Reveal className="resource-accordion-reveal" key={group.label} delay={0.03 * index}>
                  <details className="resource-accordion" open={index === 0}>
                  <summary><span className="accordion-title"><span className="accordion-icon">{group.icon}</span><span><b>{group.label}</b><small>{group.description}</small></span></span><span className="accordion-plus">＋</span></summary>
                  <div className="resource-file-grid">
                    {group.links.map((item) => <a className="resource-file" href={item.url} target="_blank" rel="noreferrer" key={item.label}><span className="file-arrow">↗</span><span><b>{item.label}</b><small>{item.detail}</small></span></a>)}
                  </div>
                  </details>
                </Reveal>
              ))}
            </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
