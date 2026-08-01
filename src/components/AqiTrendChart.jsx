import {ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import dailyTrend from '../data/daily_trend.json';
import cities from '../data/cities.json';
import {cityColor} from '../aqi/cityPalette';
import {tokens} from '../theme';

export default function AqiTrendChart() {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dailyTrend} margin={{top: 8, right: 16, left: -12, bottom: 0}}>
                <CartesianGrid stroke={tokens.line} strokeDasharray="3 3"/>
                <XAxis
                    dataKey="date"
                    tick={{fill: tokens.textLo, fontSize: 10, fontFamily: 'IBM Plex Mono'}}
                    tickFormatter={(d) => d.slice(5)}
                    interval={Math.ceil(dailyTrend.length / 12)}
                />
                <YAxis
                    domain={[1, 5]}
                    tick={{fill: tokens.textLo, fontSize: 10, fontFamily: 'IBM Plex Mono'}}
                    width={28}
                />
                <Tooltip
                    contentStyle={{background: tokens.surfaceHi, border: `1px solid ${tokens.line}`, borderRadius: 8}}
                    labelStyle={{color: tokens.textHi, fontFamily: 'IBM Plex Mono'}}
                />
                <Legend wrapperStyle={{fontSize: 12, fontFamily: 'Inter'}}/>
                {cities.map((c) => (
                    <Line
                        key={c.ville}
                        type="monotone"
                        dataKey={c.ville}
                        stroke={cityColor(c.ville)}
                        dot={false}
                        strokeWidth={2}
                        connectNulls
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
