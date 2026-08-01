export const AQI_LEVELS = [
    {level: 1, label: 'Bon', short: 'Bon', color: '#4CC38A', glow: 'rgba(76,195,138,0.45)'},
    {level: 2, label: 'Correct', short: 'Correct', color: '#A9C23F', glow: 'rgba(169,194,63,0.45)'},
    {level: 3, label: 'Modéré', short: 'Modéré', color: '#E3A83B', glow: 'rgba(227,168,59,0.45)'},
    {level: 4, label: 'Mauvais', short: 'Mauvais', color: '#DB6A42', glow: 'rgba(219,106,66,0.5)'},
    {level: 5, label: 'Très mauvais', short: 'Très mauvais', color: '#B24FA6', glow: 'rgba(178,79,166,0.55)'},
];

export function aqiInfo(level) {
    const idx = Math.max(1, Math.min(5, Math.round(level || 1))) - 1;
    return AQI_LEVELS[idx];
}

function hexToRgb(hex) {
    const v = hex.replace('#', '');
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

export function interpolateAqiColor(value) {
    if (value == null) return '#1B2A24';
    const v = Math.max(1, Math.min(5, value));
    const i = Math.min(3, Math.floor(v - 1));
    const t = v - 1 - i;
    const c0 = hexToRgb(AQI_LEVELS[i].color);
    const c1 = hexToRgb(AQI_LEVELS[i + 1].color);
    const mix = c0.map((c, idx) => Math.round(c + (c1[idx] - c) * t));
    return `rgb(${mix.join(',')})`;
}

export const POLLUTANTS = [
    {key: 'pm2_5', label: 'PM2.5', unit: 'µg/m³', desc: 'Particules fines ≤ 2.5 µm'},
    {key: 'pm10', label: 'PM10', unit: 'µg/m³', desc: 'Particules ≤ 10 µm'},
    {key: 'o3', label: 'O₃', unit: 'µg/m³', desc: 'Ozone'},
    {key: 'no2', label: 'NO₂', unit: 'µg/m³', desc: "Dioxyde d'azote"},
    {key: 'so2', label: 'SO₂', unit: 'µg/m³', desc: 'Dioxyde de soufre'},
    {key: 'co', label: 'CO', unit: 'µg/m³', desc: 'Monoxyde de carbone'},
    {key: 'no', label: 'NO', unit: 'µg/m³', desc: "Monoxyde d'azote"},
    {key: 'nh3', label: 'NH₃', unit: 'µg/m³', desc: 'Ammoniac'},
];
