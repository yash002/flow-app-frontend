'use client'
import { AppProvider, Frame } from '@shopify/polaris';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkflowProvider } from '../contexts/WorkflowContext';

interface ClientProvidersProps {
    children: React.ReactNode;
}

const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
    return (
        <AppProvider i18n={{}}>
            <Frame>
                <AuthProvider>
                    <WorkflowProvider>
                        {children}
                    </WorkflowProvider>
                </AuthProvider>
            </Frame>
        </AppProvider>
    );
};

export default ClientProviders;
