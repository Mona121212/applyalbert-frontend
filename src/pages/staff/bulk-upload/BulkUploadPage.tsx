import { useState } from 'react';
import { Card, Upload, Button, Input, Space, message, Typography, Alert, Divider } from 'antd';
import { UploadOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { bulkService, type BulkProgramItemDto } from '../../../services/bulk.service';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

/**
 * Bulk Upload Page
 * 
 * Features:
 * - File upload (JSON) or direct JSON input
 * - Validates JSON format
 * - Calls POST /api/admin/bulk/programs
 * - Displays upload results (success/failure count)
 * 
 * Expected JSON format:
 * [
 *   {
 *     "program": {
 *       "name": "Program Name",
 *       "url": "...",
 *       ...
 *     },
 *     "requirements": [
 *       {
 *         "language": "en",
 *         "admissionText": "...",
 *         ...
 *       }
 *     ]
 *   }
 * ]
 */
export default function BulkUploadPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ created: number } | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  /**
   * Handle file upload
   */
  const handleFileUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const text = await (file as File).text();
      const jsonData = JSON.parse(text);
      
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON must be an array of program items');
      }

      await handleUpload(jsonData);
      onSuccess?.(jsonData);
      setFileList([]);
    } catch (error: any) {
      console.error('File upload error:', error);
      message.error(`Failed to process file: ${error.message || 'Invalid JSON format'}`);
      onError?.(error);
    }
  };

  /**
   * Handle JSON input upload
   */
  const handleJsonUpload = async () => {
    if (!jsonInput.trim()) {
      message.warning('Please enter JSON data or upload a file');
      return;
    }

    try {
      const jsonData = JSON.parse(jsonInput);
      
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON must be an array of program items');
      }

      await handleUpload(jsonData);
      setJsonInput('');
    } catch (error: any) {
      console.error('JSON upload error:', error);
      message.error(`Invalid JSON format: ${error.message || 'Please check your JSON syntax'}`);
    }
  };

  /**
   * Execute bulk upload
   */
  const handleUpload = async (items: BulkProgramItemDto[]) => {
    if (items.length === 0) {
      message.warning('No programs to upload');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await bulkService.uploadPrograms(items);
      setResult(response);
      message.success(`Successfully uploaded ${response.created} program(s)`);
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload programs';
      message.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Validate JSON format
   */
  const validateJson = (text: string): boolean => {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  };

  const isValidJson = jsonInput.trim() ? validateJson(jsonInput) : true;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px', color: '#003366' }}>
          Bulk Upload Programs
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Upload multiple programs with requirements in JSON format
        </Text>
      </div>

      <Card
        title={
          <Space>
            <FileTextOutlined style={{ color: '#003366' }} />
            <span style={{ color: '#003366', fontSize: '16px', fontWeight: 600 }}>
              Upload JSON File
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
        <Upload
          customRequest={handleFileUpload}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          accept=".json"
          maxCount={1}
          beforeUpload={() => false} // Prevent auto upload
        >
          <Button icon={<UploadOutlined />} size="large">
            Select JSON File
          </Button>
        </Upload>
        <Text type="secondary" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
          Upload a JSON file containing an array of program items
        </Text>
      </Card>

      <Divider>OR</Divider>

      <Card
        title={
          <span style={{ color: '#003366', fontSize: '16px', fontWeight: 600 }}>
            Enter JSON Directly
          </span>
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
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              JSON Data
            </Text>
            <TextArea
              rows={12}
              placeholder={`[
  {
    "program": {
      "name": "Program Name",
      "url": "https://example.com",
      "credential": "Diploma",
      ...
    },
    "requirements": [
      {
        "language": "en",
        "admissionText": "Admission requirements...",
        ...
      }
    ]
  }
]`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            />
            {jsonInput.trim() && !isValidJson && (
              <Alert
                message="Invalid JSON format"
                description="Please check your JSON syntax. It must be a valid JSON array."
                type="error"
                showIcon
                style={{ marginTop: '8px' }}
              />
            )}
          </div>

          <Button
            type="primary"
            size="large"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={handleJsonUpload}
            disabled={!jsonInput.trim() || !isValidJson}
          >
            Upload Programs
          </Button>
        </Space>
      </Card>

      {/* Upload Result */}
      {result && (
        <Card
          style={{
            borderRadius: '8px',
            border: '1px solid #d9f7be',
            backgroundColor: '#f6ffed',
            marginTop: '24px',
          }}
        >
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <div>
              <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                Upload Successful
              </Text>
              <div style={{ marginTop: '4px' }}>
                <Text>
                  Created <Text strong>{result.created}</Text> program(s)
                </Text>
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Help Section */}
      <Card
        title="JSON Format Guide"
        style={{
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginTop: '24px',
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
            <Text strong>Program Fields:</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              <Text code>name</Text> (required), <Text code>url</Text>, <Text code>route</Text>,{' '}
              <Text code>credential</Text>, <Text code>fieldOfStudy</Text>, <Text code>programLevel</Text>,{' '}
              <Text code>delivery</Text>, <Text code>durationMonths</Text>, <Text code>overview</Text>,{' '}
              <Text code>curriculumOverview</Text>, <Text code>careerOutcomes</Text>, and more.
            </Paragraph>
          </div>

          <div>
            <Text strong>Requirement Fields (optional):</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              <Text code>language</Text> (default: "en"), <Text code>admissionText</Text>,{' '}
              <Text code>prerequisites</Text> (JSON), <Text code>studentType</Text>,{' '}
              <Text code>competitiveThreshold</Text>, <Text code>countryCode</Text>,{' '}
              <Text code>englishProficiency</Text> (JSON), <Text code>portfolioRequired</Text>,{' '}
              <Text code>notes</Text>.
            </Paragraph>
          </div>

          <div>
            <Text strong>Note:</Text>
            <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
              The <Text code>institutionId</Text> is automatically extracted from your JWT token.
              You don't need to include it in the JSON.
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
}
