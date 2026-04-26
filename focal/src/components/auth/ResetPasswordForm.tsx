"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type Step = "request" | "confirm" | "done";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always advance to confirm step regardless of response —
      // the Lambda returns 200 even for unknown emails to prevent enumeration.
      if (res.ok) {
        setStep("confirm");
      } else {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send reset code");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmReset(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/confirm-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to reset password");
      }

      setStep("done");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to sign in
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        {step === "done" ? (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
                <svg
                  className="h-7 w-7 text-success-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Password reset!
            </h1>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Your password has been successfully updated. You can now sign in
              with your new password.
            </p>
            <Button className="w-full" size="sm" onClick={() => router.push("/signin")}>
              Go to sign in
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                {step === "request" ? "Forgot your password?" : "Check your email"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === "request"
                  ? "Enter your email address and we'll send you a reset code."
                  : `We sent a verification code to ${email}. Enter it below along with your new password.`}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {step === "request" ? (
              <form onSubmit={handleRequestReset}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="info@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button className="w-full" size="sm" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send reset code"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Verification code <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>
                      New password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>
                      Confirm new password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 px-4 py-3 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-transparent dark:hover:bg-white/5 transition-colors"
                      onClick={() => { setStep("request"); setError(""); }}
                    >
                      Resend code
                    </button>
                    <Button className="flex-1" size="sm" disabled={isLoading}>
                      {isLoading ? "Resetting..." : "Reset password"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
