import colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Returns the design tokens for the active theme.
 * Honors the user's selection (light/dark/system) from ThemeContext,
 * with system mode following the device color scheme.
 */
export function useColors() {
  const { effective } = useTheme();
  const palette =
    effective === "dark" && "dark" in colors
      ? ((colors as unknown as Record<string, typeof colors.light>).dark ?? colors.light)
      : colors.light;
  return { ...palette, radius: colors.radius };
}
