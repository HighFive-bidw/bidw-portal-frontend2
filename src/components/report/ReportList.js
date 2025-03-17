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
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { reportService } from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import dayjs from 'dayjs';

function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [filterEnabled, setFilterEnabled] = useState(false);
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportService.getReportList();
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('리포트 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredReports = async () => {
    if (!startDate || !endDate) {
      setError('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    if (startDate.isAfter(endDate)) {
      setError('시작일은 종료일보다 이전이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');
      
      const response = await reportService.getFilteredReports(
        formattedStartDate,
        formattedEndDate
      );
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching filtered reports:', err);
      setError('필터링된 리포트 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    setFilterEnabled(true);
    fetchFilteredReports();
  };

  const resetFilter = () => {
    setFilterEnabled(false);
    setStartDate(dayjs().subtract(30, 'day'));
    setEndDate(dayjs());
    fetchReports();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  return (
    <Box>
      <Box className="page-header">
        <Typography variant="h5" component="h2">
          리포트 목록
        </Typography>
      </Box>

      <Box className="filter-container">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="시작일"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            disableFuture
            slotProps={{ textField: { size: 'small' } }}
          />

          <DatePicker
            label="종료일"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            disableFuture
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>

        <Button
          variant="contained"
          onClick={applyFilter}
          disabled={!startDate || !endDate}
        >
          필터 적용
        </Button>

        {filterEnabled && (
          <Button
            variant="outlined"
            onClick={resetFilter}
          >
            필터 초기화
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} className="card-grid">
        {loading
          ? Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="rectangular" width={100} height={36} />
                  </CardActions>
                </Card>
              </Grid>
            ))
          : reports.length > 0
          ? reports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.reportId}>
                <Card className="card">
                  <CardContent className="card-content">
                    <Typography variant="h6" component="div">
                      {report.reportName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      마지막 업데이트: {formatDate(report.lastUpdated)}
                    </Typography>
                  </CardContent>
                  <CardActions className="card-actions">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleViewReport(report.reportId)}
                      startIcon={<AssessmentIcon />}
                    >
                      상세 보기
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          : !loading && (
              <Grid item xs={12}>
                <Alert severity="info">
                  {filterEnabled
                    ? '선택한 기간에 해당하는 리포트가 없습니다.'
                    : '사용 가능한 리포트가 없습니다.'}
                </Alert>
              </Grid>
            )}
      </Grid>
    </Box>
  );
}

export default ReportList;
