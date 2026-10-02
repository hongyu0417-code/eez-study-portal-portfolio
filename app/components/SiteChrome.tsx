import Image from 'next/image';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';

export function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

export function SiteHeader({ active }: { active?: 'home' | 'resources' | 'resources-s2' | 'study-hub' | 'ai-library' }) {
  return (
    <>
      <header className="nav container">
        <Link className="brand" href="/" aria-label="EEz home"><span className="brand-mark">⚡︎</span><span>EE<span className="brand-accent">z</span></span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          {/* The public static build uses a full navigation here so the Home control always works after page transitions. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className={active === 'home' ? 'active' : ''} href="/">Home</a>
          <a className={active === 'resources' ? 'active' : ''} href="/resources/year-1">S1 resources</a>
          <a className={active === 'resources-s2' ? 'active' : ''} href="/resources/year-2">S2 resources</a>
          <a className={active === 'study-hub' ? 'active' : ''} href="/study-hub">Study hub</a>
          <a className={active === 'ai-library' ? 'active' : ''} href="/ai-library">AI library</a>
        </nav>
        <GlobalSearch />
        <a className="nav-cta" href="https://drive.google.com/drive/folders/1YPJz4-7eti_-8uZo7OwZdIvmXqqau3qu" target="_blank" rel="noreferrer">Open Drive <Arrow /></a>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="creator-profile">
          <div className="profile-photo profile-photo--initials" aria-hidden="true">HY</div>
          <div className="creator-block">
            <strong>EEz</strong>
            <span>Created by Khor Hong Yu</span>
        <div className="creator-links">
          <a href="https://instagram.com/hongyu814__" target="_blank" rel="noreferrer">Instagram · hongyu814__</a>
          <a href="https://www.tiktok.com/@hongyu814__" target="_blank" rel="noreferrer">TikTok · hongyu814__</a>
        </div>
          </div>
        </div>
        <div className="um-brand">
          <Image src="/um-faculty-engineering.png" width={76} height={76} alt="Universiti Malaya Faculty of Engineering" />
          <span>Semester 1 + Semester 2<br />Core course libraries</span>
        </div>
      </div>
      <div className="container footer-bottom"><span>© 2026 EEz · Free student-made study portal</span><span>Not an official UM website</span></div>
    </footer>
  );
}
