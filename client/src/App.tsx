import React, { useEffect } from 'react';
import {
  Components,
  Home,
  Login,
  Main,
  Signup,
  User,
  Write,
  Location,
  LocationSearch,
  Detail,
} from './pages';
import { Route, Routes, Navigate } from 'react-router-dom';
import { PageLayout } from './components/PageLayout';
import './styles/App.scss';
import { useAuthContext } from './context/AuthContext';
import { ChatDetail } from './pages/ChatDetail';
import { ChatList } from './pages/ChatList';
import { WorkerProvider } from './context/WorkerContext';

function App() {
  const { isLoggedIn } = useAuthContext();

  return (
    <WorkerProvider>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/components" element={<Components />} />
          {!isLoggedIn && <Route path="/login" element={<Login />} />}
          {isLoggedIn && <Route path="/user" element={<User />} />}
          {!isLoggedIn && <Route path="/signup" element={<Signup />} />}
          {isLoggedIn && <Route path="/location" element={<Location />} />}
          {isLoggedIn && (
            <Route path="/location/search" element={<LocationSearch />} />
          )}
          <Route path="/home" element={<Home />} />
          <Route path="/item/:id" element={<Detail />} />
          <Route path="/item/write" element={<Write />} />
          <Route path="/item/edit/:id" element={<Write />} />
          <Route path="/chat/:id" element={<ChatDetail />} />
          <Route path="/chat" element={<ChatList />} />

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </PageLayout>
    </WorkerProvider>
  );
}

export default App;
