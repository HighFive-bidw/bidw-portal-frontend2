import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import { Box, Container, Typography, Paper } from '@mui/material';

function LoginPage() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          BIDW 포털
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          비즈니스 인텔리전스 데이터 웨어하우스
        </Typography>
        <LoginForm />
      </Box>
    </Container>
  );
}

export default LoginPage;
