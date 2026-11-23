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
