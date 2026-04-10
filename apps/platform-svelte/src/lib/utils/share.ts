import { toast } from 'svelte-sonner';

export type ShareData = {
	title?: string;
	text?: string;
	url?: string;
	image?: string;
};

export type ShareSocial = {
	name: string;
	url: string;
	icon: string; // lucide icon name
};

/**
 * Trigger native Web Share API. Replaces React's `useShare` hook.
 */
export async function share(data: ShareData) {
	if (typeof navigator === 'undefined' || !navigator.share) {
		toast.error('Web Share API not supported in your browser');
		return false;
	}
	try {
		await navigator.share({ title: data.title, text: data.text, url: data.url });
		return true;
	} catch (e) {
		console.error('[share]', e);
		toast.error('Failed to share content');
		return false;
	}
}

export function isNativeShareSupported() {
	return typeof navigator !== 'undefined' && !!navigator.share;
}

export function getShareSocials(data: ShareData): ShareSocial[] {
	const url = encodeURIComponent(data.url ?? '');
	const title = encodeURIComponent(data.title ?? '');
	const text = encodeURIComponent(data.text ?? '');
	const image = encodeURIComponent(data.image ?? '');

	return [
		{ name: 'facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${url}`, icon: 'facebook' },
		{ name: 'twitter', url: `https://twitter.com/intent/tweet?url=${url}&text=${title}`, icon: 'twitter' },
		{
			name: 'linkedin',
			url: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
			icon: 'linkedin'
		},
		{ name: 'whatsapp', url: `https://api.whatsapp.com/send?text=${url}`, icon: 'message-circle' },
		{
			name: 'pinterest',
			url: `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${text}`,
			icon: 'pin'
		},
		{ name: 'telegram', url: `https://t.me/share/url?url=${url}&text=${title}`, icon: 'send' },
		{ name: 'reddit', url: `https://www.reddit.com/submit?url=${url}&title=${title}`, icon: 'message-square' },
		{ name: 'email', url: `mailto:?subject=${title}&body=${text}: ${url}`, icon: 'mail' }
	];
}
