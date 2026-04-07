"use client";
// src/app/login/page.tsx
import { Suspense } from "react";
import LoginForm from "./loginForm";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}