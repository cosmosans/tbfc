import test from 'node:test';
import assert from 'node:assert/strict';
const clubs = [{name:'Alpha'}, {name:'Bravo'}, {name:'Charlie'}];
let serial = 0;
async function memory(storage) {
  globalThis.localStorage = storage;
  return import('../src/teamSelectionMemory.ts?test=' + serial++);
}
function storage(initial = null) {
  let value = initial;
  return {getItem:()=>value, setItem:(_key,next)=>{value=next;}};
}
test('restores the last pair in the same home/away order after a fresh session', async () => {
  const saved = storage();
  const first = await memory(saved);
  assert.deepEqual(first.restoreTeams(clubs,[clubs[0],clubs[1]]),[clubs[0],clubs[1]]);
  first.rememberTeams(clubs[2],clubs[0]);
  const reopened = await memory(saved);
  assert.deepEqual(reopened.restoreTeams(clubs,[clubs[0],clubs[1]]),[clubs[2],clubs[0]]);
  reopened.rememberTeams(clubs[1],clubs[2]);
  assert.deepEqual(reopened.restoreTeams(clubs,[clubs[2],clubs[0]]),[clubs[1],clubs[2]]);
});
test('handles corrupt storage, missing teams, and duplicate teams', async () => {
  for (const raw of ['invalid','null','42',JSON.stringify({home:'removed',away:'removed'}),JSON.stringify({home:'Bravo',away:'Bravo'})]) {
    const api = await memory(storage(raw));
    const [home,away] = api.restoreTeams(clubs,[clubs[0],clubs[1]]);
    assert.ok(clubs.includes(home));assert.ok(clubs.includes(away));assert.notEqual(home,away);
  }
});
test('keeps session selection when persistent storage is blocked', async () => {
  const api = await memory({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});
  api.rememberTeams(clubs[2],clubs[0]);
  assert.deepEqual(api.restoreTeams(clubs,[clubs[0],clubs[1]]),[clubs[2],clubs[0]]);
});

test('a failed save cannot restore an older persisted pair over the current selection', async () => {
  const api = await memory({getItem:()=>JSON.stringify({home:'Alpha',away:'Bravo'}),setItem(){throw Error('full')}});
  api.rememberTeams(clubs[2],clubs[0]);
  assert.deepEqual(api.restoreTeams(clubs,[clubs[0],clubs[1]]),[clubs[2],clubs[0]]);
});
