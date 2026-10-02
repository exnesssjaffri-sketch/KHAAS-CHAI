// Realtime Hook - Supabase Realtime subscriptions with polling fallback
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSupabaseSubscription(table, options = {}) {
    const { filter, onInsert, onUpdate, onDelete, enabled = true, pollingFallback = false } = options;
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const channelRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const lastDataRef = useRef(null);

    const subscribe = useCallback(() => {
        if (!enabled) return;

        const channelName = `${table}_${filter || 'all'}_${Date.now()}`;
        const channel = supabase.channel(channelName);

        let query = supabase.from(table).select('*');
        if (filter) {
            query = query.filter(filter.column, filter.operator, filter.value);
        }

        channel
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table,
                filter: filter ? `${filter.column}=eq.${filter.value}` : undefined
            }, (payload) => {
                setError(null);
                switch (payload.eventType) {
                    case 'INSERT':
                        onInsert?.(payload.new);
                        break;
                    case 'UPDATE':
                        onUpdate?.(payload.new, payload.old);
                        break;
                    case 'DELETE':
                        onDelete?.(payload.old);
                        break;
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    setError(null);
                    // Stop polling if realtime works
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setIsConnected(false);
                    setError('Realtime connection failed');
                    // Start polling fallback
                    if (pollingFallback && !pollingIntervalRef.current) {
                        startPolling();
                    }
                } else if (status === 'CLOSED') {
                    setIsConnected(false);
                }
            });

        channelRef.current = channel;
    }, [table, filter, onInsert, onUpdate, onDelete, enabled, pollingFallback]);

    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) return;
        
        const poll = async () => {
            try {
                let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(100);
                if (filter) {
                    query = query.filter(filter.column, filter.operator, filter.value);
                }
                const { data, error } = await query;
                if (error) throw error;
                
                if (lastDataRef.current) {
                    // Simple diff detection for new/updated items
                    const newData = data || [];
                    const oldData = lastDataRef.current;
                    
                    // Check for inserts
                    newData.forEach(newItem => {
                        if (!oldData.find(old => old.id === newItem.id)) {
                            onInsert?.(newItem);
                        }
                    });
                    
                    // Check for updates
                    newData.forEach(newItem => {
                        const oldItem = oldData.find(old => old.id === newItem.id);
                        if (oldItem && JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                            onUpdate?.(newItem, oldItem);
                        }
                    });
                    
                    // Check for deletes (items in old but not in new)
                    oldData.forEach(oldItem => {
                        if (!newData.find(newItem => newItem.id === oldItem.id)) {
                            onDelete?.(oldItem);
                        }
                    });
                }
                
                lastDataRef.current = data || [];
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        poll(); // Initial fetch
        pollingIntervalRef.current = setInterval(poll, 30000); // 30s polling
    }, [table, filter, onInsert, onUpdate, onDelete]);

    const unsubscribe = useCallback(() => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsConnected(false);
    }, []);

    useEffect(() => {
        subscribe();
        return () => unsubscribe();
    }, [subscribe, unsubscribe]);

    return { isConnected, error, subscribe, unsubscribe };
}

// Specialized hooks for common use cases
export function useProductsRealtime(onInsert, onUpdate, onDelete) {
    return useSupabaseSubscription('products', {
        onInsert,
        onUpdate,
        onDelete,
        pollingFallback: true
    });
}

export function useOrdersRealtime(userId, onInsert, onUpdate, onDelete) {
    return useSupabaseSubscription('orders', {
        filter: userId ? { column: 'user_id', operator: 'eq', value: userId } : null,
        onInsert,
        onUpdate,
        onDelete,
        pollingFallback: true
    });
}

export function useInventoryRealtime(onInsert, onUpdate, onDelete) {
    return useSupabaseSubscription('inventory_logs', {
        onInsert,
        onUpdate,
        onDelete,
        pollingFallback: true
    });
}