import {Chip} from '@mui/material';
import {aqiInfo} from '../aqi/scale';

export default function AqiChip({value, size = 'small'}) {
    if (value == null) return null;
    const info = aqiInfo(value);
    return (
        <Chip
            size={size}
            label={`${value} · ${info.short}`}
            sx={{
                backgroundColor: `${info.color}22`,
                color: info.color,
                border: `1px solid ${info.color}66`,
            }}
        />
    );
}
