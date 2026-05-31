import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePagespeedHistory, usePagespeedData } from '../../hooks/usePagespeedData';
import type { Dayjs } from 'dayjs';

interface PagespeedChartProps {
    startDate?: Dayjs;
    endDate?: Dayjs;
    selectedSite?: string;
}

export default function PagespeedChart({ startDate, endDate, selectedSite }: PagespeedChartProps) {
    const siteUrl = selectedSite;
    const { data: historyData, isLoading: historyLoading, isError: historyError, error: historyErrorMessage } = usePagespeedHistory(siteUrl, 30, startDate, endDate);
    const { refetch, isLoading: dataLoading } = usePagespeedData(siteUrl);

    const isLoading = historyLoading || dataLoading;
    const isError = historyError;
    const error = historyErrorMessage;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div>Загрузка данных...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div style={{ color: '#dc2626', textAlign: 'center' }}>
                    Ошибка загрузки данных: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
                </div>
            </div>
        );
    }

    const handleRefresh = () => {
        refetch();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <button
                    onClick={handleRefresh}
                    disabled={dataLoading}
                    style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: dataLoading ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: dataLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {dataLoading ? 'Обновление...' : 'Обновить'}
                </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Оценка']}
                        labelFormatter={(label) => `Месяц: ${label}`}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="desktop" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="Desktop"
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="mobile" 
                        stroke="#dc2626" 
                        strokeWidth={2}
                        name="Mobile"
                        dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}