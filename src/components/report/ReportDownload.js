// components/report/ReportDownload.js
import React, { useState } from 'react';
import {
  Button, Card, CardContent, Typography, Box,
  CircularProgress, Alert, Link, Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';

const ReportDownload = ({ reportId }) => {
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 토큰 가져오기
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      // API 호출을 위한 헤더 설정

      const headers = {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      };

      const apiBaseUrl = window.__runtime_config__?.REPORT_URL || '';

      // API 호출
      const response = await fetch(`${apiBaseUrl}/${reportId}/download`, {
            method: 'GET',
            headers: headers
          });


      if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
          }

      // 응답 데이터 가져오기
      const data = await response.json();
      setDownloadInfo(data);
    } catch (err) {
      setError(`다운로드 정보를 가져오는 데 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          리포트 다운로드
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
          {loading ? '처리 중...' : '다운로드 정보 가져오기'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {downloadInfo && (
          <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" gutterBottom>
              <InfoIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              다운로드 정보
            </Typography>

            <Box sx={{ ml: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>파일명:</strong> {downloadInfo.fileName}
              </Typography>

              <Typography variant="body2" gutterBottom>
                <strong>만료 시간:</strong> {new Date(downloadInfo.expiryTime).toLocaleString()}
              </Typography>

              <Typography variant="body2" gutterBottom>
                <strong>다운로드 URL:</strong>
              </Typography>

              <Box sx={{
                mt: 1, mb: 2, p: 1.5,
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflowX: 'auto',
                fontSize: '0.75rem',
                wordBreak: 'break-all'
              }}>
                {downloadInfo.downloadUrl}
              </Box>

              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                component={Link}
                href={downloadInfo.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                파일 다운로드
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportDownload;