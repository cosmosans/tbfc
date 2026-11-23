import type { Report } from "./careerSeason";

// Each line is stored in the existing full-time chat entry, in speaking order.
export function matchConversation(report: Report, seed: number, recent: string[] = []): string {
  function pick<T>(items: readonly T[]): T {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return items[Math.floor(seed / 4294967296 * items.length)];
  }
  // Each exchange has a fixed reply, so a change of scorer or minute cannot disguise a repeat.
  function exchange(options: string[][]) {
    let candidates = options;
    for (const chat of recent) {
      const unused = candidates.filter(pair => !chat.includes(pair[1]));
      if (!unused.length) break;
      candidates = unused;
    }
    return pick(candidates);
  }
  function talk(options: string[][]) {
    for (const line of exchange(options)) say(line);
  }
  const pool = [...new Set(report.played)];
  const cast: string[] = [];
  while (pool.length && cast.length < 5) {
    const name = pick(pool);
    cast.push(name);
    pool.splice(pool.indexOf(name), 1);
  }
  if (!cast.length) return "";
  const lines: string[] = [];
  let last = "";
  function say(text: string, speaker?: string) {
    const others = cast.filter(n => n !== last && n !== speaker);
    last = speaker ?? pick(others.length ? others : cast);
    lines.push(last + " · " + text);
  }
  function ask(name: string, question: string, reply: string) {
    const others = cast.filter(n => n !== name);
    say(question, others.length ? pick(others) : undefined);
    say(reply, name);
  }
  const [us, them] = report.score, margin = us - them;
  const score = us + "–" + them;
  const goals = [...report.goals].sort((a,b) => a.minute - b.minute);
  const end = goals.at(-1);
  if (report.pens) {
    const won = report.pens[0] > report.pens[1];
    say(won ? "Can breathe again. We won on pens!" : "Losing on pens feels awful.");
    say("I was okay right up until everyone had to walk up one at a time.");
    say(won ? "Fair play to everyone who took one." : "Nobody owes anybody an apology for a kick.");
  } else if (end && end.minute >= 48 && (margin === 0 || (Math.abs(margin) === 1 && (margin > 0) === (end.club === 0)))) {
    say(margin < 0 ? "We were level until minute " + end.minute + ". That one hurts." : margin > 0 ? "Minute " + end.minute + " for the winner. Are you kidding me?" : "An equalizer in minute " + end.minute + ". What an ending.");
    talk(end.club === 0 ? [
      ["Did anyone actually know how much time we had?", "Enough, apparently."],
      ["I'd already started doing the math on the walk back.", "Might want to check those numbers again."],
      ["What a time to find the net.", "My voice is gone. Worth it."],
      ["I need a minute after that ending.", "Take two. I don't think I could go again anyway."],
      ["Nearly wore a hole in my boots willing that one in.", "Between all of us I reckon we helped."],
    ] : [
      ["I keep replaying that last goal in my head.", "Same. We were so close."],
      ["Thought we'd done enough when I looked at the time.", "That last bit of the game felt about ten seconds long."],
      ["Anyone else wish we could have that last minute back?", "Yeah. Going to be thinking about that on the drive."],
      ["Don't really know what to say about that ending.", "Me neither. Can talk about it at training."],
      ["That's the bit that's going to stick with me.", "I know. Wish the whistle had gone a minute sooner."],
    ]);
  } else if (Math.abs(margin) >= 4) {
    say(margin < 0 ? pick(["Well. That was a long walk off.", "Anybody else just sitting in the car?"]) : pick(["Did we really just put up " + us + "?", "Can somebody send me a picture of that scoreboard?"]));
    say(margin < 0 ? score + " is rough. I'd rather talk about it here than stare at the score all night." : score + ". Screenshot taken.");
    say(margin < 0 ? pick(["Yeah. Let's figure out one thing to fix first.", "Agreed. No point picking on one person after that."]) : "Saving that one for a rainy day.");
  } else {
    say(margin === 0 ? pick(["How are we feeling about " + score + "?", "Still can't decide how I feel about that draw."]) : margin > 0 ? pick(["I'll take that " + score + " any day.", "Well that's a nicer ride home."]) : pick(["That " + score + " is going to bug me.", "Would've liked another crack at them."]));
    talk(margin === 0 ? [
      ["Feels like there was another goal in it.", "I'd have played five more minutes."],
      ["Half of me's happy. Other half wants another go.", "That's pretty much the team vote right there."],
      ["Can't remember the last time we all agreed on how to feel about a draw.", "Give it an hour and I'll disagree with myself too."],
      ["Would you take that result again?", "Ask me after dinner. Everything feels different after dinner."],
      ["Feels a bit unfinished.", "Yeah, like we're all waiting for someone to take kickoff."],
    ] : margin > 0 ? [
      ["That's a score I don't mind sending to the group.", "Already sent it to my mum."],
      ["Anyone else taking the scenic route home?", "With a win? Windows down all the way."],
      ["Best part of winning is getting to training next week.", "Best part is breakfast tomorrow. Training's a close second."],
      ["Needed that one.", "Same. Been a long week outside of football."],
      ["Can we keep that feeling for next time?", "Packing it with the kits."],
    ] : [
      ["Give me ten minutes before we do the autopsy.", "Fair. Nobody needs a lecture in the parking lot."],
      ["Would be easy to spend all night picking that apart.", "Let's give ourselves the night off."],
      ["Anyone got anything cheerful?", "We get to play again. Best I can do right now."],
      ["Sorry gang. Feeling that one.", "All of us are. No apologies needed."],
      ["Wish the next game was tomorrow.", "Mentally yes. My legs would like the week."],
    ]);
  }
  const ourGoals = goals.filter(g => !g.club && report.played.includes(g.player)).reverse();
  const counts = new Map<string, number>();
  for (const g of ourGoals) counts.set(g.player, (counts.get(g.player) ?? 0) + 1);
  const scorer = ourGoals.sort((a,b) => counts.get(b.player)! - counts.get(a.player)!)[0];
  if (scorer) {
    const n = scorer.player;
    const tally = counts.get(n)!;
    const [praise, reply] = exchange(tally >= 3 ? [
      [`${n}, hat trick! Who's signing the ball first?`, "Leave a little room for my mum."],
      [`At what point did you realize you had a hat trick, ${n}?`, "When I ran out of fingers on my imaginary scoreboard."],
      [`${n}, you keeping the match ball?`, "After a hat trick? You can pry it out of my kit bag."],
      [`A hat trick, ${n}. What are you having for dinner? I want some.`, "Leftovers. Sorry to ruin the training documentary."],
      [`That third one, ${n}. Tell me you enjoyed it.`, "Been waiting ages to say I scored a hat trick. So yeah."],
    ] : tally === 2 ? [
      [`Two goals, ${n}. Which one are you replaying tonight?`, "The second. Proves the first wasn't an accident."],
      [`${n}, a brace! Were you thinking about a third?`, "From the second the second one went in."],
      [`${n}, leave a goal for the rest of us next week.`, "No promises. Two felt pretty good."],
      [`Both of those yours, ${n}? I'm filling in the scoresheet.`, "Yep. Best bit of paperwork I've done all week."],
      [`Two for ${n}. Someone owes you a drink.`, "Two goals and only one drink? Tough crowd."],
    ] : [
      [`${n}, I want that finish on video.`, "Same. In my head it looks fantastic."],
      [`That goal of yours, ${n}. More of those please.`, "Putting in a request with my feet."],
      [`${n}, were you always going to shoot there?`, "Decided about one stride before. Very detailed plan."],
      [`Give ${n} some credit for that one.`, "I'll take it. Been working on actually pulling the trigger."],
      [`${n}, I'm claiming half your goal for yelling SHOOT.`, "Send the invoice. I'll dispute it."],
      [`Did you know it was in straight away, ${n}?`, "No chance. Had to see the net move."],
      [`Minute ${scorer.minute}. That's the bit I'd watch again, ${n}.`, "I'd watch it twice and pretend I only watched it once."],
      [`${n}, how good did that goal feel?`, "You know when you finally hit one the way you meant to? That."],
      [`Can we get ${n} to run finishing at practice?`, "Only if we quit the second I miss."],
      [`${n}, loved that you backed yourself there.`, "Thanks. I've talked myself out of shooting from there before."],
      [`I hope you enjoyed that one, ${n}.`, "Been smiling about it since I got my boots off."],
      [`${n}, that's the finish I'm taking home with me.`, "Cheers. Means a lot coming from you."],
    ]);
    ask(n, praise, reply);
    if (scorer.assist) {
      const a = scorer.assist;
      const [thanks, response] = exchange([
        [`${a}, cheers for putting that on a plate.`, "You finished it. We're even."],
        [`That one's half yours, ${a}.`, "I'll take my half in fries."],
        [`${a}, send me that pass every week please.`, "Same address next Thursday?"],
        [`Before I forget, lovely ball, ${a}.`, "Honestly just happy it got to you."],
        [`Put ${a} in the clip too. Goal starts with that pass.`, "Thank you! Everyone always cuts the good bit."],
        [`${a}, you made my job a lot easier there.`, "Funny, I was about to say the same to you."],
      ]);
      say(thanks, n); say(response, a);
    }
  }
  if (report.fouledPlayer && report.played.includes(report.fouledPlayer)) {
    const n = report.fouledPlayer;
    const [check, reply] = exchange([
      [`${n}, how are you feeling after that foul?`, "Ask me again when I've tried the stairs. Thanks for checking."],
      [`You all good, ${n}? Didn't get to ask after the whistle.`, "Appreciate it. I'll let you know how I feel tomorrow."],
      [`${n}, need a lift after that challenge?`, "Sorted for a ride, thanks for asking though."],
      [`Anyone checked on ${n} since that foul?`, "Still here. Mostly looking forward to sitting down."],
      [`${n}, give us a shout if you need ice.`, "Cheers. I'll grab some before I head out."],
      [`How'd that challenge feel from your end, ${n}?`, "Would happily skip the replay of that one."],
      [`${n}, I winced from where I was standing.`, "So did I, and I had the best view."],
      [`Checking in, ${n}. Anything you need before we go?`, "Just my water bottle if anyone's seen it."],
      [`${n}, text us tomorrow if you're feeling that foul, yeah?`, "Will do. Good looking out."],
      [`Still annoyed about that one on you, ${n}.`, "Yeah. Was glad to hear a whistle there."],
    ]);
    ask(n, check, reply);
  }
  const booked = report.bookedPlayers?.filter(name => report.played.includes(name));
  if (booked?.length) {
    const n = pick(booked);
    const [tease, reply] = exchange([
      [`${n}, did the ref spell your name right this time?`, "Didn't lean in to check. Felt like a bad moment."],
      [`Nice of you to introduce yourself to the ref, ${n}.`, "Would've preferred a handshake to a yellow."],
      [`${n}, that yellow going on your player card?`, "Can we put it on the back in really small print?"],
      [`Anything to say about the booking, ${n}?`, "My legal team says I'm just here to play football."],
      [`${n}, collecting cards now?`, "One's plenty. Happy to retire the collection."],
      [`${n}, shall we put 'met the referee' in your match highlights?`, "Great. My mum watches those, you know."],
    ]);
    ask(n, tease, reply);
  }
  if (report.woodwork?.some(Boolean)) {
    talk(report.woodwork[0] ? [
      ["That shot off the frame. I was halfway into a celebration.", "Same. Turned mine into a very convincing stretch."],
      ["Couple inches and we're talking about a different goal.", "I can still hear it hitting the frame."],
      ["Who else thought that one was in?", "Me. The woodwork had other ideas."],
      ["Do shots off the frame count for half at least?", "Bring it up at the next league meeting."],
      ["I'd like a rematch with that goal frame.", "Aim a little further inside this time."],
    ] : [
      ["That one they put off the frame took a year off my life.", "Only a year?"],
      ["When theirs hit the woodwork I forgot to breathe.", "Best sound on the pitch when it's their shot."],
      ["Give our goal frame a shirt after that.", "What number does it want?"],
      ["I had their shot down as a goal.", "Glad the frame got the last word."],
      ["That clang at our end. Still hearing it.", "I'll take that over hearing them celebrate."],
    ]);
  }
  if (lines.length < 9) {
    say("We got " + report.shots[0] + " shots away. They had " + report.shots[1] + ".");
    say(report.shots[0] > us ? pick(["Would love another go at a few of ours.", "Can we do finishing at training? I'll even collect the balls."]) : "I'd still like us to make a few more chances.");
    say(pick(["I'm in. Grab me when you're warming up.", "I'll stay for some extras with you."]));
  }
  if (lines.length < 9) {
    talk([
      ["Anyone up for food before we head home?", "Give me a sec to get these boots off."],
      ["Anyone got room for one more in the car?", "Yep. Front seat's full of cones but the back's free."],
      ["Who has the balls? Just checking before everyone drives off.", "Got them. My boot's basically the equipment shed."],
      ["Are we staying for a bit?", "Five minutes. That's how long it'll take me to untie this knot."],
      ["Anybody need their bottle filled?", "Please. Mine's been empty since the whistle."],
      ["Who's around for a kickabout this weekend?", "Text me a time. If there's coffee after, I'm in."],
    ]);
  }
  say(pick(["Someone remind me to take my kit out of the car.", "Off home. Good seeing everyone.", "Catch you Thursday.", "See you lot once my legs work again.", "Right. Water and a very long shower for me.", "I'll catch you lot outside.", "See you at training. Bring the good ball this time."]));
  if (lines.length < 10) say("Got you. See you there.");
  return lines.join("\n");
}
