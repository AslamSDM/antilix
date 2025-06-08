"use client";
import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { User, Wallet, Shield, Clock, Award, AlertCircle } from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import ProfileClientContent from "./ProfileClientContent";

export const dynamic = "force-dynamic";

const ProfilePage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileClientContent />
    </Suspense>
  );
};

export default ProfilePage;

// const ProfilePage: React.FC = () => {
//   const { connected: solanaConnected, publicKey } = useWallet();
//   const [activeTab, setActiveTab] = useState("overview");

//   // Mock data - in a real app, this would come from backend
//   const userData = {
//     username: solanaConnected
//       ? publicKey?.toString().slice(0, 6) +
//         "..." +
//         publicKey?.toString().slice(-4)
//       : "Guest User",
//     joinDate: "May 2025",
//     transactions: 0,
//     rewards: 0,
//     preferences: {
//       notifications: true,
//       theme: "dark",
//     },
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.1, delayChildren: 0.2 },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.5 },
//     },
//   };

//   return (
//     <div className="container mx-auto py-24 px-4 md:px-8 min-h-screen">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="text-center mb-12"
//       >
//         <h1 className="text-4xl md:text-5xl font-bold mb-4">
//           Your <span className="text-primary">Profile</span>
//         </h1>
//         <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
//           Connect your wallet to access exclusive features and track your gaming
//           history
//         </p>
//       </motion.div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Profile Sidebar */}
//         <motion.div
//           variants={itemVariants}
//           initial="hidden"
//           animate="visible"
//           className="lg:col-span-1"
//         >
//           <Card className="p-6 border border-border/50 bg-card/70 backdrop-blur-sm relative overflow-hidden">
//             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary/60 to-secondary/40"></div>

//             <div className="flex flex-col items-center space-y-4">
//               <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 flex items-center justify-center">
//                 <User size={40} className="text-primary" />
//               </div>

//               <h2 className="text-xl font-bold mt-4">{userData.username}</h2>

//               <div className="w-full">
//                 {!solanaConnected && (
//                   <div className="my-6">
//                     <p className="text-muted-foreground text-sm mb-4 text-center">
//                       Connect your wallet to view your full profile
//                     </p>
//                     <WalletConnectButton className="w-full" />
//                   </div>
//                 )}

//                 {solanaConnected && (
//                   <div className="space-y-4 w-full mt-4">
//                     <div className="flex justify-between items-center py-2 border-b border-border/30">
//                       <span className="text-muted-foreground">
//                         Member since
//                       </span>
//                       <span>{userData.joinDate}</span>
//                     </div>
//                     <div className="flex justify-between items-center py-2 border-b border-border/30">
//                       <span className="text-muted-foreground">
//                         Transactions
//                       </span>
//                       <span>{userData.transactions}</span>
//                     </div>
//                     <div className="flex justify-between items-center py-2 border-b border-border/30">
//                       <span className="text-muted-foreground">Rewards</span>
//                       <span>{userData.rewards}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </Card>
//         </motion.div>

