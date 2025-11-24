/**
 * Application constants
 */

export const APP_CONFIG = {
  name: 'ZhiYeCompass',
  description: 'AI驱动的副业/创业项目推荐平台',
  version: '0.1.0',
} as const;

export const AWS_CONFIG = {
  region: 'ca-central-1',
  s3Bucket: process.env.S3_BUCKET_NAME || 'zhiyecompass-recommendations',
  dynamoTable: process.env.DYNAMODB_TABLE || 'zhiyecompass-main',
} as const;

export const USER_PROFILE_FIELDS = {
  ageRanges: [
    '18-24岁',
    '25-30岁',
    '31-35岁',
    '36-40岁',
    '41-50岁',
    '50岁以上',
  ],
  currentStatuses: [
    '在职（全职）',
    '在职（兼职）',
    '自由职业',
    '待业中',
    '学生',
    '退休',
  ],
  educationLevels: [
    '高中及以下',
    '大专',
    '本科',
    '硕士',
    '博士',
  ],
  startupBudgets: [
    '0-5000元',
    '5000-10000元',
    '10000-30000元',
    '30000-50000元',
    '50000元以上',
  ],
} as const;

export const QUOTA_CONFIG = {
  defaultHourlyLimit: 10,
  cookieMaxAge: 7 * 24 * 60 * 60, // 7 days
  sessionStorageKey: 'zhiyecompass_uuid',
  recommendationIdsKey: 'zhiyecompass_rec_ids',
} as const;
