import { Box, Paper, Typography, Divider } from '@mui/material';
import { Title } from 'react-admin';
import StationCard from '../components/StationCard';
import AqiTrendChart from '../components/AqiTrendChart';
import PollutantBars from '../components/PollutantBars';
import HourlyHeatmap from '../components/HourlyHeatmap';
import CategoryDistribution from '../components/CategoryDistribution';
import LastUpdated from '../components/LastUpdated';
import cities from '../data/cities.json';
import heatmap from '../data/hourly_heatmap.json';
import { tokens } from '../theme';

function SectionCard({ title, eyebrow, children, sx }) {
    return (
        <Paper sx={{ p: 2.5, ...sx }}>
            <Typography sx={{
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                color: tokens.textLo,
                fontFamily: 'IBM Plex Mono',
                textTransform: 'uppercase'
            }}>
                {eyebrow}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1.5, mt: 0.25 }}>{title}</Typography>
            {children}
        </Paper>
    );
}

function computeInsights() {
    const sorted = [...cities].sort((a, b) => b.aqi_moyen - a.aqi_moyen);
    const worst = sorted[0];
    const best = sorted[sorted.length - 1];
    const validHeat = heatmap.filter((h) => h.aqi_moyen != null);
    const worstHour = validHeat.reduce((a, b) => (b.aqi_moyen > a.aqi_moyen ? b : a), validHeat[0]);
    const totalMesures = cities.reduce((s, c) => s + c.nb_mesures, 0);
    const dateMin = cities.reduce((m, c) => (c.date_min < m ? c.date_min : m), cities[0].date_min);
    const dateMax = cities.reduce((m, c) => (c.date_max > m ? c.date_max : m), cities[0].date_max);
    return { worst, best, worstHour, totalMesures, dateMin, dateMax };
}

export default function Dashboard() {
    const { worst, best, worstHour, totalMesures, dateMin, dateMax } = computeInsights();

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
            <Title title="Tableau de bord" />

            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>Stations de mesure — qualité de l'air</Typography>
                <Box sx={{ mb: 2 }}>
                    <LastUpdated />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {cities.map((c) => (
                        <StationCard key={c.ville} city={c} />
                    ))}
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' }, gap: 2, mb: 2 }}>
                <SectionCard eyebrow="Série temporelle" title="AQI moyen quotidien par ville">
                    <AqiTrendChart />
                </SectionCard>
                <SectionCard eyebrow="Répartition" title="Temps passé par catégorie AQI">
                    <CategoryDistribution />
                </SectionCard>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.4fr' }, gap: 2 }}>
                <SectionCard eyebrow="Comparaison" title="Polluants — moyenne par ville">
                    <PollutantBars />
                </SectionCard>
                <SectionCard eyebrow="Rythme hebdomadaire" title="AQI moyen par jour × heure (UTC)">
                    <HourlyHeatmap />
                    <Divider sx={{ my: 1, borderColor: tokens.line }} />
                    <Typography sx={{ fontSize: '0.72rem', color: tokens.textLo }}>
                        Toutes villes confondues — survolez une cellule pour la valeur exacte.
                    </Typography>
                </SectionCard>
            </Box>
        </Box>
    );
}