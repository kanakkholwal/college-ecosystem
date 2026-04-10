<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		squareSize = 4,
		gridGap = 6,
		flickerChance = 0.3,
		color = 'rgb(0, 0, 0)',
		maxOpacity = 0.2,
		class: className = ''
	}: {
		squareSize?: number;
		gridGap?: number;
		flickerChance?: number;
		color?: string;
		maxOpacity?: number;
		class?: string;
	} = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let containerEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!canvasEl || !containerEl) return;
		const canvas = canvasEl;
		const container = containerEl;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let width = 0;
		let height = 0;
		let cols = 0;
		let rows = 0;
		let squares: Float32Array;
		let raf = 0;
		const dpr = window.devicePixelRatio || 1;

		const toRgba = (col: string, opacity: number) => {
			const m = col.match(/\d+/g);
			if (m && m.length >= 3) {
				return `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${opacity})`;
			}
			return col;
		};

		const setup = () => {
			const rect = container.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			cols = Math.floor(width / (squareSize + gridGap));
			rows = Math.floor(height / (squareSize + gridGap));
			squares = new Float32Array(cols * rows);
			for (let i = 0; i < squares.length; i++) {
				squares[i] = Math.random() * maxOpacity;
			}
		};

		const draw = () => {
			if (!ctx) return;
			ctx.clearRect(0, 0, width, height);
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					const idx = i * rows + j;
					if (Math.random() < flickerChance) {
						squares[idx] = Math.random() * maxOpacity;
					}
					ctx.fillStyle = toRgba(color, squares[idx]);
					ctx.fillRect(
						i * (squareSize + gridGap),
						j * (squareSize + gridGap),
						squareSize,
						squareSize
					);
				}
			}
		};

		let last = 0;
		const loop = (now: number) => {
			if (now - last > 80) {
				draw();
				last = now;
			}
			raf = requestAnimationFrame(loop);
		};

		setup();
		raf = requestAnimationFrame(loop);

		const ro = new ResizeObserver(() => {
			setup();
		});
		ro.observe(container);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	});
</script>

<div bind:this={containerEl} class={cn('relative h-full w-full', className)}>
	<canvas bind:this={canvasEl} class="pointer-events-none absolute inset-0"></canvas>
</div>
