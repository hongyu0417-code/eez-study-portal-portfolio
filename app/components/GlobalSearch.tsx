'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchEntries } from '../search-index';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchEntries.slice(0, 7);
    return searchEntries
      .filter((entry) => `${entry.title} ${entry.description} ${entry.category}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button className="nav-search" type="button" aria-label="Open global search" onClick={() => setOpen(true)}>
        <span aria-hidden="true">⌕</span>
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="search-backdrop" role="presentation" onMouseDown={close}>
          <section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search EEz" onMouseDown={(event) => event.stopPropagation()}>
            <div className="search-dialog-top">
              <span className="search-dialog-kicker">Search EEz</span>
              <button className="plain-button" type="button" onClick={close}>Close <span aria-hidden="true">Esc</span></button>
            </div>
            <label className="search-input-wrap">
              <span aria-hidden="true">⌕</span>
              <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, resources, or tools..." aria-label="Search EEz" />
            </label>
            <div className="search-results" aria-live="polite">
              {results.length ? results.map((entry) => (
                <Link className="search-result" href={entry.href} key={`${entry.category}-${entry.title}`} onClick={close}>
                  <span className="search-result-icon" aria-hidden="true">↗</span>
                  <span><small>{entry.category}</small><strong>{entry.title}</strong><em>{entry.description}</em></span>
                </Link>
              )) : <p className="search-empty">No matching course, resource, or tool yet.</p>}
            </div>
            <p className="search-dialog-hint">Tip: press <kbd>⌘K</kbd> or <kbd>Ctrl K</kbd> anytime to search.</p>
          </section>
        </div>
      )}
    </>
  );
}
