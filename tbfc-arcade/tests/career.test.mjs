import test from 'node:test'
import assert from 'node:assert/strict'
import {createCareer,finishRound,nextWeek,bookRound,opponent,table,otherLeagueTable,simulateMatch,outcome,scoreboardAt,seasonName,calendarTime} from '../src/careerSeason.ts'
import {careerClubNames,careerClubStars,startingClubDivisions} from '../src/careerLeague.ts'
const roster='Meghan Pam Jan Mandy Jeremy Chris Sean Stubbs José Steven Daniel Nelson Nadia'.split(' ')
const women=new Set(['Meghan','Pam','Jan','Mandy','Nadia'])
test('New careers seed six-team divisions by rating with stable variation',()=>{
 for(const division of ['beginners','d6','d5']){
  const seen=new Set()
  for(let seed=1;seed<=40;seed++){
   const c=createCareer('Sean',division,seed,roster,women,6,true,true)
   assert.equal(c.leagueClubs.length,6)
   assert.equal(new Set(c.leagueClubs).size,6)
   assert.equal(c.leagueClubs[0],0)
   assert.ok(c.leagueClubs.slice(1).every(index=>c.clubDivisions[careerClubNames[index]]===division))
   assert.equal(Object.keys(c.clubDivisions).length,careerClubNames.length-1)
   assert.equal(Object.values(c.clubDivisions).filter(tier=>tier===division).length,5)
   assert.equal(Object.values(c.otherLeagues).reduce((n,league)=>n+league.clubs.length,0),careerClubNames.length-6)
   assert.ok(Object.values(c.otherLeagues).every(league=>league.clubs.length<=6))
   assert.deepEqual(createCareer('Sean',division,seed,roster,women,6,true,true).clubDivisions,c.clubDivisions)
   seen.add(c.leagueClubs.slice(1).join(','))
  }
  assert.ok(seen.size>1)
 }
 for(let i=1;i<careerClubNames.length;i++)assert.equal(startingClubDivisions[careerClubNames[i]],careerClubStars[i]<=3?'beginners':careerClubStars[i]<=4?'d6':'d5')
})
test('Six-team career has six league weeks and two top-four playoff weeks',()=>{
 for(const mode of ['champion','stay','bottom','random']){
  const c=createCareer('Sean','d6',123,roster,women,6,true,true)
  for(let season=0;season<5;season++){
   assert.equal(new Set(c.schedule.slice(0,6).map((_,i)=>opponent({...c,round:i}))).size,5)
   for(let week=0;week<8;week++){
    const stars=c.leagueClubs.map(index=>careerClubStars[index])
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
    if(week===5){
     const topFour=new Set(table(c,6).slice(0,4).map(row=>row.club))
     assert.ok(c.schedule[6].slice(0,2).every(game=>topFour.has(game.a)&&topFour.has(game.b)))
     assert.equal(c.schedule[6].length,3)
    }
    if(c.otherLeagues.beginners&&week<6)assert.ok(otherLeagueTable(c.otherLeagues.beginners).some(row=>row.p>0))
    assert.throws(()=>finishRound(c,r,stars))
    for(const g of live)assert.deepEqual(scoreboardAt(g,1500).score,g.score)
    assert.ok(table(c).every(r=>r.p===Math.min(6,week+1)))
    if(week===7){
     const before=structuredClone(c)
     const place=c.schedule[7].flatMap(outcome).indexOf(0)+1
     nextWeek(c,roster,women,mode!=='stay')
     const last=c.history.at(-1)
     if(place===1&&before.division!=='d5'){
      assert.equal(last.promotedClub,mode==='stay'?outcome(before.schedule[7][0])[1]:0)
      assert.equal(last.relegatedClub,before.division==='beginners'?undefined:outcome(before.schedule[7].at(-1))[1])
      if(mode==='stay'&&season===0)assert.equal(c.clubDivisions[careerClubNames[before.leagueClubs[last.promotedClub]]],'d5')
     }
     if(before.otherLeagues?.beginners?.schedule[7]?.[0]&&before.division!=='beginners'){
      const winner=outcome(before.otherLeagues.beginners.schedule[7][0])[0]
      assert.equal(c.clubDivisions[careerClubNames[winner]],'d6')
     }
     assert.equal(c.leagueClubs.length,6)
     assert.equal(new Set(c.leagueClubs).size,6)
     assert.ok(['beginners','d6','d5'].includes(c.clubDivisions['Barely United']))
     if(mode==='bottom')assert.ok(place>=5)
     if(mode==='champion')assert.equal(c.division,'d5')
     if(mode==='stay')assert.equal(c.division,'d6')
     assert.equal(calendarTime(c,5)-calendarTime(before,5),14*86400000)
     assert.equal(calendarTime(c)-calendarTime(before,5),86400000)
    }else nextWeek(c,roster,women)
   }
  }
  assert.equal(c.history.length,5);assert.equal(seasonName(5),'Spring 2028')
 }
})
