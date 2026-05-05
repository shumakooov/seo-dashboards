import express from 'express';
import { 
  savePagespeedData, 
  getPagespeedHistory, 
  getPagespeedHistoryByDateRange,
  getLatestPagespeedData,
  createDailySummary 
} from '../services/pagespeedService';

const router = express.Router();

// GET /api/pagespeed/fetch - получение данных от Google PageSpeed API
router.get('/fetch', async (req, res) => {
  try {
    const { url = 'https://gortools.ru', strategy = 'desktop' } = req.query;
    
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google PageSpeed API key not configured' });
    }

    const googleResponse = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url as string)}&strategy=${strategy}&key=${apiKey}`
    );

    if (!googleResponse.ok) {
      throw new Error(`Failed to fetch Pagespeed data: ${googleResponse.statusText}`);
    }

    const pagespeedData = await googleResponse.json();
    res.json(pagespeedData);
    
  } catch (error) {
    console.error('Error fetching pagespeed data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pagespeed data',
      details: (error as any).message
    });
  }
});

// POST /api/pagespeed - сохранение данных Pagespeed
router.post('/', async (req, res) => {
  try {
    const { url, strategy, data } = req.body;

    if (!url || !strategy || !data) {
      return res.status(400).json({ 
        error: 'Missing required fields: url, strategy, data' 
      });
    }

    if (!['desktop', 'mobile'].includes(strategy)) {
      return res.status(400).json({ 
        error: 'Strategy must be either "desktop" or "mobile"' 
      });
    }

    // Извлекаем нужные данные из ответа Google PageSpeed API
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult?.categories;
    const audits = lighthouseResult?.audits;

    const pagespeedData = {
      url,
      strategy,
      performance_score: categories?.performance?.score ? categories.performance.score * 100 : undefined,
      accessibility_score: categories?.accessibility?.score ? categories.accessibility.score * 100 : undefined,
      best_practices_score: categories?.['best-practices']?.score ? categories['best-practices'].score * 100 : undefined,
      seo_score: categories?.seo?.score ? categories.seo.score * 100 : undefined,
      first_contentful_paint: audits?.['first-contentful-paint']?.numericValue || undefined,
      largest_contentful_paint: audits?.['largest-contentful-paint']?.numericValue || undefined,
      cumulative_layout_shift: audits?.['cumulative-layout-shift']?.numericValue || undefined,
      total_blocking_time: audits?.['total-blocking-time']?.numericValue || undefined,
      raw_data: data
    };

    const savedData = await savePagespeedData(pagespeedData);

    // Создаем ежедневную сводку
    await createDailySummary(url, new Date().toISOString().split('T')[0]);

    res.status(201).json(savedData);
  } catch (error) {
    console.error('Error saving pagespeed data:', error);
    console.error('Request body details:', {
      url: req.body.url,
      strategy: req.body.strategy,
      hasData: !!req.body.data,
      dataKeys: req.body.data ? Object.keys(req.body.data) : []
    });
    console.error('Error stack:', (error as any).stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: (error as any).message
    });
  }
});

// GET /api/pagespeed/history - получение истории данных
router.get('/history', async (req, res) => {
  try {
    const { url = 'https://gortools.ru', days = 30, startDate, endDate } = req.query;

    if (typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL must be a string' 
      });
    }

    let history;

    if (startDate && endDate) {
      // Используем диапазон дат
      if (typeof startDate !== 'string' || typeof endDate !== 'string') {
        return res.status(400).json({ 
          error: 'startDate and endDate must be strings' 
        });
      }

      // Валидация формата дат (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ 
          error: 'startDate and endDate must be in YYYY-MM-DD format' 
        });
      }

      history = await getPagespeedHistoryByDateRange(url, startDate, endDate);
    } else {
      // Используем количество дней (старая логика)
      const daysNum = parseInt(days as string);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return res.status(400).json({ 
          error: 'Days must be a number between 1 and 365' 
        });
      }

      history = await getPagespeedHistory(url, daysNum);
    }

    res.json(history);
  } catch (error) {
    console.error('Error fetching pagespeed history:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// GET /api/pagespeed/latest - получение последних данных
router.get('/latest', async (req, res) => {
  try {
    const { url = 'https://gortools.ru' } = req.query;

    if (typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'URL must be a string' 
      });
    }

    const latest = await getLatestPagespeedData(url);
    res.json(latest);
  } catch (error) {
    console.error('Error fetching latest pagespeed data:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export default router;
