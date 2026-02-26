import { Box, Typography } from '@mui/material';

export default function Shorts() {
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
        Shorts - Coming Soon
      </Typography>
    </Box>
  );
}
