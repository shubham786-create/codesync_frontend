import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

export function useYjsMonaco({
  workspaceId,
  activeFileId,
  editor,
  user,
  userRole = 'editor',
  onRemoteUsersChange,
}) {
  const [synced, setSynced] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  // Store volatile callbacks & state in refs to prevent reconnect/re-render loops
  const onRemoteUsersChangeRef = useRef(onRemoteUsersChange);
  const userRef = useRef(user);
  const userRoleRef = useRef(userRole);

  useEffect(() => {
    onRemoteUsersChangeRef.current = onRemoteUsersChange;
  }, [onRemoteUsersChange]);

  useEffect(() => {
    userRef.current = user;
    userRoleRef.current = userRole;

    // Dynamically update awareness without reconnecting WebSocket
    if (providerRef.current?.awareness && user) {
      const userColor = user.avatarColor || '#6366F1';
      providerRef.current.awareness.setLocalStateField('user', {
        name: user.name || 'Developer',
        color: userColor,
        colorLight: `${userColor}33`,
        role: userRole || 'editor',
      });
    }
  }, [user, userRole]);

  useEffect(() => {
    if (!workspaceId || !activeFileId || !editor) {
      return;
    }

    setConnecting(true);
    setSynced(false);

    // 1. Create fresh Y.Doc for this active file
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // 2. Determine WebSocket URL
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
    let wsUrl;
    if (apiUrl) {
      const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
      const cleanHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      wsUrl = `${wsProtocol}//${cleanHost}/yjs`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/yjs`;
    }

    const roomName = `${workspaceId}:${activeFileId}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('codesync_token') : null;

    // 3. Connect WebsocketProvider
    const provider = new WebsocketProvider(wsUrl, roomName, ydoc, {
      connect: true,
      maxBackoffTime: 5000,
      params: token ? { token } : {},
    });
    providerRef.current = provider;

    // 4. Set Awareness user presence
    const currentUser = userRef.current;
    const currentRole = userRoleRef.current || 'editor';
    const userColor = currentUser?.avatarColor || '#6366F1';

    provider.awareness.setLocalStateField('user', {
      name: currentUser?.name || 'Developer',
      color: userColor,
      colorLight: `${userColor}33`,
      role: currentRole,
    });

    const handleAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const activeCollaborators = [];

      states.forEach((state, clientID) => {
        if (state.user) {
          activeCollaborators.push({
            clientId: clientID,
            ...state.user,
          });
        }
      });

      if (onRemoteUsersChangeRef.current) {
        onRemoteUsersChangeRef.current(activeCollaborators);
      }
    };

    provider.awareness.on('change', handleAwarenessChange);

    // 5. Safe MonacoBinding Attachment
    // Do NOT bind an empty Y.Doc immediately if the editor model already has content!
    const yText = ydoc.getText('monaco');
    let isBound = false;

    const bindEditor = () => {
      if (isBound) return;
      const model = editor.getModel();
      if (!model || model.isDisposed()) return;

      // If Yjs is currently empty but the local model already has text (from DB or starter code),
      // seed Y.Text with local text so MonacoBinding will NEVER wipe the editor with an empty string!
      if (yText.length === 0 && model.getValue().length > 0) {
        ydoc.transact(() => {
          if (yText.length === 0) {
            yText.insert(0, model.getValue());
          }
        });
      }

      bindingRef.current = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        provider.awareness
      );
      isBound = true;
    };

    // Listen to sync events from the server
    const handleSync = (isSynced) => {
      if (isSynced) {
        setSynced(true);
        setConnecting(false);
        bindEditor();
      }
    };

    provider.on('sync', handleSync);

    provider.on('status', (event) => {
      if (event.status === 'connected') {
        setConnecting(false);
      } else if (event.status === 'disconnected') {
        setSynced(false);
      }
    });

    // If already synced synchronously (e.g. cached), bind immediately
    if (provider.synced) {
      setSynced(true);
      setConnecting(false);
      bindEditor();
    }

    // Fallback: If server sync takes more than 600ms or is offline,
    // bind with existing editor content so typing is never blocked and text never disappears
    const fallbackTimer = setTimeout(() => {
      if (!isBound) {
        bindEditor();
      }
    }, 600);

    // Cleanup on activeFileId change or unmount
    return () => {
      clearTimeout(fallbackTimer);
      provider.awareness.off('change', handleAwarenessChange);
      provider.off('sync', handleSync);

      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
    };
  }, [workspaceId, activeFileId, editor]);

  return {
    synced,
    connecting,
    ydoc: ydocRef.current,
    provider: providerRef.current,
  };
}
