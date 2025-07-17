'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { name: 'Currently Playing', href: '/dashboard' },
    { name: 'Skipped Songs', href: '/recommended' },
    { name: 'Recommended Songs', href: '/skipped' },
  ];

  return (
    <nav className="w-full bg-green-500 shadow-md">
      <div className="mx-8 px-4 py-8 flex items-center justify-between h-14">
        {/* Desktop Nav */}
        <ul className="hidden md:flex space-x-4 h-14 items-center">
          {tabs.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200
                  ${pathname === tab.href
                    ? 'bg-white text-green-600 shadow'
                    : 'text-white hover:bg-green-600 hover:text-white'}`}
              >
                {tab.name}
              </Link>
            </li>
          ))}
        </ul>
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center h-14">
          <button
            aria-label="Open menu"
            className="text-white focus:outline-none focus:ring-2 focus:ring-white p-2"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {/* Hamburger icon */}
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute top-14 left-0 w-full bg-green-500 shadow-md z-50 animate-fade-in">
              <ul className="flex flex-col py-2">
                {tabs.map((tab) => (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className={`block px-6 py-3 font-medium transition-colors duration-200
                        ${pathname === tab.href
                          ? 'bg-white text-green-600 shadow'
                          : 'text-white hover:bg-green-600 hover:text-white'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {tab.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 