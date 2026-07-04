"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function BookmarksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string>("ALL");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const folders = [
    { key: "ALL", label: "All" },
    { key: "DEFAULT", label: "Saved" },
    { key: "INTERESTED", label: "Interested" },
    { key: "APPLIED", label: "Applied" },
    { key: "SAVED_LATER", label: "Later" },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) { router.push("/auth/login"); return; }
    setUser(JSON.parse(storedUser));
    fetchBookmarks(token);
  }, [router]);

  async function fetchBookmarks(token: string) {
    try {
      const response = await fetch(`${API_URL}/bookmarks?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeBookmark(id: string) {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/bookmarks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  }

  async function updateNotes(id: string) {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/bookmarks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: noteText }),
      });
      setBookmarks(bookmarks.map((b) => b.id === id ? { ...b, notes: noteText } : b));
      setEditingNotes(null);
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  }

  async function moveToFolder(id: string, folder: string) {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/bookmarks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folder }),
      });
      setBookmarks(bookmarks.map((b) => b.id === id ? { ...b, folder } : b));
    } catch (error) {
      console.error("Failed to move bookmark:", error);
    }
  }

  const filtered = activeFolder === "ALL" ? bookmarks : bookmarks.filter((b) => b.folder === activeFolder);

  function getTypeIcon(type: string) {
    const icons: Record<string, string> = { JOB: "💼", SCHOLARSHIP: "📚", INTERNSHIP: "🎓", GRANT: "💰", TRAINING: "⚙️", VOLUNTEER: "🤝", REMOTE_WORK: "🌍" };
    return icons[type] || "📋";
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Bookmarks</h1>
        <p className="mt-2 text-muted">Organize and track opportunities you&apos;re interested in</p>
      </div>

      {/* Folder Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {folders.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFolder(f.key)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeFolder === f.key
                ? "bg-primary text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            {f.label} ({f.key === "ALL" ? bookmarks.length : bookmarks.filter((b) => b.folder === f.key).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <div className="text-4xl mb-4">🔖</div>
          <h2 className="text-xl font-semibold text-foreground">No Bookmarks Yet</h2>
          <p className="mt-2 text-muted">Browse opportunities and save the ones you like.</p>
          <Link href="/opportunities" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover">
            Browse Opportunities →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((bookmark) => (
            <div key={bookmark.id} className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTypeIcon(bookmark.opportunity.type)}</span>
                    <span className="text-xs font-medium text-muted uppercase">{bookmark.opportunity.type.replace("_", " ")}</span>
                    {bookmark.opportunity.organization?.isVerified && (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    )}
                  </div>
                  <Link href={`/opportunities/${bookmark.opportunity.id}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                    {bookmark.opportunity.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{bookmark.opportunity.organization?.name}</p>
                  {bookmark.opportunity.applicationDeadline && (
                    <p className="mt-1 text-xs text-muted">
                      Deadline: {new Date(bookmark.opportunity.applicationDeadline).toLocaleDateString()}
                    </p>
                  )}
                  {/* Notes */}
                  {editingNotes === bookmark.id ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Add a note..."
                        autoFocus
                      />
                      <button onClick={() => updateNotes(bookmark.id)} className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover">Save</button>
                      <button onClick={() => setEditingNotes(null)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-muted hover:bg-gray-200">Cancel</button>
                    </div>
                  ) : bookmark.notes ? (
                    <p
                      className="mt-2 text-sm text-muted italic cursor-pointer hover:text-foreground"
                      onClick={() => { setEditingNotes(bookmark.id); setNoteText(bookmark.notes); }}
                    >
                      📝 {bookmark.notes}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={bookmark.folder}
                    onChange={(e) => moveToFolder(bookmark.id, e.target.value)}
                    className="rounded-lg border border-border px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="DEFAULT">Saved</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SAVED_LATER">Later</option>
                  </select>
                  <button
                    onClick={() => { setEditingNotes(bookmark.id); setNoteText(bookmark.notes || ""); }}
                    className="rounded-lg p-1.5 text-muted hover:bg-gray-100"
                    title="Add note"
                  >
                    📝
                  </button>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-500"
                    title="Remove bookmark"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
