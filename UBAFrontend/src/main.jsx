import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Login } from './pages/Login.jsx'
import { Services } from './pages/client/Services.jsx'
import { GestionClient } from './pages/agent/GestionClient.jsx'
import {GestionUtilisateur} from "./pages/admin/GestionUtilisateur.jsx";
import {GestionGuichets} from "./pages/admin/GestionGuichet.jsx";
import {EvaluationPerformance} from "./pages/admin/EvaluationPerformance.jsx";
import {EvaluationService} from "./pages/admin/EvaluationService.jsx";
import {GestionService} from "./pages/admin/GestionService.jsx";
import { NotFound } from './pages/NotFound.jsx'
import { AgentAccueil } from './pages/agent/AgentAccueil.jsx'

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
  {
    path:'/agent/gestion-clients',
    element : <GestionClient/>
  },{
    path:'/agent/accueil',
    element:<AgentAccueil />
  },
  {
    path:'/admin/gestion-utilisateurs',
    element : <GestionUtilisateur/>
  },
  {
    path:'/admin/gestion-guichet',
    element:<GestionGuichets/>
  },
  {
    path:'/admin/evaluation-performance',
    element : <EvaluationPerformance/>
  },
  {
    path:'/admin/evaluation-service',
    element:<EvaluationService/>
  },
  {
    path:'/admin/gestion-service',
    element : <GestionService/>
  },
  {
    path:"*",
    element:<NotFound/>
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>,
)
