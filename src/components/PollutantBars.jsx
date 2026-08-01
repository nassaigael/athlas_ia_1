import {useState} from 'react';
import {ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';
import {ToggleButtonGroup, ToggleButton} from '@mui/material';
import pollutantByCity from '../data/pollutant_by_city.json';
import {POLLUTANTS} from '../aqi/scale';
import {cityColor} from '../aqi/cityPalette';
import {tokens} from '../theme';

export default function PollutantBars() {
    const [pollutant, setPollutant] = useState('pm2_5');
    const meta = POLLUTANTS.find((p) => p.key === pollutant);
    const data = pollutantByCity.map((row) => ({ville: row.ville, valeur: row[pollutant]}));

    return (
        <div>
            <ToggleButtonGroup
                value={pollutant}
                exclusive
                size="small"
                onChange={(_, v) => v && setPollutant(v)}
                sx={{
                    mb: 1.5,
                    flexWrap: 'wrap',
                    gap: 0.5,
                    '& .MuiToggleButton-root': {
                        fontFamily: 'IBM Plex Mono',
                        fontSize: '0.7rem',
                        border: `1px solid ${tokens.line}`
                    }
                }}
            >
                {POLLUTANTS.map((p) => (
                    <ToggleButton key={p.key} value={p.key}>
                        {p.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{top: 8, right: 16, left: -12, bottom: 0}}>
                    <CartesianGrid stroke={tokens.line} strokeDasharray="3 3"/>
                    <XAxis dataKey="ville" tick={{fill: tokens.textLo, fontSize: 10, fontFamily: 'IBM Plex Mono'}}/>
                    <YAxis tick={{fill: tokens.textLo, fontSize: 10, fontFamily: 'IBM Plex Mono'}} width={40}/>
                    <Tooltip
                        formatter={(v) => [`${v} ${meta.unit}`, meta.label]}
                        contentStyle={{
                            background: tokens.surfaceHi,
                            border: `1px solid ${tokens.line}`,
                            borderRadius: 8
                        }}
                        labelStyle={{color: tokens.textHi}}
                    />
                    <Bar dataKey="valeur" radius={[6, 6, 0, 0]}>
                        {data.map((d) => (
                            <Cell key={d.ville} fill={cityColor(d.ville)}/>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
