import React, { useEffect, useState } from 'react';
import { Plus, Minus, Trash2, X, ShoppingBag } from 'lucide-react';
import { db } from '@/api/client';
import { useCart, formatPrice } from '@/lib/calimara';
import ScanImage from '@/components/ScanImage';
import Stamp from '@/components/Stamp';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    db.entities.Product.list(200).then(setProducts).finally(() => setLoading(false));
  }, []);

  const available = products.filter((p) => p.available && p.inventory !== 0);

  return (
    <div className="pt-14 sm:pt-16">
      <section className="bg-archive-bg text-archive-fg grain pt-14 pb-10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="label-mono text-dusty-yellow mb-3">— THE PRINT STUDIO —</p>
          <h1 className="font-heading text-6xl md:text-8xl">Shop</h1>
          <p className="font-heading italic text-xl md:text-2xl text-archive-fg/70 mt-4 max-w-xl">
            Print, paper, and small objects. Made in Bucharest, sent by mail.
          </p>
        </div>
      </section>

      <section className="py-12 bg-paper grain-light">
        <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
          {loading && <p className="label-mono text-ink-soft">arranging the objects…</p>}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={() => { add(p); setCartOpen(true); }} />
            ))}
          </div>
          {!loading && products.length === 0 && <p className="font-hand text-2xl text-ink-soft">No objects catalogued yet.</p>}
        </div>
      </section>

      {/* snail mail club */}
      <section className="py-16 bg-paper-deep grain">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <Stamp className="text-cyanotype">COMING SOON</Stamp>
          <h2 className="font-heading text-5xl md:text-7xl mt-5">The Snail Mail Club</h2>
          <p className="font-heading italic text-xl text-ink-soft mt-4 max-w-xl mx-auto">
            A future subscription: postcards, letters, poems, prints and small handmade objects, arriving by mail between issues.
          </p>
          <p className="font-hand text-2xl text-burgundy mt-5">We'll let you know when it opens.</p>
        </div>
      </section>

      {/* floating receipt cart */}
      <CartReceipt open={cartOpen} onClose={()=>setCartOpen(false)} />
      <CartFab onClick={()=>setCartOpen(true)} />
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const soldOut = !product.available || product.inventory === 0;
  return (
    <div className="group">
      <div className="relative">
        <ScanImage src={(product.images||[])[0]} alt={product.name} objectNumber={`OBJ ${product.object_number}`} className="aspect-[4/5] w-full border border-ink/15" />
        <span className="absolute top-2 left-2 label-mono text-[0.55rem] text-paper bg-ink px-1.5 py-0.5">N° {product.object_number}</span>
        {soldOut && <span className="absolute inset-0 bg-ink/50 flex items-center justify-center"><Stamp className="text-paper">SOLD OUT</Stamp></span>}
      </div>
      <div className="mt-3">
        <p className="label-mono text-ink-soft/60">OBJECT N° {product.object_number} · {product.product_type?.toUpperCase()}</p>
        <h3 className="font-heading text-xl leading-tight mt-0.5">{product.name}</h3>
        <p className="font-body text-sm text-ink-soft mt-1 line-clamp-2">{product.description}</p>
        {product.edition && <p className="label-mono text-burgundy mt-1">{product.edition}</p>}
        <div className="flex items-center justify-between mt-3">
          <p className="font-hand text-2xl text-ink">{formatPrice(product.price, product.currency)}</p>
          <button disabled={soldOut} onClick={onAdd} className="label-mono bg-ink text-paper px-3 py-2 hover:bg-burgundy disabled:opacity-30 focus-ring">ADD</button>
        </div>
      </div>
    </div>
  );
}

function CartFab({ onClick }) {
  const { count } = useCart();
  if (!count) return null;
  return (
    <button onClick={onClick} className="fixed bottom-5 left-5 z-30 bg-paper border border-ink/30 px-4 py-3 shadow-lg flex items-center gap-2 label-mono hover:bg-paper-deep focus-ring" style={{ transform: 'rotate(-1deg)' }}>
      <ShoppingBag size={16}/> RECEIPT · {count}
    </button>
  );
}

function CartReceipt({ open, onClose }) {
  const { items, remove, setQty, subtotal, clear, count } = useCart();
  if (!open) return null;
  const shipping = count > 0 ? 15 : 0;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-paper shadow-2xl h-full overflow-y-auto animate-fade-in p-5 font-mono-c" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, hsl(var(--ink)/0.06) 27px, hsl(var(--ink)/0.06) 28px)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-heading text-2xl text-ink">CĂLIMARA</p>
            <p className="label-mono text-ink-soft">PRINT & PAPER ARCHIVE</p>
          </div>
          <button onClick={onClose} aria-label="Close cart" className="focus-ring p-1"><X size={20}/></button>
        </div>
        <div className="border-t border-b border-dashed border-ink/30 py-3 my-3 text-center label-mono text-ink-soft">— RECEIPT —</div>

        {count === 0 ? (
          <p className="font-hand text-xl text-ink-soft text-center py-10">the receipt is empty.<br/>add something from the shelf.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.slug} className="animate-receipt-print">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-body text-base text-ink leading-tight">{it.name}</p>
                    <p className="label-mono text-ink-soft/60 text-[0.6rem]">N° {it.object_number} · {formatPrice(it.price)}</p>
                  </div>
                  <p className="font-body text-ink whitespace-nowrap">{formatPrice(it.price * it.qty)}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={()=>setQty(it.slug, it.qty-1)} aria-label="decrease" className="w-6 h-6 border border-ink/30 flex items-center justify-center hover:bg-ink hover:text-paper focus-ring"><Minus size={12}/></button>
                  <span className="label-mono text-ink w-6 text-center">{it.qty}</span>
                  <button onClick={()=>setQty(it.slug, it.qty+1)} aria-label="increase" className="w-6 h-6 border border-ink/30 flex items-center justify-center hover:bg-ink hover:text-paper focus-ring"><Plus size={12}/></button>
                  <button onClick={()=>remove(it.slug)} aria-label="remove" className="ml-auto text-ink-soft hover:text-burgundy focus-ring"><Trash2 size={14}/></button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {count > 0 && (
          <div className="mt-5 border-t border-dashed border-ink/30 pt-4 space-y-1 font-body">
            <Row label="SUBTOTAL" value={formatPrice(subtotal)} />
            <Row label="DELIVERY" value={formatPrice(shipping)} />
            <div className="border-t border-ink/30 pt-2 mt-2">
              <Row label="TOTAL" value={formatPrice(total)} bold />
            </div>
            <p className="font-hand text-base text-ink-soft text-center mt-3 leading-tight">thank you for supporting<br/>independent student publishing.</p>
            <button onClick={() => alert('Checkout will be connected to a payment provider (e.g. Stripe) when configured. The cart is saved on this device.')} className="w-full mt-3 bg-ink text-paper py-3 label-mono hover:bg-burgundy focus-ring">PROCEED TO CHECKOUT →</button>
            <button onClick={clear} className="w-full mt-2 label-mono text-ink-soft hover:text-burgundy focus-ring">clear receipt</button>
          </div>
        )}
        <p className="label-mono text-ink-soft/40 text-center mt-6 text-[0.55rem]">— END OF RECEIPT —</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-heading text-xl text-ink' : 'text-ink-soft'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}