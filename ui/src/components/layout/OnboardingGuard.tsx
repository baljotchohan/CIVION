'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

        // Check if user has completed onboarding
        const onboarded = localStorage.getItem('civion_onboarded');
        if (!onboarded) {
            // Verify with backend
            fetch('/api/v1/nick/profile')
                .then(r => r.json())
                .then(data => {
                    if (!data.name) {
                        router.push('/onboarding');
                    } else {
                        localStorage.setItem('civion_onboarded', '1');
                    }
                })
                .catch(() => {
                    // Backend offline — don't redirect
                });
        }
    }, [pathname, router]);

    return <>{children}</>;
}
