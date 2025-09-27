"use client";

import * as React from "react";
import { useRouter } from 'next/navigation'; // Import the router
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import Link from "next/link";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { Plan } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";
import { PlanType } from "@/stores/homepage";

// Assuming Plan and PlanType are correctly exported from your store files

// PriceTag component remains the same
interface PriceTagProps {
    price: number;
    currency: string;
    type: PlanType;
    interval?: string | null;
}

function PriceTag({ price, currency, type, interval }: PriceTagProps) {
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(price);

    return (
        <div className="flex items-center justify-around gap-4 max-w-fit mx-auto">
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                    {formattedPrice}
                </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                    {type === 'one_time' ? 'One-Time Payment' : `${interval ?? 'Recurring'} Plan`}
                </span>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                    Get instant access
                </span>
            </div>
        </div>
    );
}


interface SmoothDrawerProps {
    plan: Plan;
    triggerButtonText?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onSecondaryAction?: () => void;
}

// Animation variants remain the same
const drawerVariants = { /* ... */ };
const itemVariants = { /* ... */ };

export default function SmoothDrawer({
    plan,
    triggerButtonText = "Purchase Plan",
    primaryButtonText = "Confirm Purchase",
    secondaryButtonText = "Maybe Later",
    onSecondaryAction,
}: SmoothDrawerProps) {
    // 1. Get user state and router
    const { user } = useAuthStore();
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSecondaryClick = () => {
        onSecondaryAction?.();
    };

    // 2. Create the click handler with the authentication check
    const handlePurchaseClick = () => {
        if (!user) {
            // If user is not logged in, redirect to the login page
            router.push('/login');
        } else {
            // If user is logged in, open the drawer
            setIsOpen(true);
        }
    };

    // Construct a checkout link for logged-in users
    const checkoutLink = `/checkout?plan=${plan.id}`;

    return (
        // 3. Control the Drawer's open state manually
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            {/* The trigger is now a regular button that calls our handler */}
            <Button className="w-full" onClick={handlePurchaseClick}>
                {triggerButtonText}
            </Button>
            <DrawerContent className="max-w-fit mx-auto p-6 rounded-2xl shadow-xl">
                <motion.div
                    variants={drawerVariants as any}
                    initial="hidden"
                    animate="visible"
                    className="mx-auto w-full max-w-[340px] space-y-6"
                >
                    <motion.div variants={itemVariants as any}>
                        <DrawerHeader className="px-0 space-y-2.5 text-center">
                            <DrawerTitle className="text-2xl font-semibold tracking-tighter">
                                {plan.name}
                            </DrawerTitle>
                            <DrawerDescription className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 tracking-tighter">
                                {plan.description || "A comprehensive package to boost your preparation."}
                            </DrawerDescription>
                        </DrawerHeader>
                    </motion.div>

                    <motion.div variants={itemVariants as any}>
                        <PriceTag
                            price={plan.price}
                            currency={plan.currency}
                            type={plan.type}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants as any}>
                        <DrawerFooter className="flex flex-col gap-3 px-0">
                            <div className="w-full">
                                <Link
                                    href={checkoutLink}
                                    className="group w-full relative overflow-hidden inline-flex items-center justify-center h-11 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 text-white text-sm font-semibold tracking-wide shadow-lg shadow-rose-500/20 transition-all duration-500 hover:shadow-xl hover:shadow-rose-500/30"
                                >
                                    <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%]" whileHover={{ x: ["-200%", "200%"] }} transition={{ duration: 1.5, ease: "easeInOut" }} />
                                    <div className="relative flex items-center gap-2 tracking-tighter">
                                        {primaryButtonText}
                                        <Fingerprint className="w-4 h-4" />
                                    </div>
                                </Link>
                            </div>
                            <DrawerClose asChild>
                                <Button
                                    variant="outline"
                                    onClick={handleSecondaryClick}
                                    className="w-full h-11 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-sm font-semibold transition-colors tracking-tighter"
                                >
                                    {secondaryButtonText}
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </motion.div>
                </motion.div>
            </DrawerContent>
        </Drawer>
    );
}