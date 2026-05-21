"use client";

import React, { useContext, useState } from "react";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { IoIosCheckmarkCircleOutline } from "react-icons/io";

import { HiMiniSparkles } from "react-icons/hi2";
import { Checkbox } from "@/components/ui/checkbox";
import { FaDatabase } from "react-icons/fa";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { SessionContext } from "@/app/components/contexts/SessionContext";
import { RouterContext } from "../contexts/RouterContext";
import { CollectionContext } from "../contexts/CollectionContext";

const StartDialog: React.FC = () => {
  const { changePage } = useContext(RouterContext);
  const dontShowAgainKey = "ELYSIA_START_DIALOG_DONT_SHOW_AGAIN";
  const { correctSettings } = useContext(SessionContext);
  const { collections } = useContext(CollectionContext);
  const [open, setOpen] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      const dontShow = localStorage.getItem(dontShowAgainKey);
      return dontShow ? false : true;
    }
    return true; // Default to showing dialog on server-side render
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [invalidSettings, setInvalidSettings] = useState(false);

  useEffect(() => {
    if (correctSettings) {
      const hasIncorrectSettings = Object.values(correctSettings).some(
        (setting) => !setting
      );
      if (!hasIncorrectSettings) {
        setInvalidSettings(false);
      } else {
        if (collections.length === 0) {
          setInvalidSettings(true);
        }
      }
    }
  }, [correctSettings]);

  const handleCheck = () => {
    setDontShowAgain((prev) => !prev);
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(dontShowAgainKey, "true");
    }
    setOpen(false);
  };

  const handleSetupElysia = () => {
    changePage("settings");
    if (dontShowAgain) {
      localStorage.setItem(dontShowAgainKey, "true");
    }
    setOpen(false);
  };

  const handleElysiaDocs = () => {
    changePage("documentation", {}, true);
    if (dontShowAgain) {
      localStorage.setItem(dontShowAgainKey, "true");
    }
    setOpen(false);
  };

  const handleWeaviateCloud = () => {
    window.open("https://console.weaviate.cloud/", "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
        <div className="max-h-full overflow-y-auto space-y-4">
          <DialogHeader>
            <DialogTitle className="flex gap-3 items-center justify-start">
              <p className="text-primary text-3xl font-bold">
                Benvenuto in Elysia!
              </p>
            </DialogTitle>
            <DialogDescription className="flex justify-start">
              Release open source
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-4">
              <p>
                Elysia è la tua nuova piattaforma open source di AI agentica,
                potenziata da <strong> Weaviate </strong>. Importa i tuoi dati
                e inizia a esplorarli con la potenza dell&apos;AI agentica.
              </p>
              {invalidSettings ? (
                <div className="flex flex-col gap-2">
                  <p>
                    Per iniziare, vai nella pagina Impostazioni: puoi collegare
                    il tuo cluster Weaviate e scegliere i modelli AI preferiti.
                  </p>
                  <p>
                    Ti serve un cluster Weaviate? Visita la Weaviate Cloud
                    Console: puoi creare un account gratuito e iniziare a
                    importare i dati in pochi minuti.
                  </p>
                </div>
              ) : (
                <p>
                  Ottimo lavoro! Sembra che le impostazioni siano già pronte.
                  Puoi iniziare aggiungendo i dati esistenti a Elysia tramite
                  la console Weaviate. Elysia analizzerà i tuoi dati e creerà
                  un processo di ragionamento agentico per navigarli.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="flex flex-col justify-between w-full gap-4">
              <div className="flex w-full justify-start gap-2 items-center">
                <Checkbox
                  id="dontshowagain"
                  checked={dontShowAgain}
                  onCheckedChange={handleCheck}
                />
                <p className="text-sm text-secondary">Non mostrare più</p>
              </div>
              <motion.div
                className="flex flex-col lg:flex-row w-full justify-center gap-2 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    scale: 1.05,
                    rotate: [-1, 1, -1, 0],
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="w-full"
                >
                  <Button
                    variant="default"
                    className="w-full "
                    onClick={handleElysiaDocs}
                  >
                    <HiMiniSparkles />
                    Documentazione Elysia
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    scale: 1.05,
                    rotate: [-1, 1, -1, 0],
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-full"
                >
                  <Button
                    variant="default"
                    className="w-full "
                    onClick={handleWeaviateCloud}
                  >
                    <FaDatabase />
                    Weaviate Cloud
                  </Button>
                </motion.div>
                {invalidSettings ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotate: [0, -1, 1, -1, 1, 0], // Subtle rotation wiggle
                    }}
                    whileHover={{
                      scale: 1.05,
                      rotate: [-1, 1, -1, 0],
                      transition: { duration: 0.3 },
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3,
                      rotate: {
                        repeat: Infinity,
                        repeatType: "reverse" as const,
                        duration: 2, // Much slower - 2 seconds per cycle
                        delay: 1.5, // Start wiggling after initial animation
                        ease: "easeInOut", // Smoother transition
                      },
                    }}
                    className="w-full"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 10px rgba(96, 165, 250, 0.3), 0 0 15px rgba(96, 165, 250, 0.2), 0 0 25px rgba(96, 165, 250, 0.05)",
                          "0 0 10px rgba(168, 85, 247, 0.3), 0 0 15px rgba(168, 85, 247, 0.2), 0 0 25px rgba(168, 85, 247, 0.05)",
                          "0 0 10px rgba(236, 72, 153, 0.3), 0 0 15px rgba(236, 72, 153, 0.2), 0 0 25px rgba(236, 72, 153, 0.05)",
                          "0 0 10px rgba(168, 85, 247, 0.3), 0 0 15px rgba(168, 85, 247, 0.2), 0 0 25px rgba(168, 85, 247, 0.05)",
                          "0 0 10px rgba(96, 165, 250, 0.3), 0 0 15px rgba(96, 165, 250, 0.2), 0 0 25px rgba(96, 165, 250, 0.05)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-full rounded-md"
                    >
                      <Button
                        className="w-full relative overflow-hidden"
                        variant="default"
                        onClick={handleSetupElysia}
                      >
                        <IoIosCheckmarkCircleOutline className="text-white" />
                        <motion.span
                          animate={{
                            backgroundPosition: [
                              "0% 50%",
                              "100% 50%",
                              "0% 50%",
                            ],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-[length:200%_100%] bg-clip-text text-transparent font-semibold"
                        >
                          Configura Elysia
                        </motion.span>
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                      scale: 1.05,
                      rotate: [-1, 1, -1, 0],
                      transition: { duration: 0.3 },
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full"
                  >
                    <Button
                      className="w-full text-primary"
                      onClick={handleClose}
                    >
                      <IoIosCheckmarkCircleOutline />
                      Avvia Elysia
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartDialog;
