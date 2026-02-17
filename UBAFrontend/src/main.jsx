import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Login } from './pages/Login.jsx'
import { Services } from './pages/client/Services.jsx'
import { GestionClient } from './pages/agent/GestionClient.jsx'
import {GestionUtilisateur} from "./pages/admin/GestionUtilisateur.jsx";
import {GestionGuichet} from "./pages/admin/GestionGuichet.jsx";
import {EvaluationPerformance} from "./pages/admin/EvaluationPerformance.jsx";
import {GestionService} from "./pages/admin/GestionService.jsx";
import { NotFound } from './pages/NotFound.jsx'
import { AgentAccueil } from './pages/agent/AgentAccueil.jsx'
import AdminShell from './components/AdminShell';
import AgentShell from './components/AgentShell.jsx';
import {Dashboard} from "./pages/admin/DashboardAdmin.jsx";

const router = createBrowserRouter([
  {
    path:'/',
    element: <Services/>
  },
  {
    path:'/login',
    element : <Login/>
  },
  {
    path :'/client-portail',
    element: <Services/>
  },
  // Routes agent regroupées sous un shell parent (layout partagé)
  {
    path: '/agent',
    element: <AgentShell />,
    children: [
      { path: 'accueil', element: <AgentAccueil /> },
      { path: 'gestion-clients', element: <GestionClient /> },
    ]
  },
  // Route parent admin : admin shell garde le même layout entre enfants
  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      {path :'dashboard', element: <Dashboard/> },
      { path: 'gestion-utilisateurs', element: <GestionUtilisateur /> },
      { path: 'gestion-guichet', element: <GestionGuichet /> },
      { path: 'evaluation-performance', element: <EvaluationPerformance /> },
      { path: 'gestion-service', element: <GestionService /> },
    ]
  },
  {
    path:"*",
    element:<NotFound/>
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>,
)
