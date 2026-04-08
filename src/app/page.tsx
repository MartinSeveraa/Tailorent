"use client";
// src/app/page.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";

// ─── Hero slides ───────────────────────────────────────────────
const HERO_SLIDES = [
  {
    img: "/images/hero.webp",
    label: "01 / 03",
    tag: "Šití na míru",
  },
  {
    img: "/images/hero2.webp",
    label: "02 / 03",
    tag: "Úpravy oblečení",
  },
  {
    img: "/images/hero3.webp",
    label: "03 / 03",
    tag: "Expresní služby",
  },
];

// ─── How we work ───────────────────────────────────────────────
const HOW_WE_WORK = [
  {
    num: "01",
    title: "Objednávka online",
    desc: "Zvolíte službu, zadáte adresu a vyberete termín. Celý proces zabere méně než 2 minuty.",
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80&fit=crop",
  },
  {
    num: "02",
    title: "Krejčí přijede za vámi",
    desc: "Profesionální krejčí dorazí v domluvený čas přímo k vám domů nebo do kanceláře.",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80&fit=crop",
  },
  {
    num: "03",
    title: "Precizní zpracování",
    desc: "Měření, konzultace a samotná práce — vše s maximální péčí a důrazem na detail.",
    img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80&fit=crop",
  },
];

// ─── Services ──────────────────────────────────────────────────
const SERVICES = [
  {
    icon: "✂",
    title: "Úpravy oblečení",
    items: ["Zkrácení kalhot a sukní", "Zúžení či rozšíření", "Přešití zipů a knoflíků", "Opravy poškozených míst"],
    price: "od 200 Kč",
  },
  {
    icon: "◈",
    title: "Šití na míru",
    items: ["Pánské a dámské obleky", "Společenské šaty", "Košile a saka", "Svatební kolekce"],
    price: "od 1 500 Kč",
  },
  {
    icon: "⚡",
    title: "Expresní služby",
    items: ["Výjezd v den objednávky", "Oprava do 24 hodin", "Urgentní alternace", "Záchrana před akcí"],
    price: "od 500 Kč",
  },
];

type HomeService = {
  id: string;
  title: string;
  description: string;
  priceFrom: number;
  imageUrl: string;
  isActive: boolean;
};

type TopTailor = {
  id: string;
  name: string;
  locality: string;
  rating: number;
  reviewCount: number;
};

