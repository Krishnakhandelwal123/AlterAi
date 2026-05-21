import { calculateTrainingStrength } from '../utils/planChecker.js';

describe('calculateTrainingStrength', () => {
  it('uses the active plan chunk limit as the denominator', () => {
    expect(calculateTrainingStrength(92, { maxTotalChunks: 500 })).toBe(18);
  });

  it('clamps the percentage between 0 and 100', () => {
    expect(calculateTrainingStrength(-10, { maxTotalChunks: 100 })).toBe(0);
    expect(calculateTrainingStrength(250, { maxTotalChunks: 100 })).toBe(100);
  });
});
