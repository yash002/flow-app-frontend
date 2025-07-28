'use client'
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { authAPI } from '../services/api';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'CLEAR_ERROR' }
    | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_USER':
            return { ...state, user: action.payload, loading: false, error: null };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'LOGOUT':
            return { user: null, loading: false, error: null };
        default:
            return state;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    const response = await authAPI.verifyToken();

                    if (response.valid && response.user) {
                        dispatch({ type: 'SET_USER', payload: response.user });
                        console.log('Token validated successfully:', response.user);
                    } else {
                        throw new Error('Invalid token response');
                    }
                } catch (error) {
                    console.error('Token validation failed:', error);
                    localStorage.removeItem('token');
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        validateToken();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        try {
            const response = await authAPI.login(email, password);
            localStorage.setItem('token', response.access_token);
            dispatch({ type: 'SET_USER', payload: response.user });

            window.dispatchEvent(new CustomEvent('auth:login', { detail: response.user }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw error;
        }
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        try {
            const response = await authAPI.register(email, password);
            localStorage.setItem('token', response.access_token);
            dispatch({ type: 'SET_USER', payload: response.user });

            window.dispatchEvent(new CustomEvent('auth:register', { detail: response.user }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeToken('token');
        dispatch({ type: 'LOGOUT' });

        window.dispatchEvent(new CustomEvent('auth:logout'));
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
