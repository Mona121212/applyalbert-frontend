import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Typography, Spin, message, Tag, Space } from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  HomeOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { programService, type ProgramResponse } from '../../services/program.service';
import { scholarshipService, type ScholarshipResponse } from '../../services/scholarship.service';
import { housingService, type HousingResponse } from '../../services/housing.service';
import { testimonialService, type TestimonialResponse } from '../../services/testimonial.service';
import { useAuthStore } from '../../store/auth.store';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * Recent update item (program or testimonial)
 */
interface RecentUpdateItem {
  id: string;
  type: 'program' | 'testimonial';
  title: string;
  status: string;
  updatedAt: string;
}

/**
 * Staff Dashboard Page
 * 
 * Displays institution-specific data:
 * - Statistics: Program counts by status (Total / Published / Draft / In_Review)
 * - Statistics: Scholarship count / Housing count
 * - Recent Updates: Mixed list of programs and testimonials (sorted by updated_at)
 * 
 * Note: All data is automatically filtered by institutionId from JWT
 */
export default function StaffDashboardPage() {
  const { institutionId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // Program statistics
  const [programTotal, setProgramTotal] = useState(0);
  const [programPublished, setProgramPublished] = useState(0);
  const [programDraft, setProgramDraft] = useState(0);
  const [programInReview, setProgramInReview] = useState(0);
  
  // Other statistics
  const [scholarshipCount, setScholarshipCount] = useState(0);
  const [housingCount, setHousingCount] = useState(0);
  
  // Recent updates
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdateItem[]>([]);

  useEffect(() => {
    if (institutionId) {
      loadDashboardData();
    }
  }, [institutionId]);

  const loadDashboardData = async () => {
    if (!institutionId) {
      message.warning('Institution ID not found');
      return;
    }

    setLoading(true);
    try {
      // Load all data in parallel
      const [programsResult, scholarshipsResult, housingResult, testimonialsResult] = await Promise.all([
        programService.list(0, 1000), // Get all programs for statistics
        scholarshipService.list(0, 1000), // Get all scholarships
        housingService.list(0, 1000), // Get all housing
        testimonialService.list(0, 100), // Get recent testimonials
      ]);

      // Calculate program statistics by status
      const programs = programsResult.items;
      setProgramTotal(programs.length);
      setProgramPublished(programs.filter((p) => p.status === 'published').length);
      setProgramDraft(programs.filter((p) => p.status === 'draft').length);
      setProgramInReview(programs.filter((p) => p.status === 'in_review').length);

      // Set other counts
      setScholarshipCount(scholarshipsResult.total);
      setHousingCount(housingResult.total);

      // Combine programs and testimonials for recent updates
      const programUpdates: RecentUpdateItem[] = programs.slice(0, 10).map((p) => ({
        id: p.id,
        type: 'program' as const,
        title: p.name,
        status: p.status,
        updatedAt: p.updatedAt,
      }));

      const testimonialUpdates: RecentUpdateItem[] = testimonialsResult.items.slice(0, 10).map((t) => ({
        id: t.id,
        type: 'testimonial' as const,
        title: t.studentName + (t.title ? ` - ${t.title}` : ''),
        status: t.status,
        updatedAt: t.updatedAt,
      }));

      // Combine and sort by updatedAt (most recent first)
      const allUpdates = [...programUpdates, ...testimonialUpdates].sort((a, b) => {
        return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
      });

      setRecentUpdates(allUpdates.slice(0, 10)); // Top 10 most recent
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'in_review':
        return 'processing';
      case 'approved':
        return 'success';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    return status?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px', color: '#003366' }}>
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Overview of your institution's programs and resources
        </Text>
      </div>

      {/* Program Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                  Total Programs
                </span>
              }
              value={programTotal}
              prefix={<BookOutlined style={{ color: '#003366' }} />}
              styles={{
                content: {
                  color: '#003366',
                  fontSize: '32px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                  Published
                </span>
              }
              value={programPublished}
              prefix={<FileTextOutlined style={{ color: '#006600' }} />}
              styles={{
                content: {
                  color: '#006600',
                  fontSize: '32px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                  Draft
                </span>
              }
              value={programDraft}
              prefix={<FileTextOutlined style={{ color: '#6b7280' }} />}
              styles={{
                content: {
                  color: '#6b7280',
                  fontSize: '32px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                  In Review
                </span>
              }
              value={programInReview}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              styles={{
                content: {
                  color: '#1890ff',
                  fontSize: '32px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Other Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={12}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                  Scholarships
                </span>
              }
              value={scholarshipCount}
              prefix={<TrophyOutlined style={{ color: '#003366' }} />}
              styles={{
                content: {
                  color: '#003366',
                  fontSize: '32px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={12}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                  Housing Options
                </span>
              }
              value={housingCount}
              prefix={<HomeOutlined style={{ color: '#006600' }} />}
              styles={{
                content: {
                  color: '#006600',
                  fontSize: '32px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Updates */}
      <Card
        title={
          <span style={{ color: '#003366', fontSize: '16px', fontWeight: 600 }}>
            Recent Updates
          </span>
        }
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
            padding: '16px 24px',
          },
        }}
      >
        {recentUpdates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No recent updates found
          </div>
        ) : (
          <List
            dataSource={recentUpdates}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    item.type === 'program' ? (
                      <BookOutlined style={{ fontSize: '20px', color: '#003366' }} />
                    ) : (
                      <MessageOutlined style={{ fontSize: '20px', color: '#006600' }} />
                    )
                  }
                  title={
                    <Space>
                      <Text strong>{item.title}</Text>
                      <Tag color={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.type === 'program' ? 'Program' : 'Testimonial'}
                      </Text>
                    </Space>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Updated: {dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm')}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
