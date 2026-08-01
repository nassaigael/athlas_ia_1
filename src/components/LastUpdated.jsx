import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Skeleton, Alert } from '@mui/material';
import { AccessTime, Update, Refresh } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { fetchLatestTimestamp } from '../api';

export default function LastUpdated() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await fetchLatestTimestamp();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Error fetching latest timestamp:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 300000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'UTC',
                timeZoneName: 'short'
            }).format(date);
        } catch {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ width: '100%' }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                </Box>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 2 }}>
                <Alert
                    severity="warning"
                    action={
                        <IconButton color="inherit" size="small" onClick={loadData}>
                            <Refresh />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            </Paper>
        );
    }

    if (!data) return null;

    return (
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Update color="primary" />
                <Typography variant="body2" color="text.secondary">
                    Dernière mise à jour:
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color="action" fontSize="small" />
                <Typography variant="body1" fontWeight="bold">
                    {formatDate(data.last_timestamp)}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                <Typography variant="caption" color="text.secondary">
                    <strong>{data.total_records?.toLocaleString() || 0}</strong> enregistrements
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    <strong>{data.total_cities || 0}</strong> villes
                </Typography>
                <IconButton size="small" onClick={loadData} title="Rafraîchir">
                    <Refresh fontSize="small" />
                </IconButton>
            </Box>
        </Paper>
    );
}