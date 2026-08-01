import {AppBar, TitlePortal} from 'react-admin';
import {Box, Typography} from '@mui/material';

export default function MyAppBar(props) {
  return (
    <AppBar {...props} userMenu={false}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em' }}>
          Atlas Qualité de l'Air
        </Typography>
      </Box>
      <TitlePortal sx={{ display: 'none' }} />
    </AppBar>
  );
}
