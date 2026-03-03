import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, message, Tag } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { programService, type ProgramRequest } from '../../../services/program.service';

/**
 * Tags Editor Component
 * 
 * Manages program tags:
 * - Skills (program_skills)
 * - NOC Codes (program_noc_codes)
 * - Career Paths (program_career_paths)
 * 
 * Tags are updated via ProgramRequest when saving the program.
 */
interface TagsEditorProps {
  programId: string;
  initialSkills?: string[];
  initialNocCodes?: string[];
  initialCareerPaths?: string[];
  onSave?: (tags: { skills: string[]; nocCodes: string[]; careerPaths: string[] }) => Promise<void>;
}

export default function TagsEditor({
  programId,
  initialSkills = [],
  initialNocCodes = [],
  initialCareerPaths = [],
  onSave,
}: TagsEditorProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [nocCodes, setNocCodes] = useState<string[]>(initialNocCodes);
  const [careerPaths, setCareerPaths] = useState<string[]>(initialCareerPaths);
  const [skillInput, setSkillInput] = useState('');
  const [nocCodeInput, setNocCodeInput] = useState('');
  const [careerPathInput, setCareerPathInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSkills(initialSkills);
    setNocCodes(initialNocCodes);
    setCareerPaths(initialCareerPaths);
  }, [initialSkills, initialNocCodes, initialCareerPaths]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddNocCode = () => {
    const trimmed = nocCodeInput.trim();
    // NOC codes are typically numeric (e.g., "12345" or "12-345")
    if (trimmed && !nocCodes.includes(trimmed)) {
      setNocCodes([...nocCodes, trimmed]);
      setNocCodeInput('');
    }
  };

  const handleRemoveNocCode = (code: string) => {
    setNocCodes(nocCodes.filter((c) => c !== code));
  };

  const handleAddCareerPath = () => {
    const trimmed = careerPathInput.trim();
    if (trimmed && !careerPaths.includes(trimmed)) {
      setCareerPaths([...careerPaths, trimmed]);
      setCareerPathInput('');
    }
  };

  const handleRemoveCareerPath = (path: string) => {
    setCareerPaths(careerPaths.filter((p) => p !== path));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const request: ProgramRequest = {
        skills,
        nocCodes,
        careerPaths,
      };

      await programService.update(programId, request);

      if (onSave) {
        await onSave({ skills, nocCodes, careerPaths });
      }

      message.success('Tags updated successfully');
    } catch (error) {
      console.error('Failed to save tags:', error);
      message.error('Failed to save tags');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Tags & Extras" extra={<Button type="primary" loading={saving} onClick={handleSave}>Save Tags</Button>}>
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        {/* Skills */}
        <div>
          <Form.Item label="Skills">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Enter skill tag (e.g., 'Machine Learning', 'Data Analysis')"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onPressEnter={handleAddSkill}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSkill}>
                Add
              </Button>
            </Space.Compact>
            <div style={{ marginTop: 8 }}>
              {skills.map((skill) => (
                <Tag
                  key={skill}
                  closable
                  onClose={() => handleRemoveSkill(skill)}
                  style={{ marginTop: 4 }}
                >
                  {skill}
                </Tag>
              ))}
              {skills.length === 0 && (
                <span style={{ color: '#999' }}>No skills added</span>
              )}
            </div>
          </Form.Item>
        </div>

        {/* NOC Codes */}
        <div>
          <Form.Item label="NOC Codes">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Enter NOC code (e.g., '12345' or '12-345')"
                value={nocCodeInput}
                onChange={(e) => setNocCodeInput(e.target.value)}
                onPressEnter={handleAddNocCode}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNocCode}>
                Add
              </Button>
            </Space.Compact>
            <div style={{ marginTop: 8 }}>
              {nocCodes.map((code) => (
                <Tag
                  key={code}
                  closable
                  onClose={() => handleRemoveNocCode(code)}
                  style={{ marginTop: 4 }}
                >
                  {code}
                </Tag>
              ))}
              {nocCodes.length === 0 && (
                <span style={{ color: '#999' }}>No NOC codes added</span>
              )}
            </div>
          </Form.Item>
        </div>

        {/* Career Paths */}
        <div>
          <Form.Item label="Career Paths">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Enter career path (e.g., 'Software Engineer', 'Data Scientist')"
                value={careerPathInput}
                onChange={(e) => setCareerPathInput(e.target.value)}
                onPressEnter={handleAddCareerPath}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCareerPath}>
                Add
              </Button>
            </Space.Compact>
            <div style={{ marginTop: 8 }}>
              {careerPaths.map((path) => (
                <Tag
                  key={path}
                  closable
                  onClose={() => handleRemoveCareerPath(path)}
                  style={{ marginTop: 4 }}
                >
                  {path}
                </Tag>
              ))}
              {careerPaths.length === 0 && (
                <span style={{ color: '#999' }}>No career paths added</span>
              )}
            </div>
          </Form.Item>
        </div>
      </Space>
    </Card>
  );
}
