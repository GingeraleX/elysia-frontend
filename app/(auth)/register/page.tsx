import type { Metadata } from "next";
import RegisterForm from "@/app/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account - Elysia",
  description: "Create your Elysia account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
