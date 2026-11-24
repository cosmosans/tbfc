import dialogue from './dialogue.html?raw'
import practice from './practice.html?raw'
import { hint } from '../screenUI'
const source = document.createElement('div')
source.innerHTML = dialogue + practice
export function template(id: string): DocumentFragment {
 const node = source.querySelector<HTMLTemplateElement>(`template#${id}`)
 if (!node) throw new Error(`Missing tutorial template: ${id}`)
 const fragment = node.content.cloneNode(true) as DocumentFragment
 fragment.querySelectorAll<HTMLElement>('[data-glyph]').forEach(el => {
  const [key, pad] = el.dataset.glyph!.split('|'); el.innerHTML = hint(key, pad)
 })
 return fragment
}
export function element<T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string): T {
 const found = root.querySelector<T>(selector)
 if (!found) throw new Error(`Missing tutorial element: ${selector}`)
 return found
}
export function bind(root: ParentNode, selector: string, action: () => void) { element<HTMLButtonElement>(root, selector).onclick = action }

/** Shared chapter thumbnail and lock state for both menus. */
export function chapterCard(chapter: {id: number; title: string}, unlocked: boolean, select: () => void) {
 const choice = template('chapter-choice'), button = element<HTMLButtonElement>(choice, '[data-chapter]')
 element(choice, '[data-number]').textContent = `CHAPTER ${String(chapter.id).padStart(2, '0')}`
 element(choice, '[data-chapter-title]').textContent = chapter.title
 element(choice, '[data-scene]').append(template(`chapter-scene-${chapter.id}`))
 button.disabled = !unlocked
 if (!unlocked) button.title = 'Reach this chapter in First Touch to unlock it'
 button.onclick = () => { if (!button.disabled) select() }
 return choice
}
