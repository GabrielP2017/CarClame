"use client";

import Link from "next/link";

const navLinks = [
  { label: "자동분석", href: "/analysis" },
  { label: "저장된 PDF", href: "/saved-pdf" },
  { label: "도움말", href: "/help" },
  { label: "About", href: "/about" },
];

export default function Header() {
  return (
    <header className="nav__header">
      <Link href="/" className="nav__logo">
        <span className="brand">CarClame</span>
      </Link>
      <nav className="nav__links">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
