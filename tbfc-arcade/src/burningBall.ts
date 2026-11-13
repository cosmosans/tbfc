import * as T from 'three'

function pixelTexture(size: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  paint(canvas.getContext('2d')!)
  const texture = new T.CanvasTexture(canvas)
  texture.magFilter = texture.minFilter = T.NearestFilter
  texture.colorSpace = T.SRGBColorSpace
  return texture
}

export function createBurningBall(scene: T.Scene) {
  const frames = Array.from({ length: 6 }, (_, frame) => pixelTexture(24, ctx => {
    for (let x = 3; x <= 20; x++) {
      const envelope = Math.sin(Math.PI * (x - 2) / 20)
      const tip = Math.round(20 - envelope * (11 + 5 * Math.sin(x * .85 + frame * Math.PI / 3)))
      ctx.fillStyle = '#fa5117'
      ctx.fillRect(x, tip, 1, 21 - tip)
      ctx.fillStyle = '#ffac20'
      ctx.fillRect(x, tip + 3, 1, Math.max(0, 17 - tip))
      if (x > 6 && x < 17) {
        ctx.fillStyle = '#fff59c'
        ctx.fillRect(x, Math.round(17 - envelope * 3), 1, 5)
      }
    }
    ctx.fillStyle = '#ffb632'
    ctx.fillRect(4 + frame * 2, 4 - frame % 3, 2, 2)
  }))
  const fire = new T.Sprite(new T.SpriteMaterial({ map: frames[0], transparent: true, depthWrite: false }))
  fire.center.set(.5, .15)
  fire.scale.set(.58, .82, 1)
  fire.visible = false
  scene.add(fire)

  const soot = pixelTexture(24, ctx => {
    for (let x = 0; x < 24; x++) {
      const edge = Math.sin(Math.PI * (x + .5) / 24)
      const radius = Math.round(edge * (6 + 2 * Math.sin(x * 2.7)))
      ctx.fillStyle = '#271811'
      ctx.fillRect(x, 12 - radius, 1, 2 * radius)
      ctx.fillStyle = x % 5 === 0 ? '#b34919' : '#120e0c'
      ctx.fillRect(x, 10 + x % 4, 1, Math.ceil(edge * 3))
    }
  })
  const geometry = new T.PlaneGeometry(1, 1)
  geometry.rotateX(-Math.PI / 2)
  const marks = Array.from({ length: 96 }, () => {
    const mesh = new T.Mesh(geometry, new T.MeshBasicMaterial({ map: soot, transparent: true, depthWrite: false }))
    mesh.visible = false
    scene.add(mesh)
    return { mesh, age: 0 }
  })
  const last = new T.Vector3()
  let tracking = false, next = 0, time = 0
  function clear() {
    fire.visible = tracking = false
    for (const { mesh } of marks) mesh.visible = false
  }
  function update(position: T.Vector3, lit: boolean, onTurf: boolean, dt: number) {
    time += dt
    fire.visible = lit
    fire.position.copy(position)
    fire.material.map = frames[Math.floor(time * 14) % frames.length]
    for (const mark of marks) {
      if (!mark.mesh.visible) continue
      mark.age += dt
      mark.mesh.material.opacity = .85 * Math.min(1, Math.max(0, (10 - mark.age) / 4))
      mark.mesh.visible = mark.age < 10
    }
    if (!lit || !onTurf) { tracking = false; return }
    if (tracking) {
      const dx = position.x - last.x, dz = position.z - last.z
      const distance = Math.hypot(dx, dz)
      if (distance < .32) return
      if (distance < 2) {
        const mark = marks[next]
        next = (next + 1) % marks.length
        mark.age = 0
        mark.mesh.visible = true
        mark.mesh.material.opacity = .85
        mark.mesh.position.set(last.x + dx / 2, .021, last.z + dz / 2)
        mark.mesh.rotation.y = -Math.atan2(dz, dx)
        mark.mesh.scale.set(distance + .18, 1, .46)
      }
    }
    tracking = true
    last.copy(position)
  }
  return { clear, update }
}
