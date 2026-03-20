import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Club', href: '#about' },
  { label: 'Actores', href: '#actores' },
  { label: 'Actrices', href: '#actrices' },
  { label: 'Alcance', href: '#alcance' },
  { label: 'Shop', href: '#shop' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'nav-blur bg-[#0a1128]/90 py-3 shadow-lg shadow-black/20' : 'py-5 bg-transparent'}`}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1a3a8a 0%, #0a1128 100%)', border: '1.5px solid rgba(201,168,76,0.4)'}}>
            <span className="font-bebas text-[#c9a84c] text-lg leading-none tracking-wider">A</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-oswald font-bold text-white text-sm tracking-[0.2em] uppercase group-hover:text-[#c9a84c] transition-colors">Actores</span>
            <span className="font-oswald font-light text-[#c9a84c] text-sm tracking-[0.2em] uppercase ml-1">F.C.</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-oswald text-[13px] tracking-[0.15em] uppercase text-[#b0b8c8] hover:text-[#c9a84c] transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#c9a84c] hover:after:w-full after:transition-all after:duration-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#shop"
          className="hidden md:block font-oswald text-[12px] tracking-[0.2em] uppercase px-5 py-2.5 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a1128] transition-all duration-300"
        >
          Conseguí tu camiseta
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 w-7"
        >
          <span className={`h-[2px] bg-[#c9a84c] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px] w-full' : 'w-full'}`} />
          <span className={`h-[2px] bg-[#c9a84c] transition-all duration-300 ${menuOpen ? 'opacity-0 w-0' : 'w-5'}`} />
          <span className={`h-[2px] bg-[#c9a84c] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[5px] w-full' : 'w-3'}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 nav-blur bg-[#0a1128]/95 transition-all duration-400 overflow-hidden ${menuOpen ? 'max-h-[400px] border-b border-[#c9a84c]/10' : 'max-h-0'}`}>
        <div className="px-6 py-6 flex flex-col gap-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-oswald text-sm tracking-[0.15em] uppercase text-[#b0b8c8] hover:text-[#c9a84c] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a href="#shop" onClick={() => setMenuOpen(false)} className="font-oswald text-[12px] tracking-[0.2em] uppercase px-5 py-2.5 border border-[#c9a84c]/40 text-[#c9a84c] text-center mt-2 hover:bg-[#c9a84c] hover:text-[#0a1128] transition-all">
            Conseguí tu camiseta
          </a>
        </div>
      </div>
    </nav>
  );
}
