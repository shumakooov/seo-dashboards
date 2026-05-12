import { useState } from 'react';
import { useSites } from '../../hooks/useSites';
import styles from './SiteManagerDialog.module.css';

interface SiteManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SiteManagerDialog({ isOpen, onClose }: SiteManagerDialogProps) {
  const { sites, addSite, updateSite, removeSite } = useSites();
  const [editingSite, setEditingSite] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ name: '', url: '' });
    setEditingSite(null);
    setError(null);
  };

  const handleAdd = () => {
    setEditingSite('new');
    setFormData({ name: '', url: '' });
    setError(null);
  };

  const handleEdit = (site: any) => {
    setEditingSite(site.id);
    setFormData({ name: site.name, url: site.url });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) {
      setError('URL обязателен');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingSite === 'new') {
        await addSite(formData.url.trim(), formData.name.trim() || undefined);
      } else {
        await updateSite(editingSite, formData.url.trim(), formData.name.trim() || undefined);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (siteId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот сайт?')) {
      try {
        await removeSite(siteId);
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при удалении');
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>Управление сайтами</h2>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.sitesList}>
            <div className={styles.listHeader}>
              <h3>Список сайтов</h3>
              <button className={styles.addButton} onClick={handleAdd}>
                + Добавить сайт
              </button>
            </div>

            {sites.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Сайты еще не добавлены</p>
                <p>Нажмите "Добавить сайт" чтобы начать</p>
              </div>
            ) : (
              <div className={styles.sites}>
                {sites.map(site => (
                  <div key={site.id} className={styles.siteItem}>
                    <div className={styles.siteInfo}>
                      <div className={styles.siteName}>{site.name}</div>
                      <div className={styles.siteUrl}>{site.url}</div>
                    </div>
                    <div className={styles.siteActions}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEdit(site)}
                      >
                        Редактировать
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(site.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {editingSite && (
            <div className={styles.formSection}>
              <h3>{editingSite === 'new' ? 'Добавить сайт' : 'Редактировать сайт'}</h3>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="url">URL сайта *</label>
                  <input
                    id="url"
                    type="text"
                    placeholder="example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Название</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Название сайта (опционально)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting || !formData.url.trim()}
                  >
                    {isSubmitting ? 'Сохранение...' : (editingSite === 'new' ? 'Добавить' : 'Сохранить')}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
