import { freePracticeRoster } from '../practiceMenu'
import { menuPad, menuDirection } from '../menuPad'
import { template, element, bind } from './templates'
import './tutorial.css'
import { readProgress, isChapterUnlocked, type TutorialLaunch } from './progress'
import chapters from './script.json'
import '../practiceMenu.css'
export type PracticeChoice = { drill: number; names: string[]; tutorial?: TutorialLaunch }
export async function practiceMenu(portraits: Record<string, string>): Promise<PracticeChoice | null> {
 const root = document.createElement('section'); root.className = 'practice-menu'; document.body.append(root)
 const progress = readProgress()
 return new Promise(resolve => {
  let page: 'home' | 'chapter' = 'home', chapter = 0, frame = 0, previousDirection = '', repeat = 0
  let held = Array.from(menuPad()?.buttons ?? [], b => b.pressed)
  history.replaceState({ ...history.state, tutorialDrills: false }, "")
  const finish = (value: PracticeChoice | null) => { cancelAnimationFrame(frame); document.removeEventListener('keydown', key); root.remove(); resolve(value) }
  const launch = (index: number, mode: TutorialLaunch['mode']) => { if (isChapterUnlocked(progress, index)) finish({ drill: -1, names: [], tutorial: { chapter: index, mode } }) }
  async function free() {
   // Free Practice opens player selection directly.
   cancelAnimationFrame(frame); document.removeEventListener('keydown', key); root.remove()
   const choice = await freePracticeRoster(portraits)
   resolve(choice ?? await practiceMenu(portraits))
  }
  function draw() {
   const view = template('practice')
   element(view, '[data-title]').textContent = page === 'home' ? 'Practice' : chapters[chapter].title
   element(view, '[data-description]').hidden = page !== 'home'
   element(view, '[data-menu-hints]').hidden = page !== 'home'
   bind(view, '[data-menu-back]', back)
   const nav = element(view, 'nav')
   nav.classList.toggle('ft-chapter-grid', page === 'home')
   nav.classList.toggle('ft-chapter-detail', page === 'chapter')
   if (page === 'home') {
    const freeChoice = template('practice-free')
    bind(freeChoice, '[data-free]', free); nav.append(freeChoice)
    chapters.forEach(c => {
     const choice = template('chapter-choice'), button = element<HTMLButtonElement>(choice, '[data-chapter]')
     element(choice, '[data-number]').textContent = `CHAPTER ${String(c.id).padStart(2,'0')}`
     element(choice, '[data-chapter-title]').textContent = c.title
     element(choice, '[data-scene]').append(template(`chapter-scene-${c.id}`))
     button.disabled = !isChapterUnlocked(progress, c.id)
     if (button.disabled) button.title = 'Reach this chapter in First Touch to unlock it'
     button.onclick = () => { if (button.disabled) return; chapter = c.id; page = 'chapter'; draw() }; nav.append(choice)
    })
   } else {
    const choices = template('practice-chapter')
    element(choices, '[data-preview]').append(template(`chapter-scene-${chapter}`))
    element(choices, '[data-chapter-description]').textContent = chapters[chapter].description
    bind(choices, '[data-story]', () => launch(chapter,'story'))
    bind(choices, '[data-back]', back); nav.append(choices)
   }
   root.replaceChildren(view)
   root.querySelector<HTMLButtonElement>('button:enabled:not([hidden]):not([tabindex="-1"])')?.focus()
  }
  function back() { if (page === 'home') finish(null); else { page = 'home'; draw() } }
  function move(direction: string) {
   const buttons = [...root.querySelectorAll<HTMLButtonElement>('button:enabled:not([hidden]):not([tabindex="-1"])')]
   const current = document.activeElement as HTMLButtonElement
   if (!buttons.includes(current)) { buttons[0]?.focus(); return }
   const rect = current.getBoundingClientRect()
   const dx = direction === 'r' ? 1 : direction === 'l' ? -1 : 0
   const dy = direction === 'd' ? 1 : direction === 'u' ? -1 : 0
   let best = Infinity, target = current
   for (const button of buttons) {
    const r = button.getBoundingClientRect()
    const x = r.x + r.width / 2 - rect.x - rect.width / 2
    const y = r.y + r.height / 2 - rect.y - rect.height / 2
    const forward = x * dx + y * dy, cost = forward + 3 * Math.abs(x * dy - y * dx)
    if (forward > 2 && cost < best) { best = cost; target = button }
   }
   target.focus()
  }
  function key(e: KeyboardEvent) {
   if (page === 'chapter' && e.key === 'Enter') { e.preventDefault(); if (!e.repeat) launch(chapter, 'story'); return }
   if (e.key === 'Escape') { e.preventDefault(); if (!e.repeat) back() }
   const direction = ({ArrowDown:'d',ArrowUp:'u',ArrowLeft:'l',ArrowRight:'r'} as Record<string,string>)[e.key]
   if (direction) { e.preventDefault(); move(direction) }
  }
  function poll() {
   frame = requestAnimationFrame(poll)
   const pad = menuPad(), down = Array.from(pad?.buttons ?? [], b => b.pressed), direction = pad ? menuDirection(pad) : '', now = performance.now()
   if (direction && (direction !== previousDirection || now >= repeat)) { move(direction); repeat = now + (direction !== previousDirection ? 350 : 160) }
   if (down[0] && !held[0]) { if (page === 'chapter') launch(chapter, 'story'); else (document.activeElement as HTMLButtonElement)?.click() }
   if (down[1] && !held[1]) back()
   held = down; previousDirection = direction
  }
  document.addEventListener('keydown', key); draw(); poll()
 })
}
