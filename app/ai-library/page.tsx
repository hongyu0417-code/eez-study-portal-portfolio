'use client';
import { useState } from 'react';
import Reveal from '../components/Reveal';
import { Arrow, SiteFooter, SiteHeader } from '../components/SiteChrome';

const prompts = [
  { label: 'Chapter overview', title: 'Turn a chapter into an exam map', intro: 'Upload the entire PDF of one chapter, paste this prompt, and ask AI to show you what matters most.', example: 'Example: Upload “Chapter 3 — AC Circuits.pdf” → paste the prompt → revise the ranked concepts, formulas, and two-hour plan.', prompt: `You are my exam-focused tutor. I am studying this chapter for examination purposes, not for complete academic mastery. Apply the 80/20 rule strictly.\\n\\nAfter reading my lecture slides, provide:\\n1. Chapter Overview — What is this chapter about and why is it important?\\n2. Big Picture — Explain it in simple language. If you had only 2 minutes before an exam, what would you say?\\n3. Exam Weight Analysis — Which 20% of concepts are likely to contribute to 80% of exam marks? Rank them highest to lowest priority.\\n4. Important Formulas — List all formulas and highlight the ones most likely to appear in calculations.\\n5. Common Question Types — Separate theory questions and calculation questions.\\n6. Study Strategy — If I only have 2 hours, how should I allocate my time?\\n\\nKeep explanations concise and exam-oriented. Think like an examiner. Reduce emphasis on low-probability information and maximize marks per minute of study time.` },
  { label: 'Slide distiller', title: 'Understand one difficult slide', intro: 'Use this for a dense slide, diagram, or formula you cannot explain in your own words. Attach the slide image or the PDF page.', example: 'Example: Attach the slide showing a Karnaugh map → paste the prompt → ask a follow-up: “Now give me one fresh practice question.”', prompt: `Act as an exam-focused engineering professor. Continuously prioritize information according to the 80/20 rule to maximize my marks per minute of study.\\n\\nProcess the attached lecture slide using this structure:\\n1. The Simple Concept — Explain what this slide is about in 1–2 simple sentences.\\n2. The Details — Explain the specifics concisely in short, punchy bullet points highlighting key mechanisms or principles.\\n3. Examiner's Summary — If it is theory, give the keywords, conditions, and definitions I must memorize. If it is calculation, give the exact formulas, what each variable means, and any constants to remember.\\n\\nKeep the output concise, zero-fluff, and purely exam-oriented.` },
  { label: 'Example deconstructor', title: 'Learn the method, not just the answer', intro: 'Attach an example question together with its solution. This is useful for Circuit Analysis, Mathematics, and Digital System.', example: 'Example: Upload a nodal-analysis question and the lecturer’s solution → paste the prompt → use the “Traps & Takeaways” to solve a new question without looking.', prompt: `I am studying for an electrical engineering exam. Here is an example question and its solution from my lecture slides.\\n\\nAct as an expert exam tutor. Break it down using this strict structure:\\n1. Topic & Question Archetype — Identify the exact topic and question type.\\n2. The Formula Arsenal — List the core formulas, equations, and constants. Define variables quickly.\\n3. Step-by-Step Walkthrough — Explain the logic and why each step is taken, not just the arithmetic.\\n4. Traps & Takeaways — Identify sign errors, unit conversions, hidden assumptions, and common examiner traps.\\n\\nKeep it focused on a repeatable method I can use on a new question.` },
  { label: 'Weekly cheat sheet', title: 'Create a high-yield revision sheet', intro: 'Upload the week’s lecture materials and worked examples to make one compact sheet for fast revision.', example: 'Example: Upload Week 6 notes + tutorial solutions → paste the prompt → turn the output into your last 15-minute checklist before practice.', prompt: `Analyze the uploaded lecture materials for this week and act as an expert engineering examiner. Generate an exam-focused master cheat sheet using this structure:\\n\\n1. The Weekly Overview — Give a simple big-picture summary so I can instantly orient myself later.\\n2. The 80/20 Triage — Separate Theory and Calculations. For each, rank High-Yield (the core 20%: must-know formulas, constants, and principles) and Low-Yield (secondary concepts, kept brief).\\n3. Problem-Solving Frameworks — Scan the worked examples and identify the distinct calculation question types. For each, give a start-to-finish execution plan with formulas.\\n4. Examiner Traps & Common Mistakes — List the top unit, sign, conceptual, and assumption errors.\\n\\nPrioritize marks per minute. Skip deep proofs and historical context unless they are likely to be examined.` },
];

export default function AiLibraryPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const copyPrompt = async (label: string, prompt: string) => { try { await navigator.clipboard.writeText(prompt); setCopied(label); window.setTimeout(() => setCopied(null), 1800); } catch { setCopied(null); } };
  return (
    <main className="prompt-page">
      <SiteHeader active="ai-library" />
      <section className="page-hero container prompt-hero">
        <Reveal className="prompt-hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> Exam-focused AI help</div>
          <h1>Better prompts.<br /><span>Better revision.</span></h1>
          <p>Use these prompts with ChatGPT, Gemini, NotebookLM, or another AI tool. Upload your own lecture material first, then use the output as a revision guide, not a replacement for checking your notes.</p>
        </Reveal>
        <Reveal className="prompt-walkthrough glass-surface" delay={0.08}>
          <div className="prompt-walkthrough-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> Watch the workflow</div>
            <h2>Copy it. Upload it.<br /><span>Revise with purpose.</span></h2>
            <p>See how to attach a chapter or slide, paste the right prompt, and turn the response into a focused revision guide.</p>
          </div>
          <div className="prompt-walkthrough-actions">
            <div className="prompt-how"><span>01</span><b>Copy a prompt</b><i>→</i><span>02</span><b>Attach your file</b><i>→</i><span>03</span><b>Revise the output</b></div>
            <a className="video-link" href="https://www.instagram.com/reel/DZtgLGKJjaK/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==" target="_blank" rel="noreferrer">Watch the prompt walkthrough on Instagram <Arrow /></a>
          </div>
        </Reveal>
      </section>
      <section className="prompt-list container">
        <Reveal className="prompt-list-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> The AI library</div><h2>Choose your <span>study hack.</span></h2></div><p>Every card includes a real workflow so juniors know when to use the prompt and what to upload.</p></Reveal>
        <div className="prompt-grid">{prompts.map((item, index) => <Reveal className="prompt-card-reveal" key={item.label} delay={0.04 * index}><article className="prompt-card"><div className="prompt-card-top"><span className="prompt-number">0{index + 1}</span><span className="prompt-label">{item.label}</span></div><h3>{item.title}</h3><p>{item.intro}</p><div className="prompt-example"><span>How to use it</span><p>{item.example}</p></div><details><summary>Preview prompt <span>＋</span></summary><pre>{item.prompt}</pre></details><button className="button button-dark copy-button" type="button" onClick={() => copyPrompt(item.label, item.prompt)}>{copied === item.label ? 'Copied to clipboard ✓' : 'Copy full prompt'} <Arrow /></button></article></Reveal>)}</div>
      </section>
      <Reveal className="prompt-note container glass-surface"><div><strong>Use AI as a tutor, not an answer machine.</strong><p>Check formulas against your lecture notes, try the question yourself before reading the solution, and ask follow-up questions when an explanation is unclear.</p></div><a className="button button-light" href="/resources">Open resources <Arrow /></a></Reveal>
      <SiteFooter />
    </main>
  );
}
