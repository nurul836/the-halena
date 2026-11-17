export const business = {
  name: 'THE HALENA',
  email: import.meta.env.VITE_BUSINESS_EMAIL?.trim() || '',
  phone: import.meta.env.VITE_BUSINESS_PHONE?.trim() || '',
  address: import.meta.env.VITE_BUSINESS_ADDRESS?.trim() || '',
  siteUrl: import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || '',
  locale: 'en',
  contactPlaceholder: 'Studio contact details will be published here. Begin with a project brief.',
  socials: [
    { label: 'Instagram', url: import.meta.env.VITE_INSTAGRAM_URL || '' },
    { label: 'Pinterest', url: import.meta.env.VITE_PINTEREST_URL || '' },
    { label: 'LinkedIn', url: import.meta.env.VITE_LINKEDIN_URL || '' },
  ].filter(link => /^https:\/\//.test(link.url)),
};
