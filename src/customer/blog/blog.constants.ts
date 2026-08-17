export const BLOG_STATUS = {
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
};

export const BLOG_CONFIG = {
  DAILY_CRON: '0 0 * * *', // Generates daily at Midnight
  PUBLISH_CRON: '0 0 * * *', // Publishes approved blogs daily at Midnight
  LANDING_PAGE_LIMIT: 10,
};
