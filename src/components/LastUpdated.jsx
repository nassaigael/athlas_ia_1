import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { AccessTime, Update } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function LastUpdated() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLastTimestamp = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/latest-timestamp`);
            if (!response.ok) throw new Error('Failed to fetch latest timestamp');
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLastTimestamp();
        const interval = setInterval(fetchLastTimestamp, 300000);
        return () => clearInterval(interval);
    }, []);

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
                <Typography color="error">Error: {error}</Typography>
            </Paper>
        );
    }

    if (!data) return null;

    const formatDate = (dateString) => {
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
    };

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
                    <strong>{data.total_records}</strong> enregistrements
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    <strong>{data.total_cities}</strong> villes
                </Typography>
            </Box>
        </Paper>
    );
}