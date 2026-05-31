import { useState, useEffect } from 'react';

export interface Site {
  id: string;
  url: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

const SELECTED_SITE_KEY = 'seo-dashboard-selected-site';

const API_BASE_URL = 'http://localhost:3002/api/sites';

export const useSites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sites from database on mount
  useEffect(() => {
    const loadSites = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch sites: ${response.statusText}`);
        }
        const data = await response.json();
        setSites(data);

        // Load selected site from localStorage
        const storedSelectedSite = localStorage.getItem(SELECTED_SITE_KEY);
        if (storedSelectedSite) {
          setSelectedSiteId(storedSelectedSite);
        }
      } catch (error) {
        console.error('Failed to load sites:', error);
        setError(error instanceof Error ? error.message : 'Failed to load sites');
      } finally {
        setIsLoading(false);
      }
    };

    loadSites();
  }, []);

  // Save selected site to localStorage whenever it changes
  useEffect(() => {
    if (selectedSiteId) {
      try {
        localStorage.setItem(SELECTED_SITE_KEY, selectedSiteId);
      } catch (error) {
        console.warn('Failed to save selected site to localStorage:', error);
      }
    }
  }, [selectedSiteId]);

  const addSite = async (url: string, name?: string): Promise<Site> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || url,
          url: url.startsWith('http') ? url : `https://${url}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add site: ${response.statusText}`);
      }

      const newSite = await response.json();
      setSites(prev => [...prev, newSite]);
      setSelectedSiteId(newSite.id);
      
      return newSite;
    } catch (error) {
      console.error('Failed to add site:', error);
      throw error;
    }
  };

  const updateSite = async (id: string, url: string, name?: string): Promise<Site> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || url,
          url: url.startsWith('http') ? url : `https://${url}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update site: ${response.statusText}`);
      }

      const updatedSite = await response.json();
      setSites(prev => prev.map(site => 
        site.id === id ? updatedSite : site
      ));
      
      return updatedSite;
    } catch (error) {
      console.error('Failed to update site:', error);
      throw error;
    }
  };

  const removeSite = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete site: ${response.statusText}`);
      }

      setSites(prev => prev.filter(site => site.id !== id));
      
      // If removing the currently selected site, select another one
      if (selectedSiteId === id) {
        const remainingSites = sites.filter(site => site.id !== id);
        if (remainingSites.length > 0) {
          setSelectedSiteId(remainingSites[0].id);
        } else {
          setSelectedSiteId(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete site:', error);
      throw error;
    }
  };

  const selectSite = (id: string) => {
    setSelectedSiteId(id);
  };

  const selectedSite = sites.find(site => site.id === selectedSiteId);

  return {
    sites,
    selectedSite,
    selectedSiteId,
    isLoading,
    error,
    addSite,
    updateSite,
    removeSite,
    selectSite
  };
};
