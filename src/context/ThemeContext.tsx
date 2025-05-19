import React, { createContext, useState, useContext, ReactNode } from 'react';
import { StyleSheet } from 'react-native';

// Define theme colors
const lightTheme = {
  primary: '#541484', // Dark purple
  secondary: '#FFFFFF', // White
  text: '#000000',
  textLight: '#757575', // Light gray for secondary text
  background: '#FFFFFF',
  card: '#F5F5F5',
  border: '#E0E0E0',
  error: '#E53935', // Red for errors
  placeholder: '#666666', // Dark gray for placeholder text
  cardBackground: '#F5F5F5', // Light gray for card background
  textSecondary: '#757575', // Light gray for secondary text
};

const darkTheme = {
  primary: '#541484', // Dark purple
  secondary: '#121212', // Dark gray
  text: '#FFFFFF',
  textLight: '#AAAAAA', // Light gray for secondary text
  background: '#121212',
  card: '#1E1E1E',
  border: '#333333',
  error: '#FF5252', // Red for errors
  placeholder: '#666666', // Dark gray for placeholder text
  cardBackground: '#1A1A1A', // Dark gray for card background
  textSecondary: '#AAAAAA', // Light gray for secondary text
};

// Theme context type
type ThemeType = 'light' | 'dark';

export interface ThemeContextType {
  theme: {
    primary: string;
    secondary: string;
    text: string;
    textLight: string;
    background: string;
    card: string;
    border: string;
    error: string;
    placeholder: string;
    cardBackground: string;
    textSecondary: string;
  };
  themeType: ThemeType;
  toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const theme = themeType === 'light' ? lightTheme : darkTheme;

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setThemeType(themeType === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export common styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 