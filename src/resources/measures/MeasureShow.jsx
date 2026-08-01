import { Show, useShowContext } from 'react-admin';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import Gauge from '../../components/Gauge';
import AqiChip from '../../components/AqiChip';
import { POLLUTANTS, aqiInfo } from '../../aqi/scale';
import { cityColor } from '../../aqi/cityPalette';
import { tokens } from '../../theme';

function MeasureContent() {
  const { record, isLoading } = useShowContext();
  if (isLoading || !record) return null;

  const data = POLLUTANTS.map((p) => ({ name: p.label, value: record[p.key], unit: p.unit }));
  const info = aqiInfo(record.aqi);
  const ts = new Date(record.timestamp_utc);

  return (
    <Box sx={{ maxWidth: 980 }}>
      <Paper sx={{ p: 3, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <Gauge value={record.aqi} size={140} pulse />
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Typography sx={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: tokens.textLo, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {record.pays} · {record.latitude.toFixed(2)}° / {record.longitude.toFixed(2)}°
          </Typography>
          <Typography variant="h4" sx={{ color: cityColor(record.ville) }}>{record.ville}</Typography>
          <Typography sx={{ mt: 0.5 }}>
            {ts.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} —{' '}
            {ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} UTC
            {record.is_weekend ? ' · week-end' : ''}
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <AqiChip value={record.aqi} />
            <Typography component="span" sx={{ ml: 1.5, color: info.color, fontWeight: 600 }}>{info.label}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Polluants mesurés (µg/m³)</Typography>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={tokens.line} strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: tokens.textLo, fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
            <YAxis tick={{ fill: tokens.textLo, fontSize: 10, fontFamily: 'IBM Plex Mono' }} width={36} />
            <Tooltip
              formatter={(v, n, p) => [v == null ? 'n/d' : `${v} µg/m³`, n]}
              contentStyle={{ background: tokens.surfaceHi, border: `1px solid ${tokens.line}`, borderRadius: 8 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.value == null ? tokens.line : cityColor(record.ville)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}

export default function MeasureShow() {
  return (
    <Show component="div" title="Détail du relevé">
      <MeasureContent />
    </Show>
  );
}
