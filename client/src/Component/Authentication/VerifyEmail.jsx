"use client";

import { useState, useEffect } from "react";
import Button from "../UI/Button";
import Alert from "../UI/Alert";

const VerifyEmail = () => {
  // Get email from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email") || "";
  const token = urlParams.get("token");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [alert, setAlert] = useState(null);
  const [countdown, setCountdown] = useState(60);

  // Check if there's a verification token in the URL
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyEmail = async (token) => {
    setIsVerifying(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success scenario
      setAlert({ type: "success", message: "Email verified successfully!" });
      setIsVerified(true);

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Invalid or expired verification link. Please try again.",
      });
    } finally {
      setIsVerifying(false);

      // Remove alert after 5 seconds
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    }
  };

  const handleResendVerification = async () => {
    setIsVerifying(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success scenario
      setAlert({
        type: "success",
        message: "Verification email resent successfully!",
      });
      setCountdown(60);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to resend verification email. Please try again.",
      });
    } finally {
      setIsVerifying(false);

      // Remove alert after 5 seconds
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Verify your email
          </h1>
          {!isVerified && (
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification link to <strong>{email}</strong>
            </p>
          )}
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {isVerified ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Email verified
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your email has been successfully verified. Redirecting to
                      homepage...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm">
                Click the link in the email we sent you to verify your account.
                If you don't see it, check your spam folder.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleResendVerification}
                disabled={isVerifying || countdown > 0}
                variant="outline"
                className="w-full"
              >
                {isVerifying
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend verification email"}
              </Button>

              <div className="text-center text-sm">
                <p className="text-gray-600">
                  <a
                    href="/login"
                    className="font-medium text-black hover:underline"
                  >
                    Back to login
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
