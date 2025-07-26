'use client'
import { AlertCircleIcon, LoaderIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
    children,
    fallback,
    redirectTo = '/login'
}) => {
    const { user, loading, error } = useAuth();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!loading && !user && !isRedirecting) {
            setIsRedirecting(true);
            router.push(redirectTo);
        }
    }, [user, loading, router, redirectTo, isRedirecting]);

    if (loading) {
        return fallback || (
            <div style={{
                height: '100vh',
                backgroundColor: 'var(--color-bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '90vw'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <LoaderIcon
                            size={32}
                            color="var(--color-accent)"
                            style={{ animation: 'spin 1s linear infinite' }}
                        />
                        <div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: 'var(--color-text-primary)',
                                margin: '0 0 8px 0'
                            }}>
                                Loading Flow Builder
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--color-text-secondary)',
                                margin: 0
                            }}>
                                Verifying your session...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div style={{
                height: '100vh',
                backgroundColor: 'var(--color-bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-danger)',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '90vw'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <AlertCircleIcon
                            size={32}
                            color="var(--color-danger)"
                        />
                        <div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: 'var(--color-text-primary)',
                                margin: '0 0 8px 0'
                            }}>
                                Authentication Error
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--color-danger)',
                                margin: '0 0 8px 0'
                            }}>
                                {error}
                            </p>
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--color-text-muted)',
                                margin: 0
                            }}>
                                You will be redirected to the login page.
                            </p>
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => router.push(redirectTo)}
                            style={{
                                marginTop: '8px'
                            }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || isRedirecting) {
        return null;
    }

    return <>{children}</>;
};

export default PrivateRoute;
