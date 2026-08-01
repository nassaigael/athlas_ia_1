import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD || ''),
    ssl: { rejectUnauthorized: false }
});

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Range', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'Content-Length', 'X-Total-Count'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Range');
    res.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, X-Total-Count');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

function parseListParams(req) {
    const range = req.query.range ? JSON.parse(req.query.range) : [0, 24];
    const sort = req.query.sort ? JSON.parse(req.query.sort) : ['id', 'ASC'];
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    return { start: range[0], end: range[1], sortField: sort[0], sortOrder: sort[1], filter };
}

const cityOrderMap = {
    'id': 'city_id',
    'ville': 'city_name',
    'pays': 'country',
    'latitude': 'latitude',
    'longitude': 'longitude'
};

const measureOrderMap = {
    'id': 'f.fact_id',
    'ville': 'c.city_name',
    'pays': 'c.country',
    'timestamp_utc': 'dt.timestamp_hour',
    'date': 'dt.date_value',
    'heure': 'dt.hour',
    'jour_semaine': 'dt.day_of_week',
    'is_weekend': 'dt.is_weekend',
    'aqi': 'f.aqi',
    'co': 'f.co',
    'no': 'f.no',
    'no2': 'f.no2',
    'o3': 'f.o3',
    'so2': 'f.so2',
    'pm2_5': 'f.pm2_5',
    'pm10': 'f.pm10',
    'nh3': 'f.nh3'
};

const measureFilterMap = {
    'ville': 'c.city_name',
    'pays': 'c.country',
    'aqi': 'f.aqi',
    'is_weekend': 'dt.is_weekend',
    'date': 'dt.date_value'
};

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
        const { start, end, sortField, sortOrder, filter } = parseListParams(req);
        const limit = end - start + 1;

        let query = `
            SELECT 
                city_id AS id,
                city_name AS ville,
                country AS pays,
                latitude,
                longitude
            FROM dim_city
        `;
        const params = [];
        let paramIndex = 1;

        const whereClauses = [];
        for (const [key, value] of Object.entries(filter)) {
            if (key === 'ville' || key === 'city_name') {
                whereClauses.push(`city_name ILIKE $${paramIndex}`);
                params.push(`%${value}%`);
                paramIndex++;
            }
        }
        if (whereClauses.length) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        let countQuery = `SELECT COUNT(*) FROM dim_city`;
        if (whereClauses.length) {
            countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const orderColumn = cityOrderMap[sortField] || 'city_id';
        const orderDir = sortOrder === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${orderColumn} ${orderDir}`;

        const paginatedParams = [...params, limit, start];
        const paginatedQuery = query + ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

        const result = await pool.query(paginatedQuery, paginatedParams);

        res.set('Content-Range', `cities ${start}-${start + result.rows.length - 1}/${total}`);
        res.set('Access-Control-Expose-Headers', 'Content-Range');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cities/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                city_id AS id,
                city_name AS ville,
                country AS pays,
                latitude,
                longitude
            FROM dim_city 
            WHERE city_id = $1
        `, [req.params.id]);
        if (!result.rows.length) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching city:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/measures', async (req, res) => {
    try {
        const { start, end, sortField, sortOrder, filter } = parseListParams(req);
        const limit = end - start + 1;

        let query = `
            SELECT 
                f.fact_id AS id,
                c.city_name AS ville,
                c.country AS pays,
                c.latitude,
                c.longitude,
                dt.timestamp_hour AS timestamp_utc,
                dt.date_value AS date,
                dt.hour AS heure,
                dt.day_of_week AS jour_semaine,
                dt.is_weekend AS is_weekend,
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

        const whereClauses = [];
        for (const [key, value] of Object.entries(filter)) {
            const column = measureFilterMap[key];
            if (!column) continue;
            if (key === 'ville') {
                whereClauses.push(`${column} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            } else if (key === 'aqi') {
                whereClauses.push(`${column} = $${paramIndex}`);
                params.push(parseInt(value));
                paramIndex++;
            } else if (key === 'is_weekend') {
                whereClauses.push(`${column} = $${paramIndex}`);
                params.push(value === 'true');
                paramIndex++;
            } else if (key === 'date') {
                whereClauses.push(`${column} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            }
        }
        if (whereClauses.length) {
            query += ` AND ${whereClauses.join(' AND ')}`;
        }

        const orderColumn = measureOrderMap[sortField] || 'f.fact_id';
        const orderDir = sortOrder === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${orderColumn} ${orderDir}`;

        const countQuery = query.replace(
            /SELECT .* FROM/,
            'SELECT COUNT(*) FROM'
        );
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const paginatedParams = [...params, limit, start];
        const paginatedQuery = query + ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

        const result = await pool.query(paginatedQuery, paginatedParams);

        res.set('Content-Range', `measures ${start}-${start + result.rows.length - 1}/${total}`);
        res.set('Access-Control-Expose-Headers', 'Content-Range');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching measures:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/measures/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                f.fact_id AS id,
                c.city_name AS ville,
                c.country AS pays,
                c.latitude,
                c.longitude,
                dt.timestamp_hour AS timestamp_utc,
                dt.date_value AS date,
                dt.hour AS heure,
                dt.day_of_week AS jour_semaine,
                dt.is_weekend AS is_weekend,
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
            WHERE f.fact_id = $1
        `, [req.params.id]);
        if (!result.rows.length) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching measure:', err);
        res.status(500).json({ error: err.message });
    }
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

export default app;