const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const T = require('three');
const replayModule = {};
const code = ts.transpileModule(fs.readFileSync('tbfc-arcade/src/replay.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function('exports', 'require', code)(replayModule, require);
const { GoalReplay } = replayModule;

// Each custom celebration can turn while drawFace remains at its pre-goal value.
// Exercise all directions, both goals, and every replay camera using real Three objects.
for (const kind of ['directionalIdle', 'directionalRun', 'directionalCelebration', 'normalRun']) {
  for (const face of Array.from({ length: 8 }, (_, i) => i)) {
    for (const direction of [-1, 1]) {
      const idle = new T.Texture({width:384, height:48});
      const run = new T.Texture({width:384, height:384});
      const map = kind === 'normalRun' ? run : new T.Texture({width:384, height:384});
      if (kind !== 'normalRun') map.userData[kind] = true;
      map.repeat.set(1 / 8, kind === 'directionalIdle' ? 1 : 1 / 8);
      map.offset.set(3 / 8, 0);
      const sprite = new T.Sprite(new T.SpriteMaterial({map}));
      const ball = new T.Sprite(new T.SpriteMaterial({map:new T.Texture()}));
      const actor = {face, drawFace:(face + 4) % 8, maps:[idle,run], westKickRow:1};
      const replay = new GoalReplay([sprite,ball], ball, [actor], 25);
      replay.markStrike(sprite, new T.Vector3());
      replay.record(.04, 0);
      sprite.position.set(Math.sin(face * Math.PI / 4), 0, Math.cos(face * Math.PI / 4));
      replay.record(.04, 0);
      // Changes after capture must not change the recorded facing.
      actor.face = (face + 2) % 8;
      for (const cut of [0,1,2,3]) {
        replay.drawAngle(cut, .08, 16/9, direction, () => {});
        const forward = replay.camera.getWorldDirection(new T.Vector3());
        const yaw = Math.round(Math.atan2(-forward.x, -forward.z) / (Math.PI / 4));
        const recordedFace = kind === 'normalRun' ? actor.drawFace : face;
        const expected = (recordedFace - yaw + 8) % 8;
        const actual = kind === 'directionalIdle' ? Math.round(map.offset.x * 8) : Math.round((1-map.offset.y) * 8 - 1);
        assert.equal(actual, expected, `${kind}, face ${face}, goal ${direction}, camera ${cut}`);
      }
    }
  }
}
console.log('Replay facing: 256 direction/camera checks passed.');
