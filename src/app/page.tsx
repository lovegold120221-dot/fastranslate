"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { createSession, listRecentSessions, SessionRecord } from "@/lib/firebase/sessions";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const createNewSession = useCallback(async () => {
    if (!user) return signIn();
    setCreating(true);
    const sessionId = crypto.randomUUID();
    await createSession({
      sessionId,
      userId: user.uid,
      userName: user.displayName || user.email || "Anonymous",
      userAvatar: user.photoURL || "",
    });
    router.push(`/session/${sessionId}`);
  }, [user, router, signIn]);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }
    setSessionsLoading(true);
    listRecentSessions(user.uid).then((list) => {
      setSessions(list);
      setSessionsLoading(false);
    });
  }, [user]);

  // ---- Auth loading state ----
  if (authLoading) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center" }}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  // ---- Logged out — minimal sign-in screen ----
  if (!user) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center" }}>
          <h1 className="display display-xl enter" style={{ marginBottom: 24 }}>
            <em>Orbit</em>
          </h1>
          <p className="body enter-d1" style={{ maxWidth: 340, margin: "0 auto 48px" }}>
            Multi-language video calls. Everyone picks their language.
            Translation spins up on demand.
          </p>
          <div className="enter-d2">
            <button className="btn btn-dark" onClick={signIn}>
              Sign in with Google
            </button>
          </div>
          <p className="mono enter-d4" style={{ marginTop: 48 }}>
            Powered by Eburon AI
          </p>
        </div>
      </div>
    );
  }

  // ---- Logged in — full dashboard ----
  return (
    <div className="page page-top">
      <div className="container" style={{ textAlign: "center" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <span className="mono" style={{ color: "var(--fg-secondary)" }}>
            {user.displayName || user.email}
          </span>
          <button className="btn btn-ghost" onClick={signOut}>
            Sign out
          </button>
        </div>

        {/* Title */}
        <h1 className="display display-xl enter" style={{ marginBottom: 24 }}>
          <em>Orbit</em>
        </h1>

        {/* Subtitle */}
        <p
          className="body enter-d1"
          style={{ maxWidth: 340, margin: "0 auto 48px" }}
        >
          Multi-language video calls. Everyone picks their language.
          Translation spins up on demand.
        </p>

        {/* CTA */}
        <div className="enter-d2">
          <button
            className="btn btn-dark"
            onClick={createNewSession}
            disabled={creating}
            id="create-session-btn"
          >
            {creating ? (
              <>
                <span className="spinner" /> Creating…
              </>
            ) : (
              "Create session"
            )}
          </button>
        </div>

        {/* Steps */}
        <div
          className="enter-d3"
          style={{
            marginTop: 80,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            textAlign: "left",
          }}
        >
          <hr className="rule" />
          {[
            "Pick your language and turn on your camera",
            "Share the link with everyone joining the call",
            "Each language pair spins up one Orbit session on demand",
          ].map((text, i) => (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "18px 0",
                  alignItems: "baseline",
                }}
              >
                <span className="mono" style={{ flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="body-sm" style={{ color: "var(--fg-secondary)" }}>
                  {text}
                </p>
              </div>
              <hr className="rule" />
            </div>
          ))}
        </div>

        {/* Session history */}
        {sessions.length > 0 && (
          <div style={{ marginTop: 64, textAlign: "left" }}>
            <p className="label" style={{ marginBottom: 16 }}>
              Recent sessions
            </p>
            {sessions.map((s) => (
              <button
                key={s.id}
                className="btn btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  padding: "12px 16px",
                }}
                onClick={() => router.push(`/session/${s.id}`)}
              >
                <span className="mono" style={{ fontSize: 11 }}>
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="body-sm">
                  {s.id.slice(0, 8)}…{" "}
                  {s.active ? (
                    <span className="status status--active">
                      <span className="status-dot pulse" /> live
                    </span>
                  ) : (
                    <span className="mono">ended</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        {sessionsLoading && (
          <div style={{ marginTop: 32 }}>
            <span className="spinner" />
          </div>
        )}

        {/* Footer */}
        <p className="mono enter-d4" style={{ marginTop: 48 }}>
          Powered by Eburon AI
        </p>
      </div>
    </div>
  );
}
