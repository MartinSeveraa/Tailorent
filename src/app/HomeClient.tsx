"use client";
// src/app/HomeClient.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./page.module.scss";

const HERO_SLIDES = [
  { img: "/images/hero.webp",  label: "01 / 03", tag: "Šití na míru" },
  { img: "/images/hero2.webp", label: "02 / 03", tag: "Úpravy oblečení" },
  { img: "/images/hero3.webp", label: "03 / 03", tag: "Expresní služby" },
];

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

type Service = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  basePrice: number;
};

type Props = { services: Service[] };

export default function HomeClient({ services }: Props) {
  const [current, setCurrent] = useState(0);
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  const heroCta = role === "ADMIN"
    ? { href: "/admin/orders", label: "Admin panel" }
    : role
    ? { href: "/orders/new", label: "Objednat krejčího" }
    : { href: "/register",   label: "Objednat krejčího" };

  const serviceHref = role === "ADMIN" ? "/admin/orders" : role ? "/orders/new" : "/register";
  const footerHref  = role === "ADMIN" ? "/admin/orders" : role ? "/orders/new" : "/register";
  const footerLabel = role === "ADMIN"
    ? "Přejít do Admin panelu"
    : role
    ? "Vytvořit objednávku"
    : "Vytvořit účet zdarma";

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className={styles.main}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`${styles.heroSlide} ${i === current ? styles.heroSlideActive : ""}`}
            style={{ backgroundImage: `url(${slide.img})` }}
          />
        ))}
        <div className={styles.heroOverlay} />
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.heroDot} ${i === current ? styles.heroDotActive : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
        <div className={styles.heroTag}>{HERO_SLIDES[current].tag}</div>
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
          <Link href={heroCta.href} className={styles.heroBtn}>
            {heroCta.label}
            <span className={styles.heroBtnArrow}>→</span>
          </Link>
        </div>
      </section>

      {/* ── JAK PRACUJEME ── */}
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
        <div className={styles.statsBar}>
          <div className={styles.stat}><strong>500+</strong><span>spokojených zákazníků</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><strong>48</strong><span>krejčích po celé ČR</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><strong>4.9 ★</strong><span>průměrné hodnocení</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><strong>3 roky</strong><span>na trhu</span></div>
        </div>
      </section>

      {/* ── CO NABÍZÍME ── */}
      <section className={styles.servicesSection} id="sluzby">
        <div className={styles.servicesInner}>
          <div className={styles.servicesHeader}>
            <span className={styles.sectionLabel}>Co nabízíme</span>
            <h2 className={styles.sectionTitle}>
              Krejčovské služby<br />pro každou příležitost
            </h2>
          </div>

          {services.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
              Momentálně nejsou k dispozici žádné aktivní služby.
            </p>
          ) : (
            <div className={styles.servicesGrid}>
              {services.map((s, i) => (
                <div key={s.id} className={styles.serviceCard}>
                  <div className={styles.serviceCardTop}>
                    <span className={styles.serviceIcon}>{s.icon}</span>
                    <span className={styles.serviceCardNum}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className={styles.serviceTitle}>{s.name}</h3>
                  {s.description && (
                    <p className={styles.serviceDesc}>{s.description}</p>
                  )}
                  <div className={styles.serviceFooter}>
                    <span className={styles.servicePrice}>
                      {s.basePrice > 0 ? `od ${s.basePrice} Kč` : ""}
                    </span>
                    <Link href={serviceHref} className={styles.serviceLink}>
                      Objednat →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SLOVO MAJITELE ── */}
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

      {/* ── FOOTER CTA ── */}
      <section className={styles.footerCta}>
        <div className={styles.footerCtaInner}>
          <h2 className={styles.footerCtaTitle}>Připraveni na první objednávku?</h2>
          <Link href={footerHref} className={styles.footerCtaBtn}>
            {footerLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
