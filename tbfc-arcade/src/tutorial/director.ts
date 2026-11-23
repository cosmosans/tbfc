import chapters from './script.json'
import crest from '../art/ground/crest.png?url'
import { menuPad } from '../menuPad'
import { TutorialInput } from './input'
import { hint } from '../screenUI'
import { TutorialProgressTracker, readProgress, type TutorialLaunch } from './progress'
import './tutorial.css'
import { template, element, bind } from './templates'

type Line = { speaker: string; text: string }
type Hooks = { pause: (on: boolean) => void; reset: () => void; exit: () => void; chapter: (index: number) => void; ready: () => boolean }
const controls: Record<string, [string, string]> = {
 move: ['WASD', 'LS'], camera: ['.', 'RS'], pass: ['J', 'A'], shot: ['K', 'B'], cross: ['X', 'X'],
 through: ['Y', 'Y'], sprint: ['Shift', 'RT'], switch: ['→', 'LB'],
}
const escape = (text: string) => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
const markup = (text: string) => escape(text).replace(/\{(\w+)\}/g, (_, key: string) => controls[key] ? hint(...controls[key]) : key)

/** Owns narrative/UI only. It never moves an actor, ball, or camera. */
export class TutorialDirector {
 readonly tracker: TutorialProgressTracker
 readonly root = document.createElement('section')
 private lines: Line[] = []
 private optional = false
 private afterDialogue: (() => void) | undefined
 private revealed = false
 private revealAt = 0
 private menuOpen = false
 private ending = false
 private finished = false
 private pendingSuccess = false
 private successShown = new Set<number>()
 private inputRouter: TutorialInput
 private idleTime = 0
 private chapterTime = 0
 private scrimmageTime = 0
 private announcedHint = false
 private status = ''
 private nextRequested = false
 private banter: Line | undefined
 private banterAt = 0
 constructor(readonly launch: TutorialLaunch, readonly portraits: Partial<Record<string, string>>, private hooks: Hooks) {
  this.tracker = new TutorialProgressTracker(launch, readProgress())
  this.inputRouter = new TutorialInput(menuPad())
  this.root.className = 'first-touch'
  this.root.setAttribute('aria-label', 'First Touch tutorial')
  document.querySelector('main')!.append(this.root)
  document.addEventListener('keydown', this.key, true)
  this.enter(this.tracker.chapter)
 }
 get chapter() { return this.tracker.chapter }
 get speaking() { return this.lines.length > 0 }
 get capturesInput() { return this.speaking || this.menuOpen || this.finished }
 get isComplete() { return this.finished }
 get isPaused() { return this.menuOpen || this.finished }
 record(event: string) {
  if (this.tracker.record(event) && this.tracker.demonstrated(chapters[this.chapter].events)) this.pendingSuccess = true
  if (this.chapter === 11 && performance.now() > this.banterAt) {
   const reaction = chapters[11].ambient.find(line => line.event === event)
   if (reaction) { this.banter = reaction; this.banterAt = performance.now() + 30000 }
  }
 }
 private enter(index: number) {
  this.nextRequested = false; this.banter = undefined
  this.tracker.go(index); this.chapterTime = 0; this.announcedHint = false; this.scrimmageTime = 0
  this.pendingSuccess = this.tracker.demonstrated(chapters[index].events)
  this.hooks.chapter(index)
  const chapter = chapters[index]
  this.say([...chapter.intro, { speaker: chapter.intro[0]?.speaker ?? 'Chris', text: chapter.prompt }, ...(chapter.afterPrompt ?? [])])
 }
 private say(lines: Line[], optional = false, after?: () => void) {
  if (!lines.length) { after?.(); return }
  this.lines = [...lines]; this.optional = optional; this.afterDialogue = after
  this.revealed = false; this.revealAt = performance.now() + 650; this.draw()
 }
 private finishReveal() {
  this.revealed = true
  // Keep the current panel mounted: rebuilding it restarts its pop-in animation.
  // The same path handles natural completion and A/Enter skipping the reveal.
  element(this.root, '[data-line]').classList.remove('ft-reveal')
  element(this.root, '[data-continue-label]').textContent = 'Continue'
 }
 advance() {
  if (this.finished) { this.hooks.exit(); return }
  if (!this.speaking) return
  if (!this.revealed) { this.finishReveal(); return }
  this.lines.shift(); this.revealed = false; this.revealAt = performance.now() + 650
  if (!this.speaking) {
   const after = this.afterDialogue; this.afterDialogue = undefined
   this.draw(); after?.()
  } else this.draw()
 }
 dismiss() { if (this.optional) { this.lines = []; this.afterDialogue = undefined; this.draw() } }
 next() {
  if (this.speaking || this.finished) return
  if (this.launch.mode === 'skill') { this.hooks.exit(); return }
  if (!this.hooks.ready()) { this.nextRequested = true; return }
  this.nextRequested = false
  if (this.chapter === chapters.length - 1) { this.end(); return }
  this.say(chapters[this.chapter].transition, false, () => this.enter(this.chapter + 1))
 }
 private end() {
  if (this.ending) return
  this.ending = true
  this.record('scrimmage')
  this.say(chapters[11].ending, false, () => {
   this.tracker.complete(); this.finished = true; this.hooks.pause(true); this.draw()
  })
 }
 options() {
  if (this.finished) return
  this.menuOpen = !this.menuOpen; this.hooks.pause(this.menuOpen); this.draw()
 }
 private resume() { this.menuOpen = false; this.hooks.pause(false); this.draw() }
 private draw() {
  this.root.replaceChildren()
  if (this.finished) {
   const view = template('completion'); element<HTMLImageElement>(view, '[data-crest]').src = crest; bind(view, '[data-exit]', () => this.hooks.exit()); this.root.append(view); return
  }
  const chapter = chapters[this.chapter], card = template('lesson')
  element(card, '[data-location]').textContent = `CANDLER PARK · ${String(this.chapter).padStart(2, '0')} / 11`
  element(card, '[data-title]').textContent = chapter.title
  const prompt = element(card, '[data-prompt]')
  if (chapter.instructions) {
   for (const text of chapter.instructions) {
    const instruction = template('instruction')
    element(instruction, '[data-instruction]').innerHTML = markup(text)
    prompt.append(instruction, document.createTextNode(' '))
   }
  } else prompt.innerHTML = markup(chapter.prompt)
  element(card, '[data-demonstrated]').hidden = !this.tracker.demonstrated(chapter.events)
  element(card, '[data-storage]').hidden = this.tracker.storageAvailable
  bind(card, '[data-options]', () => this.options())
  element(card, '[data-next]').hidden = this.speaking
  element(card, '[data-next-label]').textContent = this.launch.mode === 'skill' ? 'Return to drills' : this.chapter === 11 ? 'Finish when ready' : 'Continue when ready'
  bind(card, '[data-next]', () => this.next()); this.root.append(card)
  if (this.speaking) {
   const line = this.lines[0], panel = template('dialogue'), portrait = element(panel, '[data-portrait]')
   portrait.setAttribute('aria-label', line.speaker)
   if (this.portraits[line.speaker]) portrait.style.backgroundImage = `url("${this.portraits[line.speaker]}")`
   else portrait.textContent = line.speaker.slice(0, 1)
   element(panel, '[data-speaker]').textContent = line.speaker
   element(panel, '[data-line]').innerHTML = markup(line.text)
   element(panel, '[data-line]').classList.toggle('ft-reveal', !this.revealed)
   element(panel, '[data-continue-label]').textContent = this.revealed ? 'Continue' : 'Reveal'
   bind(panel, '[data-continue]', () => this.advance())
   element(panel, '[data-dismiss]').hidden = !this.optional
   bind(panel, '[data-dismiss]', () => this.dismiss()); this.root.append(panel)
  }
  if (this.menuOpen) {
   const panel = template('options')
   bind(panel, '[data-resume]', () => this.resume())
   bind(panel, '[data-advance]', () => { this.lines = []; this.afterDialogue = undefined; this.resume(); this.next() })
   bind(panel, '[data-hint]', () => { this.resume(); this.say(chapter.hint.length ? chapter.hint : [{ speaker: 'Jeremy', text: chapter.prompt }], true) })
   bind(panel, '[data-reset]', () => { this.hooks.reset(); this.resume() })
   const list = element(panel, '[data-chapters]')
   bind(panel, '[data-toggle-chapters]', () => { list.hidden = !list.hidden })
   for (const c of chapters) {
    const choice = template('chapter-choice'), button = element<HTMLButtonElement>(choice, '[data-chapter]')
    button.textContent = `${String(c.id).padStart(2, '0')} · ${c.title}`
    button.onclick = () => { this.resume(); this.enter(c.id) }; list.append(choice)
   }
   bind(panel, '[data-exit]', () => this.hooks.exit())
   this.root.append(panel); this.root.querySelector<HTMLButtonElement>('.ft-options button')?.focus()
  }
  this.status = `${this.tracker.demonstrated(chapter.events)}:${this.tracker.storageAvailable}`
 }
 private key = (event: KeyboardEvent) => {
  const code = event.code
  if (code === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); if (!event.repeat) this.options(); return }
  if (this.menuOpen) {
   if (['ArrowUp','ArrowDown'].includes(code)) { event.preventDefault(); this.navigate(code === 'ArrowDown' ? 1 : -1) }
   if (code === 'Enter') { event.preventDefault(); if (!event.repeat) (document.activeElement as HTMLButtonElement)?.click() }
   event.stopImmediatePropagation(); return
  }
  if (this.capturesInput && ['KeyJ','KeyE','Enter','Space','KeyK','KeyB','KeyX','KeyY','ArrowRight'].includes(code)) {
   event.preventDefault(); event.stopImmediatePropagation()
   if (!event.repeat) { if (['KeyK','KeyB'].includes(code)) this.dismiss(); else if (['KeyJ','KeyE','Enter','Space'].includes(code)) this.advance() }
  } else if (code === 'KeyN') { event.preventDefault(); event.stopImmediatePropagation(); if (!event.repeat) this.next() }
 }
 private navigate(step: number) {
  const choices = [...this.root.querySelectorAll<HTMLButtonElement>('.ft-options button')].filter(b => b.getClientRects().length)
  if (!choices.length) return
  const index = choices.indexOf(document.activeElement as HTMLButtonElement)
  choices[(index + step + choices.length) % choices.length]?.focus()
 }
 /** Called before gameplay input. Return true for the whole frame that consumes A/B. */
 input(pad: Gamepad | undefined) {
  const captured = this.capturesInput
  for (const command of this.inputRouter.read(pad, this.menuOpen, this.capturesInput)) {
   if (command === 'options') this.options()
   else if (command === 'select') (document.activeElement as HTMLButtonElement)?.click()
   else if (command === 'resume') this.resume()
   else if (command === 'advance') this.advance()
   else if (command === 'dismiss') this.dismiss()
   else if (command === 'next') this.next()
   else this.navigate(command === 'down' ? 1 : -1)
  }
  return captured || this.capturesInput
 }
 update(dt: number, naturalLull: boolean, playing: boolean) {
  if (this.menuOpen || this.finished) return
  if (this.speaking && !this.revealed && performance.now() >= this.revealAt) this.finishReveal()
  if (this.speaking) return
  if (this.nextRequested && naturalLull) { this.next(); return }
  this.chapterTime += dt
  this.idleTime = naturalLull ? this.idleTime + dt : 0
  if (this.chapter === 11 && playing) this.scrimmageTime += dt
  if (this.chapter === 11 && this.scrimmageTime >= 180 && this.idleTime > 1 && this.launch.mode === 'story') { this.end(); return }
  if (this.pendingSuccess && this.idleTime > 1.2 && !this.successShown.has(this.chapter)) {
   this.pendingSuccess = false; this.successShown.add(this.chapter)
   this.say(chapters[this.chapter].success.length ? chapters[this.chapter].success : [{ speaker: 'Jeremy', text: 'You’ve already got the hang of that. Nice!' }], true)
  } else if (this.banter && this.idleTime > 1.2) {
   const line = this.banter; this.banter = undefined; this.say([line], true)
  } else if (this.chapterTime > 60 && !this.announcedHint && !this.tracker.demonstrated(chapters[this.chapter].events)) {
   this.announcedHint = true // Hint stays opt-in; no timed interruption.
   this.root.querySelector('.ft-lesson small')!.textContent += ' · Coaching available in options'
  }
  const status = `${this.tracker.demonstrated(chapters[this.chapter].events)}:${this.tracker.storageAvailable}`
  if (status !== this.status) this.draw()
 }
}
