'use client';

import SignInForm from "@/components/auth/SignInForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import { isLoggedIn } from "@/lib/auth-client";

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) router.push('/');
  }, [router]);

  return <SignInForm />;
}
