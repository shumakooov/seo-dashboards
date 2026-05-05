import { useState } from 'react';
import styles from './Pagespeed.module.css';
import PagespeedChart from '../../components/PagespeedChart/PagespeedChart';
import Header from '../../components/header/Header';
import type { Dayjs } from 'dayjs';

export default function Pagespeed() {
    const [startDate, setStartDate] = useState<Dayjs | null>();
    const [endDate, setEndDate] = useState<Dayjs | null>();

    const handleDateChange = (newStartDate: Dayjs, newEndDate: Dayjs) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    return (
        <>
        <Header onDateChange={handleDateChange} />
        <div className={styles.wrapper}>
            <h2>Скорость загрузки страниц</h2>
            <div className={styles.chartContainer}>
                <PagespeedChart startDate={startDate} endDate={endDate} />
            </div>
        </div>
        </>
    )
}       