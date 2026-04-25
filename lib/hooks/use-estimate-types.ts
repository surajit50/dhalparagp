import { useState, useEffect } from 'react';

export interface EstimateType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  dimensionFields?: {
    required: string[];
    optional: string[];
    units: string[];
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    scheduleRates: number;
    projects: number;
  };
}

export interface ScheduleRate {
  id: string;
  code: string;
  description: string;
  unit: string;
  rate: number;
  category: string;
  estimateTypeId: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  estimateType?: {
    name: string;
    code: string;
    icon?: string;
    color?: string;
  };
}

export function useEstimateTypes() {
  const [estimateTypes, setEstimateTypes] = useState<EstimateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimateTypes = async (includeInactive = false) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/development-works/estimate-types?includeInactive=${includeInactive}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch estimate types');
      }
      
      const data = await response.json();
      setEstimateTypes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createEstimateType = async (data: Partial<EstimateType>) => {
    try {
      const response = await fetch('/api/development-works/estimate-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create estimate type');
      }

      const newType = await response.json();
      setEstimateTypes(prev => [...prev, newType]);
      return newType;
    } catch (err) {
      throw err;
    }
  };

  const updateEstimateType = async (id: string, data: Partial<EstimateType>) => {
    try {
      const response = await fetch('/api/development-works/estimate-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update estimate type');
      }

      const updatedType = await response.json();
      setEstimateTypes(prev => 
        prev.map(type => type.id === id ? updatedType : type)
      );
      return updatedType;
    } catch (err) {
      throw err;
    }
  };

  const deleteEstimateType = async (id: string) => {
    try {
      const response = await fetch(`/api/development-works/estimate-types/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete estimate type');
      }

      setEstimateTypes(prev => prev.filter(type => type.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchEstimateTypes();
  }, []);

  return {
    estimateTypes,
    loading,
    error,
    fetchEstimateTypes,
    createEstimateType,
    updateEstimateType,
    deleteEstimateType
  };
}

export function useScheduleRates() {
  const [scheduleRates, setScheduleRates] = useState<ScheduleRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduleRates = async (filters?: {
    estimateTypeId?: string;
    category?: string;
    search?: string;
    includeInactive?: boolean;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters?.estimateTypeId) params.append('estimateTypeId', filters.estimateTypeId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.includeInactive) params.append('includeInactive', 'true');

      const response = await fetch(`/api/development-works/schedule-rates?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule rates');
      }
      
      const data = await response.json();
      setScheduleRates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createScheduleRate = async (data: Partial<ScheduleRate>) => {
    try {
      const response = await fetch('/api/development-works/schedule-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule rate');
      }

      const newRate = await response.json();
      setScheduleRates(prev => [...prev, newRate]);
      return newRate;
    } catch (err) {
      throw err;
    }
  };

  const updateScheduleRate = async (id: string, data: Partial<ScheduleRate>) => {
    try {
      const response = await fetch('/api/development-works/schedule-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update schedule rate');
      }

      const updatedRate = await response.json();
      setScheduleRates(prev => 
        prev.map(rate => rate.id === id ? updatedRate : rate)
      );
      return updatedRate;
    } catch (err) {
      throw err;
    }
  };

  const deleteScheduleRate = async (id: string) => {
    try {
      const response = await fetch(`/api/development-works/schedule-rates/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete schedule rate');
      }

      setScheduleRates(prev => prev.filter(rate => rate.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchScheduleRates();
  }, []);

  return {
    scheduleRates,
    loading,
    error,
    fetchScheduleRates,
    createScheduleRate,
    updateScheduleRate,
    deleteScheduleRate
  };
}
