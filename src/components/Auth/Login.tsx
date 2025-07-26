'use client'
import {
    Banner,
    BlockStack,
    Button,
    Card,
    Form,
    FormLayout,
    Layout,
    Page,
    Text,
    TextField,
} from '@shopify/polaris';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, clearError } = useAuth();
    const router = useRouter();

    const handleSubmit = useCallback(async () => {
        clearError();
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            // Error is handled by context
        }
    }, [email, password, login, router, clearError]);

    return (
        <Page title="Login">
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">Sign in to your account</Text>

                            {error && (
                                <Banner tone="critical" onDismiss={clearError}>
                                    <p>{error}</p>
                                </Banner>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <FormLayout>
                                    <TextField
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={setEmail}
                                        autoComplete="email"
                                        disabled={loading}
                                    />

                                    <TextField
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={setPassword}
                                        autoComplete="current-password"
                                        disabled={loading}
                                    />

                                    <Button
                                        submit
                                        variant="primary"
                                        loading={loading}
                                        disabled={!email || !password}
                                    >
                                        {loading ? 'Signing in...' : 'Sign in'}
                                    </Button>

                                    <Text variant="bodyMd" as="p">
                                        Don't have an account?{' '}
                                        <Link href="/register" style={{ textDecoration: 'none', color: '#008060' }}>
                                            Register here
                                        </Link>
                                    </Text>
                                </FormLayout>
                            </Form>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default Login;
