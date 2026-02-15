import { RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Timeline from '@/pages/Timeline';
import Gallery from '@/pages/Gallery';
import WhyStan from '@/pages/WhyStan';
import Community from '@/pages/Community';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Admin from '@/pages/Admin';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'timeline', element: <Timeline /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'why-stan', element: <WhyStan /> },
      { path: 'community', element: <Community /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'admin', element: <Admin /> },
    ],
  },
];
