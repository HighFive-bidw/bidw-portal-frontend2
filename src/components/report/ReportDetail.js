// src/components/report/ReportDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GetApp as GetAppIcon,
  BookmarkAdd as BookmarkAddIcon,
  BookmarkRemove as BookmarkRemoveIcon,
} from '@mui/icons-material';
import { reportService, subscriptionService } from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import ReportDownload from './ReportDownload';
import AiQueryPanel from './AiQueryPanel';

function ReportDetail({ activeTab = 0, selectedQuestion = '', onQuestionSelected = () => {} }) {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogUrl, setDialogUrl] = useState('');

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportService.getReportDetail(reportId);
      setReport(response.data);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('리포트 상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      if (currentUser) {
        const response = await subscriptionService.getSubscriptionList(currentUser.username);
        const subscriptions = response.data;
        const subscription = subscriptions.find(sub => sub.reportId === parseInt(reportId));
        
        if (subscription) {
          setIsSubscribed(true);
          setSubscriptionId(subscription.subscriptionId);
        } else {
          setIsSubscribed(false);
          setSubscriptionId(null);
        }
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
    }
  };

  useEffect(() => {
    fetchReportDetail();
    checkSubscriptionStatus();
  }, [reportId, currentUser]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      const response = await reportService.downloadReport(reportId);
      const downloadUrl = response.data.downloadUrl;
      setDownloadUrl(downloadUrl);

      // 자동 다운로드 시작
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', response.data.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // URL 정보와 함께 성공 대화상자 표시
      showDialog('success', '리포트가 성공적으로 다운로드되었습니다.', downloadUrl);
    } catch (err) {
      console.error('Error downloading report:', err);
      showDialog('error', '리포트 다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setSubscribing(true);
      const response = await subscriptionService.subscribeReport(currentUser.username, parseInt(reportId));
      setIsSubscribed(true);
      setSubscriptionId(response.data.subscriptionId);
      showDialog('success', '리포트가 성공적으로 구독되었습니다.');
    } catch (err) {
      console.error('Error subscribing to report:', err);
      if (err.response && err.response.status === 400 && err.response.data.message.includes('최대 구독 한도')) {
        showDialog('error', '최대 구독 한도에 도달했습니다. 다른 구독을 취소한 후 다시 시도해주세요.');
      } else {
        showDialog('error', '리포트 구독 중 오류가 발생했습니다.');
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setSubscribing(true);
      await subscriptionService.unsubscribeReport(subscriptionId, currentUser.username);
      setIsSubscribed(false);
      setSubscriptionId(null);
      showDialog('success', '리포트 구독이 취소되었습니다.');
    } catch (err) {
      console.error('Error unsubscribing from report:', err);
      showDialog('error', '리포트 구독 취소 중 오류가 발생했습니다.');
    } finally {
      setSubscribing(false);
    }
  };

  const showDialog = (type, message, url = '') => {
    setDialogType(type);
    setDialogMessage(message);
    setDialogUrl(url);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={handleGoBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={handleGoBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="warning">리포트를 찾을 수 없습니다.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="page-title">
        <IconButton onClick={handleGoBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {report.reportName}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              마지막 업데이트: {formatDate(report.lastUpdated)}
            </Typography>

            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppIcon />}
                onClick={handleDownload}
                disabled={downloadLoading}
                sx={{ mr: 1 }}
              >
                {downloadLoading ? '다운로드 중...' : 'Excel 다운로드'}
              </Button>
              
              {isSubscribed ? (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<BookmarkRemoveIcon />}
                  onClick={handleUnsubscribe}
                  disabled={subscribing}
                >
                  구독 취소
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<BookmarkAddIcon />}
                  onClick={handleSubscribe}
                  disabled={subscribing}
                >
                  구독하기
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {activeTab === 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            리포트 데이터
          </Typography>

          {report.data && report.data.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {Object.keys(report.data[0]).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.data.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>
                          {typeof value === 'object' && value !== null
                            ? JSON.stringify(value)
                            : value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">리포트에 표시할 데이터가 없습니다.</Alert>
          )}

          <ReportDownload reportId={reportId} />
        </>
      )}

      {activeTab === 1 && (
        <AiQueryPanel 
          reportId={reportId} 
          reportName={report.reportName}
          initialQuestion={selectedQuestion}
          onQuestionProcessed={onQuestionSelected}
        />
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {dialogType === 'success' ? '성공' : '오류'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogMessage}
          </DialogContentText>
          {dialogUrl && (
            <Box mt={2}>
              <Typography variant="subtitle2">다운로드 URL:</Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  wordBreak: 'break-all',
                  bgcolor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  mt: 0.5
                }}
              >
                {dialogUrl}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReportDetail;