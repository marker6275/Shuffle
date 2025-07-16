'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Currently Playing', href: '/dashboard' },
    { name: 'Skipped Songs', href: '/recommended' },
    { name: 'RecommendedSongs', href: '/skipped' },
  ];

  return (
    <nav className="w-full bg-green-500 shadow-md">
      <div className="mx-8 px-4">
        <ul className="flex space-x-4 h-14 items-center">
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
      </div>
    </nav>
  );
} 