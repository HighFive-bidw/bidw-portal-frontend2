import React from 'react';
import SubscriptionList from '../../components/subscription/SubscriptionList';
import { Box } from '@mui/material';

function SubscriptionListPage() {
  return (
    <Box className="page-container">
      <SubscriptionList />
    </Box>
  );
}

export default SubscriptionListPage;