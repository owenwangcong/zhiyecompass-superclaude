import { z } from 'zod';

export const profileFormSchema = z.object({
  ageRange: z.string().min(1, '请选择年龄段'),

  province: z.string().min(1, '请选择省份'),

  city: z.string().optional(),

  cityLevel: z.string().min(1, '请选择城市等级'),

  currentStatus: z.string().min(1, '请选择当前状态'),

  education: z.string().min(1, '请选择学历'),

  industryBackground: z.array(z.string()).min(1, '请至少选择一个行业背景'),

  skills: z.array(z.string()).min(1, '请至少选择一个技能'),

  availableTimePerWeek: z.number()
    .min(1, '每周至少需要1小时')
    .max(80, '每周最多80小时'),

  startupBudget: z.string().min(1, '请选择启动资金'),

  // 其他资源（可选）
  resourceTypes: z.array(z.string()).optional(),
  resourceDescription: z.string().max(500, '描述最多500字').optional(),

  // 自定义输入字段（当用户选择"其他"时）
  customAgeRange: z.string().max(50, '最多50字').optional(),
  customCityLevel: z.string().max(50, '最多50字').optional(),
  customCurrentStatus: z.string().max(50, '最多50字').optional(),
  customEducation: z.string().max(50, '最多50字').optional(),
  customStartupBudget: z.string().max(50, '最多50字').optional(),
  customIndustryBackground: z.string().max(200, '最多200字').optional(),
  customSkills: z.string().max(200, '最多200字').optional(),

  // 整体补充说明
  overallDescription: z.string().max(1000, '整体描述最多1000字').optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
