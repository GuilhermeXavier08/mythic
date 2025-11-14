'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SettingsNav.module.css';

const navItems = [
  { href: '/settings', label: 'Conta' },
  { href: '/settings/profile', label: 'Perfil' },
  { href: '/settings/security', label: 'Segurança' },
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className={pathname === item.href ? styles.activeLink : styles.link}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
