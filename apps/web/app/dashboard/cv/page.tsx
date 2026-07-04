"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface Profile {
  bio: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  location: string;
  skills: string[];
  interests: string[];
  education: { institution: string; degree: string; field: string; startDate: string; endDate: string; description: string }[];
  experience: { company: string; position: string; startDate: string; endDate: string; description: string; current: boolean }[];
  languages: { name: string; level: string }[];
  certifications: { name: string; issuer: string; date: string; url: string }[];
  projects: { name: string; description: string; url: string; technologies: string }[];
}

export default function CVPage() {
  const router = useRouter();
  const cvRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) { router.push("/auth/login"); return; }
    setUser(JSON.parse(storedUser));
    fetchProfile(token);
  }, [router]);

  async function fetchProfile(token: string) {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile({
            bio: data.profile.bio || "",
            phone: data.profile.phone || "",
            website: data.profile.website || "",
            linkedin: data.profile.linkedin || "",
            github: data.profile.github || "",
            location: data.profile.location || "",
            skills: data.profile.skills || [],
            interests: data.profile.interests || [],
            education: data.profile.education || [],
            experience: data.profile.experience || [],
            languages: data.profile.languages || [],
            certifications: data.profile.certifications || [],
            projects: data.profile.projects || [],
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  if (!user) return null;

  const hasContent = profile && (
    profile.bio || profile.phone || profile.location || profile.skills.length > 0 ||
    profile.education.length > 0 || profile.experience.length > 0 || profile.languages.length > 0
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My CV</h1>
          <p className="mt-2 text-muted">Preview and download your professional CV</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/profile" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50">
            Edit Profile
          </Link>
          <button onClick={handlePrint} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover">
            Download PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !hasContent ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-foreground">No Profile Data Yet</h2>
          <p className="mt-2 text-muted">Fill in your profile details to generate a professional CV.</p>
          <Link href="/dashboard/profile" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover">
            Fill in Profile →
          </Link>
        </div>
      ) : (
        <>
          {/* CV Preview */}
          <div ref={cvRef} className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="p-8 sm:p-10">
              {/* Header */}
              <div className="border-b-2 border-primary pb-6 mb-6">
                <h1 className="text-3xl font-bold text-foreground">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                  {profile.location && <span>📍 {profile.location}</span>}
                  {profile.phone && <span>📞 {profile.phone}</span>}
                  {user.email && <span>✉️ {user.email}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                  {profile.website && <span>🌐 {profile.website}</span>}
                  {profile.linkedin && <span>💼 {profile.linkedin}</span>}
                  {profile.github && <span>💻 {profile.github}</span>}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide border-b border-border pb-1 mb-3">Profile</h2>
                  <p className="text-sm text-muted leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Skills */}
              {profile.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide border-b border-border pb-1 mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {profile.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide border-b border-border pb-1 mb-3">Work Experience</h2>
                  <div className="space-y-4">
                    {profile.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{exp.position}</h3>
                            <p className="text-sm text-primary">{exp.company}</p>
                          </div>
                          <span className="text-xs text-muted whitespace-nowrap">
                            {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                        {exp.description && <p className="mt-2 text-sm text-muted">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile.education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide border-b border-border pb-1 mb-3">Education</h2>
                  <div className="space-y-4">
                    {profile.education.map((edu, i) => (
                      <div key={i}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{edu.degree} in {edu.field}</h3>
                            <p className="text-sm text-primary">{edu.institution}</p>
                          </div>
                          <span className="text-xs text-muted whitespace-nowrap">
                            {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                          </span>
                        </div>
                        {edu.description && <p className="mt-2 text-sm text-muted">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide border-b border-border pb-1 mb-3">Languages</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {profile.languages.map((lang, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">{lang.name}</span>
                        <span className="text-muted capitalize">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profile.interests.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide border-b border-border pb-1 mb-3">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span key={interest} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{interest}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Print styles */}
          <style jsx global>{`
            @media print {
              body * { visibility: hidden; }
              [data-print="cv"], [data-print="cv"] * { visibility: visible; }
              [data-print="cv"] { position: absolute; left: 0; top: 0; width: 100%; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
