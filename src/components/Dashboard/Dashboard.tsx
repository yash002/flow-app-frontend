// src/components/Dashboard/Dashboard.tsx
'use client'
import { LogOutIcon, PlayIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import FlowCanvas from './FlowCanvas';

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

// Use proper types instead of any
interface Workflow {
    id?: string;
    name: string;
    description?: string;
    components: WorkflowComponent[];
    connections: WorkflowConnection[];
    configurations: object;
    createdAt?: string;
    updatedAt?: string;
}

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const {
        workflows,
        currentWorkflow,
        error,
        loadWorkflows,
        createWorkflow,
        deleteWorkflow,
        setCurrentWorkflow,
        clearAllData,
    } = useWorkflow();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkflowName, setNewWorkflowName] = useState('');
    const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // **FIX 1: Track loading state to prevent multiple calls**
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
    const workflowsLoadedRef = useRef<Set<string>>(new Set());

    // **FIX 2: Clear workflows when user changes**
    useEffect(() => {
        if (user?.id !== currentUserId) {
            console.log('User changed, clearing workflow data');
            clearAllData();
            setCurrentUserId(user?.id || null);
            setIsLoadingWorkflows(false);
            // Don't clear the Set here - we want to track across user changes
        }
    }, [user?.id, currentUserId, clearAllData]);

    // **FIX 3: Memoized load function to prevent recreation**
    const loadWorkflowsOnce = useCallback(async () => {
        if (!user?.id || isLoadingWorkflows || workflowsLoadedRef.current.has(user.id)) {
            console.log('Skipping loadWorkflows:', {
                hasUser: !!user?.id,
                isLoading: isLoadingWorkflows,
                alreadyLoaded: workflowsLoadedRef.current.has(user?.id || '')
            });
            return;
        }

        console.log('Loading workflows for user:', user.id);
        setIsLoadingWorkflows(true);
        workflowsLoadedRef.current.add(user.id);

        try {
            await loadWorkflows();
        } catch (error) {
            console.error('Error loading workflows:', error);
            // Remove from loaded set on error so it can be retried
            workflowsLoadedRef.current.delete(user.id);
        } finally {
            setIsLoadingWorkflows(false);
        }
    }, [user?.id, isLoadingWorkflows, loadWorkflows]);

    // **FIX 4: Load workflows with better dependency management**
    useEffect(() => {
        loadWorkflowsOnce();
    }, [loadWorkflowsOnce]);

    const handleCreateWorkflow = async () => {
        try {
            console.log('Creating workflow:', newWorkflowName, newWorkflowDescription);

            const newWorkflow = await createWorkflow({
                name: newWorkflowName,
                description: newWorkflowDescription,
                components: [],
                connections: [],
                configurations: {},
            });

            console.log('New workflow created:', newWorkflow);

            setShowCreateModal(false);
            setNewWorkflowName('');
            setNewWorkflowDescription('');

        } catch (err) {
            console.error('Error creating workflow:', err);
        }
    };

    const handleDeleteWorkflow = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this workflow?')) {
            await deleteWorkflow(id);
        }
    };

    const handleWorkflowSelect = useCallback((workflow: Workflow) => {
        console.log('Selecting workflow:', workflow.name, workflow.id);
        setCurrentWorkflow(workflow);
    }, [setCurrentWorkflow]);

    const handleLogout = useCallback(() => {
        // **FIX 5: Clear the loaded set on logout**
        workflowsLoadedRef.current.clear();
        setIsLoadingWorkflows(false);
        clearAllData();
        logout();
    }, [clearAllData, logout]);

    return (
        <div className="app-layout">
            {/* Header */}
            <header className="app-header">
                <h1>Flow Builder</h1>
                <div className="header-actions">
                    <button
                        className="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <PlusIcon size={16} style={{ marginRight: '8px' }} />
                        New Workflow
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleLogout}
                    >
                        <LogOutIcon size={16} style={{ marginRight: '8px' }} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="app-content">
                {/* Sidebar */}
                <aside className="app-sidebar">
                    <div className="sidebar-header">
                        <h2 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'var(--color-text-primary)',
                            margin: 0
                        }}>
                            Workflows ({workflows.length}) {isLoadingWorkflows && '(Loading...)'}
                        </h2>
                    </div>

                    <div className="sidebar-content">
                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                padding: '12px',
                                marginBottom: '16px',
                                fontSize: '14px',
                                color: '#dc2626'
                            }}>
                                {error}
                            </div>
                        )}

                        {isLoadingWorkflows ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '20px',
                                color: 'var(--color-text-secondary)'
                            }}>
                                Loading workflows...
                            </div>
                        ) : workflows.length === 0 ? (
                            <div className="empty-state">
                                <h3>No workflows yet</h3>
                                <p>Create your first workflow to get started with the flow builder.</p>
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowCreateModal(true)}
                                    style={{ marginTop: '16px' }}
                                >
                                    Create Workflow
                                </button>
                            </div>
                        ) : (
                            workflows.map((workflow) => (
                                <div
                                    key={workflow.id}
                                    className={`workflow-item ${currentWorkflow?.id === workflow.id ? 'active' : ''}`}
                                    onClick={() => handleWorkflowSelect(workflow)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div className="workflow-name">{workflow.name}</div>
                                            {workflow.description && (
                                                <div className="workflow-description">{workflow.description}</div>
                                            )}
                                            <div className="workflow-meta">
                                                Updated {new Date(workflow.updatedAt!).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                                            <button
                                                className="btn-secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleWorkflowSelect(workflow);
                                                }}
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                            >
                                                <PlayIcon size={12} />
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteWorkflow(workflow.id!);
                                                }}
                                                style={{ padding: '4px 8px' }}
                                            >
                                                <TrashIcon size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Canvas Area */}
                <main className="app-canvas">
                    {currentWorkflow ? (
                        <FlowCanvas key={currentWorkflow.id} />
                    ) : (
                        <div className="empty-state">
                            <h3>Select a workflow to edit</h3>
                            <p>Choose a workflow from the sidebar to start building your flow.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '400px',
                        maxWidth: '90vw',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            marginBottom: '20px',
                            color: 'var(--color-text-primary)'
                        }}>
                            Create New Workflow
                        </h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '6px',
                                color: 'var(--color-text-primary)'
                            }}>
                                Workflow Name
                            </label>
                            <input
                                type="text"
                                value={newWorkflowName}
                                onChange={(e) => setNewWorkflowName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    backgroundColor: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '14px'
                                }}
                                placeholder="Enter workflow name"
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '6px',
                                color: 'var(--color-text-primary)'
                            }}>
                                Description (Optional)
                            </label>
                            <textarea
                                value={newWorkflowDescription}
                                onChange={(e) => setNewWorkflowDescription(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    backgroundColor: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                                placeholder="Enter workflow description"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleCreateWorkflow}
                                disabled={!newWorkflowName.trim()}
                                style={{
                                    opacity: !newWorkflowName.trim() ? 0.5 : 1,
                                    cursor: !newWorkflowName.trim() ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
