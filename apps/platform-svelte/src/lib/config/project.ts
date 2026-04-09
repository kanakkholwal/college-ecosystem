// Project configuration for the College Ecosystem platform
export const orgConfig = {
	name: 'National Institute of Technology, Hamirpur',
	shortName: 'NITH',
	domain: 'nith.ac.in',
	website: 'https://nith.ac.in',
	logo: 'https://nith.ac.in/uploads/settings/15795036012617.png',
	logoSquare: 'https://nith.ac.in/uploads/topics/nit-logo15954991401255.jpg',
	mailSuffix: '@nith.ac.in',

	socials: {
		twitter: {
			url: 'https://twitter.com/nithamirpur',
			handle: '@nithamirpur',
			publisher: '@nithamirpur'
		},
		linkedin: 'https://linkedin.com/company/nithamirpur',
		instagram: 'https://instagram.com/nithamirpur',
		facebook: 'https://facebook.com/NITHamirpur',
		youtube: 'https://youtube.com/@NITHamirpur'
	},
	foundingDate: '1986-01-01',
	location: {
		address: {
			'@type': 'PostalAddress' as const,
			streetAddress: 'NIT Hamirpur Campus, Anu',
			addressLocality: 'Hamirpur',
			addressRegion: 'Himachal Pradesh',
			postalCode: '177005',
			addressCountry: 'IN'
		},
		geo: {
			'@type': 'GeoCoordinates' as const,
			latitude: '31.7087',
			longitude: '76.5270'
		}
	},
	contact: {
		email: 'registrar@nith.ac.in',
		phone: '+91-1972-254001',
		fax: '+91-1972-223834'
	},
	socialProfiles: [
		'https://www.facebook.com/NITHamirpur',
		'https://twitter.com/NITHamirpurHP',
		'https://www.instagram.com/nithamirpur/',
		'https://www.linkedin.com/school/nithamirpur/',
		'https://www.youtube.com/@NITHamirpur'
	],
	jsonLds: {
		EducationalOrganization: {
			'@context': 'https://schema.org',
			'@type': ['CollegeOrUniversity', 'GovernmentOrganization'],
			name: 'National Institute of Technology, Hamirpur',
			url: 'https://nith.ac.in',
			logo: 'https://nith.ac.in/uploads/settings/15795036012617.png',
			foundingDate: '1986',
			address: {
				'@type': 'PostalAddress',
				streetAddress: 'NIT Hamirpur Campus, Anu',
				addressLocality: 'Hamirpur',
				addressRegion: 'Himachal Pradesh',
				postalCode: '177005',
				addressCountry: 'IN'
			},
			contactPoint: {
				'@type': 'ContactPoint',
				contactType: 'Admissions',
				telephone: '+91-1972-254001',
				email: 'registrar@nith.ac.in'
			},
			sameAs: [
				'https://www.facebook.com/NITHamirpur',
				'https://twitter.com/NITHamirpurHP',
				'https://www.instagram.com/nithamirpur/',
				'https://www.linkedin.com/school/nithamirpur/',
				'https://www.youtube.com/@NITHamirpur'
			]
		}
	}
} as const;

export const appConfig = {
	name: 'College Platform',
	shortName: 'CP',
	appDomain: 'nith.eu.org',
	otherAppDomains: [
		'app.nith.eu.org',
		'platform.nith.eu.org',
		'nith-app.vercel.app',
		'os.nith.eu.org',
		'nith-app.pages.dev'
	],
	url: 'https://app.nith.eu.org',
	logoSquare: '/logo-square.svg',
	logo: '/logo.svg',
	logoDark: '/logo-dark.svg',
	description:
		'NIT Hamirpur student portal for academic results, campus resources, and community collaboration. Manage your college ecosystem in one platform.',
	keywords: [
		'NITH portal',
		'NIT Hamirpur',
		'campus management',
		'student portal',
		'college ecosystem',
		'academic platform',
		'college os',
		'NITH results',
		'semester results',
		'exam grades',
		'course materials',
		'faculty collaboration',
		'campus resources',
		'BTech portal',
		'MTech portal',
		'MCA portal',
		'BArch portal',
		'PhD portal',
		'Hamirpur colleges',
		'Himachal Pradesh colleges',
		'NIT Hamirpur portal',
		'check results online',
		'download marksheet',
		'academic records',
		'connect with faculty',
		'campus announcements'
	].join(', '),
	creator: 'Kanak Kholwal',
	authors: [
		{
			name: 'Kanak Kholwal',
			url: 'https://kanak.eu.org',
			image: 'https://github.com/kanakkholwal.png',
			email: 'me@kanak.eu.org'
		},
		{
			name: 'NITH Administration',
			url: 'https://nith.ac.in',
			role: 'EducationalInstitution'
		}
	],
	githubRepo: 'https://github.com/kanakkholwal/college-ecosystem',
	githubUri: 'kanakkholwal/college-ecosystem',
	socials: {
		twitter: 'https://twitter.com/kanakkholwal',
		linkedin: 'https://linkedin.com/in/kanak-kholwal',
		instagram: 'https://instagram.com/kanakkholwal',
		github: 'https://github.com/kanakkholwal',
		website: 'https://kanak.eu.org'
	},
	verifications: {
		google_adsense: 'ca-pub-6988693445063744',
		google_analytics: 'G-SC4TQQ5PCW'
	},
	seo: {
		locale: 'en_IN',
		timezone: 'Asia/Kolkata',
		geo: {
			placename: 'Hamirpur',
			region: 'Himachal Pradesh',
			position: '31.7087° N, 76.5270° E'
		},
		category: 'Education',
		publisher: orgConfig.name,
		schemaType: 'WebApplication'
	},
	contact: 'https://forms.gle/PXbaDm9waeJWYWUP8',
	jsonLds: {
		WebApplication: {
			'@type': 'WebApplication',
			name: 'NITH Campus Portal',
			url: 'https://app.nith.eu.org',
			applicationCategory: 'Education',
			operatingSystem: 'Web',
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'INR'
			}
		}
	},
	flags: {
		enableOgImage: false
	}
} as const;

export const navLinks = [
	{ href: '/', title: 'Home' },
	{ href: '/results', title: 'Results' },
	{ href: '/community', title: 'Community' },
	{ href: '/schedules', title: 'Schedules' },
	{ href: '/academic-calendar', title: 'Calendar' }
] as const;
export type NavLink = typeof navLinks[number];

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

export default {
	appConfig,
	orgConfig,
	supportLinks
} as const;
