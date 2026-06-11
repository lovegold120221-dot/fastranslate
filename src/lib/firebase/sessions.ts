import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface SessionRecord {
  id: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string;
  createdAt: number;
  participantCount: number;
  active: boolean;
}

const SESSIONS = "sessions";

export async function createSession(params: {
  sessionId: string;
  userId: string;
  userName: string;
  userAvatar: string;
}) {
  const ref = doc(db, SESSIONS, params.sessionId);
  await setDoc(ref, {
    createdBy: params.userId,
    creatorName: params.userName,
    creatorAvatar: params.userAvatar,
    createdAt: Timestamp.now(),
    participantCount: 1,
    active: true,
  });
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const snap = await getDoc(doc(db, SESSIONS, id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    createdBy: d.createdBy,
    creatorName: d.creatorName,
    creatorAvatar: d.creatorAvatar,
    createdAt: d.createdAt?.toMillis?.() ?? d.createdAt,
    participantCount: d.participantCount ?? 0,
    active: d.active ?? true,
  };
}

export async function listRecentSessions(
  uid: string,
  max = 10,
): Promise<SessionRecord[]> {
  const q = query(
    collection(db, SESSIONS),
    where("createdBy", "==", uid),
    orderBy("createdAt", "desc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      createdBy: data.createdBy,
      creatorName: data.creatorName,
      creatorAvatar: data.creatorAvatar,
      createdAt: data.createdAt?.toMillis?.() ?? data.createdAt,
      participantCount: data.participantCount ?? 0,
      active: data.active ?? true,
    };
  });
}
