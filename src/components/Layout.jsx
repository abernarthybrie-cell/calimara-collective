import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SettingsProvider, CartProvider, useCart } from '@/lib/calimara';
import SiteNav from './SiteNav';
import Footer from './Footer';
import Drawer from './Drawer';
import SearchOverlay from './SearchOverlay';
import MadeOfScarsGlyphs from './MadeOfScarsGlyphs';

function DrawerTrigger({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open the Drawer — random archive fragment"
      className="fixed bottom-5 right-5 z-30 group flex items-center gap-2 bg-burgundy text-paper pl-3 pr-4 py-2.5 shadow-lg hover:bg-ink transition-colors focus-ring"
      style={{ transform: 'rotate(-1.5deg)' }}
    >
      <span className="w-2.5 h-2.5 rounded-full bg-dusty-yellow group-hover:scale-125 transition-transform" />
      <span className="label-mono">OPEN THE DRAWER</span>
    </button>
  );
}

function CartPip() {
  const { count } = useCart();
  const loc = useLocation();
  if (!count || loc.pathname === '/shop') return null;
  return (
    <a href="/shop" className="fixed bottom-5 left-5 z-30 bg-paper border border-ink/20 px-3 py-2 shadow-md label-mono text-ink hover:bg-paper-deep focus-ring" style={{ transform: 'rotate(1.5deg)' }}>
      🧾 RECEIPT · {count}
    </a>
  );
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SettingsProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <MadeOfScarsGlyphs />
          <SiteNav onOpenSearch={() => setSearchOpen(true)} onOpenDrawer={() => setDrawerOpen(true)} />
          <main className="flex-1">
            <Outlet context={{ openDrawer: () => setDrawerOpen(true), openSearch: () => setSearchOpen(true) }} />
          </main>
          <Footer />
          <DrawerTrigger onClick={() => setDrawerOpen(true)} />
          <CartPip />
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      </CartProvider>
    </SettingsProvider>
  );
}