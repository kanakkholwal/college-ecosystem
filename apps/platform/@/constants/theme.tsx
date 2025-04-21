
export const themes ={
    light:"data-[theme=light]",
    dark:"data-[theme=dark]",
    glass_light:"data-[theme=glass_light]",
    glass_dark:"data-[theme=glass_dark]",
}

export const minimal_themes = ["light", "dark","system"] as const
export const glass_themes = ["glass_light", "glass_dark"] as const

export const all_themes =[
    ...minimal_themes,
    ...glass_themes
] as const;

export type themeType = typeof all_themes[number];
export type glassThemeType = typeof glass_themes[number];
