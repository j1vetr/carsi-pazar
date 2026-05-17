// Reklam yerleşim haritası — 5 ekran yan yana

function AdSlot({ label = "REKLAM" }: { label?: string }) {
  return (
    <div style={{
      background: "linear-gradient(90deg,#fef9c3,#fef08a)",
      border: "1px dashed #ca8a04",
      borderRadius: 4,
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 8, color: "#92400e", letterSpacing: 1.5, fontWeight: 700 }}>AdMob</span>
      <span style={{ fontSize: 9, color: "#78350f", letterSpacing: 0.5, fontWeight: 800 }}>{label}</span>
      <span style={{ fontSize: 7.5, color: "#a16207", letterSpacing: 0.8 }}>ADAPTIVE BANNER</span>
    </div>
  );
}

function TopBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
      <div style={{ width: 18, height: 12, display: "flex", flexDirection: "column", gap: 3 }}>
        {[0,1,2].map(i => <div key={i} style={{ height: 2, background: "#374151", borderRadius: 1 }} />)}
      </div>
      <img src="/__mockup/logo-light.png" style={{ height: 22, objectFit: "contain" }} alt="" />
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>14:32</span>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
      </div>
    </div>
  );
}

function PhoneFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 160, height: 320,
        background: "#f9fafb",
        borderRadius: 16,
        border: "1.5px solid #d1d5db",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}>
        {children}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: -0.2 }}>{title}</span>
    </div>
  );
}

function Row({ label, sub, muted }: { label: string; sub?: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "6px 8px", borderBottom: "1px solid #f3f4f6", gap: 6 }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, background: muted ? "#e5e7eb" : "#dbeafe", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#111827" }}>{label}</div>
        {sub && <div style={{ fontSize: 8, color: "#9ca3af" }}>{sub}</div>}
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 9, color: "#6b7280", fontWeight: 500 }}>38.61</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#111827" }}>38.89</div>
      </div>
    </div>
  );
}

