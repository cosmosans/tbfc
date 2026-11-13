// Each entry is one message. Specific jobs (like bringing the match ball) have one entry.
const lines=(text:string)=>text.trim().split('\n')
const pools={
 Yes:lines(`
Count me in.
See you Thursday!
I’ll bring the ball.
Got my boots in the car.
I’m good for this one.
Yep 👍
Put me down.
Cleared my evening. I’m in.
Already packed.
Save me a spot.
Wouldn’t miss it.
I swapped shifts. See you there.
I can give someone a ride if they need one.
Finally found both shin guards. In.
Bag’s by the door.
I’m free after work. Plenty of time.
See you at warmups.
I have a spare dark jersey if anyone needs it.
Been looking forward to this all week.
Made it work!
I’m there. Where are we eating after?
I’ve got the water jug this week.
Coming straight from work, boots and all.
My Thursday just opened up.
You had me at soccer.
I’ll be the one stretching very seriously for thirty seconds.
I’m bringing my left foot. Right one’s a game-time decision.
I have located the lucky socks.
I’m in. Somebody remind me which parking lot this time.
First thing on my calendar.
I can stay the whole game.
Yes from me!
All sorted on my end.
Got a ride. Good to go.
Should be there early enough to get some touches in.
I’ve been practicing my first touch against the garage.
I’ll take a shift wherever you need me.
Absolutely. Been a long week.
Boots tied, emotionally prepared.
Tell the turf I said see you soon.
`),
 Maybe:lines(`
Checking my schedule. Will confirm.
Waiting on the shift list.
Can you pencil me in for now?
Might have family in town. I’ll check.
Depends when I can get out of work.
Let me sort out a ride first.
I need to check with the sitter.
Fifty-fifty for me right now.
Hang on, I think I moved that appointment.
I’ll know after lunch.
Trying to trade shifts. Fingers crossed.
I may have double-booked myself.
My calendar says yes. My other calendar has questions.
Give me a day to figure this out.
I’m waiting for a call back.
I can probably swing it.
Tentative yes. Let me check one thing.
Need to see when my flight lands.
I’m on standby at work.
My Thursday is a group project apparently.
Could go either way. I’ll update the poll.
I’m trying to shuffle dinner around.
Depends how long the family thing runs.
Checking whether I have the car that evening.
I haven’t forgotten the poll, promise.
I’ll text when I know for sure.
Waiting on the kids’ schedule.
I think so? Don’t lock me in just yet.
`),
 No:lines(`
Working late, sorry everyone.
Out of town Thursday night.
Family dinner. Catch you next week.
Can’t get my shift covered.
No ride this week. Good luck!
I’ve got the kids that night.
Missing this one. Go Burners!
Dinner reservation won this round.
On a plane at kickoff, sadly.
We’ve got visitors staying over.
I promised I’d help somebody move.
My cousin picked matchday to get married.
Car’s in the shop. I’m out.
I have tickets I bought months ago.
Can’t juggle both things this week.
I’m watching the dog after surgery tonight.
I’ll be following the score from work.
Away camping. Score one for me.
My Thursday night got eaten by overtime.
I lost a scheduling argument with a birthday cake.
Won’t make it back in time.
Can someone send me the highlights later?
I’m on call tonight.
Family photo day. Apparently cleats aren’t formalwear.
`),
 Late:lines(`
This traffic sucks! Start without me.
GPS just added ten minutes. I’m still coming.
Wrong entrance. Coming around the other side.
Parking lot’s packed. Walking over now.
I’m catching the second bus. Save me a sub spot.
Stuck at a train crossing. Very long train.
Running behind. Don’t wait on me for kickoff.
I see the lights. Still looking for the gate.
Had to go back for my boots. Yes, both of them.
My exit is closed. Taking the scenic route apparently.
On my way from work. Might miss the whistle.
I parked at the other field. Getting my warmup in.
`)
}
type Vote={answer:keyof typeof pools,message:string}
export function varyMessages(events:Vote[],seed:number,repair=false){
 const used=new Set<string>()
 for(const vote of events){
  if(!vote.message)continue
  if(!repair||used.has(vote.message)){
   const choices=pools[vote.answer].filter(line=>!used.has(line))
   seed=(Math.imul(seed,1664525)+1013904223)>>>0
   vote.message=choices[Math.floor(seed/4294967296*choices.length)]??''
  }
  used.add(vote.message)
 }
}
