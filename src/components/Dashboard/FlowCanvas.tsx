'use client'
import { CheckIcon, DownloadIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    BackgroundVariant,
    Connection,
    Controls,
    Edge,
    MiniMap,
    Node,
    Panel,
    useEdgesState,
    useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflow } from '../../contexts/WorkflowContext';
import ConfigurationModal from './ConfigurationModal';
import CustomNode from './CustomNode';

interface WorkflowComponent {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
        label: string;
        type: string;
        config?: Record<string, unknown>;
    };
    style?: Record<string, unknown>;
}

interface WorkflowConnection {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

const nodeTypes = {
    customNode: CustomNode,
};

const componentTypes = {
    input: { label: 'Input', color: '#059669', variant: 'primary' as const },
    process: { label: 'Process', color: '#2563eb', variant: 'secondary' as const },
    output: { label: 'Output', color: '#dc2626', variant: 'tertiary' as const },
    condition: { label: 'Condition', color: '#7c3aed', variant: 'plain' as const },
};

const FlowCanvas: React.FC = () => {
    const { currentWorkflow, updateWorkflow, validateWorkflow } = useWorkflow();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);

    const convertNodesToComponents = (nodes: Node[]): WorkflowComponent[] => {
        return nodes.map(node => ({
            id: node.id,
            type: node.type || 'customNode',
            position: node.position,
            data: {
                label: node.data?.label || '',
                type: node.data?.type || '',
                config: node.data?.config || {},
            },
            style: node.style ? { ...node.style } as Record<string, unknown> : {}, // FIX: Convert CSSProperties to Record
        }));
    };

