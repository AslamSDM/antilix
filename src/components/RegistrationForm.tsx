"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useReferralSystem from "../hooks/useReferralSystem";
import { extractReferralCodeFromUrl } from "@/lib/referral";

interface RegistrationFormProps {
  onSubmit: (userData: {
    email: string;
    username: string;
    password: string;
    referralCode?: string;
  }) => Promise<{ success: boolean; userId?: string; error?: string }>;
  className?: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const { applyStoredReferralToUser } = useReferralSystem();

  // Check for referral code in URL when component mounts
  useEffect(() => {
    const urlReferralCode = extractReferralCodeFromUrl();
    if (urlReferralCode) {
      setReferralCode(urlReferralCode);
      validateReferralCode(urlReferralCode);
    }
  }, []);

  // Validate referral code
  const validateReferralCode = async (code: string) => {
    if (!code) {
      setReferrerName(null);
      return;
    }

    setIsValidatingReferral(true);

    try {
      const response = await fetch(`/api/referrals/validate?code=${code}`);
      const data = await response.json();

      if (data.valid) {
        setReferrerName(data.referrerName);
      } else {
        setReferrerName(null);
        setError(`Invalid referral code: ${data.message}`);
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      setError("Failed to validate referral code");
    } finally {
      setIsValidatingReferral(false);
    }
  };

  // Handle referral code change
  const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setReferralCode(code);

    // Debounce validation to avoid too many API calls while typing
    const timer = setTimeout(() => {
      if (code) validateReferralCode(code);
    }, 500);

    return () => clearTimeout(timer);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit({
        email,
        username,
        password,
        referralCode: referralCode || undefined,
      });

      if (result.success && result.userId) {
        setNewUserId(result.userId);

        // Apply the referral code if it exists
        if (referralCode) {
          await applyStoredReferralToUser(result.userId);
        }

        setRegistrationSuccess(true);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-md w-full ${className}`}>
      {registrationSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 backdrop-blur-md p-6 rounded-lg text-center"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Registration Successful!
          </h2>
          <p className="text-gray-300 mb-6">
            Welcome to Antilix! Check your email to verify your account.
          </p>
          {referrerName && (
            <p className="text-gray-300 mb-4">
              You were referred by{" "}
              <span className="font-semibold text-white">{referrerName}</span>
            </p>
          )}
          <button
            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-2 rounded-md"
            onClick={() => (window.location.href = "/profile")}
          >
            Go to Profile
          </button>
        </motion.div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-black/30 backdrop-blur-md p-6 rounded-lg"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            Create an Account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-white">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/50 border border-gray-700 rounded-md px-4 py-2 text-white"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-black/50 border border-gray-700 rounded-md px-4 py-2 text-white"
              placeholder="Choose a username"
              minLength={3}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/50 border border-gray-700 rounded-md px-4 py-2 text-white"
              placeholder="Create a secure password"
              minLength={8}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="referralCode" className="block text-gray-300 mb-1">
              Referral Code (Optional)
            </label>
            <input
              id="referralCode"
              type="text"
              value={referralCode}
              onChange={handleReferralCodeChange}
              className="w-full bg-black/50 border border-gray-700 rounded-md px-4 py-2 text-white"
              placeholder="Enter referral code"
            />
            {isValidatingReferral && (
              <p className="mt-1 text-sm text-gray-400">
                Validating referral code...
              </p>
            )}
            {referrerName && (
              <p className="mt-1 text-sm text-green-500">
                Referred by: {referrerName}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 rounded-md hover:opacity-90 transition disabled:opacity-70"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          <p className="mt-4 text-center text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 hover:text-blue-300">
              Log in
            </a>
          </p>
        </form>
      )}
    </div>
  );
};

export default RegistrationForm;
