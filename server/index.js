import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import pg from 'pg';

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

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(',');

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Range'],
    exposedHeaders: ['Content-Range', 'Content-Length'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

function parseListParams(req) {
    const range = req.query.range ? JSON.parse(req.query.range) : [0, 24];
    const sort = req.query.sort ? JSON.parse(req.query.sort) : ['id', 'ASC'];
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    return { start: range[0], end: range[1], sortField: sort[0], sortOrder: sort[1], filter };
}

const MEASURE_SORT_MAP = {
    id: 'fact.fact_id',
    ville: 'city.city_name',
    pays: 'city.country',
    latitude: 'city.latitude',
    longitude: 'city.longitude',
    timestamp_utc: 'dt.timestamp_hour',
    date: 'dt.date_value',
    heure: 'dt.hour',
    jour_semaine: 'dt.day_of_week',
    is_weekend: 'dt.is_weekend',
    aqi: 'fact.aqi',
    co: 'fact.co',
    no: 'fact.no',
    no2: 'fact.no2',
    o3: 'fact.o3',
    so2: 'fact.so2',
    pm2_5: 'fact.pm2_5',
    pm10: 'fact.pm10',
    nh3: 'fact.nh3',
};

const MEASURE_FILTER_MAP = {
    ville: 'city.city_name',
    pays: 'city.country',
    aqi: 'fact.aqi',
    is_weekend: 'dt.is_weekend',
    date: 'dt.date_value',
};

const MEASURES_SELECT = `
    SELECT fact.fact_id      AS id,
           city.city_name    AS ville,
           city.country      AS pays,
           city.latitude     AS latitude,
           city.longitude    AS longitude,
           dt.timestamp_hour AS timestamp_utc,
           dt.date_value AS date,
        dt.hour                 AS heure,
        dt.day_of_week          AS jour_semaine,
        dt.is_weekend           AS is_weekend,
        fact.aqi                AS aqi,
        fact.co                 AS co,
        fact.no                 AS no,
        fact.no2                AS no2,
        fact.o3                 AS o3,
        fact.so2                AS so2,
        fact.pm2_5              AS pm2_5,
        fact.pm10               AS pm10,
        fact.nh3                AS nh3
    FROM fact_air_quality fact
        JOIN dim_city city
    ON fact.city_id = city.city_id
        JOIN dim_time dt ON fact.time_id = dt.time_id
`;

app.get('/measures', async (req, res) => {
    try {
        const { start, end, sortField, sortOrder, filter } = parseListParams(req);
        const limit = end - start + 1;

        const whereClauses = [];
        const values = [];
        for (const [key, value] of Object.entries(filter)) {
            const column = MEASURE_FILTER_MAP[key];
            if (!column) continue;
            values.push(value);
            whereClauses.push(`${column} = $${values.length}`);
        }
        const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const orderColumn = MEASURE_SORT_MAP[sortField] || 'fact.fact_id';
        const orderDir = sortOrder === 'DESC' ? 'DESC' : 'ASC';

        const countResult = await pool.query(`SELECT COUNT(*) ::int AS count
                                              FROM fact_air_quality fact
                                                  JOIN dim_city city
                                              ON fact.city_id = city.city_id
                                                  JOIN dim_time dt ON fact.time_id = dt.time_id
                                                  ${where}`, values);
        const total = countResult.rows[0].count;

        values.push(limit, start);
        const dataResult = await pool.query(`${MEASURES_SELECT}
             ${where}
             ORDER BY ${orderColumn} ${orderDir}
             LIMIT $${values.length - 1} OFFSET $${values.length}`, values);

        res.set('Content-Range', `measures ${start}-${start + dataResult.rows.length - 1}/${total}`);
        res.set('Access-Control-Expose-Headers', 'Content-Range');
        res.json(dataResult.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/measures/:id', async (req, res) => {
    try {
        const result = await pool.query(`${MEASURES_SELECT} WHERE fact.fact_id = $1`, [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const CITIES_QUERY = `
    WITH agg AS (SELECT city.city_id                       AS id,
                        city.city_name                     AS ville,
                        city.country                       AS pays,
                        city.latitude,
                        city.longitude,
                        COUNT(*)                           AS nb_mesures,
                        MIN(dt.timestamp_hour)             AS date_min,
                        MAX(dt.timestamp_hour)             AS date_max,
                        ROUND(AVG(fact.aqi)::numeric, 2)   AS aqi_moyen,
                        ROUND(AVG(fact.co)::numeric, 3)    AS co_moyen,
                        ROUND(AVG(fact.no)::numeric, 3)    AS no_moyen,
                        ROUND(AVG(fact.no2)::numeric, 3)   AS no2_moyen,
                        ROUND(AVG(fact.o3)::numeric, 3)    AS o3_moyen,
                        ROUND(AVG(fact.so2)::numeric, 3)   AS so2_moyen,
                        ROUND(AVG(fact.pm2_5)::numeric, 3) AS pm2_5_moyen,
                        ROUND(AVG(fact.pm10)::numeric, 3)  AS pm10_moyen,
                        ROUND(AVG(fact.nh3)::numeric, 3)   AS nh3_moyen,
                        COUNT(*)                              FILTER (WHERE fact.nh3 IS NULL)         AS nh3_missing, COUNT(*) FILTER (WHERE fact.co IS NULL)          AS co_missing
                 FROM fact_air_quality fact
                          JOIN dim_city city ON fact.city_id = city.city_id
                          JOIN dim_time dt ON fact.time_id = dt.time_id
                 GROUP BY city.city_id, city.city_name, city.country, city.latitude, city.longitude),
         latest AS (SELECT DISTINCT
    ON (fact.city_id)
        fact.city_id,
        fact.aqi AS aqi_dernier,
        dt.timestamp_hour AS derniere_mesure
    FROM fact_air_quality fact
        JOIN dim_time dt
    ON fact.time_id = dt.time_id
    ORDER BY fact.city_id, dt.timestamp_hour DESC
        )
    SELECT agg.*, latest.aqi_dernier, latest.derniere_mesure
    FROM agg
             JOIN latest ON latest.city_id = agg.id
`;

const CITY_SORT_MAP = {
    id: 'id',
    ville: 'ville',
    pays: 'pays',
    latitude: 'latitude',
    longitude: 'longitude',
    nb_mesures: 'nb_mesures',
    aqi_moyen: 'aqi_moyen',
    derniere_mesure: 'derniere_mesure',
};

app.get('/cities', async (req, res) => {
    try {
        const { start, end, sortField, sortOrder } = parseListParams(req);
        const limit = end - start + 1;
        const orderColumn = CITY_SORT_MAP[sortField] || 'ville';
        const orderDir = sortOrder === 'DESC' ? 'DESC' : 'ASC';

        const result = await pool.query(`${CITIES_QUERY} ORDER BY ${orderColumn} ${orderDir}`);
        const total = result.rows.length;
        const page = result.rows.slice(start, start + limit);

        res.set('Content-Range', `cities ${start}-${start + page.length - 1}/${total}`);
        res.set('Access-Control-Expose-Headers', 'Content-Range');
        res.json(page);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/cities/:id', async (req, res) => {
    try {
        const result = await pool.query(`${CITIES_QUERY} WHERE agg.id = $1`, [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/latest-timestamp', async (req, res) => {
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

app.get('/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', db: 'connected' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`✅ AQI API listening on http://localhost:${port}`);
    console.log(`🔗 Connected to Neon Postgres host: ${process.env.DB_HOST}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔄 Latest timestamp: http://localhost:${port}/latest-timestamp`);
});