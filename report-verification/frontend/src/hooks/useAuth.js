import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
  setCredentials,
  logout,
} from '../features/auth/authSlice';
import { loginUser, loginAdmin, logoutUser } from '../features/auth/authService';

const useAuth = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const user            = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);
  const loading         = useSelector(selectAuthLoading);

  const login = async (credentials, role = 'user') => {
    try {
      const data = role === 'admin'
        ? await loginAdmin(credentials)
        : await loginUser(credentials);
      dispatch(setCredentials(data));
      toast.success('Welcome back!');
      navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
    toast.info('Logged out');
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout: handleLogout,
  };
};

export default useAuth;