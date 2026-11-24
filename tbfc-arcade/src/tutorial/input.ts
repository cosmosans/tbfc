type Pad = { buttons: readonly { pressed: boolean }[]; axes: readonly number[] }
export type TutorialCommand = 'options' | 'select' | 'resume' | 'advance' | 'dismiss' | 'next' | 'up' | 'down' | 'left' | 'right'
/** Edge-triggered UI commands. Gameplay still reads the original pad after UI consumption. */
export class TutorialInput {
 private held: boolean[]
 private direction = ''
 constructor(pad?: Pad) { this.held = Array.from(pad?.buttons ?? [], b => b.pressed) }
 read(pad: Pad | undefined, menu: boolean, dialogue: boolean): TutorialCommand[] {
  const down = Array.from(pad?.buttons ?? [], b => b.pressed)
  const edge = (i: number) => down[i] && !this.held[i]
  const commands: TutorialCommand[] = []
  if (edge(9)) commands.push('options')
  else if (menu) {
   const direction = down[13] || (pad?.axes[1] ?? 0) > .5 ? 'down' : down[12] || (pad?.axes[1] ?? 0) < -.5 ? 'up' : down[15] || (pad?.axes[0] ?? 0) > .5 ? 'right' : down[14] || (pad?.axes[0] ?? 0) < -.5 ? 'left' : ''
   if (direction && direction !== this.direction) commands.push(direction)
   this.direction = direction
   if (edge(0)) commands.push('select')
   else if (edge(1)) commands.push('resume')
  } else if (dialogue) {
   if (edge(0)) commands.push('advance')
   else if (edge(1)) commands.push('dismiss')
  } else if (edge(5)) commands.push('next')
  this.held = down
  return commands
 }
}
