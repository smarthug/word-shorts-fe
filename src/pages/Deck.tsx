import { Box, Typography } from '@mui/material';

export default function Deck() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Typography variant="h5" color="text.secondary">
        Deck - Coming Soon
      </Typography>
    </Box>
  );
}
