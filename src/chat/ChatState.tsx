import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, ListItemButton, ListItemText } from '@mui/material';
import { useReadySession } from '../auth/useReadySession';
import {
  latestDate,
  mergeMessages,
  message,
  readMarkerKey,
  readNotifications,
  unreadSentinel,
  type Message,
} from './api';
interface ChatState {
  count: number;
  accept: (row: Message) => void;
  markRead: (rows: Message[]) => void;
  reading: (value: boolean) => void;
  error: boolean;
  retry: () => void;
}
const Context = createContext<ChatState | null>(null);
export function ChatProvider({ children }: { children: ReactNode }) {
  const session = useReadySession();
  const cache = useQueryClient();
  const markerKey = readMarkerKey(session.user.id, session.assembly);
  const [started, setStarted] = useState(false);
  const [unread, setUnread] = useState<Map<string, string>>(new Map());
  const seen = useRef(new Set<string>());
  const active = useRef(false);
  const [initial] = useState(() => {
    try {
      const value = localStorage.getItem(markerKey);
      return value && Number.isFinite(Date.parse(value))
        ? value
        : unreadSentinel;
    } catch {
      return unreadSentinel;
    }
  });
  const cursor = useRef(initial);
  const readDate = useRef(initial);
  const historyKey = session.key('chatHistory');
  function inScope(row: Message) {
    return (
      row.codigoAssembleia === undefined ||
      Number(row.codigoAssembleia) === session.assembly
    );
  }
  function markRead(rows: Message[]) {
    if (!session.current()) return;
    rows.forEach((row) => seen.current.add(row._id));
    cursor.current = latestDate(cursor.current, rows);
    readDate.current = cursor.current;
    setUnread(new Map());
    try {
      localStorage.setItem(markerKey, cursor.current);
    } catch {
      /* Memory read marker remains valid. */
    }
  }
  function accept(row: Message) {
    if (!session.current() || !inScope(row)) return;
    cache.setQueryData<Message[]>(historyKey, (old) =>
      mergeMessages(old ?? [], [row]),
    );
    if (active.current) {
      markRead([row]);
      return;
    }
    if (
      !seen.current.has(row._id) &&
      Date.parse(row.data) > Date.parse(readDate.current)
    )
      setUnread((previous) => new Map(previous).set(row._id, row.data));
    seen.current.add(row._id);
  }
  const notifications = useQuery({
    queryKey: session.key('chatNotifications'),
    queryFn: ({ signal }) =>
      readNotifications(session.http, session.assembly, cursor.current, signal),
    enabled: started,
    refetchInterval: 5000,
  });
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 5000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!notifications.data || !session.current()) return;
    const rows = notifications.data.filter(inScope);
    rows.forEach(accept);
    cursor.current = latestDate(cursor.current, rows);
  }, [notifications.dataUpdatedAt]);
  useEffect(() => {
    const off = session.controller.socket?.on('newMessage', (value) => {
      const row = message(value);
      if (row) accept(row);
      void cache.invalidateQueries({ queryKey: historyKey });
    });
    const changed = (event: StorageEvent) => {
      if (
        event.key === markerKey &&
        event.newValue &&
        Number.isFinite(Date.parse(event.newValue))
      ) {
        const date = Date.parse(event.newValue);
        if (date > Date.parse(cursor.current)) cursor.current = event.newValue;
        if (date > Date.parse(readDate.current))
          readDate.current = event.newValue;
        setUnread(
          (previous) =>
            new Map(
              [...previous].filter(([, value]) => Date.parse(value) > date),
            ),
        );
      }
    };
    window.addEventListener('storage', changed);
    return () => {
      off?.();
      window.removeEventListener('storage', changed);
    };
  }, [session.controller, session.generation, markerKey]);
  return (
    <Context.Provider
      value={{
        count: unread.size,
        accept,
        markRead,
        reading: (value) => {
          active.current = value;
          if (value) markRead(cache.getQueryData<Message[]>(historyKey) ?? []);
        },
        error: notifications.isError,
        retry: () => void notifications.refetch(),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useChat() {
  const context = useContext(Context);
  if (!context) throw new Error('ChatProvider ausente.');
  return context;
}
export function ChatMenuItem({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) {
  const { count } = useChat();
  return (
    <ListItemButton
      component="a"
      href="#/chat"
      selected={selected}
      onClick={onClick}
      aria-label={count ? 'Chat ' + count : 'Chat'}
    >
      <ListItemText
        primary={
          <Badge badgeContent={count} color="error" sx={{ pr: count ? 2 : 0 }}>
            Chat
          </Badge>
        }
      />
    </ListItemButton>
  );
}