    const convertEdgesToConnections = (edges: Edge[]): WorkflowConnection[] => {
        return edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
        }));
    };

    useEffect(() => {
        console.log('FlowCanvas: currentWorkflow changed:', currentWorkflow?.name);

        if (currentWorkflow) {
            const nodesWithCustomType = (currentWorkflow.components || []).map(node => ({
                ...node,
                type: 'customNode',
            }));

            console.log('FlowCanvas: Setting nodes:', nodesWithCustomType.length);
            console.log('FlowCanvas: Setting edges:', (currentWorkflow.connections || []).length);

            setNodes(nodesWithCustomType);
            setEdges(currentWorkflow.connections || []);
        } else {
            console.log('FlowCanvas: Clearing nodes and edges');
            setNodes([]);
            setEdges([]);
        }
    }, [currentWorkflow, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setShowConfig(true);
    }, []);

    const addComponent = useCallback((type: keyof typeof componentTypes) => {
        const componentConfig = componentTypes[type];
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type: 'customNode',
            position: {
                x: Math.random() * 300 + 100,
                y: Math.random() * 300 + 100
            },
            data: {
                label: `${componentConfig.label} ${nodes.filter(n => n.data.type === type).length + 1}`,
                type,
                config: {},
            },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes, setNodes]);

    const removeNode = useCallback((nodeId: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    }, [setNodes, setEdges]);

    console.log('FlowCanvas current canvas', currentWorkflow);

    const handleManualSave = async () => {
        console.log("Manual SAVE TRIGGERED");

        if (currentWorkflow) {
            try {
                await updateWorkflow(currentWorkflow.id!, {
                    components: convertNodesToComponents(nodes),
                    connections: convertEdgesToConnections(edges),
                });
                console.log('Workflow saved successfully');
            } catch {
                console.error('Error saving workflow');
            }
        }
    };

    // FIXED: Convert nodes/edges for validation
    const handleValidate = async () => {
        if (!currentWorkflow) {
            return;
        }

        try {
            setValidationResult(null);

            const result = await validateWorkflow({
                components: convertNodesToComponents(nodes),
                connections: convertEdgesToConnections(edges),
            });

            setValidationResult(result);
            setShowValidation(true);

            console.log('Validation result:', result);

        } catch (error: unknown) {
            console.error('Validation error:', error);

            const errorMessage = error instanceof Error ? error.message : 'Validation request failed';

            setValidationResult({
                valid: false,
                errors: [errorMessage]
            });
            setShowValidation(true);
        }
    };

    const handleExport = () => {
        const workflowData = {
            name: currentWorkflow?.name,
            components: convertNodesToComponents(nodes),
            connections: convertEdgesToConnections(edges),
            configurations: currentWorkflow?.configurations,
        };

        const dataStr = JSON.stringify(workflowData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${currentWorkflow?.name || 'workflow'}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleClearCanvas = () => {
        if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
            setNodes([]);
            setEdges([]);
        }
    };

    return (
        <>
            {/* Canvas Header */}
            <div className="canvas-header">
                <div>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--color-text-primary)',
                        margin: 0
                    }}>
                        {currentWorkflow?.name || 'No Workflow Selected'}
                    </h2>
                    {currentWorkflow?.description && (
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            margin: '4px 0 0 0'
                        }}>
                            {currentWorkflow.description}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn-primary"
                        onClick={handleManualSave}
                        disabled={!currentWorkflow}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <SaveIcon size={16} />
                        Save
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleValidate}
                        disabled={!currentWorkflow}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <CheckIcon size={16} />
                        Validate
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleExport}
                        disabled={!currentWorkflow}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <DownloadIcon size={16} />
                        Export
                    </button>
                    <button
                        className="btn-danger"
                        onClick={handleClearCanvas}
                        disabled={!currentWorkflow}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Trash2Icon size={16} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Canvas Content */}
            <div className="canvas-content">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onNodeContextMenu={(event, node) => {
                        event.preventDefault();
                        if (window.confirm('Delete this node?')) {
                            removeNode(node.id);
                        }
                    }}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <Panel position="top-left">
                        <div className="component-panel" style={{ padding: '16px', width: '200px' }}>
                            <h3 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '12px',
                                color: 'var(--color-text-primary)'
                            }}>
                                Components
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(componentTypes).map(([type, config]) => (
                                    <button
                                        key={type}
                                        onClick={() => addComponent(type as keyof typeof componentTypes)}
                                        disabled={!currentWorkflow}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 12px',
                                            backgroundColor: config.color,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: currentWorkflow ? 'pointer' : 'not-allowed',
                                            opacity: currentWorkflow ? 1 : 0.5,
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentWorkflow) {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)'
                                        }} />
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Panel>

                    <Controls />
                    <MiniMap
                        style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)'
                        }}
                    />
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="#e2e8f0"
                    />
                </ReactFlow>
            </div>

            {/* Configuration Modal */}
            {showConfig && selectedNode && (
                <ConfigurationModal
                    node={selectedNode}
                    isOpen={showConfig}
                    onClose={() => setShowConfig(false)}
                    onSave={(config) => {
                        setNodes((nds) =>
                            nds.map((node) =>
                                node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, config } }
                                    : node
                            )
                        );
                        setShowConfig(false);
                    }}
                />
            )}

            {/* Validation Modal */}
            {showValidation && validationResult && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '500px',
                        maxWidth: '90vw'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            marginBottom: '16px',
                            color: 'var(--color-text-primary)'
                        }}>
                            Workflow Validation
                        </h3>

                        {validationResult.valid ? (
                            <div style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ color: '#059669', margin: 0 }}>
                                    ✅ Workflow is valid and ready to use!
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ color: '#dc2626', margin: '0 0 12px 0' }}>
                                    {validationResult.errors.filter(e => !e.startsWith('⚠️')).length === 0
                                        ? '✅ Workflow is valid!'
                                        : '❌ Workflow has validation errors:'
                                    }
                                </p>
                                <ul style={{ color: '#374151', margin: 0, paddingLeft: '20px' }}>
                                    {validationResult.errors.map((error, index) => (
                                        <li key={index} style={{
                                            marginBottom: '4px',
                                            color: error.startsWith('⚠️') ? '#f59e0b' : '#dc2626'
                                        }}>
                                            {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-primary"
                                onClick={() => setShowValidation(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FlowCanvas;
