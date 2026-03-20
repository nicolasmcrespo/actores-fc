import { useInView } from '../hooks/useInView';

const products = [
  { name: 'Camiseta Titular 2026', desc: 'La camiseta oficial azul con diseño geométrico', tag: 'NUEVA', price: null },
  { name: 'Camiseta Actrices 2026', desc: 'Edición Actrices Futbol Club', tag: 'NUEVA', price: null },
  { name: 'Campera Oficial AFC', desc: 'Campera training del plantel', tag: 'PRÓXIMAMENTE', price: null },
  { name: 'Kit Hincha', desc: 'Bufanda + Gorra + Stickers', tag: 'PRÓXIMAMENTE', price: null },
];

export function Shop() {
  const { ref, isVisible } = useInView(0.15);

  return (
    <section id="shop" ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      <div className="section-divider mx-auto mb-16" style={{ maxWidth: '80%' }} />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className={`mb-12 sm:mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="font-oswald text-[11px] tracking-[0.4em] uppercase text-[#c9a84c]/60">Merch oficial</span>
              <h2 className="font-bebas text-[64px] sm:text-[88px] leading-[0.85] mt-2">
                <span className="text-white">AFC</span>{' '}
                <span className="text-gold-gradient">SHOP</span>
              </h2>
            </div>
            <p className="text-[14px] text-[#b0b8c8]/60 font-light max-w-sm">
              Llevá los colores de Actores F.C. Camisetas oficiales y merchandising exclusivo del club.
            </p>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <div
              key={product.name}
              className={`card-glow spotlight-card group bg-[#101d3f]/40 border border-white/[0.04] rounded-sm overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 0.12}s` }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
            >
              {/* Product image placeholder */}
              <div className="relative h-[220px] bg-gradient-to-br from-[#0d1a3d]/60 via-[#0a1128] to-[#050510] flex items-center justify-center overflow-hidden">
                {/* Jersey silhouette */}
                <svg className="w-24 h-24 text-[#2563eb]/10 group-hover:text-[#c9a84c]/15 transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 2L1 7v4h4v11h14V11h4V7l-5-5h-3c0 1.66-1.34 3-3 3S9 3.66 9 2H6zm0 2.25L2.5 7.5V9H5v10h14V9h2.5V7.5L18 4.25V2.5h-2c-.22 1.96-1.84 3.5-3.88 3.5h-.24c-2.04 0-3.66-1.54-3.88-3.5H6v1.75z"/>
                </svg>

                {/* Tag */}
                <div className="absolute top-3 left-3">
                  <span className={`font-oswald text-[9px] tracking-[0.2em] uppercase px-3 py-1 ${product.tag === 'NUEVA' ? 'bg-[#c9a84c] text-[#0a1128]' : 'bg-white/10 text-white/60'}`}>
                    {product.tag}
                  </span>
                </div>
              </div>

              {/* Product info */}
              <div className="p-5">
                <h3 className="font-oswald font-semibold text-[14px] tracking-[0.05em] uppercase text-white group-hover:text-[#c9a84c] transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-[12px] text-[#b0b8c8]/40 mt-1 font-light">{product.desc}</p>

                <div className="mt-4">
                  {product.tag === 'NUEVA' ? (
                    <button className="w-full font-oswald text-[11px] tracking-[0.15em] uppercase py-2.5 border border-[#c9a84c]/30 text-[#c9a84c]/70 hover:bg-[#c9a84c] hover:text-[#0a1128] transition-all duration-300">
                      Consultar
                    </button>
                  ) : (
                    <div className="font-oswald text-[11px] tracking-[0.15em] uppercase py-2.5 text-center text-[#b0b8c8]/30 border border-white/[0.04]">
                      Próximamente
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
