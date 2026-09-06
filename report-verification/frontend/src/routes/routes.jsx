import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes';

import RootLayout  from '../components/layout/RootLayout';
import UserLayout  from '../components/layout/UserLayout';
import AdminLayout from '../components/layout/AdminLayout';


import Login      from '../pages/user/Login';
import Register   from '../pages/user/Register';

import UserDashboard     from '../pages/user/Dashboard';
import MyComplaints      from '../pages/user/MyComplaints';
import SubmitComplaint   from '../pages/user/SubmitComplaint';
import ComplaintTracking from '../pages/user/ComplaintTracking';

import AdminDashboard      from '../pages/admin/AdminDashboard';
import ComplaintManagement from '../pages/admin/ComplaintManagement';
import ComplaintAction     from '../pages/admin/ComplaintAction';
import Hero from '../pages/shared/Hero';
import Profile from '../pages/shared/Profile';

const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Hero /> },
      { path: 'login',    element: <Login /> },
      { path: 'register', element: <Register /> },

      {
        element: (
          <ProtectedRoute requiredRole="user">
            <UserLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard',        element: <UserDashboard /> },
          { path: 'my-complaints',    element: <MyComplaints /> },
          { path: 'submit-complaint', element: <SubmitComplaint /> },
          { path: 'complaints/:id',   element: <ComplaintTracking /> },
          { path: 'profile', element: <Profile /> },
        ],
      },

      {
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'admin/dashboard',      element: <AdminDashboard /> },
          { path: 'admin/complaints',     element: <ComplaintManagement /> },
          { path: 'admin/complaints/:id', element: <ComplaintAction /> },
          { path: 'admin/profile', element: <Profile /> },
        ],
      },

      // { index: true, element: <Navigate to="/login" replace /> },
      { path: '*',   element: <Navigate to="/login" replace /> },
    ],
  },
];

export default routes;