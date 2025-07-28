'use client'
import {
    BlockStack,
    Checkbox,
    FormLayout,
    Modal,
    Select,
    TextField,
} from '@shopify/polaris';
import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';

interface NodeConfig {
    inputType?: string;
    defaultValue?: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    processType?: string;
    logic?: string;
    critical?: boolean;
    timeout?: string;
    enableRetry?: boolean;
    maxRetries?: string;
    outputFormat?: string;
    fileName?: string;
    emailTemplate?: string;
    emailSubject?: string;
    webhookUrl?: string;
    httpMethod?: string;
    includeTimestamp?: boolean;
    condition?: string;
    trueBranch?: string;
    falseBranch?: string;
    operatorType?: string;
    description?: string;
    [key: string]: unknown; // Allow additional properties
}

interface ConfigurationModalProps {
    node: Node;
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: NodeConfig) => void; // **FIX 1: Use NodeConfig instead of 'any'**
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
    node,
    isOpen,
    onClose,
    onSave,
}) => {
    const [config, setConfig] = useState<NodeConfig>(node.data.config || {});
    const [nodeLabel, setNodeLabel] = useState(node.data.label || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setConfig(node.data.config || {});
        setNodeLabel(node.data.label || '');
        setErrors({});
    }, [node]);

    const validateConfig = (): boolean => {
        const newErrors: Record<string, string> = {};
        const { type } = node.data;

        // Validate node label
        if (!nodeLabel.trim()) {
            newErrors.nodeLabel = 'Node label is required';
        }

        // Type-specific validation
        switch (type) {
            case 'input':
                if (!config.inputType) {
                    newErrors.inputType = 'Input type is required';
                }
                if (config.required && !config.defaultValue) {
                    newErrors.defaultValue = 'Default value is required for required inputs';
                }
                break;

            case 'process':
                if (!config.processType) {
                    newErrors.processType = 'Process type is required';
                }
                if (!config.logic || config.logic.trim() === '') {
                    newErrors.logic = 'Processing logic is required';
                }
                break;

            case 'condition':
                if (!config.condition || config.condition.trim() === '') {
                    newErrors.condition = 'Condition logic is required';
                }
                if (!config.trueBranch || config.trueBranch.trim() === '') {
                    newErrors.trueBranch = 'True branch label is required';
                }
                if (!config.falseBranch || config.falseBranch.trim() === '') {
                    newErrors.falseBranch = 'False branch label is required';
                }
                break;

            case 'output':
                if (!config.outputFormat) {
                    newErrors.outputFormat = 'Output format is required';
                }
                const fileFormats = ['csv', 'json', 'xml'];
                if (fileFormats.includes(config.outputFormat || '') && !config.fileName) {
                    newErrors.fileName = 'File name is required for file outputs';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateConfig()) {
            // Update node label
            node.data.label = nodeLabel;
            onSave(config);
        }
    };

    const renderConfigFields = () => {
        const { type } = node.data;

        switch (type) {
            case 'input':
                return (
                    <BlockStack gap="400">
                        <Select
                            label="Input Type *"
                            options={[
                                { label: 'Select input type', value: '' },
                                { label: 'Text', value: 'text' },
                                { label: 'Number', value: 'number' },
                                { label: 'Email', value: 'email' },
                                { label: 'Password', value: 'password' },
                                { label: 'JSON', value: 'json' },
                                { label: 'File', value: 'file' },
                            ]}
                            value={config.inputType || ''}
                            onChange={(value) => setConfig({ ...config, inputType: value })}
                            error={errors.inputType}
                        />
                        <TextField
                            label="Default Value"
                            value={config.defaultValue || ''}
                            onChange={(value) => setConfig({ ...config, defaultValue: value })}
                            autoComplete="off"
                            error={errors.defaultValue}
                            helpText={config.required ? 'Required for required inputs' : 'Optional default value'}
                        />
                        <Checkbox
                            label="Required Field"
                            checked={config.required || false}
                            onChange={(checked) => setConfig({ ...config, required: checked })}
                            helpText="Mark this input as required for workflow execution"
                        />
                        <TextField
                            label="Placeholder Text"
                            value={config.placeholder || ''}
                            onChange={(value) => setConfig({ ...config, placeholder: value })}
                            autoComplete="off"
                            helpText="Placeholder text shown to users"
                        />
                        <TextField
                            label="Help Text"
                            value={config.helpText || ''}
                            onChange={(value) => setConfig({ ...config, helpText: value })}
                            multiline={2}
                            autoComplete="off"
                            helpText="Additional help text for users"
                        />
                    </BlockStack>
                );

            case 'process':
                return (
                    <BlockStack gap="400">
                        <Select
                            label="Process Type *"
                            options={[
                                { label: 'Select process type', value: '' },
                                { label: 'Transform Data', value: 'transform' },
                                { label: 'Filter Data', value: 'filter' },
                                { label: 'Aggregate Data', value: 'aggregate' },
                                { label: 'Custom Logic', value: 'custom' },
                            ]}
                            value={config.processType || ''}
                            onChange={(value) => setConfig({ ...config, processType: value })}
                            error={errors.processType}
                        />
                        <TextField
                            label="Processing Logic *"
                            value={config.logic || ''}
                            onChange={(value) => setConfig({ ...config, logic: value })}
                            multiline={4}
                            autoComplete="off"
                            error={errors.logic}
                            helpText="Define the processing logic for this component"
                        />
                        <Checkbox
                            label="Critical Process"
                            checked={config.critical || false}
                            onChange={(checked) => setConfig({ ...config, critical: checked })}
                            helpText="Mark as critical - requires error handling"
                        />
                        <TextField
                            label="Timeout (seconds)"
                            type="number"
                            value={config.timeout || ''}
                            onChange={(value) => setConfig({ ...config, timeout: value })}
                            autoComplete="off"
                            helpText="Maximum execution time (optional)"
                        />
                        <Checkbox
                            label="Enable Retry"
                            checked={config.enableRetry || false}
                            onChange={(checked) => setConfig({ ...config, enableRetry: checked })}
                            helpText="Retry on failure"
                        />
                        {config.enableRetry && (
                            <TextField
                                label="Max Retries"
                                type="number"
                                value={config.maxRetries || '3'}
                                onChange={(value) => setConfig({ ...config, maxRetries: value })}
                                autoComplete="off"
                            />
                        )}
                    </BlockStack>
                );

            case 'output':
                return (
                    <BlockStack gap="400">
                        <Select
                            label="Output Format *"
                            options={[
                                { label: 'Select output format', value: '' },
                                { label: 'JSON', value: 'json' },
                                { label: 'CSV', value: 'csv' },
                                { label: 'XML', value: 'xml' },
                                { label: 'Plain Text', value: 'text' },
                                { label: 'Email', value: 'email' },
                                { label: 'Webhook', value: 'webhook' },
                            ]}
                            value={config.outputFormat || ''}
                            onChange={(value) => setConfig({ ...config, outputFormat: value })}
                            error={errors.outputFormat}
                        />
                        {['csv', 'json', 'xml'].includes(config.outputFormat || '') && (
                            <TextField
                                label="File Name *"
                                value={config.fileName || ''}
                                onChange={(value) => setConfig({ ...config, fileName: value })}
                                autoComplete="off"
                                error={errors.fileName}
                                helpText="Include file extension (e.g., data.json)"
                            />
                        )}
                        {config.outputFormat === 'email' && (
                            <>
                                <TextField
                                    label="Email Template"
                                    value={config.emailTemplate || ''}
                                    onChange={(value) => setConfig({ ...config, emailTemplate: value })}
                                    multiline={3}
                                    autoComplete="off"
                                    helpText="Email template content"
                                />
                                <TextField
                                    label="Subject Line"
                                    value={config.emailSubject || ''}
                                    onChange={(value) => setConfig({ ...config, emailSubject: value })}
                                    autoComplete="off"
                                />
                            </>
                        )}
                        {config.outputFormat === 'webhook' && (
                            <>
                                <TextField
                                    label="Webhook URL"
                                    value={config.webhookUrl || ''}
                                    onChange={(value) => setConfig({ ...config, webhookUrl: value })}
                                    autoComplete="off"
                                    helpText="HTTP endpoint to send data to"
                                />
                                <Select
                                    label="HTTP Method"
                                    options={[
                                        { label: 'POST', value: 'POST' },
                                        { label: 'PUT', value: 'PUT' },
                                        { label: 'PATCH', value: 'PATCH' },
                                    ]}
                                    value={config.httpMethod || 'POST'}
                                    onChange={(value) => setConfig({ ...config, httpMethod: value })}
                                />
                            </>
                        )}
                        <Checkbox
                            label="Include Timestamp"
                            checked={config.includeTimestamp || false}
                            onChange={(checked) => setConfig({ ...config, includeTimestamp: checked })}
                            helpText="Add timestamp to output data"
                        />
                    </BlockStack>
                );

            case 'condition':
                return (
                    <BlockStack gap="400">
                        <TextField
                            label="Condition Logic *"
                            value={config.condition || ''}
                            onChange={(value) => setConfig({ ...config, condition: value })}
                            helpText="Enter a condition expression (e.g., value > 10, status === 'active')"
                            autoComplete="off"
                            error={errors.condition}
                            multiline={2}
                        />
                        <TextField
                            label="True Branch Label *"
                            value={config.trueBranch || 'True'}
                            onChange={(value) => setConfig({ ...config, trueBranch: value })}
                            autoComplete="off"
                            error={errors.trueBranch}
                        />
                        <TextField
                            label="False Branch Label *"
                            value={config.falseBranch || 'False'}
                            onChange={(value) => setConfig({ ...config, falseBranch: value })}
                            autoComplete="off"
                            error={errors.falseBranch}
                        />
                        <Select
                            label="Operator Type"
                            options={[
                                { label: 'Comparison (>, <, ==)', value: 'comparison' },
                                { label: 'Logical (&&, ||)', value: 'logical' },
                                { label: 'String (contains, startsWith)', value: 'string' },
                                { label: 'Custom Expression', value: 'custom' },
                            ]}
                            value={config.operatorType || 'comparison'}
                            onChange={(value) => setConfig({ ...config, operatorType: value })}
                        />
                        <TextField
                            label="Description"
                            value={config.description || ''}
                            onChange={(value) => setConfig({ ...config, description: value })}
                            multiline={2}
                            autoComplete="off"
                            helpText="Describe what this condition checks"
                        />
                    </BlockStack>
                );

            default:
                return (
                    <TextField
                        label="Configuration (JSON)"
                        value={JSON.stringify(config, null, 2)}
                        onChange={(value) => {
                            try {
                                setConfig(JSON.parse(value) as NodeConfig);
                            } catch {
                                // Invalid JSON, keep as string for now
                            }
                        }}
                        multiline={6}
                        autoComplete="off"
                        helpText="Raw JSON configuration for this component"
                    />
                );
        }
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title={`Configure ${nodeLabel}`}
            primaryAction={{
                content: 'Save Configuration',
                onAction: handleSave,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
                <FormLayout>
                    <TextField
                        label="Node Label *"
                        value={nodeLabel}
                        onChange={setNodeLabel}
                        autoComplete="off"
                        error={errors.nodeLabel}
                        helpText="Display name for this component"
                    />
                    {renderConfigFields()}
                </FormLayout>
            </Modal.Section>
        </Modal>
    );
};

export default ConfigurationModal;
