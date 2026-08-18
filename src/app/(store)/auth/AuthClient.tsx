"use client";

import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/store/AuthForm";

export default function AuthClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <AuthForm next={next} />
    </div>
  );
}
