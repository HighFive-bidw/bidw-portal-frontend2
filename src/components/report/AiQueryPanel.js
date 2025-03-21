// src/components/report/AiQueryPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  IconButton, 
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  QuestionAnswer as QuestionAnswerIcon,
  History as HistoryIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

/**
 * AI 질의응답 패널 컴포넌트
 * 
 * @param {Object} props 컴포넌트 props
 * @param {string|number} props.reportId 리포트 ID
 * @param {string} props.reportName 리포트 이름
 * @param {string} props.initialQuestion 초기 질문 (대화 히스토리에서 선택된 질문)
 * @param {Function} props.onQuestionProcessed 질문 처리 완료 콜백
 */
const AiQueryPanel = ({ 
  reportId, 
  reportName, 
  initialQuestion = '', 
  onQuestionProcessed = () => {} 
}) => {
  const { currentUser } = useAuth();
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandData, setExpandData] = useState(false);
  const messagesEndRef = useRef(null);
  
  // 채팅창 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);
  
  // 리포트 변경 시 대화 초기화
  useEffect(() => {
    setConversation([]);
    setConversationId(null);
    fetchSuggestions();
  }, [reportId]);
  
  // 초기 질문이 설정되면 질문 입력란에 설정
  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
      // 자동으로 질문을 제출하지 않고 사용자가 확인 후 전송하도록 함
    }
  }, [initialQuestion]);
  
  // 질문 예시 가져오기
  const fetchSuggestions = async () => {
    if (!reportId) return;
    
    try {
      const apiBaseUrl = window.__runtime_config__?.AI_QUERY_URL || 'http://localhost:8083/api/ai';
      const response = await fetch(`${apiBaseUrl}/suggestions?reportId=${reportId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('질문 예시를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('질문 예시 조회 오류:', err);
    }
  };
  
  // 질문 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    // 질문이 초기 질문과 동일하면 onQuestionProcessed 호출하여 상태 초기화
    if (question === initialQuestion) {
      onQuestionProcessed();
    }
    
    const userQuestion = question;
    setQuestion('');
    setConversation(prev => [...prev, { role: 'user', content: userQuestion }]);
    setLoading(true);
    setError(null);
    
    try {
      // AI 질의응답 API 호출
      const apiBaseUrl = window.__runtime_config__?.AI_QUERY_URL || 'http://localhost:8083/api/ai';
      const response = await fetch(`${apiBaseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          question: userQuestion,
          reportId: reportId,
          userId: currentUser?.username,
          conversationId: conversationId
        }),
      });
      
      if (!response.ok) {
        throw new Error('AI 응답을 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 대화 컨텍스트 ID 설정
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      // 대화 내역에 AI 응답 추가
      setConversation(prev => [...prev, { 
        role: 'ai', 
        content: data.answer,
        data: data.data || [],
        references: data.references || []
      }]);
      
      // 대화 히스토리 저장
      saveHistory(userQuestion, data.answer);
      
    } catch (err) {
      console.error('AI 질의 오류:', err);
      setError(err.message || '질문 처리 중 오류가 발생했습니다.');
      setConversation(prev => [...prev, { role: 'error', content: '죄송합니다. 질문을 처리하는 중 오류가 발생했습니다.' }]);
    } finally {
      setLoading(false);
    }
  };
  
  // 대화 히스토리 저장
  const saveHistory = async (question, answer) => {
    try {
      const apiBaseUrl = window.__runtime_config__?.AI_QUERY_URL || 'http://localhost:8083/api/ai';
      await fetch(`${apiBaseUrl}/history?userId=${currentUser?.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          reportId: reportId,
          userId: currentUser?.username,
          question: question,
          answer: answer
        }),
      });
    } catch (err) {
      console.error('대화 히스토리 저장 오류:', err);
    }
  };
  
  // 제안된 질문 선택
  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
    setShowSuggestions(false);
  };
  
  // 대화 초기화
  const handleResetConversation = () => {
    setConversation([]);
    setConversationId(null);
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mt: 3, 
        height: '600px', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          <QuestionAnswerIcon sx={{ mr: 1 }} />
          AI 질문 도우미
        </Typography>
        
        <Box>
          <Tooltip title="대화 초기화">
            <IconButton onClick={handleResetConversation} size="small" color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="질문 예시">
            <IconButton 
              onClick={() => setShowSuggestions(!showSuggestions)} 
              size="small" 
              color={showSuggestions ? "secondary" : "primary"}
            >
              <LightbulbIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* 질문 예시 패널 */}
      <Collapse in={showSuggestions}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle2" gutterBottom>
            <LightbulbIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            이런 질문을 해보세요:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Chip 
                key={index} 
                label={suggestion} 
                onClick={() => handleSuggestionClick(suggestion)} 
                clickable 
                color="primary" 
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Paper>
      </Collapse>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* 대화 내역 */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          mb: 2, 
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {conversation.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary'
          }}>
            <QuestionAnswerIcon sx={{ fontSize: 48, mb: 2, opacity: 0.6 }} />
            <Typography variant="body1" gutterBottom>
              리포트에 대해 궁금한 점을 자유롭게 질문해보세요.
            </Typography>
            <Typography variant="body2">
              AI가 데이터를 분석하여 답변해드립니다.
            </Typography>
          </Box>
        ) : (
          <>
            {conversation.map((message, index) => (
              <Box 
                key={index} 
                sx={{ 
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    bgcolor: message.role === 'user' ? 'primary.light' : 
                             message.role === 'error' ? 'error.light' : '#f5f5f5',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">
                    {message.content}
                  </Typography>
                  
                  {/* 데이터 및 참조 정보 (AI 응답에만 표시) */}
                  {message.role === 'ai' && message.data && message.data.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        endIcon={expandData ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setExpandData(!expandData)}
                        sx={{ textTransform: 'none' }}
                      >
                        관련 데이터 {expandData ? '접기' : '보기'}
                      </Button>
                      
                      <Collapse in={expandData}>
                        <Card variant="outlined" sx={{ mt: 1, maxHeight: '200px', overflow: 'auto' }}>
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              데이터 샘플 ({message.data.length}개 항목)
                            </Typography>
                            
                            <Box component="pre" sx={{ 
                              fontSize: '0.75rem', 
                              whiteSpace: 'pre-wrap',
                              overflowX: 'auto'
                            }}>
                              {JSON.stringify(message.data, null, 2)}
                            </Box>
                          </CardContent>
                        </Card>
                      </Collapse>
                    </Box>
                  )}

                  {/* 참조 정보 */}
                  {message.role === 'ai' && message.references && message.references.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        참조 정보:
                      </Typography>
                      <List dense disablePadding>
                        {message.references.map((ref, i) => (
                          <ListItem key={i} disablePadding>
                            <ListItemText
                              primary={ref}
                              primaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  </Paper>
                                </Box>
                              ))}
                              <div ref={messagesEndRef} />
                            </>
                          )}

                          {/* 로딩 상태 표시 */}
                          {loading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                              <CircularProgress size={20} />
                              <Typography variant="body2" color="text.secondary">
                                AI가 응답을 생성 중입니다...
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Divider />

                        {/* 질문 입력 폼 */}
                        <Box
                          component="form"
                          onSubmit={handleSubmit}
                          sx={{
                            mt: 2,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1
                          }}
                        >
                          <TextField
                            fullWidth
                            placeholder="리포트에 대해 질문하세요..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            multiline
                            maxRows={3}
                            disabled={loading}
                            variant="outlined"
                            size="small"
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || !question.trim()}
                            startIcon={<SendIcon />}
                          >
                            전송
                          </Button>
                        </Box>
                      </Paper>
                    );
                  };

                  export default AiQueryPanel;