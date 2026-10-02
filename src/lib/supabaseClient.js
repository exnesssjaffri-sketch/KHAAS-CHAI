// Supabase Client for Frontend
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Helper to invoke edge functions with consistent error handling
export async function invokeFunction(functionName, options = {}) {
    const { data, error } = await supabase.functions.invoke(functionName, options);
    
    if (error) {
        const message = error.context?.errors?.[0]?.message || error.message || 'Function invocation failed';
        throw new Error(message);
    }
    
    if (data && data.success === false) {
        throw new Error(data.message || data.error || 'Function returned error');
    }
    
    return data;
}

export default supabase;