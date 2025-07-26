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

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, loading, error, clearError } = useAuth();
    const router = useRouter();

    const handleSubmit = useCallback(async () => {
        clearError();

        if (password !== confirmPassword) {
            return;
        }

        try {
            await register(email, password);
            router.push('/dashboard');
        } catch (err) {
            // Error is handled by context
        }
    }, [email, password, confirmPassword, register, router, clearError]);

    const passwordMismatch = password !== confirmPassword && confirmPassword.length > 0;

    return (
        <Page title="Register">
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">Create your account</Text>

                            {error && (
                                <Banner tone="critical" onDismiss={clearError}>
                                    <p>{error}</p>
                                </Banner>
                            )}

                            {passwordMismatch && (
                                <Banner tone="warning">
                                    <p>Passwords do not match</p>
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
                                        autoComplete="new-password"
                                        disabled={loading}
                                        helpText="Password must be at least 6 characters long"
                                    />

                                    <TextField
                                        label="Confirm Password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        autoComplete="new-password"
                                        disabled={loading}
                                        error={passwordMismatch ? 'Passwords do not match' : undefined}
                                    />

                                    <Button
                                        submit
                                        variant="primary"
                                        loading={loading}
                                        disabled={!email || !password || !confirmPassword || passwordMismatch || password.length < 6}
                                    >
                                        {loading ? 'Creating account...' : 'Create account'}
                                    </Button>

                                    <Text variant="bodyMd" as="p">
                                        Already have an account?{' '}
                                        <Link href="/login" style={{ textDecoration: 'none', color: '#008060' }}>
                                            Sign in here
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

export default Register;
