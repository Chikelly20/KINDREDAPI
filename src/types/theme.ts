import { Theme as NavigationTheme } from '@react-navigation/native';

export interface Theme extends NavigationTheme {
  colors: NavigationTheme['colors'] & {
    textSecondary: string;
    cardBackground: string;
    primary: string;
    secondary: string;
  };
}
