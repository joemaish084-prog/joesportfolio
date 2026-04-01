import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState("");
  const fullText = "Digital Marketing Specialist";

  useEffect(() => {
    // Check skip preference
    if (sessionStorage.getItem("splash-seen")) {
      setShow(false);
      onComplete();
      return;
    }

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + 100 / 62.5; // 2.5s at ~16ms intervals ≈ 62.5 ticks
      });
    }, 40);

    // Typing effect with delay
    let charIndex = 0;
    const typingTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          setTypedText(fullText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
      return () => clearInterval(typeInterval);
    }, 600);

    // Exit after 2.5s
    const exitTimeout = setTimeout(() => {
      sessionStorage.setItem("splash-seen", "1");
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(typingTimeout);
      clearTimeout(exitTimeout);
    };
  }, [onComplete]);

  const handleSkip = () => {
    sessionStorage.setItem("splash-seen", "1");
    setShow(false);
    setTimeout(onComplete, 500);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Name with glow */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-foreground"
            style={{
              textShadow: "0 0 40px hsl(var(--primary) / 0.4), 0 0 80px hsl(var(--primary) / 0.2)",
            }}
          >
            Joseph <span className="text-gradient">Maina</span>
          </motion.h1>

          {/* Typing subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-lg sm:text-xl text-muted-foreground font-medium h-7"
          >
            {typedText}
            <span className="animate-pulse text-primary">|</span>
          </motion.p>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.04 }}
            />
          </div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleSkip}
            className="absolute bottom-8 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Skip →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
