import { useState } from 'react';
import styles from './Pagespeed.module.css';
import PagespeedChart from '../../components/PagespeedChart/PagespeedChart';
import Header from '../../components/header/Header';
import { useSites } from '../../hooks/useSites';
import type { Dayjs } from 'dayjs';

export default function Pagespeed() {
    const [startDate, setStartDate] = useState<Dayjs | null>();
    const [endDate, setEndDate] = useState<Dayjs | null>();
    const { selectedSite, selectedSiteId, selectSite } = useSites();

    const handleDateChange = (newStartDate: Dayjs, newEndDate: Dayjs) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    return (
        <>
        <Header onDateChange={handleDateChange} selectedSite={selectedSite} selectedSiteId={selectedSiteId} onSelectSite={selectSite} />
        <div className={styles.wrapper}>
            <h2>Скорость загрузки страниц</h2>
            {!selectedSite ? (
                <div className={styles.emptyState}>
                    <h3>Выберите сайт для просмотра данных</h3>
                    <p>Используйте выпадающий список в шапке чтобы выбрать или добавить сайт</p>
                </div>
            ) : (
                <div className={styles.chartContainer}>
                    <PagespeedChart 
                        startDate={startDate} 
                        endDate={endDate} 
                        selectedSite={selectedSite.url}
                    />
                </div>
            )}
        </div>
        </>
    )
}       