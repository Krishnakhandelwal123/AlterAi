const PUBLIC_APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL || 'https://alterai.tech').replace(/\/$/, '');
export const PUBLIC_APP_HOST = PUBLIC_APP_URL.replace(/^https?:\/\//, '');

export const getPublicChatUrl = (slug) => `${PUBLIC_APP_URL}/chat/${slug}`;
export const getPublicChatDisplayUrl = (slug) => `${PUBLIC_APP_HOST}/chat/${slug}`;
