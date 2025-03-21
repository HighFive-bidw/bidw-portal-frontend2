// src/pages/report/ReportDetailPage.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ReportDetail from '../../components/report/ReportDetail';
import ChatHistoryDialog from '../../components/ai/ChatHistoryDialog';
import { Box, Tabs, Tab, Button, Paper } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';

/**
 * 리포트 상세 페이지 컴포넌트
 * 리포트 데이터와 AI 질의응답 기능을 탭으로 구분하여 제공
 */
function ReportDetailPage() {
  const { reportId } = useParams();
  const [activeTab, setActiveTab] = useState(0); // 활성 탭 상태 (0: 리포트 데이터, 1: AI 질의응답)
  const [historyOpen, setHistoryOpen] = useState(false); // 대화 히스토리 다이얼로그 열림 상태
  const [selectedQuestion, setSelectedQuestion] = useState(''); // 선택된 질문 상태

  /**
   * 탭 변경 핸들러
   * @param {Event} event 이벤트 객체
   * @param {number} newValue 새 탭 인덱스
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  /**
   * 히스토리 다이얼로그 열기 핸들러
   */
  const handleOpenHistory = () => {
    setHistoryOpen(true);
  };

  /**
   * 히스토리 다이얼로그 닫기 핸들러
   */
  const handleCloseHistory = () => {
    setHistoryOpen(false);
  };

  /**
   * 히스토리에서 질문 선택 시 호출되는 핸들러
   * @param {string} question 선택된 질문
   */
  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    // 질문이 선택되면 AI 탭으로 전환
    setActiveTab(1);
  };

  /**
   * 선택된 질문 처리 완료 핸들러
   */
  const handleQuestionProcessed = () => {
    setSelectedQuestion('');
  };

  return (
    <Box className="page-container">
      {/* 탭 헤더 및 히스토리 버튼 */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="report tabs"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="리포트 데이터" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="AI 질의응답" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>

          <Button
            startIcon={<HistoryIcon />}
            variant="outlined"
            size="small"
            onClick={handleOpenHistory}
            sx={{ my: 1 }}
          >
            대화 히스토리
          </Button>
        </Box>
      </Paper>

      {/* 탭 패널 */}
      <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
        {activeTab === 0 && <ReportDetail activeTab={activeTab} />}
      </Box>

      <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
        {activeTab === 1 && (
          <ReportDetail
            activeTab={activeTab}
            selectedQuestion={selectedQuestion}
            onQuestionSelected={handleQuestionProcessed}
          />
        )}
      </Box>

      {/* 대화 히스토리 다이얼로그 */}
      <ChatHistoryDialog
        open={historyOpen}
        onClose={handleCloseHistory}
        onSelectQuestion={handleSelectQuestion}
      />
    </Box>
  );
}

export default ReportDetailPage;