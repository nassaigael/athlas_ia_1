import {Show, useShowContext} from 'react-admin';
import {Box, Divider, Paper, Typography} from '@mui/material';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Gauge from '../../components/Gauge';
import {aqiInfo, POLLUTANTS} from '../../aqi/scale';
import {cityColor} from '../../aqi/cityPalette';
import {tokens} from '../../theme';
import dailyTrend from '../../data/daily_trend.json';

function CityContent() {
    const {record, isLoading} = useShowContext();
    if (isLoading || !record) return null;

    const info = aqiInfo(Math.round(record.aqi_moyen));
    const trend = dailyTrend.map((d) => ({date: d.date, valeur: d[record.ville]}));
    const pollutants = POLLUTANTS.map((p) => ({name: p.label, value: record[`${p.key}_moyen`]}));
    const color = cityColor(record.ville);

    return (
        <Box sx={{maxWidth: 1040}}>
            <Paper sx={{p: 3, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', mb: 2}}>
                <Gauge value={record.aqi_moyen} size={140}/>
                <Box sx={{flex: 1, minWidth: 260}}>
                    <Typography sx={{
                        fontFamily: 'IBM Plex Mono',
                        fontSize: '0.7rem',
                        color: tokens.textLo,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>
                        {record.pays} · {record.latitude.toFixed(2)}° / {record.longitude.toFixed(2)}°
                    </Typography>
                    <Typography variant="h4" sx={{color}}>{record.ville}</Typography>
                    <Typography sx={{mt: 0.5, color: tokens.textLo}}>
                        {record.nb_mesures.toLocaleString('fr-FR')} relevés
                        · {new Date(record.date_min).toLocaleDateString('fr-FR')} → {new Date(record.date_max).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography sx={{mt: 1, color: info.color, fontWeight: 700, fontSize: '1.1rem'}}>
                        AQI moyen {record.aqi_moyen?.toFixed(2)} — {info.label}
                    </Typography>
                </Box>
            </Paper>

            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1.5fr 1fr'}, gap: 2}}>
                <Paper sx={{p: 3}}>
                    <Typography variant="h6" sx={{mb: 1.5}}>Tendance AQI quotidienne</Typography>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={trend} margin={{top: 8, right: 16, left: -12, bottom: 0}}>
                            <CartesianGrid stroke={tokens.line} strokeDasharray="3 3"/>
                            <XAxis dataKey="date" tick={{fill: tokens.textLo, fontSize: 9, fontFamily: 'IBM Plex Mono'}}
                                   tickFormatter={(d) => d.slice(5)} interval={Math.ceil(trend.length / 10)}/>
                            <YAxis domain={[1, 5]}
                                   tick={{fill: tokens.textLo, fontSize: 10, fontFamily: 'IBM Plex Mono'}} width={24}/>
                            <Tooltip contentStyle={{
                                background: tokens.surfaceHi,
                                border: `1px solid ${tokens.line}`,
                                borderRadius: 8
                            }}/>
                            <Line type="monotone" dataKey="valeur" stroke={color} strokeWidth={2} dot={false}
                                  connectNulls/>
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>

                <Paper sx={{p: 3}}>
                    <Typography variant="h6" sx={{mb: 1.5}}>Qualité des données</Typography>
                    <Typography sx={{fontSize: '0.85rem', lineHeight: 2}}>
                        NH₃ manquant : <b>{record.nh3_missing}</b> relevés<br/>
                        CO manquant : <b>{record.co_missing}</b> relevés<br/>
                        Couverture
                        : <b>{record.nb_mesures}</b> / {Math.round((new Date(record.date_max) - new Date(record.date_min)) / 3.6e6) + 1} heures
                        attendues
                    </Typography>
                    <Divider sx={{my: 1.5, borderColor: tokens.line}}/>
                    <Typography sx={{fontSize: '0.75rem', color: tokens.textLo}}>
                        Écarts documentés dans le README du pipeline (indisponibilités API, démarrage du backfill).
                    </Typography>
                </Paper>
            </Box>

            <Paper sx={{p: 3, mt: 2}}>
                <Typography variant="h6" sx={{mb: 1.5}}>Moyenne des polluants (µg/m³)</Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={pollutants} margin={{top: 8, right: 16, left: -8, bottom: 0}}>
                        <CartesianGrid stroke={tokens.line} strokeDasharray="3 3"/>
                        <XAxis dataKey="name" tick={{fill: tokens.textLo, fontSize: 11, fontFamily: 'IBM Plex Mono'}}/>
                        <YAxis tick={{fill: tokens.textLo, fontSize: 10, fontFamily: 'IBM Plex Mono'}} width={36}/>
                        <Tooltip contentStyle={{
                            background: tokens.surfaceHi,
                            border: `1px solid ${tokens.line}`,
                            borderRadius: 8
                        }}/>
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {pollutants.map((p) => (
                                <Cell key={p.name} fill={color}/>
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
}

export default function CityShow() {
    return (
        <Show component="div" title="Fiche station">
            <CityContent/>
        </Show>
    );
}
