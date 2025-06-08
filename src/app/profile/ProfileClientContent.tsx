"use client";
import React, { useState, Suspense } from "react";
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
import { WalletSelectorButton } from "@/components/WalletSelectorButton";
import { WalletReferralButton } from "@/components/WalletReferralButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEthereumWallet } from "@/components/providers/wallet-provider";

const Spline = React.lazy(() => import("@splinetool/react-spline"));

const ProfileClientContent: React.FC = () => {
  const { connected: solanaConnected, publicKey } = useWallet();
  const { address: ethAddress, isConnected: ethConnected } =
    useEthereumWallet();
  const [activeTab, setActiveTab] = useState("overview");
  const [walletType, setWalletType] = useState<"ethereum" | "solana" | null>(
    null
  );

  const anyWalletConnected = solanaConnected || ethConnected;

  // Handle wallet connection
  const handleWalletConnect = (type: "ethereum" | "solana") => {
    setWalletType(type);
    console.log(`${type} wallet connected`);
  };

  // Get display username based on wallet
  const getDisplayUsername = () => {
    if (solanaConnected && publicKey) {
      return (
        publicKey.toString().slice(0, 6) +
        "..." +
        publicKey.toString().slice(-4)
      );
    }

    if (ethConnected && ethAddress) {
      return ethAddress.slice(0, 6) + "..." + ethAddress.slice(-4);
    }

    return "Guest User";
  };

  const userData = {
    username: getDisplayUsername(),
    joinDate: "May 2025",
    transactions: 0,
    rewards: 0,
    preferences: {
      notifications: true,
      theme: "dark",
    },
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
    <div className="container mx-auto py-24 px-4 md:px-8 min-h-screen relative">
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
          Connect your wallet to access exclusive features and track your gaming
          history
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
                {!solanaConnected && (
                  <div className="my-6">
                    <p className="text-muted-foreground text-sm mb-4 text-center">
                      Connect your wallet to view your full profile
                    </p>
                    <Suspense
                      fallback={
                        <div className="w-full h-12 bg-gray-200 animate-pulse rounded-md" />
                      }
                    >
                      <WalletSelectorButton className="w-full" />
                    </Suspense>
                  </div>
                )}

                {solanaConnected && (
                  <div className="space-y-4 w-full mt-4">
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
                  onClick={() => setActiveTab("overview")}
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
                  onClick={() => setActiveTab("wallets")}
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
                  onClick={() => setActiveTab("activity")}
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
                  onClick={() => setActiveTab("referrals")}
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

                    {solanaConnected ? (
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
                          Your profile is active with a connected wallet
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-primary">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <AlertCircle className="mr-2 h-5 w-5" />
                        </motion.div>
                        <span className="text-white/90">
                          Connect your wallet to unlock all features
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

                      {solanaConnected ? (
                        <p className="text-white/70">
                          No recent activity to display.
                        </p>
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
                          Rewards
                        </h3>
                      </div>

                      {solanaConnected ? (
                        <p className="text-white/70">No rewards earned yet.</p>
                      ) : (
                        <p className="text-white/70">
                          Connect wallet to view your rewards.
                        </p>
                      )}
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
                      {solanaConnected ? (
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
                              <span className="text-xs text-primary font-bold">
                                SOL
                              </span>
                            </motion.div>
                            <div>
                              <p className="font-medium text-white">
                                Solana Wallet
                              </p>
                              <p className="text-sm text-primary/80">
                                {publicKey?.toString().slice(0, 10)}...
                                {publicKey?.toString().slice(-6)}
                              </p>
                            </div>
                          </div>
                          <WalletSelectorButton />
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
                            <WalletSelectorButton
                              className="mx-auto shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                              onConnect={handleWalletConnect}
                            />
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
                    <div className="flex items-center mb-4">
                      <Clock className="h-6 w-6 text-primary mr-2 animate-pulse-slow" />
                      <h3 className="text-lg font-medium luxury-text">
                        Transaction History
                      </h3>
                    </div>

                    {solanaConnected ? (
                      <div className="text-center py-10">
                        <motion.p
                          className="text-white/70"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          No transactions found.
                        </motion.p>
                      </div>
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
                          <WalletSelectorButton
                            className="mx-auto shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                            onConnect={handleWalletConnect}
                          />
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

                    {solanaConnected ? (
                      <div className="bg-black/20 p-6 rounded-lg">
                        <h4 className="text-primary mb-4 font-medium">
                          Wallet Verified Referrals
                        </h4>
                        <WalletReferralButton />
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <motion.p
                          className="text-white/70 mb-6"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Connect your wallet to generate verified referral
                          links
                        </motion.p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <WalletSelectorButton
                            className="mx-auto shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                            onConnect={handleWalletConnect}
                          />
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
