import type { Metadata } from 'next';
import PageTransition from './components/PageTransition';
import './globals.css';
import './readability.css';

export const metadata: Metadata = {
  title: 'EEz · UM Electrical Engineering Study Portal',
  description: 'A free, organized library of UM electrical engineering study resources for Semester 1 and Semester 2.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><PageTransition>{children}</PageTransition></body>
    </html>
  );
}
