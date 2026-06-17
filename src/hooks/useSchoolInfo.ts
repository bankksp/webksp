import { useState, useEffect } from 'react';
import { getSchoolInfo } from '../services/dataService';
import { SchoolInfo } from '../types';

// Global cache to avoid multiple requests
let globalSchoolInfo: SchoolInfo | null = null;
let subscribers: ((info: SchoolInfo | null) => void)[] = [];

export const useSchoolInfo = () => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(globalSchoolInfo);
  const [loading, setLoading] = useState(!globalSchoolInfo);

  useEffect(() => {
    const subscriber = (info: SchoolInfo | null) => {
      setSchoolInfo(info);
      setLoading(false);
    };
    
    subscribers.push(subscriber);

    if (!globalSchoolInfo && subscribers.length === 1) {
      // First subscriber fetches the data
      const fetchInfo = async () => {
        try {
          const data = await getSchoolInfo();
          globalSchoolInfo = data;
          subscribers.forEach(sub => sub(data));
        } catch (error) {
          console.error('Failed to fetch school info:', error);
          setLoading(false);
        }
      };
      fetchInfo();
    }

    return () => {
      subscribers = subscribers.filter(sub => sub !== subscriber);
    };
  }, []);

  return { schoolInfo, loading };
};

// Function to manually refresh cache (e.g. after update)
export const refreshSchoolInfo = async () => {
  try {
    const data = await getSchoolInfo();
    globalSchoolInfo = data;
    subscribers.forEach(sub => sub(data));
    return data;
  } catch (error) {
    console.error('Failed to refresh school info:', error);
    return null;
  }
};
