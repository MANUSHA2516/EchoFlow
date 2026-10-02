import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const key = 'echoflow.motion.enabled';
const MotionContext = createContext({
  enabled: false,
  allowed: true,
  systemReduced: true,
  setAllowed: (_value: boolean) => {},
});
export function MotionProvider({ children }: { children: ReactNode }) {
  const [allowed, setPreference] = useState(true);
  const [systemReduced, setSystemReduced] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setSystemReduced(value);
      })
      .catch(() => {});
    void AsyncStorage.getItem(key)
      .then((value) => {
        if (mounted && value !== null) setPreference(value !== 'false');
      })
      .catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduced);
    const app = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => {
      mounted = false;
      motion.remove();
      app.remove();
    };
  }, []);
  const setAllowed = (value: boolean) => {
    setPreference(value);
    void AsyncStorage.setItem(key, String(value)).catch(() => {});
  };
  return (
    <MotionContext.Provider
      value={{ enabled: allowed && !systemReduced && active, allowed, systemReduced, setAllowed }}
    >
      {children}
    </MotionContext.Provider>
  );
}
export const useMotion = () => useContext(MotionContext);
