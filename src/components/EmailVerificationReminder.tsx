import React from "react";
import { toast } from "sonner";

interface EmailVerificationReminderProps {
  email: string;
  className?: string;
}

export function EmailVerificationReminder({
  email,
  className,
}: EmailVerificationReminderProps) {
  const [isSending, setIsSending] = React.useState(false);

  const handleResendVerification = async () => {
    if (isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send verification email");
      }

      toast.success("Verification email sent. Please check your inbox.");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send verification email"
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-yellow-500 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div className="space-y-2 flex-1">
          <p className="text-sm text-yellow-400 font-medium">
            Please verify your email address
          </p>
          <p className="text-xs text-yellow-300/70">
            We've sent a verification email to <strong>{email}</strong>. Check
            your inbox and click the link to verify your account.
          </p>
          <button
            onClick={handleResendVerification}
            disabled={isSending}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      </div>
    </div>
  );
}
