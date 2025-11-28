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
    { value: '18-24岁', label: '18-24岁' },
    { value: '25-30岁', label: '25-30岁' },
    { value: '31-35岁', label: '31-35岁' },
    { value: '36-40岁', label: '36-40岁' },
    { value: '41-50岁', label: '41-50岁' },
    { value: '50岁以上', label: '50岁以上' },
    { value: 'other', label: '其他' },
  ],
  currentStatuses: [
    { value: '在职（全职）', label: '在职（全职）' },
    { value: '在职（兼职）', label: '在职（兼职）' },
    { value: '自由职业', label: '自由职业' },
    { value: '待业中', label: '待业中' },
    { value: '学生', label: '学生' },
    { value: '退休', label: '退休' },
    { value: 'other', label: '其他' },
  ],
  educationLevels: [
    { value: '高中及以下', label: '高中及以下' },
    { value: '大专', label: '大专' },
    { value: '本科', label: '本科' },
    { value: '硕士', label: '硕士' },
    { value: '博士', label: '博士' },
    { value: 'other', label: '其他' },
  ],
  startupBudgets: [
    { value: '0-5000元', label: '0-5000元' },
    { value: '5000-10000元', label: '5000-10000元' },
    { value: '10000-30000元', label: '10000-30000元' },
    { value: '30000-50000元', label: '30000-50000元' },
    { value: '50000元以上', label: '50000元以上' },
    { value: 'other', label: '其他' },
  ],
  industries: [
    { value: '互联网/IT', label: '互联网/IT' },
    { value: '金融/银行', label: '金融/银行' },
    { value: '教育/培训', label: '教育/培训' },
    { value: '医疗/健康', label: '医疗/健康' },
    { value: '电商/零售', label: '电商/零售' },
    { value: '制造业', label: '制造业' },
    { value: '房地产/建筑', label: '房地产/建筑' },
    { value: '文化/传媒', label: '文化/传媒' },
    { value: '餐饮/酒店', label: '餐饮/酒店' },
    { value: '物流/运输', label: '物流/运输' },
    { value: '政府/事业单位', label: '政府/事业单位' },
    { value: 'other', label: '其他' },
  ],
  skills: [
    { category: '技术开发', items: ['编程开发', '数据分析', '产品设计', 'UI/UX设计', '运维/DevOps'] },
    { category: '内容创作', items: ['写作/文案', '视频制作', '摄影', '平面设计', '音频制作'] },
    { category: '营销推广', items: ['社交媒体运营', 'SEO/SEM', '私域运营', '直播带货', '广告投放'] },
    { category: '商务技能', items: ['销售', '项目管理', '财务会计', '人力资源', '法律咨询'] },
    { category: '生活服务', items: ['家政服务', '维修/安装', '美容/美发', '健身教练', '宠物服务'] },
    { category: '其他技能', items: ['外语翻译', '驾驶', '手工制作', '烹饪', '心理咨询', 'other'] },
  ],
  provinces: [
    '北京', '上海', '广东', '江苏', '浙江', '四川', '湖北', '湖南',
    '河南', '河北', '山东', '福建', '陕西', '安徽', '辽宁', '云南',
    '广西', '山西', '贵州', '江西', '天津', '重庆', '黑龙江', '吉林',
    '甘肃', '内蒙古', '新疆', '宁夏', '海南', '青海', '西藏',
  ],
  cityLevels: [
    { value: '一线城市', label: '一线城市' },
    { value: '新一线城市', label: '新一线城市' },
    { value: '二线城市', label: '二线城市' },
    { value: '三线城市', label: '三线城市' },
    { value: '四线及以下', label: '四线及以下' },
    { value: 'other', label: '其他' },
  ],
  /** 其他资源类型选项 */
  resourceTypes: [
    { id: 'connections', label: '人脉资源', icon: '👥', description: '行业人脉、供应商、客户资源等' },
    { id: 'channels', label: '渠道资源', icon: '🔗', description: '销售渠道、分销网络、合作平台等' },
    { id: 'equipment', label: '设备物品', icon: '🔧', description: '生产设备、专业工具、电子设备等' },
    { id: 'property', label: '房产场地', icon: '🏠', description: '门店、仓库、办公场地、厂房等' },
    { id: 'vehicles', label: '车辆资源', icon: '🚗', description: '私家车、货车、配送车辆等' },
    { id: 'inventory', label: '库存货源', icon: '📦', description: '产品库存、货源渠道、供应链资源' },
    { id: 'intellectual', label: '知识产权', icon: '💡', description: '专利、商标、版权、技术秘密等' },
    { id: 'other', label: '其他资源', icon: '✨', description: '其他可变现或有助于创业的资源' },
  ],
} as const;

export const QUOTA_CONFIG = {
  defaultHourlyLimit: 10,
  cookieMaxAge: 7 * 24 * 60 * 60, // 7 days
  sessionStorageKey: 'zhiyecompass_uuid',
  recommendationIdsKey: 'zhiyecompass_rec_ids',
} as const;
