import {Box, Typography, Paper} from '@mui/material';
import Gauge from './Gauge';
import {aqiInfo} from '../aqi/scale';
import {tokens} from '../theme';

function fmtCoord(v, pos, neg) {
    const dir = v >= 0 ? pos : neg;
    return `${Math.abs(v).toFixed(2)}°${dir}`;
}

export default function StationCard({city}) {
    const info = aqiInfo(city.aqi_dernier);
    const lastDate = new Date(city.derniere_mesure);

    return (
        <Paper
            sx={{
                p: 2.25,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                minWidth: 200,
                flex: '1 1 200px',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(120px 80px at 85% -10%, ${info.glow}, transparent 70%)`,
                    pointerEvents: 'none',
                },
            }}
        >
            <Typography
                sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    color: tokens.textLo,
                    textTransform: 'uppercase',
                }}
            >
                {fmtCoord(city.latitude, 'N', 'S')} · {fmtCoord(city.longitude, 'E', 'O')}
            </Typography>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                <Gauge value={city.aqi_dernier} size={92} pulse/>
                <Box sx={{minWidth: 0}}>
                    <Typography variant="h6" sx={{lineHeight: 1.15, fontSize: '1.05rem'}} noWrap title={city.ville}>
                        {city.ville}
                    </Typography>
                    <Typography sx={{color: info.color, fontWeight: 700, fontSize: '0.85rem'}}>{info.label}</Typography>
                    <Typography sx={{color: tokens.textLo, fontSize: '0.7rem'}}>
                        moy. {city.aqi_moyen?.toFixed(2)} / 5
                    </Typography>
                </Box>
            </Box>

            <Typography sx={{color: tokens.textLo, fontSize: '0.68rem', fontFamily: '"IBM Plex Mono", monospace'}}>
                maj {lastDate.toLocaleDateString('fr-FR')} {lastDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            })} UTC
            </Typography>
        </Paper>
    );
}
