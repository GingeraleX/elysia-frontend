"use client";

import React, { useContext, useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { CollectionContext } from "@/app/components/contexts/CollectionContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { GoTrash } from "react-icons/go";
import { IoIosWarning } from "react-icons/io";
import { PiMagicWandFill } from "react-icons/pi";
import { SlOptionsVertical } from "react-icons/sl";

import { Collection, Toast } from "@/app/types/objects";
import { deleteCollection as deleteWeaviateCollection } from "@/app/api/deleteCollection";

// Utility function to format numbers with dots for thousands
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("it-IT").format(num);
};

// Wave animation component for processing text
const WaveText = ({ text }: { text: string }) => {
  const letters = text.split("");

  return (
    <div className={`flex overflow-hidden`}>
      <div className="flex truncate">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            className="inline-block flex-shrink-0"
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "loop",
              delay: index * 0.1,
              repeatDelay: 1.5,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

interface DashboardButtonProps {
  collection: Collection;
  selectCollection: (collection: Collection) => void;
  triggerAnalysis: (collectionName: string, tenantId: string) => Promise<void>;
  user_id: string;
  currentToasts: Toast[];
  unprocessed: boolean;
  deleteCollection: (collection_name: string) => void;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({
  collection,
  selectCollection,
  triggerAnalysis,
  user_id,
  currentToasts,
  unprocessed,
  deleteCollection,
}) => {
  // Use fetchCollections from context so "Delete from Weaviate" can refresh the
  // list without calling deleteCollectionMetadata again (already gone → 404).
  const { fetchCollections } = useContext(CollectionContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(0);

  // Spring animation for counting up numbers
  const springValue = useSpring(0, {
    stiffness: 200,
    damping: 25,
    restDelta: 0.001,
  });

  // Subscribe to spring value changes
  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayNumber(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  // Animate to target value when component mounts
  useEffect(() => {
    if (!hasAnimated && !unprocessed) {
      springValue.set(collection.total);
      setHasAnimated(true);
    }
  }, [collection.total, springValue, hasAnimated, unprocessed]);

  useEffect(() => {
    setIsProcessing(
      currentToasts.some((toast) => toast.collection_name === collection.name)
    );
    setProgress(
      currentToasts.find((toast) => toast.collection_name === collection.name)
        ?.progress ?? 0
    );
  }, [currentToasts, collection.name]);

  return (
    <motion.div
      key={collection.name}
      className="flex justify-between items-center w-full gap-2"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
    >
      {/* Main clickable button with border and badge */}
      <motion.div
        className="flex min-h-11 items-center justify-between w-full border border-border/60 hover:border-border bg-background hover:bg-foreground_alt/50 px-3 py-2 rounded-md cursor-pointer transition-colors duration-200 gap-3"
        onClick={() => selectCollection(collection)}
        whileHover={{
          scale: 1.005,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
        whileTap={{ scale: 0.995 }}
      >
        {/* Collection name */}
        <motion.p
          className="truncate flex-1 text-sm text-primary max-w-[9rem] lg:max-w-[20rem]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {collection.name}
        </motion.p>

        {/* Badge with count or warning */}
        <motion.div
          className={`flex items-center justify-center ${
            unprocessed
              ? "bg-warning/10 text-warning"
              : "bg-highlight/10 text-highlight"
          } rounded-md px-2.5 py-1 flex-shrink-0 min-w-[3rem]`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 10,
          }}
          whileHover={{
            scale: 1.1,
            transition: { type: "spring", stiffness: 400, damping: 10 },
          }}
        >
          {unprocessed ? (
            <IoIosWarning size={16} className="flex-shrink-0" />
          ) : (
            <motion.span
              className="text-xs font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {formatNumber(displayNumber)}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="flex"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {!isProcessing && collection.processed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary hover:text-primary transition-colors duration-200"
              >
                <SlOptionsVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem
                onClick={() => {
                  triggerAnalysis(collection.name, user_id);
                }}
                className="text-secondary hover:text-primary"
              >
                <PiMagicWandFill />
                <span>Riesegui analisi</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  deleteCollection(collection.name);
                }}
                className="text-secondary hover:text-error"
              >
                <GoTrash />
                <span>Cancella analisi</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const result = await deleteWeaviateCollection(collection.name);
                  if (result.status === "success") {
                    // deleteWeaviateCollection already deletes everything (Analysis,
                    // Collection registry, Weaviate class). Calling deleteCollection
                    // here would try to DELETE the already-gone metadata → 404 → error toast.
                    // Just refresh the list instead.
                    await fetchCollections();
                  }
                }}
                className="text-secondary hover:text-destructive"
              >
                <GoTrash />
                <span>Elimina da Weaviate</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!collection.processed && !isProcessing && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              triggerAnalysis(collection.name, user_id);
            }}
            className="text-highlight border-highlight border bg-highlight/10 hover:bg-highlight/20"
            variant="outline"
          >
            <span>Analizza</span>
          </Button>
        )}
        {isProcessing && (
          <Button
            disabled={isProcessing}
            variant="outline"
            className="text-highlight border-highlight border bg-highlight/10 hover:bg-highlight/20"
          >
            <WaveText text={`Analisi in corso... ${progress}%`} />
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DashboardButton;
