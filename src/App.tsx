/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ConversationalAgent, { ConversationMessage } from './components/ConversationalAgent';
import NimbusSovereignStudio from './components/NimbusSovereignStudio';

// Firebase
import { auth, loginWithGoogle, logout, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Initial seeded Day-1 IQ, Memories & Domain Claims
import { INITIAL_MEMORIES, INITIAL_IQ_ASSETS, INITIAL_CLAIMS } from './data';
import { MemoryRecord, AgentIQAsset, Claim } from './types';

const LOCAL_MESSAGES_KEY = 'nimbus_iq_conversation_v1';
const LOCAL_MEMORIES_KEY = 'nimbus_iq_memories_v1';
const LOCAL_IQ_ASSETS_KEY = 'nimbus_iq_assets_v1';
const LOCAL_MODE_KEY = 'nimbus_iq_surface_mode_v1';

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mergeDayOneMemories(saved: MemoryRecord[]): MemoryRecord[] {
  const existingKeys = new Set(saved.map((m) => m.key));
  const missingDefaults = INITIAL_MEMORIES.filter((m) => !existingKeys.has(m.key));
  return [...missingDefaults, ...saved].slice(0, 450);
}

function mergeDayOneIQAssets(saved: AgentIQAsset[]): AgentIQAsset[] {
  const existingIds = new Set(saved.map((a) => a.id));
  const missingDefaults = INITIAL_IQ_ASSETS.filter((a) => !existingIds.has(a.id));
  return [...missingDefaults, ...saved].slice(0, 180);
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [surfaceMode, setSurfaceMode] = useState<'studio' | 'conversational'>(() =>
    loadLocal<'studio' | 'conversational'>(LOCAL_MODE_KEY, 'studio')
  );

  const [messages, setMessages] = useState<ConversationMessage[]>(() =>
    loadLocal<ConversationMessage[]>(LOCAL_MESSAGES_KEY, [])
  );

  const [memoriesList, setMemoriesList] = useState<MemoryRecord[]>(() =>
    mergeDayOneMemories(loadLocal<MemoryRecord[]>(LOCAL_MEMORIES_KEY, INITIAL_MEMORIES))
  );

  const [iqAssetsList, setIqAssetsList] = useState<AgentIQAsset[]>(() =>
    mergeDayOneIQAssets(loadLocal<AgentIQAsset[]>(LOCAL_IQ_ASSETS_KEY, INITIAL_IQ_ASSETS))
  );

  const [claimsList, setClaimsList] = useState<Claim[]>(INITIAL_CLAIMS);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_MODE_KEY, JSON.stringify(surfaceMode));
    } catch {}
  }, [surfaceMode]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_MEMORIES_KEY, JSON.stringify(memoriesList));
    } catch {}
  }, [memoriesList]);

  useEffect(() => {
    try {
      const safeAssets = iqAssetsList.map((a) =>
        a.imageDataUrl && a.imageDataUrl.length > 180000 ? { ...a, imageDataUrl: undefined } : a
      );
      localStorage.setItem(LOCAL_IQ_ASSETS_KEY, JSON.stringify(safeAssets));
    } catch {}
  }, [iqAssetsList]);

  // Firestore Cloud Sync when authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) return;

      const userPath = `users/${user.uid}`;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.claims)) setClaimsList(data.claims.slice(0, 500));
          if (Array.isArray(data.memories)) {
            setMemoriesList(mergeDayOneMemories(data.memories));
          }
          if (Array.isArray(data.iqAssets)) {
            setIqAssetsList(mergeDayOneIQAssets(data.iqAssets));
          }
          if (Array.isArray(data.conversationHistory) && data.conversationHistory.length > 0) {
            setMessages(data.conversationHistory);
          }
        } else {
          const isOwnerEmail = user.email?.toLowerCase() === 'dustin@nimbusiq.ai';
          const initialRole = isOwnerEmail ? 'Owner' : 'Operator';
          await setDoc(
            userDocRef,
            {
              uid: user.uid,
              email: user.email || '',
              displayName: (user.displayName || '').slice(0, 120),
              role: initialRole,
              permissions: [
                'repository.read',
                'repository.patch',
                'sandbox.execute',
                'deployment.request',
                'task.run',
                'tool.execute',
                'logs.read',
              ],
              claims: INITIAL_CLAIMS.slice(0, 500),
              memories: memoriesList.slice(0, 450),
              iqAssets: iqAssetsList.slice(0, 180).map(({ imageDataUrl, ...rest }) => rest),
              conversationHistory: messages.slice(-30).map(({ attachments, ...rest }) => rest),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, userPath);
        } catch (structuredErr) {
          console.error(structuredErr);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const syncToFirestore = async (patch: Record<string, any>) => {
    if (!currentUser) return;
    const userPath = `users/${currentUser.uid}`;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(
        userDocRef,
        {
          ...patch,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, userPath);
      } catch (structuredErr) {
        console.error(structuredErr);
      }
    }
  };

  const handleUpdateMessages = (next: ConversationMessage[]) => {
    setMessages(next);
    const firestoreSafe = next.slice(-30).map(({ attachments, ...rest }) => rest);
    syncToFirestore({ conversationHistory: firestoreSafe });
  };

  const handleAddMemory = (newMem: MemoryRecord) => {
    setMemoriesList((prev) => {
      const updated = [newMem, ...prev].slice(0, 450);
      syncToFirestore({ memories: updated });
      return updated;
    });
  };

  const handleDeleteMemory = (memId: string) => {
    setMemoriesList((prev) => {
      const updated = prev.filter((m) => m.id !== memId);
      syncToFirestore({ memories: updated });
      return updated;
    });
  };

  const handleAddIQAsset = (asset: AgentIQAsset) => {
    setIqAssetsList((prev) => {
      const updated = [asset, ...prev].slice(0, 180);
      const firestoreSafe = updated.map(({ imageDataUrl, ...rest }) => rest);
      syncToFirestore({ iqAssets: firestoreSafe });
      return updated;
    });
  };

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (surfaceMode === 'conversational') {
    return (
      <ConversationalAgent
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        memories={memoriesList}
        iqAssets={iqAssetsList}
        claims={claimsList}
        messages={messages}
        onUpdateMessages={handleUpdateMessages}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        onAddIQAsset={handleAddIQAsset}
        onSwitchToStudio={() => setSurfaceMode('studio')}
      />
    );
  }

  return (
    <NimbusSovereignStudio
      currentUser={currentUser}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
      memories={memoriesList}
      onAddMemory={handleAddMemory}
      onSwitchToConversational={() => setSurfaceMode('conversational')}
    />
  );
}
