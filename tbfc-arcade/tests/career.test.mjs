import test from 'node:test'
import assert from 'node:assert/strict'
import {createCareer,finishRound,nextWeek,bookRound,opponent,table,simulateMatch,outcome,scoreboardAt,seasonName,calendarTime} from '../src/careerSeason.ts'
const roster='Meghan Pam Jan Mandy Jeremy Chris Sean Stubbs José Steven Daniel Nelson Nadia'.split(' ')
const women=new Set(['Meghan','Pam','Jan','Mandy','Nadia'])
const stars=[3,2.5,2,3,3,4,5,5]
test('Eight matchweeks, both brackets, optional promotion and the off-week',()=>{
 for(const mode of ['champion','stay','bottom','random']){
  const c=createCareer('Sean','d5',123,roster,women,8,true,true)
  for(let season=0;season<5;season++){
   assert.equal(new Set(c.schedule.map((_,i)=>opponent({...c,round:i}))).size,6)
   for(let week=0;week<8;week++){
    bookRound(c,stars)
    const {starters,bench}=c.week.sheet
    assert.equal(starters[6],'Sean');assert.equal(new Set([...starters,...bench]).size,11)
    assert.ok(starters.filter(n=>women.has(n)).length>=2)
    for(const n of roster){const answer=c.week.events.filter(e=>e.name===n).at(-1).answer;assert.equal(answer!=='No',[...starters,...bench].includes(n))}
    const live=c.schedule[week].filter(g=>g.a&&g.b)
    for(const round of c.schedule)for(const g of round)assert.ok([1200,1230,1250,1310].includes(g.kickoff))
    for(const g of live){
     assert.equal(scoreboardAt(g,g.kickoff-1).score,null)
     assert.equal(scoreboardAt(g,g.kickoff+25).label,'LIVE 25′')
     assert.equal(scoreboardAt(g,g.kickoff+50).label,'FINAL')
    }
    c.day=5;const r=simulateMatch(c,stars,70,['Rival'])
    if(mode!=='random')r.score=(mode==='bottom'&&week<6)?[0,5]:[5,0]
    finishRound(c,r,stars)
    assert.throws(()=>finishRound(c,r,stars))
    for(const g of live)assert.deepEqual(scoreboardAt(g,1500).score,g.score)
    assert.ok(table(c).every(r=>r.p===Math.min(6,week+1)))
    if(week===7){
     const before=structuredClone(c)
     const place=c.schedule[7].flatMap(outcome).indexOf(0)+1
     nextWeek(c,roster,women,mode!=='stay')
     if(mode==='bottom'){assert.equal(place,5);assert.equal(c.division,'d5')}
     if(mode==='champion')assert.equal(c.division,'d4')
     if(mode==='stay')assert.equal(c.division,'d5')
     assert.equal(calendarTime(c,5)-calendarTime(before,5),14*86400000)
     assert.equal(calendarTime(c)-calendarTime(before,5),86400000)
    }else nextWeek(c,roster,women)
   }
  }
  assert.equal(c.history.length,5);assert.equal(seasonName(5),'Spring 2028')
 }
})
