interface SmartRule {
  type: 'location' | 'time' | 'device' | 'language';
  condition: any;
  content: string;
}

interface QRSchedule {
  startDate?: Date;
  endDate?: Date;
  timeWindows?: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    days: number[]; // 0-6 for Sunday-Saturday
  }[];
}

export class SmartQRService {
  // Evaluate smart rules to determine content
  async evaluateRules(
    rules: SmartRule[],
    context: {
      location?: { country?: string; city?: string };
      timestamp?: Date;
      device?: string;
      language?: string;
    }
  ): Promise<string> {
    for (const rule of rules) {
      switch (rule.type) {
        case 'location':
          if (this.matchLocation(rule.condition, context.location)) {
            return rule.content;
          }
          break;
        case 'time':
          if (this.matchTime(rule.condition, context.timestamp)) {
            return rule.content;
          }
          break;
        case 'device':
          if (this.matchDevice(rule.condition, context.device)) {
            return rule.content;
          }
          break;
        case 'language':
          if (this.matchLanguage(rule.condition, context.language)) {
            return rule.content;
          }
          break;
      }
    }

    return rules[0]?.content || ''; // Default to first rule's content
  }

  // Check if QR code is active based on schedule
  isActive(schedule: QRSchedule): boolean {
    const now = new Date();

    // Check date range
    if (schedule.startDate && now < schedule.startDate) return false;
    if (schedule.endDate && now > schedule.endDate) return false;

    // Check time windows
    if (schedule.timeWindows) {
      const currentDay = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      return schedule.timeWindows.some(
        window =>
          window.days.includes(currentDay) &&
          this.isTimeInRange(currentTime, window.start, window.end)
      );
    }

    return true;
  }

  private matchLocation(
    condition: { country?: string; city?: string },
    location?: { country?: string; city?: string }
  ): boolean {
    if (!location) return false;
    if (condition.country && condition.country !== location.country) return false;
    if (condition.city && condition.city !== location.city) return false;
    return true;
  }

  private matchTime(condition: { start: string; end: string }, timestamp?: Date): boolean {
    if (!timestamp) return false;
    const time = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    return this.isTimeInRange(time, condition.start, condition.end);
  }

  private matchDevice(condition: string, device?: string): boolean {
    return device === condition;
  }

  private matchLanguage(condition: string, language?: string): boolean {
    return language === condition;
  }

  private isTimeInRange(time: string, start: string, end: string): boolean {
    return time >= start && time <= end;
  }

  // Create multi-language content
  async createMultiLanguageContent(
    content: Record<string, string>,
    defaultLanguage: string
  ): Promise<(language: string) => string> {
    return (language: string) => content[language] || content[defaultLanguage];
  }

  // Create A/B test variants
  async createABTest(variantA: string, variantB: string): Promise<{
    getVariant: (userId: string) => string;
    trackConversion: (userId: string) => void;
  }> {
    const variants = new Map<string, 'A' | 'B'>();

    return {
      getVariant: (userId: string) => {
        if (!variants.has(userId)) {
          variants.set(userId, Math.random() < 0.5 ? 'A' : 'B');
        }
        return variants.get(userId) === 'A' ? variantA : variantB;
      },
      trackConversion: (userId: string) => {
        const variant = variants.get(userId);
        if (variant) {
          // Track conversion in analytics
          console.log(`Conversion for variant ${variant}`);
        }
      }
    };
  }
} 