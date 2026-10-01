import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  QueueWaitEstimate,
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
  completeLogin: () => void;
  resendOtp: () => Promise<void>;
  logout: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  estimateQueueWait: (input: { slot: TimeSlot; queueLength: number }) => Promise<QueueWaitEstimate>;
  joinQueue: (input: { reason: VisitReason; slot: TimeSlot; notes?: string }) => Promise<void>;
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
  const runningRequests = useRef(0);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    runningRequests.current += 1;
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setError(message);
      throw e;
    } finally {
      runningRequests.current = Math.max(0, runningRequests.current - 1);
      if (runningRequests.current === 0) setBusy(false);
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
        // Require an OTP-authenticated sign-in each time the app launches.
        await active.restoreSession(false);
        if (cancelled) return;
        setDashboard(null);
        setAuthenticated(false);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Could not initialize your session.');
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (nic: string, phoneLocal: string) => {
      await run(async () => {
        const res = await api.login(nic, phoneLocal);
        setPendingOtp({ challengeId: res.challengeId, phoneE164: res.phoneE164, purpose: 'login' });
      });
    },
    [api, run],
  );

  const register = useCallback(
    async (input: { fullName: string; nic: string; phoneLocal: string; dateOfBirth: string }) => {
      await run(async () => {
        const res = await api.register(input);
        setPendingOtp({
          challengeId: res.challengeId,
          phoneE164: res.phoneE164,
          purpose: 'register',
        });
      });
    },
    [api, run],
  );

  const verifyOtp = useCallback(
    async (code: string): Promise<AuthPurpose> =>
      run(async () => {
        if (!pendingOtp) throw new Error('No OTP challenge in progress');
        const res = await api.verifyOtp(pendingOtp.challengeId, code);
        if (res.purpose === 'register') {
          setPendingOtp(null);
          await tokenStorage.clear();
          setError(null);
          return 'register';
        }
        if (res.purpose === 'login') {
          const data = await api.getDashboard();
          setDashboard(data);
        } else if (res.purpose === 'phone_change') {
          setDashboard(await api.getDashboard());
        }
        setPendingOtp(null);
        setError(null);
        return res.purpose;
      }),
    [api, pendingOtp, run],
  );

  const completeLogin = useCallback(() => {
    setAuthenticated(true);
    setPendingOtp(null);
  }, []);

  const resendOtp = useCallback(
    async () =>
      run(async () => {
        if (!pendingOtp) throw new Error('No OTP challenge in progress');
        const res = await api.resendOtp(pendingOtp.challengeId);
        if ('challengeId' in res && res.challengeId) {
          setPendingOtp({ ...pendingOtp, challengeId: res.challengeId });
        }
      }),
    [api, pendingOtp, run],
  );

  const logout = useCallback(
    async () =>
      run(async () => {
        await api.logout();
        await tokenStorage.clear();
        setAuthenticated(false);
        setDashboard(null);
        setVisits([]);
        setNotifications([]);
      }),
    [api, run],
  );

  const refreshDashboard = useCallback(
    async () =>
      run(async () => {
        setDashboard(await api.getDashboard());
      }),
    [api, run],
  );

  const estimateQueueWait = useCallback(
    (input: { slot: TimeSlot; queueLength: number }) => api.estimateQueueWait(input),
    [api],
  );

  const joinQueue = useCallback(
    async (input: { reason: VisitReason; slot: TimeSlot; notes?: string }) =>
      run(async () => {
        setDashboard(await api.joinQueue(input));
      }),
    [api, run],
  );

  const leaveQueue = useCallback(
    async () =>
      run(async () => {
        setDashboard(await api.leaveQueue());
      }),
    [api, run],
  );

  const loadVisits = useCallback(
    async () =>
      run(async () => {
        setVisits(await api.getVisits());
      }),
    [api, run],
  );

  const loadNotifications = useCallback(
    async () =>
      run(async () => {
        setNotifications(await api.getNotifications());
      }),
    [api, run],
  );

  const markNotificationsRead = useCallback(
    async () =>
      run(async () => {
        await api.markNotificationsRead();
        setDashboard(await api.getDashboard());
        setNotifications(await api.getNotifications());
      }),
    [api, run],
  );

  const updateProfile = useCallback(
    async (
      input: Partial<Pick<PatientProfile, 'fullName' | 'dateOfBirth' | 'address' | 'avatarUrl'>>,
    ) =>
      run(async () => {
        await api.updateProfile(input);
        setDashboard(await api.getDashboard());
      }),
    [api, run],
  );

  const requestPhoneChange = useCallback(
    async (newPhoneLocal: string) =>
      run(async () => {
        const res = await api.requestPhoneChange(newPhoneLocal);
        setPendingOtp({
          challengeId: res.challengeId,
          phoneE164: res.phoneE164 ?? '',
          purpose: 'phone_change',
        });
      }),
    [api, run],
  );

  const getCheckIn = useCallback(() => api.getCheckIn(), [api]);
  const refreshCheckIn = useCallback(() => api.refreshCheckIn(), [api]);

  const clearError = useCallback(() => setError(null), []);

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
      clearError,
      setPendingOtp,
      login,
      register,
      verifyOtp,
      completeLogin,
      resendOtp,
      logout,
      refreshDashboard,
      estimateQueueWait,
      joinQueue,
      leaveQueue,
      loadVisits,
      loadNotifications,
      markNotificationsRead,
      updateProfile,
      requestPhoneChange,
      getCheckIn,
      refreshCheckIn,
    }),
    [
      authenticated,
      booting,
      busy,
      dashboard,
      error,
      notifications,
      pendingOtp,
      usingDemo,
      visits,
      clearError,
      login,
      register,
      verifyOtp,
      completeLogin,
      resendOtp,
      logout,
      refreshDashboard,
      estimateQueueWait,
      joinQueue,
      leaveQueue,
      loadVisits,
      loadNotifications,
      markNotificationsRead,
      updateProfile,
      requestPhoneChange,
      getCheckIn,
      refreshCheckIn,
    ],
  );

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within PatientProvider');
  return ctx;
}
