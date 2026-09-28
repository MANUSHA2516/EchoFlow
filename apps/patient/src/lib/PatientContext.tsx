import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { TimeSlot, VisitReason } from '@echoflow/types';
import { config } from './config';
import { demoApi } from './demoApi';
import { liveApi } from './liveApi';
import { tokenStorage } from './tokenStorage';
import type {
  AuthPurpose,
  DashboardData,
  NotificationItem,
  PatientProfile,
  VisitItem,
} from '../types/patient';

type PendingOtp = {
  challengeId: string;
  phoneE164: string;
  purpose: AuthPurpose;
};

type Api = typeof demoApi | typeof liveApi;

type PatientContextValue = {
  booting: boolean;
  authenticated: boolean;
  usingDemo: boolean;
  dashboard: DashboardData | null;
  visits: VisitItem[];
  notifications: NotificationItem[];
  pendingOtp: PendingOtp | null;
  error: string | null;
  busy: boolean;
  demoOtp: string;
  clearError: () => void;
  setPendingOtp: (otp: PendingOtp | null) => void;
  login: (nic: string, phoneLocal: string) => Promise<void>;
  register: (input: {
    fullName: string;
    nic: string;
    phoneLocal: string;
    dateOfBirth: string;
  }) => Promise<void>;
  verifyOtp: (code: string) => Promise<AuthPurpose>;
  resendOtp: () => Promise<void>;
  logout: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  joinQueue: (input: {
    reason: VisitReason;
    slot: TimeSlot;
    notes?: string;
  }) => Promise<void>;
  leaveQueue: () => Promise<void>;
  loadVisits: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  updateProfile: (
    input: Partial<Pick<PatientProfile, 'fullName' | 'dateOfBirth' | 'address' | 'avatarUrl'>>,
  ) => Promise<void>;
  requestPhoneChange: (newPhoneLocal: string) => Promise<void>;
  getCheckIn: () => Promise<{
    token: string;
    ticketNumber: string;
    expiresAt: string;
    payload: string;
  }>;
  refreshCheckIn: () => Promise<{
    token: string;
    ticketNumber: string;
    expiresAt: string;
    payload: string;
  }>;
};

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [usingDemo, setUsingDemo] = useState(config.forceDemo);
  const [api, setApi] = useState<Api>(config.forceDemo ? demoApi : liveApi);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingOtp, setPendingOtp] = useState<PendingOtp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setError(message);
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let active: Api = demoApi;
        let demo = true;
        if (!config.forceDemo) {
          try {
            const ok = await liveApi.health();
            if (ok) {
              active = liveApi;
              demo = false;
            }
          } catch {
            active = demoApi;
            demo = true;
          }
        }
        if (cancelled) return;
        setApi(active);
        setUsingDemo(demo);
        const access = await tokenStorage.getAccess();
        const data = await active.restoreSession(Boolean(access));
        if (cancelled) return;
        if (data) {
          setDashboard(data);
          setAuthenticated(true);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<PatientContextValue>(
    () => ({
      booting,
      authenticated,
      usingDemo,
      dashboard,
      visits,
      notifications,
      pendingOtp,
      error,
      busy,
      demoOtp: demoApi.demoOtpHint(),
      clearError: () => setError(null),
      setPendingOtp,
      login: async (nic, phoneLocal) => {
        await run(async () => {
          const res = await api.login(nic, phoneLocal);
          setPendingOtp({
            challengeId: res.challengeId,
            phoneE164: res.phoneE164,
            purpose: 'login',
          });
        });
      },
      register: async (input) => {
        await run(async () => {
          const res = await api.register(input);
          setPendingOtp({
            challengeId: res.challengeId,
            phoneE164: res.phoneE164,
            purpose: 'register',
          });
        });
      },
      verifyOtp: async (code) => {
        return run(async () => {
          if (!pendingOtp) throw new Error('No OTP challenge in progress');
          if (api === liveApi) {
            const res = await liveApi.verifyOtp(pendingOtp.challengeId, code);
            setPendingOtp(null);
            if (res.purpose === 'register') {
              await tokenStorage.clear();
              return 'register';
            }
            const data = await liveApi.getDashboard();
            setDashboard(data);
            setAuthenticated(true);
            return res.purpose;
          }
          const res = await demoApi.verifyOtp(pendingOtp.challengeId, code);
          setPendingOtp(null);
          if (res.purpose === 'login' && res.tokens) {
            await tokenStorage.save(res.tokens.accessToken, res.tokens.refreshToken);
            const data = await demoApi.getDashboard();
            setDashboard(data);
            setAuthenticated(true);
          }
          if (res.purpose === 'phone_change') {
            const data = await demoApi.getDashboard();
            setDashboard(data);
          }
          return res.purpose;
        });
      },
      resendOtp: async () => {
        await run(async () => {
          if (!pendingOtp) throw new Error('No OTP challenge in progress');
          const res = await api.resendOtp(pendingOtp.challengeId);
          if ('challengeId' in res && res.challengeId) {
            setPendingOtp({ ...pendingOtp, challengeId: res.challengeId });
          }
        });
      },
      logout: async () => {
        await run(async () => {
          await api.logout();
          await tokenStorage.clear();
          setAuthenticated(false);
          setDashboard(null);
          setVisits([]);
          setNotifications([]);
        });
      },
      refreshDashboard: async () => {
        await run(async () => {
          setDashboard(await api.getDashboard());
        });
      },
      joinQueue: async (input) => {
        await run(async () => {
          setDashboard(await api.joinQueue(input));
        });
      },
      leaveQueue: async () => {
        await run(async () => {
          setDashboard(await api.leaveQueue());
        });
      },
      loadVisits: async () => {
        await run(async () => {
          setVisits(await api.getVisits());
        });
      },
      loadNotifications: async () => {
        await run(async () => {
          setNotifications(await api.getNotifications());
        });
      },
      markNotificationsRead: async () => {
        await run(async () => {
          await api.markNotificationsRead();
          setDashboard(await api.getDashboard());
          setNotifications(await api.getNotifications());
        });
      },
      updateProfile: async (input) => {
        await run(async () => {
          await api.updateProfile(input);
          setDashboard(await api.getDashboard());
        });
      },
      requestPhoneChange: async (newPhoneLocal) => {
        await run(async () => {
          const res = await api.requestPhoneChange(newPhoneLocal);
          setPendingOtp({
            challengeId: res.challengeId,
            phoneE164: res.phoneE164 ?? '',
            purpose: 'phone_change',
          });
        });
      },
      getCheckIn: () => api.getCheckIn(),
      refreshCheckIn: () => api.refreshCheckIn(),
    }),
    [
      api,
      authenticated,
      booting,
      busy,
      dashboard,
      error,
      notifications,
      pendingOtp,
      run,
      usingDemo,
      visits,
    ],
  );

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within PatientProvider');
  return ctx;
}
