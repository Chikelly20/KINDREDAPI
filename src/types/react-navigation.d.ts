/**
 * Custom type declarations for React Navigation to fix TypeScript errors
 */

import '@react-navigation/native';

// Override the Navigator type to make 'id' optional
declare module '@react-navigation/native' {
  export interface NavigationState {
    id?: string;
  }
}

// Override the Navigator component props
declare module '@react-navigation/core' {
  export interface NavigatorPropsBase {
    id?: string;
  }
}
