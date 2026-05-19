import React from 'react';

const tips = [
  {
    n: '01',
    title: 'Pin your link in bio',
    body: 'Add your clone link to your Twitter, Instagram, and LinkedIn bio. Every profile visitor becomes a potential chat.'
  },
  {
    n: '02',
    title: 'Post about it publicly',
    body: "Tweet 'Ask my AI anything ->' with your link. Curiosity drives clicks more than any other CTA."
  },
  {
    n: '03',
    title: 'Add it to your email signature',
    body: "Millions of emails go out daily. 'Chat with my AI:' in your signature is passive traffic forever."
  }
];

const ViralTips = () => (
  <section className="share-section">
    <p className="share-label">GROW FASTER</p>
    <p className="share-subtitle">Tips from creators who went viral</p>
    <div className="share-tips-grid">
      {tips.map((tip) => (
        <article key={tip.n}>
          <span>{tip.n}</span>
          <h3>{tip.title}</h3>
          <p>{tip.body}</p>
        </article>
      ))}
    </div>
  </section>
);

export default ViralTips;
