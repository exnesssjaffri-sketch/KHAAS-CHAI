// Auth Context - Manages authentication state
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const data = await authApi.getProfile();
            setProfile(data);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email, password, name) => {
        setError(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const signIn = async (email, password) => {
        setError(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const signOut = async () => {
        setError(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            setProfile(null);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateProfile = async (updates) => {
        try {
            const data = await authApi.updateProfile(updates);
            setProfile(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        setError(null);
        try {
            await authApi.changePassword({ current_password: currentPassword, new_password: newPassword });
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const value = {
        user,
        profile,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        updateProfile,
        changePassword,
        isAdmin: profile?.role === 'admin',
        isStaff: profile?.role === 'staff' || profile?.role === 'admin',
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}