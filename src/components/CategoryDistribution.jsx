import {Box, Typography} from '@mui/material';
import dist from '../data/aqi_category_distribution.json';
import {AQI_LEVELS} from '../aqi/scale';
import {tokens} from '../theme';

export default function CategoryDistribution() {
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            {dist.map((row) => {
                const total = AQI_LEVELS.reduce((s, l) => s + row[String(l.level)], 0) || 1;
                return (
                    <Box key={row.ville}>
                        <Typography
                            sx={{fontSize: '0.75rem', color: tokens.textLo, mb: 0.5, fontFamily: 'IBM Plex Mono'}}>
                            {row.ville}
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            height: 14,
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: `1px solid ${tokens.line}`
                        }}>
                            {AQI_LEVELS.map((l) => {
                                const pct = (row[String(l.level)] / total) * 100;
                                return pct > 0 ? (
                                    <Box
                                        key={l.level}
                                        title={`${l.label} — ${pct.toFixed(1)}%`}
                                        sx={{width: `${pct}%`, backgroundColor: l.color}}
                                    />
                                ) : null;
                            })}
                        </Box>
                    </Box>
                );
            })}
            <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.5}}>
                {AQI_LEVELS.map((l) => (
                    <Box key={l.level} sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                        <Box sx={{width: 9, height: 9, borderRadius: '2px', backgroundColor: l.color}}/>
                        <Typography sx={{fontSize: '0.68rem', color: tokens.textLo}}>{l.label}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
