import { useState } from 'react';
import { Card, Button, Space, message, Typography, Alert, Spin, Statistic, Tag } from 'antd';
import { RobotOutlined, ReloadOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { aiService } from '../../../services/ai.service';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

/**
 * AI Management Page
 * 
 * Features:
 * - Reindex button to rebuild AI knowledge base
 * - Displays reindex status and results
 * - Shows last reindex time and indexed count
 * 
 * API: POST /api/admin/ai/reindex
 * - Deletes all existing rows in ai_sources table
 * - Rebuilds ai_sources from all published content
 * - Returns count of indexed rows
 */
export default function AiManagePage() {
  const [reindexing, setReindexing] = useState(false);
  const [lastResult, setLastResult] = useState<{ indexed: number; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle reindex action
   */
  const handleReindex = async () => {
    setReindexing(true);
    setError(null);

    try {
      const response = await aiService.reindex();
      setLastResult({
        indexed: response.indexed,
        timestamp: new Date().toISOString(),
      });
      message.success(`Successfully reindexed ${response.indexed} content item(s)`);
    } catch (error: any) {
      console.error('Reindex error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reindex AI knowledge base';
      setError(errorMessage);
      message.error(`Reindex failed: ${errorMessage}`);
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px', color: '#003366' }}>
          AI Knowledge Base Management
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Rebuild AI knowledge base index from published content
        </Text>
      </div>

      {/* Reindex Action Card */}
      <Card
        title={
          <Space>
            <RobotOutlined style={{ color: '#003366' }} />
            <span style={{ color: '#003366', fontSize: '16px', fontWeight: 600 }}>
              Reindex AI Knowledge Base
            </span>
          </Space>
        }
        style={{
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '24px',
        }}
        styles={{
          header: {
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px',
          },
          body: {
            padding: '24px',
          },
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="What does reindexing do?"
            description={
              <div>
                <Paragraph style={{ marginBottom: '8px' }}>
                  Reindexing will:
                </Paragraph>
                <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                  <li>Delete all existing rows in the <Text code>ai_sources</Text> table</li>
                  <li>Rebuild the table from all published content (programs, requirements, policies, support services, housing)</li>
                  <li>Update the AI knowledge base for better search and question answering</li>
                </ul>
                <Paragraph style={{ marginTop: '12px', marginBottom: 0 }}>
                  <Text type="warning">
                    <strong>Note:</strong> This operation may take a few minutes depending on the amount of published content.
                  </Text>
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />

          <div>
            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              loading={reindexing}
              onClick={handleReindex}
              danger
            >
              {reindexing ? 'Reindexing...' : 'Start Reindex'}
            </Button>
          </div>

          {error && (
            <Alert
              message="Reindex Failed"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}
        </Space>
      </Card>

      {/* Last Reindex Result */}
      {lastResult && (
        <Card
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span style={{ color: '#52c41a', fontSize: '16px', fontWeight: 600 }}>
                Last Reindex Result
              </span>
            </Space>
          }
          style={{
            borderRadius: '8px',
            border: '1px solid #d9f7be',
            backgroundColor: '#f6ffed',
            marginBottom: '24px',
          }}
          styles={{
            header: {
              borderBottom: '1px solid #d9f7be',
              padding: '16px 24px',
            },
            body: {
              padding: '24px',
            },
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Statistic
                title="Indexed Items"
                value={lastResult.indexed}
                prefix={<RobotOutlined style={{ color: '#52c41a' }} />}
                styles={{
                  content: {
                    color: '#52c41a',
                    fontSize: '32px',
                    fontWeight: 600,
                  },
                }}
              />
            </div>
            <div>
              <Text type="secondary">Last reindexed: </Text>
              <Tag color="success">
                {dayjs(lastResult.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </Tag>
            </div>
          </Space>
        </Card>
      )}

      {/* Information Card */}
      <Card
        title="About AI Knowledge Base"
        style={{
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
        styles={{
          header: {
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px',
          },
          body: {
            padding: '24px',
          },
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>What is the AI Knowledge Base?</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              The AI knowledge base (<Text code>ai_sources</Text> table) is a materialized table that contains
              excerpts from all published content. It is used by the AI chat system to provide accurate, grounded
              answers with citations.
            </Paragraph>
          </div>

          <div>
            <Text strong>When should I reindex?</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              You should reindex after:
              <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                <li>Publishing new programs or content</li>
                <li>Updating published content</li>
                <li>Making significant changes to published data</li>
                <li>When AI responses seem outdated or incorrect</li>
              </ul>
            </Paragraph>
          </div>

          <div>
            <Text strong>What content is indexed?</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              Only <Text strong>published</Text> content is indexed:
              <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                <li>Published programs and their details</li>
                <li>Published program requirements</li>
                <li>Published policies</li>
                <li>Published support services</li>
                <li>Published housing options</li>
              </ul>
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
}
