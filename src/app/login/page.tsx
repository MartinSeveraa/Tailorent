"use client";
// src/app/login/page.tsx
<<<<<<< HEAD
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered");
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.replace(role === "ADMIN" ? "/admin/orders" : "/dashboard");
    }
  }, [session, status, role, router]);

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

=======
import { Suspense } from "react";
import LoginForm from "./loginForm";

export default function LoginPage() {
>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}