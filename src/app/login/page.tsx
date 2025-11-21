"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useUser } from "@/providers/user-provider";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthLayout from "../auth-layout";

function LoginContent() {
  // NO REDIRECT LOGIC HERE - LoginForm handles all redirects
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <LoginContent />
      </Suspense>
    </AuthLayout>
  );
}