export const appConfig = {
	name: 'College Platform',
	shortName: 'CP',
	description:
		'NIT Hamirpur student portal for academic results, campus resources, and community collaboration.',
	githubRepo: 'https://github.com/kanakkholwal/college-ecosystem',
	contact: 'https://forms.gle/PXbaDm9waeJWYWUP8',
	socials: {
		github: 'https://github.com/kanakkholwal',
		twitter: 'https://twitter.com/kanakkholwal',
		linkedin: 'https://linkedin.com/in/kanak-kholwal',
		website: 'https://kanak.eu.org'
	}
} as const;

export const navLinks = [
	{ href: '/', title: 'Home' },
	{ href: '/community', title: 'Community' },
	{ href: '/resources', title: 'Resources' },
	{ href: '/academic-calendar', title: 'Calendar' }
] as const;

export const supportLinks = [
	{
		href: appConfig.githubRepo,
		title: 'Contribute to this project'
	},
	{
		href: `${appConfig.githubRepo}/issues`,
		title: 'Report an issue'
	},
	{
		href: 'https://forms.gle/u2ptK12iRVdn5oXF7',
		title: 'Give feedback'
	},
	{
		href: 'https://forms.gle/v8Angn9VCbt9oVko7',
		title: 'Suggest a feature'
	}
] as const;
