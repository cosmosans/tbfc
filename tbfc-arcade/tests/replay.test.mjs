import test from 'node:test'
import assert from 'node:assert/strict'
import * as T from 'three'
import { GoalReplay } from '../src/replay.ts'

function setup(height, face, rows = 8) {
 const kick = new T.Texture({width: height / rows * 9, height})
 kick.repeat.set(1 / 9, 1 / rows)
 kick.offset.set(3 / 9, (rows - 1 - (rows === 8 ? face : 0)) / rows)
 const idle = new T.Texture({width: 384, height: 48})
 idle.repeat.set(1 / 8, 1)
 const actor = {face, drawFace: face, maps: [idle, new T.Texture(), kick], westKickRow: 3}
 const sprite = new T.Sprite(new T.SpriteMaterial({map: kick}))
 const ball = new T.Sprite(new T.SpriteMaterial({map: new T.Texture()}))
 const replay = new GoalReplay([sprite, ball], ball, [actor], 30)
 replay.record(.04, 0)
 return {replay, sprite, actor, kick, idle}
}

test('scorer camera keeps kicks facing the goal at every supported sprite size', () => {
 for (const height of [384, 480, 512, 544, 576, 608, 640]) {
  for (const direction of [1, -1]) {
   const face = direction === 1 ? 2 : 6
   const {replay, kick} = setup(height, face)
   replay.drawAngle(1, .04, 16 / 9, direction, () => {})
   // The camera is behind the striker: use the North/back-facing kick row.
   assert.equal(kick.offset.y, 3 / 8, `height ${height}, attack ${direction}`)
   assert.equal(kick.offset.x, 3 / 9, 'preserve the recorded kick frame')
  }
 }
})

test('camera-relative kick direction matches running direction for every world facing', () => {
 for (const direction of [1, -1]) {
  for (const face of [0, 1, 2, 3, 4, 5, 6, 7]) {
   for (const cut of [0, 1, 2]) {
    const {replay, kick, actor, sprite} = setup(480, face)
    replay.drawAngle(cut, .04, 16 / 9, direction, () => {})
    const kickRow = kick.offset.y
    const run = actor.maps[1]
    run.repeat.set(1 / 8, 1 / 8)
    sprite.material.map = run
    replay.record(.04, 0)
    replay.drawAngle(cut, .08, 16 / 9, direction, () => {})
    assert.equal(kickRow, run.offset.y, `camera ${cut}, facing ${face}, attack ${direction}`)
   }
  }
 }
})

test('anticipated kick uses its own shot facing instead of the earlier running pose', () => {
 const {replay, sprite, actor, kick, idle} = setup(480, 2)
 replay.clear()
 sprite.material.map = idle
 actor.face = actor.drawFace = 0
 replay.record(.04, 0)
 replay.markStrike(sprite, sprite.position)
 sprite.material.map = kick
 actor.face = actor.drawFace = 2
 replay.record(.16, 0)
 replay.drawAngle(1, .04, 16 / 9, 1, () => {})
 assert.equal(sprite.material.map, kick)
 assert.equal(kick.offset.y, 3 / 8)
})

test('legacy side-only kicks keep their side-row mapping', () => {
 const {replay, kick} = setup(192, 1, 4)
 replay.drawAngle(1, .04, 16 / 9, 1, () => {})
 assert.equal(kick.offset.y, 3 / 4)
})
