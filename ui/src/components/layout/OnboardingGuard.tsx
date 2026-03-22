'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/services/storage';

export function OnboardingGuard({
    children
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip check if already on onboarding
        if (pathname === '/onboarding') return;

        // Check localStorage for onboarding status
        const onboarded = storage.isOnboarded();
        if (!onboarded) {
            router.push('/onboarding');
        }
    }, [pathname, router]);

    return <>{children}</>;
}
