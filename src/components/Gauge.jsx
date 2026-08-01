import {aqiInfo} from '../aqi/scale';

const START_ANGLE = -225;
const SWEEP = 270;

function polar(cx, cy, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
}

function arcPath(cx, cy, r, a0, a1) {
    const p0 = polar(cx, cy, r, a0);
    const p1 = polar(cx, cy, r, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

export default function Gauge({value, size = 132, pulse = false}) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.36;
    const info = aqiInfo(value);
    const clamped = Math.max(1, Math.min(5, value || 1));
    const needleAngle = START_ANGLE + ((clamped - 1) / 4) * SWEEP;
    const needleTip = polar(cx, cy, r * 0.86, needleAngle);
    const strokeW = size * 0.075;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
             aria-label={`AQI ${clamped} - ${info.label}`}>
            <defs>
                <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3.2" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            <path
                d={arcPath(cx, cy, r, START_ANGLE, START_ANGLE + SWEEP)}
                fill="none"
                stroke="#28372F"
                strokeWidth={strokeW}
                strokeLinecap="round"
            />

            {[1, 2, 3, 4, 5].map((lvl) => {
                const a0 = START_ANGLE + ((lvl - 1) / 5) * SWEEP + 2;
                const a1 = START_ANGLE + (lvl / 5) * SWEEP - 2;
                const active = lvl === clamped;
                return (
                    <path
                        key={lvl}
                        d={arcPath(cx, cy, r, a0, a1)}
                        fill="none"
                        stroke={aqiInfo(lvl).color}
                        strokeWidth={active ? strokeW : strokeW * 0.5}
                        strokeLinecap="round"
                        opacity={active ? 1 : 0.35}
                    />
                );
            })}

            <g
                className={pulse && clamped >= 4 ? 'gauge-needle gauge-pulse' : 'gauge-needle'}
                style={{transformOrigin: `${cx}px ${cy}px`}}
                filter={clamped >= 4 ? `url(#glow-${size})` : undefined}
            >
                <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke={info.color} strokeWidth={2.5}
                      strokeLinecap="round"/>
                <circle cx={cx} cy={cy} r={size * 0.045} fill={info.color}/>
            </g>

            <text
                x={cx}
                y={cy + r * 0.62}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={size * 0.16}
                fontWeight="700"
                fill="#EDF2EE"
            >
                {clamped}
            </text>
        </svg>
    );
}
