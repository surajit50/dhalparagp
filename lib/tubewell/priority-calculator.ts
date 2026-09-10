// lib/tubewell/priority-calculator.ts
/**
 * Calculate repair priority based on multiple factors
 */

interface PriorityCalculationInput {
  isFunctional: boolean;
  householdsServed: number;
  isDrinkingWaterSource: boolean;
  complaintAgeDays: number;
  physicalConditionScore: number; // 0-100
}

export function calculateRepairPriority(input: PriorityCalculationInput): 'Low' | 'Medium' | 'High' | 'Critical' {
  let priorityScore = 0;

  // Non-functional status is critical
  if (!input.isFunctional) {
    priorityScore += 40;
  }

  // Households served
  if (input.householdsServed > 500) {
    priorityScore += 25;
  } else if (input.householdsServed > 200) {
    priorityScore += 15;
  } else if (input.householdsServed > 50) {
    priorityScore += 10;
  }

  // Drinking water use
  if (input.isDrinkingWaterSource) {
    priorityScore += 20;
  }

  // Complaint age (older complaints = higher priority)
  if (input.complaintAgeDays > 30) {
    priorityScore += 15;
  } else if (input.complaintAgeDays > 14) {
    priorityScore += 10;
  } else if (input.complaintAgeDays > 7) {
    priorityScore += 5;
  }

  // Physical condition score (lower score = worse condition)
  if (input.physicalConditionScore < 30) {
    priorityScore += 20;
  } else if (input.physicalConditionScore < 60) {
    priorityScore += 10;
  }

  // Determine priority level
  if (priorityScore >= 90) {
    return 'Critical';
  } else if (priorityScore >= 70) {
    return 'High';
  } else if (priorityScore >= 40) {
    return 'Medium';
  } else {
    return 'Low';
  }
}

/**
 * Calculate physical condition score (0-100)
 * Based on assessment of individual items
 */
export function calculateConditionScore(assessments: { condition: string }[]): number {
  if (assessments.length === 0) return 50; // Default middle score

  let score = 0;
  let count = 0;

  for (const assessment of assessments) {
    if (assessment.condition === 'Good') {
      score += 100;
    } else if (assessment.condition === 'Average') {
      score += 50;
    } else if (assessment.condition === 'Poor') {
      score += 10;
    }
    count++;
  }

  return Math.round(score / count);
}
