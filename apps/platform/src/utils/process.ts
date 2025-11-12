
export type TimeInterval = 
  | "last_hour" 
  | "last_24_hours" 
  | "last_week" 
  | "last_month" 
  | "last_year";
export interface DateRange {
  start: Date;
  end: Date;
}
export interface GraphDataPoint {
  timestamp: Date;
  count: number;
  label: string;
  cumulativeCount: number;
}

export interface PeriodSummary {
  start: Date;
  end: Date;
  userCount: number;
  label: string;
}
/**
 * Get the start of the week (Sunday)
 */
export function getStartOfWeek(date: Date): Date {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

/**
 * Calculate growth percentage
 */
export function calculateGrowthPercentage(
  current: number,
  previous: number
): number {
  // Both periods have no users
  if (current === 0 && previous === 0) {
    return 0;
  }
  
  // Previous period had no users, current period has users
  if (previous === 0 && current > 0) {
    return 100; // 100% growth (or could use current * 100 for actual count-based growth)
  }
  
  // Current period has no users, previous period had users
  if (current === 0 && previous > 0) {
    return -100; // -100% decline
  }
  
  // Normal calculation: percentage change
  return Number((((current - previous) / previous) * 100).toFixed(2));
}
/**
 * Calculate trend direction
 */
export function calculateTrend(growth: number): -1 | 1 | 0 {
  if (growth > 0) return 1;
  if (growth < 0) return -1;
  return 0;
}

 /**
 * Get date ranges for current and previous periods
 */
export function getDateRanges(
  timeInterval: TimeInterval,
  now: Date
): { current: DateRange; previous: DateRange } {
  switch (timeInterval) {
    case "last_hour": {
      const currentStart = new Date(now.getTime() - 60 * 60 * 1000);
      const previousStart = new Date(currentStart.getTime() - 60 * 60 * 1000);
      
      return {
        current: { start: currentStart, end: now },
        previous: { start: previousStart, end: currentStart },
      };
    }

    case "last_24_hours": {
      const currentStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const previousStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
      
      return {
        current: { start: currentStart, end: now },
        previous: { start: previousStart, end: currentStart },
      };
    }

    case "last_week": {
      const currentWeekStart = getStartOfWeek(now);
      const previousWeekStart = new Date(
        currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000
      );
      
      return {
        current: { start: currentWeekStart, end: now },
        previous: { start: previousWeekStart, end: currentWeekStart },
      };
    }

    case "last_month": {
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const previousMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );
      
      return {
        current: { start: currentMonthStart, end: now },
        previous: { start: previousMonthStart, end: previousMonthEnd },
      };
    }

    case "last_year": {
      const currentYearStart = new Date(now.getFullYear(), 0, 1);
      const previousYearStart = new Date(now.getFullYear() - 1, 0, 1);
      const previousYearEnd = new Date(
        now.getFullYear() - 1,
        11,
        31,
        23,
        59,
        59,
        999
      );
      
      return {
        current: { start: currentYearStart, end: now },
        previous: { start: previousYearStart, end: previousYearEnd },
      };
    }

    default:
      throw new Error(`Invalid time interval: ${timeInterval}`);
  }
}

/**
 * Get the appropriate SQL date truncation format based on interval
 */
export function getGroupByFormat(timeInterval: TimeInterval): string {
  switch (timeInterval) {
    case "last_hour":
      return "minute";
    case "last_24_hours":
      return "hour";
    case "last_week":
      return "day";
    case "last_month":
      return "day";
    case "last_year":
      return "month";
    default:
      return "day";
  }
}

/**
 * Generate graph-ready data points
 */
export function generateGraphData(
   timeSeriesData: {
    currentData: Array<{ timestamp: Date; count: number }>;
    previousData: Array<{ timestamp: Date; count: number }>;
  },
  timeInterval: TimeInterval
): GraphDataPoint[] {
  const graphData: GraphDataPoint[] = [];
  let cumulativeCurrent = 0;
  let cumulativePrevious = 0;

  // Process previous period data
  timeSeriesData.previousData.forEach((point) => {
    cumulativePrevious += point.count;
    graphData.push({
      timestamp: new Date(point.timestamp),
      count: point.count,
      cumulativeCount: cumulativePrevious,
      label: formatLabel(new Date(point.timestamp), timeInterval, 'previous'),
    });
  });

  // Process current period data
  timeSeriesData.currentData.forEach((point) => {
    cumulativeCurrent += point.count;
    graphData.push({
      timestamp: new Date(point.timestamp),
      count: point.count,
      cumulativeCount: cumulativeCurrent,
      label: formatLabel(new Date(point.timestamp), timeInterval, 'current'),
    });
  });

  return graphData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

}

/**
 * Format label for graph data points
 */
export function formatLabel(
  date: Date,
  timeInterval: TimeInterval,
  period: 'current' | 'previous'
): string {
  const periodPrefix = period === 'previous' ? 'Prev: ' : '';
  
  switch (timeInterval) {
    case "last_hour":
      return `${periodPrefix}${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    case "last_24_hours":
      return `${periodPrefix}${date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        hour12: true 
      })}`;
    case "last_week":
    case "last_month":
      return `${periodPrefix}${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })}`;
    case "last_year":
      return `${periodPrefix}${date.toLocaleDateString('en-US', { 
        month: 'short',
        year: 'numeric'
      })}`;
    default:
      return `${periodPrefix}${date.toLocaleDateString()}`;
  }
}

/**
 * Get human-readable period label
 */
export function getPeriodLabel(
  timeInterval: TimeInterval,
  period: 'current' | 'previous'
): string {
  const prefix = period === 'previous' ? 'Previous' : 'Current';
  
  switch (timeInterval) {
    case "last_hour":
      return `${prefix} Hour`;
    case "last_24_hours":
      return `${prefix} 24 Hours`;
    case "last_week":
      return `${prefix} Week`;
    case "last_month":
      return `${prefix} Month`;
    case "last_year":
      return `${prefix} Year`;
    default:
      return prefix;
  }
}


