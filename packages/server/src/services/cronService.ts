import pool from '../config/database';

// Внутренний вызов эндпоинта для получения данных от Google API
const fetchFromServer = async (url: string, strategy: 'desktop' | 'mobile') => {
  const response = await fetch(
    `http://localhost:${process.env.PORT || 3002}/api/pagespeed/fetch?url=${encodeURIComponent(url)}&strategy=${strategy}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Pagespeed data from server: ${response.statusText}`);
  }

  return response.json();
};

// Внутренний вызов эндпоинта для сохранения данных
const saveToServer = async (url: string, strategy: 'desktop' | 'mobile', data: any) => {
  const response = await fetch(
    `http://localhost:${process.env.PORT || 3002}/api/pagespeed`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        strategy,
        data
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to save Pagespeed data to server: ${response.statusText}`);
  }

  return response.json();
};

// Проверка есть ли уже данные за сегодня
const checkDataExistsForToday = async (url: string, strategy: 'desktop' | 'mobile'): Promise<boolean> => {
  const query = `
    SELECT COUNT(*) as count 
    FROM pagespeed_records 
    WHERE url = $1 AND strategy = $2 AND DATE(created_at) = CURRENT_DATE
  `;
  
  const result = await pool.query(query, [url, strategy]);
  return parseInt(result.rows[0].count) > 0;
};

// Ежедневное обновление с настраиваемым временем
export const scheduleDailyUpdate = () => {
  const updatePagespeedData = async () => {
    try {
      console.log('Starting daily Pagespeed update...');
      
      const url = 'https://gortools.ru';
      
      // Проверяем есть ли уже данные за сегодня
      const desktopExists = await checkDataExistsForToday(url, 'desktop');
      const mobileExists = await checkDataExistsForToday(url, 'mobile');
      
      if (desktopExists && mobileExists) {
        console.log('Data already exists for today, skipping update');
        return;
      }
      
      // Получаем данные для desktop только если их нет
      if (!desktopExists) {
        console.log('Fetching desktop data...');
        const desktopData = await fetchFromServer(url, 'desktop');
        await saveToServer(url, 'desktop', desktopData);
      } else {
        console.log('Desktop data already exists for today');
      }
      
      // Получаем данные для mobile только если их нет
      if (!mobileExists) {
        console.log('Fetching mobile data...');
        const mobileData = await fetchFromServer(url, 'mobile');
        await saveToServer(url, 'mobile', mobileData);
      } else {
        console.log('Mobile data already exists for today');
      }
      
      console.log('Daily Pagespeed update completed successfully');
      
    } catch (error) {
      console.error('Daily Pagespeed update failed:', error);
    }
  };

  // Запускаем немедленно при старте сервера
  updatePagespeedData();

  // Настраиваем ежедневный запуск с настраиваемым временем
  const scheduleNextRun = () => {
    const now = new Date();
    const refreshHour = parseInt(process.env.PAGESPEED_REFRESH_HOUR || '4');
    
    // Создаем дату следующего запуска
    const nextRun = new Date(now);
    nextRun.setHours(refreshHour, 0, 0, 0);
    
    // Если время уже прошло сегодня, переносим на завтра
    if (now.getHours() >= refreshHour || (now.getHours() === refreshHour && now.getMinutes() > 0)) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    const msUntilNextRun = nextRun.getTime() - now.getTime();
    
    console.log(`Next Pagespeed update scheduled for: ${nextRun.toISOString()} (${refreshHour}:00)`);
    
    setTimeout(() => {
      updatePagespeedData();
      // Рекурсивно планируем следующий запуск
      scheduleNextRun();
    }, msUntilNextRun);
  };

  scheduleNextRun();
};
