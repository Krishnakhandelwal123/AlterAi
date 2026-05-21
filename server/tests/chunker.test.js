import { chunkText } from '../utils/chunker.js';

describe('chunkText', () => {
  it('keeps resume section context with nearby role details', () => {
    const resumeText = `
EXPERIENCE
Frontend Developer
Acme Labs
Built React dashboards and integrated REST APIs for analytics workflows.

SKILLS
React Node.js PostgreSQL
`;

    const chunks = chunkText(resumeText, 180, 40);

    expect(chunks.some((chunk) =>
      chunk.includes('EXPERIENCE')
      && chunk.includes('Frontend Developer')
      && chunk.includes('Acme Labs')
    )).toBe(true);
  });

  it('splits very long unpunctuated text instead of creating one huge chunk', () => {
    const text = Array.from({ length: 120 }, (_, index) => `word${index}`).join(' ');
    const chunks = chunkText(text, 120, 20);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 150)).toBe(true);
  });
});
