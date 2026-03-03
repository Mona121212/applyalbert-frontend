import { useState } from 'react';
import { Card, Button, Space, message, DatePicker, Modal, Form } from 'antd';
import { publishService } from '../../../services/publish.service';
import { programService, type ProgramResponse } from '../../../services/program.service';
import dayjs, { type Dayjs } from 'dayjs';

/**
 * Publish Workflow Panel Component
 * 
 * Displays workflow actions based on program status:
 * - draft -> [Submit for Review]
 * - in_review -> [Approve] [Reject]
 * - approved -> [Publish Now] [Schedule]
 * - scheduled -> Show scheduled time + [Cancel]
 * - published -> [Unpublish]
 * 
 * After each action, refreshes the program status.
 */
interface PublishWorkflowPanelProps {
  program: ProgramResponse;
  onStatusChange?: (program: ProgramResponse) => void;
}

export default function PublishWorkflowPanel({
  program,
  onStatusChange,
}: PublishWorkflowPanelProps) {
  const [loading, setLoading] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleForm] = Form.useForm();

  const status = program.status?.toLowerCase() || 'draft';

  const handleSubmitForReview = async () => {
    setLoading(true);
    try {
      await publishService.submitForReview(program.id);
      message.success('Program submitted for review');
      await refreshProgram();
    } catch (error) {
      console.error('Failed to submit for review:', error);
      message.error('Failed to submit for review');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await publishService.approve(program.id);
      message.success('Program approved');
      await refreshProgram();
    } catch (error) {
      console.error('Failed to approve:', error);
      message.error('Failed to approve program');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    // Reject is not a separate API - it's handled by changing status back to draft
    // For now, we'll use unpublish to go back to draft
    setLoading(true);
    try {
      await publishService.unpublish(program.id);
      message.success('Program rejected and reverted to draft');
      await refreshProgram();
    } catch (error) {
      console.error('Failed to reject:', error);
      message.error('Failed to reject program');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      await publishService.publish(program.id);
      message.success('Program published');
      await refreshProgram();
    } catch (error) {
      console.error('Failed to publish:', error);
      message.error('Failed to publish program');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    try {
      await publishService.unpublish(program.id);
      message.success('Program unpublished');
      await refreshProgram();
    } catch (error) {
      console.error('Failed to unpublish:', error);
      message.error('Failed to unpublish program');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (values: { publishAt: Dayjs }) => {
    setLoading(true);
    try {
      const publishAt = values.publishAt.toISOString();
      await publishService.schedule(program.id, publishAt);
      message.success('Publish scheduled');
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
      await refreshProgram();
    } catch (error) {
      console.error('Failed to schedule publish:', error);
      message.error('Failed to schedule publish');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async () => {
    // Cancel schedule by unpublishing (reverting to draft)
    setLoading(true);
    try {
      await publishService.unpublish(program.id);
      message.success('Scheduled publish cancelled');
      await refreshProgram();
    } catch (error) {
      console.error('Failed to cancel schedule:', error);
      message.error('Failed to cancel schedule');
    } finally {
      setLoading(false);
    }
  };

  const refreshProgram = async () => {
    try {
      const updated = await programService.getById(program.id);
      if (onStatusChange) {
        onStatusChange(updated);
      }
    } catch (error) {
      console.error('Failed to refresh program:', error);
    }
  };

  const renderActions = () => {
    switch (status) {
      case 'draft':
        return (
          <Button type="primary" loading={loading} onClick={handleSubmitForReview}>
            Submit for Review
          </Button>
        );

      case 'in_review':
        return (
          <Space>
            <Button type="primary" loading={loading} onClick={handleApprove}>
              Approve
            </Button>
            <Button danger loading={loading} onClick={handleReject}>
              Reject
            </Button>
          </Space>
        );

      case 'approved':
        return (
          <Space>
            <Button type="primary" loading={loading} onClick={handlePublish}>
              Publish Now
            </Button>
            <Button loading={loading} onClick={() => setScheduleModalVisible(true)}>
              Schedule
            </Button>
          </Space>
        );

      case 'scheduled':
        return (
          <Space direction="vertical">
            <div>
              <strong>Status:</strong> Scheduled for future publish
            </div>
            <Button danger loading={loading} onClick={handleCancelSchedule}>
              Cancel Schedule
            </Button>
          </Space>
        );

      case 'published':
        return (
          <Button danger loading={loading} onClick={handleUnpublish}>
            Unpublish
          </Button>
        );

      default:
        return <span>No actions available for status: {status}</span>;
    }
  };

  return (
    <>
      <Card title="Publish Workflow" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>Current Status:</strong> <span style={{ textTransform: 'capitalize' }}>{status}</span>
          </div>
          <div>{renderActions()}</div>
        </Space>
      </Card>

      <Modal
        title="Schedule Publish"
        open={scheduleModalVisible}
        onCancel={() => {
          setScheduleModalVisible(false);
          scheduleForm.resetFields();
        }}
        onOk={() => scheduleForm.submit()}
        confirmLoading={loading}
      >
        <Form form={scheduleForm} onFinish={handleSchedule} layout="vertical">
          <Form.Item
            name="publishAt"
            label="Publish At"
            rules={[{ required: true, message: 'Please select a publish date and time' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