function StarDisplay({ rating }: { rating: number }) {
  const pct = `${(rating / 5) * 100}%`;
  return (
    <span className={styles.tailorStars}>
      <span className={styles.tailorStarsEmpty}>★★★★★</span>
      <span className={styles.tailorStarsFull} style={{ width: pct }}>★★★★★</span>
    </span>
  );
}

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [services, setServices] = useState<HomeService[]>([]);
  const [topTailors, setTopTailors] = useState<TopTailor[]>([]);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (!res.ok) return;
        const active = (data.data ?? []).filter((s: HomeService) => s.isActive).slice(0, 3);
        setServices(active);
      } catch {
        // keep fallback constants
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    fetch("/api/tailors/top")
      .then((r) => r.json())
      .then((d) => { if (d.data) setTopTailors(d.data); })
      .catch(() => {});
  }, []);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        {/* Slides */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`${styles.heroSlide} ${i === current ? styles.heroSlideActive : ""}`}
            style={{ backgroundImage: `url(${slide.img})` }}
          />
        ))}

        {/* Overlay */}
        <div className={styles.heroOverlay} />


  
        {/* Slide dots */}
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.heroDot} ${i === current ? styles.heroDotActive : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>

        {/* Tag */}
        <div className={styles.heroTag}>{HERO_SLIDES[current].tag}</div>

        {/* Content */}
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Prémiové krejčovské služby</p>
          <h1 className={styles.heroTitle}>
            Krejčovství
            <br />
            <em>až k vám domů</em>
          </h1>
          <p className={styles.heroSub}>
            Objednáte online — profesionální krejčí přijede za vámi.
          </p>
          <Link href="/register" className={styles.heroBtn}>
            Objednat krejčího
            <span className={styles.heroBtnArrow}>→</span>
          </Link>
        </div>

      </section>

      {/* ══════════════════════════════════════════
          JAK PRACUJEME
      ══════════════════════════════════════════ */}
      <section className={styles.howSection} id="jak-pracujeme">
        <div className={styles.howHeader}>
          <span className={styles.sectionLabel}>Jak pracujeme</span>
          <h2 className={styles.sectionTitle}>
            Tři kroky k dokonalému<br />oblečení
          </h2>
        </div>

        <div className={styles.howGrid}>
          {HOW_WE_WORK.map((item) => (
            <div key={item.num} className={styles.howCard}>
              <div className={styles.howImg}>
                <img src={item.img} alt={item.title} />
                <span className={styles.howNum}>{item.num}</span>
              </div>
              <div className={styles.howBody}>
                <h3 className={styles.howTitle}>{item.title}</h3>
                <p className={styles.howDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <strong>500+</strong>
            <span>spokojených zákazníků</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>48</strong>
            <span>krejčích po celé ČR</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>4.9 ★</strong>
            <span>průměrné hodnocení</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>3 roky</strong>
            <span>na trhu</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CO NABÍZÍME
      ══════════════════════════════════════════ */}
      <section className={styles.servicesSection} id="sluzby">
        <div className={styles.servicesInner}>
          <div className={styles.servicesHeader}>
            <span className={styles.sectionLabel}>Co nabízíme</span>
            <h2 className={styles.sectionTitle}>Krejčovské služby<br />pro každou příležitost</h2>
          </div>

          <div className={styles.servicesGrid}>
            {(services.length ? services : SERVICES).map((s: any, i) => (
              <div key={s.title} className={styles.serviceCard}>
                {services.length && s.imageUrl && (
                  <div className={styles.serviceImage}>
                    <img src={s.imageUrl} alt={s.title} />
                  </div>
                )}
                <div className={styles.serviceCardTop}>
                  <span className={styles.serviceIcon}>{services.length ? "◈" : s.icon}</span>
                  <span className={styles.serviceCardNum}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className={styles.serviceTitle}>{s.title}</h3>
                {services.length ? (
                  <p className={styles.serviceListText}>{s.description}</p>
                ) : (
                  <ul className={styles.serviceList}>
                    {s.items.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                <div className={styles.serviceFooter}>
                  <span className={styles.servicePrice}>
                    {services.length ? `od ${s.priceFrom} Kč` : s.price}
                  </span>
                  <Link href="/register" className={styles.serviceLink}>
                    Objednat →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TOP KREJČÍ
      ══════════════════════════════════════════ */}
      {topTailors.length > 0 && (
        <section className={styles.tailorsSection}>
          <div className={styles.tailorsInner}>
            <div className={styles.tailorsHeader}>
              <span className={styles.sectionLabel}>Nejlepší hodnocení</span>
              <h2 className={styles.sectionTitle}>
                Krejčí, kterým<br />zákazníci důvěřují
              </h2>
            </div>
            <div className={styles.tailorsGrid}>
              {topTailors.map((tailor, i) => (
                <div key={tailor.id} className={styles.tailorCard}>
                  <div className={styles.tailorRank}>{String(i + 1).padStart(2, "0")}</div>
                  <div className={styles.tailorAvatar}>
                    {tailor.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className={styles.tailorName}>{tailor.name}</h3>
                  <p className={styles.tailorLocality}>{tailor.locality}</p>
                  <StarDisplay rating={tailor.rating} />
                  <div className={styles.tailorRatingRow}>
                    <span className={styles.tailorRatingVal}>
                      {tailor.rating.toFixed(1)}
                    </span>
                    <span className={styles.tailorReviewCount}>
                      ({tailor.reviewCount} {tailor.reviewCount === 1 ? "recenze" : tailor.reviewCount < 5 ? "recenze" : "recenzí"})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          SLOVO MAJITELE
      ══════════════════════════════════════════ */}
      <section className={styles.ownerSection} id="pribeh">
        <div className={styles.ownerInner}>
          <div className={styles.ownerImg}>
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&q=80&fit=crop"
              alt="Majitel Tailorent"
            />
            <div className={styles.ownerImgAccent} />
          </div>

          <div className={styles.ownerContent}>
            <span className={styles.sectionLabel}>Slovo majitele</span>
            <blockquote className={styles.ownerQuote}>
              „Krejčovství je řemeslo, které si zaslouží přijít za vámi — ne naopak."
            </blockquote>
            <div className={styles.ownerDivider} />
            <p className={styles.ownerText}>
              Tailorent vznikl z jednoduché myšlenky: prémiové krejčovské služby by neměly být výsadou těch,
              kdo mají čas procházet kamenné prodejny. Přinášíme tradiční řemeslo do 21. století —
              s respektem k detailu, materiálu a vašemu času.
            </p>
            <p className={styles.ownerText}>
              Každý krejčí v naší síti prochází pečlivým výběrem. Záleží nám na tom,
              aby ke každému zákazníkovi dorazil skutečný profesionál, ne jen brigádník s jehlou.
            </p>
            <div className={styles.ownerSig}>
              <strong>Martin Kovář</strong>
              <span>Zakladatel & CEO, Tailorent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════ */}
      <section className={styles.footerCta}>
        <div className={styles.footerCtaInner}>
          <h2 className={styles.footerCtaTitle}>
            Připraveni na první objednávku?
          </h2>
          <Link href="/register" className={styles.footerCtaBtn}>
            Vytvořit účet zdarma
          </Link>
        </div>
      </section>
    </main>
  );
}
