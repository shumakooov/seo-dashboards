import { useState } from 'react'
import styles from './Header.module.css'
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import SiteSelector from '../SiteSelector/SiteSelector';

interface HeaderProps {
    onDateChange?: (startDate: Dayjs, endDate: Dayjs) => void;
}

export default function Header({ onDateChange }: HeaderProps) {
    const [startDate, setStartDate] = useState<Dayjs | null>();
    const [endDate, setEndDate] = useState<Dayjs | null>();

    return (
        <div className={styles.wrapper}>
            <div className={styles.header_blocks}>
                <SiteSelector />
            </div>
            <div className={styles.header_blocks}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Начальная дата"
                        value={startDate}
                        maxDate={dayjs()}
                        format='DD.MM.YYYY'
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
                        maxDate={dayjs()}
                        format='DD.MM.YYYY'
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