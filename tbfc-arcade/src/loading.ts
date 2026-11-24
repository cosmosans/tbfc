import markup from './loading.html?raw'
import catalog from './spriteCatalogData.json'

const sheets = import.meta.glob<string>('./art/*-run.png', { eager: true, query: '?url', import: 'default' })
const burners = catalog.teams.find(team => team.name === 'Turf Burners FC')!.players
const runners = burners.flatMap(player => {
 const file = player.animations.Run?.file
 const dimensions = file && catalog.dimensions[file as keyof typeof catalog.dimensions]
 const url = file && sheets[`./art/${file}`]
 return url && dimensions && dimensions.rows === 8 ? [{ name: player.name, url, ...dimensions }] : []
})
const loadingTemplate = document.createElement('template')
loadingTemplate.innerHTML = markup

export function loadingScreen() {
 const view = loadingTemplate.content.cloneNode(true) as DocumentFragment
 const runner = runners[Math.floor(Math.random() * runners.length)]
 const sprite = view.querySelector<HTMLElement>('.menu-loading-runner')!
 // Direction rows run clockwise from South; row 1 is South East.
 sprite.dataset.player = runner.name
 sprite.style.backgroundImage = `url("${runner.url}")`
 sprite.style.setProperty('--run-columns', String(runner.columns))
 sprite.style.setProperty('--run-rows', String(runner.rows))
 sprite.style.setProperty('--run-duration', `${runner.columns * .1}s`)
 return view
}
