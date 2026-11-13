import {test} from 'node:test'
import assert from 'node:assert/strict'
import {availableUpgrades,careerRating,spendUpgrade} from '../src/careerDevelopment.ts'
test('Previously earned levels grant persistent choices only to the selected player',()=>{
 const c={xp:99,player:'Meghan'}
 assert.equal(spendUpgrade(c,'Pace',83),false)
 c.xp=305
 assert.equal(availableUpgrades(c),3)
 assert.ok(spendUpgrade(c,'Pace',83))
 assert.equal(careerRating(c,'Meghan','Pace',83),85)
 assert.equal(careerRating(c,'Pam','Pace',75),75)
 const restored=JSON.parse(JSON.stringify(c))
 assert.equal(availableUpgrades(restored),2)
 assert.ok(spendUpgrade(restored,'Pace',83))
 assert.ok(spendUpgrade(restored,'Stamina',99))
 assert.equal(careerRating(restored,'Meghan','Stamina',99),100)
 assert.equal(spendUpgrade(restored,'Passing',83),false)
 restored.xp+=100
 assert.equal(spendUpgrade(restored,'Stamina',99),false)
 assert.equal(availableUpgrades(restored),1)
})
