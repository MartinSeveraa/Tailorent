"use client";
// src/app/register/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./register.module.scss";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Něco se pokazilo.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left — branding */}
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <p className={styles.leftLabel}>Nový účet</p>
          <h1 className={styles.leftTitle}>
            Prémiové<br />krejčovství<br /><em>u vás doma</em>
          </h1>
          <p className={styles.leftSub}>
            Registrace je zdarma a zabere méně než minutu.
          </p>
        </div>
        <div className={styles.leftFooter}>
          © {new Date().getFullYear()} Tailorent s.r.o.
        </div>
      </div>

      {/* Right — form */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>Vytvořit účet</h2>
          <p className={styles.formSub}>
            Již máte účet?{" "}
            <Link href="/login" className={styles.formLink}>
              Přihlaste se
            </Link>
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">
                Jméno a příjmení
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Jan Novák"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="jan@example.cz"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Heslo
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Alespoň 8 znaků"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.submit}
              disabled={loading}
            >
              {loading ? "Registruji..." : "Vytvořit účet"}
            </button>
          </form>

          <p className={styles.terms}>
            Registrací souhlasíte s{" "}
            <Link href="/podminky" className={styles.formLink}>
              obchodními podmínkami
            </Link>{" "}
            a{" "}
            <Link href="/gdpr" className={styles.formLink}>
              ochranou osobních údajů
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
