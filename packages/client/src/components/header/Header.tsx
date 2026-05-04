import { useState } from 'react'
import { TextField, Box } from '@mui/material'
import styles from './Header.module.css'

export default function Header() {
    const SITE = 'gortools.ru'
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    return (
        <div className={styles.wrapper}>
            <div className={styles.header_blocks}>
                {SITE}
            </div>
            <div className={styles.header_blocks}>
                <Box display="flex" gap={2} alignItems="center">
                    <TextField
                        label="Начальная дата"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        size="small"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Конечная дата"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        size="small"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
            </div>
            <div className={styles.header_blocks}>
                Группировка данных
            </div>
        </div>
    )
}