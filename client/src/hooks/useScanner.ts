import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export const useScanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const startScan = async (target: string, type: 'single' | 'deep') => {
    setLoading(true);
    setError(null);

    try {
      // 1. Backend API hit karo
      const response = await apiClient.post('/scan/start', { target, type });
      
      const scanId = response.data.scanId;

      // 2. User ko Scanning Console (Image 5) par bhejo
      router.push(`/scan?id=${scanId}`);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Scan failed to initialize');
    } finally {
      setLoading(false);
    }
  };

  return { startScan, loading, error };
};