import {AppBar, TitlePortal} from 'react-admin';
import {Box, Typography, Link} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function MyAppBar(props) {
    return (
        <AppBar {...props} userMenu={false}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flex: 1}}>
                <Typography sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '0.01em'
                }}>
                    Atlas Qualité de l'Air
                </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Link
                    href="https://github.com/nassaigael"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'text.secondary',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        '&:hover': {
                            color: 'primary.main',
                        },
                    }}
                >
                    <GitHubIcon sx={{fontSize: 18}}/>
                    <Typography sx={{fontSize: '0.85rem', fontWeight: 500}}>
                        @nassaigael
                    </Typography>
                </Link>
            </Box>
            <TitlePortal sx={{display: 'none'}}/>
        </AppBar>
    );
}