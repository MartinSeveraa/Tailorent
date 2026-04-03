"use client";
// src/app/login/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered");

  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Nesprávný e-mail nebo heslo.");
        return;
      }

      router.push("/dashboard");
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
          <p className={styles.leftLabel}>Přihlášení</p>
          <h1 className={styles.leftTitle}>
            Vítejte<br /><em>zpět</em>
          </h1>
          <p className={styles.leftSub}>
            Spravujte své objednávky a sledujte jejich stav v reálném čase.
          </p>
        </div>
        <div className={styles.leftFooter}>
          © {new Date().getFullYear()} Tailorent s.r.o.
        </div>
      </div>

      {/* Right — form */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>Přihlásit se</h2>
          <p className={styles.formSub}>
            Nemáte účet?{" "}
            <Link href="/register" className={styles.formLink}>
              Zaregistrujte se
            </Link>
          </p>

          {registered && (
            <div className={styles.success}>
              Registrace proběhla úspěšně. Nyní se přihlaste.
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
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
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Vaše heslo"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.submit}
              disabled={loading}
            >
              {loading ? "Přihlašuji..." : "Přihlásit se"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
