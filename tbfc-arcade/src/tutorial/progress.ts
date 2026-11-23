/** Versioned, local-only tutorial progress, separate from Career saves. */
export type TutorialMode = 'story' | 'skill'
export type TutorialLaunch = { chapter: number; mode: TutorialMode }
export type TutorialProgress = { version: 1; chapter: number; furthestChapter?: number; completed: boolean; demonstrated: string[] }
export const progressKey = 'tbfc-first-touch-v1'
export const chapterCount = 12
export const freshProgress = (): TutorialProgress => ({ version: 1, chapter: 0, completed: false, demonstrated: [] })
export function decodeProgress(raw: string | null): TutorialProgress {
 try {
  const value = JSON.parse(raw ?? 'null')
  if (!value || value.version !== 1) return freshProgress()
  return { version: 1, chapter: Number.isInteger(value.chapter) ? Math.max(0, Math.min(chapterCount - 1, value.chapter)) : 0,
   completed: value.completed === true,
   ...(Number.isInteger(value.furthestChapter) ? {furthestChapter: Math.max(0, Math.min(chapterCount - 1, value.furthestChapter))} : {}),
   demonstrated: Array.isArray(value.demonstrated) ? [...new Set<string>(value.demonstrated.filter((e: unknown): e is string => typeof e === 'string' && e.length < 64))] : [] }
 } catch { return freshProgress() }
}
export function isChapterUnlocked(progress: TutorialProgress, chapter: number): boolean {
 return chapter >= 0 && chapter < chapterCount && (progress.completed || chapter <= Math.max(progress.chapter, progress.furthestChapter ?? 0))
}
export function readProgress(): TutorialProgress {
 try { return decodeProgress(localStorage.getItem(progressKey)) } catch { return freshProgress() }
}
export function saveProgress(progress: TutorialProgress): boolean {
 try { localStorage.setItem(progressKey, JSON.stringify(progress)); return true } catch { return false }
}
export class TutorialProgressTracker {
 chapter: number
 readonly events: Set<string>
 readonly launch: TutorialLaunch
 readonly progress: TutorialProgress
 private persist: (p: TutorialProgress) => boolean
 constructor(launch: TutorialLaunch, progress: TutorialProgress, persist: (p: TutorialProgress) => boolean = saveProgress) {
  this.launch = launch; this.progress = progress; this.persist = persist
  this.chapter = Math.max(0, Math.min(chapterCount - 1, launch.chapter))
  this.events = new Set(progress.demonstrated)
  this.save()
 }
 storageAvailable = true
 record(event: string) {
  if (this.events.has(event)) return false
  this.events.add(event); this.save(); return true
 }
 demonstrated(events: string[]) { return events.some(e => this.events.has(e)) }
 go(chapter: number) { this.chapter = Math.max(0, Math.min(chapterCount - 1, chapter)); this.save() }
 complete() { if (this.launch.mode === 'story') { this.progress.completed = true; this.save() } }
 private save() {
  if (this.launch.mode === 'story') {
   this.progress.furthestChapter = Math.max(this.progress.furthestChapter ?? this.progress.chapter, this.chapter)
   this.progress.chapter = this.chapter
  }
  this.progress.demonstrated = [...this.events]
  this.storageAvailable = this.persist(this.progress)
 }
}
