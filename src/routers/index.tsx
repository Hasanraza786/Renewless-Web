import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AuthLayout } from '../components/AuthLayout'
import { useSession } from '../store/session'
import { ChromeProvider } from '../store/chrome'
import { SessionProvider } from '../store/session'
import AddConnectorPage from '../pages/AddConnector'
import AddSubscriptionPage from '../pages/AddSubscription'
import ChangePasswordPage from '../pages/ChangePassword'
import ConnectorsPage from '../pages/Connectors'
import DashboardPage from '../pages/Dashboard'
import EditProfilePage from '../pages/EditProfile'
import EditSubscriptionPage from '../pages/EditSubscription'
import ForgotPasswordPage from '../pages/ForgotPassword'
import LandingPage from '../pages/Landing'
import LoginPage from '../pages/Login'
import NotificationsPage from '../pages/Notifications'
import OtpPage from '../pages/Otp'
import ProfilePage from '../pages/Profile'
import ResetPasswordPage from '../pages/ResetPassword'
import ReviewPage from '../pages/Review'
import SignupPage from '../pages/Signup'
import SubscriptionDetailPage from '../pages/SubscriptionDetail'
import SubscriptionsPage from '../pages/Subscriptions'

function GuestOnly() {
  const { session } = useSession()
  if (session) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function RequireAuth() {
  const { session } = useSession()
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<GuestOnly />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} handle={{ wide: true }} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/subscriptions/new" element={<AddSubscriptionPage />} />
          <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
          <Route path="/subscriptions/:id/edit" element={<EditSubscriptionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/password" element={<ChangePasswordPage />} />
          <Route path="/connectors" element={<ConnectorsPage />} />
          <Route path="/connectors/new" element={<AddConnectorPage />} />
          <Route path="/connectors/:id/review" element={<ReviewPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function Router() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <ChromeProvider>
          <AppRoutes />
        </ChromeProvider>
      </SessionProvider>
    </BrowserRouter>
  )
}
