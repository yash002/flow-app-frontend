'use client'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { workflowAPI } from '../services/api';

interface Workflow {
    id?: string;
    name: string;
    description?: string;
    components: any[];
    connections: any[];
    configurations: object;
    createdAt?: string;
    updatedAt?: string;
}

interface WorkflowState {
    workflows: Workflow[];
    currentWorkflow: Workflow | null;
    loading: boolean;
    error: string | null;
}

interface WorkflowContextType extends WorkflowState {
    loadWorkflows: () => Promise<void>;
    createWorkflow: (workflow: Omit<Workflow, 'id'>) => Promise<Workflow>;
    updateWorkflow: (id: string, workflow: Partial<Workflow>) => Promise<void>;
    deleteWorkflow: (id: string) => Promise<void>;
    setCurrentWorkflow: (workflow: Workflow | null) => void;
    validateWorkflow: (workflow: any) => Promise<{ valid: boolean; errors: string[] }>;
    clearError: () => void;
    clearAllData: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflow = () => {
    const context = useContext(WorkflowContext);
    if (context === undefined) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
};

type WorkflowAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_WORKFLOWS'; payload: Workflow[] }
    | { type: 'ADD_WORKFLOW'; payload: Workflow }
    | { type: 'UPDATE_WORKFLOW'; payload: Workflow }
    | { type: 'DELETE_WORKFLOW'; payload: string }
    | { type: 'SET_CURRENT_WORKFLOW'; payload: Workflow | null }
    | { type: 'CLEAR_ERROR' }
    | { type: 'CLEAR_ALL_DATA' };

const workflowReducer = (state: WorkflowState, action: WorkflowAction): WorkflowState => {
    console.log('Reducer action:', { state, action });
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_WORKFLOWS':
            return { ...state, workflows: action.payload, loading: false };
        case 'ADD_WORKFLOW':
            return {
                ...state,
                workflows: [action.payload, ...state.workflows],
                currentWorkflow: action.payload,
                loading: false,
                error: null
            };
        case 'UPDATE_WORKFLOW':
            return {
                ...state,
                workflows: state.workflows.map(w => w.id === action.payload.id ? action.payload : w),
                currentWorkflow: state.currentWorkflow?.id === action.payload.id ? action.payload : state.currentWorkflow,
                loading: false
            };
        case 'DELETE_WORKFLOW':
            return {
                ...state,
                workflows: state.workflows.filter(w => w.id !== action.payload),
                currentWorkflow: state.currentWorkflow?.id === action.payload ? null : state.currentWorkflow,
                loading: false
            };
        case 'SET_CURRENT_WORKFLOW':
            console.log('Reducer: Setting current workflow:', action.payload?.name || 'null');
            return { ...state, currentWorkflow: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'CLEAR_ALL_DATA':
            return {
                workflows: [],
                currentWorkflow: null,
                loading: false,
                error: null,
            };
        default:
            return state;
    }
};

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(workflowReducer, {
        workflows: [],
        currentWorkflow: null,
        loading: false,
        error: null,
    });



    useEffect(() => {
        const handleAuthLogout = () => {
            console.log('Auth logout detected, clearing workflow data');
            dispatch({ type: 'CLEAR_ALL_DATA' });
        };

        const handleAuthLogin = (event: CustomEvent) => {
            console.log('Auth login detected, user:', event.detail);
            dispatch({ type: 'CLEAR_ALL_DATA' });
        };

        const handleAuthRegister = (event: CustomEvent) => {
            console.log('Auth register detected, user:', event.detail);
            dispatch({ type: 'CLEAR_ALL_DATA' });
        };

        window.addEventListener('auth:logout', handleAuthLogout);
        window.addEventListener('auth:login', handleAuthLogin as EventListener);
        window.addEventListener('auth:register', handleAuthRegister as EventListener);

        return () => {
            window.removeEventListener('auth:logout', handleAuthLogout);
            window.removeEventListener('auth:login', handleAuthLogin as EventListener);
            window.removeEventListener('auth:register', handleAuthRegister as EventListener);
        };
    }, []);

    const loadWorkflows = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const workflows = await workflowAPI.getAll();
            console.log('WorkflowContext: Initial Loaded workflows:', workflows);

            dispatch({ type: 'SET_WORKFLOWS', payload: workflows });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load workflows' });
        }
    }, []);

    const createWorkflow = useCallback(async (workflow: Omit<Workflow, 'id'>): Promise<Workflow> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            console.log('WorkflowContext: Creating workflow:', workflow.name);

            const created = await workflowAPI.create(workflow);
            console.log('WorkflowContext: Workflow created:', created);

            dispatch({ type: 'ADD_WORKFLOW', payload: created });
            dispatch({ type: 'SET_CURRENT_WORKFLOW', payload: created });

            console.log('WorkflowContext: New workflow set as current');

            return created;
        } catch (error: any) {
            console.error('WorkflowContext: Error creating workflow:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to create workflow' });
            throw error;
        }
    }, []);

    const updateWorkflow = useCallback(async (id: string, workflow: Partial<Workflow>) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            console.log('WorkflowContext: Updating workflow:', id, workflow);

            const updated = await workflowAPI.update(id, workflow);
            console.log('WorkflowContext: Workflow updated:', updated);
            dispatch({ type: 'UPDATE_WORKFLOW', payload: updated });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update workflow' });
            throw error;
        }
    }, []);

    const deleteWorkflow = useCallback(async (id: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await workflowAPI.delete(id);
            dispatch({ type: 'DELETE_WORKFLOW', payload: id });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to delete workflow' });
            throw error;
        }
    }, []);

    const setCurrentWorkflow = useCallback((workflow: Workflow | null) => {
        dispatch({ type: 'SET_CURRENT_WORKFLOW', payload: workflow });
    }, []);

    const validateWorkflow = useCallback(async (workflow: any) => {
        try {
            return await workflowAPI.validate(workflow);
        } catch (error) {
            throw error;
        }
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' });
    }, []);

    const clearAllData = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL_DATA' });
    }, []);

    return (
        <WorkflowContext.Provider
            value={{
                ...state,
                loadWorkflows,
                createWorkflow,
                updateWorkflow,
                deleteWorkflow,
                setCurrentWorkflow,
                validateWorkflow,
                clearError,
                clearAllData,
            }}
        >
            {children}
        </WorkflowContext.Provider>
    );
};
