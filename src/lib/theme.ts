export interface SagaTheme {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}

export function themeToCssVars(theme: SagaTheme): string {
  return [
    `--color-primary: ${theme.primary}`,
    `--color-accent: ${theme.accent}`,
    `--color-bg: ${theme.background}`,
    `--color-surface: ${theme.surface}`,
    `--color-text: ${theme.text}`,
    `--color-muted: ${theme.muted}`,
  ].join('; ');
}
