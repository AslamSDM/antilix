"use client";
import React, { useState, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  User,
  Wallet,
  Shield,
  Clock,
  Award,
  AlertCircle,
  Share2,
} from "lucide-react";
import { useAppKitState, useAppKitAccount } from "@reown/appkit/react";
import { modal } from "@/components/providers/wallet-provider";
import { AppKitStateShape, getWalletType } from "@/components/hooks/usePresale";
import { Button } from "@/components/ui/button";
import { UserActivityHistory } from "@/components/UserActivityHistory";
import { UserBalanceDisplay } from "@/components/UserBalanceDisplay";
import { RecentActivitySummary } from "@/components/RecentActivitySummary";
const Spline = React.lazy(() => import("@splinetool/react-spline"));

const ProfileClientContent: React.FC = () => {
  const appKitState = useAppKitState() as AppKitStateShape;
  const appkitAccountData = useAppKitAccount();
  const { loading } = appKitState;

  // Get the tab from URL query parameter if available
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Only run in the browser, not during SSR
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (
        tab &&
        ["overview", "wallets", "activity", "referrals"].includes(tab)
      ) {
        return tab;
      }
    }
    return "overview";
  });

  const connected = appkitAccountData?.isConnected ?? false;
  const walletAddress = appkitAccountData?.address;

  const currentWalletType = getWalletType(appKitState, {
    isConnected: connected,
    caipAddress: appkitAccountData?.caipAddress,
  });

  // Mocked data, replace with actual data fetching as needed
  const userData = {
    username: walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "Guest User",
    joinDate: "May 2025", // Placeholder
    transactions: 0, // Placeholder
    rewards: 0, // Placeholder
    preferences: {
      notifications: true,
      theme: "dark",
    },
  };

  const handleConnect = () => {
    modal.open();
  };

  const handleDisconnect = () => {
    modal.disconnect();
  };

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // Update URL without full page reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="container mx-auto py-24 px-4 md:px-8 min-h-screen relative mt-24">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
          Your <span className="luxury-text">Profile</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto text-white/80">
          {connected
            ? "Manage your profile, view activity, and explore features."
            : "Connect your wallet to access exclusive features and track your gaming history"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Profile Sidebar */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1 space-y-8"
        >
          <Card className="p-6 border border-primary/30 bg-black/60 backdrop-blur-sm relative overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.1)] luxury-card">
            <div className="luxury-shimmer"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
            <div className="luxury-corner luxury-corner-tl"></div>
            <div className="luxury-corner luxury-corner-br"></div>

            <div className="flex flex-col items-center space-y-4">
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 flex items-center justify-center border border-primary/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <User size={40} className="text-primary" />
              </motion.div>

              <h2 className="text-xl font-bold mt-4 luxury-text">
                {userData.username}
              </h2>

              <div className="w-full">
                {!connected ? (
                  <div className="my-6">
                    <p className="text-muted-foreground text-sm mb-4 text-center">
                      Connect your wallet to view your full profile
                    </p>
                    <Button
                      onClick={handleConnect}
                      className="w-full bg-primary hover:bg-primary/90 text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                      disabled={loading}
                    >
                      {loading ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 w-full mt-4">
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="text-white/70">Wallet Type</span>
                      <span className="text-primary capitalize">
                        {currentWalletType || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="text-white/70">Status</span>
                      <span className="text-green-400">Connected</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="text-white/70">Member since</span>
                      <span className="text-primary">{userData.joinDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="text-white/70">Transactions</span>
                      <motion.span
                        className="text-primary"
                        animate={{
                          textShadow: [
                            "0 0 0px rgba(212,175,55,0)",
                            "0 0 5px rgba(212,175,55,0.5)",
                            "0 0 0px rgba(212,175,55,0)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {userData.transactions}
                      </motion.span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="text-white/70">Rewards</span>
                      <motion.span
                        className="text-primary"
                        animate={{
                          textShadow: [
                            "0 0 0px rgba(212,175,55,0)",
                            "0 0 5px rgba(212,175,55,0.5)",
                            "0 0 0px rgba(212,175,55,0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                      >
                        {userData.rewards}
                      </motion.span>
                    </div>
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      disabled={loading}
                    >
                      {loading ? "Disconnecting..." : "Disconnect Wallet"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Spline Logo Card */}
          <Card className="p-1 border border-primary/30 bg-black/60 backdrop-blur-sm relative overflow-hidden aspect-square shadow-[0_0_15px_rgba(212,175,55,0.1)] luxury-card animate-float">
            <div className="luxury-shimmer"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
            <div className="luxury-corner luxury-corner-tl"></div>
            <div className="luxury-corner luxury-corner-br"></div>
          </Card>
        </motion.div>

        {/* Profile Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <Card className="border border-primary/30 bg-black/60 backdrop-blur-sm overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.1)] luxury-card">
            <div className="luxury-shimmer"></div>
            <div className="border-b border-primary/20">
              <div className="flex overflow-x-auto">
                <motion.button
                  onClick={() => handleTabChange("overview")}
                  className={`px-6 py-4 font-medium text-sm transition-all duration-300 ${
                    activeTab === "overview"
                      ? "border-b-2 border-primary text-primary"
                      : "text-white/60 hover:text-white"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Overview
                </motion.button>
                <motion.button
                  onClick={() => handleTabChange("wallets")}
                  className={`px-6 py-4 font-medium text-sm transition-all duration-300 ${
                    activeTab === "wallets"
                      ? "border-b-2 border-primary text-primary"
                      : "text-white/60 hover:text-white"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Wallets
                </motion.button>
                <motion.button
                  onClick={() => handleTabChange("activity")}
                  className={`px-6 py-4 font-medium text-sm transition-all duration-300 ${
                    activeTab === "activity"
                      ? "border-b-2 border-primary text-primary"
                      : "text-white/60 hover:text-white"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Activity
                </motion.button>
                <motion.button
                  onClick={() => handleTabChange("referrals")}
                  className={`px-6 py-4 font-medium text-sm transition-all duration-300 ${
                    activeTab === "referrals"
                      ? "border-b-2 border-primary text-primary"
                      : "text-white/60 hover:text-white"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Referrals
                </motion.button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <motion.div
                    variants={itemVariants}
                    className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.05)] transform transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  >
                    <div className="flex items-center mb-4">
                      <Shield className="h-6 w-6 text-primary mr-2" />
                      <h3 className="text-lg font-medium luxury-text">
                        Profile Status
                      </h3>
                    </div>

                    {connected ? (
                      <div className="flex items-center text-primary">
                        <motion.div
                          animate={{
                            rotate: [0, 10, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Award className="mr-2 h-5 w-5" />
                        </motion.div>
                        <span className="text-white/90">
                          Your profile is active with a connected{" "}
                          {currentWalletType} wallet.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-primary">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <AlertCircle className="mr-2 h-5 w-5" />
                        </motion.div>
                        <span className="text-white/90">
                          Connect your wallet to unlock all features.
                        </span>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.05)] transform transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <div className="flex items-center mb-4">
                        <Clock className="h-6 w-6 text-primary mr-2 animate-pulse-slow" />
                        <h3 className="text-lg font-medium luxury-text">
                          Recent Activity
                        </h3>
                      </div>

                      {connected ? (
                        <RecentActivitySummary walletAddress={walletAddress} />
                      ) : (
                        <p className="text-white/70">
                          Connect wallet to view your activity.
                        </p>
                      )}
                    </div>

                    <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.05)] transform transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <div className="flex items-center mb-4">
                        <Award className="h-6 w-6 text-primary mr-2 animate-pulse-slow" />
                        <h3 className="text-lg font-medium luxury-text">
                          LMX Balance
                        </h3>
                      </div>

                      {/* Add the UserBalanceDisplay component */}
                      <UserBalanceDisplay />
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === "wallets" && (
                <div className="space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.05)] transform transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  >
                    <div className="flex items-center mb-4">
                      <Wallet className="h-6 w-6 text-primary mr-2 animate-pulse-slow" />
                      <h3 className="text-lg font-medium luxury-text">
                        Connected Wallets
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {connected && walletAddress ? (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <motion.div
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mr-3 border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                              whileHover={{ rotate: 10, scale: 1.1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 10,
                              }}
                            >
                              <span className="text-xs text-primary font-bold uppercase">
                                {currentWalletType?.substring(0, 3) || "N/A"}
                              </span>
                            </motion.div>
                            <div>
                              <p className="font-medium text-white capitalize">
                                {currentWalletType} Wallet
                              </p>
                              <p className="text-sm text-primary/80">
                                {`${walletAddress.slice(
                                  0,
                                  10
                                )}...${walletAddress.slice(-6)}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleDisconnect}
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            disabled={loading}
                          >
                            {loading ? "..." : "Disconnect"}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <motion.p
                            className="text-white/70 mb-5"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            No wallets connected
                          </motion.p>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={handleConnect}
                              className="mx-auto bg-primary hover:bg-primary/90 text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                              disabled={loading}
                            >
                              {loading ? "Connecting..." : "Connect Wallet"}
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.05)] transform transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  >
                    {/* Import and use the UserActivityHistory component */}
                    {connected ? (
                      <UserActivityHistory />
                    ) : (
                      <div className="text-center py-10">
                        <motion.p
                          className="text-white/70 mb-6"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Connect your wallet to view transaction history
                        </motion.p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleConnect}
                            className="mx-auto bg-primary hover:bg-primary/90 text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                            disabled={loading}
                          >
                            {loading ? "Connecting..." : "Connect Wallet"}
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}

              {activeTab === "referrals" && (
                <div className="space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.05)] transform transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  >
                    <div className="flex items-center mb-4">
                      <Share2 className="h-6 w-6 text-primary mr-2 animate-pulse-slow" />
                      <h3 className="text-lg font-medium luxury-text">
                        Referral Program
                      </h3>
                    </div>

                    <div className="mb-6">
                      <p className="text-white/80">
                        Sign with your wallet to verify ownership and generate a
                        unique referral code that you can share with friends.
                      </p>
                    </div>

                    {connected && currentWalletType === "solana" ? (
                      <div className="bg-black/20 p-6 rounded-lg">
                        <h4 className="text-primary mb-4 font-medium">
                          Wallet Verified Referrals (Solana)
                        </h4>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <motion.p
                          className="text-white/70 mb-6"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {connected && currentWalletType !== "solana"
                            ? "Referral signing currently requires a Solana wallet. Please connect or switch to a Solana wallet."
                            : "Connect your Solana wallet to generate verified referral links"}
                        </motion.p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleConnect} // This will open the modal for user to choose/switch
                            className="mx-auto bg-primary hover:bg-primary/90 text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                            disabled={loading}
                          >
                            {loading
                              ? "Connecting..."
                              : connected
                              ? "Switch Wallet"
                              : "Connect Wallet"}
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileClientContent;
