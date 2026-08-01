// api/index.js
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD || ''),
    ssl: {
        rejectUnauthorized: false
    }
});

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Range'],
    exposedHeaders: ['Content-Range', 'Content-Length'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

// Routes API
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/latest-timestamp', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                MAX(dt.timestamp_hour) AS last_timestamp,
                TO_CHAR(MAX(dt.timestamp_hour), 'YYYY-MM-DD HH24:MI:SS') AS last_timestamp_formatted,
                COUNT(*) AS total_records,
                COUNT(DISTINCT city_id) AS total_cities
            FROM fact_air_quality fact
            JOIN dim_time dt ON fact.time_id = dt.time_id
        `);

        res.json({
            last_timestamp: result.rows[0].last_timestamp,
            last_timestamp_formatted: result.rows[0].last_timestamp_formatted,
            total_records: parseInt(result.rows[0].total_records || 0),
            total_cities: parseInt(result.rows[0].total_cities || 0)
        });
    } catch (err) {
        console.error('Error fetching latest timestamp:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cities', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM dim_city ORDER BY city_name`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/measures', async (req, res) => {
    try {
        const { city, start_date, end_date, limit = 1000 } = req.query;
        let query = `
            SELECT 
                c.city_name AS ville,
                c.country AS pays,
                c.latitude,
                c.longitude,
                dt.timestamp_hour AS timestamp_utc,
                dt.date_value AS date,
                dt.hour AS heure,
                dt.day_of_week AS jour_semaine,
                dt.is_weekend,
                f.aqi,
                f.co,
                f.no,
                f.no2,
                f.o3,
                f.so2,
                f.pm2_5,
                f.pm10,
                f.nh3
            FROM fact_air_quality f
            JOIN dim_city c ON f.city_id = c.city_id
            JOIN dim_time dt ON f.time_id = dt.time_id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (city) {
            query += ` AND c.city_name = $${paramIndex}`;
            params.push(city);
            paramIndex++;
        }
        if (start_date) {
            query += ` AND dt.timestamp_hour >= $${paramIndex}`;
            params.push(start_date);
            paramIndex++;
        }
        if (end_date) {
            query += ` AND dt.timestamp_hour <= $${paramIndex}`;
            params.push(end_date);
            paramIndex++;
        }
        query += ` ORDER BY dt.timestamp_hour DESC LIMIT $${paramIndex}`;
        params.push(parseInt(limit));

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api', (req, res) => {
    res.json({
        name: 'Air Quality API',
        version: '1.0.0',
        endpoints: ['/api/health', '/api/latest-timestamp', '/api/cities', '/api/measures']
    });
});

export default app;