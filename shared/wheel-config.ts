// shared/wheel-config.ts
export interface WheelSegment {
    reward: number;
    weight: number;
    color: string;
    icon: string;
    label: string;
  }
  
  export const WHEEL_SEGMENTS: WheelSegment[] = [
    { reward: 0, weight: 20, color: '#ef4444', icon: '💔', label: 'Try Again' },
    { reward: 10, weight: 30, color: '#f59e0b', icon: '🪙', label: '10 Tokens' },
    { reward: 20, weight: 25, color: '#10b981', icon: '💰', label: '20 Tokens' },
    { reward: 50, weight: 15, color: '#3b82f6', icon: '💎', label: '50 Tokens' },
    { reward: 100, weight: 8, color: '#8b5cf6', icon: '🎁', label: '100 Tokens' },
    { reward: 200, weight: 2, color: '#f97316', icon: '🏆', label: '200 Tokens' },
  ];
  
  export const TOTAL_WEIGHT = WHEEL_SEGMENTS.reduce((sum, segment) => sum + segment.weight, 0);
  
  // Calculate the angle for each segment (360 degrees divided by number of segments)
  export const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS.length;
  
  // Helper function to get segment index from reward
  export function getSegmentIndex(reward: number): number {
    return WHEEL_SEGMENTS.findIndex(segment => segment.reward === reward);
  }
  
  // Helper function to calculate the target angle for a specific reward
  export function calculateTargetAngle(reward: number): number {
    const segmentIndex = getSegmentIndex(reward);
    if (segmentIndex === -1) return 0;
    
    // Calculate the center angle of the segment
    // We want the wheel to stop with the reward segment at the top (12 o'clock position)
    const segmentCenterAngle = (segmentIndex * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2);
    
    // Since the pointer is at the top, we need to rotate so the winning segment is at 0 degrees
    // We subtract from 360 because we want to rotate counter-clockwise to that position
    return 360 - segmentCenterAngle;
  }
  
  // Weighted random selection
  export function selectRandomReward(): number {
    let random = Math.random() * TOTAL_WEIGHT;
    
    for (const segment of WHEEL_SEGMENTS) {
      random -= segment.weight;
      if (random <= 0) {
        return segment.reward;
      }
    }
    
    return 0; // Fallback
  }