import { useState } from 'react'
import styles from './Header.module.css'
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

interface HeaderProps {
    onDateChange?: (startDate: Dayjs, endDate: Dayjs) => void;
}

export default function Header({ onDateChange }: HeaderProps) {
    const SITE = 'gortools.ru'
    const [startDate, setStartDate] = useState<Dayjs | null>();
    const [endDate, setEndDate] = useState<Dayjs | null>();

    return (
        <div className={styles.wrapper}>
            <div className={styles.header_blocks}>
                {SITE}
            </div>
            <div className={styles.header_blocks}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Начальная дата"
                        value={startDate}
                        onChange={(newValue) => {
                            setStartDate(newValue);
                            if (onDateChange) {
                                onDateChange(newValue, endDate);
                            }
                        }}
                    />
                    <DatePicker
                        label="Конечная дата"
                        value={endDate}
                        onChange={(newValue) => {
                            setEndDate(newValue);
                            if (onDateChange) {
                                onDateChange(startDate, newValue);
                            }
                        }}
                    />
                </LocalizationProvider>
            </div>
            <div className={styles.header_blocks}>
                Группировка данных
            </div>
        </div>
    )
}