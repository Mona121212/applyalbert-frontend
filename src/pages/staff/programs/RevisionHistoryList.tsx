import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, message, Popconfirm } from 'antd';
import { programService, type ProgramResponse } from '../../../services/program.service';
import dayjs from 'dayjs';

/**
 * Revision History List Component
 * 
 * Displays content revision history for a program.
 * Each revision shows: revision_no, created_at, created_by
 * 
 * Note: Backend does not currently provide a GET endpoint for revisions.
 * This component assumes revisions will be available via a future API endpoint.
 * For now, it shows a placeholder message.
 * 
 * Rollback functionality: POST /api/admin/programs/{id}/rollback?revisionNo={no}
 */
interface ContentRevision {
  id: string;
  revisionNo: number;
  createdAt: string;
  createdBy?: string;
}

interface RevisionHistoryListProps {
  programId: string;
  onRollback?: (program: ProgramResponse) => void;
}

export default function RevisionHistoryList({
  programId,
  onRollback,
}: RevisionHistoryListProps) {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loading, setLoading] = useState(false);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  useEffect(() => {
    loadRevisions();
  }, [programId]);

  const loadRevisions = async () => {
    // TODO: Backend does not currently provide GET /api/admin/programs/{id}/revisions
    // This is a placeholder - when the API is available, implement:
    // const response = await http.get<Result<ContentRevision[]>>(`/api/admin/programs/${programId}/revisions`);
    // setRevisions(response.data.data || []);
    
    // For now, show empty state
    setRevisions([]);
  };

  const handleRollback = async (revisionNo: number) => {
    setRollingBack(`revision-${revisionNo}`);
    try {
      const updated = await programService.rollback(programId, revisionNo);
      message.success(`Rolled back to revision ${revisionNo}`);
      if (onRollback) {
        onRollback(updated);
      }
      // Reload revisions after rollback
      await loadRevisions();
    } catch (error) {
      console.error('Failed to rollback:', error);
      message.error(`Failed to rollback to revision ${revisionNo}`);
    } finally {
      setRollingBack(null);
    }
  };

  const columns = [
    {
      title: 'Revision #',
      dataIndex: 'revisionNo',
      key: 'revisionNo',
      width: 100,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : 'N/A'),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: ContentRevision) => (
        <Popconfirm
          title={`Rollback to revision ${record.revisionNo}?`}
          description="This will restore the program to this revision state."
          onConfirm={() => handleRollback(record.revisionNo)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            size="small"
            loading={rollingBack === `revision-${record.revisionNo}`}
          >
            Rollback
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="Revision History">
      {revisions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <p>No revision history available.</p>
          <p style={{ fontSize: '12px' }}>
            Note: Revision history API endpoint is not yet implemented in the backend.
          </p>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={revisions}
          rowKey="id"
          pagination={false}
          loading={loading}
          size="small"
        />
      )}
    </Card>
  );
}
