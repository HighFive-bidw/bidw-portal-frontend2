import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Skeleton,
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  BookmarkRemove as BookmarkRemoveIcon,
} from '@mui/icons-material';
import { subscriptionService } from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

function SubscriptionList() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const fetchSubscriptions = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionService.getSubscriptionList(currentUser.username);
      setSubscriptions(response.data);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('구독 리포트 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [currentUser]);

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const handleUnsubscribeClick = (subscription) => {
    setSelectedSubscription(subscription);
    setOpenDialog(true);
  };

  const handleUnsubscribe = async () => {
    if (!selectedSubscription) return;
    
    try {
      await subscriptionService.unsubscribeReport(
        selectedSubscription.subscriptionId,
        currentUser.username
      );
      setSubscriptions(subscriptions.filter(
        sub => sub.subscriptionId !== selectedSubscription.subscriptionId
      ));
      setOpenDialog(false);
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError('구독 취소 중 오류가 발생했습니다.');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box className="page-header">
        <Typography variant="h5" component="h2">
          내 구독 리포트
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} className="card-grid">
        {loading
          ? Array.from(new Array(3)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="rectangular" width={100} height={36} />
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ ml: 1 }} />
                  </CardActions>
                </Card>
              </Grid>
            ))
          : subscriptions.length > 0
          ? subscriptions.map((subscription) => (
              <Grid item xs={12} sm={6} md={4} key={subscription.subscriptionId}>
                <Card className="card">
                  <CardContent className="card-content">
                    <Typography variant="h6" component="div">
                      {subscription.reportName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      구독 일시: {formatDate(subscription.subscribedDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      마지막 업데이트: {formatDate(subscription.lastUpdated)}
                    </Typography>
                  </CardContent>
                  <CardActions className="card-actions">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleViewReport(subscription.reportId)}
                      startIcon={<AssessmentIcon />}
                    >
                      상세 보기
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={() => handleUnsubscribeClick(subscription)}
                      startIcon={<BookmarkRemoveIcon />}
                    >
                      구독 취소
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          : !loading && (
              <Grid item xs={12}>
                <Alert severity="info">
                  구독 중인 리포트가 없습니다. 리포트 목록에서 구독할 수 있습니다.
                </Alert>
              </Grid>
            )}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>구독 취소 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedSubscription && `'${selectedSubscription.reportName}' 리포트의 구독을 취소하시겠습니까?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleUnsubscribe} color="warning" autoFocus>
            구독 취소
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SubscriptionList;
