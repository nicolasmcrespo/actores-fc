export function Footer() {
  return (
    <footer className="relative pt-16 pb-8 border-t border-[#c9a84c]/10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1a3a8a 0%, #0a1128 100%)', border: '1.5px solid rgba(201,168,76,0.4)'}}>
                <span className="font-bebas text-[#c9a84c] text-lg leading-none">A</span>
              </div>
              <div>
                <span className="font-oswald font-bold text-white text-sm tracking-[0.2em] uppercase">Actores</span>
                <span className="font-oswald font-light text-[#c9a84c] text-sm tracking-[0.2em] uppercase ml-1">F.C.</span>
              </div>
            </div>
            <p className="text-[13px] text-[#b0b8c8]/40 font-light leading-relaxed max-w-sm">
              Plataforma deportiva, cultural y de entretenimiento. Fútbol real, cultura pop y comunidad desde 2018.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-oswald text-[11px] tracking-[0.2em] uppercase text-[#c9a84c]/60 mb-4">Club</h4>
              <div className="flex flex-col gap-2.5">
                {['Actores', 'Actrices', 'Historial', 'Sobre Nosotros'].map(l => (
                  <a key={l} href="#" className="text-[13px] text-[#b0b8c8]/50 hover:text-[#c9a84c] transition-colors font-light">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-oswald text-[11px] tracking-[0.2em] uppercase text-[#c9a84c]/60 mb-4">Conectar</h4>
              <div className="flex flex-col gap-2.5">
                {['Instagram', 'TikTok', 'YouTube', 'Kick'].map(l => (
                  <a key={l} href="#" className="text-[13px] text-[#b0b8c8]/50 hover:text-[#c9a84c] transition-colors font-light">{l}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-oswald text-[11px] tracking-[0.2em] uppercase text-[#c9a84c]/60 mb-4">Comercial</h4>
            <p className="text-[13px] text-[#b0b8c8]/50 font-light mb-4">
              Para activaciones de marca, sponsors y consultas comerciales:
            </p>
            <a href="mailto:actoresfc@gmail.com" className="font-oswald text-[12px] tracking-[0.1em] text-[#c9a84c] hover:text-[#e2c780] transition-colors">
              actoresfc@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="section-divider mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-[#b0b8c8]/25 font-light">
            &copy; 2026 Actores Futbol Club. Todos los derechos reservados.
          </span>
          <span className="font-bebas text-[13px] tracking-[0.3em] text-[#c9a84c]/15 uppercase">Acting</span>
        </div>
      </div>
    </footer>
  );
}
