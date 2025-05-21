import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  
  // Filter out screens that should not appear in the tab bar
  const visibleRoutes = state.routes.filter(route => {
    const { options } = descriptors[route.key];
    return options.tabBarButton !== undefined ? false : true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === state.routes.indexOf(route);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Determine icon based on route name
        let iconName: 'help-circle' | 'home' | 'chat' | 'account' | 'cog' = "help-circle";
        if (route.name === 'Home') iconName = "home";
        else if (route.name === 'Chat') iconName = "chat";
        else if (route.name === 'Profile') iconName = "account";
        else if (route.name === 'Settings') iconName = "cog";

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button" 
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={`${label} tab`}
            onPress={onPress}
            style={styles.tabButton}
          >
            <MaterialCommunityIcons 
              name={iconName} 
              size={24} 
              color={isFocused ? theme.primary : 'gray'} 
            />
            <Text style={[
              styles.tabLabel, 
              { color: isFocused ? theme.primary : 'gray' }
            ]}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    elevation: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  }
});

export default CustomTabBar;
