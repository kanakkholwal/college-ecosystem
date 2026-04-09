<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Popover from '$lib/components/ui/popover';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import Icon from '@iconify/svelte';

  type BrandTheme = {
    id: string;
    label: string;
    color: string;
  };

  const themes: BrandTheme[] = [
    { id: 'teal', label: 'Teal', color: '#0d9488' },
    { id: 'violet', label: 'Violet', color: '#7c3aed' },
    { id: 'blue', label: 'Ocean', color: '#2563eb' }
  ];

  let current = $state<BrandTheme>(themes[0]);

  // load
  $effect(() => {
    const stored = localStorage.getItem('theme-brand');
    if (stored) current = JSON.parse(stored);
  });

  // apply
  $effect(() => {
    const root = document.documentElement;

    root.style.setProperty('--primary', current.color);
    root.style.setProperty('--ring', current.color);

    localStorage.setItem('theme-brand', JSON.stringify(current));
  });
</script>

<Popover.Root>
  <Popover.Trigger>
    <Button variant="ghost" size="icon_sm" class="rounded-full relative">
      <span
        class="size-4 rounded-full"
        style="background-color: {current.color}"
      >
      </span>
    </Button>
  </Popover.Trigger>

  <Popover.Content class="w-64 p-3">
    <div class="flex items-center justify-between mb-3 px-1">
      <span class="text-xs font-semibold text-muted-foreground uppercase">
        Interface Color
      </span>
      <Icon icon="lucide:palette" class="size-3.5 text-muted-foreground" />
    </div>

    <div class="grid grid-cols-4 gap-2">
      {#each themes as t}
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button
              class="relative size-10 rounded-full flex items-center justify-center"
              onclick={() => (current = t)}
            >
              <span
                class="size-6 rounded-full"
                style="background-color: {t.color}"
              >
              </span> 

              {#if current.id === t.id}
                <Icon icon="lucide:check" class="absolute size-3.5 text-white" />
              {/if}
            </button>
          </Tooltip.Trigger>

          <Tooltip.Content>
            {t.label}
          </Tooltip.Content>
        </Tooltip.Root>
      {/each}
    </div>
  </Popover.Content>
</Popover.Root>