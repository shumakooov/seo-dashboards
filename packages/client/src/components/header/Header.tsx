import styles from './Header.module.css'

export default function Header() {
    const SITE = 'gortools.ru'

    return (
        <div className={styles.wrapper}>
            <div className={styles.header_blocks}>
                {SITE}
            </div>
            <div className={styles.header_blocks}>
                Выбор даты
            </div>
            <div className={styles.header_blocks}>
                Группировка данных
            </div>
        </div>
    )
}