//         {/* Profile Content */}
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="lg:col-span-2"
//         >
//           <Card className="border border-border/50 bg-card/70 backdrop-blur-sm overflow-hidden">
//             <div className="border-b border-border/50">
//               <div className="flex overflow-x-auto">
//                 <button
//                   onClick={() => setActiveTab("overview")}
//                   className={`px-6 py-4 font-medium text-sm ${
//                     activeTab === "overview"
//                       ? "border-b-2 border-primary text-primary"
//                       : "text-muted-foreground hover:text-foreground"
//                   }`}
//                 >
//                   Overview
//                 </button>
//                 <button
//                   onClick={() => setActiveTab("wallets")}
//                   className={`px-6 py-4 font-medium text-sm ${
//                     activeTab === "wallets"
//                       ? "border-b-2 border-primary text-primary"
//                       : "text-muted-foreground hover:text-foreground"
//                   }`}
//                 >
//                   Wallets
//                 </button>
//                 <button
//                   onClick={() => setActiveTab("activity")}
//                   className={`px-6 py-4 font-medium text-sm ${
//                     activeTab === "activity"
//                       ? "border-b-2 border-primary text-primary"
//                       : "text-muted-foreground hover:text-foreground"
//                   }`}
//                 >
//                   Activity
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               {activeTab === "overview" && (
//                 <div className="space-y-8">
//                   <motion.div
//                     variants={itemVariants}
//                     className="bg-muted/40 backdrop-blur-sm p-6 rounded-lg border border-border/40"
//                   >
//                     <div className="flex items-center mb-4">
//                       <Shield className="h-6 w-6 text-primary mr-2" />
//                       <h3 className="text-lg font-medium">Profile Status</h3>
//                     </div>

//                     {solanaConnected ? (
//                       <div className="flex items-center text-green-500">
//                         <Award className="mr-2 h-5 w-5" />
//                         <span>
//                           Your profile is active with a connected wallet
//                         </span>
//                       </div>
//                     ) : (
//                       <div className="flex items-center text-yellow-500">
//                         <AlertCircle className="mr-2 h-5 w-5" />
//                         <span>Connect your wallet to unlock all features</span>
//                       </div>
//                     )}
//                   </motion.div>

//                   <motion.div
//                     variants={itemVariants}
//                     className="grid grid-cols-1 md:grid-cols-2 gap-6"
//                   >
//                     <div className="bg-muted/40 backdrop-blur-sm p-6 rounded-lg border border-border/40">
//                       <div className="flex items-center mb-4">
//                         <Clock className="h-6 w-6 text-primary mr-2" />
//                         <h3 className="text-lg font-medium">Recent Activity</h3>
//                       </div>

//                       {solanaConnected ? (
//                         <p className="text-muted-foreground">
//                           No recent activity to display.
//                         </p>
//                       ) : (
//                         <p className="text-muted-foreground">
//                           Connect wallet to view your activity.
//                         </p>
//                       )}
//                     </div>

//                     <div className="bg-muted/40 backdrop-blur-sm p-6 rounded-lg border border-border/40">
//                       <div className="flex items-center mb-4">
//                         <Award className="h-6 w-6 text-primary mr-2" />
//                         <h3 className="text-lg font-medium">Rewards</h3>
//                       </div>

//                       {solanaConnected ? (
//                         <p className="text-muted-foreground">
//                           No rewards earned yet.
//                         </p>
//                       ) : (
//                         <p className="text-muted-foreground">
//                           Connect wallet to view your rewards.
//                         </p>
//                       )}
//                     </div>
//                   </motion.div>
//                 </div>
//               )}

//               {activeTab === "wallets" && (
//                 <div className="space-y-6">
//                   <motion.div
//                     variants={itemVariants}
//                     className="bg-muted/40 backdrop-blur-sm p-6 rounded-lg border border-border/40"
//                   >
//                     <div className="flex items-center mb-4">
//                       <Wallet className="h-6 w-6 text-primary mr-2" />
//                       <h3 className="text-lg font-medium">Connected Wallets</h3>
//                     </div>

//                     <div className="space-y-4">
//                       {solanaConnected ? (
//                         <div className="flex justify-between items-center">
//                           <div className="flex items-center">
//                             <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
//                               <span className="text-xs">SOL</span>
//                             </div>
//                             <div>
//                               <p className="font-medium">Solana Wallet</p>
//                               <p className="text-sm text-muted-foreground">
//                                 {publicKey?.toString().slice(0, 10)}...
//                                 {publicKey?.toString().slice(-6)}
//                               </p>
//                             </div>
//                           </div>
//                           <WalletConnectButton />
//                         </div>
//                       ) : (
//                         <div className="text-center py-6">
//                           <p className="text-muted-foreground mb-4">
//                             No wallets connected
//                           </p>
//                           <WalletConnectButton className="mx-auto" />
//                         </div>
//                       )}
//                     </div>
//                   </motion.div>
//                 </div>
//               )}

//               {activeTab === "activity" && (
//                 <div className="space-y-6">
//                   <motion.div
//                     variants={itemVariants}
//                     className="bg-muted/40 backdrop-blur-sm p-6 rounded-lg border border-border/40"
//                   >
//                     <div className="flex items-center mb-4">
//                       <Clock className="h-6 w-6 text-primary mr-2" />
//                       <h3 className="text-lg font-medium">
//                         Transaction History
//                       </h3>
//                     </div>

//                     {solanaConnected ? (
//                       <div className="text-center py-8">
//                         <p className="text-muted-foreground">
//                           No transactions found.
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="text-center py-8">
//                         <p className="text-muted-foreground mb-4">
//                           Connect your wallet to view transaction history
//                         </p>
//                         <WalletConnectButton className="mx-auto" />
//                       </div>
//                     )}
//                   </motion.div>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;
