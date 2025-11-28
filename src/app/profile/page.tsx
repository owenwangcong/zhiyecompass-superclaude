'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { profileFormSchema, type ProfileFormValues } from '@/lib/validations/profile';
import { USER_PROFILE_FIELDS } from '@/lib/constants';
import { getUserUUID } from '@/lib/utils/uuid';
import {
  loadProfileFromStorage,
  saveProfileToStorage,
  clearProfileFromStorage,
  hasStoredProfile,
  getProfileSavedTime,
} from '@/lib/utils/storage';

interface QuotaError {
  message: string;
  currentCount: number;
  limit: number;
  nextResetTime: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uuid, setUuid] = useState<string>('');
  const [quotaError, setQuotaError] = useState<QuotaError | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [cachedDataTime, setCachedDataTime] = useState<Date | null>(null);

  useEffect(() => {
    setUuid(getUserUUID());
    // Check for cached profile data
    setHasCachedData(hasStoredProfile());
    setCachedDataTime(getProfileSavedTime());
  }, []);

  // Format the next reset time for display
  const formatNextResetTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Load cached profile data as default values
  const getCachedDefaultValues = (): ProfileFormValues => {
    const cached = loadProfileFromStorage();
    if (cached) {
      return {
        ageRange: cached.ageRange || '',
        province: cached.province || '',
        city: cached.city || '',
        cityLevel: cached.cityLevel || '',
        currentStatus: cached.currentStatus || '',
        education: cached.education || '',
        industryBackground: cached.industryBackground || [],
        skills: cached.skills || [],
        availableTimePerWeek: cached.availableTimePerWeek || 10,
        startupBudget: cached.startupBudget || '',
        resourceTypes: cached.resourceTypes || [],
        resourceDescription: cached.resourceDescription || '',
        customAgeRange: cached.customAgeRange || '',
        customCityLevel: cached.customCityLevel || '',
        customCurrentStatus: cached.customCurrentStatus || '',
        customEducation: cached.customEducation || '',
        customStartupBudget: cached.customStartupBudget || '',
        customIndustryBackground: cached.customIndustryBackground || '',
        customSkills: cached.customSkills || '',
        overallDescription: cached.overallDescription || '',
      };
    }
    return {
      ageRange: '',
      province: '',
      city: '',
      cityLevel: '',
      currentStatus: '',
      education: '',
      industryBackground: [],
      skills: [],
      availableTimePerWeek: 10,
      startupBudget: '',
      resourceTypes: [],
      resourceDescription: '',
      customAgeRange: '',
      customCityLevel: '',
      customCurrentStatus: '',
      customEducation: '',
      customStartupBudget: '',
      customIndustryBackground: '',
      customSkills: '',
      overallDescription: '',
    };
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: getCachedDefaultValues(),
  });

  // Watch fields to show/hide custom input
  const watchAgeRange = form.watch('ageRange');
  const watchCityLevel = form.watch('cityLevel');
  const watchCurrentStatus = form.watch('currentStatus');
  const watchEducation = form.watch('education');
  const watchStartupBudget = form.watch('startupBudget');
  const watchIndustryBackground = form.watch('industryBackground');
  const watchSkills = form.watch('skills');

  // Handle clearing cached data
  const handleClearCache = () => {
    clearProfileFromStorage();
    setHasCachedData(false);
    setCachedDataTime(null);
    form.reset({
      ageRange: '',
      province: '',
      city: '',
      cityLevel: '',
      currentStatus: '',
      education: '',
      industryBackground: [],
      skills: [],
      availableTimePerWeek: 10,
      startupBudget: '',
      resourceTypes: [],
      resourceDescription: '',
      customAgeRange: '',
      customCityLevel: '',
      customCurrentStatus: '',
      customEducation: '',
      customStartupBudget: '',
      customIndustryBackground: '',
      customSkills: '',
      overallDescription: '',
    });
  };

  // Format cached data time for display
  const formatCachedTime = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    setQuotaError(null);
    setGeneralError(null);

    // Save form data to LocalStorage for future visits
    saveProfileToStorage(data);
    setHasCachedData(true);
    setCachedDataTime(new Date());

    try {
      const response = await fetch('/api/submit-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid,
          profile: {
            ...data,
            location: {
              province: data.province,
              city: data.city || '',
              cityLevel: data.cityLevel,
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle quota exceeded error
        if (response.status === 429 && result.quotaExceeded) {
          setQuotaError({
            message: result.message,
            currentCount: result.currentCount,
            limit: result.limit,
            nextResetTime: result.nextResetTime,
          });
          return;
        }

        // Handle other errors
        setGeneralError(result.message || '提交失败，请稍后重试');
        return;
      }

      // Success - store recommendation ID and navigate
      const existingIds = JSON.parse(
        sessionStorage.getItem('zhiyecompass_rec_ids') || '[]'
      );
      existingIds.push(result.recommendationId);
      sessionStorage.setItem('zhiyecompass_rec_ids', JSON.stringify(existingIds));

      router.push(`/recommendation/${result.recommendationId}`);
    } catch (error) {
      console.error('Submit error:', error);
      setGeneralError(error instanceof Error ? error.message : '网络错误，请检查网络连接后重试');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            智业罗盘
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            填写您的个人画像，获取AI智能推荐的副业/创业项目
          </p>
        </div>

        {/* Quota Error Alert */}
        {quotaError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="flex items-center gap-2">
              <span>⏳</span> 本小时推荐额度已用完
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p>
                当前使用情况：{quotaError.currentCount}/{quotaError.limit} 次
              </p>
              <p className="mt-1">
                下一次额度重置时间：
                <span className="font-semibold">
                  {formatNextResetTime(quotaError.nextResetTime)}
                </span>
              </p>
              <p className="mt-2 text-sm opacity-80">
                为保证服务质量，我们限制了每小时的推荐次数。请稍后再试，或在下一个整点后重新提交。
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* General Error Alert */}
        {generalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>提交失败</AlertTitle>
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        {/* Cached Data Notice */}
        {hasCachedData && cachedDataTime && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <span>💾</span>
                <span className="text-sm">
                  已自动填充上次保存的信息（{formatCachedTime(cachedDataTime)}）
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearCache}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                清除历史输入
              </Button>
            </div>
          </div>
        )}

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 年龄段 */}
              <FormField
                control={form.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年龄段 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择年龄段" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_PROFILE_FIELDS.ageRanges.map((age) => (
                          <SelectItem key={age.value} value={age.value}>
                            {age.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {watchAgeRange === 'other' && (
                      <FormField
                        control={form.control}
                        name="customAgeRange"
                        render={({ field: customField }) => (
                          <FormControl>
                            <Input
                              placeholder="请输入您的年龄段"
                              className="mt-2"
                              {...customField}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 地域 - 省份 */}
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所在省份 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择省份" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_PROFILE_FIELDS.provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 城市（可选） */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>城市（可选）</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入城市名称" {...field} />
                    </FormControl>
                    <FormDescription>
                      可以更精准地推荐适合您所在城市的项目
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 城市等级 */}
              <FormField
                control={form.control}
                name="cityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>城市等级 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择城市等级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_PROFILE_FIELDS.cityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {watchCityLevel === 'other' && (
                      <FormField
                        control={form.control}
                        name="customCityLevel"
                        render={({ field: customField }) => (
                          <FormControl>
                            <Input
                              placeholder="请描述您所在城市的情况"
                              className="mt-2"
                              {...customField}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 当前状态 */}
              <FormField
                control={form.control}
                name="currentStatus"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      当前状态 *
                    </div>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                      >
                        {USER_PROFILE_FIELDS.currentStatuses.map((status) => (
                          <FormItem
                            key={status.value}
                            className="flex items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={status.value} id={`status-${status.value}`} />
                            </FormControl>
                            <label
                              htmlFor={`status-${status.value}`}
                              className="font-normal cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {status.label}
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    {watchCurrentStatus === 'other' && (
                      <FormField
                        control={form.control}
                        name="customCurrentStatus"
                        render={({ field: customField }) => (
                          <FormControl>
                            <Input
                              placeholder="请描述您当前的状态"
                              className="mt-2"
                              {...customField}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 学历 */}
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学历 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择学历" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_PROFILE_FIELDS.educationLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {watchEducation === 'other' && (
                      <FormField
                        control={form.control}
                        name="customEducation"
                        render={({ field: customField }) => (
                          <FormControl>
                            <Input
                              placeholder="请描述您的教育背景"
                              className="mt-2"
                              {...customField}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 行业背景 */}
              <FormField
                control={form.control}
                name="industryBackground"
                render={() => (
                  <FormItem>
                    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      行业背景 *（可多选）
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {USER_PROFILE_FIELDS.industries.map((industry) => (
                        <FormField
                          key={industry.value}
                          control={form.control}
                          name="industryBackground"
                          render={({ field }) => (
                            <FormItem
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  id={`industry-${industry.value}`}
                                  checked={field.value?.includes(industry.value)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...(field.value || []), industry.value]
                                      : field.value?.filter((v) => v !== industry.value);
                                    field.onChange(newValue);
                                  }}
                                />
                              </FormControl>
                              <label
                                htmlFor={`industry-${industry.value}`}
                                className="font-normal cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {industry.label}
                              </label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    {watchIndustryBackground?.includes('other') && (
                      <FormField
                        control={form.control}
                        name="customIndustryBackground"
                        render={({ field: customField }) => (
                          <FormControl>
                            <Input
                              placeholder="请输入您的其他行业背景"
                              className="mt-2"
                              {...customField}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 技能选择 */}
              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      技能 *（可多选）
                    </div>
                    <FormDescription>选择您具备的技能，帮助我们推荐更匹配的项目</FormDescription>
                    <div className="space-y-4 mt-2">
                      {USER_PROFILE_FIELDS.skills.map((category) => (
                        <div key={category.category} className="space-y-2">
                          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {category.category}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {category.items.map((skill) => (
                              <FormField
                                key={skill}
                                control={form.control}
                                name="skills"
                                render={({ field }) => (
                                  <FormItem
                                    className="flex items-center space-x-2 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        id={`skill-${skill}`}
                                        checked={field.value?.includes(skill)}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...(field.value || []), skill]
                                            : field.value?.filter((v) => v !== skill);
                                          field.onChange(newValue);
                                        }}
                                      />
                                    </FormControl>
                                    <label
                                      htmlFor={`skill-${skill}`}
                                      className="font-normal cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {skill === 'other' ? '其他' : skill}
                                    </label>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {watchSkills?.includes('other') && (
                      <FormField
                        control={form.control}
                        name="customSkills"
                        render={({ field: customField }) => (
                          <FormControl>
                            <Input
                              placeholder="请输入您的其他技能，用逗号分隔"
                              className="mt-2"
                              {...customField}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 每周可用时间 */}
              <FormField
                control={form.control}
                name="availableTimePerWeek"
                render={({ field }) => (
                  <FormItem>
                    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      每周可投入时间 *
                    </div>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={80}
                          placeholder="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      </FormControl>
                      <span className="text-zinc-600 dark:text-zinc-400">小时/周</span>
                    </div>
                    <FormDescription>
                      您每周可以投入到副业/创业的时间
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 启动资金 */}
              <FormField
                control={form.control}
                name="startupBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>可投入启动资金 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择资金范围" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_PROFILE_FIELDS.startupBudgets.map((budget) => (
                          <SelectItem key={budget.value} value={budget.value}>
                            {budget.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {watchStartupBudget === 'other' && (
                      <FormField
                        control={form.control}
                        name="customStartupBudget"
                        render={({ field: customField }) => (
                          <FormControl>
                            <Input
                              placeholder="请描述您可投入的资金情况"
                              className="mt-2"
                              {...customField}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                    <FormDescription>
                      用于启动副业/创业的初始资金
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 其他资源（可选） */}
              <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div>
                    <div className="text-sm font-medium leading-none">
                      其他可利用资源（可选）
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      选择您拥有的特殊资源，AI会综合考虑这些资源为您推荐更合适的项目
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="resourceTypes"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {USER_PROFILE_FIELDS.resourceTypes.map((resource) => (
                          <FormField
                            key={resource.id}
                            control={form.control}
                            name="resourceTypes"
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <label
                                    htmlFor={`resource-${resource.id}`}
                                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                                      field.value?.includes(resource.id)
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                                    }`}
                                  >
                                    <Checkbox
                                      id={`resource-${resource.id}`}
                                      className="sr-only"
                                      checked={field.value?.includes(resource.id)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...(field.value || []), resource.id]
                                          : field.value?.filter((v) => v !== resource.id);
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <span className="text-2xl">{resource.icon}</span>
                                    <span className="text-xs font-medium text-center">
                                      {resource.label}
                                    </span>
                                  </label>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resourceDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">资源详情描述</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请详细描述您拥有的资源，例如：&#10;• 在某行业有10年人脉积累&#10;• 有一辆货车可用于配送&#10;• 名下有门店可用于经营"
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>描述越详细，AI推荐越精准</span>
                        <span className="text-zinc-400">{field.value?.length || 0}/500</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 整体补充说明 */}
              <div className="space-y-4 rounded-lg border border-zinc-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4 dark:border-zinc-800 dark:from-purple-950/30 dark:to-blue-950/30">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <div>
                    <div className="text-sm font-medium leading-none">
                      补充说明（可选）
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      如有其他想告诉AI的信息，可以在这里自由描述
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="overallDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="例如：&#10;• 我对某个领域特别感兴趣&#10;• 我有特殊的时间安排（如只有晚上有空）&#10;• 我希望项目能在X个月内回本&#10;• 我不想做需要大量社交的项目&#10;• 任何其他您认为重要的信息..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>自由描述任何可能影响推荐的因素</span>
                        <span className="text-zinc-400">{field.value?.length || 0}/1000</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 提交按钮 */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '正在生成推荐...' : '获取AI推荐'}
                </Button>
                <p className="mt-3 text-center text-xs text-zinc-500">
                  提交后，AI将根据您的画像生成个性化的副业/创业推荐
                </p>
              </div>
            </form>
          </Form>
        </Card>

        {/* 免责声明 */}
        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">⚠️ 免责声明</p>
          <p className="mt-1">
            推荐结果仅供参考，不构成投资建议。创业有风险，请根据自身情况谨慎决策。
            我们不推荐任何灰产、传销、诈骗或违规金融项目。
          </p>
        </div>
      </div>
    </div>
  );
}
