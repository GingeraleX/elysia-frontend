import type { Metadata } from "next";
import LoginForm from "@/app/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In - Elysia",
  description: "Sign in to your Elysia account",
};

export default function LoginPage() {
  return <LoginForm />;
}
