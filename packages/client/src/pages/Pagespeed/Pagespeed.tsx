import styles from './Pagespeed.module.css';
import PagespeedChart from '../../components/PagespeedChart/PagespeedChart';
import Header from '../../components/header/Header';

export default function Pagespeed() {
    return (
        <>
        <Header/>
        <div className={styles.wrapper}>
            <h2>Скорость загрузки страниц</h2>
            <div className={styles.chartContainer}>
                <PagespeedChart />
            </div>
        </div>
        </>
    )
}       