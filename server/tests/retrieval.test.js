import { getQueryTerms, rankRelevantChunks } from '../utils/retrieval.js';

describe('retrieval helpers', () => {
  it('expands experience questions into resume-friendly search terms', () => {
    const terms = getQueryTerms('What is your experience?');

    expect(terms).toEqual(expect.arrayContaining(['experience', 'work', 'role', 'company']));
  });

  it('ranks chunks with experience details above unrelated chunks', () => {
    const chunks = [
      { chunk_text: 'Education Bachelor of Technology Computer Science' },
      { chunk_text: 'I have strong backend skills, real project experience, and I am a quick learner.' },
      { chunk_text: 'Experience Software Engineer Intern at AlterAI. Built MERN dashboards and APIs.' },
      { chunk_text: 'Hobbies music and writing' }
    ];

    const ranked = rankRelevantChunks(chunks, 'tell me about your experience');

    expect(ranked[0]).toContain('Software Engineer');
  });
});
