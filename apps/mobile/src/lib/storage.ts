import { createMMKV } from "react-native-mmkv";
import type { CompositionProps } from "@/types";

const storage = createMMKV({ id: "eid-meme-maker" });

// ── Keys ─────────────────────────────────────────────────

const PROJECTS_KEY = "projects";

// ── Project type ─────────────────────────────────────────

export interface StoredProject {
  id: string;
  name: string;
  composition: CompositionProps;
  createdAt: number;
  updatedAt: number;
}

// ── Helpers ──────────────────────────────────────────────

function getProjects(): StoredProject[] {
  const raw = storage.getString(PROJECTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredProject[];
  } catch {
    return [];
  }
}

function setProjects(projects: StoredProject[]): void {
  storage.set(PROJECTS_KEY, JSON.stringify(projects));
}

// ── Public API ───────────────────────────────────────────

export function saveProject(
  name: string,
  composition: CompositionProps,
): string {
  const projects = getProjects();
  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = Date.now();
  projects.push({ id, name, composition, createdAt: now, updatedAt: now });
  setProjects(projects);
  return id;
}

export function getProject(projectId: string): StoredProject | null {
  return getProjects().find((p) => p.id === projectId) ?? null;
}

export function updateProject(
  projectId: string,
  composition: CompositionProps,
): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx !== -1) {
    projects[idx].composition = composition;
    projects[idx].updatedAt = Date.now();
    setProjects(projects);
  }
}

export function listProjects(): StoredProject[] {
  return getProjects().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteProject(projectId: string): void {
  const projects = getProjects().filter((p) => p.id !== projectId);
  setProjects(projects);
}

export function clearAllProjects(): void {
  storage.remove(PROJECTS_KEY);
}
