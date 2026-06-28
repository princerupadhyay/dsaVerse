import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#070B14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Spinner */}
        <div className="relative h-20 w-20">
          <motion.div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />

          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-blue-500"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "linear",
            }}
          />

          <motion.div
            className="absolute inset-3 rounded-full bg-cyan-400/20"
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
          />
        </div>

        {/* Logo */}
        <motion.h1
          className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        >
          DSAVerse
        </motion.h1>

        {/* Loading text */}
        <motion.p
          className="text-gray-400 text-sm tracking-widest uppercase"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
        >
          Loading your adventure...
        </motion.p>
      </div>
    </div>
  );
}
