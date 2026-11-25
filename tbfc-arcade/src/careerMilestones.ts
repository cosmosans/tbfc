// The next fixture, final placing, or promotion decision is already settled
// before its exchange is selected. Braces refer to those season facts.
const exchanges = {
  firstSeed: [
    ["Someone screenshot the table. That's us at the top!", "Saved. {opponent} in the semifinal next."],
    ["First after six weeks. I keep opening the table to look.", "Enjoy it! Then we've got {opponent} for a place in the final."],
  ],
  semifinal: [
    ["We're in the top four! Who did we draw?", "{opponent}. Winner gets a shot at the cup."],
    ["Championship semifinal against {opponent}. Anyone else get butterflies reading that?", "Yep. Already packed my boots and it's not even matchday."],
  ],
  lowerBracket: [
    ["Missed the top four. What's our next fixture?", "{opponent}. We've still got places to play for."],
    ["Saw the draw. We've got {opponent} next.", "I'm in. Still want to finish as high as we can."],
  ],
  final: [
    ["Are we actually in the final?", "We are. {opponent} between us and the trophy."],
    ["Somebody tell the group chat to keep Thursday free. We're in the final!", "Already told my family. Apparently we have a supporters' section now."],
  ],
  thirdMatch: [
    ["Really wanted that final. That one stings.", "Same. We've got {opponent} for third. I'll be there."],
    ["Third-place game next, yeah?", "Yeah, against {opponent}. Let's give ourselves a better last whistle."],
  ],
  placingMatch: [
    ["One game left. What finish can we get?", "{place} if we beat {opponent}. See you Thursday."],
    ["{opponent} to close out our season.", "Still got {place} to play for. I'm bringing the good socks."],
  ],
  champion: [
    ["{division} champions. Can whoever has the cup please send the photo?", "Sending all twelve. Somebody blinked in every single one."],
    ["WE WON THE LEAGUE. Sorry, caps lock is staying on tonight.", "Fair. I've made the trophy photo my lock screen already."],
  ],
  offer: [
    ["So we can take the spot in {destination}?", "Yep. If we stay here, the runners-up get the offer."],
    ["Anyone else curious what Thursdays in {destination} would be like?", "Very. Nice to have the choice after a season like that."],
  ],
  runnerUp: [
    ["Second place. Hard to see past that last whistle right now.", "I know. Still glad I got to play that final with you lot."],
    ["Anyone still at the pitch? Not quite ready to head home.", "By the gate. Let's walk out together."],
  ],
  placed: [
    ["That's us done for the season. {place} in {division}.", "Same time next season? I'll wash the bibs."],
    ["{place} it is. Thanks for all the Thursdays, everyone.", "Thanks to whoever kept bringing spare tape. You know who you are."],
  ],
  relegated: [
    ["Last place. Looks like we're heading to {destination}.", "I'll still be there Thursday. Same boots, same people."],
    ["Going down hurts. Can we leave the match breakdown for another day?", "Absolutely. See you in {destination}. First round of coffees is mine."],
  ],
  promoted: [
    ["It's official. We're taking the spot in {destination}!", "Changing the group chat name before anyone else gets to it."],
    ["See you all in {destination} next season.", "Already looking up who we're playing. So much for a night off."],
  ],
  stayed: [
    ["We're staying in {division}. {opponent} get the promotion spot.", "Then we get to defend the cup here. I'm in."],
    ["Decision's in. Another season in {division}.", "Congrats to {opponent} on moving up. Let's make them miss playing us."],
  ],
} as const;

export function milestoneChat(kind: keyof typeof exchanges, names: string[], seed: number,
  facts: Partial<Record<"opponent" | "place" | "division" | "destination", string>>) {
  const cast = [...new Set(names)];
  if (!cast.length) return "";
  const choices = exchanges[kind];
  const draw = (Math.imul(seed, 2654435761) + kind.charCodeAt(0)) >>> 0;
  const lines = choices[(draw >>> 16) % choices.length];
  return lines.map((line, i) => {
    const text = line.replace(/\{(opponent|place|division|destination)\}/g,
      (_, key: keyof typeof facts) => facts[key]!);
    return cast[(draw % cast.length + i) % cast.length] + " · " + text;
  }).join("\n");
}
