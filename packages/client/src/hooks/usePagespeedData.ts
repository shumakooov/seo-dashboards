import { useQuery } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect } from 'react';

interface PagespeedData {
  lighthouseResult: {
    categories: {
      performance: {
        score: number;
      };
      accessibility: {
        score: number;
      };
      'best-practices': {
        score: number;
      };
      seo: {
        score: number;
      };
    };
    audits: {
      'first-contentful-paint': {
        id: string;
        title: string;
        description: string;
        score: number;
        numericValue: number;
      };
      'largest-contentful-paint': {
        id: string;
        title: string;
        description: string;
        score: number;
        numericValue: number;
      };
      'cumulative-layout-shift': {
        id: string;
        title: string;
        description: string;
        score: number;
        numericValue: number;
      };
      'total-blocking-time': {
        id: string;
        title: string;
        description: string;
        score: number;
        numericValue: number;
      };
    };
  };
}

interface PagespeedResponse {
  id: string;
  captchaResult: string;
  kind: string;
  loadingExperience: {
    id: string;
    metrics: {
      [key: string]: {
        percentile: number;
        distributions: Array<{
          min: number;
          max: number;
          proportion: number;
        }>;
        category: string;
      };
    };
    overall_category: string;
  };
  originLoadingExperience: {
    id: string;
    metrics: {
      [key: string]: {
        percentile: number;
        distributions: Array<{
          min: number;
          max: number;
          proportion: number;
        }>;
        category: string;
      };
    };
    overall_category: string;
  };
  lighthouseResult: PagespeedData['lighthouseResult'];
}

const fetchPagespeedData = async (url: string, strategy: 'desktop' | 'mobile' = 'desktop'): Promise<PagespeedResponse> => {
  // Получаем данные через наш сервер (API ключ хранится на сервере)
  const response = await fetch(
    `http://localhost:3002/api/pagespeed/fetch?url=${encodeURIComponent(url)}&strategy=${strategy}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Pagespeed data: ${response.statusText}`);
  }

  const pagespeedData = await response.json();

  // Сохраняем данные в нашу базу данных
  try {
    await savePagespeedDataToDatabase(url, strategy, pagespeedData);
  } catch (error) {
    console.warn('Failed to save data to database:', error);
    // Не прерываем выполнение, если сохранение не удалось
  }

  return pagespeedData;
};

// Функция для сохранения данных в нашу базу
const savePagespeedDataToDatabase = async (url: string, strategy: 'desktop' | 'mobile', data: PagespeedResponse): Promise<void> => {
  const response = await fetch('http://localhost:3002/api/pagespeed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      strategy,
      data
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to save data to database: ${response.statusText}`);
  }
};

// Функция для проверки, наступило ли время обновления
const shouldRefresh = (lastFetchTime: number | null, refreshHour: number = 4): boolean => {
  if (!lastFetchTime) return true;
  
  const now = new Date();
  const lastFetch = new Date(lastFetchTime);
  
  // Если последний запрос был сегодня до часа обновления, и сейчас после часа обновления
  if (lastFetch.getDate() === now.getDate() && 
      lastFetch.getMonth() === now.getMonth() && 
      lastFetch.getFullYear() === now.getFullYear()) {
    return lastFetch.getHours() < refreshHour && now.getHours() >= refreshHour;
  }
  
  // Если последний запрос был в другой день
  return lastFetch.getDate() !== now.getDate();
};


export const usePagespeedData = (url: string, refreshHour: number = 4) => {
  // Запрос для desktop - отключен по умолчанию
  const desktopQuery = useQuery({
    queryKey: ['pagespeed', url, 'desktop'],
    queryFn: () => fetchPagespeedData(url, 'desktop'),
    staleTime: Infinity, // Данные всегда свежие, пока не принудительно обновим
    gcTime: 24 * 60 * 60 * 1000, // Хранить в кэше 24 часа
    retry: 2,
    refetchOnWindowFocus: false, // Отключить автообновление при фокусе
    refetchOnReconnect: false, // Отключить автообновление при переподключении
    enabled: false, // Отключить автоматический запрос при монтировании
  });

  // Запрос для mobile - отключен по умолчанию
  const mobileQuery = useQuery({
    queryKey: ['pagespeed', url, 'mobile'],
    queryFn: () => fetchPagespeedData(url, 'mobile'),
    staleTime: Infinity, // Данные всегда свежие, пока не принудительно обновим
    gcTime: 24 * 60 * 60 * 1000, // Хранить в кэше 24 часа
    retry: 2,
    refetchOnWindowFocus: false, // Отключить автообновление при фокусе
    refetchOnReconnect: false, // Отключить автообновление при переподключении
    enabled: false, // Отключить автоматический запрос при монтировании
  });

  // Функция для принудительного обновления
  const refetch = () => {
    desktopQuery.refetch();
    mobileQuery.refetch();
  };

  // Проверяем нужно ли автоматическое обновление по времени
  useEffect(() => {
    const lastFetchTime = localStorage.getItem('pagespeed-last-fetch');
    
    if (lastFetchTime) {
      const lastFetch = new Date(parseInt(lastFetchTime));
      if (shouldRefresh(lastFetch.getTime(), refreshHour)) {
        refetch();
      }
    }
  }, [refreshHour]);

  return {
    desktop: desktopQuery,
    mobile: mobileQuery,
    isLoading: desktopQuery.isLoading || mobileQuery.isLoading,
    isError: desktopQuery.isError || mobileQuery.isError,
    error: desktopQuery.error || mobileQuery.error,
    refetch, // Функция для принудительного обновления
  };
};

export const usePagespeedHistory = (
  url: string,
  days: number = 30,
  startDate?: Dayjs,
  endDate?: Dayjs
) => {
  return useQuery({
    queryKey: ['pagespeed-history', url, days, startDate, endDate],
    queryFn: async () => {
      let urlWithParams = `http://localhost:3002/api/pagespeed/history?url=${encodeURIComponent(url)}`;
      
      if (startDate?.isAfter(endDate)) {
        throw new Error(`The start date must be earlier than the end date`);
      } else if (startDate && endDate) {
        urlWithParams += `&startDate=${encodeURIComponent(startDate.format('YYYY-MM-DD'))}&endDate=${encodeURIComponent(endDate.format('YYYY-MM-DD'))}`;
      } else if (startDate) {
        urlWithParams += `&startDate=${encodeURIComponent(startDate.format('YYYY-MM-DD'))}&endDate=${encodeURIComponent(dayjs(new Date()).format('YYYY-MM-DD'))}`;
      } else {
        urlWithParams += `&days=${days}`;
      }

      const response = await fetch(urlWithParams);

      if (!response.ok) {
        throw new Error(`Failed to fetch pagespeed history: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
  });
};
