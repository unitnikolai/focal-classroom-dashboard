'use client';

import SignInForm from "@/components/auth/SignInForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        // User is already authenticated, redirect to dashboard
        router.push('/');
      } catch (error) {
        // User not authenticated, allow signin page to show
      }
    };

    checkAuth();
  }, [router]);

  return <SignInForm />;
}