function SectionLabel({ text, tag }: { text: string; tag?: string }) {
  return (
    <div style={{ padding: "6px 8px 3px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: "#111827" }}>{text}</span>
      {tag && <span style={{ fontSize: 7.5, fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>{tag}</span>}
    </div>
  );
}

function AdLabel({ pos }: { pos: string }) {
  return (
    <div style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "#ca8a04", borderRadius: 3, padding: "1px 5px" }}>
      <span style={{ fontSize: 7, color: "#fff", fontWeight: 800, letterSpacing: 0.5 }}>{pos}</span>
    </div>
  );
}

// ─── Ekran 1: Döviz ────────────────────────────────────────────────────────
function DovizFrame() {
  return (
    <PhoneFrame title="Döviz">
      <TopBar />
      <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative" }}>
          <AdSlot />
          <AdLabel pos="① ÜST" />
        </div>
        <SectionLabel text="Döviz Kurları" tag="CANLI" />
        <div style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "3px 8px", background: "#f9fafb", display: "flex", gap: 4 }}>
          <span style={{ fontSize: 7.5, fontWeight: 700, color: "#9ca3af", flex: 1 }}>BİRİM</span>
          <span style={{ fontSize: 7.5, fontWeight: 700, color: "#9ca3af" }}>ALIŞ</span>
          <span style={{ fontSize: 7.5, fontWeight: 700, color: "#9ca3af", marginLeft: 16, marginRight: 16 }}>SATIŞ</span>
        </div>
        <Row label="USD" sub="Amerikan Doları" />
        <Row label="EUR" sub="Euro" />
        <Row label="GBP" sub="Sterlin" />
        <Row label="CHF" sub="İsviçre Frangı" muted />
        <div style={{ flex: 1 }} />
        <SectionLabel text="Banka Fiyatları" />
        <Row label="USD" sub="Banka Ort." muted />
        <div style={{ position: "relative" }}>
          <AdSlot />
          <AdLabel pos="② ALT" />
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Ekran 2: Altın ────────────────────────────────────────────────────────
function AltinFrame() {
  return (
    <PhoneFrame title="Altın">
      <TopBar />
      <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
        <SectionLabel text="Altın Fiyatları" />
        <div style={{ display: "flex", gap: 4, padding: "4px 8px", overflowX: "auto" }}>
          {["Tümü","Gram","Sarrafiye","Külçe","Gümüş"].map((c, i) => (
            <div key={c} style={{ padding: "3px 8px", borderRadius: 999, background: i === 0 ? "#0f2560" : "#e5e7eb", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: i === 0 ? "#fff" : "#374151" }}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <AdSlot />
          <AdLabel pos="① ÜST" />
        </div>
        <div style={{ padding: "5px 8px 2px", fontSize: 10, fontWeight: 800, color: "#111827" }}>Gram & Ons Altın</div>
        <div style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
          {["Gram Altın","Ons Altın","Ons (EUR)"].map((n, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", padding: "5px 8px", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#111827" }}>{n}</div>
                <div style={{ fontSize: 7.5, color: "#9ca3af" }}>1 gram saf altın</div>
              </div>
              <div style={{ width: 44, background: "#f4f5f7", borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", padding: "2px 4px", textAlign: "right" }}>
                <div style={{ fontSize: 7, color: "#9ca3af", fontWeight: 700 }}>ALIŞ</div>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: "#374151" }}>6.659</div>
              </div>
              <div style={{ width: 44, padding: "2px 4px 2px 6px", textAlign: "right" }}>
                <div style={{ fontSize: 7, color: "#9ca3af", fontWeight: 700 }}>SATIŞ</div>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: "#111827" }}>6.688</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }}>
          <AdSlot />
          <AdLabel pos="② ALT" />
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Ekran 3: Portföy ──────────────────────────────────────────────────────
function PortfoyFrame() {
  return (
    <PhoneFrame title="Portföy">
      <TopBar />
      <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column", padding: "8px 0 0" }}>
        <div style={{ padding: "0 10px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#9ca3af", letterSpacing: 1 }}>TOPLAM PORTFÖY DEĞERİ</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: -1, marginTop: 4 }}>₺24.800</div>
          <div style={{ display: "flex", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden", marginTop: 8 }}>
            {[{l:"BUGÜN",v:"+₺120",c:"#16a34a"},{l:"MALİYET",v:"₺22.000",c:"#111827"},{l:"GETİRİ",v:"+₺2.800",c:"#16a34a"}].map((s,i)=>(
              <div key={s.l} style={{ flex:1, padding:"5px 4px", borderRight: i<2?"1px solid #e5e7eb":"none", background:"#fff" }}>
                <div style={{ fontSize:6.5, fontWeight:700, color:"#9ca3af", letterSpacing:0.5 }}>{s.l}</div>
                <div style={{ fontSize:8, fontWeight:800, color:s.c, marginTop:2 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ margin: "8px 0", height: 40, background: "#f3f4f6", borderRadius: 6, marginLeft: 10, marginRight: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 8, color: "#9ca3af" }}>📊 Grafik</span>
        </div>
        <div style={{ position: "relative" }}>
          <AdSlot label="REKLAM · PORTFÖY" />
          <AdLabel pos="① ORTA" />
        </div>
        <div style={{ padding: "5px 10px 2px", fontSize: 8.5, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.8 }}>VARLIKLARIM · 3</div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, margin: "0 10px", overflow: "hidden" }}>
          {["USD","EUR","ALTIN"].map((c,i)=>(
            <div key={c} style={{ display:"flex", alignItems:"center", padding:"6px 8px", borderBottom: i<2?"1px solid #f3f4f6":"none" }}>
              <div style={{ width:20, height:20, borderRadius:10, background:"#dbeafe", marginRight:6, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#111827" }}>{c}</div>
                <div style={{ fontSize:7.5, color:"#9ca3af" }}>100 birim</div>
              </div>
              <div style={{ fontSize:9, fontWeight:700, color:"#111827" }}>₺8.200</div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Ekran 4: Haberler ────────────────────────────────────────────────────
function HaberlerFrame() {
  return (
    <PhoneFrame title="Haberler">
      <div style={{ padding: "10px 10px 6px", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
        <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 700, letterSpacing: 0.8 }}>PİYASA & FİNANS</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginTop: 2 }}>Haberler</div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "linear-gradient(135deg,#0b1a33,#0b3d91)", borderRadius: 10, margin: "8px", padding: "10px", flexShrink: 0 }}>
          <div style={{ fontSize: 7.5, color: "#fcd34d", fontWeight: 700, marginBottom: 4 }}>ÖNE ÇIKAN</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: "15px" }}>Merkez Bankası faiz kararı beklentilerin üzerinde</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>Bloomberg HT · 2 saat önce</div>
        </div>
        <div style={{ position: "relative", margin: "0 8px" }}>
          <AdSlot label="REKLAM · HABERLER" />
          <AdLabel pos="① ORTA" />
        </div>
        <div style={{ padding: "6px 10px 2px", fontSize: 9.5, fontWeight: 800, color: "#111827" }}>Son Haberler</div>
        {["Dolar/TL teknik analiz","Altın güçlenmeye devam","Borsa 9.500 direnci"].map((t,i) => (
          <div key={t} style={{ padding: "6px 10px", borderBottom: i<2?"1px solid #f3f4f6":"none", display:"flex", gap:6, alignItems:"flex-start" }}>
            <div style={{ width:8, height:8, borderRadius:4, background:"#1b6ae4", marginTop:2, flexShrink:0 }} />
            <div style={{ fontSize:9, fontWeight:600, color:"#111827", lineHeight:"13px" }}>{t}</div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ─── Ekran 5: Detay ───────────────────────────────────────────────────────
function DetayFrame() {
  return (
    <PhoneFrame title="Varlık Detayı">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 10px 8px", borderBottom:"1px solid #e5e7eb", background:"#fff", flexShrink:0 }}>
        <div style={{ width:24, height:24, borderRadius:8, background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:10 }}>‹</span>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:7.5, color:"#9ca3af", fontWeight:700, letterSpacing:1 }}>DÖVİZ</div>
          <div style={{ fontSize:11, fontWeight:700, color:"#111827" }}>USD</div>
        </div>
        <div style={{ width:24, height:24, borderRadius:8, background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:10 }}>★</span>
        </div>
      </div>
      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"10px 10px 6px" }}>
          <div style={{ fontSize:9, color:"#9ca3af" }}>Amerikan Doları</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#111827", letterSpacing:-0.8, marginTop:4 }}>₺38.89</div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:"#d1fae5", borderRadius:4, padding:"2px 6px", marginTop:4 }}>
            <span style={{ fontSize:9, fontWeight:700, color:"#065f46" }}>▲ %0.42</span>
          </div>
        </div>
        <div style={{ margin:"0 10px 8px", background:"#f3f4f6", borderRadius:8, height:60, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:8, color:"#9ca3af" }}>📈 Grafik</span>
        </div>
        <div style={{ position:"relative", margin:"0 10px 8px" }}>
          <AdSlot label="REKLAM · DETAY" />
          <AdLabel pos="① GRAFİK ALTI" />
        </div>
        <div style={{ padding:"0 10px" }}>
          <div style={{ fontSize:7.5, fontWeight:700, color:"#9ca3af", letterSpacing:1, marginBottom:4 }}>FİYAT DETAYI</div>
          {[["ALIŞ","₺38.61"],["SATIŞ","₺38.89"],["SPREAD","₺0.28"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:"1px solid #f3f4f6" }}>
              <span style={{ fontSize:8.5, color:"#6b7280" }}>{k}</span>
              <span style={{ fontSize:8.5, fontWeight:700, color:"#111827" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Açıklama kartı ───────────────────────────────────────────────────────
function LegendCard() {
  const items = [
    { n:"①", c:"#ca8a04", l:"Döviz / Altın: Başlık üstü banner" },
    { n:"②", c:"#ca8a04", l:"Döviz / Altın: Liste sonu banner" },
    { n:"①", c:"#7c3aed", l:"Portföy: Grafikler ile varlıklar arası" },
    { n:"①", c:"#0891b2", l:"Haberler: Öne çıkan ile liste arası" },
    { n:"①", c:"#059669", l:"Detay sayfası: Grafik altı banner" },
  ];
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"14px 18px", minWidth:240 }}>
      <div style={{ fontSize:11, fontWeight:800, color:"#111827", marginBottom:10, letterSpacing:-0.2 }}>Reklam Noktaları</div>
      {items.map((it, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <div style={{ width:18, height:18, borderRadius:9, background:it.c, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:9, color:"#fff", fontWeight:800 }}>{it.n}</span>
          </div>
          <span style={{ fontSize:10, color:"#374151", lineHeight:"14px" }}>{it.l}</span>
        </div>
      ))}
      <div style={{ marginTop:12, padding:"8px 10px", background:"#fef9c3", borderRadius:8, border:"1px solid #fde68a" }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#92400e", marginBottom:2 }}>📱 Uygulama ID</div>
        <div style={{ fontSize:8, color:"#78350f", fontFamily:"monospace" }}>ca-app-pub-6688478170415368~2127933480</div>
        <div style={{ fontSize:9, fontWeight:700, color:"#92400e", marginTop:6, marginBottom:2 }}>🎯 Reklam Birimi</div>
        <div style={{ fontSize:8, color:"#78350f", fontFamily:"monospace" }}>ca-app-pub-6688478170415368/7184819045</div>
      </div>
    </div>
  );
}

export function AdPlacements() {
  return (
    <div style={{
      fontFamily:"system-ui,-apple-system,sans-serif",
      background:"#f8fafc",
      minHeight:"100vh",
      padding:"28px 28px 40px",
    }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:18, fontWeight:800, color:"#111827", letterSpacing:-0.5 }}>AdMob Reklam Yerleşimleri</div>
        <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>Sarı alan = banner reklam konumu · ADAPTIVE_BANNER format</div>
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
        <DovizFrame />
        <AltinFrame />
        <PortfoyFrame />
        <HaberlerFrame />
        <DetayFrame />
        <LegendCard />
      </div>
    </div>
  );
}
