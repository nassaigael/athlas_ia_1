import { Box, Typography, Tooltip } from '@mui/material';
import heatmap from '../data/hourly_heatmap.json';
import { interpolateAqiColor } from '../aqi/scale';
import { tokens } from '../theme';

const JOURS = [
  ['Monday', 'Lun'],
  ['Tuesday', 'Mar'],
  ['Wednesday', 'Mer'],
  ['Thursday', 'Jeu'],
  ['Friday', 'Ven'],
  ['Saturday', 'Sam'],
  ['Sunday', 'Dim'],
];

export default function HourlyHeatmap() {
  const byKey = {};
  heatmap.forEach((d) => {
    byKey[`${d.jour}-${d.heure}`] = d;
  });

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '36px repeat(24, 1fr)', gap: '3px', mb: 0.5 }}>
        <Box />
        {Array.from({ length: 24 }).map((_, h) => (
          <Typography
            key={h}
            sx={{ fontSize: '0.6rem', color: tokens.textLo, textAlign: 'center', fontFamily: 'IBM Plex Mono' }}
          >
            {h % 3 === 0 ? h : ''}
          </Typography>
        ))}
      </Box>
      {JOURS.map(([key, label]) => (
        <Box key={key} sx={{ display: 'grid', gridTemplateColumns: '36px repeat(24, 1fr)', gap: '3px', mb: '3px' }}>
          <Typography sx={{ fontSize: '0.65rem', color: tokens.textLo, fontFamily: 'IBM Plex Mono' }}>{label}</Typography>
          {Array.from({ length: 24 }).map((_, h) => {
            const cellData = byKey[`${key}-${h}`];
            const v = cellData?.aqi_moyen;
            return (
              <Tooltip
                key={h}
                title={v != null ? `${label} ${h}h — AQI moyen ${v.toFixed(2)} (n=${cellData.n})` : 'pas de données'}
                arrow
              >
                <Box
                  sx={{
                    aspectRatio: '1 / 1',
                    borderRadius: '3px',
                    backgroundColor: interpolateAqiColor(v),
                    border: `1px solid ${tokens.line}`,
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
