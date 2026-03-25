import { useAppContext } from "../context/AppContext.jsx";

export function useAuth() {
  const authContext = useAppContext();
  const { authState } = authContext;

  return {
    ...authState,
    signup: authContext.signup,
    verifyOtp: authContext.verifyOtp,
    resendOtp: authContext.resendOtp,
    login: authContext.login,
    logout: authContext.logout,
    forgotPassword: authContext.forgotPassword,
    resetPassword: authContext.resetPassword,
    refreshProfile: authContext.refreshProfile,
    updateProfile: authContext.updateProfile,
    fetchDashboardSummary: authContext.fetchDashboardSummary,
    updateSettings: authContext.updateSettings,
  };
}
