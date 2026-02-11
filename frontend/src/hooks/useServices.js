import { useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

// API functions
export const fetchServices = async (params = {}) => {
  try {
    const { data } = await client.get('/services', { params });
    return {
      services: data.data?.services || data.data?.docs || [],
      pagination: {
        page: data.page || 1,
        limit: data.limit || 12,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
        results: data.results || 0
      }
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const fetchServiceById = async (id) => {
  try {
    const { data } = await client.get(`/services/${id}`);
    return data.data?.service || data.data;
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const { data } = await client.get('/categories');
    return data.data?.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// React Query hooks - NO CACHING
export const useServices = (params = {}) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => fetchServices(params),
    staleTime: 0, // No caching
    gcTime: 0, // No garbage collection time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 1, // Only retry once
    placeholderData: undefined, // No placeholder data
  });
};

export const useService = (id) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchServiceById(id),
    enabled: !!id, // Only run if id exists
    staleTime: 0, // No caching
    gcTime: 0, // No garbage collection time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 1, // Only retry once
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 0, // No caching
    gcTime: 0, // No garbage collection time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 1, // Only retry once
  });
};

// Prefetch functions
export const usePrefetchService = () => {
  const queryClient = useQueryClient();

  return (id) => {
    queryClient.prefetchQuery({
      queryKey: ['service', id],
      queryFn: () => fetchServiceById(id),
      staleTime: 0, // No caching even for prefetch
    });
  };
};

// Invalidate functions for cache management
export const useInvalidateServices = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };
};

export const useInvalidateService = () => {
  const queryClient = useQueryClient();

  return (id) => {
    queryClient.invalidateQueries({ queryKey: ['service', id] });
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };
};

// Optimistic update for saving/un-saving services
export const useOptimisticSaveService = () => {
  const queryClient = useQueryClient();

  return (serviceId, isSaved) => {
    // Cancel any outgoing refetches
    queryClient.cancelQueries({ queryKey: ['services'] });

    // Snapshot the previous value
    const previousServices = queryClient.getQueryData(['services']);

    // Optimistically update to the new value
    queryClient.setQueryData(['services'], (old) => {
      if (!old) return old;

      if (Array.isArray(old)) {
        return old.map(service => {
          if (service.id === serviceId || service._id === serviceId) {
            return { ...service, isSaved };
          }
          return service;
        });
      } else if (old.services) {
        return {
          ...old,
          services: old.services.map(service => {
            if (service.id === serviceId || service._id === serviceId) {
              return { ...service, isSaved };
            }
            return service;
          })
        };
      }

      return old;
    });

    // Return a context object with the snapshotted value
    return { previousServices };
  };
};