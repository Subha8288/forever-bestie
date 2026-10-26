/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import './App.css';
import './LoveLetter.css';
import './BookCanvas.css';
import { createHashRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import Layout from './layout/Layout';
import Home from './pages/Home';
import LoveLetter from './pages/LoveLetter';
import OpeningAnimation from './components/OpeningAnimation';
import { PersonalizationModal } from './components/PersonalizationModal';
import { BestieSettings } from './types';
import { AuthProvider } from './context/AuthContext';

const DEFAULT_SETTINGS: BestieSettings = {
  bestieName: 'Sakshi',
  nickname: 'Kaleshi',
  senderName: 'subho',
  birthDate: '27 Oct 2027',
  targetDateTime: '2027-10-27T00:00:00',
  customGreeting: 'To my favorite Kaleshi, wishing you endless laughter, chaos, and the happiest birthday!',
  favoriteSongTitle: 'Happy Birthday',
};

export default function App() {
  const [settings, setSettings] = useState<BestieSettings>(() => {
    try {
      const saved = localStorage.getItem('bestie_bday_v7_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure Sakshi, Kaleshi, and 2027 date are prioritized
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          bestieName: parsed.bestieName || 'Sakshi',
          nickname: parsed.nickname || 'Kaleshi',
          senderName: parsed.senderName || 'subho',
          birthDate: parsed.birthDate || '27 Oct 2027',
          targetDateTime: parsed.targetDateTime || '2027-10-27T00:00:00',
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Opening Animation States
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('bestie_bday_v7_settings', JSON.stringify(settings));
    } catch {
      // Storage unavailable
    }
  }, [settings]);

  const handleSkipAnimation = () => {
    setAnimateOut(true);
    setShowContent(true);
    setLoading(false);
  };

  const handleReplayAnimation = () => {
    setLoading(true);
    setShowContent(false);
    setAnimateOut(false);

    const timer1 = setTimeout(() => setAnimateOut(true), 4600);
    const timer2 = setTimeout(() => setShowContent(true), 4800);
    const timer3 = setTimeout(() => setLoading(false), 5200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimateOut(true), 4600);
    const timer2 = setTimeout(() => setShowContent(true), 4800);
    const timer3 = setTimeout(() => setLoading(false), 5200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const router = createHashRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<Home
        bestieName={settings.bestieName}
        nickname={settings.nickname}
        senderName={settings.senderName}
        birthDate={settings.birthDate}
        targetDateTime={settings.targetDateTime}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReplayCake={handleReplayAnimation}
      />}>
        <Route
          index
          element={
            <Home
              bestieName={settings.bestieName}
              nickname={settings.nickname}
              senderName={settings.senderName}
              birthDate={settings.birthDate}
              targetDateTime={settings.targetDateTime}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onReplayCake={handleReplayAnimation}
            />
          }
        />
        <Route
          path="love-letter"
          element={
            <LoveLetter
              bestieName={settings.bestieName}
              senderName={settings.senderName}
            />
          }
        />
        <Route
          path="countdown-watch"
          element={
            <Home
              bestieName={settings.bestieName}
              nickname={settings.nickname}
              senderName={settings.senderName}
              birthDate={settings.birthDate}
              targetDateTime={settings.targetDateTime}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onReplayCake={handleReplayAnimation}
            />
          }
        />
        <Route
          path="memories-section"
          element={
            <Home
              bestieName={settings.bestieName}
              nickname={settings.nickname}
              senderName={settings.senderName}
              birthDate={settings.birthDate}
              targetDateTime={settings.targetDateTime}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onReplayCake={handleReplayAnimation}
            />
          }
        />
        <Route
          path="*"
          element={
            <Home
              bestieName={settings.bestieName}
              nickname={settings.nickname}
              senderName={settings.senderName}
              birthDate={settings.birthDate}
              targetDateTime={settings.targetDateTime}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onReplayCake={handleReplayAnimation}
            />
          }
        />
      </Route>
    )
  );

  return (
    <AuthProvider>
      {loading && (
        <OpeningAnimation
          animateOut={animateOut}
          bestieName={settings.bestieName}
          onSkip={handleSkipAnimation}
        />
      )}

      {showContent && <RouterProvider router={router} />}

      <PersonalizationModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </AuthProvider>
  );
}
