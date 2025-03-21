import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Pagination,
  Paper,
  Chip,
  Tooltip,
  Collapse,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const ChatHistoryDialog = ({ open, onClose, onSelectQuestion }) => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => {
    if (open && currentUser) {
      fetchHistory();
    }
  }, [open, currentUser, page]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = window.__runtime_config__?.AI_QUERY_URL || 'http://localhost:8083/api/ai';
      const response = await fetch(
        `${apiBaseUrl}/history?userId=${currentUser.username}&page=${page - 1}&size=10`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('대화 히스토리를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setHistory(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('대화 히스토리 조회 오류:', err);
      setError(err.message || '대화 히스토리를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleSelectItem = (item) => {
    setSelectedHistory(selectedHistory?.id === item.id ? null : item);
  };

  const handleUseQuestion = () => {
    if (selectedHistory) {
      onSelectQuestion(selectedHistory.question);
      onClose();
    }
  };

  const formatHistoryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1 }} />
          대화 히스토리
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex' }}>
        {/* 히스토리 목록 */}
        <Box sx={{ width: '40%', borderRight: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : history.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                대화 히스토리가 없습니다.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {history.map((item) => (
                <ListItem
                  key={item.id}
                  disablePadding
                  divider
                >
                  <ListItemButton
                    selected={selectedHistory?.id === item.id}
                    onClick={() => handleSelectItem(item)}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: selectedHistory?.id === item.id ? 'bold' : 'normal',
                          }}
                        >
                          {item.question}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <DescriptionIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                          <Typography variant="caption" noWrap>
                            {item.reportName}
                          </Typography>
                          <Box sx={{ mx: 0.5, fontSize: '0.5rem' }}>•</Box>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                          <Typography variant="caption">
                            {formatHistoryDate(item.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}

          {/* 페이지네이션 */}
          {!loading && history.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* 선택된 대화 상세 */}
        <Box sx={{ width: '60%', p: 0, overflow: 'auto' }}>
          {selectedHistory ? (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    {selectedHistory.reportName}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formatHistoryDate(selectedHistory.createdAt)}
                </Typography>
              </Box>

              <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f8ff' }}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Chip label="질문" size="small" color="primary" sx={{ mr: 1 }} />
                </Box>
                <Typography variant="body1">
                  {selectedHistory.question}
                </Typography>
              </Paper>

              <Paper elevation={0} variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Chip label="응답" size="small" color="secondary" sx={{ mr: 1 }} />
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedHistory.answer}
                </Typography>
              </Paper>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Tooltip title="이 질문을 AI 패널에서 다시 사용합니다">
                  <Chip
                    label="이 질문 다시 사용하기"
                    icon={<QuestionAnswerIcon />}
                    clickable
                    color="primary"
                    onClick={handleUseQuestion}
                  />
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <HistoryIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography>
                대화 내역을 선택하면 상세 내용이 표시됩니다.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatHistoryDialog;