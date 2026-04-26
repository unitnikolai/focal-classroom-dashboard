import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Focal Dashboard",
  description: "Reset your Focal account password",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
