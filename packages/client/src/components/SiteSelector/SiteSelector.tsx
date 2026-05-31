import { useState, useRef, useEffect } from 'react';
import { useSites } from '../../hooks/useSites';
import SiteManagerDialog from '../SiteManagerDialog/SiteManagerDialog';
import styles from './SiteSelector.module.css';
import type { Site } from '../../hooks/useSites';

interface SiteSelectorProps {
  selectedSite?: Site | null;
  selectedSiteId?: string | null;
  onSelectSite?: (id: string) => void;
}

export default function SiteSelector({ selectedSite, selectedSiteId, onSelectSite }: SiteSelectorProps) {
  const { sites, isLoading, error } = useSites();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManagerDialog, setShowManagerDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSite = (siteId: string) => {
    if (onSelectSite) {
      onSelectSite(siteId);
    }
    setShowDropdown(false);
  };

  const handleManageSites = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowManagerDialog(true);
    setShowDropdown(false);
  };

  if (isLoading) {
    return <div className={styles.wrapper}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.wrapper}>Ошибка: {error}</div>;
  }

  return (
    <>
      <div className={styles.wrapper} ref={dropdownRef}>
        <div 
          className={styles.selector}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className={styles.selectedSite}>
            {selectedSite?.name || 'Выберите сайт'}
          </span>
          <span className={styles.arrow}>▼</span>
        </div>

        {showDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.search}>
              <input
                type="text"
                placeholder="Поиск сайтов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className={styles.sitesList}>
              {filteredSites.map(site => (
                <div
                  key={site.id}
                  className={`${styles.siteItem} ${site.id === selectedSiteId ? styles.selected : ''}`}
                  onClick={() => handleSelectSite(site.id)}
                >
                  <div className={styles.siteInfo}>
                    <div className={styles.siteName}>{site.name}</div>
                    <div className={styles.siteUrl}>{site.url}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.addSection}>
              <button
                className={styles.manageButton}
                onClick={handleManageSites}
              >
                ⚙ Управление сайтами
              </button>
            </div>
          </div>
        )}
      </div>

      <SiteManagerDialog 
        isOpen={showManagerDialog} 
        onClose={() => setShowManagerDialog(false)} 
      />
    </>
  );
}
