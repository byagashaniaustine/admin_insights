import { createContext, useContext } from 'react';

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  openSidebar: () => void;
}

export const AppContext = createContext<AppContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  openSidebar: () => {},
});

export const useAppContext = () => useContext(AppContext);
