import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useUserStore from './store/userStore.js'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CatList from './pages/CatList.jsx'
import CatDetail from './pages/CatDetail.jsx'
import CatForm from './pages/CatForm.jsx'
import BreedingList from './pages/BreedingList.jsx'
import BreedingForm from './pages/BreedingForm.jsx'
import CertificatePage from './pages/CertificatePage.jsx'
import VerifyPage from './pages/VerifyPage.jsx'
import UserList from './pages/UserList.jsx'
import PedigreeSearch from './pages/PedigreeSearch.jsx'

function App() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" replace />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/search" element={<PedigreeSearch />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cats" element={<CatList />} />
        <Route path="cats/new" element={<CatForm />} />
        <Route path="cats/:catNo" element={<CatDetail />} />
        <Route path="cats/:catNo/edit" element={<CatForm />} />
        <Route path="breedings" element={<BreedingList />} />
        <Route path="breedings/new" element={<BreedingForm />} />
        <Route path="certificates" element={<CertificatePage />} />
        <Route path="users" element={<UserList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
