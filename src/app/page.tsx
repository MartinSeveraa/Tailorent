// src/app/page.tsx
import Link from "next/link";
import styles from "./page.module.scss";
import { Button } from "@/components/ui/Button/Button";

const SERVICES = [
  {
    icon: "✂️",
    title: "Úpravy oblečení",
    desc: "Zkrácení, rozšíření, přešití. Dáme vašim oblíbeným kouskům druhý život přímo u vás doma.",
    price: "od 200 Kč",
  },
  {
    icon: "🧵",
    title: "Šití na míru",
    desc: "Každý šat ušitý přesně podle vašich měr a představ. Prémiové zpracování garantováno.",
    price: "od 1 500 Kč",
  },
  {
    icon: "⚡",
    title: "Expresní služba",
    desc: "Potřebujete opravit oblečení do druhého dne? Expresní výjezd i v den objednávky.",
    price: "od 500 Kč",
  },
];

const STEPS = [
  {
    title: "Zvolte službu",
    desc: "Vyberte typ krejčovské služby, která vám vyhovuje.",
  },
  {
    title: "Zadejte adresu",
    desc: "Krejčí přijede přímo k vám domů nebo do kanceláře.",
  },
  {
    title: "Vyberte termín",
    desc: "Zvolte datum a čas, který vám nejlépe vyhovuje.",
  },
  {
    title: "Hotovo",
    desc: "Potvrdíme objednávku a přiřadíme nejlepšího krejčího.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <p className={styles.heroBadge}>Prémiové krejčovské služby</p>

            <h1 className={styles.heroTitle}>
              Krejčí přímo
              <br />
              <em>k vám domů</em>
            </h1>

            <p className={styles.heroSubtitle}>
              Profesionální úpravy oblečení, šití na míru a expresní opravy —
              objednáte online, krejčí přijede za vámi.
            </p>

            <div className={styles.heroActions}>
              <Button href="/orders/new" variant="primary" size="lg">
                Objednat krejčího
              </Button>
              <Button href="#jak-to-funguje" variant="ghost" size="lg">
                Jak to funguje →
              </Button>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <strong>500+</strong>
                <span>spokojených zákazníků</span>
              </div>
              <div className={styles.heroStat}>
                <strong>48</strong>
                <span>krejčích po celé ČR</span>
              </div>
              <div className={styles.heroStat}>
                <strong>4.9★</strong>
                <span>průměrné hodnocení</span>
              </div>
            </div>
          </div>

          {/* Karta vpravo */}
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <p className={styles.heroCardTitle}>Jak probíhá objednávka?</p>
              <div className={styles.heroCardSteps}>
                {STEPS.map((step, i) => (
                  <div key={i} className={styles.heroCardStep}>
                    <span className={styles.heroCardStepNum}>{i + 1}</span>
                    <div className={styles.heroCardStepText}>
                      <strong>{step.title}</strong>
                      {step.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Služby ── */}
      <section className={styles.services} id="sluzby">
        <div className={styles.servicesInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Co nabízíme</span>
            <h2 className={styles.sectionTitle}>Krejčovské služby pro každou příležitost</h2>
            <p className={styles.sectionSubtitle}>
              Ať hledáte drobnou opravu nebo kompletní šití na míru, jsme tu pro vás.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {SERVICES.map((service) => (
              <div key={service.title} className={styles.serviceCard}>
                <div className={styles.serviceIcon}>{service.icon}</div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDesc}>{service.desc}</p>
                <p className={styles.servicePrice}>{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jak to funguje ── */}
      <section className={styles.howItWorks} id="jak-to-funguje">
        <div className={styles.howItWorksInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel} style={{ color: "var(--color-accent)" }}>
              Postup
            </span>
            <h2 className={styles.sectionTitle} style={{ color: "var(--color-white)" }}>
              Objednejte za 2 minuty
            </h2>
          </div>

          <div className={styles.howItWorksGrid}>
            {STEPS.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Připraveni začít?</h2>
          <p className={styles.ctaSubtitle}>
            Zaregistrujte se zdarma a objednejte prvního krejčího ještě dnes.
          </p>
          <Button href="/register" variant="primary" size="lg">
            Vytvořit účet zdarma
          </Button>
        </div>
      </section>
    </main>
  );
}
