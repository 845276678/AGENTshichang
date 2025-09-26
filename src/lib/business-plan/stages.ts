import type { BusinessPlanStageConfig } from '@/types/business-plan'

export const BUSINESS_PLAN_STAGES: BusinessPlanStageConfig[] = [
  {
    id: 'scenario_grounding',
    name: '�������������У��',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '6-8����',
    deliverables: ['����ժҪ', '��ɫ��·', '���������', '���������б�'],
    dependencies: []
  },
  {
    id: 'concept_analysis',
    name: '����������',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '3-5����',
    deliverables: ['������ȡ����', '���ļ�ֵ����', '�������'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'market_research',
    name: '�г����з���',
    aiProvider: 'ALI',
    estimatedTime: '8-12����',
    deliverables: ['�г���ģ', '��Ʒ����', 'Ŀ���û�����'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'tech_architecture',
    name: '�����ܹ����',
    aiProvider: 'ZHIPU',
    estimatedTime: '10-15����',
    deliverables: ['ϵͳ�ܹ�', 'API���', '����ջ�Ƽ�'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'business_model',
    name: '��ҵģʽ����',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '6-10����',
    deliverables: ['��ҵģʽ����', '���������', '�ɱ��ṹ'],
    dependencies: ['market_research']
  },
  {
    id: 'financial_model',
    name: '����ģԤ��',
    aiProvider: 'ALI',
    estimatedTime: '12-18����',
    deliverables: ['����Ԥ��', 'Ͷ�ʻر�����', '��ֵ����'],
    dependencies: ['business_model']
  },
  {
    id: 'legal_compliance',
    name: '�Ϲ��������',
    aiProvider: 'ZHIPU',
    estimatedTime: '8-12����',
    deliverables: ['�Ϲ��嵥', '���ɷ���', '֪ʶ��Ȩ����'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'implementation_plan',
    name: 'ʵʩ·�߹滮',
    aiProvider: 'ZHIPU',
    estimatedTime: '6-10����',
    deliverables: ['��Ŀʱ���', '�Ŷ�����', '�ؼ���̱�'],
    dependencies: ['tech_architecture']
  },
  {
    id: 'investor_pitch',
    name: 'Ͷ���ƽ����',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '5-8����',
    deliverables: ['Pitch Deck', 'Ͷ������', '���ʲ���'],
    dependencies: ['concept_analysis', 'market_research', 'business_model', 'financial_model']
  }
]

