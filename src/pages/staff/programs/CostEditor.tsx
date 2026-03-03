import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, InputNumber, message, Space, Spin } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  programCostService,
  type ProgramCostRequest,
  type ProgramCostResponse,
} from '../../../services/program-cost.service';

const { TextArea } = Input;

/**
 * Cost form schema using Zod
 */
const costSchema = z.object({
  currency: z.string().optional(),
  tuitionDomestic: z.number().min(0).optional(),
  tuitionInternational: z.number().min(0).optional(),
  fees: z.string().optional(), // JSON
  estimateLivingCost: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

type CostFormData = z.infer<typeof costSchema>;

interface CostEditorProps {
  programId: string;
  onReload: () => void;
}

/**
 * Cost Editor Component
 * 
 * Features:
 * - Edit single cost record (1:1 relationship with program)
 * - Create if not exists, update if exists
 * - Fields: currency, tuition_domestic, tuition_international, fees (JSON), estimate_living_cost, notes, status
 */
export default function CostEditor({ programId, onReload }: CostEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cost, setCost] = useState<ProgramCostResponse | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CostFormData>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      currency: 'CAD',
      tuitionDomestic: undefined,
      tuitionInternational: undefined,
      fees: '',
      estimateLivingCost: undefined,
      notes: '',
      status: 'draft',
    },
  });

  /**
   * Load cost data
   */
  useEffect(() => {
    setLoading(true);
    programCostService
      .getByProgramId(programId)
      .then((data) => {
        setCost(data);
        if (data) {
          reset({
            currency: data.currency || 'CAD',
            tuitionDomestic: data.tuitionDomestic,
            tuitionInternational: data.tuitionInternational,
            fees: data.fees || '',
            estimateLivingCost: data.estimateLivingCost,
            notes: data.notes || '',
            status: data.status || 'draft',
          });
        } else {
          reset({
            currency: 'CAD',
            tuitionDomestic: undefined,
            tuitionInternational: undefined,
            fees: '',
            estimateLivingCost: undefined,
            notes: '',
            status: 'draft',
          });
        }
      })
      .catch((error) => {
        console.error('Failed to load cost:', error);
        message.error('Failed to load cost information');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [programId, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CostFormData) => {
    setSaving(true);
    try {
      const request: ProgramCostRequest = {
        currency: data.currency || undefined,
        tuitionDomestic: data.tuitionDomestic,
        tuitionInternational: data.tuitionInternational,
        fees: data.fees || undefined,
        estimateLivingCost: data.estimateLivingCost,
        notes: data.notes || undefined,
        status: data.status || 'draft',
      };

      if (cost) {
        await programCostService.update(programId, cost.id, request);
        message.success('Cost updated successfully');
      } else {
        await programCostService.create(programId, request);
        message.success('Cost created successfully');
      }

      onReload();
    } catch (error) {
      console.error('Failed to save cost:', error);
      message.error(cost ? 'Failed to update cost' : 'Failed to create cost');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
      </div>
    );
  }

  return (
    <Card
      title="Program Costs"
      extra={
        <Button
          type="primary"
          loading={saving}
          onClick={handleSubmit(onSubmit)}
        >
          {cost ? 'Update' : 'Create'}
        </Button>
      }
    >
      <Form layout="vertical">
        <Form.Item
          label="Currency"
          validateStatus={errors.currency ? 'error' : ''}
          help={errors.currency?.message}
        >
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select currency" style={{ width: '100%' }}>
                <Select.Option value="CAD">CAD</Select.Option>
                <Select.Option value="USD">USD</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Tuition (Domestic)"
          validateStatus={errors.tuitionDomestic ? 'error' : ''}
          help={errors.tuitionDomestic?.message}
        >
          <Controller
            name="tuitionDomestic"
            control={control}
            render={({ field }) => (
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter domestic tuition"
                min={0}
                step={0.01}
                {...field}
                value={field.value}
                onChange={(value) => field.onChange(value ?? undefined)}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Tuition (International)"
          validateStatus={errors.tuitionInternational ? 'error' : ''}
          help={errors.tuitionInternational?.message}
        >
          <Controller
            name="tuitionInternational"
            control={control}
            render={({ field }) => (
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter international tuition"
                min={0}
                step={0.01}
                {...field}
                value={field.value}
                onChange={(value) => field.onChange(value ?? undefined)}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Fees (JSON)"
          validateStatus={errors.fees ? 'error' : ''}
          help={errors.fees?.message}
        >
          <Controller
            name="fees"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={3}
                placeholder='Enter fees as JSON, e.g. {"Application Fee": 150, "Lab Fee": 200}'
                {...field}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Estimate Living Cost"
          validateStatus={errors.estimateLivingCost ? 'error' : ''}
          help={errors.estimateLivingCost?.message}
        >
          <Controller
            name="estimateLivingCost"
            control={control}
            render={({ field }) => (
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter estimated living cost"
                min={0}
                step={0.01}
                {...field}
                value={field.value}
                onChange={(value) => field.onChange(value ?? undefined)}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Notes"
          validateStatus={errors.notes ? 'error' : ''}
          help={errors.notes?.message}
        >
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextArea rows={3} placeholder="Enter notes" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Status"
          validateStatus={errors.status ? 'error' : ''}
          help={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select status" style={{ width: '100%' }}>
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="published">Published</Select.Option>
                <Select.Option value="archived">Archived</Select.Option>
              </Select>
            )}
          />
        </Form.Item>
      </Form>
    </Card>
  );
}
