export const CITY_COLORS = {
    Antananarivo: '#4FA8E0',
    Nairobi: '#7FD1C9',
    'New York': '#9C8FE0',
    Paris: '#E08FC0',
    Tokyo: '#C9D1DC',
};

export function cityColor(name) {
    return CITY_COLORS[name] || '#8FA398';
}
