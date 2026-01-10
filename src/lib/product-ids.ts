/**
 * Product IDs for test routes
 * Structure: {category}/{environment}/{mode}
 * Categories: 'one' | 'sub'
 * Environments: 'dev' | 'prod'
 * Modes: 'test' | 'live'
 */
export const PRODUCT_IDS = {
  'one': {
    'dev': {
      'test': 'pdt_i7wAfttoaLW3M0UxV2nmn',
      'live': 'pdt_NBhFOCqijKmwWyUlpPcfp',
    },
    'prod': {
      'test': 'pdt_rkL69GfadxDLOiEk3LFNs',
      'live': 'pdt_I9CYJRCsjxxMcVzU76ny0',
    },
  },
  'sub': {
    'dev': {
      'test': 'pdt_xACv6pb1blYKMVhX1B0et', // TODO: Replace with actual product ID
      'live': 'pdt_zDTAUOebVXybiddWlx80p', // TODO: Replace with actual product ID
    },
    'prod': {
      'test': 'pdt_PKfYkaNVJ7m8QncvaaVip', // TODO: Replace with actual product ID
      'live': 'pdt_7FXu001AwBi4kC5Lj6C7F', // TODO: Replace with actual product ID
    },
  },
} as const;
