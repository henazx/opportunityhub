"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

interface Language {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "native";
}

interface Profile {
  bio: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  location: string;
  skills: string[];
  interests: string[];
  education: Education[];
  experience: Experience[];
  languages: Language[];
  certifications: { name: string; issuer: string; date: string; url: string }[];
  projects: { name: string; description: string; url: string; technologies: string }[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    bio: "",
    phone: "",
    website: "",
    linkedin: "",
    github: "",
    location: "",
    skills: [],
    interests: [],
    education: [],
    experience: [],
    languages: [],
    certifications: [],
    projects: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

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

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/me/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  }

  function addEducation() {
    setProfile({
      ...profile,
      education: [...profile.education, { institution: "", degree: "", field: "", startDate: "", endDate: "", description: "" }],
    });
  }

  function removeEducation(index: number) {
    setProfile({ ...profile, education: profile.education.filter((_, i) => i !== index) });
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, education: updated });
  }

  function addExperience() {
    setProfile({
      ...profile,
      experience: [...profile.experience, { company: "", position: "", startDate: "", endDate: "", description: "", current: false }],
    });
  }

  function removeExperience(index: number) {
    setProfile({ ...profile, experience: profile.experience.filter((_, i) => i !== index) });
  }

  function updateExperience(index: number, field: keyof Experience, value: any) {
    const updated = [...profile.experience];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, experience: updated });
  }

  function addLanguage() {
    setProfile({ ...profile, languages: [...profile.languages, { name: "", level: "intermediate" }] });
  }

  function removeLanguage(index: number) {
    setProfile({ ...profile, languages: profile.languages.filter((_, i) => i !== index) });
  }

  function updateLanguage(index: number, field: keyof Language, value: string) {
    const updated = [...profile.languages];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, languages: updated });
  }

  function addSkill() {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  }

  function addInterest() {
    if (interestInput.trim() && !profile.interests.includes(interestInput.trim())) {
      setProfile({ ...profile, interests: [...profile.interests, interestInput.trim()] });
      setInterestInput("");
    }
  }

  function removeInterest(interest: string) {
    setProfile({ ...profile, interests: profile.interests.filter((i) => i !== interest) });
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="mt-2 text-muted">Fill in your details to generate a professional CV</p>
        </div>
        <Link href="/dashboard/cv" className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
          Generate CV →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Basic Info */}
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="A brief description about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+251 9XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Addis Ababa, Ethiopia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Website</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">GitHub</label>
                <input
                  type="url"
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Skills</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add a skill (e.g., JavaScript, Project Management)"
              />
              <button onClick={addSkill} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </section>

          {/* Interests */}
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Interests</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add an interest (e.g., Technology, Education)"
              />
              <button onClick={addInterest} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span key={interest} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  {interest}
                  <button onClick={() => removeInterest(interest)} className="text-blue-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Education</h2>
              <button onClick={addEducation} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gray-200">+ Add</button>
            </div>
            {profile.education.length === 0 && <p className="text-sm text-muted">No education added yet.</p>}
            <div className="space-y-4">
              {profile.education.map((edu, i) => (
                <div key={i} className="rounded-lg border border-border p-4 relative">
                  <button onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">×</button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} placeholder="Institution" className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="Degree (e.g., BSc, MSc)" className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)} placeholder="Field of Study" className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={edu.startDate} onChange={(e) => updateEducation(i, "startDate", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <input type="date" value={edu.endDate} onChange={(e) => updateEducation(i, "endDate", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <textarea value={edu.description} onChange={(e) => updateEducation(i, "description", e.target.value)} placeholder="Description (optional)" rows={2} className="sm:col-span-2 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Work Experience</h2>
              <button onClick={addExperience} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gray-200">+ Add</button>
            </div>
            {profile.experience.length === 0 && <p className="text-sm text-muted">No experience added yet.</p>}
            <div className="space-y-4">
              {profile.experience.map((exp, i) => (
                <div key={i} className="rounded-lg border border-border p-4 relative">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">×</button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Company" className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={exp.position} onChange={(e) => updateExperience(i, "position", e.target.value)} placeholder="Position" className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <input type="date" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} disabled={exp.current} className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50" />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(i, "current", e.target.checked)} className="rounded" />
                      Currently working here
                    </label>
                    <textarea value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} placeholder="Description" rows={2} className="sm:col-span-2 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Languages */}
          <section className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Languages</h2>
              <button onClick={addLanguage} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gray-200">+ Add</button>
            </div>
            {profile.languages.length === 0 && <p className="text-sm text-muted">No languages added yet.</p>}
            <div className="space-y-3">
              {profile.languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input value={lang.name} onChange={(e) => updateLanguage(i, "name", e.target.value)} placeholder="Language" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <select value={lang.level} onChange={(e) => updateLanguage(i, "level", e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="native">Native</option>
                  </select>
                  <button onClick={() => removeLanguage(i)} className="text-gray-400 hover:text-red-500">×</button>
                </div>
              ))}
            </div>
          </section>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">Profile saved successfully!</span>}
          </div>
        </div>
      )}
    </div>
  );
}
