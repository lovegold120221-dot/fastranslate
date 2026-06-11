"use client";

import { useEffect, useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { PICKER_LANGUAGES } from "@/lib/languages";
import InCall from "./InCall";

const STORAGE_KEY_NAME = "lt.displayName";
const STORAGE_KEY_LANG = "lt.lang";

interface TokenResponse {
  token: string;
  serverUrl: string;
}

function PreFlightForm({
  onSubmit,
}: {
  onSubmit: (name: string, lang: string) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [lang, setLang] = useState("en");

  return (
    <div className="page">
      <div className="container" style={{ textAlign: "center" }}>
        <h1 className="display display-lg enter" style={{ marginBottom: 8 }}>
          Join the call
        </h1>
        <p className="body enter-d1" style={{ marginBottom: 32 }}>
          Pick your language — that&apos;s what you&apos;ll speak and what
          you&apos;ll hear everyone else in.
        </p>
        <div
          className="enter-d2"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <label className="label" style={{ display: "block" }}>
            Your name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Jesse"
              autoFocus
              className="select-field"
              style={{ marginTop: 8, backgroundImage: "none", paddingRight: 16 }}
              maxLength={40}
            />
          </label>
          <label className="label" style={{ display: "block" }}>
            Language
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="select-field"
              style={{ marginTop: 8 }}
            >
              {PICKER_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div
          className="enter-d3"
          style={{ display: "flex", gap: 12, flexDirection: "column" }}
        >
          <button
            className="btn btn-dark"
            onClick={() => onSubmit(displayName, lang)}
            disabled={!displayName.trim()}
          >
            Join the call
          </button>
        </div>
        <p className="mono enter-d4" style={{ marginTop: 32 }}>
          Camera and mic stay off until you turn them on.
        </p>
      </div>
    </div>
  );
}

export default function RoomClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const stableId = useId();
  const [identity, setIdentity] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [initialLang, setInitialLang] = useState<string>("en");
  const [showPreFlight, setShowPreFlight] = useState(false);

  // Hydration-safe identity: generate once on the client.
  useEffect(() => {
    setIdentity(
      `peer-${(crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)).slice(0, 8)}`,
    );
  }, [stableId]);

  // Pull name + lang chosen in the pre-flight screen.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const name = window.sessionStorage.getItem(STORAGE_KEY_NAME);
    const lang = window.sessionStorage.getItem(STORAGE_KEY_LANG);
    if (!name || !lang) {
      setShowPreFlight(true);
      return;
    }
    setDisplayName(name);
    setInitialLang(lang);
  }, []);

  function handlePreFlightSubmit(name: string, lang: string) {
    window.sessionStorage.setItem(STORAGE_KEY_NAME, name);
    window.sessionStorage.setItem(STORAGE_KEY_LANG, lang);
    setDisplayName(name);
    setInitialLang(lang);
  }

  // Mint a LiveKit token.
  useEffect(() => {
    if (!displayName || !identity) return;
    const url = `/api/token?room=${encodeURIComponent(
      sessionId,
    )}&identity=${encodeURIComponent(identity)}&name=${encodeURIComponent(displayName)}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Token request failed (${res.status})`);
        }
        return res.json() as Promise<TokenResponse>;
      })
      .then((data) => {
        setToken(data.token);
        setServerUrl(data.serverUrl);
      })
      .catch((err) => setError(err.message));
  }, [sessionId, identity, displayName]);

  function handleLeave() {
    router.push("/");
  }

  if (error) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center" }}>
          <h1 className="display display-md" style={{ marginBottom: 16 }}>
            Couldn&apos;t join the call
          </h1>
          <p className="body" style={{ marginBottom: 24 }}>
            {error}
          </p>
          <button className="btn btn-outline" onClick={() => router.push("/")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (showPreFlight) {
    return <PreFlightForm onSubmit={handlePreFlightSubmit} />;
  }

  if (!token || !serverUrl) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p className="mono">Connecting…</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      // Camera + mic default OFF (grill Q12); user opts in via the control bar.
      video={false}
      audio={false}
      connect={true}
      onDisconnected={handleLeave}
      data-lk-theme="default"
      style={{ height: "100vh", background: "var(--bg)" }}
    >
      <InCall initialLang={initialLang} onLeave={handleLeave} />
      <RoomAudioRenderer />
      {/* Browsers block audio playback until a user gesture. A listener whose
          mic stays off never triggers that gesture, so inbound translation
          audio would silently never play. StartAudio renders only while
          playback is blocked and calls room.startAudio() on click. */}
      <StartAudio
        label="🔊 Tap to enable translated audio"
        className="btn"
        style={{
          position: "fixed",
          left: "50%",
          bottom: 96,
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      />
    </LiveKitRoom>
  );
}
