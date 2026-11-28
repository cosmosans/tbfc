import {
  houseDefaults,
  resolveHouse,
  houseSummary,
  houseShotProfile,
  saveHousePreset,
  saveHouseResult,
  type HouseConfig,
} from "./houseRules";
import {
  houseBuilder,
  houseRulesReview,
  houseEnvironment,
} from "./houseRulesUI";
import fullTimeTemplate from "./templates/street/full-time.html?raw";
import survivalEliminatedTemplate from "./templates/survival/eliminated.html?raw";
import { renderMarkup } from "./templates/renderMarkup";
import { streetArena, streetBoards } from "./streetArena";
import { settingsOptions } from "./matchSettings";
import { selectGameMode, selectStreetSize, customizeStreet } from "./kickOff";
import {
  physicsFor,
  snowMotion,
  approachVelocity,
  slideTravel,
  type Motion,
} from "./matchPhysics";
import { supportsMode } from "./arenaCapabilities";
import {
  classicRules,
  snowpocalypseRules,
  longRangeRules,
  firstToFiveRules,
  infernoRules,
  penaltyShootoutRules,
  survivalRules,
  beatTheClockRules,
  mysteryMatchRules,
  airBallsRules,
  streetRules,
  gulchDebugRules,
  readStreetPreferences,
  streetShapes,
  validStreetLineup,
  targetReached,
  type GameMode,
} from "./matchRules";
import { selectSurvivalElimination, survivalAnchors } from "./survival";
import {
  beatStartSeconds,
  beatClockText,
  adjustBeatClock,
  challengeSide,
  saveBeatBest,
  type ChallengeSide,
} from "./beatTheClock";
import { autoStreet, squadRatings } from "./streetSquad";
import { streetTargets, type StreetTactics } from "./streetAI";
import { customizeCourt, streetGoalSurrounds } from "./streetCourt";
import bjornIdle from "./art/bjorn-idle.png?url";
import bjornRun from "./art/bjorn-run.png?url";
import bjornKick from "./art/bjorn-kick.png?url";
import bjornHeader from "./art/bjorn-header.png?url";
import bjornTackle from "./art/bjorn-tackle.png?url";
import bjornReaction from "./art/bjorn-reaction.png?url";
import bjornFall from "./art/bjorn-foul.png?url";
import bjornGoalRunUrl from "./art/bjorn-goal-run.png?url";
import bjornGoalStandUrl from "./art/bjorn-goal-stand.png?url";
import {
  millBoards,
  millBankAim,
  millContact,
  planMillBank,
} from "./millBoards";
import { CurveGesture, type CurveStrike } from "./burnCurve";
import "./menuScale";
import { playPenalties } from "./penaltyArena";
import {
  fullSquadPenaltySelection,
  readPenaltyLength,
  selectPenaltySettings,
  savePenaltyLength,
  type PenaltySelection,
  type ShootoutLength,
} from "./penaltySetup";
import { shootout } from "./shootoutRules";
import type { Kick } from "./shootoutRules";
import { fixtureRequiresWinner } from "./careerSeason";
import { costumeSmoke } from "./costumeSmoke";
import meghanGoalUrl from "./art/meghan-new-goal-stand.png?url";
import meghanSkateUrl from "./art/meghan-skate.png?url";
import nelsonGoalUrl from "./art/nelson-goal.png?url";
import nelsonGoalRunUrl from "./art/nelson-goal-run.png?url";
import nelsonGoalSupportUrl from "./art/nelson-goal-support.png?url";
import janGoalUrl from "./art/jan-new-goal-stand.png?url";
import janGoalRunUrl from "./art/jan-new-goal-run.png?url";
import stevenGoalRunUrl from "./art/steven-new-goal-run.png?url";
import stevenGoalGroupUrl from "./art/steven-new-goal-stand.png?url";
import pamSkateGoalUrl from "./art/pam-skate-goal.png?url";
import joseOverheadUrl from "./art/jose-overhead.png?url";
import joseTackleUrl from "./art/jose-tackle.png?url";
import joseReactionUrl from "./art/jose-reaction.png?url";
import joseReactionFlashUrl from "./art/jose-reaction-flash.png?url";
import joseHeaderUrl from "./art/jose-header.png?url";
import nadiaNewGoalStandUrl from "./art/nadia-new-goal-stand.png?url";
import nadiaNewGoalRunUrl from "./art/nadia-new-goal-run.png?url";
import danielSupportUrl from "./art/daniel-new-goal-support.png?url";
import danielGoalGroupUrl from "./art/daniel-new-goal-stand.png?url";
import danielGoalRunUrl from "./art/daniel-new-goal-run.png?url";
import chrisNewIdle from "./art/chris-new-idle.png?url";
import chrisNewRun from "./art/chris-new-run.png?url";
import chrisNewKick from "./art/chris-new-kick.png?url";
import chrisNewHeader from "./art/chris-new-header.png?url";
import chrisNewTackle from "./art/chris-new-tackle.png?url";
import chrisNewReaction from "./art/chris-new-reaction.png?url";
import chrisNewFoul from "./art/chris-new-foul.png?url";
import chrisNewGoalRun from "./art/chris-new-goal-run.png?url";
import chrisNewGoalStand from "./art/chris-new-goal-stand.png?url";
import jeremyGoalGroupUrl from "./art/jeremy-new-goal-group.png?url";
import jeremyHeader from "./art/jeremy-new-header.png?url";
import jeremyTackle from "./art/jeremy-new-tackle.png?url";
import jeremyReaction from "./art/jeremy-new-reaction.png?url";
import jeremyFoul from "./art/jeremy-new-foul.png?url";
import stubbsSlideUrl from "./art/stubbs-new-goal-run.png?url";
import stubbsGoalStandUrl from "./art/stubbs-new-goal-stand.png?url";
import stubbsGoalSupportUrl from "./art/stubbs-new-goal-support.png?url";
import stubbsHeader from "./art/stubbs-new-header.png?url";
import stubbsTackle from "./art/stubbs-new-tackle.png?url";
import stubbsReaction from "./art/stubbs-new-reaction.png?url";
import stubbsReactionFlash from "./art/stubbs-new-reaction-flash.png?url";
import { careerRating, type Attribute } from "./careerDevelopment";
import { playerRatings, ratingLabels } from "./playerRatings";
import { barelyRatings } from "./barelyRatings";
import { scoreRow, statRow } from "./leagueBoard";
import "./fullTime.css";
import { careerHub, headshots, careerRatings, type Ticket } from "./careerHub";
import { rivalHeadshot, spriteHeadshot } from "./rivalHeadshots";
import { pauseMenu } from "./pauseMenu";
import {
  calendarDate,
  seasonName,
  stage,
  simulateRemainder,
  scoreboardAt,
  finishRound,
  opponent,
  type Report,
} from "./careerSeason";
import { saveSlot } from "./careerStore";
import { createBurningBall } from "./burningBall";
import { outOfPosition } from "./lineupRoles";
import { pairRating } from "./lineupChemistry";
import { profiles } from "./difficulty";
import { celebrationControls } from "./celebrationLab";
import {
  broadcastDirector,
  broadcastShirt,
  broadcastStarters,
} from "./menuBroadcast";
import { hint, reveal } from "./screenUI";
import { spriteGroundPadding } from "./spriteGround";
import { createChipBins } from "./chipBins";
import { practiceMenu } from "./tutorial/practiceMenu";
import { TutorialDirector } from "./tutorial/director";
import type { TutorialLaunch } from "./tutorial/progress";
import {
  TutorialCoaching,
  tutorialTouchlineSpot,
  tutorialAllowsChallenges,
  isTutorialParticipant as chapterParticipant,
} from "./tutorial/ai";
import tutorialScene from "./tutorial/scene.json";
import { dressPark } from "./tutorial/park";
import { firstTouchSoundtrack } from "./tutorial/soundtrack";
import { freeDrill, aerialDrill, practicePanel, shotPoints } from "./practiceDrills";
import { startMenuMusic, type MenuMusic } from "./menuMusic";
import { mainMenu, mountMenuBackdrop } from "./mainMenu";
import { matchIntro, prepareMatchIntro } from "./matchIntro";
import { weatherPlayground } from "./weatherPlayground";
import { keeperControls } from "./keeperLab";
import { spriteViewer } from "./spriteViewer";
import { goalCannons } from "./goalCannons";
import { kneelingPose } from "./kneelingPose";
import mandyGoalUrl from "./art/mandy-new-goal-team.png?url";
import mandyHeader from "./art/mandy-new-header.png?url";
import mandyTackle from "./art/mandy-new-tackle.png?url";
import mandyReaction from "./art/mandy-new-reaction.png?url";
import spencerIdle from "./art/spencer-idle.png?url";
import spencerRun from "./art/spencer-run.png?url";
import spencerKick from "./art/spencer-kick.png?url";
import spencerHeader from "./art/spencer-header.png?url";
import spencerTackle from "./art/spencer-tackle.png?url";
import spencerReaction from "./art/spencer-reaction.png?url";
import spencerFoul from "./art/spencer-foul.png?url";
import pamGoalUrl from "./art/pam-goal.png?url";
import nadiaIdle from "./art/nadia-new-idle.png?url";
import nadiaRun from "./art/nadia-new-run.png?url";
import nadiaKick from "./art/nadia-new-kick.png?url";
import nadiaHeader from "./art/nadia-new-header.png?url";
import nadiaTackle from "./art/nadia-new-tackle.png?url";
import nadiaReaction from "./art/nadia-new-reaction.png?url";
import nadiaFall from "./art/nadia-new-foul.png?url";
import nelsonIdle from "./art/nelson-idle.png?url";
import nelsonRun from "./art/nelson-run.png?url";
import nelsonKick from "./art/nelson-kick.png?url";
import nelsonFall from "./art/nelson-foul.png?url";
import nelsonJump from "./art/nelson-jump.png?url";
import nelsonTackle from "./art/nelson-tackle.png?url";
import nelsonReaction from "./art/nelson-reaction.png?url";
import stubbsFall from "./art/stubbs-new-foul.png?url";
import meghanFall from "./art/meghan-new-foul.png?url";
import mandyFall from "./art/mandy-new-foul.png?url";
import seanFall from "./art/sean-fall.png?url";
import danielFall from "./art/daniel-new-foul.png?url";
import stevenFall from "./art/steven-new-foul.png?url";
import joseFoulReaction from "./art/jose-foul-reaction.png?url";
import starsFall from "./art/stars-fall.png?url";
import rivalKeeperFall from "./art/rival-keeper-fall.png?url";
import { rivalSprites } from "./rivalSprites";
import { grassRatings } from "./grassRatings";
import { netRatings } from "./netRatings";
import { crossbarRatings } from "./crossbarRatings";
import { goalDiggerRatings } from "./goalDiggerRatings";
import {
  clubAccent,
  burners,
  barelyUnited,
  clubs,
  type Club,
  type Fixture,
} from "./opponentSquads";
import { selectSides, playerColor, type Seat } from "./sideSelect";
import { selectTeams } from "./teamSelect";
import { menuPad, menuDirection } from "./menuPad";
import type { Selection } from "./lineup";
import trainingIdle from "./art/blue-chris-idle.png?url";
import trainingRun from "./art/blue-chris-run.png?url";
import trainingKick from "./art/blue-side-kicks.png?url";
import danielIdle from "./art/daniel-new-idle.png?url";
import danielRun from "./art/daniel-new-run.png?url";
import danielKick from "./art/daniel-new-kick.png?url";
import danielJump from "./art/daniel-new-jump.png?url";
import danielTackle from "./art/daniel-new-tackle.png?url";
import danielReaction from "./art/daniel-new-reaction.png?url";
import { defaultSettings, halfMinutesForSpeed } from "./matchSettings";
import stevenIdle from "./art/steven-new-idle.png?url";
import stevenRun from "./art/steven-new-run.png?url";
import stevenKick from "./art/steven-new-kick.png?url";
import stevenJump from "./art/steven-new-jump.png?url";
import stevenTackle from "./art/steven-new-tackle.png?url";
import stevenReaction from "./art/steven-new-reaction.png?url";
import spiderIdleUrl from "./art/spider-jose-new-idle.png?url";
import spiderRunUrl from "./art/spider-jose-new-run.png?url";
import spiderGoalStandUrl from "./art/spider-jose-new-stand.png?url";
import joseIdle from "./art/jose-idle.png?url";
import joseRun from "./art/jose-run.png?url";
import joseKick from "./art/jose-kick-finals.png?url";
import { selectLineup, positions, bios, burnerEligibility } from "./lineup";
import janIdle from "./art/jan-new-idle.png?url";
import janRun from "./art/jan-new-run.png?url";
import janKick from "./art/jan-new-kick.png?url";
import janJump from "./art/jan-new-jump.png?url";
import janTackle from "./art/jan-new-tackle.png?url";
import janReaction from "./art/jan-new-reaction.png?url";
import janFoul from "./art/jan-new-foul.png?url";
import { audio } from "./matchAudio";
import cardSheet from "./art/ref-yellow-card.png?url";
import stubbsKick from "./art/stubbs-new-kick.png?url";
import mandyKick from "./art/mandy-new-kick.png?url";
import jeremyKick from "./art/jeremy-new-kick.png?url";
import seanKick from "./art/sean-kick.png?url";
import seanGroupUrl from "./art/sean-group.png?url";
import seanFullDiveUrl from "./art/sean-dive-long.png?url";
import seanQuickDiveUrl from "./art/sean-dive-short.png?url";
import { showKeeperDive } from "./keeperDive";
import blueKick from "./art/stars-side-kicks.png?url";
import tealIdle from "./art/teal-idle.png?url";
import mandyIdle from "./art/mandy-new-idle.png?url";
import mandyRun from "./art/mandy-new-run.png?url";
import jeremyIdle from "./art/jeremy-new-idle.png?url";
import jeremyRun from "./art/jeremy-new-run.png?url";
import seanIdle from "./art/sean-idle.png?url";
import seanRun from "./art/sean-run.png?url";
import {
  GoalReplay,
  strikerView,
  frameAction,
  cinematicPlayerSize,
  cinematicBallSize,
} from "./replay";
import refereeIdle from "./art/ref-idle.png?url";
import refereeRun from "./art/ref-run.png?url";
import { advanceOutBall } from "./perimeter";
import pamSideKicks from "./art/pam-kick.png?url";
import pamHeaderUrl from "./art/pam-header.png?url";
import pamTackleUrl from "./art/pam-tackle.png?url";
import pamReactionUrl from "./art/pam-reaction.png?url";
import pamReactionFlashUrl from "./art/pam-reaction-flash.png?url";
import pamFoulUrl from "./art/pam-foul.png?url";
import pamSupportUrl from "./art/pam-support.png?url";
import meghanKick from "./art/meghan-new-kick.png?url";
import meghanHeader from "./art/meghan-new-header.png?url";
import meghanTackle from "./art/meghan-new-tackle.png?url";
import meghanReaction from "./art/meghan-new-reaction.png?url";
import awayKeeperEnd from "./art/keeper-end.png?url";
import greenGroupUrl from "./art/rival-keeper-group.png?url";
import greenQuickDiveUrl from "./art/rival-keeper-dive-short.png?url";
import greenFullDiveUrl from "./art/rival-keeper-dive-long.png?url";
import greenCarryUrl from "./art/rival-keeper-carry.png?url";
import greenHoldUrl from "./art/rival-keeper-carry-idle.png?url";
import joseKeeperIdleUrl from "./art/jose-keeper-idle.png?url";
import joseKeeperRunUrl from "./art/jose-keeper-run.png?url";
import joseKeeperKickUrl from "./art/jose-keeper-kick.png?url";
import joseKeeperHoldUrl from "./art/jose-keeper-hold.png?url";
import joseKeeperWalkUrl from "./art/jose-keeper-walk.png?url";
import joseKeeperDiveUrl from "./art/jose-keeper-dive.png?url";
import spencerKeeperIdleUrl from "./art/spencer-keeper-idle.png?url";
import spencerKeeperRunUrl from "./art/spencer-keeper-run.png?url";
import spencerKeeperKickUrl from "./art/spencer-keeper-kick.png?url";
import spencerKeeperDiveUrl from "./art/spencer-keeper-dive.png?url";
import spencerKeeperWalkUrl from "./art/spencer-keeper-walk.png?url";
import spencerKeeperHoldUrl from "./art/spencer-keeper-hold.png?url";
import seanCarryUrl from "./art/sean-carry.png?url";
import seanHoldUrl from "./art/sean-carry-idle.png?url";
import greenKeeperIdle from "./art/rival-keeper-idle.png?url";
import greenKeeperRun from "./art/rival-keeper-run.png?url";
import greenKeeperKick from "./art/rival-keeper-kick.png?url";
import stubbsIdle from "./art/stubbs-new-idle.png?url";
import stubbsRun from "./art/stubbs-new-run.png?url";
import { rivalWomen } from "./rivalRoster";
import {
  homeStadium,
  randomStadium,
  selectStadium,
  stadiumName,
  type StadiumId,
} from "./stadiumSelect";
import { buildGrounds } from "./grounds";
import { createGoal } from "./goal";
import {
  airBallsProfile,
  airGoalEligible,
  airAccuracy,
  aerialFinish,
  type AirFinish,
} from "./airBalls";
import {
  createMysteryState,
  advanceMystery,
  mysteryInterval,
  mysteryTime,
  mysteryModifiers,
  type MysteryId,
} from "./mysteryMatch";
import keeperImage from "./art/practice-keeper.png?url";
import {
  longRangeEligible,
  goalValue,
  longRangeBox,
  longRangeBalance,
} from "./longRange";
import { missChances, planShot, shotFeedback, streetShotAim } from "./shooting";
import { rollBall, spinFrames } from "./ballSpin";
import ballSheet from "./art/ball-spin.png?url";
import snowBallSheet from "./art/ball-spin-snow.png?url";
import { kickArc, heightAt, nextTouch } from "./ballArc";
import oxaniumUrl from "./fonts/oxanium.ttf?url";
import upheavalUrl from "./fonts/upheavtt.ttf?url";
import * as T from "three";
import pam_idle from "./art/pam-idle.png?url";
import pam_run from "./art/pam-run.png?url";

import blueIdle from "./art/stars-idle.png?url";
import blueRun from "./art/stars-run.png?url";
import meghan_idle from "./art/meghan-new-idle.png?url";
import meghan_run from "./art/meghan-new-run.png?url";
const burnerHomeSheets = import.meta.glob<string>(
  "./art/{bjorn,chris,daniel,jan,jeremy,jose,mandy,meghan,nadia,nelson,pam,spencer,steven,stubbs}-*.png",
  { eager: true, query: "?url", import: "default" },
);
const burnerWhiteSheets = import.meta.glob<string>("./art/away-preview/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
// Match Vite's resolved URLs so the same lookup works with hashed production assets.
const whiteKitByHomeUrl = new Map(
  Object.entries(burnerHomeSheets).map(
    ([path, url]) =>
      [
        url,
        burnerWhiteSheets[path.replace("./art/", "./art/away-preview/")],
      ] as const,
  ),
);
const creeperPrimarySheets = import.meta.glob<string>("./art/sc-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const creeperSecondarySheets = import.meta.glob<string>(
  "./art/sweeper-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const creeperSecondaryByUrl = new Map(
  Object.entries(creeperPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        creeperSecondarySheets[
          path.replace("./art/", "./art/sweeper-secondary/")
        ],
      ] as const,
  ),
);
const wonderPrimarySheets = import.meta.glob<string>("./art/okw-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const wonderSecondarySheets = import.meta.glob<string>(
  "./art/wonders-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const wonderSecondaryByUrl = new Map(
  Object.entries(wonderPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        wonderSecondarySheets[
          path.replace("./art/", "./art/wonders-secondary/")
        ],
      ] as const,
  ),
);
const dancerPrimarySheets = import.meta.glob<string>("./art/gd-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const dancerSecondarySheets = import.meta.glob<string>(
  "./art/dancers-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const dancerSecondaryByUrl = new Map(
  Object.entries(dancerPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        dancerSecondarySheets[
          path.replace("./art/", "./art/dancers-secondary/")
        ],
      ] as const,
  ),
);
const grassPrimarySheets = import.meta.glob<string>("./art/grass-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const grassSecondarySheets = import.meta.glob<string>(
  "./art/grass-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const grassSecondaryByUrl = new Map(
  Object.entries(grassPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        grassSecondarySheets[path.replace("./art/", "./art/grass-secondary/")],
      ] as const,
  ),
);
const espressoPrimarySheets = import.meta.glob<string>("./art/espresso-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const espressoSecondarySheets = import.meta.glob<string>(
  "./art/espresso-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const espressoSecondaryByUrl = new Map(
  Object.entries(espressoPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        espressoSecondarySheets[
          path.replace("./art/", "./art/espresso-secondary/")
        ],
      ] as const,
  ),
);
const onsiderPrimarySheets = import.meta.glob<string>("./art/onsider-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const onsiderSecondarySheets = import.meta.glob<string>(
  "./art/onsider-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const onsiderSecondaryByUrl = new Map(
  Object.entries(onsiderPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        onsiderSecondarySheets[
          path.replace("./art/", "./art/onsider-secondary/")
        ],
      ] as const,
  ),
);
const netPrimarySheets = import.meta.glob<string>("./art/net-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const netSecondarySheets = import.meta.glob<string>(
  "./art/net-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const netSecondaryByUrl = new Map(
  Object.entries(netPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        netSecondarySheets[path.replace("./art/", "./art/net-secondary/")],
      ] as const,
  ),
);
const diggersPrimarySheets = import.meta.glob<string>("./art/diggers-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const diggersSecondarySheets = import.meta.glob<string>(
  "./art/diggers-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const diggersSecondaryByUrl = new Map(
  Object.entries(diggersPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        diggersSecondarySheets[
          path.replace("./art/", "./art/diggers-secondary/")
        ],
      ] as const,
  ),
);
const barelyPrimarySheets = import.meta.glob<string>("./art/barely-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const barelySecondarySheets = import.meta.glob<string>(
  "./art/barely-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const barelySecondaryByUrl = new Map(
  Object.entries(barelyPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        barelySecondarySheets[
          path.replace("./art/", "./art/barely-secondary/")
        ],
      ] as const,
  ),
);
const macPrimarySheets = import.meta.glob<string>("./art/cm-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const macSecondarySheets = import.meta.glob<string>(
  "./art/mac-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const macSecondaryByUrl = new Map(
  Object.entries(macPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        macSecondarySheets[path.replace("./art/", "./art/mac-secondary/")],
      ] as const,
  ),
);
const pandasPrimarySheets = import.meta.glob<string>("./art/tp-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const pandasSecondarySheets = import.meta.glob<string>(
  "./art/pandas-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const pandasSecondaryByUrl = new Map(
  Object.entries(pandasPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        pandasSecondarySheets[
          path.replace("./art/", "./art/pandas-secondary/")
        ],
      ] as const,
  ),
);
const starsPrimarySheets = import.meta.glob<string>("./art/ss-roster-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const starsSecondarySheets = import.meta.glob<string>(
  "./art/stars-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const starsSecondaryByUrl = new Map(
  Object.entries(starsPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        starsSecondarySheets[path.replace("./art/", "./art/stars-secondary/")],
      ] as const,
  ),
);
const whiffPrimarySheets = import.meta.glob<string>("./art/whiff-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const whiffSecondarySheets = import.meta.glob<string>(
  "./art/whiff-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const whiffSecondaryByUrl = new Map(
  Object.entries(whiffPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        whiffSecondarySheets[path.replace("./art/", "./art/whiff-secondary/")],
      ] as const,
  ),
);
const orangePrimarySheets = import.meta.glob<string>("./art/orange-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const orangeSecondarySheets = import.meta.glob<string>(
  "./art/orange-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const orangeSecondaryByUrl = new Map(
  Object.entries(orangePrimarySheets).map(
    ([path, url]) =>
      [
        url,
        orangeSecondarySheets[
          path.replace("./art/", "./art/orange-secondary/")
        ],
      ] as const,
  ),
);
const interPrimarySheets = import.meta.glob<string>("./art/inter-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const interSecondarySheets = import.meta.glob<string>(
  "./art/inter-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const interSecondaryByUrl = new Map(
  Object.entries(interPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        interSecondarySheets[path.replace("./art/", "./art/inter-secondary/")],
      ] as const,
  ),
);
const crossbarPrimarySheets = import.meta.glob<string>("./art/crossbar-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const crossbarSecondarySheets = import.meta.glob<string>(
  "./art/crossbar-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const crossbarSecondaryByUrl = new Map(
  Object.entries(crossbarPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        crossbarSecondarySheets[
          path.replace("./art/", "./art/crossbar-secondary/")
        ],
      ] as const,
  ),
);
const fleetPrimarySheets = import.meta.glob<string>("./art/ff-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const fleetSecondarySheets = import.meta.glob<string>(
  "./art/fleet-secondary/*.png",
  { eager: true, query: "?url", import: "default" },
);
const fleetSecondaryByUrl = new Map(
  Object.entries(fleetPrimarySheets).map(
    ([path, url]) =>
      [
        url,
        fleetSecondarySheets[path.replace("./art/", "./art/fleet-secondary/")],
      ] as const,
  ),
);
const interMaleGoalUrls = import.meta.glob<string>(
  "./art/inter-*-goal-{run,stand,support}.png",
  { eager: true, query: "?url", import: "default" },
);
const onsiderMaleGoalUrls = import.meta.glob<string>(
  "./art/onsider-*-goal-{run,stand,support}.png",
  { eager: true, query: "?url", import: "default" },
);
const uiFont = new FontFace("Oxanium", "url(" + oxaniumUrl + ")", {
  weight: "200 800",
  display: "swap",
});
document.fonts.add(uiFont);
void uiFont.load();
const hudFont = new FontFace("Upheaval", "url(" + upheavalUrl + ")");
document.fonts.add(hudFont);
void hudFont.load();

const el = (id: string) => document.getElementById(id)!;
async function start() {
  const kits: Record<string, [string, string, string]> = {
    Meghan: [meghan_idle, meghan_run, meghanKick],
    Pam: [pam_idle, pam_run, pamSideKicks],
    Jan: [janIdle, janRun, janKick],
    Mandy: [mandyIdle, mandyRun, mandyKick],
    Jeremy: [jeremyIdle, jeremyRun, jeremyKick],
    Chris: [chrisNewIdle, chrisNewRun, chrisNewKick],
    Sean: [seanIdle, seanRun, seanKick],
    Stubbs: [stubbsIdle, stubbsRun, stubbsKick],
    Spencer: [spencerIdle, spencerRun, spencerKick],
    José: [joseIdle, joseRun, joseKick],
    Steven: [stevenIdle, stevenRun, stevenKick],
    Daniel: [danielIdle, danielRun, danielKick],
    Bjorn: [bjornIdle, bjornRun, bjornKick],
    Nelson: [nelsonIdle, nelsonRun, nelsonKick],
    Nadia: [nadiaIdle, nadiaRun, nadiaKick],
  };
  const fallSheets: Record<string, string | undefined> = {
    Pam: pamFoulUrl,
    Nadia: nadiaFall,
    Stubbs: stubbsFall,
    Spencer: spencerFoul,
    Meghan: meghanFall,
    Chris: chrisNewFoul,
    Jan: janFoul,
    Mandy: mandyFall,
    Sean: seanFall,
    Daniel: danielFall,
    Steven: stevenFall,
    José: joseFoulReaction,
    Bjorn: bjornFall,
    Nelson: nelsonFall,
    Jeremy: jeremyFoul,
  };
  const settings = defaultSettings();
  const difficulty = () => profiles[settings.difficulty];
  const burnerPortraits = Object.fromEntries(
    Object.entries(kits).map(([name, kit]) => [name, kit[0]]),
  );
  function kitSheet(url: string) {
    if (fixture?.wondersKit === "secondary" && wonderSecondaryByUrl.has(url))
      return wonderSecondaryByUrl.get(url) ?? url;
    if (fixture?.dancersKit === "secondary" && dancerSecondaryByUrl.has(url))
      return dancerSecondaryByUrl.get(url) ?? url;
    if (fixture?.grassKit === "secondary" && grassSecondaryByUrl.has(url))
      return grassSecondaryByUrl.get(url) ?? url;
    if (fixture?.espressoKit === "secondary" && espressoSecondaryByUrl.has(url))
      return espressoSecondaryByUrl.get(url) ?? url;
    if (fixture?.onsiderKit === "secondary" && onsiderSecondaryByUrl.has(url))
      return onsiderSecondaryByUrl.get(url) ?? url;
    if (fixture?.netKit === "secondary" && netSecondaryByUrl.has(url))
      return netSecondaryByUrl.get(url) ?? url;
    if (fixture?.diggersKit === "secondary" && diggersSecondaryByUrl.has(url))
      return diggersSecondaryByUrl.get(url) ?? url;
    if (fixture?.barelyKit === "secondary" && barelySecondaryByUrl.has(url))
      return barelySecondaryByUrl.get(url) ?? url;
    if (fixture?.macKit === "secondary" && macSecondaryByUrl.has(url))
      return macSecondaryByUrl.get(url) ?? url;
    if (fixture?.pandasKit === "secondary" && pandasSecondaryByUrl.has(url))
      return pandasSecondaryByUrl.get(url) ?? url;
    if (fixture?.starsKit === "secondary" && starsSecondaryByUrl.has(url))
      return starsSecondaryByUrl.get(url) ?? url;
    if (fixture?.whiffKit === "secondary" && whiffSecondaryByUrl.has(url))
      return whiffSecondaryByUrl.get(url) ?? url;
    if (fixture?.orangeKit === "secondary" && orangeSecondaryByUrl.has(url))
      return orangeSecondaryByUrl.get(url) ?? url;
    if (fixture?.interKit === "secondary" && interSecondaryByUrl.has(url))
      return interSecondaryByUrl.get(url) ?? url;
    if (fixture?.crossbarKit === "secondary" && crossbarSecondaryByUrl.has(url))
      return crossbarSecondaryByUrl.get(url) ?? url;
    if (fixture?.fleetKit === "secondary" && fleetSecondaryByUrl.has(url))
      return fleetSecondaryByUrl.get(url) ?? url;
    if (fixture?.creepersKit === "secondary" && creeperSecondaryByUrl.has(url))
      return creeperSecondaryByUrl.get(url) ?? url;
    return fixture?.burnersKit === "white"
      ? (whiteKitByHomeUrl.get(url) ?? url)
      : url;
  }
  let rules = classicRules(),
    streetPrefs = readStreetPreferences(),
    modeChosen = false;
  let houseDraft = resolveHouse(
    history.state?.houseEdit?.config ?? houseDefaults(),
  ).config;
  let houseCourt = history.state?.houseEdit?.court ?? "slate";
  let lastMode: GameMode = history.state?.houseEdit ? "houseRules" : "classic";
  const houseEditFixture = history.state?.houseEdit?.fixture;
  const editingHouse = !!history.state?.houseEdit;
  let houseEditing = editingHouse;
  let houseEnvironmentChosen = false;
  history.replaceState({ ...history.state, houseEdit: null }, "");
  let fixture: Fixture | undefined,
    managingAway = false,
    awayLineup: Selection | null = null,
    lineup: Selection | null = null,
    portraits = burnerPortraits;
  if (houseEditFixture) fixture = houseEditFixture;
  audio.state(true, false);
  let music: MenuMusic | undefined;
  let ticket: Ticket | null = null;
  let selectedDrill = -1,
    practiceNames: string[] = [];
  const kickOffSettings: typeof settings = { ...settings, time: "Night" };
  const classicKickOffSettings = { ...kickOffSettings };
  let kickOffVenue: StadiumId | null = null;
  let curveLab = false;
  let gulchDebug = false;
  let mill = false;
  let topdeck = false;
  let westend = false;
  let southside = false;
  let eastside = false;
  let stadiumTest = false;
  let standalonePractice = false;
  let tutorialLaunch: TutorialLaunch | undefined;
  let tutorial: TutorialDirector | undefined;
  let tutorialMusic: ReturnType<typeof firstTouchSoundtrack> | undefined;
  const tutorialCoaching = new TutorialCoaching();
  let tutorialTime = 0;
  let tutorialDefenders: string[] = [...tutorialScene.defendingTeam];
  function isTutorialParticipant(chapter: number, name: string, away: boolean) {
    return chapterParticipant(chapter, name, away, tutorialDefenders);
  }
  let seats: Seat[] | null = null;
  let simulation = false;
  let introStarted = false;
  let introTest = false;
  let intro: ReturnType<typeof matchIntro> | null = null;
  let weatherTest = false;
  let keeperTest = false;
  let penaltyLab = false;
  let penaltyLength: ShootoutLength = readPenaltyLength();
  let penaltySelections: [PenaltySelection, PenaltySelection] | null = null;
  function penaltyRating(club: Club, name: string, keeping: boolean) {
    return (
      squadRatings(club.name, name)?.[keeping ? 5 : 2] ??
      playerRatings[bios[name]?.[0]]?.[keeping ? 5 : 2] ??
      65 + club.stars * 4
    );
  }
  let burnLab = false;
  let celebrationLab = false;
  const broadcast =
    new URLSearchParams(location.search).get("broadcast") === "1";
  if (broadcast) {
    document.documentElement.dataset.broadcast = "";
    settings.weather = "Sun";
    fixture = {
      home: burners,
      away: clubs[1 + Math.floor(Math.random() * (clubs.length - 1))],
    };
    lineup = {
      shape: "1-3-3",
      starters: broadcastStarters(
        Object.keys(kits),
        burners.keeper,
        burnerEligibility,
      ),
      bench: [],
    };
  } else {
    music = startMenuMusic(!audio.muted, (on) => audio.setMuted(!on));
    const returning = history.state?.arcadeMenu === true;
    if (returning || history.state?.arcadeCareer !== undefined) {
      history.replaceState({ ...history.state, arcadeMenu: false }, "");
      music.start(false);
    }
    let resume = history.state?.arcadeCareer as number | undefined;
    let careerBackdrop = resume !== undefined;
    let removeBackdrop = mountMenuBackdrop(careerBackdrop ? "career" : "menu");
    function showCareerBackdrop(show: boolean) {
      if (careerBackdrop === show) return;
      removeBackdrop();
      careerBackdrop = show;
      removeBackdrop = mountMenuBackdrop(show ? "career" : "menu");
    }
    const previewReturn = history.state?.previewReturn;
    if (previewReturn)
      history.replaceState({ ...history.state, previewReturn: null }, "");
    let destination =
      resume !== undefined
        ? "career"
        : history.state?.kickoffMenu || editingHouse
          ? "match"
          : history.state?.practiceMenu
            ? "practice"
            : await mainMenu(
                music,
                !returning,
                removeBackdrop.ready,
                previewReturn ??
                  (history.state?.keeperDebug ? "debug" : "menu"),
              );
    if (history.state?.kickoffMenu)
      history.replaceState({ ...history.state, kickoffMenu: false }, "");
    if (history.state?.keeperDebug)
      history.replaceState({ ...history.state, keeperDebug: false }, "");
    do {
      if (destination !== "match") {
        rules = classicRules();
        modeChosen = false;
        Object.assign(kickOffSettings, classicKickOffSettings);
      }
      const rematch = history.state?.streetRematch;
      if (rematch) {
        history.replaceState({ ...history.state, streetRematch: null }, "");
        if (
          (rematch.rules?.mode === "street" ||
            rematch.rules?.mode === "snowpocalypse" ||
            rematch.rules?.mode === "longRange" ||
            rematch.rules?.mode === "firstToFive" ||
            rematch.rules?.mode === "inferno" ||
            rematch.rules?.mode === "survival" ||
            rematch.rules?.mode === "beatTheClock" ||
            rematch.rules?.mode === "airBalls" ||
            rematch.rules?.mode === "mysteryMatch" ||
            rematch.rules?.mode === "houseRules") &&
          rematch.fixture &&
          rematch.lineup &&
          (rematch.awayLineup || rematch.rules.goalkeepers !== 0)
        ) {
          fixture = rematch.fixture;
          lineup = rematch.lineup;
          awayLineup = rematch.awayLineup;
          seats = rematch.seats;
          rules =
            rematch.rules.mode === "houseRules"
              ? {
                  ...resolveHouse(rematch.rules.house).rules,
                  court: rematch.rules.court,
                }
              : rematch.rules.mode === "snowpocalypse"
                ? snowpocalypseRules()
                : rematch.rules.mode === "longRange"
                  ? longRangeRules()
                  : rematch.rules.mode === "firstToFive"
                    ? firstToFiveRules(rematch.rules.targetScore)
                    : rematch.rules.mode === "inferno"
                      ? infernoRules()
                      : rematch.rules.mode === "survival"
                        ? survivalRules()
                        : rematch.rules.mode === "beatTheClock"
                          ? beatTheClockRules()
                          : rematch.rules.mode === "airBalls"
                            ? airBallsRules()
                            : rematch.rules.mode === "mysteryMatch"
                              ? mysteryMatchRules()
                              : streetRules({
                                  ...streetPrefs,
                                  ...rematch.rules,
                                });
          gulchDebug = rematch.gulchDebug === true;
          Object.assign(settings, rematch.settings);
          kickOffVenue =
            rules.goalkeepers === 0
              ? "gulch"
              : supportsMode(
                    rematch.venue ?? "school",
                    rules.house?.snow ? "snowpocalypse" : rules.mode,
                  )
                ? (rematch.venue ?? "school")
                : "school";
          fixture.home =
            fixture.home.name === burners.name ? burners : fixture.home;
          fixture.away =
            fixture.away.name === burners.name ? burners : fixture.away;
          managingAway = !!seats?.length && seats[0].side === 1;
          simulation = !seats?.length;
          if (
            rules.mode === "beatTheClock" &&
            (challengeSide(seats) === null ||
              seats?.some(
                (seat) =>
                  seat.device >= 0 && !navigator.getGamepads?.()[seat.device],
              ))
          ) {
            seats = await selectSides(fixture, 0, true);
            if (!seats) {
              lineup = null;
              modeChosen = false;
              continue;
            }
            managingAway = seats[0].side === 1;
            simulation = false;
          }
          const club = managingAway ? fixture.away : fixture.home;
          portraits =
            club === burners
              ? burnerPortraits
              : Object.fromEntries(
                  [...club.outfield, ...club.bench, club.keeper].map((name) => [
                    name,
                    kitSheet(rivalSprites(club, name)?.idle ?? trainingIdle),
                  ]),
                );
          break;
        }
      }
      managingAway = false;
      awayLineup = null;
      seats = null;
      simulation = false;
      if (destination === "gulchTest") {
        rules = gulchDebugRules();
        gulchDebug = true;
        fixture = { home: burners, away: barelyUnited, barelyKit: "secondary" };
        const shape = streetShapes(3)[0];
        const squad = (club: Club): Selection => ({
          shape,
          starters: autoStreet(club, [...club.outfield, ...club.bench], shape),
          bench: [],
        });
        lineup = squad(fixture.home);
        awayLineup = squad(fixture.away);
        seats = [
          { number: 1, device: menuPad()?.index ?? -1, side: -1, actor: 0 },
        ];
        // Start immediately with the reusable STREET specification.
        kickOffVenue = "gulch";
        settings.time = "Night";
        settings.weather = "Sun";
        break;
      }
      if (destination === "spriteViewer") {
        await spriteViewer();
        destination = await mainMenu(music, false, undefined, "debug");
        continue;
      }
      if (destination === "career") {
        showCareerBackdrop(true);
        ticket = await careerHub(burnerPortraits, fallSheets, settings, resume);
        resume = undefined;
        history.replaceState(
          { ...history.state, arcadeCareer: ticket?.slot },
          "",
        );
        if (!ticket) {
          showCareerBackdrop(false);
          destination = await mainMenu(music);
          continue;
        }
        fixture = ticket.fixture;
        lineup = ticket.lineup;
        portraits = Object.fromEntries(
          [...lineup.starters, ...lineup.bench].map((n) => [
            n,
            burnerPortraits[n],
          ]),
        );
        seats = await selectSides(fixture, -1);
        if (!seats) {
          resume = ticket.slot;
          ticket = null;
          destination = "career";
          continue;
        }
        kickOffVenue = randomStadium();
        break;
      }
      if (destination === "simulate") {
        simulation = true;
        const home = clubs[Math.floor(Math.random() * clubs.length)];
        const visitors = clubs.filter((club) => club !== home);
        fixture = {
          home,
          away: visitors[Math.floor(Math.random() * visitors.length)],
        };
        lineup = {
          shape: "1-3-3",
          starters: [...home.outfield, home.keeper],
          bench: [...home.bench],
        };
        break;
      }
      if (
        typeof destination === "object" &&
        destination.kind === "matchIntro"
      ) {
        introTest = true;
        fixture = {
          home: burners,
          away: clubs.find((club) => club.name === "Shooting Stars FC")!,
        };
        lineup = {
          shape: "1-3-3",
          starters: [...burners.outfield, burners.keeper],
          bench: [...burners.bench],
        };
        seats = [{ number: 1, device: -1, side: -1, actor: 0 }];
        kickOffVenue = destination.venue;
        settings.time = destination.time;
        break;
      }
      if (
        destination === "burnLab" ||
        destination === "penalties" ||
        destination === "keeperLab"
      ) {
        keeperTest = destination === "keeperLab";
        burnLab = destination === "burnLab";
        penaltyLab = destination === "penalties";
        fixture = { home: burners, away: clubs[clubs.length - 1] };
        lineup = {
          shape: "1-3-3",
          starters: [...burners.outfield, burners.keeper],
          bench: [...burners.bench],
        };
        break;
      }
      if (destination === "celebrations") {
        celebrationLab = true;
        fixture = { home: burners, away: clubs[clubs.length - 1] };
        lineup = {
          shape: "1-3-3",
          starters: [...burners.outfield, burners.keeper],
          bench: [],
        };
        break;
      }
      if (
        destination === "practice" ||
        destination === "weatherLab" ||
        destination === "stadiumTest" ||
        destination === "curveLab"
      ) {
        weatherTest = destination === "weatherLab";
        if (weatherTest) {
          settings.weather = "Rain";
          settings.speed = 5;
        }
        curveLab = destination === "curveLab";
        stadiumTest = destination === "stadiumTest";
        if (stadiumTest) {
          const selected = await selectStadium();
          if (!selected) {
            destination = await mainMenu(music, false, undefined, "debug");
            continue;
          }
          mill = selected === "mill";
          topdeck = selected === "topdeck";
          westend = selected === "westend";
          southside = selected === "southside";
          eastside = selected === "eastside";
          settings.time = "Evening";
        }
        history.replaceState({ ...history.state, practiceMenu: false }, "");
        const choice = weatherTest
          ? { drill: freeDrill, names: ["Chris", "Nadia", "Jeremy", "José"] }
          : curveLab
            ? { drill: freeDrill, names: ["José"] }
            : stadiumTest
              ? {
                  drill: freeDrill,
                  names:
                    topdeck || westend || southside
                      ? ["José"]
                      : ["Pam", "José"],
                }
              : await practiceMenu();
        if (!choice) {
          destination = await mainMenu(music);
          continue;
        }
        tutorialLaunch =
          "tutorial" in choice
            ? (choice.tutorial as TutorialLaunch | undefined)
            : undefined;
        if (tutorialLaunch) {
          // Candler Park is the existing eastside level, including its collision and street-life systems.
          eastside = true;
          settings.time = "Evening";
        }
        selectedDrill = choice.drill;
        practiceNames = choice.names;
        standalonePractice = true;
        fixture = {
          home: burners,
          away: tutorialLaunch ? burners : clubs[clubs.length - 1],
        };
        lineup = {
          shape: "1-3-3",
          starters: [...burners.outfield, burners.keeper],
          bench: [...burners.bench],
        };
        if (tutorialLaunch) {
          lineup.starters = [...tutorialScene.home, tutorialScene.homeKeeper];
          lineup.bench = [];
        }
        break;
      }
      if (!modeChosen) {
        const mode = houseEditing
          ? "houseRules"
          : await selectGameMode(lastMode);
        houseEditing = false;
        if (!mode) {
          lastMode = "classic";
          destination = await mainMenu(music);
          continue;
        }
        lastMode = mode;
        if (rules.mode === "classic")
          Object.assign(classicKickOffSettings, kickOffSettings);
        if (mode === "houseRules") {
          const chosen = await houseBuilder(houseDraft);
          if (!chosen) continue;
          houseDraft = chosen;
          rules = { ...resolveHouse(chosen).rules, court: houseCourt };
          if (!houseEnvironmentChosen)
            Object.assign(kickOffSettings, classicKickOffSettings);
        } else if (mode === "street") {
          const preferences = await selectStreetSize(streetPrefs);
          if (!preferences) continue;
          streetPrefs = preferences;
          rules = streetRules(streetPrefs);
          if (
            settingsOptions.difficulty.includes(streetPrefs.difficulty as any)
          )
            kickOffSettings.difficulty =
              streetPrefs.difficulty as typeof settings.difficulty;
        } else {
          rules =
            mode === "snowpocalypse"
              ? snowpocalypseRules()
              : mode === "longRange"
                ? longRangeRules()
                : mode === "firstToFive"
                  ? firstToFiveRules()
                  : mode === "inferno"
                    ? infernoRules()
                    : mode === "survival"
                      ? survivalRules()
                      : mode === "beatTheClock"
                        ? beatTheClockRules()
                        : mode === "airBalls"
                          ? airBallsRules()
                          : mode === "mysteryMatch"
                            ? mysteryMatchRules()
                            : mode === "penaltyShootout"
                              ? penaltyShootoutRules()
                              : classicRules();
          Object.assign(kickOffSettings, classicKickOffSettings);
          if (mode === "snowpocalypse") kickOffSettings.weather = "Snow";
        }
        modeChosen = true;
      }
      const selected = await selectTeams(fixture, undefined, {
        back: "Kickoff",
        next: rules.goalkeepers === 0 ? "Side Select" : "Select Stadium",
      });
      if (!selected) {
        houseEditing = !!rules.house;
        modeChosen = false;
        continue;
      }
      fixture = selected;
      const homeVenue = homeStadium(fixture.home.name);
      let selectedVenue: StadiumId | null =
        rules.house && houseEnvironmentChosen ? kickOffVenue : homeVenue;
      do {
        selectedVenue =
          rules.goalkeepers === 0
            ? "gulch"
            : await selectStadium(
                homeVenue,
                selectedVenue,
                rules.house?.snow ? "snowpocalypse" : rules.mode,
              );
        if (!selectedVenue) break;
        seats = await selectSides(fixture, 0, rules.mode === "beatTheClock");
      } while (!seats && rules.goalkeepers !== 0);
      if (!seats || !selectedVenue) continue;
      if (rules.mode === "beatTheClock" && challengeSide(seats) === null) {
        seats = null;
        continue;
      }
      kickOffVenue = selectedVenue;
      simulation = seats.length === 0;
      const orderedSeats = [...seats].sort((a, b) => a.number - b.number);
      const sides = [...new Set(orderedSeats.map((seat) => seat.side))];
      if (!sides.length) sides.push(-1);
      managingAway = sides[0] === 1;
      if (rules.mode === "penaltyShootout") {
        penaltySelections = [
          fullSquadPenaltySelection(fixture.home),
          fullSquadPenaltySelection(fixture.away),
        ];
        const chosen = await selectPenaltySettings(
          fixture,
          kickOffSettings,
          penaltyLength,
        );
        if (!chosen) continue;
        penaltyLength = chosen.length;
        savePenaltyLength(chosen.length);
        Object.assign(kickOffSettings, chosen.settings);
        Object.assign(settings, chosen.settings);
        lineup = {
          shape: "1-3-3",
          starters: [...fixture.home.outfield, fixture.home.keeper],
          bench: [],
        };
        awayLineup = {
          shape: "1-3-3",
          starters: [...fixture.away.outfield, fixture.away.keeper],
          bench: [],
        };
        break;
      }
      const drafts = new Map<number, Selection>();
      if (!rules.house || !houseEnvironmentChosen)
        kickOffSettings.time =
          kickOffVenue === "school" || kickOffVenue === "westend"
            ? "Night"
            : "Evening";
      for (let step = 0; step < sides.length; ) {
        const side = sides[step];
        const club = side === 1 ? fixture.away : fixture.home;
        const art =
          club === burners
            ? Object.fromEntries(
                Object.entries(burnerPortraits).map(([name, url]) => [
                  name,
                  kitSheet(url),
                ]),
              )
            : Object.fromEntries(
                [...club.outfield, ...club.bench, club.keeper].map((name) => [
                  name,
                  kitSheet(
                    rivalSprites(club, name)?.idle ??
                      (name === club.keeper ? tealIdle : trainingIdle),
                  ),
                ]),
              );
        if (step === 0) portraits = art;
        const controllers = orderedSeats.filter((seat) => seat.side === side);
        const turn =
          sides.length === 2
            ? {
                number: controllers[0].number,
                devices: controllers.map((seat) => seat.device),
                first: step === 0,
                draft: drafts.get(side),
              }
            : undefined;
        const selected = await selectLineup(
          art,
          fixture,
          undefined,
          kickOffSettings,
          undefined,
          undefined,
          undefined,
          club,
          turn,
          rules,
        );
        if (!selected) {
          if (step > 0) {
            step--;
            continue;
          }
          lineup = null;
          break;
        }
        drafts.set(side, selected);
        if (rules.mode === "street" && step === sides.length - 1) {
          const customized = await customizeStreet({
            ...streetPrefs,
            difficulty: kickOffSettings.difficulty,
          });
          if (!customized) {
            streetPrefs = readStreetPreferences();
            rules = streetRules(streetPrefs);
            kickOffSettings.difficulty =
              streetPrefs.difficulty as typeof settings.difficulty;
            continue;
          }
          streetPrefs = customized;
          rules = streetRules(streetPrefs);
          kickOffSettings.difficulty =
            streetPrefs.difficulty as typeof settings.difficulty;
          kickOffSettings.time = streetPrefs.time;
          kickOffSettings.weather = streetPrefs.weather;
        }
        if (++step === sides.length) {
          awayLineup = drafts.get(1) ?? null;
          const cpuLineup = (club: Club): Selection => {
            if (rules.goalkeepers !== 0)
              return {
                shape: "1-3-3",
                starters: [...club.outfield, club.keeper],
                bench: [...club.bench],
              };
            const names =
              club === burners
                ? Object.keys(burnerPortraits)
                : [...club.outfield, ...club.bench, club.keeper];
            try {
              const saved = JSON.parse(
                localStorage.getItem(
                  `tbfc.street.lineup.v1.${rules.teamSize}.${club.name}`,
                ) ?? "null",
              );
              if (validStreetLineup(saved, names, rules.teamSize)) return saved;
            } catch {}
            const shape = streetShapes(rules.teamSize)[0],
              starters = autoStreet(club, names, shape);
            return {
              shape,
              starters,
              bench: names.filter((n) => !starters.includes(n)).slice(0, 4),
            };
          };
          if (rules.goalkeepers === 0)
            awayLineup = drafts.get(1) ?? cpuLineup(fixture.away);
          lineup = {
            ...(drafts.get(-1) ?? cpuLineup(fixture.home)),
          };
        }
      }
      if (lineup && rules.house) {
        const environment = await houseEnvironment(
          houseDraft,
          kickOffSettings,
          houseCourt,
          kickOffVenue !== "mill",
        );
        if (!environment) {
          lineup = null;
          continue;
        }
        Object.assign(kickOffSettings, environment.settings);
        houseCourt = environment.court;
        houseEnvironmentChosen = true;
        rules = { ...resolveHouse(houseDraft).rules, court: houseCourt };
        if (!(await houseRulesReview(houseDraft))) {
          lineup = null;
          modeChosen = false;
          houseEditing = true;
          continue;
        }
      }
      if (lineup) Object.assign(settings, kickOffSettings);
    } while (!lineup);
    if (rules.mode === "beatTheClock" && challengeSide(seats) === null) {
      history.replaceState(
        { ...history.state, kickoffMenu: true, arcadeMenu: true },
        "",
      );
      location.reload();
      return;
    }
    removeBackdrop();
    music.finish();
  }
  // Only earned points modify the existing match tuning. Substitutions move the bonus with the player.
  const gains = new Map<Attribute, number>();
  if (ticket) {
    const c = ticket.career,
      base = playerRatings[bios[c.player][0]]!;
    ratingLabels.forEach((stat, i) =>
      gains.set(stat, careerRating(c, c.player, stat, base[i]) - base[i]),
    );
  }
  function trainingFactor(
    name: string,
    stat: Attribute,
    clubName = fixture?.home.name,
  ) {
    if (rules.goalkeepers === 0) {
      const rating =
        clubName && squadRatings(clubName, name)?.[ratingLabels.indexOf(stat)];
      return rating === undefined ? 1 : 0.75 + rating / 320;
    }
    return ticket && name === ticket.career.player
      ? 1 + (gains.get(stat) ?? 0) * 0.01
      : 1;
  }
  let aiHome =
    broadcast || simulation || (!!seats && !seats.some((s) => s.side === -1));
  const { home, away: matchOpponent } = fixture;
  const homeLabel = home === burners ? "TBFC" : home.name;
  const freePractice = selectedDrill === freeDrill;
  const house = rules.mode === "houseRules" ? resolveHouse(rules.house) : null;
  const snowpocalypse = rules.mode === "snowpocalypse" || !!house?.config.snow;
  let longRange =
    rules.mode === "longRange" || house?.config.scoring === "longRange";
  const firstToFive =
    rules.mode === "firstToFive" ||
    (!!house && rules.winCondition === "target");
  const survival = rules.mode === "survival" || !!house?.has("survival");
  const beatTheClock = rules.mode === "beatTheClock";
  const beatTeam: ChallengeSide | null = beatTheClock
    ? challengeSide(seats)
    : null;
  const beatInitialPlayers = beatTheClock ? seats!.length : 0;
  let inferno = rules.permanentBurn;
  let physics = house?.physics ?? physicsFor(rules.mode);
  const airOnly =
    rules.mode === "airBalls" || house?.config.scoring === "airBalls";
  const airBalls = airOnly || !!house?.aerial;
  const airIntents = new WeakMap<
    object,
    { finish: AirFinish; until: number }
  >();
  const airShotPower = new WeakMap<object, number>();
  let airBounceAt = -Infinity,
    airWasAloft = false;
  let invalidAirGoals = 0;
  let houseElapsed = 0;
  let airInvalidUntil = 0;
  const airIntent = (actor: object): AirFinish => {
    const intent = airIntents.get(actor);
    return intent && performance.now() <= intent.until
      ? intent.finish
      : "GROUNDED";
  };
  const mystery = rules.mode === "mysteryMatch" ? createMysteryState() : null;
  const mysteryOn = (id: MysteryId) =>
    mystery?.current.id === id ||
    !!house?.config.modifiers.some((m) => m === id);
  const shotProfile = (actor: object, direction: number) =>
    houseShotProfile(
      house?.config ?? houseDefaults(),
      longRange &&
        longRangeEligible(ball.position.x, ball.position.z, direction),
      airBalls ? airAccuracy(airIntent(actor)) : 1,
    );
  const mysteryKickArc = (power: number, available = Infinity) => {
    const result = kickArc(power, available);
    const gravity = house?.gravity ?? (mysteryOn("moonBall") ? 0.4 : 1);
    if (gravity !== 1) {
      result.duration /= Math.sqrt(gravity);
      result.height /= gravity;
    }
    return result;
  };
  let slippery = house ? house.config.traction !== "normal" : snowpocalypse;
  if (snowpocalypse) settings.weather = "Snow";
  const street = rules.goalkeepers === 0;
  const gulch = rules.arena === "gulch";
  let homeShape = positions(lineup.shape);
  const renderer = new T.WebGLRenderer({
    canvas: document.querySelector("canvas")!,
    antialias: true,
  });
  const scene = new T.Scene();
  scene.background = new T.Color(0x284b37);
  const liveCamera = street
    ? { ...strikerView, along: -15, side: 4, height: 8, fov: 46 }
    : strikerView;
  const camera = new T.PerspectiveCamera(liveCamera.fov, 1, 0.1, 140);
  const distance = Math.hypot(liveCamera.along, liveCamera.side);
  const views = [
    {
      ...liveCamera,
      label: "End to end",
      end: true,
      along: -distance,
      side: 0,
    },
    { ...liveCamera, label: "Sideline", end: false, along: 0, side: distance },
  ];
  let viewIndex = 1;
  let view = views[viewIndex];
  el("changeView").textContent = view.label;
  const screenPoint = new T.Vector3();
  const screenUp = new T.Vector3(0, 1, 0);
  const sprintSeconds = 2,
    rechargeSeconds = 8,
    capacityLossPerSecond = 2.1,
    exhaustedLossPerSecond = 10;
  const kickPoseTimes = [0, 0.06, 0.12, 0.18, 0.25, 0.34, 0.44];
  const eightKickPoseTimes = [0, 0.05, 0.1, 0.15, 0.21, 0.27, 0.34, 0.42];
  const joseKickPoseTimes = [0, 0.05, 0.1, 0.15, 0.21, 0.27, 0.33, 0.39, 0.45];
  const kickAnimationSeconds = 0.56;
  const headerAnimationSeconds = 0.56;
  const sprintCadence = 1.2;
  const fieldX = street ? streetArena.length / 2 : 21,
    fieldZ = street ? streetArena.width / 2 : 12;
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: number,
  ) {
    const mesh = new T.Mesh(
      new T.BoxGeometry(w, h, d),
      new T.MeshBasicMaterial({ color }),
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }
  if (!standalonePractice && !celebrationLab && !curveLab) {
    const assigned = street
      ? "gulch"
      : broadcast
        ? randomStadium()
        : seats !== null
          ? kickOffVenue
          : homeStadium(home.name);
    mill = assigned === "mill";
    topdeck = assigned === "topdeck";
    westend = assigned === "westend";
    eastside = assigned === "eastside";
    southside = assigned === "southside";
  }
  const schoolGround =
    weatherTest ||
    simulation ||
    broadcast ||
    stadiumTest ||
    seats !== null ||
    eastside ||
    southside ||
    westend;
  const enclosed = mill || street;
  const courtBoards = street ? streetBoards : millBoards;
  const venue = gulch
    ? "gulch"
    : mill
      ? "mill"
      : topdeck
        ? "topdeck"
        : westend
          ? "westend"
          : southside
            ? "southside"
            : eastside
              ? "eastside"
              : schoolGround
                ? "school"
                : "standard";
  const introVenue =
    venue === "southside"
      ? "oldFourthWard"
      : venue === "topdeck"
        ? "midtown"
        : venue === "eastside"
          ? "candlerPark"
          : venue === "mill"
            ? "cabbagetown"
            : venue === "school"
              ? "grantPark"
              : venue === "westend"
                ? "westend"
                : "generic";
  const playIntro =
    !gulch &&
    (introTest ||
      !!ticket ||
      (introVenue !== "generic" &&
        !broadcast &&
        !standalonePractice &&
        !celebrationLab &&
        !keeperTest &&
        !burnLab &&
        !penaltyLab &&
        !weatherTest));
  const venueName = gulch
    ? "The Gulch"
    : stadiumName(venue === "standard" ? "school" : venue);
  const runX = enclosed ? courtBoards.x - 0.78 : 20.7;
  const runNorth = enclosed ? courtBoards.north + 0.53 : -11.7,
    runSouth = enclosed ? courtBoards.south - 0.53 : 11.7;
  function outsidePitch() {
    if (street)
      return (
        Math.abs(ball.position.x) > fieldX || Math.abs(ball.position.z) > fieldZ
      );
    if (enclosed)
      return (
        Math.abs(ball.position.x) > fieldX && Math.abs(ball.position.z) < 2
      );
    return (
      Math.abs(ball.position.x) > fieldX || Math.abs(ball.position.z) > fieldZ
    );
  }
  const {
    updateTrain,
    updateWeather,
    advanceStadiumBall,
    setSchoolNight,
    schoolLights,
    millLights,
    introCar,
  } = await buildGrounds(
    scene,
    renderer,
    settings,
    tutorialLaunch ? home : standalonePractice || celebrationLab ? null : home,
    venue,
    matchOpponent,
    !broadcast,
  );
  const outdoorWeather =
    venue !== "mill" &&
    !gulch &&
    (settings.weather === "Rain" || settings.weather === "Snow");
  const matchSurface =
    weatherTest || (outdoorWeather && !standalonePractice)
      ? weatherPlayground(scene, settings, snowpocalypse ? 1 : 0)
      : undefined;
  const useSnowBall = () => venue !== "mill" && settings.weather === "Snow";
  const updateTutorialPark = tutorialLaunch ? dressPark(scene) : undefined;
  if (stadiumTest && (venue === "school" || venue === "westend"))
    setSchoolNight!(true);
  // Top Deck and Southside carry their weathered markings on the ground material.
  if (snowpocalypse || (!topdeck && !southside && !gulch)) {
    const lines = snowpocalypse ? 0x42637b : mill ? 0xe7e3d7 : 0xb8d9b1;
    for (const z of [-fieldZ, fieldZ]) box(0, 0.01, z, 42, 0.02, 0.07, lines);
    for (const x of [-fieldX, 0, fieldX])
      box(x, 0.01, 0, 0.07, 0.02, 24, lines);
    for (const sign of [-1, 1]) {
      for (const z of [-4.6, 4.6])
        box(sign * 18.8, 0.02, z, 4.4, 0.02, 0.07, lines);
      box(sign * 16.6, 0.02, 0, 0.07, 0.02, 9.2, lines);
      if (sign === 1) box(fieldX, 0.025, 0, 0.12, 0.02, 4, 0xffebad);
    }
    const circle = new T.Mesh(
      new T.RingGeometry(2.9, 2.97, 64),
      new T.MeshBasicMaterial({ color: lines, side: T.DoubleSide }),
    );
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.035;
    scene.add(circle);
  }
  const longRangeMarks: T.Mesh[] = [];
  if (longRange || mystery || house) {
    const line = new T.MeshBasicMaterial({
      color: 0xffffff,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
    });
    const dash = (x: number, z: number, length: number, alongX: boolean) => {
      const mesh = new T.Mesh(
        new T.PlaneGeometry(alongX ? length : 0.085, alongX ? 0.085 : length),
        line,
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.065, z);
      mesh.visible = longRange;
      scene.add(mesh);
      longRangeMarks.push(mesh);
    };
    for (const sign of [-1, 1]) {
      const inner = sign * (longRangeBox.fieldX - longRangeBox.depth);
      for (
        let z = -longRangeBox.halfWidth;
        z < longRangeBox.halfWidth;
        z += 0.42
      )
        dash(inner, Math.min(z + 0.15, longRangeBox.halfWidth), 0.3, false);
      for (const side of [-1, 1])
        for (let d = 0; d < longRangeBox.depth; d += 0.42) {
          const length = Math.min(0.3, longRangeBox.depth - d);
          dash(
            sign * (longRangeBox.fieldX - d - length / 2),
            side * longRangeBox.halfWidth,
            length,
            true,
          );
        }
    }
  }
  const makeCannons =
    stadiumTest || street ? () => (_time: number) => {} : goalCannons;
  const coloredSmoke = venue === "topdeck" || venue === "westend";
  const goalColors = [home, matchOpponent].map(
    (club) => new T.Color(clubAccent(club)),
  );
  const westCannons = makeCannons(scene, -fieldX, coloredSmoke),
    eastCannons = makeCannons(scene, fieldX, coloredSmoke);
  let scoringColor = goalColors[0];
  let fireEnd = 0;
  const lingeringSmoke = [
    { age: -1, color: goalColors[0].clone() },
    { age: -1, color: goalColors[0].clone() },
  ];
  function updateLingeringSmoke(dt: number) {
    for (const [i, update] of [westCannons, eastCannons].entries()) {
      const cloud = lingeringSmoke[i];
      if (cloud.age < 0) continue;
      cloud.age += dt;
      update(cloud.age, cloud.color);
      if (cloud.age >= 40) cloud.age = -1;
    }
  }
  function showGoalFire(time: number) {
    westCannons(fireEnd === -1 ? time : -1, scoringColor);
    eastCannons(fireEnd === 1 ? time : -1, scoringColor);
  }
  const matchView = renderer.domElement.parentElement!;
  const freezeFrame = document.createElement("canvas");
  freezeFrame.className = "replay-backdrop";
  freezeFrame.setAttribute("aria-hidden", "true");
  const reducedReplayMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const dissolveLayer = document.createElement("canvas");
  dissolveLayer.className = "replay-dissolve";
  dissolveLayer.setAttribute("aria-hidden", "true");
  const dissolveContext = dissolveLayer.getContext("2d")!;
  let lastAngle = -1,
    lastCursor = 0,
    outgoing: { angle: number; cursor: number; age: number } | null = null;
  function endDissolve() {
    outgoing = null;
    dissolveLayer.remove();
  }
  function renderReplayView() {
    shadow.visible = ball.visible;
    for (const { mesh, sprite } of contactShadows)
      mesh.position.set(
        sprite.position.x + 0.18,
        0.024,
        sprite.position.z + 0.12,
      );
    shadow.position.set(ball.position.x, 0.03, ball.position.z);
    shadow.scale.setScalar(1.15 - 0.16 * (ball.position.y - restingHeight));
    for (const { mesh } of contactShadows) mesh.scale.setScalar(0.7);
    replay.render(renderer, scene);
    for (const { mesh } of contactShadows) mesh.scale.setScalar(1);
  }
  function endReplayInset() {
    matchView.classList.remove("replay-inset");
    freezeFrame.remove();
  }
  function beginReplayInset() {
    matchView.classList.add("in-replay");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const live = renderer.domElement;
    freezeFrame.width = live.width;
    freezeFrame.height = live.height;
    freezeFrame.getContext("2d")?.drawImage(live, 0, 0);
    matchView.prepend(freezeFrame);
    matchView.classList.add("replay-inset");
  }
  renderer.domElement.addEventListener("animationend", (e) => {
    if (e.animationName === "broadcast-in") endReplayInset();
  });
  if (street) {
    customizeCourt(scene, rules.court);
    if (!gulch)
      streetGoalSurrounds(scene, rules.goal.halfWidth, rules.goal.height);
  }
  const homeGoal = createGoal(scene, -fieldX, rules.goal);
  const attackingGoal = createGoal(scene, fieldX, rules.goal);
  let aerial: { index: number; style: string; age: number } | null = null;
  const aerialRecovery = new WeakSet<object>();
  let shotDirection = 1;
  let netTravel = false;
  // Retain source URLs so tutorial opponents can use the matching secondary art
  // even when an animation temporarily selects a shared celebration texture.
  const playerSheetSources = new Map<T.Texture, string>();
  async function loadPlayerSheet(url: string) {
    const map = await new T.TextureLoader().loadAsync(kitSheet(url));
    playerSheetSources.set(map, url);
    return map;
  }
  async function createPlayer(
    name: string,
    displayName: string,
    urls: string[],
    runRows = 8,
    frameSeconds = 0,
    westKickRow = 3,
    jumpUrl?: string,
    tackleUrl?: string,
    reactionUrl?: string,
    reactionFlashUrl?: string,
  ) {
    const maps = await Promise.all(
      urls.map(async (url) => {
        const tex = await loadPlayerSheet(url);
        tex.magFilter = tex.minFilter = T.NearestFilter;
        tex.generateMipmaps = false;
        tex.colorSpace = T.SRGBColorSpace;
        if (broadcast && guestSheets.includes(url))
          broadcastShirt(tex, matchOpponent.name);
        return tex;
      }),
    );

    const [jumpMap, tackleMap, loadedReactionMap, suppliedReactionFlash] =
      await Promise.all(
        [jumpUrl, tackleUrl, reactionUrl, reactionFlashUrl].map((url) =>
          url ? loadPlayerSheet(url) : Promise.resolve(undefined),
        ),
      );
    // Every player can show the tackle stun, even while their reaction art is pending.
    const reactionMap = loadedReactionMap ?? maps[0];
    let reactionFlashMap = suppliedReactionFlash;
    if (reactionMap && !reactionFlashMap) {
      const image = reactionMap.image as HTMLImageElement;
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pixels.data.length; i += 4)
        if (pixels.data[i + 3]) {
          pixels.data[i] = 255 - pixels.data[i];
          pixels.data[i + 1] = 255 - pixels.data[i + 1];
          pixels.data[i + 2] = 255 - pixels.data[i + 2];
        }
      ctx.putImageData(pixels, 0, 0);
      reactionFlashMap = new T.CanvasTexture(canvas);
    }
    for (const map of [jumpMap, tackleMap, reactionMap, reactionFlashMap])
      if (map) {
        map.magFilter = map.minFilter = T.NearestFilter;
        map.generateMipmaps = false;
        map.colorSpace = T.SRGBColorSpace;
      }
    // Measure the front idle pose without its transparent cell padding.
    const idle = maps[0],
      size = idle.image.height,
      measure = document.createElement("canvas");
    measure.width = measure.height = size;
    const ctx = measure.getContext("2d")!;
    ctx.drawImage(idle.image, 0, 0, size, size, 0, 0, size, size);
    const pixels = ctx.getImageData(0, 0, size, size).data;
    let left = size,
      right = -1;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (pixels[(y * size + x) * 4 + 3] > 32) {
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
    idle.userData.bodyWidth = right >= left ? (right - left + 1) / size : 0.55;
    const shirt = new T.SpriteMaterial({
      map: maps[0],
      transparent: true,
      depthWrite: false,
    });
    const sprite = new T.Sprite(shirt);
    sprite.center.set(0.5, 2 / 48);
    sprite.scale.setScalar(2.5);
    // Stubbs averages 40 visible pixels running, versus 43 for the typical outfielder.
    if (urls[0] === stubbsIdle) sprite.userData.matchScale = 1.05;
    scene.add(sprite);
    const runFrames = maps[1]
      ? maps[1].image.width / (maps[1].image.height / runRows)
      : 1;
    return {
      name,
      displayName,
      jumpMap,
      tackleMap,
      reactionMap,
      reactionFlashMap,
      reactionTime: 0,
      sprintCharge: 100,
      staminaCapacity: 100,
      sprintTime: 0,
      sprite,
      maps,
      westKickRow,
      lastSideFace: 2,
      runFrames,
      runRows,
      frameSeconds,
      runClock: 0,
      world: new T.Vector3(),
      face: 2,
      drawFace: 2,
      turnCandidate: 2,
      turnTime: 0,
      lateChallenges: 0,
      penalty: 0,
      age: -1,
      tackling: false,
      shooting: false,
      travel: 0,
      moving: false,
      goal: new T.Vector3(),
      velocity: new T.Vector3(),
    };
  }
  let crossingDrill = false;
  let attackSign = 1,
    half = 1,
    matchSeconds = 0,
    beatRemaining = beatStartSeconds,
    beatPendingEnd = false,
    homeScore = 0,
    awayScore = 0;
  let phase: "kickoff" | "freeKick" | "play" | "halftime" | "fulltime" =
    "kickoff";
  let centerPass = false;
  let kickoffBlue = false,
    breakSeconds = 0,
    lastBlue = false;
  const scoreboard = el("scoreboard");
  scoreboard.dataset.mode = rules.mode;
  const mysteryHud = document.createElement("div");
  const mysteryReveal = document.createElement("div");
  if (mystery) {
    mysteryHud.className = "mystery-hud";
    mysteryHud.innerHTML =
      '<span class="mystery-icon"></span><strong class="mystery-name"></strong><span class="mystery-next"></span><i class="mystery-progress"></i>';
    scoreboard.after(mysteryHud);
    mysteryReveal.className = "mystery-reveal";
    mysteryReveal.setAttribute("role", "status");
    matchView.append(mysteryReveal);
  }
  if (house) {
    const badge = document.createElement("span");
    badge.className = "house-match-label";
    badge.textContent = "HOUSE RULES";
    badge.title = houseSummary(house.config).join("\n");
    scoreboard.append(badge);
  }
  if (firstToFive) scoreboard.dataset.targetScore = String(rules.targetScore);
  scoreboard.style.setProperty("--home-club", clubAccent(home));
  scoreboard.style.setProperty("--away-club", clubAccent(matchOpponent));
  (el("awayCrest") as HTMLImageElement).src = matchOpponent.crest;
  (el("bugCrest") as HTMLImageElement).src = home.crest;
  scoreboard.querySelector(".bug-long")!.textContent = home.name;
  scoreboard.querySelector(".bug-short")!.textContent =
    home === burners
      ? "TBFC"
      : home.name
          .split(" ")
          .filter((w) => w !== "FC")
          .map((w) => w[0])
          .join("");
  scoreboard.querySelector(".bug-away-name")!.textContent = matchOpponent.name;
  el("awayPenalties").setAttribute(
    "aria-label",
    matchOpponent.name + " penalties",
  );
  el("homePenalties").setAttribute("aria-label", home.name + " penalties");
  renderer.domElement.setAttribute(
    "aria-label",
    home.name + " versus " + matchOpponent.name,
  );
  function matchMinute() {
    return firstToFive || beatTheClock
      ? Math.ceil(matchSeconds / 60)
      : Math.min(50, (half - 1) * 25 + Math.ceil(matchSeconds / 60));
  }
  function updateScore() {
    const seconds = Math.min(1500, Math.floor(matchSeconds));
    const text = beatTheClock
      ? `${homeLabel} ${homeScore} – ${awayScore} ${matchOpponent.name} · BEAT THE CLOCK · ${beatClockText(beatRemaining)}`
      : rules.winCondition === "target"
        ? `${homeLabel} ${homeScore} – ${awayScore} ${matchOpponent.name} · ${firstToFive ? `FIRST TO ${rules.targetScore} ${house ? "POINTS" : "GOALS"}` : `STREET ${rules.teamSize}V${rules.teamSize} · ${phase === "fulltime" ? "FULL TIME" : "FIRST TO " + rules.targetScore}`}`
        : homeLabel +
          " " +
          homeScore +
          " – " +
          awayScore +
          " " +
          matchOpponent.name +
          "  ·  " +
          (phase === "fulltime"
            ? "FT"
            : phase === "halftime"
              ? "HT"
              : half + "H") +
          "  " +
          Math.floor(seconds / 60) +
          ":" +
          String(seconds % 60).padStart(2, "0");
    if (scoreboard.getAttribute("aria-label") === text) return;
    scoreboard.setAttribute("aria-label", text);
    scoreboard.title = text;
    el("homeGoals").textContent = String(homeScore);
    el("awayGoals").textContent = String(awayScore);
    el("bugPeriod").textContent = beatTheClock
      ? "CHALLENGE"
      : phase === "fulltime"
        ? "FT"
        : phase === "halftime"
          ? "HT"
          : half === 1
            ? "1ST"
            : "2ND";
    el("bugClock").textContent = beatTheClock
      ? beatClockText(beatRemaining)
      : rules.winCondition === "target"
        ? Math.max(homeScore, awayScore) === rules.targetScore - 1
          ? "MATCH POINT"
          : "FIRST TO " + rules.targetScore
        : Math.floor(seconds / 60) +
          ":" +
          String(seconds % 60).padStart(2, "0");
    scoreboard.toggleAttribute(
      "data-beat-urgent",
      beatTheClock && beatRemaining <= 15,
    );
    if (street)
      el("bugPeriod").textContent = rules.teamSize + "V" + rules.teamSize;
    if (firstToFive) {
      el("bugPeriod").textContent = `FIRST TO ${rules.targetScore}`;
      el("bugClock").textContent = "";
      for (const [id, score] of [
        ["bugPipsHome", homeScore],
        ["bugPipsAway", awayScore],
      ] as const) {
        if (el(id).children.length !== rules.targetScore)
          el(id).replaceChildren(
            ...Array.from({ length: rules.targetScore }, () =>
              document.createElement("i"),
            ),
          );
        const pips = [...el(id).querySelectorAll("i")];
        pips.forEach((pip, i) => pip.classList.toggle("filled", i < score));
        if (score > Number(el(id).dataset.score ?? 0)) {
          const pip = pips[Math.min(score, pips.length) - 1];
          pip?.classList.remove("fresh");
          void pip?.getBoundingClientRect();
          pip?.classList.add("fresh");
        }
        el(id).dataset.score = String(score);
      }
    }
  }
  const labels: Record<string, string> = {
    Meghan: "#6 Meghan",
    Pam: "#8 Pam",
    Stubbs: "#12 STUBBS",
  };
  const makeBurner = async (name: string) => {
    const individual =
      name === "Bjorn"
        ? [bjornHeader, bjornTackle, bjornReaction]
        : name === "Nelson"
          ? [nelsonJump, nelsonTackle, nelsonReaction]
          : undefined;
    const fall = fallSheets[name];
    const actor = await createPlayer(
      labels[name] ?? name,
      name,
      fall ? [...kits[name], fall] : kits[name],
      8,
      name === "Sean" ? 0.14 : 0.2,
      name === "Meghan" ? 3 : 1,
      name === "Pam"
        ? pamHeaderUrl
        : name === "Stubbs"
          ? stubbsHeader
          : individual
            ? individual[0]
            : name === "Chris"
              ? chrisNewHeader
              : name === "Nadia"
                ? nadiaHeader
                : name === "Meghan"
                  ? meghanHeader
                  : name === "Jan"
                    ? janJump
                    : name === "Daniel"
                      ? danielJump
                      : name === "Steven"
                        ? stevenJump
                        : name === "Jeremy"
                          ? jeremyHeader
                          : name === "Mandy"
                            ? mandyHeader
                            : name === "Spencer"
                              ? spencerHeader
                              : undefined,
      name === "Pam"
        ? pamTackleUrl
        : name === "Stubbs"
          ? stubbsTackle
          : name === "José"
            ? joseTackleUrl
            : individual
              ? individual[1]
              : name === "Chris"
                ? chrisNewTackle
                : name === "Nadia"
                  ? nadiaTackle
                  : name === "Meghan"
                    ? meghanTackle
                    : name === "Jan"
                      ? janTackle
                      : name === "Daniel"
                        ? danielTackle
                        : name === "Steven"
                          ? stevenTackle
                          : name === "Jeremy"
                            ? jeremyTackle
                            : name === "Mandy"
                              ? mandyTackle
                              : name === "Spencer"
                                ? spencerTackle
                                : undefined,
      name === "Pam"
        ? pamReactionUrl
        : name === "Stubbs"
          ? stubbsReaction
          : name === "José"
            ? joseReactionUrl
            : individual
              ? individual[2]
              : name === "Chris"
                ? chrisNewReaction
                : name === "Nadia"
                  ? nadiaReaction
                  : name === "Meghan"
                    ? meghanReaction
                    : name === "Jan"
                      ? janReaction
                      : name === "Daniel"
                        ? danielReaction
                        : name === "Steven"
                          ? stevenReaction
                          : name === "Jeremy"
                            ? jeremyReaction
                            : name === "Mandy"
                              ? mandyReaction
                              : name === "Spencer"
                                ? spencerReaction
                                : undefined,
      name === "Pam"
        ? pamReactionFlashUrl
        : name === "Stubbs"
          ? stubbsReactionFlash
          : name === "José"
            ? joseReactionFlashUrl
            : undefined,
    );
    if (name === "Sean" && !street) actor.maps[0].userData.seanKeeper = true;
    if (
      name === "Sean" ||
      name === "Daniel" ||
      name === "Stubbs" ||
      name === "Bjorn"
    )
      actor.maps[0].userData.celebrationScale = 1;
    return actor;
  };
  const trainingSheets = [trainingIdle, trainingRun, trainingKick];
  const guestSheets = [blueIdle, blueRun, blueKick, starsFall];
  const makeKeeper = (name: string) =>
    createPlayer(
      name,
      name,
      [greenKeeperIdle, greenKeeperRun, greenKeeperKick, rivalKeeperFall],
      8,
      0.14,
      1,
    );
  const fleetCelebrations = new WeakMap<
    T.Texture,
    { run: T.Texture; stand: T.Texture; support: T.Texture }
  >();
  async function makeRival(club: Club, name: string, fallback: string[]) {
    const art = rivalSprites(club, name);
    const fall = art?.foul ?? fallback[3];
    const sheets = art
      ? [
          art.idle,
          art.run ?? fallback[1],
          art.kick ?? fallback[2],
          ...(fall ? [fall] : []),
        ]
      : fallback;
    const actor = await createPlayer(
      name,
      name,
      sheets,
      8,
      0.2,
      1,
      art?.jump,
      art?.tackle,
      art?.reaction,
      art?.reactionFlash,
    );
    if (club.name === "Fleet Feet FC" && !rivalWomen[club.name].has(name))
      actor.maps[0].userData.celebrationScale = 0.84;
    if (club.name === "Barely United")
      actor.maps[0].userData.celebrationScale = 1;
    if (club.name === "Onsider Trading FC" && rivalWomen[club.name].has(name))
      actor.maps[0].userData.celebrationScale = 1;
    if (
      club.name === "Inter Your Mom" ||
      club.name === "Net Six & Chill" ||
      club.name === "Atlético Espresso" ||
      club.name === "Whiff City FC" ||
      club.name === "Shooting Stars FC" ||
      club.name === "Trash Pandas FC" ||
      club.name === "Grass Assassins" ||
      club.name === "Crossbar Cowboys" ||
      club.name === "Goal Diggers" ||
      club.name === "Cleatwood Mac" ||
      club.name === "Sweeper Creepers FC"
    )
      actor.maps[0].userData.celebrationScale = 1;
    if (art?.stand && art.support) {
      const [stand, support] = await Promise.all(
        [art.stand, art.support].map(celebrationSheet),
      );
      const run = art.goalRun
        ? await celebrationSheet(art.goalRun)
        : actor.maps[1].clone();
      for (const map of [run, stand, support]) {
        const cell = map.image.height / 8;
        map.userData.cell = cell;
        map.userData.directionalCelebration = true;
        map.repeat.set(cell / map.image.width, 1 / 8);
      }
      if (club.name === "Goal Dancers FC" && rivalWomen[club.name].has(name))
        run.userData.useNativeRunScale = true;
      fleetCelebrations.set(actor.maps[0], { run, stand, support });
    }
    return actor;
  }
  const makeHomePlayer = (name: string) =>
    home === burners ? makeBurner(name) : makeRival(home, name, trainingSheets);
  // Parked teammates are scenery and stay outside the match actor lists.
  const sidelineGuests: { map: T.Texture; face: number }[] = [];
  if (venue === "school" || venue === "southside") {
    const teams = clubs.filter(
      (club) =>
        club.name !== home.name &&
        club.name !== matchOpponent.name &&
        rivalWomen[club.name] &&
        club.outfield.every((name) => rivalSprites(club, name)),
    );
    const club = teams[Math.floor(Math.random() * teams.length)];
    const roster = [...club.outfield, ...club.bench].filter((name) =>
      rivalSprites(club, name),
    );
    const women = roster.filter((name) => rivalWomen[club.name].has(name));
    const men = roster.filter((name) => !rivalWomen[club.name].has(name));
    const take = (pool: string[]) =>
      pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const spots =
      venue === "southside"
        ? [
            [-24.9, -22.4, 1],
            [-23.8, -23.2, 1],
            [-22.9, -21.4, 5],
          ]
        : [
            [-33.7, -4.7, 1],
            [-32.5, -5.3, 1],
            [-31.7, -3.4, 5],
          ];
    await Promise.all(
      [take(men), take(men), take(women)].map(async (name, i) => {
        const actor = await createPlayer(name, name, [
          rivalSprites(club, name)!.idle,
        ]);
        const [x, z, face] = spots[i],
          map = actor.maps[0];
        actor.sprite.position.set(x, 0.06, z);
        map.repeat.set(1 / 8, 1);
        map.offset.x = face / 8;
        sidelineGuests.push({ map, face });
      }),
    );
  }
  if (venue === "westend") {
    const dancers = clubs.find((club) => club.name === "Goal Dancers FC")!;
    const fans = [
      { name: "Elena", x: -20.4, z: -16.15, face: 1 },
      { name: "Rio", x: -19.3, z: -15.95, face: 0 },
      { name: "Arlo", x: -7.9, z: -15.95, face: 0 },
      { name: "Victor", x: 13.2, z: -16, face: 7 },
      { name: "Toby", x: 14.35, z: -16.3, face: 7 },
    ];
    await Promise.all(
      fans.map(async (fan) => {
        const actor = await createPlayer("Supporter", fan.name, [
          rivalSprites(dancers, fan.name)!.idle,
        ]);
        actor.sprite.position.set(fan.x, 0.06, fan.z);
        const map = actor.maps[0];
        map.repeat.set(1 / 8, 1);
        map.offset.x = fan.face / 8;
        sidelineGuests.push({ map, face: fan.face });
      }),
    );
  }
  const fieldPlayers = freePractice
    ? practiceNames
    : celebrationLab
      ? Object.keys(kits).filter((n) => n !== home.keeper)
      : lineup.starters.slice(0, rules.teamSize - rules.goalkeepers);
  const players = await Promise.all(fieldPlayers.map(makeHomePlayer));
  let awayShape = awayLineup
    ? positions(awayLineup.shape)
    : survival
      ? positions(lineup.shape)
      : null;
  const awayStarters = awayLineup?.starters ?? [
    ...matchOpponent.outfield,
    matchOpponent.keeper,
  ];
  const makeAwayPlayer = (name: string) =>
    matchOpponent === burners
      ? makeBurner(name)
      : makeRival(matchOpponent, name, guestSheets);
  const lanes =
    celebrationLab || freePractice || gulchDebug
      ? []
      : (awayShape?.map((p) => -p.lane) ?? [-10, 0, 10, -7, 0, 7]);
  const opponents = await Promise.all(
    (crossingDrill ? [] : lanes).map((_, i) =>
      tutorialLaunch
        ? makeBurner(tutorialScene.away[i])
        : makeAwayPlayer(awayStarters[i]),
    ),
  );
  type SurvivalPlayer = (typeof players)[number];
  let pendingSurvival: {
    side: 0 | 1;
    actor: SurvivalPlayer;
    minute: number;
  } | null = null;
  const survivalHistory: {
    side: 0 | 1;
    name: string;
    team: string;
    minute: number;
  }[] = [];
  const survivalRemoved = [0, 0];
  const survivalStrip = document.createElement("div");
  if (survival) {
    survivalStrip.className = "survival-strip";
    survivalStrip.setAttribute("role", "status");
    scoreboard.after(survivalStrip);
  }
  function renderSurvivalStrip(highlight: 0 | 1 | null = null) {
    if (!survival) return;
    survivalStrip.replaceChildren();
    for (const [side, team] of ([players, opponents] as const).entries()) {
      const row = document.createElement("div");
      row.className =
        "survival-team" + (highlight === side ? " survival-highlight" : "");
      row.style.setProperty(
        "--survival-color",
        clubAccent(side === 0 ? home : matchOpponent),
      );
      const count = team.filter((actor) => !actor.penalty).length;
      const label = document.createElement("b");
      label.textContent = `${count + 1} LEFT`;
      const icons = document.createElement("span");
      icons.className = "survival-icons";
      icons.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 7; i++) {
        const pip = document.createElement("i");
        pip.className = i === 0 ? "keeper" : i <= count ? "active" : "gone";
        icons.append(pip);
      }
      row.append(side === 0 ? label : icons, side === 0 ? icons : label);
      survivalStrip.append(row);
    }
    survivalStrip.setAttribute(
      "aria-label",
      `${home.name} ${players.filter((p) => !p.penalty).length + 1} players remaining; ${matchOpponent.name} ${opponents.filter((p) => !p.penalty).length + 1} players remaining`,
    );
  }
  renderSurvivalStrip();
  function queueSurvivalElimination(side: 0 | 1) {
    if (!survival || pendingSurvival) return;
    const team = side === 0 ? players : opponents;
    const index = selectSurvivalElimination(team, survivalRemoved[side]);
    if (index >= 0)
      pendingSurvival = { side, actor: team[index], minute: matchMinute() };
  }
  function applySurvivalElimination(present = true) {
    if (!pendingSurvival) return false;
    const { side, actor, minute } = pendingSurvival;
    pendingSurvival = null;
    const team = side === 0 ? players : opponents;
    const index = team.indexOf(actor);
    if (index < 0) return false;
    team.splice(index, 1);
    actor.sprite.visible = false;
    actor.moving = false;
    actor.shooting = false;
    actor.tackling = false;
    actor.sprintTime = 0;
    actor.age = -1;
    snowVelocities.delete(actor);
    for (const meter of meters) {
      meter.chain.delete(actor.displayName);
      if (meter.pair.includes(actor.displayName)) meter.pair = "";
    }
    if (side === 0) {
      homeShape = survivalAnchors(homeShape, players.length);
    } else {
      awayShape = survivalAnchors(awayShape!, opponents.length);
      lanes.splice(0, lanes.length, ...awayShape.map((p) => -p.lane));
    }
    for (const seat of seats ?? [])
      if (seat.side === (side === 0 ? -1 : 1)) {
        if (seat.actor === index) seat.actor = -1;
        else if (seat.actor > index) seat.actor--;
      }
    lastHome = lastAway = -1;
    marks = null;
    supportOwner = -1;
    nearCover = farCover = -1;
    survivalRemoved[side]++;
    const club = side === 0 ? home : matchOpponent;
    survivalHistory.push({
      side,
      name: actor.displayName,
      team: club.name,
      minute,
    });
    renderSurvivalStrip(side);
    goalCard.hidden = true;
    if (!present) return true;
    const portrait =
      club === burners
        ? headshots[actor.displayName]
        : rivalHeadshot(club, actor.displayName);
    const template = document.createElement("template");
    template.innerHTML = survivalEliminatedTemplate;
    const reveal =
      template.content.querySelector<HTMLElement>(".survival-reveal")!;
    const face = reveal.querySelector<HTMLElement>("[data-portrait]")!;
    if (portrait) face.style.backgroundImage = `url(${portrait})`;
    else face.append(spriteHeadshot(actor.maps[0].image as HTMLImageElement));
    const shirt = club === burners ? bios[actor.displayName]?.[0] : undefined;
    reveal.querySelector("[data-player]")!.textContent =
      actor.displayName.toUpperCase() + (shirt ? ` #${shirt}` : "");
    reveal.querySelector("[data-remaining]")!.textContent =
      `${team.filter((p) => !p.penalty).length + 1} PLAYERS REMAINING`;
    el("goalPresentation").append(reveal);
    reveal.addEventListener("animationend", (event) => {
      if (event.animationName === "survival-eliminated-fade") reveal.remove();
    });
    return true;
  }
  const outfield = [...players, ...opponents];
  const referee = await createPlayer(
    "Referee",
    "Referee",
    [refereeIdle, refereeRun],
    8,
    0.16,
  );
  referee.sprite.userData.matchScale = 1.14;
  const burnerKeepers = new Map<
    string,
    Awaited<ReturnType<typeof createPlayer>>
  >();
  if (
    !street &&
    (home === burners || matchOpponent === burners || tutorialLaunch)
  ) {
    const keepers = await Promise.all([
      createPlayer(
        "Spencer",
        "Spencer",
        [spencerKeeperIdleUrl, spencerKeeperRunUrl, spencerKeeperKickUrl],
        8,
        0.14,
      ),
      createPlayer(
        "José",
        "José",
        [joseKeeperIdleUrl, joseKeeperRunUrl, joseKeeperKickUrl],
        8,
        0.14,
      ),
    ]);
    for (const actor of keepers) {
      scene.remove(actor.sprite);
      actor.maps[0].userData.keeperName = actor.displayName;
      burnerKeepers.set(actor.displayName, actor);
    }
  }
  // Detached compatibility state for legacy animation math; never a pitch actor,
  // roster slot, replay participant or controllable keeper in keeperless rules.
  const absentKeeper = () => {
    const sprite = players[0].sprite.clone();
    sprite.material = sprite.material.clone();
    sprite.visible = false;
    return {
      ...players[0],
      name: "",
      displayName: "",
      sprite,
      goal: new T.Vector3(),
      velocity: new T.Vector3(),
    };
  };
  const naturalKeeper = street
    ? absentKeeper()
    : await makeHomePlayer(lineup.starters[6]);
  const sean =
    street || celebrationLab
      ? naturalKeeper
      : await makeKeeper(naturalKeeper.displayName);
  if (sean !== naturalKeeper) scene.remove(naturalKeeper.sprite);
  sean.name = naturalKeeper.name;
  const homeSlots = street ? [...players] : [...players, sean];
  const managedLineup = managingAway && awayLineup ? awayLineup : lineup;
  const managedClub = managingAway ? matchOpponent : home;
  const managedPlayer = managingAway ? makeAwayPlayer : makeHomePlayer;
  const reserves = await Promise.all(managedLineup.bench.map(managedPlayer));
  reserves.forEach((m) => scene.remove(m.sprite));
  const matchBench = managedLineup.bench.slice();
  // Keep the pitch slot, ball action and replay sprite stable; identity and fitness travel together.
  const identity = (m: typeof sean) => ({
    name: m.name,
    displayName: m.displayName,
    maps: m.maps,
    jumpMap: m.jumpMap,
    tackleMap: m.tackleMap,
    reactionMap: m.reactionMap,
    reactionFlashMap: m.reactionFlashMap,
    westKickRow: m.westKickRow,
    runFrames: m.runFrames,
    runRows: m.runRows,
    frameSeconds: m.frameSeconds,
    sprintCharge: m.sprintCharge,
    staminaCapacity: m.staminaCapacity,
    lateChallenges: m.lateChallenges,
    penalty: m.penalty,
  });
  const awayGK = street
    ? absentKeeper()
    : await makeKeeper(
        tutorialLaunch ? tutorialScene.awayKeeper : awayStarters[6],
      );
  // Keep the generic keeper art available when another player takes over in goal.
  const genericKeeper = identity(awayGK);
  const homeKeeperArt =
    home === burners && burnerKeepers.get(naturalKeeper.displayName);
  if (!street && !celebrationLab && homeKeeperArt)
    Object.assign(sean, identity(homeKeeperArt));
  else if (
    !street &&
    !celebrationLab &&
    naturalKeeper.maps[0].userData.seanKeeper
  )
    Object.assign(sean, identity(naturalKeeper));
  const awayKeeperArt =
    (matchOpponent === burners || tutorialLaunch) &&
    burnerKeepers.get(awayGK.displayName);
  if (awayKeeperArt) Object.assign(awayGK, identity(awayKeeperArt));
  else if (
    awayGK.displayName === "Sean" &&
    (matchOpponent === burners || tutorialLaunch)
  ) {
    const keeperArt = await makeBurner("Sean");
    scene.remove(keeperArt.sprite);
    Object.assign(awayGK, identity(keeperArt));
  }
  const awaySlots = street ? [...opponents] : [...opponents, awayGK];
  const managedSlots = managingAway ? awaySlots : homeSlots;
  const fieldKeeper = street
    ? naturalKeeper
    : managingAway
      ? await makeAwayPlayer(awayStarters[6])
      : naturalKeeper;
  if (managingAway) scene.remove(fieldKeeper.sprite);
  const squad = new Map(
    [
      ...(street ? managedSlots : [...managedSlots.slice(0, -1), fieldKeeper]),
      ...reserves,
    ].map((m) => [m.displayName, identity(m)]),
  );
  const careerBookings = new Set<string>();
  let careerFouledPlayer: string | undefined;
  const careerGoals: Report["goals"] = [];
  const careerShots: [number, number] = [0, 0],
    onTarget = [0, 0],
    woodwork = [0, 0];
  const highlights: {
    clip: GoalReplay;
    direction: number;
    label: string;
    angle: number;
    card: boolean;
  }[] = [];
  const newFacts = () => ({
    fouls: [0, 0],
    corners: [0, 0],
    yellow: [0, 0],
    tackles: [0, 0],
    passes: [0, 0],
    control: [0, 0],
    metres: [0, 0],
    personalPasses: 0,
    assists: 0,
  });
  let facts = newFacts();
  let lastDelivery: { sender: string; receiver: string } | null = null,
    homePasser = "";
  let goalEvent: { label: string; start: number; direction: number } | null =
    null;
  function keepEvent(
    clip: GoalReplay | null,
    label: string,
    direction: number,
    card = false,
  ) {
    if (!clip) return;
    const first = Math.floor(Math.random() * 4),
      second = (first + 1 + Math.floor(Math.random() * 3)) % 4;
    for (const angle of [first, second])
      highlights.push({ clip, label, direction, angle, card });
  }
  function finishGoalEvent() {
    if (!goalEvent) return;
    keepEvent(
      replay.highlight(goalEvent.start),
      goalEvent.label,
      goalEvent.direction,
    );
    goalEvent = null;
  }
  let fullTimeScreen = false;
  const appearances = new Set(lineup.starters);
  function applyTeam(starters: string[], bench: string[]) {
    if (ticket) for (const name of starters) appearances.add(name);
    // Preserve each player's field artwork when they move into or out of goal.
    for (const actor of managedSlots) {
      const saved = squad.get(actor.displayName)!;
      saved.sprintCharge = actor.sprintCharge;
      saved.staminaCapacity = actor.staminaCapacity;
      saved.lateChallenges = actor.lateChallenges;
      saved.penalty = actor.penalty;
    }
    for (const [i, name] of starters.entries()) {
      const slot = managedSlots[i];
      if (slot.displayName === name) continue;
      const incoming = squad.get(name)!;
      if (rules.goalkeepers && i === 6 && !celebrationLab) {
        const custom = managedClub === burners && burnerKeepers.get(name);
        const keeperArt = custom
          ? identity(custom)
          : incoming.maps[0].userData.seanKeeper
            ? incoming
            : genericKeeper;
        Object.assign(slot, keeperArt);
        slot.name = incoming.name;
        slot.displayName = incoming.displayName;
        slot.sprintCharge = incoming.sprintCharge;
        slot.staminaCapacity = incoming.staminaCapacity;
        slot.lateChallenges = incoming.lateChallenges;
        slot.penalty = incoming.penalty;
      } else Object.assign(slot, incoming);
      slot.sprite.name = name;
      slot.sprite.material.map = slot.maps[0];
    }
    matchBench.splice(0, matchBench.length, ...bench);
  }
  let squadOpen = false;
  const pitchActors = [...outfield, referee, ...(street ? [] : [sean, awayGK])];
  const exhaustionMarkers = [
    ...outfield,
    ...(street ? [] : [sean, awayGK]),
  ].map((actor) => {
    const icon = document.createElement("span");
    icon.className = "exhaustion-marker";
    icon.hidden = true;
    icon.innerHTML = "<b>Z</b><b>Z</b><small>zzz…</small>";
    renderer.domElement.parentElement!.append(icon);
    return { actor, icon };
  });
  let blueCarrier = -1,
    pressTime = 0,
    pressing = -1,
    turnoverGrace = 0,
    noticeTime = 0;
  // Z lanes stay distinct as the block slides toward the ball.

  let bluePass: {
    sender: string;
    receiver: number;
    start: T.Vector3;
    end: T.Vector3;
    age: number;
    duration: number;
    loft?: number;
  } | null = null;
  let surfaceMomentum = 1;
  function groundStep(dt: number, age: number) {
    if (!matchSurface) return dt;
    if (age === 0) surfaceMomentum = 1;
    if (ball.position.y > restingHeight + 0.025) return dt;
    surfaceMomentum = Math.max(
      0.1,
      surfaceMomentum * matchSurface.retention(ball.position, dt),
    );
    return dt * matchSurface.groundSpeed() * surfaceMomentum;
  }
  let blueDecisionTime = 0;
  let dribbleSide = 1;
  const previousPassPosition = new T.Vector3();
  const keeperHomeX = fieldX - 1.4;
  const keeper = awayGK.sprite;
  keeper.position.x = keeperHomeX;
  const homeKeeper = sean.sprite;
  homeKeeper.position.x = -keeperHomeX;
  keeper.name = awayGK.displayName;
  homeKeeper.name = sean.displayName;
  const keepers = street ? [] : [keeper, homeKeeper];
  keeper.visible = !street && !crossingDrill;
  const drillKeeper = keeper;
  // A soft contact shadow grounds each billboard while its artwork stays unlit.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 64;
  const paint = shadowCanvas.getContext("2d")!;
  const fade = paint.createRadialGradient(32, 32, 0, 32, 32, 31);
  fade.addColorStop(0, "rgba(18,26,17,.48)");
  fade.addColorStop(1, "rgba(18,26,17,0)");
  paint.fillStyle = fade;
  paint.fillRect(0, 0, 64, 64);
  const contactMaterial = new T.MeshBasicMaterial({
    map: new T.CanvasTexture(shadowCanvas),
    transparent: true,
    depthWrite: false,
  });
  const footprint = new T.PlaneGeometry(1.8, 1.05);
  const contactShadows = pitchActors
    .map((p) => p.sprite)
    .filter((sprite) => sprite.visible)
    .map((sprite) => {
      const mesh = new T.Mesh(footprint, contactMaterial);
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = -1;
      scene.add(mesh);
      return { mesh, sprite };
    });
  let shot:
    | (ReturnType<typeof planShot> & {
        airFinish?: AirFinish;
        points?: number;
        origin?: { x: number; z: number };
      })
    | null = null;
  let airLooseAttempt: {
    finish: AirFinish;
    scorer: typeof sean | null;
    direction: number;
  } | null = null;
  const airSeatShots = new Map<
    number,
    {
      side: number;
      start: number;
      expires: number;
      power: number;
      gesture: CurveGesture;
    }
  >();
  const burnHud = el("burnHud");
  const burnEnabled =
    !celebrationLab && !broadcast && (!standalonePractice || !!tutorialLaunch);
  burnHud.hidden = !burnEnabled;
  burnHud.dataset.mode = rules.mode;
  const meters = [home, matchOpponent].map((club, i) => {
    const node = document.createElement("div");
    node.className = "burn-meter";
    node.style.setProperty("--club", clubAccent(club));
    node.innerHTML = "<span><i></i></span>";
    node.setAttribute("role", "meter");
    node.setAttribute("aria-label", club.name + " Burn");
    node.setAttribute("aria-valuemin", "0");
    node.setAttribute("aria-valuemax", "100");
    burnHud.append(node);
    if (i === 0) {
      const title = document.createElement("b");
      title.className = "burn-title";
      title.textContent = inferno ? "BURN ∞" : "BURN";
      burnHud.append(title);
    }
    return {
      node,
      value: inferno || (burnLab && i === 0) ? 100 : 0,
      seconds: 0,
      pair: "",
      chain: new Set<string>(),
    };
  });
  let strikeWindup = false;
  let windupBurn = false;
  const aerialApproach = new T.Vector3();
  const aerialContact = new T.Vector3();
  let blastShooter: typeof sean | null = null,
    blastWindup = 0,
    impactTime = 0,
    blastFlying = false;
  const burnWindowSeconds = 20;
  function renderBurn(side: number) {
    const m = meters[side];
    m.node.style.setProperty(
      "--burn",
      String(
        inferno
          ? 1
          : m.value === 100 && m.seconds > 0
            ? m.seconds / burnWindowSeconds
            : m.value / 100,
      ),
    );
    m.node.setAttribute("aria-valuenow", String(m.value));
    m.node.setAttribute(
      "aria-valuetext",
      inferno
        ? "Burn permanently active"
        : m.value === 100 && m.seconds > 0
          ? `Burn available for ${Math.ceil(m.seconds)} more seconds`
          : `${Math.round(m.value)} percent charged`,
    );
    m.node.toggleAttribute("data-on-fire", m.value === 100);
    scoreboard.toggleAttribute(
      side === 0 ? "data-burn-home" : "data-burn-away",
      m.value === 100,
    );
  }
  function resetBurn(side?: number) {
    for (const i of side === undefined ? [0, 1] : [side]) {
      const m = meters[i];
      m.value = inferno || (burnLab && i === 0) ? 100 : 0;
      m.seconds = 0;
      renderBurn(i);
    }
  }
  function changeBurn(delta: number, side = 0) {
    const m = meters[side];
    if (!burnEnabled || crossingDrill || inferno || m.value === 100 || !delta)
      return;
    m.value = T.MathUtils.clamp(m.value + delta, 0, 100);
    if (side === 0 && delta > 0) tutorial?.record("burnCharge");
    if (m.value === 100) {
      if (side === 0) tutorial?.record("burnReady");
      m.seconds = burnWindowSeconds;
      audio.play("burnReady", 0.5);
    }
    renderBurn(side);
  }
  resetBurn();
  let mysteryRevealUntil = 0;
  function applyMysteryModifier(previous?: MysteryId) {
    if (!mystery) return;
    const id = mystery.current.id;
    const wasInferno = inferno;
    inferno = id === "inferno";
    longRange = id === "longRange";
    slippery = id === "blackIce";
    physics = slippery
      ? physicsFor("snowpocalypse")
      : id === "heavyBall"
        ? { ...physicsFor("classic"), ballSpeed: 0.8, rollingResistance: 1.35 }
        : physicsFor("classic");
    for (const mark of longRangeMarks) mark.visible = longRange;
    if (inferno) resetBurn();
    else if (wasInferno) {
      for (const m of meters) {
        m.value = 100;
        m.seconds = burnWindowSeconds;
      }
      renderBurn(0);
      renderBurn(1);
    }
    burnHud.querySelector(".burn-title")!.textContent = inferno
      ? "BURN ∞"
      : "BURN";
    if (id === "secondWind") {
      for (const actor of [...players, ...opponents, sean, awayGK]) {
        actor.sprintCharge = 100;
        actor.staminaCapacity = 100;
      }
    }
    if (previous === "blackIce") snowVelocities.clear();
    mysteryHud.style.setProperty("--mystery-color", mystery.current.color);
    mysteryHud.querySelector(".mystery-icon")!.textContent =
      mystery.current.icon;
    mysteryHud.querySelector(".mystery-name")!.textContent =
      mystery.current.name;
    mysteryReveal.innerHTML = `<strong>MYSTERY MODIFIER!</strong><b>${mystery.current.icon} ${mystery.current.name}</b><span>${mystery.current.description}</span>`;
    mysteryReveal.hidden = false;
    mysteryRevealUntil = performance.now() + 3000;
    audio.menu("open");
  }
  if (mystery) {
    applyMysteryModifier();
    mysteryRevealUntil = Infinity;
  }
  function passBurn(
    side: number,
    from: string,
    to: string,
    base: number,
    fitCost = 0,
    perfect = false,
  ) {
    const m = meters[side],
      pair = [from, to].sort().join("|");
    const club = side === 0 ? home : matchOpponent;
    const link = pairRating(
      club.name,
      from,
      to,
      side === 0 ? ticket?.career.bonds : undefined,
    );
    m.chain.add(from);
    m.chain.add(to);
    changeBurn(
      pair === m.pair
        ? 1
        : base +
            (link >= 70 ? 5 - fitCost : 0) +
            (perfect ? 3 : 0) +
            (m.chain.size === 4 ? 5 : 0),
      side,
    );
    if (m.chain.size >= 4) {
      if (side === 0) tutorial?.record("chemistry");
      m.chain.clear();
      m.chain.add(to);
    }
    m.pair = pair;
  }
  function creditPass(receiver: number, oneTouch: boolean) {
    if (
      lastSender < 0 ||
      receiver === lastSender ||
      !burnEnabled ||
      crossingDrill
    )
      return;
    const from = players[lastSender].displayName,
      to = players[receiver].displayName;
    const fitCost =
      Number(
        !street &&
          outOfPosition(home.name, from, homeShape[lastSender]?.role ?? "GK"),
      ) +
      Number(
        !street &&
          outOfPosition(home.name, to, homeShape[receiver]?.role ?? "GK"),
      );
    passBurn(
      0,
      from,
      to,
      passKind === "through" ? 12 : oneTouch ? 8 : 5,
      fitCost,
      perfectPass,
    );
  }
  const shotStart = new T.Vector3();
  const switchButton = el("switchPlayer") as HTMLButtonElement;
  let reboundRunner = -1;
  let reboundVY = 0;
  let outBall: {
    remaining: number;
    goalEnd: number;
    spot: T.Vector3;
    blueRestart: boolean;
    corner: boolean;
  } | null = null;
  const outVelocity = new T.Vector3();
  function ballOut(dx: number, dy: number, dz: number, miss?: "Wide" | "Over") {
    const goalEnd =
      Math.abs(ball.position.x) > fieldX ? Math.sign(ball.position.x) : 0;
    if (
      (street || (airBalls && !miss)) &&
      goalEnd &&
      Math.abs(ball.position.z) < rules.goal.halfWidth - 0.08 &&
      ball.position.y < rules.goal.height - 0.08
    ) {
      shotDirection = goalEnd;
      scorer = lastBlue
        ? opponents[Math.max(0, blueCarrier >= 0 ? blueCarrier : recentKicker)]
        : players[ballPlayer];
      shotStart.copy(ball.position);
      shotStart.x = goalEnd * (fieldX - 0.02);
      shot = {
        airFinish: airBalls
          ? (airLooseAttempt?.finish ??
            ((goalEnd === attackSign ? lastBlue : !lastBlue)
              ? "OWN GOAL"
              : "GROUNDED"))
          : undefined,
        result: "Goal",
        points: mysteryOn("doublePoints") ? 2 : 1,
        targetX: goalEnd * (fieldX + 0.2),
        targetZ: ball.position.z,
        duration: 0.02,
      };
      if (airBalls && airLooseAttempt?.scorer) scorer = airLooseAttempt.scorer;
      shotTime = 0;
      arc = kickArc(1);
      shotMultiplier = 1;
      held = inFlight = false;
      blueCarrier = -1;
      bluePass = null;
      return;
    }
    const corner =
      !street && !!goalEnd && (goalEnd === attackSign ? lastBlue : !lastBlue);
    lastDelivery = null;
    homePasser = "";
    if (corner) facts.corners[lastBlue ? 0 : 1]++;
    outBall = {
      remaining: stadiumTest ? 5 : freePractice ? 2 : 0.95,
      goalEnd,
      spot: ball.position.clone(),
      blueRestart: !lastBlue,
      corner,
    };
    outVelocity.set(dx, dy, dz);
    cancelCharge();
    endFollowUpRuns();
    clearPassCall();
    perfectPass = false;
    inFlight = false;
    held = false;
    windupReceiver = -1;
    blueCarrier = -1;
    bluePass = null;
    lastSender = -1;
    noticeTime = 0;
    if (freePractice) {
      if (goalEnd && Math.abs(ball.position.z) < 2 && ball.position.y < 2) {
        const net = goalEnd === 1 ? attackingGoal : homeGoal;
        net.strike(ball.position.x, ball.position.y, ball.position.z, 0.5);
        if (curveLab) el("shotResult").textContent = curveStyle + " · GOAL";
        audio.play("net", 0.48);
        outVelocity.multiplyScalar(0.15);
      }
      return;
    }
    el("shotResult").textContent = street
      ? "COURT RESTART"
      : goalEnd
        ? corner
          ? "CORNER"
          : miss
            ? miss.toUpperCase() + " · GOAL KICK"
            : "GOAL KICK"
        : "OUT OF TOUCH";
  }
  let keeperRestart: {
    age: number;
    start: T.Vector3;
    end: T.Vector3;
    punt?: boolean;
    blueBuild?: boolean;
    goalKick?: boolean;
  } | null = null;
  let struckLoose = false,
    afterChallenge = -Infinity,
    suppressTap = false;
  let clearanceLoose = false;
  let keeperStartX = keeperHomeX;
  let keeperStart = 0,
    resultTime = 0,
    ballPlayer = 0;
  const playerScale = 1;
  const ballOffsetX = 0.77 * playerScale,
    ballOffsetZ = 0.52 * playerScale;
  const ring = new T.Mesh(
    new T.RingGeometry(0.48 * playerScale, 0.58 * playerScale, 32),
    new T.MeshBasicMaterial({ color: 0xffce58, side: T.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
  const matchBallSheet = () => (useSnowBall() ? snowBallSheet : ballSheet);
  const ballLoader = new T.TextureLoader();
  const ballMap = await ballLoader.loadAsync(matchBallSheet());
  // Practice can switch weather mid-pass. Keep the current spin frame on the same texture.
  const alternateBall = weatherTest
    ? await ballLoader.loadAsync(useSnowBall() ? ballSheet : snowBallSheet)
    : undefined;
  const initialBallImage = ballMap.image;
  const initiallySnowing = useSnowBall();
  ballMap.magFilter = ballMap.minFilter = T.NearestFilter;
  ballMap.generateMipmaps = false;
  ballMap.colorSpace = T.SRGBColorSpace;
  ballMap.repeat.set(1 / spinFrames, 1 / 4);
  const ball = new T.Sprite(
    new T.SpriteMaterial({
      map: ballMap,
      transparent: true,
      depthWrite: false,
    }),
  );
  ball.center.set(0.5, 0.22);
  scene.add(ball);
  const gesture = new CurveGesture();
  let curveRate = 0,
    fireCurve = false,
    curveStyle = "",
    ballsUsed = 0;
  const practiceBalls: T.Sprite[] = [];
  let pendingCurve: { actor: typeof sean; strike: CurveStrike } | null = null;
  let flightCurve: CurveStrike | null = null;
  let labBend: {
    x: number;
    z: number;
    dx: number;
    dz: number;
    distance: number;
    amplitude: number;
    offset: number;
  } | null = null;
  let awayCharge: { seat: Seat; actor: number; gesture: CurveGesture } | null =
    null;
  let peachShotWindup: { index: number; human: boolean } | null = null;
  const burningBall = createBurningBall(scene);
  const flames = Array.from({ length: 12 }, (_, i) => {
    const sprite = new T.Sprite(
      new T.SpriteMaterial({
        color: i < 4 ? 0xffdd54 : 0xff5616,
        transparent: true,
        depthWrite: false,
        opacity: 1 - i / 14,
        blending: T.AdditiveBlending,
      }),
    );
    sprite.visible = false;
    scene.add(sprite);
    return sprite;
  });
  const replay = new GoalReplay(
    [...pitchActors.map((m) => m.sprite), ball],
    ball,
    pitchActors,
    fieldX,
    [burningBall.fire, ...flames],
    coloredSmoke,
  );
  async function celebrationSheet(url: string) {
    const map = await loadPlayerSheet(url);
    map.minFilter = map.magFilter = T.NearestFilter;
    map.generateMipmaps = false;
    map.colorSpace = T.SRGBColorSpace;
    map.repeat.set(48 / map.image.width, 1);
    return map;
  }
  const [
    pamGoal,
    mandyGoal,
    spiderIdle,
    spiderRun,
    meghanGoal,
    nelsonGoal,
    nelsonGoalRun,
    nelsonGoalSupport,
    janGoal,
    janGoalRun,
    meghanSkate,
    stubbsSlide,
    stevenGoalRun,
    nadiaGoalGroup,
    nadiaGoalRun,
    danielGoalGroup,
    danielGoalRun,
    jeremyGoalGroup,
    stevenGoalGroup,
    pamSkateGoal,
    joseOverhead,
  ] = await Promise.all(
    [
      pamGoalUrl,
      mandyGoalUrl,
      spiderIdleUrl,
      spiderRunUrl,
      meghanGoalUrl,
      nelsonGoalUrl,
      nelsonGoalRunUrl,
      nelsonGoalSupportUrl,
      janGoalUrl,
      janGoalRunUrl,
      meghanSkateUrl,
      stubbsSlideUrl,
      stevenGoalRunUrl,
      nadiaNewGoalStandUrl,
      nadiaNewGoalRunUrl,
      danielGoalGroupUrl,
      danielGoalRunUrl,
      jeremyGoalGroupUrl,
      stevenGoalGroupUrl,
      pamSkateGoalUrl,
      joseOverheadUrl,
    ].map(celebrationSheet),
  );
  const pamSupport = await celebrationSheet(pamSupportUrl);
  const [stubbsGoalStand, stubbsGoalSupport] = await Promise.all(
    [stubbsGoalStandUrl, stubbsGoalSupportUrl].map(celebrationSheet),
  );
  const [chrisGoalRun, chrisGoalStand] = await Promise.all(
    [chrisNewGoalRun, chrisNewGoalStand].map(celebrationSheet),
  );
  for (const map of [chrisGoalRun, chrisGoalStand]) {
    map.repeat.y = 1 / 8;
    map.userData.directionalCelebration = true;
  }
  for (const map of [
    stevenGoalRun,
    nelsonGoalRun,
    nelsonGoalSupport,
    nadiaGoalGroup,
    nadiaGoalRun,
    danielGoalGroup,
    danielGoalRun,
    jeremyGoalGroup,
    stevenGoalGroup,
  ]) {
    map.repeat.y = 1 / 8;
    map.userData.directionalCelebration = true;
  }
  jeremyGoalGroup.repeat.set(60 / jeremyGoalGroup.image.width, 1 / 8);
  jeremyGoalGroup.userData.cell = 60;
  for (const map of [stubbsSlide, stubbsGoalStand, stubbsGoalSupport]) {
    map.repeat.set(64 / map.image.width, 1 / 8);
    map.userData.cell = 64;
    map.userData.directionalCelebration = true;
  }
  stubbsSlide.userData.directionalRun = true;
  const [pamHeader, joseHeader] = await Promise.all(
    [pamHeaderUrl, joseHeaderUrl].map(celebrationSheet),
  );
  pamHeader.repeat.set(1 / 9, 1 / 8);
  joseHeader.repeat.set(1 / 9, 1 / 8);
  const spiderGoalStand = await celebrationSheet(spiderGoalStandUrl);
  spiderIdle.userData.directionalIdle = true;
  for (const map of [spiderRun, spiderGoalStand]) {
    map.repeat.set(56 / map.image.width, 1 / 8);
    map.userData.cell = 56;
    map.userData.directionalCelebration = true;
  }
  spiderRun.userData.directionalRun = true;
  meghanSkate.repeat.y = 1 / 8;
  meghanSkate.userData.directionalRun = true;
  meghanGoal.repeat.set(54 / meghanGoal.image.width, 1 / 8);
  meghanGoal.userData.directionalCelebration = true;
  meghanGoal.userData.cell = 54;
  const [bjornGoalRun, bjornGoalStand] = await Promise.all(
    [bjornGoalRunUrl, bjornGoalStandUrl].map(celebrationSheet),
  );
  const [seanGroup, seanFullDive, seanQuickDive] = await Promise.all(
    [seanGroupUrl, seanFullDiveUrl, seanQuickDiveUrl].map(celebrationSheet),
  );
  const [
    greenGroup,
    greenQuickDive,
    greenFullDive,
    greenCarry,
    greenHold,
    seanCarry,
    seanHold,
  ] = await Promise.all(
    [
      greenGroupUrl,
      greenQuickDiveUrl,
      greenFullDiveUrl,
      greenCarryUrl,
      greenHoldUrl,
      seanCarryUrl,
      seanHoldUrl,
    ].map(celebrationSheet),
  );
  for (const sheet of [greenCarry, greenHold, seanCarry, seanHold])
    sheet.userData.directionalRun = true;
  const joseKeeperPoses = burnerKeepers.has("José")
    ? await Promise.all(
        [joseKeeperDiveUrl, joseKeeperWalkUrl, joseKeeperHoldUrl].map(
          celebrationSheet,
        ),
      )
    : undefined;
  const spencerKeeperPoses = burnerKeepers.has("Spencer")
    ? await Promise.all(
        [spencerKeeperDiveUrl, spencerKeeperWalkUrl, spencerKeeperHoldUrl].map(
          celebrationSheet,
        ),
      )
    : undefined;
  const snowKeeperSheets = new Map<T.Texture, T.Texture>();
  if (useSnowBall() || weatherTest) {
    const snowAssets = import.meta.glob<string>("./art/*-snow.png", {
      eager: true,
      query: "?url",
      import: "default",
    });
    const carryPoses: [T.Texture, string][] = [
      [seanCarry, "sean-carry"],
      [seanHold, "sean-carry-idle"],
      [greenCarry, "rival-keeper-carry"],
      [greenHold, "rival-keeper-carry-idle"],
    ];
    if (joseKeeperPoses)
      carryPoses.push(
        [joseKeeperPoses[1], "jose-keeper-walk"],
        [joseKeeperPoses[2], "jose-keeper-hold"],
      );
    if (spencerKeeperPoses)
      carryPoses.push(
        [spencerKeeperPoses[1], "spencer-keeper-walk"],
        [spencerKeeperPoses[2], "spencer-keeper-hold"],
      );
    await Promise.all(
      carryPoses.map(async ([original, name]) => {
        snowKeeperSheets.set(
          original,
          await celebrationSheet(snowAssets[`./art/${name}-snow.png`]),
        );
      }),
    );
  }
  function keeperDiveSheet(idle: T.Texture, quick: boolean) {
    if (idle.userData.keeperName === "José" && joseKeeperPoses)
      return joseKeeperPoses[0];
    if (idle.userData.keeperName === "Spencer" && spencerKeeperPoses)
      return spencerKeeperPoses[0];
    return idle.userData.seanKeeper
      ? quick
        ? seanQuickDive
        : seanFullDive
      : quick
        ? greenQuickDive
        : greenFullDive;
  }
  const danielSupport = await celebrationSheet(danielSupportUrl);
  for (const map of [
    greenGroup,
    seanGroup,
    danielGoalGroup,
    danielGoalRun,
    danielSupport,
    bjornGoalRun,
    bjornGoalStand,
  ]) {
    const cell = map.image.height / 8;
    map.userData.cell = cell;
    map.userData.directionalCelebration = true;
    map.repeat.set(cell / map.image.width, 1 / 8);
  }
  for (const map of [janGoal, janGoalRun]) {
    map.repeat.set(64 / map.image.width, 1 / 8);
    map.userData.directionalCelebration = true;
    map.userData.cell = 64;
  }
  for (const map of [stevenGoalRun, stevenGoalGroup]) {
    map.userData.cell = 54;
    map.repeat.x = 54 / map.image.width;
  }
  pamSkateGoal.repeat.y = 1 / 8;
  pamSkateGoal.userData.directionalRun = true;
  joseOverhead.repeat.y = 1 / 8;
  mandyGoal.repeat.set(68 / mandyGoal.image.width, 1 / 8);
  mandyGoal.userData.cell = 68;
  mandyGoal.userData.directionalCelebration = true;
  const celebrations: Partial<Record<string, T.Texture>> = {
    Sean: seanGroup,
    Pam: pamGoal,
    Mandy: mandyGoal,
    José: spiderGoalStand,
    Meghan: meghanGoal,
    Bjorn: bjornGoalStand,
    Nelson: nelsonGoal,
    Jan: janGoal,
    Nadia: nadiaGoalGroup,
    Daniel: danielGoalGroup,
    Chris: chrisGoalStand,
    Jeremy: jeremyGoalGroup,
    Steven: stevenGoalGroup,
    Stubbs: stubbsGoalStand,
  };
  const groupCelebrations: Partial<Record<string, T.Texture>> = {
    Sean: seanGroup,
    Pam: pamSupport,
    Mandy: mandyGoal,
    Jan: janGoal,
    Bjorn: bjornGoalStand.clone(),
    Nelson: nelsonGoalSupport,
    Meghan: meghanGoal,
    Nadia: nadiaGoalGroup,
    Daniel: danielSupport,
    Chris: chrisGoalStand,
    Jeremy: jeremyGoalGroup,
    Steven: stevenGoalGroup,
    Stubbs: stubbsGoalSupport,
  };
  const onsiderMaleGoals = new WeakMap<
    T.Texture,
    { run: T.Texture; stand: T.Texture; support: T.Texture }
  >();
  greenGroup.userData.greenKeeperGroup = true;
  const supportMaps = new WeakMap<
    typeof sean,
    { source: T.Texture; map: T.Texture }
  >();
  function supportMap(actor: typeof sean) {
    if (actor.maps[0].userData.keeperName) return undefined;
    const source =
      (actor === sean || actor === awayGK) && !actor.maps[0].userData.seanKeeper
        ? greenGroup
        : (fleetCelebrations.get(actor.maps[0])?.support ??
          onsiderMaleGoals.get(actor.maps[0])?.support ??
          groupCelebrations[actor.displayName]);
    if (!source) return undefined;
    const current = supportMaps.get(actor);
    if (current?.source === source) return current.map;
    current?.map.dispose();
    const map = source.clone();
    map.needsUpdate = true;
    supportMaps.set(actor, { source, map });
    return map;
  }
  const interMaleGoals: Partial<
    Record<string, { run: T.Texture; stand: T.Texture; support: T.Texture }>
  > = {};
  if (
    home.name === "Inter Your Mom" ||
    matchOpponent.name === "Inter Your Mom"
  ) {
    await Promise.all(
      ["Kieran", "Jasper", "Miles", "Ruben", "Alex", "Isaac"].map(
        async (name) => {
          const files = ["run", "stand", "support"].map(
            (action) =>
              interMaleGoalUrls[
                `./art/inter-${name.toLowerCase()}-goal-${action}.png`
              ],
          );
          if (files.some((file) => !file)) return;
          const [run, stand, support] = await Promise.all(
            files.map(celebrationSheet),
          );
          for (const map of [run, stand, support]) {
            map.userData.cell = 64;
            map.userData.directionalCelebration = true;
            map.repeat.set(64 / map.image.width, 1 / 8);
          }
          interMaleGoals[name] = { run, stand, support };
          groupCelebrations[name] = support;
        },
      ),
    );
  }
  if (
    home.name === "Onsider Trading FC" ||
    matchOpponent.name === "Onsider Trading FC"
  ) {
    const actors =
      home.name === "Onsider Trading FC"
        ? [...homeSlots, ...reserves]
        : awaySlots;
    await Promise.all(
      ["Ledger", "Brooks", "Sterling", "Graham", "Miles", "Ellis", "Reid"].map(
        async (name) => {
          const files = ["run", "stand", "support"].map(
            (action) =>
              onsiderMaleGoalUrls[
                `./art/onsider-${name.toLowerCase()}-goal-${action}.png`
              ],
          );
          if (files.some((file) => !file)) return;
          const [run, stand, support] = await Promise.all(
            files.map(celebrationSheet),
          );
          for (const map of [run, stand, support]) {
            map.userData.cell = 48;
            map.userData.directionalCelebration = true;
            map.repeat.set(48 / map.image.width, 1 / 8);
          }
          for (const actor of actors)
            if (actor.displayName === name)
              onsiderMaleGoals.set(actor.maps[0], { run, stand, support });
        },
      ),
    );
  }
  const costumeChange = costumeSmoke(scene);
  const costumeRevealTime = 0.2;
  let costumeReveal = false;
  let runCelebration: T.Texture | undefined;
  const slideDuration = 6;
  const slideDistanceAt = (age: number) =>
    fieldX * (1 - (1 - Math.min(1, Math.max(0, age / slideDuration))) ** 2);
  let slideX = 0,
    slideZ = 0;
  let goalMap: T.Texture | undefined;
  let celebrationRunSeconds = 3.5;
  let groupStarted = false;
  let ownGoalCelebration = false;
  // The camera flashes on frame nine of Mandy’s 200 ms-per-frame animation.
  const photoAt = 3,
    photoStart = photoAt - 9 * 0.2;
  const frontRow = new Set<typeof sean>();
  let scorer: typeof sean | null = null,
    goalAge = 0;
  let celebrant: typeof sean | null = null;
  let walks: {
    actor: typeof sean;
    target: T.Vector3;
    gather: boolean;
    speed: number;
    delay: number;
    phase: number;
  }[] = [];
  let celebrating = false;
  let celebrationSeconds = 0;
  let skipCelebration = false;
  let spectatorPassHeld = false;

  function skipGoalPresentation() {
    if (paused || broadcast || celebrationLab) return;
    if (celebrating) {
      if (celebrationSeconds >= 2) skipCelebration = true;
    } else if (replay.cut >= 0 && !replay.nextAngle()) {
      reset(shotDirection === attackSign, true);
    }
  }
  const goalBanner = el("goalBanner"),
    replayPanel = el("replayPanel");
  function clearReplay(preserveSmoke = false) {
    if (coloredSmoke && preserveSmoke && fireEnd) {
      const cloud = lingeringSmoke[fireEnd === -1 ? 0 : 1];
      cloud.age = 10;
      cloud.color.copy(scoringColor);
    } else if (!preserveSmoke) {
      for (const cloud of lingeringSmoke) cloud.age = -1;
    }
    finishGoalEvent();
    endDissolve();
    lastAngle = -1;
    costumeChange.hide();
    endReplayInset();
    matchView.classList.remove("in-replay");
    fireEnd = 0;
    showGoalFire(-1);
    replay.clear();
    celebrating = false;
    celebrant = null;
    walks = [];
    goalBanner.hidden = replayPanel.hidden = true;
    ring.visible = true;
    nameplate.hidden = true;
    switchButton.disabled = false;
    homeGoal.poseAt(Infinity);
    attackingGoal.poseAt(Infinity);
  }
  const lastBallPosition = new T.Vector3();
  let spinPhase = 0;
  function updateSpin() {
    const dx = ball.position.x - lastBallPosition.x,
      dz = ball.position.z - lastBallPosition.z;
    lastBallPosition.copy(ball.position);
    spinPhase = rollBall(ball, spinPhase, dx, dz, screenRotation());
  }
  const shadow = new T.Mesh(
    new T.CircleGeometry(0.29, 16),
    new T.MeshBasicMaterial({ color: 0x203b2d }),
  );
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);
  const dirs = [
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
    ].map(([x, z]) => [x / Math.hypot(x, z), z / Math.hypot(x, z)]),
    keys = new Set<string>();
  let active = 0,
    held = true,
    inFlight = false,
    paused = false,
    vx = 0,
    vz = 0,
    axisX = 0,
    axisZ = 0,
    joy: number | null = null,
    lastPause = !!menuPad()?.buttons[9]?.pressed;
  let lastSender = -1,
    passTime = 0,
    passDuration = 0.5,
    shotMultiplier = 1;
  const restingHeight = 0.18;
  let arc = kickArc(1),
    shotTime = 0;
  const passStart = new T.Vector3();
  const camTarget = new T.Vector3();
  type PassKind = "pass" | "cross" | "through";
  type Action = PassKind | "shot";
  let windupReceiver = -1;
  let passPower = 0.4;
  let passWasFirstTime = false;
  let tutorialReturnKicker = -1;
  let tutorialTackler: typeof sean | null = null;
  let passKind: PassKind = "pass",
    crossLift = 0;
  const receiverLaunch = new T.Vector3(),
    passTarget = new T.Vector3(),
    assistOffset = new T.Vector3();
  const passHeading = new T.Vector3();
  let turfDeceleration = 4;
  let launchSpeed = 0;
  const faceActions: Action[] = ["pass", "shot", "cross", "through"];
  const padHeld = faceActions.map(() => false);
  let queued: {
    action: Action;
    power: number;
    curve?: CurveStrike | null;
    expires?: number;
  } | null = null;
  let charge: { action: Action; source: string; start: number } | null = null;
  let rushSource: string | null = null;
  let puntHold: { source: string; start: number } | null = null;
  let puntPower: number | null = null;
  let keeperGather = 0;
  let keeperHoldSeconds = 0;
  let keeperSeat: Seat | undefined;
  const keeperActor = () => (keeperSeat?.side === 1 ? awayGK : sean);
  const keeperTeam = () => (keeperSeat?.side === 1 ? opponents : players);
  const keeperDirection = () =>
    keeperSeat?.side === 1 ? -attackSign : attackSign;
  const keeperDepth = () => keeperPanel?.depth ?? 5.4;
  const keeperWidth = () => keeperPanel?.width ?? 4.6;
  let keeperReady = false;
  let outlet = 0;
  let keeperPanel: ReturnType<typeof keeperControls> | undefined;
  function resetKeeperTest() {
    reset();
    keeperReady = true;
    held = false;
    const runner = opponents[1];
    // Leave a clear channel between the attacker and keeper on each repetition.
    for (const defender of players) {
      const pos = defender.sprite.position;
      if (attackSign * pos.x < -9 && Math.abs(pos.z) < 3) {
        pos.z = 4;
        defender.goal.copy(pos);
      }
    }
    runner.sprite.position.set(-attackSign * (fieldX - 6), 0, 0.6);
    runner.goal.copy(runner.sprite.position);
    runner.face = attackSign === 1 ? 6 : 2;
    ball.position.copy(runner.sprite.position);
    ball.position.y = restingHeight;
    camTarget.copy(ball.position);
    el("message").textContent = "";
    keeperPanel!.say(
      "Hold Y to rush the " +
        (keeperPanel!.shot ? "shot" : "runner") +
        " · X changes attack",
    );
  }
  function pickOutlet(step: number) {
    const team = keeperTeam();
    for (let n = 0; n < team.length; n++) {
      outlet = (outlet + step + team.length) % team.length;
      if (!team[outlet].penalty) break;
    }
    keeperPanel?.say(
      team[outlet].displayName +
        " · Left stick / WASD to aim · J/A throw · K/B punt",
    );
  }
  function directionalMate(
    team: typeof players,
    from: T.Vector3,
    x: number,
    z: number,
    eligible: (i: number) => boolean,
  ) {
    const magnitude = Math.hypot(x, z);
    if (magnitude <= 0.22) return -1;
    let best = -1,
      bestScore = -Infinity;
    team.forEach((mate, i) => {
      if (mate.penalty || !eligible(i)) return;
      const dx = mate.sprite.position.x - from.x,
        dz = mate.sprite.position.z - from.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.01) return;
      const alignment = (dx * x + dz * z) / (distance * magnitude);
      if (alignment < 0.5) return;
      const score = alignment * 8 - distance * 0.08;
      if (score > bestScore) {
        best = i;
        bestScore = score;
      }
    });
    return best;
  }
  function aimOutlet(x: number, z: number) {
    const next = directionalMate(
      keeperTeam(),
      keeperActor().sprite.position,
      x,
      z,
      () => true,
    );
    if (next >= 0 && next !== outlet) {
      outlet = next;
      pickOutlet(0);
    }
  }
  function clampKeeper() {
    const p = keeperActor().sprite.position,
      sign = keeperDirection();
    p.x =
      sign *
      T.MathUtils.clamp(sign * p.x, -fieldX + 0.25, -fieldX + keeperDepth());
    p.z = T.MathUtils.clamp(p.z, -keeperWidth(), keeperWidth());
  }
  function cancelRush() {
    rushSource = null;
    puntHold = null;
    puntPower = null;
  }
  function canRush(away = keeperSeat?.side === 1) {
    if (street) return false;
    return (
      !paused &&
      !freePractice &&
      !crossingDrill &&
      (away ? blueCarrier < 0 && !bluePass : !held && !inFlight) &&
      !outBall &&
      !keeperRestart &&
      keeperGather <= 0 &&
      resultTime <= 0 &&
      (!shot || shotDirection === (away ? attackSign : -attackSign)) &&
      (away ? -attackSign : attackSign) * ball.position.x < 0
    );
  }
  const nameplate = el("nameplate"),
    nameText = el("controlled"),
    energy = el("staminaFill"),
    capacity = el("staminaCapacity"),
    meter = el("meter"),
    fill = el("powerFill"),
    headScreen = new T.Vector3();
  function showPower(fraction: number) {
    fill.style.transform = "scaleX(" + fraction + ")";
    meter.hidden = charge === null && queued === null;
    meter.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
  }
  const chargeTimeMs = 650;
  function heldPower(start: number) {
    return T.MathUtils.clamp((performance.now() - start) / chargeTimeMs, 0, 1);
  }
  let rollingPass = false;
  function cancelCharge() {
    awayCharge = null;
    suppressTap = false;
    rollingPass = false;
    queued = null;
    charge = null;
    showPower(0);
  }
  function canChargeLooseShot() {
    return (
      phase === "play" &&
      !paused &&
      !celebrating &&
      !held &&
      !inFlight &&
      blueCarrier < 0 &&
      (!bluePass || !!bluePass.loft) &&
      !outBall &&
      (!keeperRestart ||
        (!keeperRestart.blueBuild && keeperRestart.age >= 0.45)) &&
      keeperGather <= 0 &&
      resultTime <= 0 &&
      (!shot || shotDirection === attackSign)
    );
  }
  const blastMultiplier = 1.95;
  const burnShotVelocityScale = 0.85;
  function canBlast(actor: typeof sean) {
    return (
      meters[0].value === 100 &&
      !crossingDrill &&
      !ownBox(actor.sprite.position)
    );
  }
  const jumps = new Map<typeof sean, number>();
  function jumpHeight(actor: typeof sean) {
    const age = jumps.get(actor);
    return age === undefined
      ? 0
      : Math.sin(Math.PI * Math.min(1, age / 0.72)) * 0.47;
  }
  function jump(actor: typeof sean) {
    if (
      phase === "play" &&
      !paused &&
      !celebrating &&
      !freeKick &&
      !outBall &&
      !shot &&
      replay.cut < 0 &&
      !blastShooter &&
      !actor.penalty &&
      actor.age < 0 &&
      !jumps.has(actor)
    )
      jumps.set(actor, 0);
  }
  function claimAirball() {
    const ballPos = ball.position;
    if (
      ballPos.y < 0.6 ||
      Math.abs(ballPos.x) > fieldX ||
      Math.abs(ballPos.z) > fieldZ
    )
      return false;
    let closest = 0.95 * (airBalls ? airBallsProfile.contact : 1),
      winner: typeof sean | undefined;
    for (const actor of outfield) {
      if (
        !actor.sprite.visible ||
        (tutorial?.chapter === 5 &&
          players.includes(actor) &&
          actor !== players[active]) ||
        actor.penalty ||
        actor.age >= 0 ||
        (inFlight && actor === players[lastSender])
      )
        continue;
      const pos = actor.sprite.position,
        distance = Math.hypot(pos.x - ballPos.x, pos.z - ballPos.z);
      if (ballPos.y > 1 && ballPos.y < 2.5 && distance < 1.5) jump(actor);
      const lift = jumpHeight(actor);
      if (
        (!airBalls && lift < 0.15) ||
        ballPos.y > (1.35 + lift) * (airBalls ? airBallsProfile.contact : 1) ||
        distance >= closest
      )
        continue;
      closest = distance;
      winner = actor;
    }
    if (!winner) return false;
    keeperRestart = null;
    clearanceLoose = struckLoose = false;
    vx = vz = reboundVY = 0;
    const i = players.indexOf(winner);
    if (crossingDrill && training.drill === aerialDrill) {
      if (i !== active) {
        finishRep(0, "Defender won the duel");
        return true;
      }
      if ((charge ?? queued)?.action !== "shot") {
        finishRep(5, "Claimed · charge B before contact");
        return true;
      }
      firstTimeCross = true;
    }
    if (i < 0) {
      const finish = aerialFinish(ball.position.y);
      const buffer = airBalls
        ? [...airSeatShots.entries()].find(
            ([, b]) => b.side === 1 && performance.now() <= b.expires,
          )
        : undefined;
      blueWins(opponents.indexOf(winner), "AIR BALL");
      if (airBalls && (buffer || !seats?.some((s) => s.side === 1))) {
        airIntents.set(winner, { finish, until: performance.now() + 1500 });
        if (buffer) {
          const strike = buffer[1].gesture.finish(meters[1].value === 100);
          pendingCurve = strike ? { actor: winner, strike } : null;
          airShotPower.set(
            winner,
            buffer[1].expires === Infinity
              ? heldPower(buffer[1].start)
              : buffer[1].power,
          );
          airSeatShots.delete(buffer[0]);
        }
        tryBlueShot(false, true);
      }
    } else {
      if (i !== active && !airBalls) cancelCharge();
      if (airBalls && aiHome && !charge && !queued)
        queued = {
          action: "shot",
          power: 0.65,
          expires: performance.now() + 600,
        };
      if (!inFlight) homePasser = "";
      bluePass = null;
      blueCarrier = -1;
      lastBlue = false;
      receivePass(i, true);
    }
    return true;
  }
  function press(action: Action, source: string) {
    if (keeperPanel && !paused) {
      if (action === "cross" && (keeperReady || keeperGather > 0)) {
        keeperPanel.toggle();
        return;
      }
      if (keeperReady) {
        if (action !== "through") return;
        keeperReady = false;
        phase = "play";
        blueCarrier = 1;
        lastBlue = true;
        blueDecisionTime = 3;
        if (keeperPanel.shot) {
          opponents[1].shooting = true;
          opponents[1].age = 0;
          blueCarrier = -1;
          scorer = opponents[1];
          shotStart.copy(scorer.sprite.position);
          shotStart.y = restingHeight;
          ball.position.copy(shotStart);
          shotDirection = -attackSign;
          shotMultiplier = 1.35;
          shotTime = 0;
          keeperStartX = homeKeeper.position.x;
          keeperStart = homeKeeper.position.z;
          shot = {
            result: "Save",
            targetX: keeperStartX,
            targetZ: 0,
            duration: 0.72,
          };
          arc = kickArc(shotMultiplier, shot.duration);
          audio.kick(0.35);
        }
        keeperPanel.say("Meet the ball · R/View to retry");
      }
    }
    if (keeperGather > 0 && !paused) {
      if (!keeperSeat) keeperAction(action);
      return;
    }
    if (tutorial?.capturesInput) return;
    if (blastShooter) return;
    if (!broadcast) audio.unlock();
    if (crossingDrill && (bins.flying || repReset >= 0 || training.count === 5))
      return;
    if ((celebrating || replay.cut >= 0) && action === "pass") {
      if (source !== "auto") skipGoalPresentation();
      return;
    }
    if (players[active]?.reactionTime > 0) return;
    if (freeKick && (freeKick.blue || freeKick.wait > 0)) return;
    if (
      celebrating ||
      replay.cut >= 0 ||
      phase === "halftime" ||
      phase === "fulltime" ||
      (phase === "kickoff" && (kickoffBlue || action === "shot"))
    )
      return;
    if (!paused && action === "through" && !held && !inFlight) {
      keeperSeat = owner(-1, active);
      rushSource = source;
      return;
    }
    if (action === "shot" && rushSource && canRush()) {
      if (!puntHold) puntHold = { source, start: performance.now() };
      return;
    }
    if (
      action === "shot" &&
      canTackle() &&
      !bluePass?.loft &&
      !players[active].penalty
    ) {
      const defender = players[active];
      if (defender.age < 0) {
        const [x, z] = readAim(menuPad());
        defender.face =
          Math.hypot(x, z) > 0.22
            ? facing(x, z)
            : facing(
                ball.position.x - defender.sprite.position.x,
                ball.position.z - defender.sprite.position.z,
                defender.face,
              );
        defender.age = 0;
        defender.tackling = true;
        tutorialTackler = defender;
        tutorial?.record("tackle");
        defender.shooting = false;
      }
      return;
    }
    const looseShot = action === "shot" && canChargeLooseShot();
    if (active !== ballPlayer && !looseShot) return;
    const incoming =
      inFlight || windupReceiver >= 0 || rollingPass || looseShot;
    if (
      paused ||
      (!incoming && (!held || players[active].age >= 0)) ||
      charge ||
      queued !== null
    )
      return;
    suppressTap =
      action === "shot" &&
      held &&
      !incoming &&
      performance.now() - afterChallenge < 350;
    charge = { action, source, start: performance.now() };
    if (action === "shot") {
      pendingCurve = null;
      const [dx, dz] = dirs[players[active].face];
      gesture.reset(Math.atan2(dz, dx));
      const [x, z] = readAim(menuPad());
      gesture.sample(x, z, performance.now());
    }
    showPower(0);
  }
  function release(source: string) {
    if (tutorial?.capturesInput) {
      cancelCharge();
      return;
    }
    if (source === rushSource) {
      cancelRush();
      return;
    }
    if (source === puntHold?.source) {
      puntPower = heldPower(puntHold.start);
      puntHold = null;
      return;
    }
    if (!charge || charge.source !== source) return;
    const fraction = heldPower(charge.start);
    const { action } = charge;
    if (suppressTap && fraction < 0.16) {
      afterChallenge = performance.now();
      cancelCharge();
      return;
    }
    if (
      inFlight ||
      windupReceiver >= 0 ||
      rollingPass ||
      (action === "shot" && canChargeLooseShot())
    ) {
      queued = {
        expires: airBalls
          ? performance.now() + airBallsProfile.inputBufferMs
          : undefined,
        action,
        power: fraction,
        curve:
          action === "shot" ? gesture.finish(canBlast(players[active])) : null,
      };
      charge = null;
      showPower(fraction);
      return;
    }
    if (action === "shot") {
      const actor = players[active];
      const strike = gesture.finish(curveLab ? fireCurve : canBlast(actor));
      pendingCurve = strike ? { actor, strike } : null;
    }
    cancelCharge();
    if (
      freeKick &&
      action !== "shot" &&
      !players.some((m, i) => i !== active && !m.penalty)
    )
      return;
    prepareSetPiece();
    const multiplier = 1 + fraction;
    if (crossingDrill && training.drill === 3) {
      if (action !== "cross") {
        finishRep(0, "Use X / Cross");
        return;
      }
      const [x, z] = readAim(menuPad());
      bins.launch(ball.position, x, z, fraction);
      audio.kick(fraction);
      const actor = players[active];
      actor.moving = false;
      actor.shooting = true;
      actor.age = 0.12;
      held = false;
      return;
    }
    if (action !== "shot") pass(multiplier, action);
    else {
      shotMultiplier = multiplier;
      kick();
    }
  }
  function prepareSetPiece() {
    if (!freeKick) return;
    kickSpot = freeKick.spot;
    freeKick = null;
    phase = "play";
    turnoverGrace = 0.65;
    el("shotResult").textContent = "";
  }
  function facing(x: number, z: number, previous?: number) {
    const angle = Math.atan2(x, z),
      sector = Math.PI / 4;
    if (previous !== undefined) {
      if (x * x + z * z < 0.001) return previous;
      const delta = angle - previous * sector;
      if (
        Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta))) <=
        sector * 0.65
      )
        return previous;
    }
    return (Math.round(angle / sector) + 8) % 8;
  }
  function carry() {
    if (airBalls) airLooseAttempt = null;
    if (kickSpot) {
      ball.position.copy(kickSpot);
      return;
    }
    if (centerPass) {
      ball.position.set(0, restingHeight, 0);
      return;
    }
    const p = players[ballPlayer],
      [dx, dz] = dirs[p.face];
    ball.position.set(
      p.sprite.position.x + dx * ballOffsetX,
      restingHeight,
      p.sprite.position.z + dz * ballOffsetZ,
    );
  }
  const avoidPlayers = [
    ...outfield.map((actor) => actor.sprite),
    ...keepers.filter((goalie) => goalie.visible),
  ];
  const previousFeet = avoidPlayers.map((sprite) => sprite.position.clone());
  const steer = new T.Vector3();
  function updateReferee(dt: number) {
    if (dt <= 0) return;
    const pos = referee.sprite.position;
    // Trail on the far shoulder, moving toward the center when play reaches a boundary.
    const trailing = blueCarrier >= 0 || bluePass ? -attackSign : attackSign;
    const x = T.MathUtils.clamp(
      ball.position.x - trailing * 4,
      -fieldX + 2,
      fieldX - 2,
    );
    const z = T.MathUtils.clamp(
      ball.position.z * 0.72 - 3.8,
      -fieldZ + 2,
      fieldZ - 2,
    );
    steer
      .set(x - pos.x, 0, z - pos.z)
      .multiplyScalar(1.6)
      .clampLength(0, 5.3);
    for (const [i, actor] of avoidPlayers.entries()) {
      if (!actor.visible) continue;
      const foot = actor.position,
        last = previousFeet[i];
      const lead = 0.32 / dt;
      const dx =
        pos.x - foot.x - T.MathUtils.clamp((foot.x - last.x) * lead, -1.7, 1.7);
      const dz =
        pos.z - foot.z - T.MathUtils.clamp((foot.z - last.z) * lead, -1.7, 1.7);
      const distance = Math.hypot(dx, dz);
      if (distance < 3) {
        const weight = ((3 - distance) * 3.5) / Math.max(0.01, distance);
        steer.x += dx * weight;
        steer.z += dz * weight;
      }
      last.copy(foot);
    }
    steer.clampLength(0, 5.8);
    referee.velocity.lerp(steer, 1 - Math.exp(-9 * dt));
    pos.addScaledVector(referee.velocity, dt);
    for (const actor of avoidPlayers) {
      if (!actor.visible) continue;
      const dx = pos.x - actor.position.x,
        dz = pos.z - actor.position.z,
        d = Math.hypot(dx, dz);
      if (d < 1.25) {
        pos.x = actor.position.x + (d ? dx / d : 1) * 1.25;
        pos.z = actor.position.z + (d ? dz / d : 0) * 1.25;
      }
    }
    pos.x = T.MathUtils.clamp(pos.x, -fieldX + 0.5, fieldX - 0.5);
    pos.z = T.MathUtils.clamp(pos.z, -fieldZ + 0.5, fieldZ - 0.5);
    referee.moving = referee.velocity.lengthSq() > 0.22;
    referee.face = referee.moving
      ? facing(referee.velocity.x, referee.velocity.z, referee.face)
      : facing(ball.position.x - pos.x, ball.position.z - pos.z, referee.face);
    referee.runClock = referee.moving ? referee.runClock + dt : 0;
  }
  let supportOwner = -1,
    runner = -1,
    runSide = 1,
    supportTimer = 0,
    returnRunTime = 0;
  const passCall = el("passCall");
  let passCallIndex = -1,
    passCallAt = 0,
    passCallCooldown = 0,
    perfectPass = false;
  function clearPassCall() {
    passCallIndex = -1;
    passCall.hidden = true;
  }
  function passingSpace(x: number, z: number, from: T.Vector3) {
    const dx = x - from.x,
      dz = z - from.z,
      lengthSq = dx * dx + dz * dz;
    let open = 6,
      lane = 4;
    for (const opponent of opponents) {
      if (opponent.penalty) continue;
      const foot = opponent.sprite.position;
      open = Math.min(open, Math.hypot(foot.x - x, foot.z - z));
      const t = T.MathUtils.clamp(
        ((foot.x - from.x) * dx + (foot.z - from.z) * dz) /
          Math.max(0.01, lengthSq),
        0,
        1,
      );
      lane = Math.min(
        lane,
        Math.hypot(foot.x - from.x - t * dx, foot.z - from.z - t * dz),
      );
    }
    return { open, lane };
  }
  let outletRefresh = 0;
  function organizeKeeperOutlets(dt: number) {
    outletRefresh -= dt;
    if (outletRefresh > 0) return;
    outletRefresh = 0.25;
    const foot = homeKeeper.position;
    for (const [i, role] of homeShape.entries()) {
      if (!role.back || players[i].penalty || owner(-1, i)) continue;
      const mate = players[i];
      let best = -Infinity;
      for (const depth of [5, 8, 11]) {
        for (const offset of [0, -2, 2]) {
          const x = T.MathUtils.clamp(foot.x + attackSign * depth, -runX, runX);
          const z = T.MathUtils.clamp(
            role.lane + offset + foot.z * 0.2,
            runNorth,
            runSouth,
          );
          const { open, lane } = passingSpace(x, z, foot);
          const score =
            open +
            1.5 * lane -
            0.22 * Math.abs(offset) -
            0.16 * Math.abs(depth - (role.lane ? 5 : 9)) -
            0.08 *
              Math.hypot(
                x - mate.sprite.position.x,
                z - mate.sprite.position.z,
              );
          if (score > best) {
            best = score;
            mate.goal.set(x, 0, z);
          }
        }
      }
    }
  }
  let homeTactics: StreetTactics = { presser: -1, cover: -1 },
    awayTactics: StreetTactics = { presser: -1, cover: -1 };
  function organizeStreetHome() {
    const result = streetTargets(
      players.map((p) => p.sprite.position),
      ball.position,
      attackSign,
      held || inFlight ? ballPlayer : -1,
      held || inFlight,
      homeShape.map((p) => ({ x: p.depth, z: p.lane })),
      homeTactics,
    );
    homeTactics = result;
    result.targets.forEach((p, i) => {
      if (!(inFlight && i === ballPlayer)) players[i].goal.set(p.x, 0, p.z);
    });
  }
  function organizeAttack(dt: number) {
    if (street) {
      organizeStreetHome();
      return;
    }
    returnRunTime = Math.max(0, returnRunTime - dt);
    if (
      crossingDrill ||
      !held ||
      windupReceiver >= 0 ||
      players[active].age >= 0
    ) {
      supportOwner = -1;
      clearPassCall();
      return;
    }
    const carrier = players[active].sprite.position;
    if (supportOwner !== active) {
      clearPassCall();
      supportOwner = active;
      supportTimer = 0;
      const options = players
        .map((_, i) => i)
        .filter((i) => i !== active && !players[i].penalty);
      if (!options.length) return;
      runner =
        returnRunTime > 0 && options.includes(lastSender)
          ? lastSender
          : options.reduce((a, b) =>
              attackSign *
                (players[a].sprite.position.x - players[b].sprite.position.x) >=
              0
                ? a
                : b,
            );
      runSide = players[runner].sprite.position.z >= carrier.z ? 1 : -1;
      if (Math.abs(carrier.z) > 7) runSide = carrier.z > 0 ? -1 : 1;
    }
    if (Math.abs(carrier.z) > 6) runSide = carrier.z > 0 ? -1 : 1;
    supportTimer -= dt;
    if (supportTimer > 0) return;
    supportTimer = 0.35;
    const occupied = [carrier];
    for (const [i, mate] of players.entries()) {
      if (
        mate.penalty ||
        i === active ||
        (i === lastSender && returnRunTime > 0)
      )
        continue;
      const role = homeShape[i],
        deep = i === runner;
      const side =
        role.lane === 0 ? (deep ? runSide : -runSide) : Math.sign(role.lane);
      const aheadOptions = deep
        ? [6, 9, 12]
        : role.back
          ? [-10, -7, -4]
          : role.front
            ? [1, 4, 7]
            : [-4, -1, 2, 5];
      const widths =
        role.lane === 0
          ? [0, side * 3.5, -side * 3.5, side * 6]
          : [role.lane, role.lane * 0.75, role.lane + side * 1.2];
      let best = -Infinity,
        bestX = 0,
        bestZ = 0;
      for (const ahead of aheadOptions) {
        for (const width of widths) {
          const x = T.MathUtils.clamp(carrier.x + attackSign * ahead, -19, 19);
          const z = T.MathUtils.clamp(
            width + carrier.z * (role.back ? 0.08 : 0.16),
            -10.7,
            10.7,
          );
          const dx = x - carrier.x,
            dz = z - carrier.z,
            lengthSq = dx * dx + dz * dz;
          const { open, lane } = passingSpace(x, z, carrier);
          const crowding = occupied.reduce(
            (cost, spot) =>
              Math.max(
                cost,
                Math.max(0, 4 - Math.hypot(x - spot.x, z - spot.z)),
              ),
            0,
          );
          const stagger =
            role.lane < -0.5
              ? -2.3
              : role.lane > 0.5
                ? 2.3
                : i % 2
                  ? 1.2
                  : -1.2;
          const preferred =
            (deep ? 9 : role.back ? -7 : role.front ? 4 : 0) +
            (deep ? 0 : stagger);
          const value =
            open * 0.9 +
            lane * 1.35 -
            crowding * 3 -
            0.1 * Math.abs(z - role.lane) -
            0.12 * Math.abs(ahead - preferred) -
            0.13 *
              Math.hypot(
                x - mate.sprite.position.x,
                z - mate.sprite.position.z,
              ) -
            0.1 * Math.hypot(x - mate.goal.x, z - mate.goal.z) -
            Math.max(0, 3 - Math.sqrt(lengthSq)) * 2;
          if (value > best) {
            best = value;
            bestX = x;
            bestZ = z;
          }
        }
      }
      mate.goal.set(T.MathUtils.clamp(bestX, -19, 19), 0, bestZ);
      occupied.push(mate.goal);
    }
    const now = performance.now();
    if (passCallIndex >= 0 && now - passCallAt > 1500) {
      clearPassCall();
      passCallCooldown = now + 350;
    }
    if (passCallIndex < 0 && now >= passCallCooldown) {
      let best = -Infinity,
        target = -1;
      for (const [i, mate] of players.entries()) {
        if (i === active || mate.penalty || mate.age >= 0) continue;
        const foot = mate.sprite.position,
          distance = Math.hypot(foot.x - carrier.x, foot.z - carrier.z);
        if (distance < 3 || distance > 17) continue;
        const { open, lane } = passingSpace(foot.x, foot.z, carrier);
        if (open < 2.4 || lane < 1.15) continue;
        const score =
          open +
          lane * 1.5 -
          distance * 0.18 +
          attackSign * (foot.x - carrier.x) * 0.1;
        if (score > best) {
          best = score;
          target = i;
        }
      }
      if (target >= 0) {
        passCallIndex = target;
        passCallAt = now;
        passCall.hidden = false;
      }
    }
  }
  const goalValues = new WeakMap<object, number>();
  const longAttempts = [0, 0],
    twoPointGoals = [0, 0];
  const goalCard = document.createElement("div");
  goalCard.className = "match-goal-card";
  goalCard.setAttribute("role", "status");
  goalCard.hidden = true;
  el("goalPresentation").append(goalCard);
  function showGoalCard() {
    const club = shotDirection === attackSign ? home : matchOpponent;
    const name = scorer?.displayName ?? club.name;
    const portrait =
      club === burners ? headshots[name] : rivalHeadshot(club, name);
    goalCard.innerHTML =
      "<div><strong>Goal</strong><i></i><span></span><em></em></div>";
    goalCard.querySelector("i")!.style.backgroundImage =
      "url(" + matchBallSheet() + ")";
    const face = goalCard.querySelector("span")!;
    if (portrait) face.style.backgroundImage = "url(" + portrait + ")";
    else if (scorer) {
      face.style.backgroundImage = "url(" + scorer.maps[0].image.src + ")";
      face.className = "match-goal-sprite";
    } else face.hidden = true;
    goalCard.querySelector("em")!.textContent = name;
    goalCard.hidden = false;
  }
  function showKickoffPrompt(blue: boolean) {
    const tag = document.createElement("span");
    tag.className = "kickoff-prompt";
    tag.textContent = (blue ? matchOpponent.name : homeLabel) + " Kick Off";
    if (!blue && !aiHome && !crossingDrill)
      tag.textContent += " · " + (menuPad() ? "A" : "J") + " to pass";
    el("message").replaceChildren(tag);
  }
  function finishBeatChallenge() {
    if (!beatTheClock || fullTimeScreen) return;
    beatRemaining = 0;
    beatPendingEnd = false;
    clearReplay();
    celebrating = false;
    goalBanner.hidden = true;
    goalCard.hidden = true;
    replayPanel.hidden = true;
    phase = "fulltime";
    const goals = beatTeam === -1 ? homeScore : awayScore;
    const conceded = beatTeam === -1 ? awayScore : homeScore;
    saveBeatBest({
      goals,
      conceded,
      team: beatTeam === -1 ? home.name : matchOpponent.name,
      difficulty: settings.difficulty,
      players: beatInitialPlayers,
      finishedAt: new Date().toISOString(),
    });
    updateScore();
    audio.play("whistle", 0.75, 0.88);
    audio.finishMatch();
    music?.startBreak();
    fullTimeScreen = true;
    el("pause").setAttribute("disabled", "");
    el("message").textContent = "TIME'S UP!";
    showFullTime();
  }
  function reset(blue = false, afterGoal = false) {
    if (airBalls) {
      airLooseAttempt = null;
      airWasAloft = false;
      airBounceAt = -Infinity;
      airSeatShots.clear();
      for (const actor of [...players, ...opponents]) {
        airIntents.delete(actor);
        airShotPower.delete(actor);
      }
    }
    // Unopposed court practice always returns the ball to the home team.
    if (gulchDebug) blue = false;
    if (beatTheClock && afterGoal && beatPendingEnd) {
      finishBeatChallenge();
      return;
    }
    if (
      !gulchDebug &&
      afterGoal &&
      targetReached(rules, homeScore, awayScore)
    ) {
      applySurvivalElimination(false);
      clearReplay();
      celebrating = false;
      goalBanner.hidden = true;
      goalCard.hidden = true;
      replayPanel.hidden = true;
      phase = "fulltime";
      updateScore();
      audio.finishMatch();
      music?.startBreak();
      fullTimeScreen = true;
      el("pause").setAttribute("disabled", "");
      showFullTime();
      return;
    }
    tutorialReturnKicker = -1;
    goalCard.hidden = !afterGoal;
    lastDelivery = null;
    homePasser = "";
    pendingCurve = flightCurve = awayCharge = null;
    labBend = null;
    curveRate = 0;
    burningBall.clear();
    jumps.clear();
    strikeWindup = false;
    windupBurn = false;
    blastShooter = null;
    blastFlying = false;
    impactTime = 0;
    for (const m of meters) {
      m.chain.clear();
      m.pair = "";
    }
    afterChallenge = -Infinity;
    struckLoose = false;
    finishCard();
    clearReplay(afterGoal);
    const eliminated = afterGoal && applySurvivalElimination();
    freeKick = null;
    kickSpot = null;
    recentHomeKicker = null;
    homeLateTime = 0;
    sean.age = awayGK.age = -1;
    recentKicker = -1;
    lateTime = 0;
    feedbackActor = null;
    callout.hidden = true;
    aerial = null;
    marks = null;
    centerPass = false;
    kickoffBlue = blue;
    phase = "kickoff";
    breakSeconds = eliminated ? 1.8 : 0.9;
    lastBlue = blue;
    supportOwner = -1;
    returnRunTime = 0;
    clearPassCall();
    perfectPass = false;
    if (freePractice) {
      active = 0;
      const spots = [
        [0, 0],
        [4, -4],
        [-4, 4],
        [8, 3],
        [-8, -3],
        [1, 8],
        [-1, -8],
      ];
      players.forEach((actor, i) => {
        actor.sprite.position.set(spots[i][0], 0, spots[i][1]);
        actor.face = 2;
      });
    } else if (crossingDrill) {
      active = 0;
      players[0].sprite.position.set(-10, 0, 1);
      players[0].face = 6;
      players[1].sprite.position.set(-16.6, 0, 0.25);
      players[1].face = 6;
    } else {
      const forwards = homeShape
        .map((p, i) => ({ p, i }))
        .filter(({ p, i }) => p.front && !players[i].penalty);
      active =
        forwards.sort((a, b) => Math.abs(a.p.lane) - Math.abs(b.p.lane))[0]
          ?.i ??
        Math.max(
          0,
          players.findIndex((m) => !m.penalty),
        );
      homeShape.forEach(({ depth, lane }, i) =>
        players[i].sprite.position.set(depth * attackSign, 0, lane),
      );
      players[active].sprite.position.set(blue ? -4 * attackSign : 0, 0, 0);
      for (const m of players) m.face = attackSign === 1 ? 2 : 6;
    }
    cancelRush();
    keeperGather = 0;
    outBall = null;
    windupReceiver = -1;
    keeperRestart = null;
    clearanceLoose = false;
    bluePass = null;
    blueDecisionTime = 0;
    blueCarrier = -1;
    pressTime = 0;
    pressing = -1;
    turnoverGrace = 0.65;
    noticeTime = 0;
    const blueShape = lanes.map((z, i) => [
      awayShape
        ? blue && i === 1
          ? 0
          : -awayShape[i].depth
        : i >= 3
          ? 12
          : i === 1
            ? blue
              ? 0
              : 4
            : 6,
      blue && awayShape && i === 1 ? 0 : z,
    ]);
    opponents.forEach((o, i) => {
      o.sprite.position.set(blueShape[i][0] * attackSign, 0, blueShape[i][1]);
      o.face = attackSign === 1 ? 6 : 2;
      o.goal.copy(o.sprite.position);
      o.moving = false;
    });
    if (blue && opponents[1]?.penalty) {
      const i = opponents.findIndex((o) => !o.penalty);
      if (i >= 0) opponents[i].sprite.position.set(0, 0, 0);
    }
    shotDirection = 1;
    netTravel = false;
    reboundRunner = -1;
    cancelCharge();
    lastSender = -1;
    ballPlayer = active;
    shot = null;
    resultTime = 0;
    el("shotResult").textContent = "";
    awayGK.face = attackSign === 1 ? 6 : 2;
    keeper.position.set(attackSign * keeperHomeX, 0, 0);
    homeKeeper.position.set(-attackSign * keeperHomeX, 0, 0);
    for (const goalie of keepers) goalie.material.rotation = 0;
    const p = players[active];
    held = true;
    inFlight = false;
    vx = vz = 0;
    snowVelocities.clear();
    players.forEach((q) => {
      q.age = -1;
      q.goal.copy(q.sprite.position);
      q.velocity.set(0, 0, 0);
    });
    outfield.forEach((m) => {
      m.tackling = false;
      m.moving = false;
      m.sprintTime = 0;
      m.runClock = 0;
      m.age = -1;
      m.reactionTime = 0;
    });
    ball.position.set(0, restingHeight, 0);
    lastBallPosition.copy(ball.position);
    camTarget.copy(ball.position);
    showKickoffPrompt(blue);
    nameText.textContent = players[active].displayName;
    ring.position.copy(players[active].sprite.position);
    ring.position.y = 0.045;
    updateScore();
    referee.sprite.position.set(
      T.MathUtils.clamp(
        ball.position.x - attackSign * 4,
        -fieldX + 2,
        fieldX - 2,
      ),
      0,
      T.MathUtils.clamp(ball.position.z * 0.72 - 3.8, -fieldZ + 2, fieldZ - 2),
    );
    referee.velocity.set(0, 0, 0);
    referee.runClock = 0;
    referee.moving = false;
    avoidPlayers.forEach((sprite, i) => previousFeet[i].copy(sprite.position));
  }
  function startFollowUpRuns(shooter: number) {
    const nearSide = players[shooter].sprite.position.z >= 0 ? 1 : -1;
    const nearPost = new T.Vector3(
      attackSign * (fieldX - 2.8),
      0,
      nearSide * 1.4,
    );
    let shortest = Infinity;
    for (const [i, mate] of players.entries()) {
      if (
        mate.penalty ||
        i === shooter ||
        (tutorial &&
          !isTutorialParticipant(tutorial.chapter, mate.displayName, false))
      )
        continue;
      const distance = mate.sprite.position.distanceToSquared(nearPost);
      if (distance < shortest) {
        shortest = distance;
        reboundRunner = i;
      }
    }
    let farPostFilled = false,
      trailers = 0;
    for (const [i, mate] of players.entries()) {
      if (
        mate.penalty ||
        i === shooter ||
        (tutorial &&
          !isTutorialParticipant(tutorial.chapter, mate.displayName, false))
      )
        continue;
      if (i === reboundRunner) mate.goal.copy(nearPost);
      else if (!farPostFilled) {
        mate.goal.set(attackSign * (fieldX - 4.2), 0, -nearSide * 2.1);
        farPostFilled = true;
      } else {
        mate.goal.set(
          attackSign * (fieldX - 7 - trailers * 2),
          0,
          trailers === 0 ? 0 : nearSide * 3,
        );
        trailers++;
      }
    }
  }
  function endFollowUpRuns() {
    reboundRunner = -1;
    for (const mate of players) mate.goal.copy(mate.sprite.position);
  }
  const lateTackleWindow = 0.35;
  let recentHomeKicker: typeof sean | null = null,
    homeLateTime = 0;
  let recentKicker = -1,
    lateTime = 0;
  const callout = el("shotFeedback");
  let feedbackActor: (typeof players)[number] | null = null,
    feedbackTime = 0;
  const shotCounts = Array.from({ length: 3 }, () => [0, 0, 0, 0]);
  let shotZone = 0;
  // Keep roster indices stable across a temporary dismissal.
  function nearestEligible(team: typeof players, spot: T.Vector3) {
    let best = -1,
      distance = Infinity;
    team.forEach((mate, i) => {
      const d = mate.sprite.position.distanceToSquared(spot);
      if (!mate.penalty && d < distance) {
        best = i;
        distance = d;
      }
    });
    return best;
  }
  let freeKick: {
    spot: T.Vector3;
    blue: boolean;
    wait: number;
    taker: number;
    victimName: string;
    fallAge: number;
  } | null = null;
  let kickSpot: T.Vector3 | null = null;

  const soundButton = el("sound") as HTMLButtonElement;
  function soundLabel() {
    soundButton.textContent = audio.muted ? "Sound off" : "Sound on";
    soundButton.setAttribute("aria-pressed", String(!audio.muted));
  }
  soundLabel();
  soundButton.onclick = () => {
    audio.setMuted(!audio.muted);
    soundLabel();
  };
  const unlockAudio = () => {
    if (!broadcast) audio.unlock();
  };
  addEventListener("pointerdown", unlockAudio);
  addEventListener("keydown", unlockAudio);
  document.addEventListener("visibilitychange", () => {
    if (intro && document.hidden) intro.setPaused(true);
    audio.state(document.hidden || paused, replay.cut >= 0);
  });
  const cardMap = await new T.TextureLoader().loadAsync(cardSheet);
  cardMap.minFilter = cardMap.magFilter = T.NearestFilter;
  cardMap.generateMipmaps = false;
  cardMap.colorSpace = T.SRGBColorSpace;
  const cardFrames = cardMap.image.width / (cardMap.image.height / 8);
  cardMap.repeat.set(1 / cardFrames, 1 / 8);
  cardMap.userData.directionalCelebration = true;
  // Hold the extended card for a full second after its final animation frame.
  const cardSceneSeconds = (cardFrames - 1) * 0.09 + 1;
  let cardScene: { offender: typeof sean; time: number; start: number } | null =
    null;
  function finishCard() {
    if (cardScene) {
      if (ticket && cardScene.time > 0)
        keepEvent(
          replay.highlight(
            Math.max(cardScene.start - 1, replay.time - 3.5),
            referee.sprite,
          ),
          matchMinute() +
            "′ · " +
            cardScene.offender.displayName +
            " · Yellow Card",
          attackSign,
          true,
        );
      cardScene.offender.sprite.visible = !cardScene.offender.penalty;
    }
    cardScene = null;
    referee.moving = false;
  }
  function advanceCard(dt: number) {
    if (!cardScene) return false;
    const ref = referee.sprite.position,
      offender = cardScene.offender.sprite.position;
    const dx = offender.x - ref.x,
      dz = offender.z - ref.z,
      dist = Math.hypot(dx, dz);
    referee.face = facing(dx, dz, referee.face);
    if (dist > 1.5) {
      const step = Math.min(dist - 1.48, 8 * dt) / dist;
      ref.x += dx * step;
      ref.z += dz * step;
      referee.moving = true;
      referee.runClock += dt;
    } else {
      referee.moving = false;
      cardScene.time += dt;
      if (cardScene.time >= cardSceneSeconds) {
        finishCard();
        return false;
      }
    }
    return true;
  }
  function awardFreeKick(offender: typeof sean, victim: typeof sean) {
    const blue = players.includes(offender),
      team = blue ? opponents : players;
    const spot = victim.sprite.position.clone();
    spot.y = restingHeight;
    const taker = team.indexOf(victim);
    lastDelivery = null;
    homePasser = "";
    if (ticket && players.includes(victim))
      careerFouledPlayer = victim.displayName;
    facts.fouls[blue ? 0 : 1]++;
    lateChallenge(offender);
    if (offender.lateChallenges === 3) facts.yellow[blue ? 0 : 1]++;
    audio.play("whistle", 0.72);
    if (offender.lateChallenges === 3) {
      cardScene = { offender, time: 0, start: replay.time };
      offender.sprite.visible = true;
    }
    phase = "freeKick";
    freeKick = {
      spot,
      blue,
      taker,
      victimName: victim.displayName,
      fallAge: 0,
      wait: offender.penalty ? 2.1 : 1,
    };
    held = false;
    inFlight = false;
    centerPass = false;
    lastSender = windupReceiver = blueCarrier = -1;
    bluePass = null;
    shot = null;
    keeperRestart = null;
    outBall = null;
    keeperGather = resultTime = 0;
    vx = vz = reboundVY = 0;
    clearanceLoose = false;
    homeLateTime = lateTime = 0;
    cancelCharge();
    cancelRush();
    endFollowUpRuns();
    for (const actor of pitchActors) {
      actor.age = -1;
      actor.moving = false;
      actor.tackling = false;
      actor.velocity.set(0, 0, 0);
      snowVelocities.delete(actor);
    }
    ball.position.copy(spot);
    feedbackActor = null;
    callout.hidden = true;
    el("shotResult").textContent = offender.penalty
      ? `${callout.dataset.grade} · ${offender.name} · ${blue ? matchOpponent.name : homeLabel} FREE KICK`
      : "LATE TACKLE";
  }
  function prepareFreeKick() {
    const restart = freeKick!;
    const { blue, taker, spot } = restart,
      team = blue ? opponents : players,
      sign = blue ? -attackSign : attackSign;
    const foot = team[taker].sprite.position;
    foot.set(spot.x - sign * 0.48, 0, spot.z);
    team[taker].face = sign === 1 ? 2 : 6;
    for (const rival of blue ? players : opponents) {
      const pos = rival.sprite.position;
      if (!rival.penalty && Math.hypot(pos.x - spot.x, pos.z - spot.z) < 2.4) {
        pos.x = T.MathUtils.clamp(spot.x + sign * 2.5, -20.7, 20.7);
        if (Math.abs(pos.x - spot.x) < 2.4)
          pos.z = spot.z + (spot.z > 0 ? -2.5 : 2.5);
        rival.goal.copy(pos);
      }
    }
    if (!blue) {
      active = ballPlayer = taker;
      held = true;
      lastBlue = false;
      nameText.textContent = team[taker].displayName;
      ring.position.copy(foot);
      ring.position.y = 0.045;
      el("shotResult").textContent = "FREE KICK · PASS OR SHOOT";
      return;
    }
    let receiver = -1,
      best = -Infinity;
    for (const [i, mate] of team.entries()) {
      if (i === taker || mate.penalty) continue;
      const to = mate.sprite.position;
      const space = Math.min(
        6,
        ...players
          .filter((m) => !m.penalty)
          .map((m) => m.sprite.position.distanceTo(to)),
      );
      const score =
        space - 0.28 * spot.distanceTo(to) + 0.12 * sign * (to.x - spot.x);
      if (score > best) {
        best = score;
        receiver = i;
      }
    }
    phase = "play";
    freeKick = null;
    lastBlue = true;
    turnoverGrace = 0.55;
    if (receiver < 0) {
      blueWins(taker, matchOpponent.name + " BALL");
      return;
    }
    const end = team[receiver].sprite.position.clone();
    end.y = restingHeight;
    team[taker].face = facing(end.x - spot.x, end.z - spot.z);
    team[taker].shooting = true;
    team[taker].age = 0.12;
    audio.kick(0.45);
    bluePass = {
      sender: team[taker].displayName,
      receiver,
      start: spot.clone(),
      end,
      age: 0,
      duration: Math.max(0.2, end.distanceTo(spot) / 8),
    };
    el("shotResult").textContent = "";
  }
  function lateChallenge(actor: typeof sean) {
    actor.lateChallenges++;
    if (ticket && actor.lateChallenges === 3 && players.includes(actor))
      careerBookings.add(actor.displayName);
    const survivalSide = players.includes(actor) ? players : opponents;
    const protectedRoster =
      survival && survivalSide.filter((p) => !p.penalty).length <= 2;
    const red = actor.lateChallenges >= 6 && !protectedRoster,
      yellow = actor.lateChallenges === 3 && !protectedRoster;
    feedbackActor = actor;
    feedbackTime = 1.05;
    callout.hidden = false;
    callout.dataset.grade = red
      ? "RED CARD"
      : yellow
        ? "YELLOW CARD"
        : "WARNING";
    callout.textContent =
      red || yellow
        ? callout.dataset.grade
        : "LATE TACKLE · " + (((actor.lateChallenges - 1) % 3) + 1) + "/3";
    if (street || (!red && !yellow)) return;
    actor.penalty = red ? Infinity : 120;
    if (survival) renderSurvivalStrip();
    actor.sprite.visible = false;
    actor.moving = false;
    actor.age = -1;
    actor.tackling = false;
    actor.goal.copy(actor.sprite.position);
    marks = null;
    supportOwner = -1;
    if (actor === players[active]) {
      const replacement = nearestEligible(players, ball.position);
      if (replacement >= 0) active = replacement;
      cancelCharge();
    }
  }
  function updatePenalties(seconds: number) {
    const rows: [string[], string[]] = [[], []];
    for (const actor of outfield) {
      if (!actor.penalty) continue;
      actor.penalty = Math.max(0, actor.penalty - seconds);
      if (actor.penalty === 0) {
        actor.sprite.visible = true;
        if (survival) renderSurvivalStrip();
        actor.sprite.position.set(0, 0, fieldZ - 0.6);
        actor.goal.copy(actor.sprite.position);
        supportOwner = -1;
        marks = null;
      } else {
        const t = Math.ceil(actor.penalty);
        const home = players.includes(actor),
          red = !Number.isFinite(t);
        const time = red
          ? "RED"
          : Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
        rows[home ? 0 : 1].push(
          `<span class="card-time${red ? " red" : ""}">${home ? actor.displayName : actor.name} <b>${time}</b></span>`,
        );
      }
    }
    for (const [i, id] of ["homePenalties", "awayPenalties"].entries()) {
      const panel = el(id),
        html = rows[i].join("");
      if (panel.innerHTML !== html) panel.innerHTML = html;
    }
  }
  function recordAttempt(result: ReturnType<typeof planShot>["result"]) {
    const counts = shotCounts[shotZone];
    const column =
      result === "Goal"
        ? 0
        : result === "Save"
          ? 1
          : result === "Post" || result === "Crossbar"
            ? 3
            : 2;
    counts[column]++;
    const total = counts.reduce((a, b) => a + b, 0);
    const cells = el("shotStats")
      .querySelectorAll("tbody tr")
      [shotZone].querySelectorAll("td");
    cells[0].textContent = String(total);
    counts.forEach(
      (count, i) =>
        (cells[i + 1].textContent =
          count + " (" + Math.round((100 * count) / total) + "%)"),
    );
  }
  function claimDribble() {
    if (street) return;
    held = false;
    lastSender = -1;
    noticeTime = 0;
    cancelCharge();
    endFollowUpRuns();
    drillKeeper.position.z = T.MathUtils.clamp(ball.position.z, -1.85, 1.85);
    drillKeeper.position.x =
      attackSign *
      T.MathUtils.clamp(
        attackSign * ball.position.x,
        keeperHomeX,
        fieldX - 0.35,
      );
    const start = drillKeeper.position.clone();
    start.x -= attackSign * 0.4;
    start.y = restingHeight;
    startBlueBuild(start);
  }
  function startBlueBuild(start: T.Vector3, goalKick = false) {
    lastDelivery = null;
    homePasser = "";
    cancelCharge();
    held = false;
    inFlight = false;
    blueCarrier = -1;
    bluePass = null;
    clearanceLoose = false;
    vx = vz = reboundVY = 0;
    lastBlue = true;
    const human = seats?.find((s) => s.side === 1);
    if (!goalKick && human) {
      keeperSeat = human;
      cancelRush();
      keeperRestart = null;
      keeper.position.set(start.x + attackSign * 0.45, 0, start.z);
      ball.position.copy(start);
      beginKeeperHold();
      return;
    }
    keeperRestart = {
      start,
      end: start.clone(),
      age: 0,
      blueBuild: true,
      goalKick,
    };
    keeper.position.set(start.x + attackSign * 0.45, 0, start.z);
    ball.position.copy(start);
    el("shotResult").textContent = goalKick ? "GOAL KICK" : "";
  }
  function releaseBlueBuild(start: T.Vector3) {
    let best = -Infinity,
      receiver = -1;
    for (const [i, mate] of opponents.entries()) {
      if (mate.penalty) continue;
      const foot = mate.sprite.position,
        dx = foot.x - start.x,
        dz = foot.z - start.z,
        length = dx * dx + dz * dz;
      if (length < 9 || attackSign * dx >= 0) continue;
      let space = 6,
        lane = 5;
      for (const rival of players) {
        if (rival.penalty) continue;
        const pos = rival.sprite.position;
        space = Math.min(space, Math.hypot(pos.x - foot.x, pos.z - foot.z));
        const t = ((pos.x - start.x) * dx + (pos.z - start.z) * dz) / length;
        if (t > 0 && t < 1)
          lane = Math.min(
            lane,
            Math.hypot(pos.x - start.x - t * dx, pos.z - start.z - t * dz),
          );
      }
      const short = survival ? !!awayShape?.[i].back : i >= 3;
      const score =
        space * 1.8 +
        lane * (short ? 0.9 : 0.35) +
        (short ? 1.3 : 0) +
        Math.random() * 1.2;
      if (score > best) {
        best = score;
        receiver = i;
      }
    }
    if (receiver < 0) {
      keeperRestart = {
        age: 0,
        start,
        end: new T.Vector3(0, restingHeight, 0),
      };
      return;
    }
    const end = opponents[receiver].sprite.position.clone();
    end.y = restingHeight;
    const long = keeperRestart?.goalKick || start.distanceTo(end) > 16;
    audio.kick(0.45);
    bluePass = {
      sender: awayGK.displayName,
      receiver,
      start: start.clone(),
      end,
      age: 0,
      duration: long
        ? Math.max(2.1, start.distanceTo(end) / 10)
        : start.distanceTo(end) / 8,
      loft: long ? 3.6 : 0,
    };
    keeperRestart = null;
    awayGK.face = facing(end.x - start.x, end.z - start.z);
    awayGK.shooting = true;
    awayGK.age = 0.12;
    el("shotResult").textContent = "";
    noticeTime = 0;
  }
  function gatherPunt() {
    if (street) return false;
    if (
      !opponents.length ||
      attackSign * ball.position.x < fieldX - 3 ||
      Math.abs(ball.position.z) > 2.6 ||
      ball.position.y > 1.55
    )
      return false;
    const start = ball.position.clone();
    start.x = attackSign * Math.min(fieldX - 1, attackSign * start.x);
    start.y = restingHeight;
    startBlueBuild(start);
    return true;
  }
  function keeperTouch() {
    if (shot) {
      audio.nearGoal();
      const shootingSide = Number(shotDirection !== attackSign);
      careerShots[shootingSide]++;
      onTarget[shootingSide]++;
    }
    lastDelivery = null;
    homePasser = "";
    const goalie = keeperActor(),
      sign = keeperDirection();
    const foot = goalie.sprite.position;
    const outside = [foot, ball.position].some(
      (pos) =>
        sign * pos.x > -fieldX + keeperDepth() ||
        Math.abs(pos.z) > keeperWidth(),
    );
    const power = puntHold ? heldPower(puntHold.start) : puntPower;
    cancelRush();
    cancelCharge();
    endFollowUpRuns();
    blueCarrier = -1;
    bluePass = null;
    shot = null;
    held = false;
    lastSender = -1;
    clearanceLoose = false;
    vx = vz = reboundVY = 0;
    inFlight = perfectPass = false;
    windupReceiver = -1;
    flightCurve = null;
    lastBlue = goalie === awayGK;
    foot.y = 0;
    goalie.sprite.material.rotation = 0;
    ball.position.set(foot.x + sign * 0.42, restingHeight, foot.z);
    if (outside || power !== null) {
      goalie.face = facing(sign, 0);
      goalie.age = 0.12;
      goalie.shooting = true;
      audio.kick(power ?? 0.85);
      releaseLooseStrike(sign, -foot.z * 0.02, power ?? 0.85);
    } else {
      beginKeeperHold();
    }
    el("shotResult").textContent = "";
    noticeTime = 0;
  }
  function beginKeeperHold() {
    keeperHoldSeconds = 0;
    keeperGather = 1;
    struckLoose = false;
    outlet = nearestEligible(keeperTeam(), keeperActor().sprite.position);
    if (outlet < 0) {
      keeperGather = 0;
      releaseLooseStrike(keeperDirection(), 0, 0.85);
      return;
    }
    pickOutlet(0);
    clampKeeper();
  }
  function keeperAction(action: Action) {
    if (action !== "pass" && action !== "shot") return;
    const [x, z] = keeperSeat ? seatAim(keeperSeat) : readAim(menuPad());
    aimOutlet(x, z);
    if (outlet < 0) return;
    keeperGather = 0;
    distributeKeeperBall(outlet, action === "shot");
    keeperPanel?.say(
      (action === "shot" ? "Punt" : "Throw") +
        " to " +
        keeperTeam()[outlet].displayName +
        " · R/View to retry",
    );
  }
  function distributeKeeperBall(receiver: number, punt: boolean) {
    audio.kick(0.32);
    const goalie = keeperActor(),
      target = keeperTeam()[receiver].sprite.position;
    goalie.face = facing(
      target.x - ball.position.x,
      target.z - ball.position.z,
    );
    goalie.age = 0.12;
    goalie.shooting = true;
    const duration = Math.max(
      0.4,
      ball.position.distanceTo(target) / (punt ? 10 : 13),
    );
    const loft = punt ? 3.8 : 1.1;
    if (goalie === awayGK) {
      const end = target.clone();
      end.y = restingHeight;
      bluePass = {
        sender: goalie.displayName,
        receiver,
        start: ball.position.clone(),
        end,
        age: 0,
        duration,
        loft,
      };
      return;
    }
    homePasser = sean.displayName;
    lastDelivery = null;
    active = ballPlayer = receiver;
    inFlight = true;
    passTime = 0;
    passStart.copy(ball.position);
    receiverLaunch.copy(players[receiver].sprite.position);
    passTarget.copy(players[receiver].sprite.position);
    passTarget.y = restingHeight;
    passKind = "cross";
    passStart.y = 0.82;
    crossLift = loft;
    passDuration = duration / physics.ballSpeed;
    el("shotResult").textContent = "";
  }
  function ownBox(pos: T.Vector3) {
    return attackSign * pos.x <= -16.6 && Math.abs(pos.z) <= 4.6;
  }
  function clearanceFace() {
    const [x, z] = readAim(menuPad());
    return Math.hypot(x, z) > 0.22 ? facing(x, z) : facing(attackSign, 0);
  }
  function releaseLooseStrike(
    dx: number,
    dz: number,
    power: number,
    velocityScale = 1,
  ) {
    labBend = null;
    curveRate = 0;
    flightCurve = null;
    const speed = (7 + 11 * power) * physics.ballSpeed * velocityScale,
      length = Math.hypot(dx, dz) || 1;
    vx = (speed * dx) / length;
    vz = (speed * dz) / length;
    reboundVY = (power >= 0.5 ? 6 + 5 * power : 0) * velocityScale;
    clearanceLoose = struckLoose = true;
    held = inFlight = false;
    shot = null;
  }
  const nextCpuBank = [0, 0];
  let bankReceiver: typeof sean | null = null;
  let bankWindow = 0;
  function tryCpuBank(blue: boolean) {
    const side = Number(blue);
    if (
      !enclosed ||
      phase !== "play" ||
      performance.now() < nextCpuBank[side] ||
      Math.random() >= 0.25
    )
      return false;
    const team = blue ? opponents : players,
      sender = team[blue ? blueCarrier : active];
    const defenders = (blue ? players : opponents)
      .filter((p) => !p.penalty)
      .map((p) => p.sprite.position);
    const clearance = Math.max(0.85, difficulty().laneClearance);
    let bestScore = -Infinity,
      choice = null;
    for (const mate of team) {
      if (
        mate === sender ||
        mate.penalty ||
        mate.age >= 0 ||
        mate.reactionTime > 0
      )
        continue;
      const to = mate.sprite.position;
      const route = planMillBank(
        ball.position,
        to,
        defenders,
        clearance,
        courtBoards,
        rules.goal.halfWidth,
      );
      if (!route) continue;
      const progress =
        (to.x - ball.position.x) * (blue ? -attackSign : attackSign);
      const score = 0.4 * progress - 0.25 * route.distance;
      if (score > bestScore) {
        bestScore = score;
        choice = { mate, route };
      }
    }
    if (!choice) return false;
    const { mate, route } = choice;
    launchBank(
      route.x - ball.position.x,
      route.z - ball.position.z,
      route.power,
      blue,
    );
    bankReceiver = mate;
    bankWindow = 2.5;
    if (blue) {
      recentKicker = team.indexOf(sender);
      lateTime = lateTackleWindow;
    } else {
      recentHomeKicker = sender;
      homeLateTime = lateTackleWindow;
    }
    nextCpuBank[side] = performance.now() + 10000;
    return true;
  }
  function launchBank(dx: number, dz: number, power: number, blue: boolean) {
    const sender = blue ? opponents[blueCarrier] : players[active];
    const index = blue ? blueCarrier : active;
    clearPassCall();
    perfectPass = false;
    windupReceiver = -1;
    kickSpot = null;
    centerPass = false;
    lastBlue = blue;
    lastDelivery = null;
    homePasser = blue ? "" : sender.displayName;
    held = inFlight = false;
    clearanceLoose = struckLoose = true;
    curveRate = 0;
    flightCurve = null;
    const speed = (15 + 8 * power) * physics.ballSpeed,
      length = Math.hypot(dx, dz);
    vx = (speed * dx) / length;
    vz = (speed * dz) / length;
    reboundVY = 0;
    lastSender = blue ? -1 : index;
    blueCarrier = -1;
    bluePass = null;
    rollingPass = !blue;
    sender.face = facing(dx, dz);
    sender.shooting = true;
    sender.age = 0;
    audio.kick(power);
  }
  function kick() {
    const p = players[active];
    if (paused || p.age >= 0 || !held || ballPlayer !== active) return;
    p.face = freePractice
      ? p.face
      : ownBox(p.sprite.position)
        ? clearanceFace()
        : facing(
            attackSign * fieldX - p.sprite.position.x,
            -p.sprite.position.z,
          );
    p.shooting = true;
    p.age = 0;
  }
  function returnTutorialLob(sender: typeof sean, target: number) {
    // Use the same live flight, interception, aerial-claim and loose-ball path as X crosses.
    // No possession handoff or ball reset: aim at the receiver's current position.
    cancelCharge();
    blueCarrier = -1;
    bluePass = null;
    windupReceiver = -1;
    held = false;
    inFlight = true;
    rollingPass = clearanceLoose = struckLoose = false;
    perfectPass = false;
    homePasser = "";
    lastSender = players.indexOf(sender);
    tutorialReturnKicker = opponents.indexOf(sender);
    active = ballPlayer = target;
    passKind = "cross";
    passWasFirstTime = false;
    passPower = 0.45;
    passTime = 0;
    passStart.copy(ball.position);
    receiverLaunch.copy(players[target].sprite.position);
    passTarget.copy(receiverLaunch);
    passTarget.y = restingHeight;
    passDuration =
      Math.max(0.55, (passStart.distanceTo(passTarget) / 8 / 1.45) * 1.35) /
      physics.ballSpeed;
    crossLift = 1.35 + 0.45 * passPower;
    arc = mysteryKickArc(1.45, passDuration);
    vx = vz = reboundVY = 0;
    sender.face = facing(
      passTarget.x - passStart.x,
      passTarget.z - passStart.z,
    );
    sender.shooting = true;
    sender.age = 0.12;
    audio.kick(passPower);
  }
  function receivePass(collector: number, aerialFinish: boolean) {
    if (airBalls) {
      const buffer = [...airSeatShots.entries()].find(
        ([, b]) => b.side === -1 && performance.now() <= b.expires,
      );
      if (buffer) {
        queued = {
          action: "shot",
          power:
            buffer[1].expires === Infinity
              ? heldPower(buffer[1].start)
              : buffer[1].power,
          curve: buffer[1].gesture.finish(canBlast(players[collector])),
          expires: performance.now() + 600,
        };
        airSeatShots.delete(buffer[0]);
      }
    }
    if (
      tutorial &&
      !isTutorialParticipant(
        tutorial.chapter,
        players[collector].displayName,
        false,
      )
    ) {
      const target =
        lastSender >= 0 &&
        lastSender !== collector &&
        !players[lastSender].penalty &&
        isTutorialParticipant(
          tutorial.chapter,
          players[lastSender].displayName,
          false,
        )
          ? lastSender
          : players.findIndex(
              (actor, i) =>
                i !== collector &&
                !actor.penalty &&
                isTutorialParticipant(
                  tutorial.chapter,
                  actor.displayName,
                  false,
                ),
            );
      if (target >= 0) {
        returnTutorialLob(players[collector], target);
        return;
      }
    }
    tutorialReturnKicker = -1;
    const receiver = players[collector].displayName;
    if (homePasser && homePasser !== receiver && (inFlight || rollingPass)) {
      facts.passes[0]++;
      tutorial?.record("receive");
      tutorial?.record(
        passKind === "through"
          ? "throughReceived"
          : passKind === "cross"
            ? "crossReceived"
            : "passCompleted",
      );
      if (ticket && homePasser === ticket.career.player) facts.personalPasses++;
      lastDelivery = { sender: homePasser, receiver };
    }
    homePasser = "";
    if (airBalls && queued?.expires && performance.now() > queued.expires)
      queued = null;
    const intent = charge
      ? {
          action: charge.action,
          power: heldPower(charge.start),
          curve:
            charge.action === "shot"
              ? gesture.finish(canBlast(players[collector]))
              : null,
        }
      : queued;
    const intended = collector === ballPlayer;
    if (
      (receiver === "Pam" || receiver === "José") &&
      intent &&
      (aerialFinish || ball.position.y > 0.6)
    ) {
      aerial = { index: collector, style: "HEADER", age: 0 };
      tutorial?.record("header");
      aerialRecovery.add(players[collector]);
    }
    if (inFlight && intended) creditPass(collector, passWasFirstTime);
    if (crossingDrill && inFlight) {
      if (training.drill === 0) {
        const distance = passStart.distanceTo(
          players[collector].sprite.position,
        );
        const correct = collector === practiceTarget && passKind === "pass";
        finishRep(
          correct
            ? Math.min(
                20,
                12 +
                  Math.round(distance / 2) +
                  Math.max(0, 3 - Math.round(Math.abs(passPower - 0.3) * 6)),
              )
            : 0,
          correct ? "Connected" : "Wrong pass",
        );
      } else if (training.drill === 2) {
        firstTimeCross =
          collector === practiceTarget &&
          passKind === "cross" &&
          intent?.action === "shot";
        if (!firstTimeCross) finishRep(0, "Set up the first touch");
      }
    }
    cancelCharge();
    active = ballPlayer = collector;
    held = true;
    inFlight = false;
    if (intent?.action === "shot") {
      const actor = players[collector],
        goalX = attackSign * fieldX;
      pendingCurve = intent.curve ? { actor, strike: intent.curve } : null;
      const backToGoal = dirs[actor.face][0] * attackSign < -0.35;
      const halfVolley =
        airBalls &&
        performance.now() - airBounceAt <= airBallsProfile.halfVolleyMs;
      const style = halfVolley
        ? "HALF-VOLLEY"
        : aerialFinish
          ? ball.position.y > 0.85 && backToGoal && intent.power >= 0.65
            ? "BICYCLE KICK"
            : ball.position.y >= 1.12
              ? "HEADER"
              : "VOLLEY"
          : null;
      if (airBalls) {
        airIntents.set(actor, {
          finish: (style ?? "GROUNDED") as AirFinish,
          until: performance.now() + 1500,
        });
        airBounceAt = -Infinity;
        airWasAloft = false;
      }
      if (style) {
        aerial = { index: collector, style, age: 0 };
        if (style === "HEADER") tutorial?.record("header");
        aerialRecovery.add(players[collector]);
        el("shotResult").textContent = style;
        noticeTime = 0.65;
      }
      if (!freePractice) {
        if (ownBox(actor.sprite.position)) actor.face = clearanceFace();
        else if (style !== "BICYCLE KICK")
          actor.face = facing(
            goalX - actor.sprite.position.x,
            -actor.sprite.position.z,
          );
      }
      actor.age = 0.12;
      actor.shooting = true;
      shotMultiplier = 1 + intent.power;
      if (style && !(crossingDrill && training.drill === aerialDrill)) {
        beginStrikeWindup(actor, style, canBlast(actor));
      } else launchShot(actor);
    } else {
      if (
        airBalls &&
        performance.now() - airBounceAt <= airBallsProfile.halfVolleyMs
      )
        airIntents.set(players[collector], {
          finish: "HALF-VOLLEY",
          until: airBounceAt + airBallsProfile.halfVolleyMs,
        });
      carry();
      if (intent && intended) {
        players[collector].age = -1;
        pass(1 + intent.power, intent.action, true);
      }
    }
  }
  function beginStrikeWindup(actor: typeof sean, style: string | null, burn: boolean) {
    held = false;
    inFlight = false;
    blastShooter = actor;
    strikeWindup = true;
    windupBurn = burn;
    aerialApproach.copy(ball.position);
    // Aim the moving ball at the contact pose, then release it on that frame.
    const contactAge = style === "HEADER" ? 0.30 : 0.24;
    const animationDuration = ["Pam", "José"].includes(actor.displayName)
      ? headerAnimationSeconds
      : 0.42;
    const lift = style
      ? Math.sin(Math.PI * contactAge / animationDuration) *
        (style === "VOLLEY" ? 0.19 : 0.305)
      : 0;
    const [fx, fz] = dirs[actor.face];
    const length = Math.hypot(fx, fz);
    const reach = style === "HEADER" ? 0.18 : 0.40;
    aerialContact.set(
      actor.sprite.position.x + fx / length * reach,
      (style === "HEADER" ? 1.30 : style === "BICYCLE KICK" ? 1.05 : style ? 0.40 : restingHeight) + lift,
      actor.sprite.position.z + fz / length * reach,
    );
    if (style) jumps.delete(actor);
    blastWindup = 0;
    actor.age = 0;
    actor.shooting = true;
  }
  function launchShot(shooter: (typeof players)[number], blast = false) {
    if (!blast && canBlast(shooter)) {
      shooter.face = facing(
        attackSign * fieldX - shooter.sprite.position.x,
        -shooter.sprite.position.z,
      );
      const style = aerial && players[aerial.index] === shooter ? aerial.style : null;
      beginStrikeWindup(shooter, style, true);
      return;
    }
    tutorial?.record("shot");
    if (blast) tutorial?.record("special");
    if (blast) {
      shotMultiplier = blastMultiplier;
      impactTime = 0.08;
      blastFlying = true;
      if (aerial) audio.kick(1);
    } else audio.kick(shotMultiplier - 1);
    if (airBalls && kickSpot)
      airIntents.set(shooter, {
        finish: "DIRECT FREE KICK",
        until: performance.now() + 1500,
      });
    if (airBalls)
      airLooseAttempt = {
        finish: airIntent(shooter),
        scorer: shooter,
        direction: attackSign,
      };
    kickSpot = null;
    recentHomeKicker = shooter;
    homeLateTime = lateTackleWindow;
    scorer = shooter;
    replay.markStrike(shooter.sprite, ball.position);
    held = false;
    inFlight = false;
    lastBlue = false;
    shotStart.copy(ball.position);
    const power = shotMultiplier - 1;
    const curve = pendingCurve?.actor === shooter ? pendingCurve.strike : null;
    if (curve) tutorial?.record("curve");
    pendingCurve = null;
    flightCurve = null;
    curveRate = 0;
    if (
      curveLab ||
      (curve &&
        (freePractice ||
          ownBox(shooter.sprite.position) ||
          Math.cos(curve.aim) * attackSign < 0.3))
    ) {
      const aim = curve?.aim ?? gesture.aim;
      releaseLooseStrike(
        Math.cos(aim),
        Math.sin(aim),
        power,
        blast ? burnShotVelocityScale : 1,
      );
      curveRate = (curve?.rate ?? 0) * (mysteryOn("superCurve") ? 2 : 1);
      curveStyle = curve?.style ?? "Straight";
      if (curveLab && curve) {
        const dx = Math.cos(aim),
          dz = Math.sin(aim);
        const distance = (attackSign * fieldX - ball.position.x) / dx;
        if (Number.isFinite(distance) && distance > 0 && Math.abs(dx) > 0.15) {
          labBend = {
            x: ball.position.x,
            z: ball.position.z,
            dx,
            dz,
            distance,
            amplitude:
              -Math.sign(curve.rate) *
              Math.min(distance * 0.25, Math.abs(curve.rate) * distance * 0.18),
            offset: 0,
          };
          curveRate = 0;
        }
      }
      reboundVY = (2 + power * 3) * (blast ? burnShotVelocityScale : 1);
      el("shotResult").textContent =
        curveStyle + " · " + Math.round(power * 100) + "%";
      return;
    }
    if (freePractice) {
      const [x, z] = dirs[shooter.face];
      releaseLooseStrike(x, z, power, blast ? burnShotVelocityScale : 1);
      return;
    }
    if (crossingDrill && training.drill === 0)
      finishRep(0, "Use a ground pass");
    if (ownBox(shooter.sprite.position)) {
      if (crossingDrill) finishRep(0, "Outside shooting range");
      const [dx, dz] = dirs[shooter.face];
      releaseLooseStrike(dx, dz, power, blast ? burnShotVelocityScale : 1);
      el("shotResult").textContent = "";
      noticeTime = 0;
      return;
    }
    const longShot =
      longRange &&
      longRangeEligible(ball.position.x, ball.position.z, attackSign);
    const dx = attackSign * fieldX - ball.position.x;
    if (
      !blast &&
      Math.hypot(dx, ball.position.z) >
        ((7 + 11 * power) *
          physics.ballSpeed *
          (longShot ? longRangeBalance.velocity : 1)) **
          2 /
          (12 * physics.rollingResistance)
    ) {
      if (crossingDrill) finishRep(0, "Short of goal");
      releaseLooseStrike(
        curve ? Math.cos(curve.aim) : dx,
        curve ? Math.sin(curve.aim) : -ball.position.z,
        power,
        blast ? burnShotVelocityScale : 1,
      );
      curveRate = (curve?.rate ?? 0) * (mysteryOn("superCurve") ? 2 : 1);
      curveStyle = curve?.style ?? "Straight";
      return;
    }
    const defendingKeeper = keeper;
    keeperStartX = defendingKeeper.position.x;
    keeperStart = defendingKeeper.position.z;
    const range = Math.hypot(
      fieldX - attackSign * shooter.sprite.position.x,
      shooter.sprite.position.z,
    );
    shotZone = range < 7 ? 0 : range < 14 ? 1 : 2;
    shotDirection = attackSign;
    shot = planShot(
      attackSign * ball.position.x,
      ball.position.z,
      keeperStart,
      shotMultiplier - 1,
      fieldX,
      attackSign * shooter.sprite.position.x,
      attackSign * keeperStartX,
      Math.random,
      defendingKeeper.visible,
      blast
        ? (keeperStart >= 0 ? -1 : 1) * (1.1 + Math.random() * 0.52)
        : undefined,
      blast
        ? 0
        : (house
            ? shotProfile(shooter, attackSign).error
            : (mysteryOn("shootOnSight") ? 0.82 : 1) /
              (airBalls ? airAccuracy(airIntent(shooter)) : 1)) /
            trainingFactor(shooter.displayName, "Shooting"),
      rules.goal.halfWidth,
      street && !blast
        ? streetShotAim(
            ball.position.z,
            fieldX - attackSign * ball.position.x,
            dirs[shooter.face][0] * attackSign,
            dirs[shooter.face][1],
          )
        : undefined,
      longShot || mysteryOn("shootOnSight"),
      house?.keeperFactor ?? (mysteryOn("theWall") ? 0.72 : 1),
    );
    shot.points = goalValue(
      mysteryOn("doublePoints")
        ? "doublePoints"
        : longRange
          ? "longRange"
          : rules.mode,
      ball.position.x,
      ball.position.z,
      attackSign,
    );
    if (mysteryOn("doublePoints")) shot.points = 2;
    shot.origin = { x: ball.position.x, z: ball.position.z };
    if (airBalls) {
      shot.airFinish = airIntent(shooter);
      airIntents.delete(shooter);
    }
    if (curve) applyCurve(curve, attackSign);
    if (blast)
      shot.duration = T.MathUtils.clamp(shot.duration * 0.46, 0.17, 0.38);
    const grade = shotFeedback(
      shot.result,
      range,
      shotMultiplier - 1,
      Math.abs(shot.targetZ - keeperStart),
    );
    feedbackActor = grade ? shooter : null;
    feedbackTime = 1.05;
    callout.hidden = !grade;
    if (grade) {
      callout.textContent = grade;
      callout.dataset.grade = grade;
    }
    shot.targetX *= attackSign;
    if (!celebrationLab) startFollowUpRuns(active);
    if (longShot)
      shot.duration = Math.max(
        Math.hypot(shot.targetX - shotStart.x, shot.targetZ - shotStart.z) /
          longRangeBalance.maxShotSpeed,
        shot.duration / longRangeBalance.velocity,
      );
    if (house || slippery || mysteryOn("heavyBall"))
      shot.duration = Math.max(
        0.08,
        Math.hypot(shot.targetX - shotStart.x, shot.targetZ - shotStart.z) / 45,
        shot.duration / physics.ballSpeed,
      );
    if (house) {
      const tuning = houseShotProfile(
        house.config,
        longRange && shot.points === 2,
        airBalls ? airAccuracy(shot.airFinish ?? "GROUNDED") : 1,
      );
      shot.duration /=
        tuning.speed /
        (longRange && shot.points === 2 ? longRangeBalance.velocity : 1);
      shot.duration = Math.max(
        0.08,
        shot.duration,
        Math.hypot(shot.targetX - shotStart.x, shot.targetZ - shotStart.z) / 45,
      );
    } else {
      if (mysteryOn("shootOnSight")) shot.duration /= 1.15;
      if (airBalls && airAccuracy(shot.airFinish ?? "GROUNDED") > 1)
        shot.duration /= airBallsProfile.shotSpeed;
    }
    if (blast) shot.duration /= burnShotVelocityScale;
    arc = mysteryKickArc(shotMultiplier, blast ? shot.duration : Infinity);
    shotTime = 0;
  }
  // The initial tangent comes from the locked aim. Accumulating lateral
  // displacement makes a poorly aimed bend miss the mouth of the goal.
  let bendOffset = 0;
  function applyCurve(curve: CurveStrike, direction: number) {
    if (!shot) return;
    const dx = direction * fieldX - ball.position.x;
    const duration = Math.max(
      0.15,
      Math.abs(dx) /
        (12 * shotMultiplier * Math.max(0.3, Math.abs(Math.cos(curve.aim)))),
    );
    bendOffset =
      direction *
      curve.rate *
      (house
        ? Math.max(
            house.has("superCurve") ? 2 : 1,
            longRange && shot.points === 2 ? longRangeBalance.curve : 1,
          )
        : (mysteryOn("superCurve") ? 2 : 1) *
          (longRange && shot.points === 2 ? longRangeBalance.curve : 1)) *
      Math.abs(dx) *
      duration *
      0.39;
    const endZ = ball.position.z + dx * Math.tan(curve.aim) + bendOffset;
    shot.result =
      Math.abs(endZ) > rules.goal.halfWidth + 0.08
        ? "Wide"
        : Math.abs(endZ) >= rules.goal.halfWidth - 0.08
          ? "Post"
          : "Goal";
    shot.targetZ = endZ;
    shot.targetX = fieldX + 0.02;
    shot.duration = duration;
    flightCurve = curve;
    el("shotResult").textContent = curve.style;
  }
  function canTackle() {
    return (
      phase === "play" &&
      !paused &&
      !held &&
      !inFlight &&
      !shot &&
      !outBall &&
      !keeperRestart &&
      keeperGather <= 0 &&
      resultTime <= 0 &&
      (blueCarrier >= 0 || bluePass !== null)
    );
  }
  function canSwitch() {
    return (
      phase === "play" &&
      !paused &&
      players[active].reactionTime <= 0 &&
      keeperGather <= 0 &&
      !outBall &&
      !held &&
      !inFlight &&
      !shot &&
      resultTime <= 0 &&
      (!keeperRestart || keeperRestart.age >= 0.45)
    );
  }
  function switchPlayer() {
    if (tutorial?.capturesInput) return;
    if (!canSwitch()) return;
    const nearest =
      tutorial?.chapter === 5
        ? players.reduce((best, actor, i) => {
            if (actor.penalty || !tutorialDefenders.includes(actor.displayName))
              return best;
            return best < 0 ||
              actor.sprite.position.distanceToSquared(ball.position) <
                players[best].sprite.position.distanceToSquared(ball.position)
              ? i
              : best;
          }, -1)
        : nearestEligible(players, ball.position);
    if (nearest < 0) return;
    players[active].goal.copy(players[active].sprite.position);
    if (active !== nearest) tutorial?.record("switch");
    active = nearest;
  }
  function tackleReaction(actor: typeof sean | undefined) {
    if (!actor) return;
    actor.reactionTime = 0.5;
    actor.age = -1;
    actor.tackling = false;
    actor.shooting = false;
    actor.moving = false;
    actor.sprintTime = 0;
  }
  function blueWins(index: number, reason: string) {
    if (airBalls) airLooseAttempt = null;
    if ((reason.includes("TACKLE WON") || reason === "SPRINT STRIP") && held)
      tackleReaction(players[ballPlayer]);
    lastDelivery = null;
    homePasser = "";
    if (!lastBlue) changeBurn(-15);
    if (reason.includes("TACKLE WON") || reason === "INTERCEPTED")
      changeBurn(6, 1);
    meters[0].chain.clear();
    meters[0].pair = "";
    windupReceiver = -1;
    cancelCharge();
    endFollowUpRuns();
    returnRunTime = 0;
    clearPassCall();
    perfectPass = false;
    lastBlue = true;
    bluePass = null;
    blueDecisionTime = difficulty().reactionDelayMs / 1000;
    blueCarrier = index;
    held = false;
    inFlight = false;
    lastSender = -1;
    pressTime = 0;
    turnoverGrace = 0.7;
    dribbleSide = opponents[index].sprite.position.z > 0 ? -1 : 1;
    el("shotResult").textContent = "";
    noticeTime = 0;
  }
  function spendSprint(actor: typeof sean, dt: number) {
    if (curveLab || mysteryOn("secondWind"))
      return dt * (mysteryOn("superSprint") ? 1.35 : 1);
    const duration =
      sprintSeconds *
      trainingFactor(
        actor.displayName,
        "Stamina",
        players.includes(actor) ? home.name : matchOpponent.name,
      );
    const charged = Math.min(dt, (actor.sprintCharge * duration) / 100);
    const remaining = Math.max(
      0,
      actor.staminaCapacity -
        charged * capacityLossPerSecond * rules.staminaDrain,
    );
    const extra = Math.min(
      dt - charged,
      remaining / (exhaustedLossPerSecond * rules.staminaDrain),
    );
    actor.sprintCharge = Math.max(
      0,
      actor.sprintCharge - (charged * 100) / duration,
    );
    actor.staminaCapacity = Math.max(
      0,
      remaining - extra * exhaustedLossPerSecond * rules.staminaDrain,
    );
    return (charged + extra) * (mysteryOn("superSprint") ? 1.35 : 1);
  }
  function hasEscapeLane(carrier: typeof sean, distance: number) {
    if (distance < 2 || carrier.staminaCapacity <= 0) return false;
    const continuing = carrier.sprintTime > 0;
    if (
      !continuing &&
      carrier.sprintCharge < Math.min(25, carrier.staminaCapacity)
    )
      return false;
    const dx = carrier.velocity.x / distance,
      dz = carrier.velocity.z / distance;
    let chased = false;
    for (const defender of players) {
      if (defender.penalty) continue;
      const x = defender.sprite.position.x - carrier.sprite.position.x,
        z = defender.sprite.position.z - carrier.sprite.position.z;
      const along = x * dx + z * dz,
        side = Math.abs(z * dx - x * dz);
      if (along > 0.25 && along < 4.5 && side < 1.75) return false;
      const reach = carrier.sprintCharge <= 0.001 ? 2.8 : continuing ? 5 : 3.8;
      if (along <= 0.25 && side < 2.4 && Math.hypot(x, z) < reach)
        chased = true;
    }
    return (
      chased && (carrier.sprintCharge > 0.001 || carrier.staminaCapacity > 30)
    );
  }
  function keepAwayLooseBall() {
    return (
      tutorial?.chapter === 5 &&
      !held &&
      !inFlight &&
      !shot &&
      !bluePass &&
      blueCarrier < 0 &&
      !outBall &&
      !keeperRestart &&
      keeperGather <= 0 &&
      resultTime <= 0
    );
  }
  function moveBlue(dt: number) {
    const ballPos = ball.position;
    const streetPlan = street
      ? streetTargets(
          opponents.map((p) => p.sprite.position),
          ballPos,
          -attackSign,
          blueCarrier,
          blueCarrier >= 0 || !!bluePass,
          lanes.map((z) => ({ x: 0, z })),
          awayTactics,
        )
      : null;
    if (streetPlan) awayTactics = streetPlan;
    // Favor the current presser until another defender is clearly better placed.
    const cost = (i: number) =>
      opponents[i].penalty ||
      (tutorial &&
        !isTutorialParticipant(
          tutorial.chapter,
          opponents[i].displayName,
          true,
        ))
        ? Infinity
        : Math.hypot(
            opponents[i].sprite.position.x - ballPos.x,
            opponents[i].sprite.position.z - ballPos.z,
          ) +
          0.32 * Math.abs(lanes[i] - ballPos.z) -
          (i === pressing ? 1.6 : 0);
    const nearest =
      streetPlan?.presser ??
      opponents.reduce((best, _, i) => (cost(i) < cost(best) ? i : best), 0);
    if (nearest !== pressing) {
      pressing = nearest;
      pressTime = 0;
    }
    for (const [i, o] of opponents.entries()) {
      const blueBack = survival ? !!awayShape?.[i].back : i >= 3;
      const blueFront = survival ? !!awayShape?.[i].front : i < 3;
      const pos = o.sprite.position;
      if (o.penalty || o.age >= 0 || o.reactionTime > 0) {
        o.moving = false;
        o.sprintTime = 0;
        snowVelocities.delete(o);
        continue;
      }
      const human = owner(1, i);
      if (human && !(keeperGather > 0 && human === keeperSeat)) {
        driveSeat(human, dt);
        continue;
      }
      if (o === bankReceiver) o.goal.copy(pos);
      else if (
        keeperRestart?.blueBuild ||
        (keeperGather > 0 && keeperActor() === awayGK)
      ) {
        const depth = survival
          ? blueBack
            ? 12
            : blueFront
              ? -5
              : 2
          : i < 3
            ? [-5, -8, -5][i]
            : [12, 8, 12][i - 3];
        o.goal.set(attackSign * depth, 0, lanes[i]);
      } else if (blueCarrier === i) {
        const clearLongLane =
          longRange &&
          !players.some(
            (p) =>
              !p.penalty && p.sprite.position.distanceToSquared(pos) < 4.5 ** 2,
          );
        const attackDepth = clearLongLane
          ? fieldX - longRangeBox.depth - 1.2
          : 18;
        if (attackSign * pos.x > -attackDepth + 1)
          o.goal.set(
            -attackDepth * attackSign,
            0,
            T.MathUtils.clamp(pos.z + dribbleSide * 2, -9, 9),
          );
        else {
          if (Math.abs(pos.z - dribbleSide * 9) < 0.5) dribbleSide *= -1;
          o.goal.set(-(attackDepth + 0.5) * attackSign, 0, dribbleSide * 9);
        }
      } else if (blueCarrier >= 0 || bluePass) {
        const lead = bluePass
          ? bluePass.end
          : opponents[blueCarrier].sprite.position;
        if (bluePass?.receiver === i) o.goal.copy(bluePass.end);
        else {
          const depth = blueBack ? -6 : 5;
          o.goal.set(
            -attackSign *
              T.MathUtils.clamp(
                -attackSign * lead.x + depth,
                blueBack ? -18 : -12,
                blueBack ? 10 : 18,
              ),
            0,
            lanes[i] + lead.z * 0.08,
          );
        }
      } else if (i === nearest) {
        o.goal.set(ballPos.x, 0, ballPos.z);
      } else {
        o.goal.set(
          attackSign *
            T.MathUtils.clamp(
              attackSign * ballPos.x + (blueBack ? 7 : -1),
              -13,
              18,
            ),
          0,
          T.MathUtils.lerp(
            ballPos.z,
            lanes[i] + T.MathUtils.clamp(ballPos.z * 0.28, -2.5, 2.5),
            difficulty().defensiveShape,
          ),
        );
      }
      if (streetPlan && bluePass?.receiver !== i && o !== bankReceiver)
        o.goal.set(streetPlan.targets[i].x, 0, streetPlan.targets[i].z);
      const coaching =
        tutorial &&
        tutorialCoaching.target(
          tutorial.chapter,
          o.displayName,
          i,
          ballPos,
          tutorial.speaking,
          true,
          tutorialTime,
          tutorialDefenders,
          keepAwayLooseBall(),
        );
      if (coaching && blueCarrier !== i && bluePass?.receiver !== i)
        o.goal.set(coaching.x, 0, coaching.z);
      if (
        tutorial &&
        blueCarrier === i &&
        !isTutorialParticipant(tutorial.chapter, o.displayName, true)
      )
        o.goal.copy(pos);
      if (
        tutorial?.chapter === 5 &&
        blueCarrier === i &&
        isTutorialParticipant(5, o.displayName, true)
      ) {
        // Shield and move laterally within the kickaround instead of running at goal.
        o.goal.set(
          T.MathUtils.clamp(pos.x - attackSign * 2, -10, 10),
          0,
          T.MathUtils.clamp(pos.z + dribbleSide * 3, -8, 8),
        );
        if (Math.abs(pos.z) > 7.5) dribbleSide = -Math.sign(pos.z);
      }
      o.goal.x = T.MathUtils.clamp(
        o.goal.x,
        enclosed ? -runX : -20.4,
        enclosed ? runX : 20.4,
      );
      o.goal.z = T.MathUtils.clamp(
        o.goal.z,
        enclosed ? runNorth : -11.4,
        enclosed ? runSouth : 11.4,
      );
      if (slippery) {
        const pace = i === blueCarrier ? 2.9 : i === nearest ? 3.65 : 2.8;
        o.velocity.subVectors(o.goal, pos);
        o.sprintTime =
          i === blueCarrier && hasEscapeLane(o, o.velocity.length())
            ? spendSprint(o, dt)
            : 0;
        const speed =
          pace + ((6 - pace) * o.sprintTime) / Math.max(dt, 0.000001);
        const desired = approachVelocity(
          pos,
          o.goal,
          speed * trainingFactor(o.displayName, "Pace", matchOpponent.name),
        );
        if (Math.hypot(desired.x, desired.z) > 0.1)
          o.face = facing(desired.x, desired.z, o.face);
        moveOnSnow(o, desired, dt);
        continue;
      }
      o.velocity.subVectors(o.goal, pos);
      const distance = o.velocity.length();
      o.moving = distance > (o.moving ? 0.1 : 0.32);
      if (o.moving) {
        o.face = facing(o.velocity.x, o.velocity.z, o.face);
        o.sprintTime =
          tutorial?.chapter !== 5 &&
          i === blueCarrier &&
          hasEscapeLane(o, distance)
            ? spendSprint(o, dt)
            : 0;
        const pace = i === blueCarrier ? 2.9 : i === nearest ? 3.65 : 2.8;
        pos.addScaledVector(
          o.velocity,
          Math.min(
            1,
            ((pace * dt + (6 - pace) * o.sprintTime) *
              trainingFactor(o.displayName, "Pace", matchOpponent.name)) /
              distance,
          ),
        );
      } else {
        o.sprintTime = 0;
        o.face = facing(ballPos.x - pos.x, ballPos.z - pos.z, o.face);
      }
    }
    if (
      tutorial &&
      (tutorial.speaking ||
        !tutorialAllowsChallenges(tutorial.chapter) ||
        !isTutorialParticipant(
          tutorial.chapter,
          opponents[nearest].displayName,
          true,
        ))
    )
      return;
    const carrier = held
      ? players[ballPlayer]
      : homeLateTime > 0.18
        ? recentHomeKicker
        : null;
    const defender = opponents[nearest];
    if (
      held &&
      carrier?.sprintTime > 0 &&
      turnoverGrace <= 0 &&
      !defender.penalty &&
      defender.age < 0 &&
      defender.reactionTime <= 0 &&
      defender.sprite.position.distanceTo(carrier.sprite.position) < 0.82
    ) {
      blueWins(nearest, "SPRINT STRIP");
      return;
    }
    if (
      !owner(1, nearest) &&
      carrier &&
      turnoverGrace <= 0 &&
      !defender.penalty &&
      defender.age < 0 &&
      defender.reactionTime <= 0
    ) {
      const target = held ? ballPos : carrier.sprite.position;
      const dx = target.x - defender.sprite.position.x,
        dz = target.z - defender.sprite.position.z;
      pressTime = Math.hypot(dx, dz) < 1.85 ? pressTime + dt : 0;
      if (pressTime >= difficulty().reactionDelayMs / 1000) {
        defender.face = facing(dx, dz, defender.face);
        defender.age = 0;
        defender.tackling = true;
        defender.shooting = false;
        defender.moving = false;
        pressTime = 0;
      }
    } else pressTime = 0;
  }
  let marks: number[] | null = null;
  const lanePoint = new T.Vector3();
  let nearCover = -1,
    farCover = -1;
  function defendSean(threat: T.Vector3, carrier: number, loose: boolean) {
    const ai = players
      .map((_, i) => i)
      .filter((i) => i !== active && !players[i].penalty);
    const next = players.map(() => -1);
    function assign(x: number, z: number, previous = -1, cover = false) {
      let pick = -1,
        best = Infinity;
      for (const i of ai) {
        const p = players[i].sprite.position;
        const cost =
          Math.hypot(p.x - x, p.z - z) -
          (previous === i ? 1.3 : 0) -
          (cover && homeShape[i].back ? 0.9 : 0);
        if (cost < best) {
          pick = i;
          best = cost;
        }
      }
      if (pick >= 0) {
        ai.splice(ai.indexOf(pick), 1);
        players[pick].goal.set(x, 0, z);
      }
      return pick;
    }
    const depth = T.MathUtils.clamp(attackSign * threat.x, -fieldX, 0);
    const side = threat.z < 0 ? -1 : 1;
    const userPressing =
      players[active].sprite.position.distanceToSquared(threat) < 3.5 ** 2;
    if (userPressing) next[active] = carrier;
    // Leave a covering player even if the side is temporarily two players down.
    const coverX = attackSign * Math.max(-fieldX + 1.9, depth - 5);
    nearCover = assign(
      coverX,
      side * Math.min(3.4, 1.2 + Math.abs(threat.z) * 0.2),
      nearCover,
      true,
    );
    if (!userPressing && (carrier >= 0 || loose)) {
      const i = assign(
        T.MathUtils.clamp(threat.x, -20.6, 20.6),
        T.MathUtils.clamp(threat.z, -11.6, 11.6),
      );
      if (i >= 0) next[i] = carrier;
    }
    farCover = assign(
      attackSign * Math.max(-fieldX + 2.5, depth - 4),
      -side * 2.4,
      farCover,
      true,
    );
    // Track the most advanced remaining runners on their goal side.
    const runners = opponents
      .map((_, i) => i)
      .filter((i) => i !== carrier && !opponents[i].penalty)
      .sort(
        (i, j) =>
          attackSign *
          (opponents[i].sprite.position.x - opponents[j].sprite.position.x),
      );
    for (const j of runners) {
      if (!ai.length) break;
      const runner = opponents[j].sprite.position;
      const x =
        attackSign *
        T.MathUtils.clamp(
          Math.min(attackSign * runner.x - 1, depth + 4),
          -fieldX + 2,
          0,
        );
      const i = assign(
        x,
        T.MathUtils.clamp(runner.z * 0.8 + threat.z * 0.1, -9, 9),
      );
      next[i] = j;
    }
    for (const i of ai)
      players[i].goal.set(
        attackSign * Math.max(-17, depth - 1),
        0,
        homeShape[i].lane * 0.65,
      );
    marks = next;
  }
  function organizeDefense() {
    if (street) return;
    const incomingShot = !!shot && shotDirection === -attackSign;
    const loose = !held && !inFlight && !shot && clearanceLoose;
    const threatPoint =
      bluePass && attackSign * bluePass.end.x < attackSign * ball.position.x
        ? bluePass.end
        : ball.position;
    if (
      !held &&
      !outBall &&
      !keeperRestart &&
      !keeperGather &&
      resultTime <= 0 &&
      (incomingShot ||
        (attackSign * threatPoint.x < 0 &&
          (loose || bluePass || blueCarrier >= 0)))
    ) {
      defendSean(threatPoint, bluePass?.receiver ?? blueCarrier, loose);
      return;
    }
    nearCover = farCover = -1;
    if (blueCarrier < 0 && !bluePass) {
      marks = null;
      return;
    }
    const threat = bluePass?.receiver ?? blueCarrier;
    const pressingBall =
      players[active].sprite.position.distanceTo(
        opponents[threat].sprite.position,
      ) < 4;
    const next = players.map(() => -1);
    const available = new Set(
      opponents.map((_, i) => i).filter((i) => !opponents[i].penalty),
    );
    if (pressingBall) {
      next[active] = threat;
      available.delete(threat);
    }
    while (available.size) {
      let best = Infinity,
        defender = -1,
        target = -1;
      for (const [i, mate] of players.entries()) {
        if (mate.penalty || next[i] >= 0) continue;
        for (const j of available) {
          const cost =
            mate.sprite.position.distanceTo(opponents[j].sprite.position) +
            (marks && marks[i] !== j ? 1.25 : 0);
          if (cost < best) {
            best = cost;
            defender = i;
            target = j;
          }
        }
      }
      if (defender < 0) break;
      next[defender] = target;
      available.delete(target);
    }
    marks = next;
    players.forEach((mate, i) => {
      if (mate.penalty || i === active) return;
      if (next[i] < 0) {
        mate.goal.set(
          ball.position.x - attackSign * 4,
          0,
          homeShape[i].lane * 0.7,
        );
        return;
      }
      const mark = opponents[next[i]].sprite.position;
      if (bluePass && next[i] === threat) {
        // Attack the earliest remaining point reachable before the ball passes it.
        mate.goal.copy(bluePass.end);
        for (let time = bluePass.age; time < bluePass.duration; time += 0.05) {
          lanePoint.lerpVectors(
            bluePass.start,
            bluePass.end,
            time / bluePass.duration,
          );
          lanePoint.y = 0;
          if (
            mate.sprite.position.distanceTo(lanePoint) <=
            0.55 + 4.6 * (time - bluePass.age)
          ) {
            mate.goal.copy(lanePoint);
            break;
          }
        }
      } else if (next[i] === blueCarrier) {
        mate.goal.copy(mark);
      } else {
        lanePoint.copy(ball.position).sub(mark);
        lanePoint.y = 0;
        lanePoint.multiplyScalar(0.3).clampLength(0, 1.75);
        mate.goal.copy(mark).add(lanePoint);
        mate.goal.x -= attackSign * 0.35;
      }
      mate.goal.y = 0;
      mate.goal.x = T.MathUtils.clamp(mate.goal.x, -20.5, 20.5);
      mate.goal.z = T.MathUtils.clamp(mate.goal.z, -11.5, 11.5);
    });
  }
  function tryBlueShot(blast = false, human = false, windupComplete = false) {
    const carrier = opponents[blueCarrier],
      from = carrier.sprite.position;
    if (airOnly && !human && airIntent(carrier) === "GROUNDED") return false;
    let target = 0,
      best = -Infinity;
    const dx = -attackSign * fieldX - ball.position.x;
    for (const z of [
      -rules.goal.halfWidth * 0.75,
      0,
      rules.goal.halfWidth * 0.75,
    ]) {
      const dz = z - ball.position.z;
      const length = dx * dx + dz * dz;
      let clearance = 4;
      for (const defender of players) {
        if (defender.penalty) continue;
        const pos = defender.sprite.position;
        const t = T.MathUtils.clamp(
          ((pos.x - ball.position.x) * dx + (pos.z - ball.position.z) * dz) /
            Math.max(0.001, length),
          0,
          1,
        );
        clearance = Math.min(
          clearance,
          Math.hypot(
            pos.x - ball.position.x - t * dx,
            pos.z - ball.position.z - t * dz,
          ),
        );
      }
      if (clearance < 0.8) continue;
      const score =
        clearance -
        0.025 * length ** 0.5 +
        0.17 * Math.abs(z - homeKeeper.position.z);
      if (score > best) {
        best = score;
        target = z;
      }
    }
    if (inferno && best === -Infinity && !human) return false;
    if (!blast && meters[1].value === 100) {
      carrier.face = facing(dx, -from.z);
      beginStrikeWindup(carrier, null, true);
      return true;
    }
    if (best === -Infinity && !blast && !human) return false;
    if (
      !blast &&
      !windupComplete &&
      matchOpponent.name === "Trash Pandas FC" &&
      !rivalWomen["Trash Pandas FC"].has(carrier.displayName)
    ) {
      carrier.face = facing(dx, target - ball.position.z);
      carrier.age = 0;
      carrier.shooting = true;
      carrier.moving = false;
      peachShotWindup = { index: blueCarrier, human };
      return true;
    }
    const curve = pendingCurve?.actor === carrier ? pendingCurve.strike : null;
    if (airBalls)
      airLooseAttempt = {
        finish: airIntent(carrier),
        scorer: carrier,
        direction: -attackSign,
      };
    if (curve) pendingCurve = null;
    flightCurve = null;
    curveRate = 0;
    const range = Math.hypot(dx, target - ball.position.z);
    keeperStartX = homeKeeper.position.x;
    keeperStart = homeKeeper.position.z;
    shotMultiplier = blast
      ? blastMultiplier
      : 1 + T.MathUtils.clamp(range / 15, 0.28, 0.85);
    if (airBalls && !blast && airShotPower.has(carrier))
      shotMultiplier = 1 + airShotPower.get(carrier)!;
    airShotPower.delete(carrier);
    audio.kick(shotMultiplier - 1);
    if (
      (curve && Math.cos(curve.aim) * -attackSign < 0.3) ||
      (!blast &&
        range >
          ((7 + 11 * (shotMultiplier - 1)) *
            (longRange &&
            longRangeEligible(ball.position.x, ball.position.z, -attackSign)
              ? longRangeBalance.velocity
              : 1)) **
            2 /
            12)
    ) {
      carrier.face = facing(dx, target - ball.position.z);
      if (!windupComplete) carrier.age = 0.12;
      carrier.shooting = true;
      recentKicker = blueCarrier;
      lateTime = lateTackleWindow;
      blueCarrier = -1;
      lastBlue = true;
      releaseLooseStrike(
        curve ? Math.cos(curve.aim) : dx,
        curve ? Math.sin(curve.aim) : target - ball.position.z,
        shotMultiplier - 1,
        blast ? burnShotVelocityScale : 1,
      );
      curveRate = (curve?.rate ?? 0) * (mysteryOn("superCurve") ? 2 : 1);
      curveStyle = curve?.style ?? "Straight";
      return true;
    }
    shot = planShot(
      -attackSign * ball.position.x,
      ball.position.z,
      keeperStart,
      shotMultiplier - 1,
      fieldX,
      -attackSign * from.x,
      -attackSign * keeperStartX,
      Math.random,
      homeKeeper.visible,
      blast
        ? (keeperStart >= 0 ? -1 : 1) * (1.1 + Math.random() * 0.52)
        : target,
      blast
        ? 0
        : ((house
            ? shotProfile(carrier, -attackSign).error
            : (mysteryOn("shootOnSight") ? 0.82 : 1) /
              (airBalls ? airAccuracy(airIntent(carrier)) : 1)) *
            difficulty().shootingError) /
            trainingFactor(carrier.displayName, "Shooting", matchOpponent.name),
      rules.goal.halfWidth,
      undefined,
      (longRange &&
        longRangeEligible(ball.position.x, ball.position.z, -attackSign)) ||
        mysteryOn("shootOnSight"),
      house?.keeperFactor ?? (mysteryOn("theWall") ? 0.72 : 1),
    );
    shot.points = goalValue(
      mysteryOn("doublePoints")
        ? "doublePoints"
        : longRange
          ? "longRange"
          : rules.mode,
      ball.position.x,
      ball.position.z,
      -attackSign,
    );
    if (mysteryOn("doublePoints")) shot.points = 2;
    shot.origin = { x: ball.position.x, z: ball.position.z };
    if (airBalls) {
      shot.airFinish = airIntent(carrier);
      airIntents.delete(carrier);
    }
    if (curve) applyCurve(curve, -attackSign);
    if (blast) {
      shot.duration = T.MathUtils.clamp(shot.duration * 0.46, 0.17, 0.38);
      blastFlying = true;
      impactTime = 0.08;
    }
    shot.targetX *= -attackSign;
    scorer = carrier;
    replay.markStrike(carrier.sprite, ball.position);
    shotDirection = -attackSign;
    shotStart.copy(ball.position);
    shotTime = 0;
    if (longRange && shot.points === 2)
      shot.duration = Math.max(
        Math.hypot(shot.targetX - shotStart.x, shot.targetZ - shotStart.z) /
          longRangeBalance.maxShotSpeed,
        shot.duration / longRangeBalance.velocity,
      );
    if (house || slippery || mysteryOn("heavyBall"))
      shot.duration = Math.max(
        0.08,
        Math.hypot(shot.targetX - shotStart.x, shot.targetZ - shotStart.z) / 45,
        shot.duration / physics.ballSpeed,
      );
    if (house) {
      const tuning = houseShotProfile(
        house.config,
        longRange && shot.points === 2,
        airBalls ? airAccuracy(shot.airFinish ?? "GROUNDED") : 1,
      );
      shot.duration /=
        tuning.speed /
        (longRange && shot.points === 2 ? longRangeBalance.velocity : 1);
      shot.duration = Math.max(
        0.08,
        shot.duration,
        Math.hypot(shot.targetX - shotStart.x, shot.targetZ - shotStart.z) / 45,
      );
    } else {
      if (mysteryOn("shootOnSight")) shot.duration /= 1.15;
      if (airBalls && airAccuracy(shot.airFinish ?? "GROUNDED") > 1)
        shot.duration /= airBallsProfile.shotSpeed;
    }
    if (blast) shot.duration /= burnShotVelocityScale;
    arc = mysteryKickArc(shotMultiplier, blast ? shot.duration : Infinity);
    carrier.face = facing(shot.targetX - from.x, shot.targetZ - from.z);
    if (!windupComplete) carrier.age = 0.12;
    carrier.shooting = true;
    recentKicker = blueCarrier;
    lateTime = lateTackleWindow;
    blueCarrier = -1;
    noticeTime = 0;
    el("shotResult").textContent = curve?.style ?? "";
    return true;
  }
  function decideBlueAttack(dt: number, human?: Seat, action?: Action) {
    if (peachShotWindup) return;
    if (opponents[blueCarrier]?.reactionTime > 0) return;
    if (!human && owner(1, blueCarrier)) return;
    blueDecisionTime -= dt;
    if (!human && blueDecisionTime > 0) return;
    const carrier = opponents[blueCarrier],
      from = carrier.sprite.position;
    blueDecisionTime = difficulty().reactionDelayMs / 1000;
    if (
      tutorial &&
      (!tutorialAllowsChallenges(tutorial.chapter) ||
        !isTutorialParticipant(tutorial.chapter, carrier.displayName, true))
    ) {
      const target =
        !players[active].penalty &&
        isTutorialParticipant(
          tutorial.chapter,
          players[active].displayName,
          false,
        )
          ? active
          : players.findIndex(
              (actor) =>
                !actor.penalty &&
                isTutorialParticipant(
                  tutorial.chapter,
                  actor.displayName,
                  false,
                ),
            );
      if (target >= 0) returnTutorialLob(carrier, target);
      return;
    }
    const inFinalThird = attackSign * from.x <= -fieldX / 3;
    const awayX = -attackSign * ball.position.x;
    const miss = longRange
      ? missChances(awayX, ball.position.z, fieldX, 0.65, true)
      : null;
    const expectedLongPoints = miss
      ? 2 *
        (1 - (miss.wide + miss.over) / (1 + longRangeBalance.accuracyBonus)) *
        Math.max(0.27, awayX / fieldX) *
        0.62 *
        (homeKeeper.visible ? longRangeBalance.keeperDelay : 1)
      : 0;
    const longOpportunity =
      longRange &&
      longRangeEligible(ball.position.x, ball.position.z, -attackSign) &&
      awayX > 2 &&
      awayX < fieldX - longRangeBox.depth + 2 &&
      expectedLongPoints >= longRangeBalance.minAiExpectedPoints &&
      !players.some(
        (p) =>
          !p.penalty && p.sprite.position.distanceToSquared(from) < 4.5 ** 2,
      );
    const infernoOpportunity =
      inferno &&
      awayX > 0 &&
      Math.hypot(fieldX - awayX, from.z) < 21 &&
      !players.some(
        (p) =>
          !p.penalty && p.sprite.position.distanceToSquared(from) < 3.5 ** 2,
      );
    if (
      !human &&
      tutorial?.chapter !== 5 &&
      (inFinalThird || longOpportunity || infernoOpportunity) &&
      tryBlueShot()
    )
      return;
    if (!human && carrier.sprintTime > 0) return;
    if (
      !human &&
      !inFinalThird &&
      !players.some(
        (m) =>
          !m.penalty && m.sprite.position.distanceToSquared(from) < 3.7 ** 2,
      ) &&
      Math.random() > 0.11
    )
      return;
    if (!human && tryCpuBank(true)) return;
    if (enclosed && human && action === "pass") {
      const [x, z] = seatAim(human);
      if (
        millBankAim(
          ball.position,
          x,
          z,
          opponents
            .filter((m) => m !== carrier && !m.penalty)
            .map((m) => m.sprite.position),
          courtBoards,
          rules.goal.halfWidth,
        )
      ) {
        launchBank(x, z, 0.45, true);
        return;
      }
    }
    let receiver = -1,
      best = -Infinity;
    for (const [i, mate] of opponents.entries()) {
      if (
        mate.penalty ||
        (tutorial &&
          !isTutorialParticipant(tutorial.chapter, mate.displayName, true))
      )
        continue;
      if (i === blueCarrier) continue;
      const to = mate.sprite.position,
        dx = to.x - from.x,
        dz = to.z - from.z;
      const length = dx * dx + dz * dz;
      if (human) {
        const [x, z] = seatAim(human),
          aim = Math.hypot(x, z) > 0.2 ? [x, z] : dirs[carrier.face];
        const score =
          (dx * aim[0] + dz * aim[1]) / Math.max(0.01, Math.sqrt(length)) -
          0.01 * Math.sqrt(length);
        if (score > best) {
          best = score;
          receiver = i;
        }
        continue;
      }
      if (length < 2.5 ** 2 || length > 23 ** 2) continue;
      let space = Infinity,
        lane = Infinity;
      for (const defender of players) {
        if (defender.penalty) continue;
        const pos = defender.sprite.position;
        space = Math.min(space, pos.distanceTo(to));
        const along = ((pos.x - from.x) * dx + (pos.z - from.z) * dz) / length;
        if (along > 0 && along < 1)
          lane = Math.min(
            lane,
            Math.hypot(
              pos.x - from.x - along * dx,
              pos.z - from.z - along * dz,
            ),
          );
      }
      if (space < 1.5 || lane < difficulty().laneClearance) continue;
      const score =
        Math.min(space, 5) +
        Math.min(lane, 3) -
        0.1 * Math.sqrt(length) -
        attackSign * dx * 0.14 +
        (longRange &&
        longRangeEligible(to.x, to.z, -attackSign) &&
        -attackSign * to.x > 5
          ? 1.2
          : 0);
      if (score > best) {
        best = score;
        receiver = i;
      }
    }
    if (receiver < 0) return;
    const end = opponents[receiver].sprite.position.clone();
    const scatter =
      (0.12 + 0.035 * from.distanceTo(end)) * difficulty().passingError;
    end.z = T.MathUtils.clamp(
      end.z + (Math.random() * 2 - 1) * scatter,
      -11.5,
      11.5,
    );
    end.y = restingHeight;
    const start = ball.position.clone();
    carrier.age = 0.12;
    carrier.shooting = true;
    recentKicker = blueCarrier;
    lateTime = lateTackleWindow;
    audio.kick(0.45);
    bluePass = {
      sender: carrier.displayName,
      receiver,
      start,
      end,
      age: 0,
      duration:
        (start.distanceTo(end) / 7.5) *
        (airBalls ? airBallsProfile.hangTime : 1),
      loft: airBalls && -attackSign * end.x > 0 ? 1.8 : 0,
    };
    carrier.face = facing(end.x - from.x, end.z - from.z);
    blueCarrier = -1;
  }
  function winBack(index: number, reason: string) {
    if (airBalls) airLooseAttempt = null;
    if (
      (reason === "TACKLE WON" || reason === "SPRINT STRIP") &&
      blueCarrier >= 0
    )
      tackleReaction(opponents[blueCarrier]);
    lastDelivery = null;
    homePasser = "";
    if (lastBlue) changeBurn(-15, 1);
    meters[1].chain.clear();
    meters[1].pair = "";
    if (reason === "TACKLE WON") {
      facts.tackles[0]++;
      tutorial?.record("tackleWon");
      if (tutorialTackler === players[index])
        tutorial?.record("playerTackleWon");
    }
    tutorialTackler = null;
    if (["WON BACK", "TACKLE WON", "INTERCEPTED"].includes(reason))
      changeBurn(6);
    if (reason === "TACKLE WON" || reason === "SPRINT STRIP")
      afterChallenge = performance.now();
    lastBlue = false;
    cancelCharge();
    endFollowUpRuns();
    blueCarrier = -1;
    bluePass = null;
    active = ballPlayer = index;
    held = true;
    lastSender = -1;
    turnoverGrace = 1;
    el("shotResult").textContent = "";
    noticeTime = 0;
    carry();
  }
  // Protect roughly three feet of ground travel off the boot.
  const blastClearance = 0.9;
  const exposedStart = new T.Vector3();
  function blastBlocker(previous: T.Vector3, current: T.Vector3) {
    const distanceFromBoot = (point: T.Vector3) =>
      Math.hypot(point.x - shotStart.x, point.z - shotStart.z);
    const endDistance = distanceFromBoot(current);
    if (endDistance <= blastClearance) return -1;
    const startDistance = distanceFromBoot(previous);
    if (startDistance >= blastClearance)
      return interceptPass(previous, current);
    // Only test the part of this frame's path beyond the protected distance.
    exposedStart.lerpVectors(
      previous,
      current,
      (blastClearance - startDistance) / (endDistance - startDistance),
    );
    return interceptPass(exposedStart, current);
  }
  function interceptPass(
    start: T.Vector3,
    end: T.Vector3,
    defenders = opponents,
    exclude = -1,
    radius = 0.6,
    maxHeight = 0.84,
  ) {
    if (
      tutorial &&
      defenders === opponents &&
      !tutorialAllowsChallenges(tutorial.chapter)
    )
      return -1;
    const dx = end.x - start.x,
      dz = end.z - start.z,
      length = dx * dx + dz * dz;
    let earliest = Infinity,
      winner = -1;
    for (const [i, o] of defenders.entries()) {
      if (
        o.penalty ||
        i === exclude ||
        o.tackling ||
        (tutorial?.chapter === 5 && defenders === players && i !== active)
      )
        continue;
      const pos = o.sprite.position;
      const t = length
        ? T.MathUtils.clamp(
            ((pos.x - start.x) * dx + (pos.z - start.z) * dz) / length,
            0,
            1,
          )
        : 0;
      const height = start.y + (end.y - start.y) * t;
      if (
        height > maxHeight ||
        Math.hypot(pos.x - start.x - t * dx, pos.z - start.z - t * dz) > radius
      )
        continue;
      if (t < earliest) {
        earliest = t;
        winner = i;
      }
    }
    return winner;
  }
  let autoX = 0,
    autoZ = 0;
  const couchKeys = new Set<string>();
  const buttons = new Map<Seat, boolean[]>();
  function createSeatLabel(number: number) {
    const root = document.createElement("div");
    root.style.cssText =
      "position:absolute;pointer-events:none;transform:translate(-50%,-100%);font:16px/1 Upheaval,monospace;color:white;text-align:center;white-space:nowrap";
    root.style.setProperty("--slot-color", playerColor(number));
    const badge = document.createElement("span"),
      name = document.createElement("div");
    badge.textContent = "P" + number;
    badge.style.cssText =
      "display:table;margin:auto;background:var(--slot-color);padding:2px 5px;font-size:.85em";
    name.style.cssText =
      "background:var(--slot-color);padding:2px 5px;min-width:4em";
    const track = document.createElement("div"),
      reserve = document.createElement("div"),
      charge = document.createElement("div");
    track.style.cssText = "position:relative;height:4px;background:#211c19";
    for (const bar of [reserve, charge])
      bar.style.cssText = "position:absolute;inset:0;transform-origin:left";
    reserve.style.background = "#776c60";
    charge.style.background = "#9ce66f";
    track.append(reserve, charge);
    root.append(badge, name, track);
    matchView.append(root);
    return { root, name, reserve, charge };
  }
  const seatLabels = new Map<number, ReturnType<typeof createSeatLabel>>();
  let lastHome = -1,
    lastAway = -1;
  function teamActors(s: Seat) {
    return s.side === -1 ? players : opponents;
  }
  function owner(side: number, i: number) {
    return seats?.find((s) => s.side === side && s.actor === i);
  }
  function claim(side: number, index: number) {
    if (index < 0 || owner(side, index)) return;
    const group = seats?.filter((s) => s.side === side);
    if (group?.length)
      group.reduce((a, b) =>
        a.actor < 0
          ? a
          : b.actor < 0
            ? b
            : teamActors(a)[a.actor].sprite.position.distanceToSquared(
                  ball.position,
                ) <
                teamActors(b)[b.actor].sprite.position.distanceToSquared(
                  ball.position,
                )
              ? a
              : b,
      ).actor = index;
  }
  function syncSeats() {
    if (!seats) return;
    if (active !== lastHome) {
      claim(-1, active);
      lastHome = active;
    }
    if (blueCarrier !== lastAway) {
      claim(1, blueCarrier);
      lastAway = blueCarrier;
    }
    for (const s of seats) {
      const actors = teamActors(s);
      if (!actors[s.actor] || actors[s.actor].penalty)
        s.actor = actors.findIndex((a, i) => !a.penalty && !owner(s.side, i));
    }
  }
  // A solo keyboard player can pick up a controller after team selection.
  let soloPad: Gamepad | undefined;
  function seatPad(s: Seat) {
    return s.device < 0 ? soloPad : navigator.getGamepads()[s.device];
  }
  const switchStickHeld = new Set<number>();
  function pollSwitchStick(pad: Gamepad | null | undefined, seat?: Seat) {
    if (!pad) return;
    const x = pad.axes[2] ?? 0,
      z = pad.axes[3] ?? 0;
    const strength = Math.hypot(x, z);
    if (strength < 0.32) switchStickHeld.delete(pad.index);
    if (strength < 0.62 || switchStickHeld.has(pad.index)) return;
    switchStickHeld.add(pad.index);
    if (
      paused ||
      squadOpen ||
      phase !== "play" ||
      replay.cut >= 0 ||
      celebrating ||
      keeperReady ||
      keeperGather > 0 ||
      keeperRestart ||
      outBall ||
      shot ||
      freeKick ||
      resultTime > 0 ||
      tutorial?.capturesInput
    )
      return;
    const away = seat?.side === 1;
    if (away ? blueCarrier >= 0 || bluePass : held || inFlight) return;
    const team = seat ? teamActors(seat) : players;
    const current = seat ? seat.actor : active;
    if (!team[current] || team[current].reactionTime > 0) return;
    const next = directionalMate(
      team,
      team[current].sprite.position,
      view.end ? -z * attackSign : x,
      view.end ? x * attackSign : z,
      (i) =>
        i !== current &&
        !owner(away ? 1 : -1, i) &&
        (tutorial?.chapter !== 5 ||
          tutorialDefenders.includes(team[i].displayName)),
    );
    if (next < 0) return;
    team[current].goal.copy(team[current].sprite.position);
    if (seat) seat.actor = next;
    if (!away) {
      active = lastHome = next;
      tutorial?.record("switch");
    }
  }
  function seatAim(s: Seat) {
    const pad = seatPad(s);
    const key = (k: string) => s.device < 0 && couchKeys.has(k);
    const x =
      (pad?.axes[0] ?? 0) +
      Number(!!pad?.buttons[15]?.pressed || key("ArrowRight") || key("KeyD")) -
      Number(!!pad?.buttons[14]?.pressed || key("ArrowLeft") || key("KeyA"));
    const z =
      (pad?.axes[1] ?? 0) +
      Number(!!pad?.buttons[13]?.pressed || key("ArrowDown") || key("KeyS")) -
      Number(!!pad?.buttons[12]?.pressed || key("ArrowUp") || key("KeyW"));
    return view.end ? [-z * attackSign, x * attackSign] : [x, z];
  }
  const snowVelocities = new Map<object, Motion>();
  function moveOnSnow(actor: typeof sean, desired: Motion, dt: number) {
    if (dt <= 0 || !Number.isFinite(desired.x) || !Number.isFinite(desired.z))
      return;
    const velocity = snowVelocities.get(actor) ?? { x: 0, z: 0 };
    snowVelocities.set(actor, velocity);
    const step = snowMotion(velocity, desired, dt, physics),
      pos = actor.sprite.position;
    const x = pos.x + step.x,
      z = pos.z + step.z;
    pos.x = T.MathUtils.clamp(x, -runX, runX);
    pos.z = T.MathUtils.clamp(z, runNorth, runSouth);
    if (pos.x !== x) velocity.x = 0;
    if (pos.z !== z) velocity.z = 0;
    actor.travel += Math.hypot(step.x, step.z);
    actor.moving = Math.hypot(velocity.x, velocity.z) > 0.15;
  }
  function driveSeat(s: Seat, dt: number) {
    const actor = teamActors(s)[s.actor],
      pos = actor.sprite.position,
      [x, z] = seatAim(s);
    if (awayCharge?.seat === s && s.actor === blueCarrier) {
      awayCharge.gesture.sample(x, z, performance.now());
      if (awayCharge.gesture.engaged) {
        actor.moving = false;
        actor.sprintTime = 0;
        return;
      }
    }
    if (actor.reactionTime > 0) {
      actor.moving = false;
      actor.sprintTime = 0;
      return;
    }
    actor.moving = actor.age < 0 && Math.hypot(x, z) > 0.24;
    if (!actor.moving) {
      actor.sprintTime = 0;
      if (slippery && actor.age < 0) moveOnSnow(actor, { x: 0, z: 0 }, dt);
      return;
    }
    actor.face = facing(x, z, actor.face);
    const [dx, dz] = dirs[actor.face];
    const sprint =
      (s.device < 0 && couchKeys.has("ShiftLeft")) ||
      seatPad(s)?.buttons[7]?.pressed;
    actor.sprintTime = sprint ? spendSprint(actor, dt) : 0;
    const step = 4 * dt + 2 * actor.sprintTime;
    if (slippery)
      moveOnSnow(actor, { x: (dx * step) / dt, z: (dz * step) / dt }, dt);
    else {
      pos.x = T.MathUtils.clamp(pos.x + dx * step, -runX, runX);
      pos.z = T.MathUtils.clamp(pos.z + dz * step, runNorth, runSouth);
      actor.travel += step;
    }
  }
  function couchInput(s: Seat, index: number, down: boolean) {
    const source = "seat" + s.number + "-" + index;
    if (airBalls && down && [0, 2, 3].includes(index))
      airSeatShots.delete(s.number);
    if (
      airBalls &&
      index === 1 &&
      !paused &&
      !celebrating &&
      phase === "play"
    ) {
      const buffered = airSeatShots.get(s.number);
      if (!down && buffered) {
        buffered.power = heldPower(buffered.start);
        buffered.expires = performance.now() + airBallsProfile.inputBufferMs;
        return;
      }
      if (
        down &&
        !held &&
        blueCarrier < 0 &&
        (inFlight || bluePass?.loft || keeperRestart || airWasAloft)
      ) {
        const g = new CurveGesture(),
          actor = teamActors(s)[s.actor];
        if (actor) {
          const [dx, dz] = dirs[actor.face],
            [x, z] = seatAim(s);
          g.reset(Math.atan2(dz, dx));
          g.sample(x, z, performance.now());
          airSeatShots.set(s.number, {
            side: s.side,
            start: performance.now(),
            expires: Infinity,
            power: 0.5,
            gesture: g,
          });
          return;
        }
      }
    }
    if (!down) {
      if (index === 1 && awayCharge?.seat === s) {
        const intent = awayCharge;
        awayCharge = null;
        if (
          !paused &&
          phase === "play" &&
          blueCarrier === intent.actor &&
          s.actor === blueCarrier &&
          !blastShooter
        ) {
          const strike = intent.gesture.finish(meters[1].value === 100);
          pendingCurve = strike
            ? { actor: opponents[blueCarrier], strike }
            : null;
          tryBlueShot(false, true);
        }
      }
      release(source);
      return;
    }
    if (index === 0 && (celebrating || replay.cut >= 0)) {
      skipGoalPresentation();
      return;
    }
    if (index === 9) {
      void matchMenu();
      return;
    }
    if (!paused && !squadOpen && keeperGather > 0 && keeperSeat === s) {
      if (index < 4) keeperAction(faceActions[index]);
      return;
    }
    if (
      !paused &&
      phase === "play" &&
      !celebrating &&
      replay.cut < 0 &&
      !freeKick &&
      index === 3 &&
      canRush(s.side === 1)
    ) {
      keeperSeat = s;
      rushSource = source;
      return;
    }
    if (
      paused ||
      squadOpen ||
      s.actor < 0 ||
      teamActors(s)[s.actor].reactionTime > 0
    )
      return;
    if (index === 4) {
      const actors = teamActors(s);
      for (let n = 1; n < actors.length; n++) {
        const i = (s.actor + n) % actors.length;
        if (!actors[i].penalty && !owner(s.side, i)) {
          s.actor = i;
          if (s.side === -1 && !held && !inFlight) {
            active = i;
            lastHome = i;
          }
          break;
        }
      }
      return;
    }
    if (index > 3) return;
    if (s.side === -1 && s.actor === active) {
      press(faceActions[index], source);
      return;
    }
    const actor = teamActors(s)[s.actor];
    if (
      phase !== "play" ||
      celebrating ||
      replay.cut >= 0 ||
      blastShooter ||
      outBall ||
      keeperRestart ||
      actor.age >= 0
    )
      return;
    if (s.side === 1 && s.actor === blueCarrier) {
      if (index === 1) {
        const input = new CurveGesture(),
          [dx, dz] = dirs[actor.face],
          [x, z] = seatAim(s);
        input.reset(Math.atan2(dz, dx));
        input.sample(x, z, performance.now());
        awayCharge = { seat: s, actor: s.actor, gesture: input };
      } else decideBlueAttack(0, s, faceActions[index]);
    } else if (index === 1 && (s.side === 1 ? held : canTackle())) {
      actor.age = 0;
      actor.tackling = true;
      actor.shooting = false;
    }
  }
  function readAim(pad: Gamepad | null | undefined) {
    if (seats) {
      const s = owner(-1, active);
      return s ? seatAim(s) : [autoX, autoZ];
    }
    if (aiHome) return [autoX, autoZ];
    const x =
      Number(keys.has("KeyD")) -
      Number(keys.has("ArrowLeft") || keys.has("KeyA")) +
      axisX +
      (pad?.axes[0] ?? 0);
    const z =
      Number(keys.has("ArrowDown") || keys.has("KeyS")) -
      Number(keys.has("ArrowUp") || keys.has("KeyW")) +
      axisZ +
      (pad?.axes[1] ?? 0) +
      Number(!!pad?.buttons[13]?.pressed) -
      Number(!!pad?.buttons[12]?.pressed);
    return view.end ? [-z * attackSign, x * attackSign] : [x, z];
  }
  function pass(multiplier: number, kind: PassKind, firstTime = false) {
    if (paused || !held || players[active].age >= 0) return;
    if (phase === "kickoff") {
      centerPass = true;
      phase = "play";
      el("message").textContent = "";
    }
    const sender = players[active],
      from = sender.sprite.position;
    const [aimX, aimZ] = readAim(broadcast ? undefined : menuPad());
    const aimed = Math.hypot(aimX, aimZ) > 0.22;
    if (tutorial?.chapter === 5 && kind === "pass") {
      // An explicit player pass starts keep-away. Keep control on the defending
      // side and let the existing loose-ball collision code decide who receives.
      const partners = opponents.filter(
        (actor) =>
          !actor.penalty && isTutorialParticipant(5, actor.displayName, true),
      );
      const receiver = partners.sort((a, b) => {
        const score = (actor: typeof sean) => {
          const dx = actor.sprite.position.x - from.x,
            dz = actor.sprite.position.z - from.z;
          const distance = Math.max(0.01, Math.hypot(dx, dz));
          return (
            (aimed ? ((dx * aimX + dz * aimZ) / distance) * 10 : 0) -
            distance * 0.2
          );
        };
        return score(b) - score(a);
      })[0];
      if (receiver) {
        const dx = receiver.sprite.position.x - ball.position.x;
        const dz = receiver.sprite.position.z - ball.position.z;
        const distance = Math.hypot(dx, dz);
        const power = T.MathUtils.clamp(
          (Math.sqrt(12 * distance) - 7) / 11,
          0,
          1,
        );
        releaseLooseStrike(dx, dz, power);
        reboundVY = 0;
        blueCarrier = -1;
        bluePass = null;
        lastBlue = false;
        rollingPass = false;
        lastSender = active;
        homePasser = "";
        sender.face = facing(dx, dz);
        sender.shooting = true;
        sender.age = 0.12;
        audio.kick(power);
        tutorial.record("passAttempt");
        return;
      }
    }
    if (
      enclosed &&
      !aiHome &&
      (!seats || owner(-1, active)) &&
      kind === "pass" &&
      aimed &&
      millBankAim(
        ball.position,
        aimX,
        aimZ,
        players
          .filter((m) => m !== sender && !m.penalty)
          .map((m) => m.sprite.position),
        courtBoards,
        rules.goal.halfWidth,
      )
    ) {
      launchBank(aimX, aimZ, multiplier - 1, false);
      return;
    }
    let best = -Infinity,
      target = -1;
    players.forEach((mate, i) => {
      if (mate.penalty || i === active) return;
      const dx = mate.sprite.position.x - from.x,
        dz = mate.sprite.position.z - from.z;
      const distance = Math.max(0.01, Math.hypot(dx, dz));
      const alignment =
        (dx * aimX + dz * aimZ) / (distance * (Math.hypot(aimX, aimZ) || 1));
      const crossRun =
        kind === "cross" &&
        !aimed &&
        Math.abs(from.z) > 6 &&
        attackSign * from.x > 6
          ? attackSign * mate.sprite.position.x * 0.6 -
            Math.abs(mate.sprite.position.z) * 0.6
          : 0;
      const score =
        crossRun +
        (aimed ? alignment * 8 : i === lastSender && distance < 9 ? 4 : 0) -
        distance * 0.35;
      if (score > best) {
        best = score;
        target = i;
      }
    });
    if (
      kind === "pass" &&
      !aimed &&
      passCallIndex >= 0 &&
      !players[passCallIndex].penalty
    )
      target = passCallIndex;
    if (target < 0 && freePractice) {
      const [x, z] = dirs[sender.face];
      releaseLooseStrike(aimed ? aimX : x, aimed ? aimZ : z, multiplier - 1);
      reboundVY = kind === "cross" ? 5 + 4 * (multiplier - 1) : 0;
      sender.shooting = true;
      sender.age = 0.12;
      audio.kick(multiplier - 1);
      return;
    }
    if (target < 0) return;
    const to = players[target].sprite.position;
    const perfectDuration = Math.max(0.16, ball.position.distanceTo(to) / 16);
    const windupDuration = sender.maps[2] ? 0.12 : 0;
    perfectPass =
      kind === "pass" &&
      target === passCallIndex &&
      performance.now() +
        (perfectDuration + windupDuration) * 1000 -
        passCallAt <=
        1500;
    clearPassCall();
    passWasFirstTime = firstTime;
    passKind = kind;
    passStart.copy(ball.position);
    passTime = 0;
    receiverLaunch.copy(to);
    passTarget.copy(to);
    passTarget.y = restingHeight;
    passDuration =
      Math.max(0.06, ball.position.distanceTo(to) / 8) / multiplier;
    if (perfectPass) passDuration = perfectDuration;
    if (kind === "through") {
      const [faceX, faceZ] = dirs[sender.face];
      passHeading
        .set(aimed ? aimX : faceX, 0, aimed ? aimZ : faceZ)
        .normalize();
      launchSpeed =
        (6 + 11 * (multiplier - 1)) *
        trainingFactor(sender.displayName, "Passing") *
        physics.ballSpeed;
      turfDeceleration =
        4 *
        (house || slippery
          ? physics.rollingResistance
          : (matchSurface?.friction() ?? 1));
      passDuration = launchSpeed / turfDeceleration;
    }
    if (kind === "cross") {
      const boxApproach = T.MathUtils.smoothstep(
        Math.max(attackSign * from.x, attackSign * to.x),
        fieldX - 10,
        fieldX - 4,
      );
      crossLift = 1.35 + 0.45 * (multiplier - 1) + 0.45 * boxApproach;
      if (!crossingDrill && Math.abs(from.z) > 6 && attackSign * from.x > 6) {
        // Land a few steps beyond the receiver so a run across the flight meets it in the air.
        const line = passTarget.clone().sub(passStart);
        line.y = 0;
        line.normalize();
        passTarget.addScaledVector(line, 2.4);
        passTarget.x = T.MathUtils.clamp(
          passTarget.x,
          -fieldX + 0.5,
          fieldX - 0.5,
        );
        passTarget.z = T.MathUtils.clamp(
          passTarget.z,
          -fieldZ + 0.5,
          fieldZ - 0.5,
        );
      }
      passDuration =
        Math.max(0.55, passDuration * (1.35 + 0.15 * boxApproach)) *
        (airBalls ? airBallsProfile.hangTime : 1);
    }
    if (kind !== "through")
      passDuration /= trainingFactor(sender.displayName, "Passing");
    if (kind !== "through")
      passDuration = Math.max(
        passDuration / physics.ballSpeed,
        snowpocalypse ? passStart.distanceTo(passTarget) / 45 : 0,
      );
    arc = mysteryKickArc(multiplier, passDuration);
    sender.face =
      kind === "through"
        ? facing(passHeading.x, passHeading.z)
        : facing(to.x - from.x, to.z - from.z);
    passPower = multiplier - 1;
    sender.shooting = !!sender.maps[2];
    sender.age = sender.shooting ? 0 : 0.12;
    const forward = attackSign * (attackSign * from.x > 15 ? -1 : 1);
    sender.goal.set(
      T.MathUtils.clamp(
        Math.max(from.x * forward + 4, to.x * forward + 2) * forward,
        -19,
        19,
      ),
      0,
      T.MathUtils.clamp(to.z + (from.z >= to.z ? 3 : -3), -10, 10),
    );
    if (sender.shooting) windupReceiver = target;
    else launchPass(target);
  }
  function launchPass(target: number) {
    tutorialReturnKicker = -1;
    tutorial?.record(
      passKind === "through"
        ? "throughAttempt"
        : passKind === "cross"
          ? "crossAttempt"
          : "passAttempt",
    );
    if (crossingDrill && training.drill === 1)
      finishRep(0, "Shoot from the setup");
    audio.kick(passPower);
    kickSpot = null;
    centerPass = false;
    windupReceiver = -1;
    returnRunTime = 1.6;
    supportOwner = -1;
    passStart.copy(ball.position);
    passTime = 0;
    vx = vz = 0;
    recentHomeKicker = players[active];
    homeLateTime = lateTackleWindow;
    homePasser = players[active].displayName;
    lastDelivery = null;
    lastSender = active;
    ballPlayer = active = target;
    held = false;
    inFlight = true;
  }
  async function exitSimulation() {
    history.replaceState(
      {
        ...history.state,
        arcadeMenu: true,
        ...(gulchDebug ? { keeperDebug: true } : {}),
      },
      "",
    );
    music?.carryOver();
    await music?.finish();
    location.reload();
  }
  async function matchMenu() {
    if (intro) {
      intro.setPaused(true);
      return;
    }
    if (playIntro && !crossingDrill && !introStarted) return;
    if (tutorial) {
      tutorial.options();
      return;
    }
    if (simulation && phase === "fulltime") {
      exitSimulation();
      return;
    }
    if (squadOpen || phase === "fulltime" || celebrationLab || broadcast)
      return;
    audio.menu("open");
    pause(true);
    squadOpen = true;
    audio.state(true, false);
    try {
      const choice = await pauseMenu(
        home,
        matchOpponent,
        [homeScore, awayScore],
        half,
        matchSeconds,
        !survival &&
          !standalonePractice &&
          !simulation &&
          replay.cut < 0 &&
          !celebrating,
        !!ticket,
        !ticket,
        standalonePractice,
        weatherTest ? matchSurface : undefined,
        house
          ? "HOUSE RULES"
          : street
            ? `${rules.teamSize}V${rules.teamSize} · ${rules.winCondition === "target" ? "First to 5" : (half === 1 ? "First" : "Second") + " Half"}`
            : firstToFive
              ? `FIRST TO ${rules.targetScore} · NO TIME LIMIT`
              : beatTheClock
                ? "BEAT THE CLOCK"
                : airBalls
                  ? "AIR BALLS"
                  : mystery
                    ? "MYSTERY MATCH"
                    : undefined,
        beatTheClock ? beatClockText(beatRemaining) : undefined,
        house ? houseSummary(house.config) : undefined,
        !standalonePractice && !beatTheClock,
      );
      if (standalonePractice) {
        if (choice === "quit") exitPractice();
        else pause(false);
        return;
      }
      if (choice === "quit") {
        exitSimulation();
        return;
      }
      if (choice === "simulate" && ticket) {
        const c = structuredClone(ticket.career);
        const report: Report = {
          score: [homeScore, awayScore],
          woodwork: [...woodwork],
          fouledPlayer: careerFouledPlayer,
          bookedPlayers: [...careerBookings],
          shots: [...careerShots],
          goals: [...careerGoals],
          played: [...appearances],
          simulated: false,
        };
        simulateRemainder(
          c,
          report,
          (half - 1) * 1500 + matchSeconds,
          players.filter((p) => !p.penalty).map((p) => p.displayName),
          opponents.filter((p) => !p.penalty).map((p) => p.displayName),
          careerRatings(c),
        );
        finishRound(c, report, careerRatings(c));
        report.performance = {
          name: c.player,
          goals: report.goals.filter(
            (g) => g.club === 0 && g.player === c.player,
          ).length,
          assists: facts.assists,
          passes: facts.personalPasses,
          xpBefore: ticket.career.xp,
          xpAfter: c.xp,
        };
        try {
          saveSlot(ticket.slot, c);
        } catch (e) {
          el("message").textContent = "Save Failed · " + String(e);
          return;
        }
        fullTimeScreen = true;
        audio.finishMatch();
        location.reload();
        return;
      }
      if (choice === "sides" && !beatTheClock) {
        const selected = await selectSides(
          fixture!,
          seats?.find((s) => s.device === -1)?.side ?? 0,
          false,
          seats ?? undefined,
        );
        if (selected) {
          cancelCharge();
          cancelRush();
          keys.clear();
          couchKeys.clear();
          buttons.clear();
          switchStickHeld.clear();
          if (keeperGather > 0) {
            const next = selected.find(
              (s) => s.side === (keeperSeat?.side ?? -1),
            );
            if (next) keeperSeat = next;
            else {
              keeperGather = 0;
              distributeKeeperBall(outlet, false);
            }
          }
          seats = selected;
          lastHome = lastAway = -1;
          syncSeats();
          for (const seat of seats) {
            const pad = seat.device < 0 ? undefined : navigator.getGamepads()[seat.device];
            buttons.set(seat, Array.from(pad?.buttons ?? [], (button) => button.pressed));
          }
          aiHome = !seats.some((s) => s.side === -1);
          simulation = false;
          padIndex = null;
        }
        pause(false);
        return;
      }
      if (choice === "resume") {
        pause(false);
        return;
      }
      const current = {
        shape: managedLineup.shape,
        starters: managedSlots.map((m) => m.displayName),
        bench: matchBench,
      };
      const unavailable = new Set(
        managedSlots.filter((m) => m.penalty > 0).map((m) => m.displayName),
      );
      const matchdayPlayers = [
        ...matchBench.map((name) => squad.get(name)!),
        ...managedSlots,
      ];
      const stamina = new Map(
        matchdayPlayers.map((p) => [
          p.displayName,
          { charge: p.sprintCharge, capacity: p.staminaCapacity },
        ]),
      );
      const exhausted = new Set(
        matchdayPlayers
          .filter((player) => player.staminaCapacity <= 0)
          .map((player) => player.displayName),
      );
      const result = await selectLineup(
        portraits,
        fixture!,
        { current, unavailable, exhausted, stamina, music: music! },
        settings,
        undefined,
        ticket?.career.bonds,
        ticket?.career,
        managedClub,
        undefined,
        rules,
      );
      if (!result) {
        pause(false);
        return;
      }
      applyTeam(result.starters, result.bench);
      nameText.textContent = players[active].displayName;
      audio.menu("close");
      pause(document.hidden);
      reveal(matchView, ":scope > canvas,.bug-stack");
    } finally {
      squadOpen = false;
      padIndex = null;
      lastPause = !!menuPad()?.buttons[9]?.pressed;
      for (const seat of seats ?? [])
        if (seat.device >= 0)
          buttons.set(
            seat,
            Array.from(
              navigator.getGamepads()[seat.device]?.buttons ?? [],
              (b) => b.pressed,
            ),
          );
    }
  }
  function pause(on: boolean) {
    if (phase === "fulltime") return;
    cancelRush();
    cancelCharge();
    paused = on;
    matchView.toggleAttribute("data-paused", on);
    keys.clear();
    axisX = axisZ = 0;
    el("knob").style.transform = "";
    el("pause").textContent = on ? "Resume" : "Pause";
    if (!on && phase === "kickoff") showKickoffPrompt(kickoffBlue);
    else
      el("message").textContent = !on && phase === "halftime" ? "Halftime" : "";
  }
  function snap(value: number, step: number) {
    return Math.round(value / step) * step;
  }
  function screenRotation() {
    return broadcast ? broadcastRotation : view.end ? 2 * attackSign : 0;
  }
  function viewportAspect() {
    const bounds = renderer.domElement.parentElement!;
    return bounds.clientWidth / Math.max(1, bounds.clientHeight);
  }
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    camera.fov = view.fov;
    camera.aspect = viewportAspect();
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(ratio, broadcast ? 1 : 1.5));
    renderer.setSize(
      renderer.domElement.parentElement!.clientWidth,
      renderer.domElement.parentElement!.clientHeight,
      false,
    );
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.imageRendering = "auto";
    for (const goalie of keepers) goalie.scale.setScalar(cinematicPlayerSize);
    ball.scale.setScalar(cinematicBallSize);
    pitchActors.forEach((player) =>
      player.sprite.scale.setScalar(cinematicPlayerSize),
    );
  }

  function cycleView(step: number) {
    if (celebrating || replay.cut >= 0) return;
    tutorial?.record("camera");
    viewIndex = (viewIndex + step + views.length) % views.length;
    view = views[viewIndex];
    for (const guest of sidelineGuests)
      guest.map.offset.x = ((guest.face + screenRotation() + 8) % 8) / 8;
    awayGK.face = attackSign === 1 ? 6 : 2;
    el("changeView").textContent = view.label;
    resize();
  }
  let labIndex = 0;
  let labControls: ReturnType<typeof celebrationControls> | undefined;
  el("skipReplay").onclick = skipGoalPresentation;
  el("changeView").onclick = () => cycleView(1);
  const matchPlayers = players.slice(),
    matchRivals = opponents.slice();
  const bins = createChipBins(scene);
  const targetRing = new T.Mesh(
    new T.RingGeometry(0.52, 0.57, 32),
    new T.MeshBasicMaterial({ color: 0x7ce7ff, side: T.DoubleSide }),
  );
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.visible = false;
  scene.add(targetRing);
  let practiceTarget = 1,
    repReset = -1,
    firstTimeCross = false,
    lastRetry = false;
  const repVelocity = new T.Vector3();
  let repNet = false;
  const training = practicePanel(matchView, chooseDrill, exitPractice);
  if (standalonePractice) {
    const exit =
      training.panel.querySelector<HTMLButtonElement>("[data-start]")!;
    if (freePractice && !stadiumTest) exit.remove();
    else exit.firstChild!.textContent = stadiumTest ? "Exit Test " : "Drills ";
  }
  training.panel.hidden = true;
  function finishRep(points: number, reason: string) {
    if (repReset >= 0 || training.count === 5) return;
    if (training.drill !== 4) training.award(points, reason);
    training.render(players[practiceTarget].displayName);
    repReset = training.drill === aerialDrill ? 3 : 0.85;
    if (training.drill === aerialDrill) {
      if (outBall) repVelocity.copy(outVelocity);
      else repVelocity.set(vx, reboundVY, vz);
      repNet = reason === "Goal";
      if (shot) {
        repVelocity.set(
          (shot.targetX - shotStart.x) / shot.duration,
          0,
          (shot.targetZ - shotStart.z) / shot.duration,
        );
        if (reason === "Save" || reason === "Post" || reason === "Crossbar") {
          repVelocity.set(
            -attackSign * (reason === "Save" ? 7 : 5),
            reason === "Crossbar" ? -2 : 2,
            Math.sign(shot.targetZ || 1) * 2,
          );
          audio.play(
            reason === "Save" ? "bounce" : reason === "Post" ? "post" : "bar",
            0.5,
          );
        } else if (repNet) audio.play("cheer", 0.55);
      }
      el("shotResult").textContent = reason.toUpperCase();
    }
  }
  function nextCurveBall() {
    reset();
    phase = "play";
    reboundVY = curveRate = 0;
    const index = ballsUsed++ % practiceBalls.length;
    practiceBalls.forEach((spare, i) => {
      spare.visible = i > index;
    });
    const actor = players[0];
    actor.sprite.position.copy(practiceBalls[index].position);
    actor.sprite.position.y = 0;
    actor.face = 2;
    carry();
    camTarget.copy(ball.position);
    el("message").textContent = "";
  }
  function chooseDrill(index: number) {
    if (curveLab) {
      nextCurveBall();
      return;
    }
    audio.menu("nav");
    training.choose(index);
    setupRep();
  }
  function setupRep() {
    const duel = training.drill === aerialDrill;
    opponents.splice(
      0,
      opponents.length,
      ...(duel ? matchRivals.slice(0, 1) : []),
    );
    for (const rival of matchRivals)
      rival.sprite.visible = opponents.includes(rival);
    players.forEach((actor, i) => {
      actor.sprite.visible = !duel || i === 0;
    });
    reset();
    phase = "play";
    active = ballPlayer = 0;
    if (training.drill === 3) bins.show(training.count);
    else bins.hide();
    practiceTarget = training.drill === 0 ? 1 + (training.count % 2) : 1;
    const x =
      training.drill === 1
        ? 17 - training.count * 1.4
        : training.drill === 2
          ? 13
          : 4;
    const z =
      training.drill === 2
        ? 9
        : training.drill === 1
          ? (training.count % 2 ? -1 : 1) * (1 + training.count)
          : 0;
    const coords = [
      [x, z],
      [training.drill === 2 ? 17 : x + 4, training.drill === 2 ? 0 : -4],
      [x - 3, 5],
    ];
    players.forEach((a, i) => {
      a.sprite.position.set(coords[i][0], 0, coords[i][1]);
      a.goal.copy(a.sprite.position);
      a.face = 2;
    });
    carry();
    camTarget.copy(ball.position);
    el("message").textContent = "";
    if (duel) {
      const lane = [0, 2, -2, 1, -1][training.count];
      const start = new T.Vector3(fieldX - 1.5, restingHeight, 0),
        end = new T.Vector3(12, restingHeight, lane);
      keeper.position.copy(start);
      keeper.position.y = 0;
      const meet = start.clone().lerp(end, 0.85);
      targetRing.position.set(meet.x, 0.04, meet.z);
      players[0].sprite.position.set(meet.x, 0, meet.z);
      const challenger = opponents[0];
      if (challenger) {
        challenger.sprite.position.set(meet.x - 0.65, 0, meet.z + 0.28);
        challenger.goal.copy(challenger.sprite.position);
      }
      held = false;
      ball.position.copy(start);
      keeperRestart = { start, end, age: 0 };
      camTarget.copy(players[0].sprite.position);
    }
    repReset = -1;
    firstTimeCross = false;
    training.render(players[practiceTarget].displayName);
  }
  function exitPractice() {
    tutorialMusic?.finish();
    history.replaceState(
      {
        ...history.state,
        practiceMenu: !stadiumTest && !curveLab && !weatherTest,
        keeperDebug: weatherTest,
        tutorialDrills: tutorialLaunch?.mode === "skill",
        arcadeMenu: true,
      },
      "",
    );
    music?.carryOver();
    location.reload();
  }
  new ResizeObserver(resize).observe(renderer.domElement.parentElement!);
  resize();
  reset();
  function enterPenalties(
    finish: (kicks: Kick[]) => void,
    custom?: {
      teams: [typeof homeSlots, typeof homeSlots];
      keepers: [typeof sean, typeof sean];
      controllers: [number | null, number | null];
      pause?: (kicks: Kick[]) => Promise<boolean>;
    },
  ) {
    updateScore();
    fullTimeScreen = true;
    ring.visible = false;
    homeGoal.setVisible(false);
    referee.sprite.visible = false;
    for (const actor of pitchActors) actor.sprite.visible = false;
    const eligible = (actors: typeof homeSlots) =>
      actors.filter((actor) => Number.isFinite(actor.penalty));
    const teams: [typeof homeSlots, typeof homeSlots] = custom?.teams ?? [
      eligible(homeSlots),
      eligible(awaySlots),
    ];
    audio.restartMatch();
    playPenalties({
      scene,
      camera,
      renderer,
      ball,
      teams,
      keepers: custom?.keepers ?? [teams[0].at(-1)!, teams[1].at(-1)!],
      attempts: custom ? penaltyLength : undefined,
      controllers: custom?.controllers,
      pause: custom?.pause,
      keeperDiveSheet,
      names: [homeLabel, matchOpponent.name],
      crests: [home.crest, matchOpponent.crest],
      test: penaltyLab,
      finish,
      level: ["beginners", "d6", "d5"].indexOf(settings.difficulty),
      rating: (actor, keeping) => {
        const base =
          goalDiggerRatings[actor.displayName]?.[keeping ? 5 : 2] ??
          crossbarRatings[actor.displayName]?.[keeping ? 5 : 2] ??
          netRatings[actor.displayName]?.[keeping ? 5 : 2] ??
          grassRatings[actor.displayName]?.[keeping ? 5 : 2] ??
          (matchOpponent.name === "Barely United"
            ? barelyRatings[actor.displayName]?.[keeping ? 5 : 2]
            : undefined) ??
          playerRatings[bios[actor.displayName]?.[0]]?.[keeping ? 5 : 2] ??
          65 + matchOpponent.stars * 4;
        return (
          base *
          trainingFactor(actor.displayName, keeping ? "Keeping" : "Shooting")
        );
      },
      fire: (seconds, side) => eastCannons(seconds, goalColors[side]),
      dissolve: () => {
        if (reducedReplayMotion.matches) return;
        const live = renderer.domElement;
        renderer.render(scene, camera);
        dissolveLayer.width = live.width;
        dissolveLayer.height = live.height;
        dissolveContext.drawImage(live, 0, 0);
        live.after(dissolveLayer);
        for (const anim of dissolveLayer.getAnimations()) anim.cancel();
        dissolveLayer.style.opacity = "1";
        const fade = dissolveLayer.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 650,
        });
        fade.onfinish = () => dissolveLayer.remove();
      },
      net: (p, power) => attackingGoal.strike(p.x, p.y, p.z, power),
      render: (dt) => {
        for (const { mesh, sprite } of contactShadows) {
          mesh.visible = sprite.visible;
          mesh.position.set(sprite.position.x, 0.024, sprite.position.z);
        }
        shadow.position.set(ball.position.x, 0.03, ball.position.z);
        updateSpin();
        attackingGoal.update(dt);
        updateWeather(dt);
        renderer.render(scene, camera);
      },
    });
  }
  if (keeperTest) {
    keeperPanel = keeperControls(matchView, resetKeeperTest, () => {
      history.replaceState(
        { ...history.state, keeperDebug: true, arcadeMenu: true },
        "",
      );
      location.reload();
    });
    resetKeeperTest();
  }
  if (rules.mode === "penaltyShootout" && penaltySelections) {
    const pools = [
      new Map(homeSlots.map((a) => [a.displayName, a])),
      new Map(awaySlots.map((a) => [a.displayName, a])),
    ] as [Map<string, typeof sean>, Map<string, typeof sean>];
    async function actorFor(side: 0 | 1, name: string) {
      const pool = pools[side];
      let actor = pool.get(name);
      if (!actor) {
        actor =
          side === 0 ? await makeHomePlayer(name) : await makeAwayPlayer(name);
        pool.set(name, actor);
      }
      return actor;
    }
    async function startStandalone() {
      if (!penaltySelections) return;
      const teams = (await Promise.all(
        [0, 1].map(async (side) =>
          Promise.all(
            penaltySelections![side as 0 | 1].kickers.map((name) =>
              actorFor(side as 0 | 1, name),
            ),
          ),
        ),
      )) as [typeof homeSlots, typeof homeSlots];
      const keepers = (await Promise.all([
        actorFor(0, penaltySelections[0].keeper),
        actorFor(1, penaltySelections[1].keeper),
      ])) as [typeof sean, typeof sean];
      for (const pool of pools)
        for (const actor of pool.values()) actor.sprite.visible = false;
      const controllers: [number | null, number | null] = [null, null];
      for (const seat of seats ?? [])
        controllers[seat.side === -1 ? 0 : 1] ??= seat.device;
      enterPenalties((kicks) => void showStandaloneResults(kicks), {
        teams,
        keepers,
        controllers,
        pause: async (current) => {
          audio.menu("open");
          audio.state(true, false);
          const score: [number, number] = [0, 1].map(
            (side) =>
              current.filter((k) => k.side === side && k.outcome === "Goal")
                .length,
          ) as [number, number];
          const choice = await pauseMenu(
            home,
            matchOpponent,
            score,
            1,
            0,
            false,
            false,
            true,
            false,
            undefined,
            `${penaltyLength} KICKS`,
            "PENALTIES",
          );
          if (choice === "quit") {
            leaveShootout(true);
            return true;
          }
          audio.menu("close");
          audio.state(false, true);
          return false;
        },
      });
    }
    async function showStandaloneResults(kicks: Kick[]) {
      // The controller randomizes the starting side; use its completed kick order here.
      const final = shootout(
        kicks,
        (kicks[0]?.side ?? 0) as 0 | 1,
        penaltyLength,
      );
      const panel = document.createElement("dialog");
      panel.className = "pk-results";
      const winner = final.winner === 0 ? home : matchOpponent;
      const heading = document.createElement("h2");
      heading.textContent = winner.name + " WINS THE SHOOTOUT";
      panel.append(heading);
      const summary = document.createElement("p");
      summary.textContent = `${home.name} ${final.score[0]} – ${final.score[1]} ${matchOpponent.name} · ${penaltyLength} KICKS${kicks.length > 2 * penaltyLength ? " · SUDDEN DEATH" : ""}`;
      panel.append(summary);
      const stats = document.createElement("p");
      const sideStats = (side: 0 | 1) => {
        const attempts = kicks.filter((k) => k.side === side);
        return `${attempts.length} attempts · ${attempts.filter((k) => k.outcome === "Goal").length} scored · ${kicks.filter((k) => k.side !== side && k.outcome === "Save").length} keeper saves · ${attempts.filter((k) => k.outcome === "Wide" || k.outcome === "Woodwork").length} missed`;
      };
      stats.textContent = `${homeLabel}: ${sideStats(0)}  |  ${matchOpponent.name}: ${sideStats(1)}`;
      panel.append(stats);
      const history = document.createElement("ol");
      for (const kick of kicks) {
        const item = document.createElement("li");
        item.textContent = `${kick.side === 0 ? home.name : matchOpponent.name} · ${kick.kicker ?? "Kicker"} vs ${kick.keeper ?? "Keeper"} · ${kick.outcome}`;
        history.append(item);
      }
      panel.append(history);
      const nav = document.createElement("nav");
      const button = (label: string, action: () => void) => {
        const b = document.createElement("button");
        b.textContent = label;
        b.onclick = action;
        nav.append(b);
      };
      button("REMATCH", () => {
        panel.close();
        panel.remove();
        void startStandalone();
      });
      button("KICK OFF", () => leaveShootout(true));
      button("MAIN MENU", () => leaveShootout(false));
      panel.append(nav);
      document.body.append(panel);
      panel.showModal();
      nav.querySelector("button")?.focus();
    }
    function leaveShootout(kickoff: boolean) {
      history.replaceState(
        { ...history.state, kickoffMenu: kickoff, arcadeMenu: true },
        "",
      );
      location.reload();
    }
    await startStandalone();
    return;
  }
  if (penaltyLab) {
    homeScore = awayScore = 2;
    phase = "fulltime";
    matchSeconds = 1500;
    enterPenalties(() => {});
    return;
  }
  if (freePractice) {
    renderer.domElement.setAttribute(
      "aria-label",
      stadiumTest ? venueName + " pitch" : "Free practice pitch",
    );
    phase = "play";
    active = ballPlayer = 0;
    carry();
    el("message").textContent = "";
    for (const actor of pitchActors)
      actor.sprite.visible = players.includes(actor);
    matchView.classList.add("training", "free-practice");
    training.choose(freeDrill);
    training.render("");
    training.panel.hidden = false;
    if (weatherTest) {
      renderer.domElement.setAttribute(
        "aria-label",
        "Weather Playground · Grant Park",
      );
      training.panel.querySelector("strong")!.textContent =
        "Weather Playground";
      const controls =
        training.panel.querySelector<HTMLButtonElement>("[data-again]")!;
      const weatherButton = document.createElement("button");
      weatherButton.textContent = "Weather settings";
      weatherButton.onclick = () => void matchMenu();
      controls.replaceWith(weatherButton);
    }
    if (curveLab) {
      renderer.domElement.setAttribute("aria-label", "Burn Curve Lab pitch");
      for (let i = 0; i < 12; i++) {
        const spare = ball.clone();
        spare.scale.setScalar(cinematicBallSize);
        spare.position.set(
          10 + Math.floor(i / 6) * 1.2,
          restingHeight,
          ((i % 6) - 2.5) * 1.5,
        );
        scene.add(spare);
        practiceBalls.push(spare);
      }
      training.panel.querySelector("strong")!.textContent = "Burn Curve Lab";
      training.panel.querySelector("p")!.textContent =
        "Hold K / B. Aim with WASD or the left stick, sweep a quarter or fast half circle, then release.";
      const burn = document.createElement("button");
      function toggleFire() {
        fireCurve = !fireCurve;
        burn.textContent = "Burn Mode " + (fireCurve ? "ON" : "OFF") + " · F";
      }
      burn.onclick = toggleFire;
      fireCurve = true;
      toggleFire();
      training.panel.querySelector("nav")!.prepend(burn);
      addEventListener("keydown", (e) => {
        if (!e.repeat && e.code === "KeyF") toggleFire();
      });
      nextCurveBall();
    }
    if (stadiumTest) {
      training.panel.querySelector("strong")!.textContent = "Stadium Test";
      training.panel.querySelector("p")!.textContent =
        venueName + " · F Free camera";
      training.panel
        .querySelector("[data-again]")!
        .replaceWith(el("changeView"));
      const lighting = document.createElement("button");
      lighting.type = "button";
      lighting.id = "stadium-lighting";
      lighting.title = "Toggle sunset and night (N)";
      let night = venue === "school" || venue === "westend";
      function showLighting() {
        lighting.textContent = night
          ? "9 PM · N"
          : topdeck
            ? "Twilight · N"
            : "Sunset · N";
        lighting.setAttribute(
          "aria-label",
          night
            ? "9 PM lighting. Switch to sunset"
            : "Sunset lighting. Switch to 9 PM",
        );
      }
      showLighting();
      lighting.onclick = () => {
        night = !night;
        setSchoolNight!(night);
        showLighting();
      };
      el("changeView").after(lighting);
    }
  } else if (standalonePractice && !tutorialLaunch) {
    crossingDrill = true;
    const attackNames =
      managedClub === burners
        ? [
            "Meghan",
            "Pam",
            "Stubbs",
            "Daniel",
            "Steven",
            "Nelson",
            "José",
            "Jeremy",
            "Nadia",
          ]
        : managedLineup.starters.slice(0, 3);
    const available = [...managedSlots.slice(0, 6), ...reserves];
    const trio = available
      .filter((a) => attackNames.includes(a.displayName))
      .slice(0, 3);
    for (const name of attackNames) {
      if (trio.length === 3) break;
      if (trio.some((a) => a.displayName === name)) continue;
      const actor = await managedPlayer(name);
      scene.remove(actor.sprite);
      squad.set(name, identity(actor));
      trio.push(actor);
    }
    // Use existing pitch sprites so camera, contact shadows and input all share the match code.
    const practiceIds = trio.map(identity);
    matchPlayers
      .slice(0, 3)
      .forEach((slot, i) => Object.assign(slot, practiceIds[i]));
    players.splice(3);
    opponents.splice(0);
    for (const actor of pitchActors)
      actor.sprite.visible = players.includes(actor) || actor === awayGK;
    training.panel.hidden = false;
    matchView.classList.add("training");
    training.choose(selectedDrill);
    setupRep();
  }
  if (tutorialLaunch) {
    // The opposing roster stays white for the entire afternoon. Swap only the
    // rendered map: gameplay and replay retain their original animation identities.
    const awayNames = new Set(
      tutorialScene.away.map((name) => name.toLowerCase()),
    );
    const awayUrls = new Set(
      Object.entries(burnerHomeSheets)
        .filter(([path]) => awayNames.has(path.split("/").pop()!.split("-")[0]))
        .map(([, url]) => url),
    );
    const whiteImages = new Map<string, Promise<T.Texture>>();
    const whiteMaps = new Map<T.Texture, T.Texture>();
    const whiteSources = new Map<T.Source, T.Source>();
    await Promise.all(
      [...playerSheetSources].map(async ([source, url]) => {
        const whiteUrl = awayUrls.has(url) && whiteKitByHomeUrl.get(url);
        if (!whiteUrl) return;
        if (!whiteImages.has(whiteUrl))
          whiteImages.set(whiteUrl, new T.TextureLoader().loadAsync(whiteUrl));
        const white = await whiteImages.get(whiteUrl)!;
        const variant = source.clone();
        variant.source = white.source;
        variant.needsUpdate = true;
        whiteMaps.set(source, variant);
        whiteSources.set(source.source, white.source);
      }),
    );
    for (const actor of opponents) {
      let original: T.Texture | null = null;
      actor.sprite.onBeforeRender = () => {
        original = actor.sprite.material.map;
        if (!original) return;
        let white = whiteMaps.get(original);
        // Support celebrations clone their texture per actor after kickoff.
        if (!white && whiteSources.has(original.source)) {
          white = original.clone();
          white.source = whiteSources.get(original.source)!;
          white.needsUpdate = true;
          whiteMaps.set(original, white);
        }
        if (!white) return;
        white.offset.copy(original.offset);
        white.repeat.copy(original.repeat);
        white.center.copy(original.center);
        white.rotation = original.rotation;
        white.matrix.copy(original.matrix);
        white.matrixAutoUpdate = original.matrixAutoUpdate;
        actor.sprite.material.map = white;
      };
      actor.sprite.onAfterRender = () => {
        actor.sprite.material.map = original;
      };
    }
    tutorialMusic = firstTouchSoundtrack(() => music?.musicEnabled ?? false);
    renderer.domElement.setAttribute(
      "aria-label",
      "Candler Park · First Touch playable pitch",
    );
    matchView.classList.add("tutorial-session");
    meters[1].node.setAttribute("aria-label", "Park teammates Burn");
    phase = "play";
    active = ballPlayer = 0;
    players[0].sprite.position.set(0, 0, 0);
    held = true;
    carry();
    el("message").textContent = "";
    referee.sprite.visible = false;
    // Initial scene construction is allowed to place actors; chapter changes only change intentions.
    for (const [team, away] of [
      [players, false],
      [opponents, true],
    ] as const) {
      team.forEach((actor, i) => {
        if (!away && i < 3) return;
        const spot = tutorialTouchlineSpot(i, away);
        actor.sprite.position.set(spot.x, 0, spot.z);
        actor.goal.copy(actor.sprite.position);
        actor.face = facing(0, -spot.z);
      });
    }
    tutorial = new TutorialDirector(tutorialLaunch, headshots, {
      pause: (on) => {
        cancelCharge();
        keys.clear();
        axisX = axisZ = 0;
        pause(on);
      },
      reset: () => {
        reset();
        phase = "play";
        el("message").textContent = "";
      },
      exit: exitPractice,
      chapter: (index) => {
        scoreboard.style.visibility = index === 11 ? "visible" : "hidden";
        tutorialTackler = null;
        if (index === 5) {
          const controlled = players[active].displayName;
          tutorialDefenders = [
            controlled,
            controlled === "Jeremy" ? "José" : "Jeremy",
          ];
        }
      },
      ready: () =>
        !charge &&
        !inFlight &&
        !shot &&
        !aerial &&
        !bluePass &&
        !outBall &&
        !keeperRestart &&
        !celebrating &&
        replay.cut < 0 &&
        !players[active].moving &&
        !blastShooter,
    });
  }
  if (simulation) matchView.dataset.simulation = "";
  let revealFirstFrame = !broadcast;
  el("switchPlayer").onclick = switchPlayer;
  el("reset").onclick = () => {
    if (standalonePractice) {
      exitPractice();
      return;
    }
    goalEvent = null;
    audio.restartMatch();
    facts = newFacts();
    lastDelivery = null;
    homePasser = "";
    careerBookings.clear();
    careerFouledPlayer = undefined;
    careerGoals.length = 0;
    longAttempts.fill(0);
    twoPointGoals.fill(0);
    highlights.length = 0;
    careerShots.fill(0);
    onTarget.fill(0);
    woodwork.fill(0);
    appearances.clear();
    music?.finish();
    audio.clear();
    resetBurn();
    half = 1;
    attackSign = 1;
    matchSeconds = homeScore = awayScore = 0;
    beatRemaining = beatStartSeconds;
    beatPendingEnd = false;
    if (mystery) {
      Object.assign(mystery, createMysteryState());
      applyMysteryModifier();
      if (!inferno) resetBurn();
    }
    paused = false;
    matchView.removeAttribute("data-paused");
    el("pause").textContent = "Pause";
    el("pause").removeAttribute("disabled");
    applyTeam(managedLineup.starters, managedLineup.bench);
    for (const data of squad.values()) {
      data.penalty = data.lateChallenges = 0;
      data.sprintCharge = data.staminaCapacity = 100;
    }
    for (const m of [...outfield, ...(street ? [] : [sean])]) {
      m.penalty = m.lateChallenges = 0;
      m.sprite.visible = true;
      m.sprintCharge = m.staminaCapacity = 100;
    }
    shotCounts.forEach((row) => row.fill(0));
    el("shotStats")
      .querySelectorAll("td")
      .forEach((c) => (c.textContent = "0"));
    keys.clear();
    reset();
  };
  el("pause").onclick = () => void matchMenu();
  scoreboard.onclick = () => {
    if (replay.cut >= 0) {
      if (!replay.nextAngle()) reset(shotDirection === attackSign, true);
    } else void matchMenu();
  };
  let flying = false;
  const flyKeys = new Set<string>();
  const flyHint = stadiumTest ? training.panel.querySelector("p") : null;
  if (stadiumTest) {
    window.addEventListener(
      "keydown",
      (event) => {
        if (squadOpen) return;
        if (
          event.code === "KeyN" &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (!event.repeat) el("stadium-lighting").click();
          return;
        }
        if (event.code === "KeyF") {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (event.repeat) return;
          flying = !flying;
          flyKeys.clear();
          keys.clear();
          cancelCharge();
          camera.rotation.reorder("YXZ");
          if (!flying)
            for (const guest of sidelineGuests)
              guest.map.offset.x =
                ((guest.face + screenRotation() + 8) % 8) / 8;
          flyHint!.textContent = flying
            ? "Fly: WASD · Q/E down/up · arrows or drag to look · F return"
            : venueName + " · F Free camera";
        } else if (flying) {
          event.preventDefault();
          event.stopImmediatePropagation();
          flyKeys.add(event.code);
        }
      },
      true,
    );
    window.addEventListener("keyup", (event) => flyKeys.delete(event.code));
    window.addEventListener("blur", () => flyKeys.clear());
    renderer.domElement.addEventListener("pointermove", (event) => {
      if (flying && event.buttons === 1) {
        camera.rotation.y -= event.movementX * 0.005;
        camera.rotation.x = T.MathUtils.clamp(
          camera.rotation.x - event.movementY * 0.005,
          -1.54,
          1.54,
        );
      }
    });
  }
  addEventListener("keydown", (e) => {
    if (keeperPanel && !paused && !squadOpen && !e.repeat) {
      if (e.code === "KeyR") {
        resetKeeperTest();
        return;
      }
      if (keeperGather > 0 && (e.code === "KeyQ" || e.code === "KeyE")) {
        pickOutlet(e.code === "KeyQ" ? -1 : 1);
        return;
      }
    }
    if (fullTimeScreen) return;
    if (celebrationLab) {
      if (labControls?.key(e)) return;
      keys.add(e.code);
      if (["KeyB", "KeyK", "Space"].includes(e.code)) {
        e.preventDefault();
        if (!e.repeat) press("shot", e.code);
      }
      return;
    }
    if (
      (seats?.length === 0 || (simulation && !seats)) &&
      (celebrating || replay.cut >= 0) &&
      ["KeyJ", "Enter"].includes(e.code)
    ) {
      e.preventDefault();
      if (!e.repeat) skipGoalPresentation();
      return;
    }
    if (seats && e.code === "Escape") {
      e.preventDefault();
      if (!e.repeat) void matchMenu();
      return;
    }
    if (seats) {
      couchKeys.add(e.code);
      const s = seats.find((s) => s.device === -1);
      if (s && !e.repeat) couchInput(s, keyButton(e.code), true);
      if (e.code.startsWith("Arrow") || e.code === "Space" || e.code === "Tab")
        e.preventDefault();
      return;
    }
    if (simulation && e.code === "Escape") {
      e.preventDefault();
      if (!e.repeat) void matchMenu();
      return;
    }
    if (
      broadcast ||
      squadOpen ||
      (e.target instanceof HTMLButtonElement && e.code === "Space")
    )
      return;
    if (!weatherTest && (freePractice || crossingDrill) && e.code === "Enter") {
      e.preventDefault();
      if (!e.repeat) exitPractice();
      return;
    }
    if ((curveLab || crossingDrill) && e.code === "KeyR") {
      if (!e.repeat) chooseDrill(training.drill);
      return;
    }
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
        e.code,
      )
    )
      e.preventDefault();
    if (
      e.code === "Comma" ||
      e.code === "Period" ||
      [",", ".", "<", ">"].includes(e.key)
    ) {
      e.preventDefault();
      if (!e.repeat)
        cycleView(
          e.code === "Comma" || e.key === "," || e.key === "<" ? -1 : 1,
        );
      return;
    }
    if (simulation) return;
    if (e.code === "ArrowRight") {
      if (!e.repeat) switchPlayer();
      return;
    }
    keys.add(e.code);
    if (!e.repeat) {
      if (e.code === "KeyX") press("cross", e.code);
      if (e.code === "KeyY") press("through", e.code);
      if (["KeyE", "KeyJ"].includes(e.code)) press("pass", e.code);
      if (["KeyB", "KeyK", "Space"].includes(e.code)) press("shot", e.code);
      if (e.code === "Escape") {
        e.preventDefault();
        void matchMenu();
      }
    }
  });
  function keyButton(code: string) {
    return (
      (
        {
          KeyE: 0,
          KeyJ: 0,
          Space: 1,
          KeyB: 1,
          KeyK: 1,
          KeyX: 2,
          KeyY: 3,
          Tab: 4,
          KeyQ: 4,
        } as Record<string, number>
      )[code] ?? 99
    );
  }
  addEventListener("blur", () => couchKeys.clear());
  addEventListener("keyup", (e) => {
    couchKeys.delete(e.code);
    const s = seats?.find((s) => s.device === -1);
    if (s) couchInput(s, keyButton(e.code), false);
    keys.delete(e.code);
    release(e.code);
  });
  addEventListener("blur", () => {
    if (celebrationLab || freePractice) {
      keys.clear();
      axisX = axisZ = 0;
      cancelCharge();
    } else if (!aiHome && !squadOpen && !crossingDrill) void matchMenu();
  });
  const utilityButtons = keeperTest
    ? [4, 5, 14, 15, 11, 1]
    : [4, 14, 15, 11, 1];
  const utilityHeld = utilityButtons.map(() => false);
  let padIndex: number | null = null;
  function updatePadStatus(text: string) {
    const badge = el("padStatus");
    if (badge.textContent !== text) badge.textContent = text;
  }
  const beatReconnect = document.createElement("div");
  beatReconnect.className = "beat-reconnect";
  beatReconnect.setAttribute("role", "alertdialog");
  beatReconnect.setAttribute("aria-label", "Controller disconnected");
  beatReconnect.innerHTML =
    "<strong>CONTROLLER DISCONNECTED</strong><span>Press any button on a controller to rejoin the challenge.</span>";
  beatReconnect.hidden = true;
  if (beatTheClock) matchView.append(beatReconnect);
  function checkBeatReconnect() {
    if (!beatTheClock || beatReconnect.hidden || fullTimeScreen) return;
    const pads = Array.from(navigator.getGamepads?.() ?? []).filter(
      (pad): pad is Gamepad => !!pad,
    );
    const available = pads.find(
      (pad) =>
        !seats?.some((seat) => seat.device === pad.index) &&
        pad.buttons.some((button) => button.pressed),
    );
    if (!available) return;
    const used = new Set((seats ?? []).map((seat) => seat.number));
    let number = 1;
    while (used.has(number)) number++;
    seats ??= [];
    seats.push({ device: available.index, side: beatTeam!, number, actor: -1 });
    aiHome = beatTeam === 1;
    beatReconnect.hidden = true;
    buttons.set(
      seats[seats.length - 1],
      available.buttons.map((button) => button.pressed),
    );
    updatePadStatus("Controller reconnected");
    if (paused && !squadOpen) pause(false);
  }
  addEventListener("gamepaddisconnected", (event) => {
    if (
      beatTheClock &&
      seats?.some((seat) => seat.device === event.gamepad.index)
    ) {
      const departed = seats.find(
        (seat) => seat.device === event.gamepad.index,
      )!;
      buttons.delete(departed);
      seats = seats.filter((seat) => seat !== departed);
      seatLabels.get(departed.number)?.root.remove();
      seatLabels.delete(departed.number);
      padIndex = null;
      updatePadStatus("Controller disconnected");
      if (seats.length === 0) {
        if (!squadOpen) pause(true);
        beatReconnect.hidden = false;
      }
      return;
    }
    if (simulation || celebrationLab || event.gamepad.index !== padIndex)
      return;
    padIndex = null;
    if (!squadOpen && !crossingDrill && !freePractice) void matchMenu();
    updatePadStatus("Controller disconnected");
  });
  const stick = el("stick");
  function moveStick(e: PointerEvent) {
    if (e.pointerId !== joy) return;
    const r = stick.getBoundingClientRect();
    axisX = (e.clientX - r.left - r.width / 2) / 36;
    axisZ = (e.clientY - r.top - r.height / 2) / 36;
    const m = Math.max(1, Math.hypot(axisX, axisZ));
    axisX /= m;
    axisZ /= m;
    el("knob").style.transform =
      "translate(" + axisX * 28 + "px," + axisZ * 28 + "px)";
  }
  stick.onpointerdown = (e) => {
    joy = e.pointerId;
    stick.setPointerCapture(joy);
    moveStick(e);
  };
  stick.onpointermove = moveStick;
  stick.onlostpointercapture = () => {
    joy = null;
    axisX = axisZ = 0;
    el("knob").style.transform = "";
  };
  for (const [id, action] of [
    ["kick", "shot"],
    ["pass", "pass"],
    ["cross", "cross"],
    ["through", "through"],
  ] as const) {
    const button = el(id);
    button.onpointerdown = (e) => {
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      press(action, "pointer" + e.pointerId);
    };
    button.onpointerup = (e) => release("pointer" + e.pointerId);
    button.onlostpointercapture = (e) => {
      const source = "pointer" + e.pointerId;
      if (charge?.source === source) cancelCharge();
      if (rushSource === source || puntHold?.source === source) cancelRush();
    };
  }
  function resetLab() {
    goalCard.hidden = true;
    matchView.classList.remove("lab-kickoff");
    clearReplay();
    goalMap = undefined;
    groupStarted = false;
    goalAge = resultTime = 0;
    netTravel = false;
    fireEnd = 0;
    showGoalFire(-1);
    audio.clear();
    cancelCharge();
    cancelRush();
    clearanceLoose = struckLoose = false;
    shot = null;
    outBall = null;
    keeperRestart = null;
    feedbackActor = null;
    callout.hidden = true;
    vx = vz = reboundVY = 0;
    windupReceiver = lastSender = -1;
    centerPass = false;
    phase = "play";
    active = ballPlayer = labIndex;
    held = true;
    inFlight = false;
    ball.visible = shadow.visible = true;
    homeSlots.forEach((actor, i) => {
      actor.sprite.position.set(
        7 + (i % 4) * 2,
        0,
        -5 + Math.floor(i / 4) * 3.5,
      );
      actor.face = actor.drawFace = 2;
      actor.age = -1;
      actor.moving = false;
      actor.runClock = 0;
      actor.tackling = actor.shooting = false;
      actor.velocity.set(0, 0, 0);
      snowVelocities.delete(actor);
      actor.sprite.material.rotation = 0;
    });
    homeSlots[labIndex].sprite.position.set(fieldX - 4.5, 0, 0);
    endFollowUpRuns();
    carry();
    camTarget.copy(homeSlots[labIndex].sprite.position);
    goalBanner.hidden = true;
    el("shotResult").textContent = "";
    el("message").textContent = "";
    labControls?.select(homeSlots[labIndex].displayName);
  }
  if (celebrationLab) {
    // Sean takes shots like an outfielder here. His sprite is already among the pitch actors.
    players.push(sean);
    matchView.classList.add("celebration-lab");
    referee.sprite.visible = awayGK.sprite.visible = false;
    viewIndex = 1;
    view = views[viewIndex];
    resize();
    labIndex = homeSlots.findIndex((actor) => actor.displayName === "José");
    labControls = celebrationControls(
      matchView,
      (command) => {
        audio.menu("nav");
        if (command === "prev" || command === "next") {
          labIndex =
            (labIndex + (command === "next" ? 1 : -1) + homeSlots.length) %
            homeSlots.length;
          resetLab();
        } else if (command === "reset") resetLab();
        else location.reload();
      },
      menuPad(),
    );
    resetLab();
  }
  let last: number | undefined;
  function startGoalScene() {
    const homeGoalScored = shotDirection === attackSign;
    const scoringClub = homeGoalScored ? home : matchOpponent;
    const winners = homeGoalScored ? homeSlots : awaySlots;
    const losers = homeGoalScored ? opponents : players;
    ownGoalCelebration = !!scorer && !winners.includes(scorer);
    celebrant = ownGoalCelebration
      ? (winners.find((actor) => actor.sprite.visible && !actor.penalty) ??
        null)
      : scorer;
    const interGoal =
      scoringClub.name === "Inter Your Mom" && scorer
        ? interMaleGoals[scorer.displayName]
        : undefined;
    const fleetGoal = scorer
      ? fleetCelebrations.get(scorer.maps[0])
      : undefined;
    const onsiderGoal = scorer
      ? onsiderMaleGoals.get(scorer.maps[0])
      : undefined;
    goalMap =
      fleetGoal?.stand ??
      onsiderGoal?.stand ??
      interGoal?.stand ??
      (scorer && scoringClub === burners
        ? celebrations[scorer.displayName]
        : undefined);
    runCelebration =
      fleetGoal?.run ??
      onsiderGoal?.run ??
      interGoal?.run ??
      (scoringClub === burners
        ? scorer?.displayName === "Stubbs"
          ? stubbsSlide
          : scorer?.displayName === "Meghan"
            ? meghanSkate
            : scorer?.displayName === "José"
              ? spiderRun
              : scorer?.displayName === "Steven"
                ? stevenGoalRun
                : scorer?.displayName === "Pam"
                  ? pamSkateGoal
                  : scorer?.displayName === "Bjorn"
                    ? bjornGoalRun
                    : scorer?.displayName === "Nelson"
                      ? nelsonGoalRun
                      : scorer?.displayName === "Chris"
                        ? chrisGoalRun
                        : scorer?.displayName === "Nadia"
                          ? nadiaGoalRun
                          : scorer?.displayName === "Jan"
                            ? janGoalRun
                            : scorer?.displayName === "Daniel"
                              ? danielGoalRun
                              : undefined
        : undefined);
    if (ownGoalCelebration) {
      goalMap = undefined;
      runCelebration = undefined;
    }
    costumeReveal =
      runCelebration === meghanSkate ||
      runCelebration === spiderRun ||
      runCelebration === pamSkateGoal ||
      ((scoringClub.name === "Trash Pandas FC" ||
        scoringClub.name === "Sweeper Creepers FC" ||
        scoringClub.name === "Grass Assassins") &&
        !!fleetGoal?.run);
    celebrationRunSeconds =
      runCelebration === stubbsSlide
        ? slideDuration
        : runCelebration === stevenGoalRun
          ? 3
          : 3.5;
    slideX = -shotDirection;
    slideZ = 0;
    groupStarted = false;
    frontRow.clear();
    celebrationSeconds = 0;
    skipCelebration = false;
    goalAge = 0;
    aerial = null;
    callout.hidden = true;
    feedbackActor = null;
    for (const actor of pitchActors) {
      actor.moving = false;
      actor.tackling = false;
      actor.shooting = false;
      actor.age = -1;
      actor.runClock = 0;
      actor.sprite.material.rotation = 0;
      actor.sprite.position.y = 0;
    }
    walks = (ownGoalCelebration ? [] : losers)
      .filter((a) => a.sprite.visible && !a.penalty)
      .map((actor, i) => ({
        actor,
        gather: false,
        target: new T.Vector3(
          -shotDirection * (1 + Math.floor(i / 3)),
          0,
          2 * ((i % 3) - 1),
        ),
        speed: 1.65,
        delay: 0,
        phase: 0,
      }));
    // Gathering targets are offsets from the scorer, so the chase follows every turn.
    const keeper = homeGoalScored ? sean : awayGK;
    const mates = winners.filter(
      (a) =>
        a !== celebrant &&
        (ownGoalCelebration || a !== keeper) &&
        a.sprite.visible &&
        !a.penalty,
    );
    // Keep the south, camera-facing side of the scorer open. Spread the
    // teammates around the far half of the circle with a little variation.
    const spread = Math.min(
      Math.PI - 0.32,
      Math.max(0.75, (mates.length - 1) * 0.68),
    );
    mates.forEach((actor, i) => {
      const angle = ownGoalCelebration
        ? (i / Math.max(1, mates.length)) * Math.PI * 2
        : 1.5 * Math.PI +
          (mates.length > 1 ? (i / (mates.length - 1) - 0.5) * spread : 0) +
          (Math.random() - 0.5) * 0.12;
      const radius = 1.55 + Math.random() * 0.65;
      walks.push({
        actor,
        gather: true,
        target: new T.Vector3(
          radius * Math.cos(angle),
          0,
          radius * Math.sin(angle),
        ),
        speed: 4.1 + Math.random() * 2.6,
        delay: Math.random() * 0.65,
        phase: i * 0.27 + Math.random() * 0.04,
      });
    });
    resultTime = celebrationRunSeconds + 2.8;
    if (ownGoalCelebration) {
      celebrationRunSeconds = 0;
      startGroupCelebration();
    }
  }
  function startGroupCelebration() {
    groupStarted = true;
    if (!celebrant) return;
    celebrant.moving = false;
    celebrant.runClock = 0;
    const goalCell = goalMap?.userData.cell ?? 48;
    resultTime =
      goalMap === pamGoal || goalMap === nelsonGoal
        ? ((2 * goalMap.image.width) / goalCell) * 0.2
        : goalMap === meghanGoal || goalMap?.userData.directionalCelebration
          ? (goalMap.image.width / goalCell) * 0.2
          : 2.8;
    if (goalMap !== mandyGoal) return;
    const center = celebrant.sprite.position;
    const mates = walks.filter((w) => w.gather);
    const toward = new T.Vector2(-center.x, -center.z);
    if (toward.lengthSq() < 0.01) toward.set(-shotDirection, 0);
    toward.normalize();
    celebrant.face = celebrant.drawFace = facing(toward.x, toward.y);
    const frontCount = Math.ceil(mates.length / 2);
    mates.forEach(({ actor, target }, i) => {
      const front = i < frontCount;
      if (front) frontRow.add(actor);
      const count = front ? frontCount : mates.length - frontCount;
      const lateral =
        ((front ? i : i - frontCount) - (count - 1) / 2) * 1.65 +
        (front ? 0 : 0.3);
      const depth = front ? 2.5 : 3.85;
      target.set(
        toward.x * depth - toward.y * lateral,
        0,
        toward.y * depth + toward.x * lateral,
      );
    });
  }
  function advanceGoalScene(
    dt: number,
    realDt: number,
    pad: Gamepad | undefined,
  ) {
    // Celebration sprites need extra clearance from solid boards. Their
    // gathering offsets can otherwise put bodies through the enclosure.
    const celebrationX = enclosed ? courtBoards.x - 1.2 : fieldX - 0.5;
    const celebrationNorth = enclosed ? courtBoards.north + 1.2 : -fieldZ + 0.5;
    const celebrationSouth = enclosed ? courtBoards.south - 1.2 : fieldZ - 0.5;
    goalAge += realDt;
    resultTime -= realDt;
    showGoalFire(goalAge);
    if (
      celebrant &&
      !groupStarted &&
      !(costumeReveal && goalAge < costumeRevealTime)
    ) {
      const pos = celebrant.sprite.position;
      const userScored = shotDirection === attackSign && !aiHome;
      const [x, z] = userScored
        ? readAim(pad)
        : [
            -shotDirection * 0.65,
            (Math.sign(shotStart.z || 1) * 9 - pos.z) * 0.3,
          ];
      celebrant.moving = Math.hypot(x, z) > 0.22;
      if (runCelebration === stubbsSlide) {
        if (celebrant.moving) {
          const length = Math.hypot(x, z);
          slideX = x / length;
          slideZ = z / length;
        }
        const step =
          slideDistanceAt(goalAge) - slideDistanceAt(goalAge - realDt);
        pos.x = T.MathUtils.clamp(
          pos.x + slideX * step,
          -celebrationX,
          celebrationX,
        );
        pos.z = T.MathUtils.clamp(
          pos.z + slideZ * step,
          celebrationNorth,
          celebrationSouth,
        );
        celebrant.face = facing(slideX, slideZ, celebrant.face);
      } else if (celebrant.moving) {
        celebrant.face = facing(x, z, celebrant.face);
        const [dx, dz] = dirs[celebrant.face],
          step = 4.6 * realDt;
        pos.x = T.MathUtils.clamp(
          pos.x + dx * step,
          -celebrationX,
          celebrationX,
        );
        pos.z = T.MathUtils.clamp(
          pos.z + dz * step,
          celebrationNorth,
          celebrationSouth,
        );
        celebrant.travel += step;
        celebrant.runClock += realDt;
      } else celebrant.runClock = 0;
    }
    if (!groupStarted && goalAge >= celebrationRunSeconds)
      startGroupCelebration();
    for (const { actor, target, gather, speed, delay } of walks) {
      if (gather && goalAge < delay) {
        actor.moving = false;
        continue;
      }
      const center = gather ? celebrant?.sprite.position : undefined;
      const pos = actor.sprite.position;
      const dx =
        T.MathUtils.clamp(
          target.x + (center?.x ?? 0),
          enclosed ? -celebrationX : -fieldX + 0.25,
          enclosed ? celebrationX : fieldX - 0.25,
        ) - pos.x;
      const dz =
        T.MathUtils.clamp(
          target.z + (center?.z ?? 0),
          enclosed ? celebrationNorth : -fieldZ + 0.25,
          enclosed ? celebrationSouth : fieldZ - 0.25,
        ) - pos.z;
      const d = Math.hypot(dx, dz);
      actor.moving = d > (actor.moving ? 0.08 : 0.35);
      if (!actor.moving) {
        if (center && groupStarted)
          actor.face = facing(center.x - pos.x, center.z - pos.z, actor.face);
        continue;
      }
      const step = Math.min(d, realDt * speed);
      pos.x += (step * dx) / d;
      pos.z += (step * dz) / d;
      actor.face = facing(dx, dz, actor.face);
      actor.travel += step;
      actor.runClock += realDt * (gather ? speed / 5 : 0.55);
    }
    if (
      ownGoalCelebration &&
      walks.some(({ actor, gather }) => gather && actor.moving)
    )
      resultTime = Math.max(resultTime, 2.8);
    if (groupStarted && goalMap === mandyGoal) {
      const groupAge = goalAge - celebrationRunSeconds;
      resultTime =
        photoStart + (mandyGoal.image.width / 68) * 0.2 + 0.35 - groupAge;
      const cue = ["ONE…", "TWO…", "THREE…", "CHEESE!"][
        Math.min(3, Math.floor(groupAge))
      ];
      el("shotResult").textContent = cue;
    }
    if (netTravel) {
      ball.position.x += shotDirection * Math.max(5, vx * shotDirection) * dt;
      ball.position.z += vz * dt;
      const net = shotDirection === 1 ? attackingGoal : homeGoal;
      const contact = net.contactX(ball.position.y);
      if (
        shotDirection * (ball.position.x - contact) >= 0 ||
        Math.abs(ball.position.z) >= 1.85
      ) {
        ball.position.x =
          shotDirection *
          Math.min(shotDirection * ball.position.x, shotDirection * contact);
        ball.position.z = T.MathUtils.clamp(ball.position.z, -1.85, 1.85);
        audio.play("net", 0.48);
        net.strike(
          ball.position.x,
          ball.position.y,
          ball.position.z,
          shotMultiplier - 1,
        );
        netTravel = false;
        vx = -1.6 * shotDirection;
      }
    } else {
      ball.position.x += vx * dt;
      vx *= Math.exp(-5 * dt);
      ball.position.y = Math.max(restingHeight, ball.position.y - 2.2 * dt);
    }
    homeGoal.update(dt);
    attackingGoal.update(dt);
    updateSpin();
    if (celebrant)
      camTarget.lerp(celebrant.sprite.position, 1 - Math.exp(-4 * realDt));
    if (costumeReveal && celebrant)
      costumeChange.draw(goalAge, celebrant.sprite.position);
    if (
      beatTheClock
        ? celebrationSeconds > 3
        : goalAge >
          (costumeReveal
            ? 0.14
            : firstToFive &&
                Math.max(homeScore, awayScore) >= rules.targetScore - 1
              ? 2.2
              : 0.85)
    )
      goalBanner.hidden = true;
  }
  function setReplayHint() {
    replayPanel.hidden = false;
    const button = el("skipReplay");
    const caption = replay.cut === 3 ? "End Replay" : "Next Angle";
    if (button.textContent?.endsWith(caption)) return;
    button.innerHTML = hint("J", "A") + " " + caption;
  }
  const film = broadcastDirector();
  let broadcastRotation = 0,
    decisionIn = 0.5;
  function playForHome(dt: number) {
    decisionIn -= dt;
    if (phase === "fulltime") {
      if (simulation || seats) return;
      music?.finish();
      resetBurn();
      half = 1;
      matchSeconds = homeScore = awayScore = 0;
      reset();
      return;
    }
    if (
      celebrating ||
      phase === "halftime" ||
      outBall ||
      keeperRestart ||
      keeperGather > 0 ||
      resultTime > 0
    )
      return;
    const player = players[active],
      pos = player.sprite.position;
    if (freeKick) {
      if (!freeKick.blue && freeKick.wait === 0) {
        press("pass", "auto");
        release("auto");
      }
      return;
    }
    if (phase === "kickoff" && kickoffBlue) return;
    if (held && ballPlayer === active) {
      autoX = attackSign;
      autoZ = -pos.z * 0.065;
      if (player.age >= 0 || decisionIn > 0) return;
      decisionIn = 0.85 + Math.random() * 0.9;
      const range = Math.hypot(fieldX - pos.x * attackSign, pos.z);
      if (!airOnly && phase === "play" && range < 12) {
        shotMultiplier = 1.7 + Math.random() * 0.3;
        kick();
        return;
      }
      const pressure = opponents.some(
        (o) => !o.penalty && o.sprite.position.distanceTo(pos) < 3.4,
      );
      if (phase === "kickoff" || pressure || Math.random() < 0.52) {
        if (tryCpuBank(false)) return;
        let best = -Infinity;
        for (const mate of players) {
          if (mate === player || mate.penalty) continue;
          const to = mate.sprite.position,
            dx = to.x - pos.x,
            dz = to.z - pos.z,
            dist = Math.hypot(dx, dz);
          const space = Math.min(
            6,
            ...opponents
              .filter((o) => !o.penalty)
              .map((o) => o.sprite.position.distanceTo(to)),
          );
          const score =
            space + 0.55 * dx * attackSign - 0.25 * dist + Math.random() * 1.8;
          if (score > best) {
            best = score;
            autoX = dx / (dist || 1);
            autoZ = dz / (dist || 1);
          }
        }
        pass(
          1.65,
          (airBalls && range < 23) || (Math.abs(pos.z) > 7 && range < 17)
            ? "cross"
            : "pass",
        );
      }
    } else {
      if (canSwitch() && decisionIn <= 0) {
        switchPlayer();
        decisionIn = 0.5;
      }
      const foot = players[active].sprite.position;
      const dx = ball.position.x - foot.x,
        dz = ball.position.z - foot.z,
        length = Math.hypot(dx, dz);
      autoX = length > 0.3 ? dx / length : 0;
      autoZ = length > 0.3 ? dz / length : 0;
      if (canTackle() && length < 1.15) press("shot", "auto");
    }
  }
  function matchCard(status: string) {
    const rival = ticket ? opponent(ticket.career) : 1,
      control = facts.control[0] + facts.control[1];
    const percent = control
      ? Math.round((100 * facts.control[0]) / control)
      : 0;
    const scorers = [0, rival]
      .map((club) => {
        const entries = careerGoals
          .filter((g) => g.club === club)
          .map((g) => {
            const portrait =
              club === 0 && home === burners
                ? headshots[g.player]
                : rivalHeadshot(club === 0 ? home : matchOpponent, g.player);
            const face = portrait
              ? `<img src="${portrait}" alt="">`
              : `<span class="ft-rival" style="background-image:url('${rivalSprites(club === 0 ? home : matchOpponent, g.player)?.idle ?? blueIdle}')"></span>`;
            return `<li>${face}<b>${g.player}</b> ${g.minute}′${longRange || mystery || house ? ` · +${goalValues.get(g) ?? 1}` : ""}</li>`;
          })
          .join("");
        return (
          '<ul aria-label="' +
          (club === 0 ? home.name : matchOpponent.name) +
          ' scorers">' +
          (entries || "") +
          "</ul>"
        );
      })
      .join("");
    const score = ticket
      ? scoreRow(0, rival, [homeScore, awayScore], status)
      : `<div class="lb-row"><span class="lb-side"><img src="${home.crest}" alt=""><b>${home.name}</b></span><div class="lb-score"><strong>${homeScore} – ${awayScore}</strong><small>${status}</small></div><span class="lb-side"><img src="${matchOpponent.crest}" alt=""><b>${matchOpponent.name}</b></span></div>`;
    return (
      `<div style="--stat-home:${clubAccent(home)};--stat-away:${clubAccent(matchOpponent)}">` +
      score +
      '<div class="ft-scorers">' +
      scorers +
      "</div>" +
      statRow(
        "Possession",
        control ? [percent + "%", 100 - percent + "%"] : ["—", "—"],
      ) +
      (longRange
        ? statRow("Two-point goals", twoPointGoals) +
          statRow("Long-range attempts", longAttempts)
        : "") +
      statRow("Total shots", careerShots) +
      statRow("Shots on target", onTarget) +
      (street
        ? ""
        : statRow("Saves", [
            Math.max(
              0,
              onTarget[1] - careerGoals.filter((g) => g.club === 1).length,
            ),
            Math.max(
              0,
              onTarget[0] - careerGoals.filter((g) => g.club === 0).length,
            ),
          ])) +
      statRow("Woodwork", woodwork) +
      statRow("Passes completed", facts.passes) +
      statRow("Tackles won", facts.tackles) +
      statRow("Fouls", facts.fouls) +
      (street ? "" : statRow("Corner kicks", facts.corners)) +
      statRow("Yellow cards", facts.yellow) +
      statRow(
        "Distance (mi)",
        facts.metres.map((m) => (m / 1609.344).toFixed(2)),
      ) +
      "</div>"
    );
  }
  function halfTimeLeague() {
    const dialog = document.createElement("dialog");
    const rows = ticket
      ? ticket.career.schedule[ticket.career.round]
          .filter((g) => g.a && g.b)
          .map((g) => {
            const kickoff = ticket.career.schedule[ticket.career.round].find(
              (match) => match.a === 0 || match.b === 0,
            )!.kickoff!;
            const at = scoreboardAt(g, kickoff + 25);
            return scoreRow(g.a, g.b, at.score, at.label);
          })
          .join("")
      : "";
    dialog.className = "career-whistle half-time";
    dialog.innerHTML =
      "<h2>Half time</h2>" +
      matchCard("HT") +
      (rows ? "<h3>Around the League</h3>" + rows : "") +
      `<div class="menu-legend controller-legend"><button>${hint("Enter", "A")} Start Second Half</button></div>`;
    document.body.append(dialog);
    dialog.showModal();
    reveal(dialog, "h2,h3,button");
    squadOpen = true;
    const go = () => {
      dialog.close();
      dialog.remove();
      squadOpen = false;
      keys.clear();
      breakSeconds = 0;
      last = undefined;
    };
    dialog.querySelector("button")!.onclick = go;
    dialog.scrollTop = 0;
    dialog.oncancel = (e) => {
      e.preventDefault();
      go();
    };
    let held = !!menuPad()?.buttons[0]?.pressed;
    function poll() {
      if (!dialog.isConnected) return;
      const pad = menuPad(),
        down = !!pad?.buttons[0]?.pressed;
      if (pad && Math.abs(pad.axes[3] ?? 0) > 0.2)
        dialog.scrollTop += pad.axes[3] * 9;
      if (down && !held) {
        go();
        return;
      }
      held = down;
      requestAnimationFrame(poll);
    }
    requestAnimationFrame(poll);
  }
  function showFullTime(
    performanceReport?: NonNullable<Report["performance"]>,
    pens?: Report["pens"],
  ) {
    const summary = document.createElement("dialog");
    summary.className = "career-whistle full-time";
    summary.innerHTML = renderMarkup(fullTimeTemplate, {
      watchHint: hint("Enter", "Menu"),
      nextHint: hint("Enter", "A"),
      backHint: hint("Esc", "B"),
    });
    if (firstToFive)
      summary.querySelector(".ft-heading")!.textContent = "MATCH COMPLETE";
    if (beatTheClock)
      summary.querySelector(".ft-heading")!.textContent = "TIME'S UP!";
    summary.querySelector("h2")!.outerHTML =
      '<div class="ft-card">' +
      matchCard(
        house
          ? "HOUSE RULES · FINAL"
          : pens
            ? "FINAL · " + pens.join("–") + " PENS"
            : firstToFive
              ? `FIRST TO ${rules.targetScore}`
              : beatTheClock
                ? "BEAT THE CLOCK"
                : airBalls
                  ? "AIR BALLS"
                  : mystery
                    ? "MYSTERY MATCH"
                    : "FINAL",
      ) +
      "</div>";
    let personal: HTMLElement | null = null;
    if (ticket && performanceReport) {
      const { name, goals } = performanceReport;
      personal = document.createElement("section");
      personal.className = "ft-player";
      personal.innerHTML = `<span class="ft-sprite" style="background-image:url('${burnerPortraits[name]}')"></span><div><small>Player-manager</small><h3>${name}</h3><div>Goals ${goals} · Assists ${facts.assists} · Completed passes ${facts.personalPasses}</div><b class="ft-xp"></b><progress max="100" aria-label="Progress to next level"></progress></div>`;
      summary.querySelector("p")!.replaceWith(personal);
    } else if (house) {
      summary.querySelector("p")!.textContent = houseSummary(house.config).join(
        " · ",
      );
      saveHouseResult(house.config, {
        score: [homeScore, awayScore],
        goals: careerGoals,
        elapsed: houseElapsed,
        teams: [home.name, matchOpponent.name],
      });
    } else if (street) {
      summary.querySelector("p")!.textContent =
        `STREET · ${rules.teamSize}V${rules.teamSize} · ${homeScore === awayScore ? "DRAW" : (homeScore > awayScore ? home.name : matchOpponent.name) + " WINS"} · ${careerGoals.map((g) => g.player + (g.assist ? " (assist " + g.assist + ")" : "")).join(" · ")}`;
    } else if (airBalls) {
      summary.querySelector("p")!.textContent =
        `AIR BALLS · ${invalidAirGoals} grounded goals disallowed`;
    } else if (mystery) {
      summary.querySelector("p")!.textContent =
        `MYSTERY MATCH · ${mystery.history.length} modifiers activated (active gameplay time): ${mystery.history
          .map(
            (entry) =>
              `${Math.floor(entry.at / 60)
                .toString()
                .padStart(2, "0")}:${Math.floor(entry.at % 60)
                .toString()
                .padStart(
                  2,
                  "0",
                )} ${mysteryModifiers.find((mod) => mod.id === entry.id)?.name}`,
          )
          .join(" · ")}`;
    } else if (firstToFive) {
      const seconds = Math.floor(matchSeconds);
      summary.querySelector("p")!.textContent =
        `FIRST TO ${rules.targetScore} · ${homeScore > awayScore ? home.name : matchOpponent.name} WINS · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} elapsed`;
    } else if (longRange)
      summary.querySelector("p")!.textContent =
        "LONG RANGE · Goals outside the dotted box count double.";
    else if (snowpocalypse)
      summary.querySelector("p")!.textContent =
        "SNOWPOCALYPSE · 7V7 · Atlanta shuts down. Football doesn't.";
    else if (inferno)
      summary.querySelector("p")!.textContent =
        "INFERNO · 7V7 · Every player has unlimited Burn.";
    else if (survival)
      summary.querySelector("p")!.textContent =
        `SURVIVAL · ${home.name}: ${players.filter((p) => !p.penalty).length + 1} left, ${survivalHistory.filter((e) => e.side === 0).length} eliminated · ${matchOpponent.name}: ${opponents.filter((p) => !p.penalty).length + 1} left, ${survivalHistory.filter((e) => e.side === 1).length} eliminated. ${survivalHistory.map((e) => `${e.minute}′ ${e.name} eliminated (${e.team})`).join(" · ")}`;
    else summary.querySelector("p")!.remove();
    document.body.append(summary);
    summary.showModal();
    const start = performance.now(),
      meter = personal?.querySelector("progress"),
      xpText = personal?.querySelector(".ft-xp");
    function animateXP(now: number) {
      if (!ticket || !performanceReport || !meter || !xpText) return;
      const t = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 1
        : Math.min(1, (now - start) / 1100);
      const xp = Math.floor(
        ticket.career.xp + (performanceReport.xpAfter - ticket.career.xp) * t,
      );
      xpText.textContent =
        "Level " +
        (1 + Math.floor(xp / 100)) +
        " · " +
        xp +
        " XP · +" +
        (performanceReport.xpAfter - ticket.career.xp) +
        " XP";
      meter.value = xp % 100;
      if (t < 1) requestAnimationFrame(animateXP);
    }
    animateXP(start);
    let cycle = 0,
      slide = 0,
      started = 0,
      watching = false;
    const caption = document.createElement("div");
    caption.className = "career-caption";
    matchView.append(caption);
    matchView.classList.add("ft-footage");
    caption.hidden = true;
    const watch = summary.querySelector<HTMLButtonElement>(".ft-watch")!;
    const nextClip = summary.querySelector<HTMLButtonElement>(".ft-next")!;
    const skip = summary.querySelector<HTMLButtonElement>(".ft-back")!;
    const proceed = summary.querySelector<HTMLButtonElement>(".ft-proceed")!;
    const panel = summary.querySelector<HTMLElement>(".ft-panel")!;
    if (
      street ||
      snowpocalypse ||
      longRange ||
      firstToFive ||
      inferno ||
      survival ||
      beatTheClock ||
      airBalls ||
      !!mystery ||
      !!house
    ) {
      proceed.innerHTML =
        hint("Esc", "B") +
        (gulchDebug ? " Return to Debug" : " Return to Kickoff");
      const rematch = document.createElement("button");
      rematch.textContent = "Rematch";
      rematch.onclick = () => {
        history.replaceState(
          {
            ...history.state,
            streetRematch: {
              fixture,
              lineup,
              awayLineup,
              seats,
              rules,
              settings,
              gulchDebug,
              venue,
            },
            arcadeMenu: true,
          },
          "",
        );
        void finish();
      };
      proceed.before(rematch);
      if (house) {
        const save = document.createElement("button");
        save.textContent = "Save Rules";
        save.onclick = () => {
          try {
            saveHousePreset(house.config);
            save.textContent = "Rules saved";
          } catch {
            save.textContent = "Unable to save";
          }
        };
        const edit = document.createElement("button");
        edit.textContent = "Edit Rules";
        edit.onclick = () => {
          history.replaceState(
            {
              ...history.state,
              houseEdit: { config: house.config, court: rules.court, fixture },
              kickoffMenu: true,
              arcadeMenu: true,
            },
            "",
          );
          void finish();
        };
        const menu = document.createElement("button");
        menu.textContent = "Main Menu";
        menu.onclick = () => {
          history.replaceState({ ...history.state, houseMainMenu: true }, "");
          void finish();
        };
        proceed.before(save, edit, menu);
      }
    }
    async function finish() {
      if (
        street ||
        snowpocalypse ||
        longRange ||
        firstToFive ||
        inferno ||
        survival ||
        beatTheClock ||
        airBalls ||
        !!mystery ||
        !!house
      )
        history.replaceState(
          {
            ...history.state,
            kickoffMenu: history.state?.houseMainMenu
              ? false
              : !gulchDebug || !!history.state?.streetRematch,
            houseMainMenu: null,
            keeperDebug: gulchDebug && !history.state?.streetRematch,
            arcadeMenu: true,
          },
          "",
        );
      cancelAnimationFrame(cycle);
      music?.carryOver();
      await music?.finish();
      location.reload();
    }
    function openSummary() {
      watching = false;
      caption.hidden = true;
      summary.classList.remove("watching");
      watch.hidden = !highlights.length;
      skip.hidden = true;
      nextClip.hidden = true;
      proceed.hidden = false;
      reveal(summary, ".ft-heading,.ft-card,.ft-player,.ft-legend");
      if (highlights.length) watch.focus({ preventScroll: true });
      else proceed.focus({ preventScroll: true });
      panel.scrollTop = 0;
    }
    let transition: { index: number; start: number; time: number } | null =
      null;
    function advanceClip(now: number) {
      if (!reducedReplayMotion.matches && highlights.length > 1) {
        transition = { index: slide, start: started, time: now };
        renderer.domElement.after(dissolveLayer);
      }
      slide++;
      started = now;
      if (slide === highlights.length) {
        slide = 0;
        if (watching) openSummary();
      }
    }
    function drawClip(index: number, elapsed: number) {
      const h = highlights[index];
      return h.clip.playHighlight(
        elapsed,
        h.angle,
        h.card,
        renderer.domElement.width / renderer.domElement.height,
        h.direction,
        renderer,
        scene,
      );
    }
    function show(now: number) {
      if (transition) {
        const age = (now - transition.time) / 1000;
        if (age >= 1) {
          transition = null;
          endDissolve();
        } else {
          const live = renderer.domElement;
          if (
            dissolveLayer.width !== live.width ||
            dissolveLayer.height !== live.height
          ) {
            dissolveLayer.width = live.width;
            dissolveLayer.height = live.height;
          }
          drawClip(transition.index, (now - transition.start) / 1000);
          dissolveContext.drawImage(live, 0, 0);
          dissolveLayer.style.opacity = String(1 - age);
        }
      }
      if (watching && caption.dataset.slide !== String(slide)) {
        const label = highlights[slide].label,
          parts = label.split(" · "),
          name = parts[1];
        caption.replaceChildren();
        if (parts.length === 3 && name) {
          const minute = document.createElement("span");
          minute.textContent = parts[0] + " -";
          const face = document.createElement("span");
          face.className = "career-caption-face";
          const homePlayer = [
            home.keeper,
            ...home.outfield,
            ...home.bench,
          ].includes(name);
          const portrait =
            homePlayer && home === burners
              ? headshots[name]
              : rivalHeadshot(homePlayer ? home : matchOpponent, name);
          if (portrait) {
            const img = document.createElement("img");
            img.src = portrait;
            img.alt = "";
            face.append(img);
          } else
            face.style.backgroundImage = `url("${rivalSprites(homePlayer ? home : matchOpponent, name)?.idle ?? (homePlayer ? portraits[name] : blueIdle)}")`;
          const event = document.createElement("span");
          event.textContent =
            name.toUpperCase() + " - " + parts[2].toUpperCase();
          caption.append(minute, face, event);
        } else caption.textContent = label;
        caption.dataset.slide = String(slide);
      }
      if (!drawClip(slide, (now - started) / 1000)) advanceClip(now);
      cycle = requestAnimationFrame(show);
    }
    watch.onclick = () => {
      transition = null;
      endDissolve();
      slide = 0;
      started = performance.now();
      watching = true;
      caption.hidden = false;
      summary.classList.add("watching");
      delete caption.dataset.slide;
      watch.hidden = true;
      skip.hidden = false;
      nextClip.hidden = false;
      proceed.hidden = true;
      nextClip.focus();
    };
    nextClip.onclick = () => advanceClip(performance.now());
    skip.onclick = openSummary;
    proceed.onclick = finish;
    summary.oncancel = (e) => {
      e.preventDefault();
      if (watching) openSummary();
      else void finish();
    };
    summary.addEventListener("keydown", (e) => {
      if (
        (street ||
          snowpocalypse ||
          longRange ||
          firstToFive ||
          inferno ||
          survival ||
          beatTheClock ||
          airBalls ||
          !!mystery ||
          !!house) &&
        !watching &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)
      ) {
        e.preventDefault();
        moveResult(e.code === "ArrowLeft" || e.code === "ArrowUp" ? -1 : 1);
        return;
      }
      if (e.code !== "Enter" && e.code !== "NumpadEnter") return;
      e.preventDefault();
      e.stopPropagation();
      if (
        (street ||
          snowpocalypse ||
          longRange ||
          firstToFive ||
          inferno ||
          survival ||
          beatTheClock ||
          airBalls ||
          !!mystery ||
          !!house) &&
        !watching
      ) {
        (document.activeElement as HTMLButtonElement)?.click();
        return;
      }
      if (watching) advanceClip(performance.now());
      else if (highlights.length) watch.click();
    });
    openSummary();
    if (highlights.length) {
      started = performance.now();
      cycle = requestAnimationFrame(show);
    }
    (watch.hidden ? proceed : watch).focus({ preventScroll: true });
    panel.scrollTop = 0;
    function moveResult(step: number) {
      const buttons = [
        ...summary.querySelectorAll<HTMLButtonElement>(
          ".ft-legend button:not([hidden])",
        ),
      ];
      const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
      buttons[(i + step + buttons.length) % buttons.length]?.focus();
    }
    let resultDirection = "";
    let held = !!menuPad()?.buttons[0]?.pressed,
      backHeld = !!menuPad()?.buttons[1]?.pressed,
      startHeld = !!menuPad()?.buttons[9]?.pressed;
    function poll() {
      const pad = menuPad(),
        down = !!pad?.buttons[0]?.pressed,
        start = !!pad?.buttons[9]?.pressed;
      if (pad && Math.abs(pad.axes[3] ?? 0) > 0.2)
        panel.scrollTop += pad.axes[3] * 9;
      const direction = pad ? menuDirection(pad) : "";
      if (
        (street ||
          snowpocalypse ||
          longRange ||
          firstToFive ||
          inferno ||
          survival ||
          beatTheClock ||
          airBalls ||
          !!mystery ||
          !!house) &&
        !watching &&
        direction &&
        direction !== resultDirection
      )
        moveResult(direction === "l" || direction === "u" ? -1 : 1);
      resultDirection = direction;
      const back = !!pad?.buttons[1]?.pressed;
      if (
        (street ||
          snowpocalypse ||
          longRange ||
          firstToFive ||
          inferno ||
          survival ||
          beatTheClock ||
          airBalls ||
          !!mystery ||
          !!house) &&
        !watching &&
        down &&
        !held
      )
        (document.activeElement as HTMLButtonElement)?.click();
      else if (watching && back && !backHeld) openSummary();
      else if (watching && down && !held) advanceClip(performance.now());
      else if (!watching && back && !backHeld) void finish();
      else if (!watching && start && !startHeld && highlights.length)
        watch.click();
      backHeld = back;
      held = down;
      startHeld = start;
      requestAnimationFrame(poll);
    }
    requestAnimationFrame(poll);
  }
  const landingRing = new T.Mesh(
    new T.RingGeometry(0.42, 0.5, 32),
    new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide }),
  );
  landingRing.rotation.x = -Math.PI / 2;
  landingRing.visible = false;
  scene.add(landingRing);
  function updateLandingRing() {
    const pos = ball.position,
      mark = landingRing.position;
    landingRing.visible = false;
    if (
      pos.y <= restingHeight + 0.025 ||
      phase !== "play" ||
      celebrating ||
      replay.cut >= 0
    )
      return;
    if (bins.flying) bins.landing(pos, mark);
    else if (
      (crossingDrill && training.drill === aerialDrill && repReset >= 0) ||
      outBall ||
      (!held &&
        !inFlight &&
        !bluePass &&
        !shot &&
        !keeperRestart &&
        keeperGather <= 0)
    ) {
      const aftermath =
        crossingDrill && training.drill === aerialDrill && repReset >= 0;
      const v = aftermath ? repVelocity : outBall ? outVelocity : null;
      const vertical = v?.y ?? reboundVY,
        t =
          (vertical + Math.sqrt(vertical ** 2 + 34 * (pos.y - restingHeight))) /
          17;
      const speed = Math.hypot(vx, vz),
        travel = struckLoose ? Math.min(t, speed / 6) : t;
      const distance = v
        ? (1 - Math.exp(-0.18 * t)) / 0.18
        : struckLoose
          ? travel * (1 - (3 * travel) / Math.max(0.001, speed))
          : (1 - Math.exp(-1.25 * t)) / 1.25;
      mark.set(
        pos.x + (v?.x ?? vx) * distance,
        0,
        pos.z + (v?.z ?? vz) * distance,
      );
    } else if (
      keeperRestart &&
      keeperRestart.age >= 0.45 &&
      !keeperRestart.blueBuild
    )
      mark.copy(keeperRestart.end);
    else if (bluePass?.loft) mark.copy(bluePass.end);
    else if (inFlight && !perfectPass) {
      const t =
        passKind === "cross"
          ? 1
          : Math.min(1, nextTouch(arc.duration, passTime) / passDuration);
      mark
        .lerpVectors(passStart, passTarget, t)
        .addScaledVector(assistOffset, t * t);
    } else if (shot) {
      const t =
        shotStart.y <= restingHeight + 0.01 &&
        shot.result !== "Over" &&
        shot.result !== "Crossbar"
          ? Math.min(1, nextTouch(arc.duration, shotTime) / shot.duration)
          : 1;
      mark.set(
        T.MathUtils.lerp(shotStart.x, shot.targetX, t),
        0,
        T.MathUtils.lerp(shotStart.z, shot.targetZ, t),
      );
    } else return;
    mark.y = 0.048;
    landingRing.visible = true;
  }
  const career = ticket?.career;
  const careerDetails = career && {
    season: seasonName(career.season),
    date: calendarDate(career, 5),
    kind: stage(
      career.round,
      career.schedule[career.round].findIndex(
        (game) => game.a === 0 || game.b === 0,
      ),
    ),
  };
  if (playIntro) await prepareMatchIntro(introVenue);
  function startIntro() {
    return matchIntro({
      scene,
      renderer,
      root: matchView,
      teams: [homeSlots, awaySlots],
      weatherAdvisory: snowpocalypse,
      clubs: [home, matchOpponent],
      ball,
      venue: venueName,
      time: settings.time,
      kind: house
        ? "HOUSE RULES"
        : airBalls
          ? "AIR BALLS · 7V7"
          : mystery
            ? "MYSTERY MATCH · 7V7"
            : street
              ? `STREET · ${rules.teamSize}V${rules.teamSize}${rules.winCondition === "target" ? " · FIRST TO FIVE" : ""}`
              : firstToFive
                ? `FIRST TO ${rules.targetScore} · 7V7`
                : snowpocalypse
                  ? "SNOWPOCALYPSE · 7V7"
                  : inferno
                    ? "INFERNO · 7V7"
                    : survival
                      ? "SURVIVAL · 7V7"
                      : beatTheClock
                        ? "BEAT THE CLOCK · 7V7"
                        : "Friendly",
      modeGuide: house
        ? houseSummary(house.config).slice(0, 7).join(" · ")
        : airBalls
          ? "HEADERS. VOLLEYS. SET PIECES. · GROUNDED GOALS DON’T COUNT. · KEEP IT UP!"
          : mystery
            ? "THE RULES CHANGE EVERY 30 SECONDS · EXPECT THE UNEXPECTED"
            : undefined,
      ...careerDetails,
      exitPreview: introTest
        ? () => {
            history.replaceState(
              {
                ...history.state,
                arcadeMenu: true,
                previewReturn: {
                  kind: "matchIntro",
                  venue: kickOffVenue,
                  time: settings.time,
                },
              },
              "",
            );
            location.reload();
          }
        : undefined,
      introVenue,
      schoolLights,
      millLights,
      introCar,
      train: (progress) => updateTrain?.intro(progress),
      hide: [
        referee.sprite,
        ring,
        targetRing,
        landingRing,
        shadow,
        ...contactShadows.map((s) => s.mesh),
      ],
    });
  }
  function tick(now: number) {
    if (playIntro && !introStarted && !crossingDrill) {
      introStarted = true;
      intro = startIntro();
    }
    let surfaceMinutes = 0;
    const elapsed = Math.max(0, now - (last ?? now)) / 1000,
      dt =
        Math.min(0.04, elapsed) *
        (blastShooter ? (strikeWindup ? 0.25 : 0) : impactTime > 0 ? 0.08 : celebrating ? 0.38 : 1) *
        (house?.config.speed ??
          (mysteryOn("turbo") ? 1.5 : mysteryOn("slowMotion") ? 0.65 : 1));
    last = now;
    if (
      house &&
      !intro &&
      !paused &&
      !document.hidden &&
      !squadOpen &&
      !fullTimeScreen &&
      phase === "play" &&
      !celebrating
    )
      houseElapsed += Math.min(0.1, elapsed);
    if (intro) {
      const step = document.hidden ? 0 : Math.min(0.2, elapsed);
      if (!intro.paused) updateWeather(step);
      if (!intro.draw(step)) {
        intro.dispose();
        intro = null;
        // Record the start press so normal match input waits for a fresh A.
        const pad = menuPad();
        lastPause = !!pad?.buttons[9]?.pressed;
        for (const seat of seats ?? [])
          buttons.set(
            seat,
            Array.from(pad?.buttons ?? [], (button) => button.pressed),
          );
        reset();
      }
      matchView.removeAttribute("data-loading");
      requestAnimationFrame(tick);
      return;
    }
    if (!paused && !document.hidden && !squadOpen && !fullTimeScreen)
      updateTrain?.(Math.min(elapsed, 0.2), half, matchSeconds, stadiumTest);
    if (flying) {
      if (!paused && !document.hidden) updateWeather(Math.min(elapsed, 0.1));
      const axis = (positive: string, negative: string) =>
        Number(flyKeys.has(positive)) - Number(flyKeys.has(negative));
      const step =
        dt * (flyKeys.has("ShiftLeft") || flyKeys.has("ShiftRight") ? 22 : 9);
      camera.rotation.y += axis("ArrowLeft", "ArrowRight") * dt * 1.7;
      camera.rotation.x = T.MathUtils.clamp(
        camera.rotation.x + axis("ArrowUp", "ArrowDown") * dt * 1.7,
        -1.54,
        1.54,
      );
      camera.translateZ(step * axis("KeyS", "KeyW"));
      camera.translateX(step * axis("KeyD", "KeyA"));
      camera.position.y = Math.max(
        topdeck ? -15.8 : 0.25,
        camera.position.y + step * axis("KeyE", "KeyQ"),
      );
      for (const guest of sidelineGuests)
        guest.map.offset.x =
          T.MathUtils.euclideanModulo(
            guest.face - Math.round(camera.rotation.y / (Math.PI / 4)),
            8,
          ) / 8;
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
      return;
    }
    if (fullTimeScreen) return;
    checkBeatReconnect();
    if (squadOpen) {
      requestAnimationFrame(tick);
      return;
    }
    if (aiHome && document.hidden) {
      requestAnimationFrame(tick);
      return;
    }
    if (
      beatTheClock &&
      !paused &&
      !squadOpen &&
      !document.hidden &&
      phase === "play" &&
      !celebrating &&
      replay.cut < 0
    ) {
      beatRemaining = Math.max(0, beatRemaining - elapsed);
      updateScore();
      if (beatRemaining === 0 && !shot && !inFlight) finishBeatChallenge();
    }
    if (airBalls && !paused && phase === "play" && !celebrating) {
      if (airInvalidUntil && now >= airInvalidUntil) {
        goalBanner.hidden = true;
        airInvalidUntil = 0;
      }
      for (const [number, buffer] of airSeatShots) {
        if (now > buffer.expires || held || blueCarrier >= 0 || outBall || shot)
          airSeatShots.delete(number);
        else {
          const seat = seats?.find((s) => s.number === number);
          if (seat) {
            const [x, z] = seatAim(seat);
            buffer.gesture.sample(x, z, now);
          }
        }
      }
      if (queued?.expires && now > queued.expires) {
        queued = null;
        showPower(0);
      }
      if (!held && blueCarrier < 0 && !shot && ball.position.y > 0.8)
        airWasAloft = true;
      if (airWasAloft && ball.position.y <= restingHeight + 0.05) {
        airBounceAt = now;
        airWasAloft = false;
      }
      if (held || blueCarrier >= 0) {
        airWasAloft = false;
        airBounceAt = -Infinity;
      }
    }
    if (mystery) {
      if (mysteryRevealUntil === Infinity) mysteryRevealUntil = now + 3000;
      if (now >= mysteryRevealUntil) mysteryReveal.hidden = true;
      if (
        !paused &&
        !document.hidden &&
        !squadOpen &&
        phase === "play" &&
        !celebrating &&
        replay.cut < 0 &&
        !outBall &&
        !keeperRestart &&
        keeperGather <= 0 &&
        resultTime <= 0 &&
        !freeKick
      ) {
        const old = mystery.current.id;
        const oldBag = [...mystery.bag];
        if (advanceMystery(mystery, elapsed)) {
          if (shot || inFlight || bluePass) {
            mystery.remaining = 0;
            mystery.history.pop();
            mystery.current = mysteryModifiers.find((mod) => mod.id === old)!;
            mystery.bag = oldBag;
          } else applyMysteryModifier(old);
        }
      }
      mysteryHud.querySelector(".mystery-next")!.textContent =
        `NEXT ${mysteryTime(mystery.remaining)}`;
      mysteryHud.style.setProperty(
        "--mystery-progress",
        String(Math.max(0, mystery.remaining / mysteryInterval)),
      );
      mysteryHud.toggleAttribute("data-warning", mystery.remaining <= 5);
    }
    if (!paused && !squadOpen && !document.hidden) {
      impactTime = Math.max(0, impactTime - elapsed);
      if (blastShooter) {
        blastWindup += Math.min(elapsed, 0.04);
        const progress = Math.min(1, blastWindup / 0.65);
        blastShooter.age = progress * 0.34;
        if (strikeWindup) {
          if (aerial && players[aerial.index] === blastShooter)
            aerial.age = progress * (aerial.style === "HEADER" ? 0.30 : 0.24);
          ball.position.lerpVectors(aerialApproach, aerialContact, progress);
          updateSpin();
          // Keep the surrounding action moving at quarter speed during contact.
          // Possession stays reserved until the strike has left the shooter.
          for (const actor of outfield) {
            if (actor === blastShooter || actor.penalty || !actor.sprite.visible) continue;
            if (actor.moving && actor.age < 0) {
              const [x, z] = dirs[actor.face];
              const step = 3 * dt / Math.hypot(x, z);
              actor.sprite.position.x = T.MathUtils.clamp(actor.sprite.position.x + x * step, -fieldX, fieldX);
              actor.sprite.position.z = T.MathUtils.clamp(actor.sprite.position.z + z * step, -fieldZ, fieldZ);
              actor.runClock += dt;
            }
            if (actor.age >= 0 && (actor.age += dt) > kickAnimationSeconds) actor.age = -1;
          }
          for (const [actor, age] of jumps) {
            if (age + dt >= 0.92) jumps.delete(actor);
            else jumps.set(actor, age + dt);
          }
          updateReferee(dt);
          camTarget.lerp(ball.position, 1 - Math.exp(-6 * dt));
        }
        if (blastWindup >= 0.65) {
          const shooter = blastShooter;
          blastShooter = null;
          const burn = windupBurn;
          strikeWindup = false;
          windupBurn = false;
          audio.play("blast", burn ? 0.95 : 0.85);
          if (opponents.includes(shooter)) tryBlueShot(burn);
          else launchShot(shooter, burn);
        }
      }
    }
    if (alternateBall) {
      const image =
        useSnowBall() === initiallySnowing
          ? initialBallImage
          : alternateBall.image;
      if (ballMap.image !== image) {
        ballMap.image = image;
        ballMap.needsUpdate = true;
      }
    }
    if (!paused) {
      if (tutorial) tutorialTime += dt;
      updateTutorialPark?.(dt, tutorial?.chapter ?? 0);
      updateWeather(dt);
      for (const actor of outfield)
        actor.reactionTime = Math.max(0, actor.reactionTime - dt);
    }
    const connectedPad = broadcast ? undefined : menuPad();
    if (seats?.length === 0 || (simulation && !seats)) {
      const down = !!connectedPad?.buttons[0]?.pressed;
      if (down && !spectatorPassHeld) skipGoalPresentation();
      spectatorPassHeld = down;
    }
    const tutorialInput = tutorial?.input(connectedPad) ?? false;
    if (tutorialInput) cancelCharge();
    if (tutorial) {
      const moving = players[active].moving;
      const lull =
        !charge &&
        !inFlight &&
        !shot &&
        !bluePass &&
        !aerial &&
        !outBall &&
        !keeperRestart &&
        !celebrating &&
        replay.cut < 0 &&
        !moving &&
        !blastShooter;
      tutorial.update(
        paused ? 0 : Math.min(elapsed, 0.1),
        lull,
        !paused && phase === "play" && !celebrating,
      );
    }
    soloPad =
      seats?.length === 1 && seats[0].device < 0 ? connectedPad : undefined;
    syncSeats();
    for (const s of seats ?? []) {
      const pad = seatPad(s);
      pollSwitchStick(pad, s);
      const next = Array.from(pad?.buttons ?? [], (b) => b.pressed),
        prev = buttons.get(s);
      if (next[11] && !prev?.[11] && prev) cycleView(1);
      if (prev)
        for (const i of [0, 1, 2, 3, 4])
          if (!!next[i] !== !!prev[i]) couchInput(s, i, !!next[i]);
      buttons.set(s, next);
    }
    if ((aiHome || (seats && !owner(-1, active))) && !paused && replay.cut < 0)
      playForHome(dt);
    const inputPad = seats ? undefined : connectedPad;
    if (!aiHome && !simulation && !celebrationLab) pollSwitchStick(inputPad);
    labControls?.poll(inputPad);
    const pad = celebrationLab || simulation ? undefined : inputPad;
    const controlsPad = celebrationLab ? undefined : inputPad;
    if (controlsPad && padIndex !== controlsPad.index) {
      utilityButtons.forEach(
        (n, i) => (utilityHeld[i] = !!controlsPad.buttons[n]?.pressed),
      );
      padIndex = controlsPad.index;
      faceActions.forEach((_, i) => (padHeld[i] = !!pad?.buttons[i]?.pressed));
      updatePadStatus(
        controlsPad.mapping === "standard"
          ? "Controller connected"
          : "Controller connected · check layout",
      );
    }
    const menu = !!connectedPad?.buttons[9]?.pressed;
    if (
      crossingDrill &&
      training.count === 5 &&
      pad?.buttons[0]?.pressed &&
      !padHeld[0]
    )
      chooseDrill(training.drill);
    const retry = !!pad?.buttons[8]?.pressed;
    if (keeperPanel && !paused && retry && !lastRetry) resetKeeperTest();
    if ((curveLab || crossingDrill) && retry && !lastRetry)
      chooseDrill(training.drill);
    lastRetry = retry;
    if (!tutorial && menu && !lastPause) {
      lastPause = true;
      void matchMenu();
      if (squadOpen) {
        requestAnimationFrame(tick);
        return;
      }
    }
    lastPause = menu;
    utilityButtons.forEach((n, i) => {
      const down = !!controlsPad?.buttons[n]?.pressed;
      if (down && !utilityHeld[i]) {
        if (keeperPanel && (n === 4 || n === 5) && keeperGather > 0 && !paused)
          pickOutlet(n === 4 ? -1 : 1);
        else if (n === 1) {
          if (simulation && (paused || phase === "fulltime")) exitSimulation();
        } else if (n === 4) {
          if (!simulation) switchPlayer();
        } else if (n !== 5) cycleView(n === 14 ? -1 : 1);
      }
      utilityHeld[i] = down;
    });
    for (const i of [3, 0, 1, 2]) {
      const action = faceActions[i];
      const down = celebrationLab
        ? i === 1 && !!inputPad?.buttons[1]?.pressed
        : !!pad?.buttons[i]?.pressed;
      if (!tutorialInput && down && !padHeld[i]) press(action, "pad" + i);
      if (!tutorialInput && !down && padHeld[i]) release("pad" + i);
      padHeld[i] = down;
    }
    tutorialMusic?.update(paused && !tutorial?.isComplete);
    if (keeperGather > 0 && !paused && !squadOpen && !document.hidden) {
      keeperHoldSeconds += elapsed;
      if (keeperHoldSeconds >= 4) {
        const team = keeperTeam();
        const receiver =
          outlet >= 0 && team[outlet] && !team[outlet].penalty
            ? outlet
            : nearestEligible(team, keeperActor().sprite.position);
        keeperGather = 0;
        if (receiver >= 0) distributeKeeperBall(receiver, true);
        else releaseLooseStrike(keeperDirection(), 0, 0.85);
      }
    }
    audio.state(paused || document.hidden, celebrating || replay.cut >= 0);
    if (replay.cut >= 0) {
      landingRing.visible = false;
      for (const { icon } of exhaustionMarkers) icon.hidden = true;
      if (!paused && !replay.advance(Math.min(elapsed, 0.1))) {
        reset(shotDirection === attackSign, true);
      } else {
        setReplayHint();
        const net = shotDirection === 1 ? attackingGoal : homeGoal;
        showGoalFire(replay.cursor - replay.goal);
        const poseNet = (time: number) => net.poseAt(time);
        if (
          lastAngle >= 0 &&
          lastAngle !== replay.cut &&
          !reducedReplayMotion.matches
        ) {
          outgoing = { angle: lastAngle, cursor: lastCursor, age: 0 };
          endReplayInset();
          renderer.domElement.after(dissolveLayer);
        }
        if (outgoing) {
          if (!paused) {
            outgoing.age += elapsed;
            outgoing.cursor +=
              Math.min(elapsed, 0.1) * (outgoing.angle === 3 ? 0.55 : 1.35);
          }
          if (outgoing.age >= 1 || reducedReplayMotion.matches) endDissolve();
          else {
            const live = renderer.domElement;
            if (
              dissolveLayer.width !== live.width ||
              dissolveLayer.height !== live.height
            ) {
              dissolveLayer.width = live.width;
              dissolveLayer.height = live.height;
            }
            replay.drawAngle(
              outgoing.angle,
              outgoing.cursor,
              viewportAspect(),
              shotDirection,
              poseNet,
            );
            renderReplayView();
            dissolveContext.drawImage(live, 0, 0);
            dissolveLayer.style.opacity = String(1 - outgoing.age);
          }
        }
        replay.draw(viewportAspect(), shotDirection, poseNet);
        renderReplayView();
        lastAngle = replay.cut;
        lastCursor = replay.cursor;
        requestAnimationFrame(tick);
        return;
      }
    }
    if (!celebrating) updateLingeringSmoke(paused ? 0 : Math.min(elapsed, 0.1));
    if (!crossingDrill)
      updatePenalties(
        !paused && !celebrating && phase === "play" ? elapsed : 0,
      );
    if (bankReceiver) {
      bankWindow -= paused ? 0 : dt;
      if (
        bankWindow <= 0 ||
        !clearanceLoose ||
        held ||
        blueCarrier >= 0 ||
        outBall ||
        keeperRestart ||
        shot
      )
        bankReceiver = null;
    }
    if (
      !clearanceLoose ||
      held ||
      inFlight ||
      blueCarrier >= 0 ||
      shot ||
      keeperRestart ||
      outBall
    )
      struckLoose = false;
    const keeperX = homeKeeper.position.x,
      keeperZ = homeKeeper.position.z,
      awayKeeperX = keeper.position.x,
      awayKeeperZ = keeper.position.z;
    if (!paused && freeKick) {
      camTarget.lerp(freeKick.spot, 1 - Math.exp(-9 * dt));
      if (freeKick.wait > 0) {
        freeKick.fallAge += elapsed;
        if (cardScene) {
          if (!advanceCard(cardScene.time > 0 ? dt * 0.65 : dt))
            freeKick.wait = 0;
        } else freeKick.wait = Math.max(0, freeKick.wait - elapsed);
        if (freeKick.wait === 0) prepareFreeKick();
      } else if (charge) {
        showPower(heldPower(charge.start));
        if (charge.action === "shot") {
          const [x, z] = readAim(inputPad);
          gesture.sample(x, z, now);
        }
      }
    }
    if (phase !== "kickoff" && !celebrating && replay.cut < 0)
      goalCard.hidden = true;
    if (!paused && phase === "kickoff") {
      if (charge) showPower(heldPower(charge.start));
      if (kickoffBlue && (breakSeconds -= elapsed) <= 0) {
        if (celebrationLab) {
          resetLab();
          requestAnimationFrame(tick);
          return;
        }
        const taker = nearestEligible(opponents, ball.position);
        const receiver = opponents.findIndex(
          (o, i) => !o.penalty && i !== taker,
        );
        if (receiver < 0) {
          phase = "play";
          held = false;
          if (taker >= 0) blueWins(taker, matchOpponent.name + " BALL");
        } else {
          const end = opponents[receiver].sprite.position.clone();
          end.y = restingHeight;
          opponents[taker].age = 0.12;
          opponents[taker].shooting = true;
          opponents[taker].face = facing(
            end.x - ball.position.x,
            end.z - ball.position.z,
          );
          audio.kick(0.45);
          bluePass = {
            sender: opponents[taker].displayName,
            receiver,
            start: ball.position.clone(),
            end,
            age: 0,
            duration: ball.position.distanceTo(end) / 8,
          };
          phase = "play";
          held = false;
          el("message").textContent = "";
        }
      }
    } else if (
      !paused &&
      phase === "halftime" &&
      (breakSeconds -= elapsed) <= 0
    ) {
      music?.finish();
      half = 2;
      matchSeconds = 0;
      attackSign = -1;
      reset(true);
    }
    if (
      !blastShooter &&
      !celebrationLab &&
      !freePractice &&
      !crossingDrill &&
      !paused &&
      !celebrating &&
      phase === "play"
    ) {
      if (!document.hidden && !outBall && !keeperRestart)
        for (const [side, m] of meters.entries()) {
          if (m.seconds <= 0) continue;
          const previous = Math.ceil(m.seconds);
          m.seconds = Math.max(0, m.seconds - elapsed);
          if (m.seconds === 0) resetBurn(side);
          else {
            m.node.style.setProperty(
              "--burn",
              String(m.seconds / burnWindowSeconds),
            );
            if (previous !== Math.ceil(m.seconds)) renderBurn(side);
          }
        }
      if (!outBall && !keeperRestart) {
        if (held || inFlight || (keeperGather > 0 && keeperActor() === sean))
          facts.control[0] += dt;
        else if (blueCarrier >= 0 || bluePass || keeperGather > 0)
          facts.control[1] += dt;
      }
      if (!tutorial && !keeperTest) {
        const before = matchSeconds;
        matchSeconds = beatTheClock
          ? before + elapsed
          : rules.winCondition === "target"
            ? before + elapsed
            : Math.min(
                1500,
                before +
                  (elapsed * 1500) /
                    (60 *
                      (rules.halfMinutes ??
                        halfMinutesForSpeed[settings.speed])),
              );
        surfaceMinutes = (matchSeconds - before) / 60;
      }
      if (
        !beatTheClock &&
        rules.winCondition !== "target" &&
        matchSeconds >= 1500
      ) {
        audio.play("whistle", 0.75, half === 1 ? 1 : 0.88);
        phase = half === 1 ? "halftime" : "fulltime";
        breakSeconds = 3;
        cancelCharge();
        cancelRush();
        el("message").textContent =
          half === 1
            ? "Halftime"
            : "Full Time · " +
              homeLabel +
              " " +
              homeScore +
              " – " +
              awayScore +
              " " +
              matchOpponent.name;
        if (phase === "halftime") {
          music?.startBreak();
          if (!broadcast) halfTimeLeague();
        }
        if (phase === "fulltime") {
          if (!ticket) music?.startBreak();
          audio.finishMatch();
          el("pause").setAttribute("disabled", "");
          if (ticket) {
            const complete = structuredClone(ticket.career);
            const settle = (kicks?: Kick[]) => {
              music?.startBreak();
              audio.finishMatch();
              finishRound(
                complete,
                {
                  kicks,
                  score: [homeScore, awayScore],
                  woodwork: [...woodwork],
                  fouledPlayer: careerFouledPlayer,
                  bookedPlayers: [...careerBookings],
                  goals: careerGoals,
                  shots: careerShots,
                  played: [...appearances],
                  simulated: false,
                },
                careerRatings(complete),
              );
              const report = complete.reports[complete.round],
                name = complete.player;
              const performanceReport = (report.performance = {
                name,
                goals: careerGoals.filter(
                  (g) => g.club === 0 && g.player === name,
                ).length,
                assists: facts.assists,
                passes: facts.personalPasses,
                xpBefore: ticket.career.xp,
                xpAfter: complete.xp,
              });
              const persist = () => {
                try {
                  saveSlot(ticket!.slot, complete);
                  fullTimeScreen = true;
                  showFullTime(performanceReport, report.pens);
                } catch (e) {
                  el("message").textContent =
                    "Career result could not be saved. " + String(e);
                  el("pause").removeAttribute("disabled");
                  el("pause").textContent = "Retry save";
                  el("pause").onclick = persist;
                }
              };
              persist();
            };
            const game = complete.schedule[complete.round].find(
              (g) => g.a === 0 || g.b === 0,
            )!;
            if (
              homeScore === awayScore &&
              fixtureRequiresWinner(complete, game)
            ) {
              enterPenalties(settle);
              return;
            }
            settle();
          } else if (!broadcast) {
            fullTimeScreen = true;
            showFullTime();
          }
        }
      }
      updateScore();
    }
    if (
      crossingDrill &&
      !paused &&
      (outBall ||
        (keeperRestart && training.drill !== aerialDrill) ||
        keeperGather > 0)
    )
      finishRep(0, "Ball out of play");
    if (
      crossingDrill &&
      training.drill !== aerialDrill &&
      repReset >= 0 &&
      !bins.flying &&
      !paused &&
      training.count < 5
    ) {
      repReset -= dt;
      if (repReset <= 0) setupRep();
    }
    if (!paused && celebrating) {
      if (!document.hidden) celebrationSeconds += elapsed;
      if (
        !broadcast &&
        !celebrationLab &&
        celebrationSeconds >= 2 &&
        replayPanel.hidden
      ) {
        el("skipReplay").innerHTML = hint("J", "A") + " Skip Celebration";
        replayPanel.hidden = false;
      }
      advanceGoalScene(dt, Math.min(elapsed, 0.1), inputPad);
    } else if (
      !paused &&
      crossingDrill &&
      training.drill === aerialDrill &&
      repReset >= 0
    ) {
      if (repReset > 0) {
        if (
          (advanceStadiumBall ?? advanceOutBall)(ball.position, repVelocity, dt)
        )
          audio.play("board", 0.42);
        if (
          repNet &&
          ball.position.x >= attackingGoal.contactX(ball.position.y)
        ) {
          ball.position.x = attackingGoal.contactX(ball.position.y);
          attackingGoal.strike(
            ball.position.x,
            ball.position.y,
            ball.position.z,
            shotMultiplier - 1,
          );
          audio.play("net", 0.48);
          repVelocity.set(-0.65, -0.4, 0);
          repNet = false;
        }
        for (const [actor, age] of jumps) {
          if (age + dt >= 0.92) jumps.delete(actor);
          else jumps.set(actor, age + dt);
        }
        if (
          aerial &&
          (aerial.age += dt) >
            (["Pam", "José"].includes(players[aerial.index]?.displayName)
              ? headerAnimationSeconds
              : 0.42)
        )
          aerial = null;
        for (const actor of pitchActors)
          if (actor.age >= 0 && (actor.age += dt) > kickAnimationSeconds)
            actor.age = -1;
        attackingGoal.update(dt);
        updateSpin();
        camTarget.lerp(ball.position, 1 - Math.exp(-6 * dt));
        repReset = Math.max(0, repReset - dt);
      }
      if (repReset === 0 && training.count < 5) setupRep();
    } else if (!paused && crossingDrill && bins.flying) {
      bins.step(ball.position, dt, finishRep);
      updateSpin();
      const actor = players[active];
      if (actor.age >= 0 && (actor.age += dt) > kickAnimationSeconds)
        actor.age = -1;
      camTarget.lerp(ball.position, 1 - Math.exp(-6 * dt));
    } else if (
      !paused &&
      !blastShooter &&
      phase === "play" &&
      (!crossingDrill || (repReset < 0 && training.count < 5))
    ) {
      if (ticket)
        for (const actor of pitchActors)
          actor.world.copy(actor.sprite.position);
      for (const [actor, age] of jumps) {
        if (age + dt >= 0.92) jumps.delete(actor);
        else jumps.set(actor, age + dt);
      }
      homeLateTime = Math.max(0, homeLateTime - dt);
      lateTime = Math.max(0, lateTime - dt);
      if (charge) showPower(heldPower(charge.start));
      let [x, z] = readAim(inputPad);
      if (keeperGather > 0) {
        const [kx, kz] = keeperSeat ? seatAim(keeperSeat) : [x, z];
        const foot = keeperActor().sprite.position;
        if (Math.hypot(kx, kz) > 0.22) {
          aimOutlet(kx, kz);
          const length = Math.max(1, Math.hypot(kx, kz));
          if (slippery)
            moveOnSnow(
              keeperActor(),
              { x: (4 * kx) / length, z: (4 * kz) / length },
              dt,
            );
          else {
            foot.x += (4 * dt * kx) / length;
            foot.z += (4 * dt * kz) / length;
          }
        } else if (slippery) moveOnSnow(keeperActor(), { x: 0, z: 0 }, dt);
        clampKeeper();
        if (!keeperSeat || keeperSeat === owner(-1, active)) x = z = 0;
      }
      if (charge?.action === "shot") {
        gesture.sample(x, z, performance.now());
        if (held && (curveLab || gesture.engaged)) {
          x = z = 0;
          players[active].face = facing(
            Math.cos(gesture.aim),
            Math.sin(gesture.aim),
          );
        }
      }
      const p = players[active],
        pos = p.sprite.position;
      if (
        inFlight &&
        passKind === "through" &&
        Math.max(Math.abs(x), Math.abs(z)) <= 0.22
      ) {
        const stopDistance = (launchSpeed * passDuration) / 2;
        const ahead =
          (pos.x - passStart.x) * passHeading.x +
          (pos.z - passStart.z) * passHeading.z;
        const chase = T.MathUtils.clamp(
          Math.max(ahead + 0.65, ball.position.distanceTo(passStart)),
          0,
          stopDistance,
        );
        const dx = passStart.x + passHeading.x * chase - pos.x,
          dz = passStart.z + passHeading.z * chase - pos.z;
        if (Math.hypot(dx, dz) > 0.2) {
          x = dx;
          z = dz;
        }
      }
      p.moving =
        p.age < 0 &&
        p.reactionTime <= 0 &&
        Math.max(Math.abs(x), Math.abs(z)) > (p.moving ? 0.18 : 0.24);
      const driver = owner(-1, active);
      const couchSprint =
        driver &&
        ((driver.device < 0 && couchKeys.has("ShiftLeft")) ||
          seatPad(driver)?.buttons[7]?.pressed);
      const wantsSprint =
        p.moving &&
        (couchSprint ||
          keys.has("ShiftLeft") ||
          keys.has("ShiftRight") ||
          !!pad?.buttons[7]?.pressed);
      for (const mate of players) mate.sprintTime = 0;
      const burst = (p.sprintTime = wantsSprint ? spendSprint(p, dt) : 0);
      const strideTime = dt + burst * (sprintCadence - 1);
      const driven = p.moving;
      if (p.moving) {
        p.face = facing(x, z, p.face);
        const [dx, dz] = dirs[p.face];
        const distance =
          (4 * dt + 2 * burst) * trainingFactor(p.displayName, "Pace");
        if (slippery)
          moveOnSnow(
            p,
            { x: (dx * distance) / dt, z: (dz * distance) / dt },
            dt,
          );
        else {
          pos.x = T.MathUtils.clamp(pos.x + dx * distance, -runX, runX);
          pos.z = T.MathUtils.clamp(pos.z + dz * distance, runNorth, runSouth);
        }
        if (!slippery) p.travel += 4 * strideTime;
        if (!tutorial?.speaking) {
          tutorial?.record("move");
          if (held) tutorial?.record("dribble");
          if (burst > 0) tutorial?.record("sprint");
        }
      }
      if (
        slippery &&
        !driven &&
        p.age < 0 &&
        p.reactionTime <= 0 &&
        !(keeperGather > 0 && keeperActor() === p)
      )
        moveOnSnow(p, { x: 0, z: 0 }, dt);
      if (!celebrationLab && !freePractice) {
        organizeAttack(dt);
        organizeDefense();
        if (keeperGather > 0 && keeperActor() === sean)
          organizeKeeperOutlets(dt);
        else outletRefresh = 0;
      }
      for (const [i, partner] of players.entries()) {
        if (
          partner.penalty ||
          (i === active && !(keeperGather > 0 && keeperActor() === sean))
        )
          continue;
        const human = owner(-1, i);
        if (human && !(keeperGather > 0 && human === keeperSeat)) {
          driveSeat(human, dt);
          continue;
        }
        const other = partner.sprite.position;
        if (partner === bankReceiver) partner.goal.copy(other);
        else if (nearCover < 0 && i === reboundRunner && canSwitch()) {
          // Lead a moving rebound briefly, then close on the resting ball.
          partner.goal.set(
            T.MathUtils.clamp(
              ball.position.x + vx * (slippery ? 0.45 : 0.25),
              -runX,
              runX,
            ),
            0,
            T.MathUtils.clamp(
              ball.position.z + vz * (slippery ? 0.45 : 0.25),
              runNorth,
              runSouth,
            ),
          );
        }
        if (
          partner.reactionTime > 0 ||
          ((partner.shooting || partner.tackling) && partner.age >= 0)
        ) {
          partner.moving = false;
          partner.velocity.set(0, 0, 0);
          snowVelocities.delete(partner);
          continue;
        }
        const coaching =
          tutorial &&
          tutorialCoaching.target(
            tutorial.chapter,
            partner.displayName,
            i,
            ball.position,
            tutorial.speaking,
            false,
            tutorialTime,
            tutorialDefenders,
            keepAwayLooseBall(),
          );
        if (coaching && !(inFlight && i === ballPlayer) && i !== reboundRunner)
          partner.goal.set(
            T.MathUtils.clamp(coaching.x, -runX, runX),
            0,
            T.MathUtils.clamp(coaching.z, runNorth, runSouth),
          );
        if (slippery) {
          const pace =
            i === reboundRunner ||
            (nearCover >= 0 && (other.x - partner.goal.x) * attackSign > 2)
              ? 6
              : 4.6;
          const desired = approachVelocity(
            other,
            partner.goal,
            pace * trainingFactor(partner.displayName, "Pace"),
          );
          if (Math.hypot(desired.x, desired.z) > 0.1)
            partner.face = facing(desired.x, desired.z, partner.face);
          moveOnSnow(partner, desired, dt);
          continue;
        }
        const distance = other.distanceTo(partner.goal);
        partner.moving = distance > (partner.moving ? 0.08 : 0.28);
        partner.velocity.set(0, 0, 0);
        if (partner.moving) {
          partner.velocity
            .subVectors(partner.goal, other)
            .multiplyScalar(
              Math.min(
                (tutorial?.chapter === 5
                  ? 4
                  : i === reboundRunner ||
                      (nearCover >= 0 &&
                        (other.x - partner.goal.x) * attackSign > 2)
                    ? 6
                    : 4.6) * trainingFactor(partner.displayName, "Pace"),
                distance / dt,
              ) / distance,
            );
          other.addScaledVector(partner.velocity, dt);
          partner.travel += partner.velocity.length() * dt;
          partner.face = facing(
            partner.velocity.x,
            partner.velocity.z,
            partner.face,
          );
        } else if (i !== reboundRunner) {
          const watch = marks || keeperGather > 0 ? ball.position : pos;
          partner.face = facing(
            watch.x - other.x,
            watch.z - other.z,
            partner.face,
          );
        }
      }
      const rushing = !!rushSource && canRush();
      if (!rushing) {
        puntHold = null;
        puntPower = null;
      }
      if (rushing) {
        const foot = keeperActor().sprite.position;
        const dx = ball.position.x - foot.x,
          dz = ball.position.z - foot.z;
        const step = Math.min(
          1,
          (6.4 * dt) / Math.max(0.001, Math.hypot(dx, dz)),
        );
        if (slippery)
          moveOnSnow(
            keeperActor(),
            { x: (dx * step) / dt, z: (dz * step) / dt },
            dt,
          );
        else {
          foot.x += dx * step;
          foot.z += dz * step;
        }
        foot.y = 0;
        keeperActor().sprite.material.rotation = 0;
      }
      if (!celebrationLab && !shot && !keeperRestart && resultTime <= 0) {
        for (const goalie of keepers) {
          const cover = T.MathUtils.clamp(
            ball.position.z *
              (goalie === keeper ? difficulty().keeperTracking : 0.45),
            -1.55,
            1.55,
          );
          if (goalie === keeperActor().sprite && (rushing || keeperGather > 0))
            continue;
          const homeX =
            attackSign * (goalie === keeper ? keeperHomeX : -keeperHomeX);
          if (slippery) {
            const actor = goalie === homeKeeper ? sean : awayGK;
            moveOnSnow(
              actor,
              approachVelocity(goalie.position, { x: homeX, z: cover }, 3),
              dt,
            );
            goalie.position.y *= Math.exp(-7 * dt);
            continue;
          }
          goalie.position.x += T.MathUtils.clamp(
            homeX - goalie.position.x,
            -6 * dt,
            6 * dt,
          );
          goalie.position.y *= Math.exp(-7 * dt);
          const lateral =
            3 *
            dt *
            (goalie === homeKeeper
              ? trainingFactor(sean.displayName, "Keeping")
              : 1);
          goalie.position.z += T.MathUtils.clamp(
            cover - goalie.position.z,
            -lateral,
            lateral,
          );
        }
      }
      if (held) {
        lastBlue = false;
        carry();
        if (
          !kickSpot &&
          drillKeeper.visible &&
          p.age < 0 &&
          attackSign * ball.position.x >= fieldX - 1.35 &&
          Math.abs(ball.position.z) <= 2
        )
          claimDribble();
        else if (outsidePitch()) {
          const [dx, dz] = dirs[p.face];
          ballOut(dx * 4, 0, dz * 4);
        }
      }
      turnoverGrace = Math.max(0, turnoverGrace - dt);
      if (noticeTime > 0) {
        noticeTime -= dt;
        if (noticeTime <= 0) el("shotResult").textContent = "";
      }
      if (
        opponents.length &&
        !(crossingDrill && training.drill === aerialDrill) &&
        !outBall &&
        !shot &&
        resultTime <= 0
      )
        moveBlue(dt);
      else
        opponents.forEach((o) => {
          o.moving = false;
          o.sprintTime = 0;
        });
      for (const actor of pitchActors) {
        if (actor.age < 0) continue;
        const prev = actor.age;
        actor.age += dt;
        if (
          peachShotWindup &&
          actor === opponents[peachShotWindup.index] &&
          actor.age >= 0.21
        ) {
          const windup = peachShotWindup;
          peachShotWindup = null;
          if (blueCarrier === windup.index && actor.shooting && !actor.tackling)
            tryBlueShot(false, windup.human, true);
        }
        if (actor.tackling) {
          snowVelocities.delete(actor);
          if (
            (tutorial &&
              opponents.includes(actor) &&
              !tutorialAllowsChallenges(tutorial.chapter)) ||
            (tutorial?.chapter === 5 &&
              players.includes(actor) &&
              actor !== players[active])
          ) {
            actor.tackling = false;
            actor.age = -1;
            if (tutorialTackler === actor) tutorialTackler = null;
            continue;
          }
          const foot = actor.sprite.position,
            [dx, dz] = dirs[actor.face];
          const step =
            slideTravel(actor.age, physics) - slideTravel(prev, physics);
          foot.x = T.MathUtils.clamp(foot.x + dx * step, -runX, runX);
          foot.z = T.MathUtils.clamp(foot.z + dz * step, runNorth, runSouth);
          if (prev < 0.12 && actor.age >= 0.12) {
            const reaches = (point: T.Vector3, reach = 0.93) => {
              const x = point.x - foot.x,
                z = point.z - foot.z;
              return (
                x * dx + z * dz >= -0.15 &&
                Math.hypot(x - dx * 0.5, z - dz * 0.5) <= reach
              );
            };
            const blueIndex = opponents.indexOf(actor),
              isBlue = blueIndex >= 0;
            const playable = isBlue
              ? !outBall &&
                !shot &&
                !keeperRestart &&
                keeperGather <= 0 &&
                resultTime <= 0 &&
                (held || inFlight)
              : canTackle();
            const latePlayer = isBlue
              ? homeLateTime > 0 &&
                (!held || recentHomeKicker !== players[ballPlayer])
                ? recentHomeKicker
                : null
              : !held && lateTime > 0 && recentKicker !== blueCarrier
                ? opponents[recentKicker]
                : null;
            if (
              playable &&
              ball.position.y < 0.85 &&
              reaches(
                ball.position,
                0.93 *
                  trainingFactor(
                    actor.displayName,
                    "Tackling",
                    players.includes(actor) ? home.name : matchOpponent.name,
                  ),
              )
            ) {
              audio.play("tackle", 0.4);
              if (isBlue) {
                facts.tackles[1]++;
                blueWins(blueIndex, matchOpponent.name + " TACKLE WON");
              } else winBack(players.indexOf(actor), "TACKLE WON");
            } else if (
              latePlayer &&
              reaches(latePlayer.sprite.position) &&
              !reaches(ball.position)
            ) {
              if (!mysteryOn("noRules")) {
                awardFreeKick(actor, latePlayer);
                requestAnimationFrame(tick);
                return;
              }
            }
          }
          if (
            actor.age >=
            (actor.tackleMap ? 0.56 : 0.42) * physics.slideRecovery
          ) {
            actor.age = -1;
            actor.tackling = false;
            if (tutorialTackler === actor) tutorialTackler = null;
          }
          continue;
        }
        if (
          actor === players[ballPlayer] &&
          held &&
          prev < 0.12 &&
          actor.age >= 0.12
        ) {
          if (windupReceiver >= 0) {
            launchPass(windupReceiver);
            continue;
          }
          held = false;
          inFlight = false;
          ball.position.x =
            attackSign * Math.min(attackSign * ball.position.x, fieldX - 0.45);
          shotStart.copy(ball.position);
          launchShot(actor);
        }
        if (actor.age >= kickAnimationSeconds) actor.age = -1;
      }
      const canCollect = () =>
        !perfectPass &&
        rushing &&
        !!rushSource &&
        canRush() &&
        ball.position.y <= 1.35 &&
        Math.hypot(
          ball.position.x - keeperActor().sprite.position.x,
          ball.position.z - keeperActor().sprite.position.z,
        ) < 1.05;
      if (canCollect()) keeperTouch();
      if (keeperGather > 0) {
        const foot = keeperActor().sprite.position;
        ball.position.set(foot.x + keeperDirection() * 0.38, 0.82, foot.z);
      } else if (outBall) {
        if (
          (advanceStadiumBall ?? advanceOutBall)(ball.position, outVelocity, dt)
        )
          audio.play("board", 0.42);
        outBall.remaining -= dt;
        if (outBall.remaining <= 0) {
          if (celebrationLab) {
            resetLab();
            requestAnimationFrame(tick);
            return;
          }
          const { goalEnd: end, spot, blueRestart, corner } = outBall;
          outBall = null;
          if (curveLab) {
            nextCurveBall();
          } else if (freePractice) {
            ballPlayer = active;
            lastBlue = false;
            held = true;
            clearanceLoose = struckLoose = false;
            vx = vz = reboundVY = 0;
            carry();
          } else if (street) {
            const team = blueRestart ? opponents : players;
            const point = new T.Vector3(
              T.MathUtils.clamp(spot.x, -runX + 1, runX - 1),
              0,
              T.MathUtils.clamp(spot.z, runNorth + 1, runSouth - 1),
            );
            const taker = nearestEligible(team, point);
            team[taker].sprite.position.copy(point);
            ball.position.copy(point);
            ball.position.y = restingHeight;
            if (blueRestart) blueWins(taker, "COURT RESTART");
            else winBack(taker, "COURT RESTART");
          } else if (end && !corner) {
            lastBlue = end === attackSign;
            const side = Math.sign(ball.position.z) || 1;
            const start = new T.Vector3(
              end * (fieldX - 1.5),
              restingHeight,
              side * 1.5,
            );
            if (end === attackSign && opponents.length)
              startBlueBuild(start, true);
            else
              keeperRestart = {
                age: 0,
                start,
                end: new T.Vector3(-end * 4, restingHeight, side * 3),
              };
          } else {
            const x = corner
              ? end * (fieldX - 1)
              : T.MathUtils.clamp(spot.x, -fieldX + 1, fieldX - 1);
            const z = (Math.sign(spot.z) || 1) * (fieldZ - 1);
            const team = blueRestart ? opponents : players;
            const pos = new T.Vector3(x, 0, z);
            const taker = nearestEligible(team, pos);
            if (taker >= 0) {
              team[taker].sprite.position.copy(pos);
              team[taker].face = facing(-x, -z);
              ball.position.set(x, restingHeight, z);
              lastBlue = blueRestart;
              const restartLabel =
                (blueRestart ? matchOpponent.name : homeLabel) +
                (corner ? " CORNER" : " KICK-IN");
              if (blueRestart) blueWins(taker, restartLabel);
              else winBack(taker, restartLabel);
              el("shotResult").textContent = restartLabel;
              noticeTime = blueRestart ? 0.9 : 0.8;
            }
          }
        }
      } else if (keeperRestart?.blueBuild) {
        keeperRestart.age += dt;
        if (!keeperRestart.goalKick && keeperRestart.age < 0.8) {
          keeper.position.x -= attackSign * dt * 1.6;
          keeperRestart.start.x = keeper.position.x - attackSign * 0.45;
          ball.position.copy(keeperRestart.start);
        }
        const forwards = opponents.slice(0, 3).filter((o) => !o.penalty);
        const runners = forwards.filter(
          (o) => attackSign * o.sprite.position.x < -2,
        );
        if (
          keeperRestart.age >= 0.85 &&
          runners.length >= Math.min(2, forwards.length)
        )
          releaseBlueBuild(keeperRestart.start);
      } else if (keeperRestart) {
        const restart = keeperRestart;
        if (restart.age < 0.33 && restart.age + dt >= 0.33) {
          const taker = restart.start.x * attackSign > 0 ? awayGK : sean;
          taker.face = facing(
            restart.end.x - restart.start.x,
            restart.end.z - restart.start.z,
          );
          taker.age = 0;
          taker.shooting = true;
        }
        if (restart.age < 0.45 && restart.age + dt >= 0.45) audio.kick(0.75);
        restart.age += dt;
        if (restart.age < 0.45) {
          ball.position.copy(restart.start);
          ball.position.y =
            restingHeight +
            0.7 * (1 - T.MathUtils.smoothstep(restart.age, 0.25, 0.45));
        } else {
          const t = Math.min(1, (restart.age - 0.45) / 2.45);
          el("shotResult").textContent = restart.punt ? "" : "GOAL KICK";
          ball.position.lerpVectors(restart.start, restart.end, t);
          ball.position.y += 3.8 * 4 * t * (1 - t);
          if (claimAirball()) {
            /* Claimed in flight. */
          } else if (restart.punt && gatherPunt()) {
            /* Blue has gathered the clearance. */
          } else if (
            t === 1 &&
            crossingDrill &&
            training.drill === aerialDrill
          ) {
            vx = (restart.end.x - restart.start.x) / 2.45;
            vz = (restart.end.z - restart.start.z) / 2.45;
            reboundVY = 2.4;
            keeperRestart = null;
            finishRep(0, "Ball landed · meet it sooner");
          } else if (t === 1) {
            vx = (restart.end.x - restart.start.x) * 0.24;
            vz = (restart.end.z - restart.start.z) * 0.24;
            reboundVY = 2.4;
            clearanceLoose = true;
            keeperRestart = null;
            noticeTime = 0.6;
          }
        }
      } else if (inFlight) {
        passTime = Math.min(passDuration, passTime + groundStep(dt, passTime));
        const fraction = passTime / passDuration;
        previousPassPosition.copy(ball.position);
        if (perfectPass) {
          ball.position.lerpVectors(
            passStart,
            players[ballPlayer].sprite.position,
            fraction,
          );
          ball.position.y = restingHeight;
        } else if (passKind === "through") {
          const distance =
            (launchSpeed - 0.5 * turfDeceleration * passTime) * passTime;
          ball.position.copy(passStart).addScaledVector(passHeading, distance);
          ball.position.y = restingHeight;
        } else {
          // Only the final yard can bend toward a moving receiver.
          assistOffset
            .copy(players[ballPlayer].sprite.position)
            .sub(receiverLaunch);
          assistOffset.y = 0;
          assistOffset.clampLength(
            0,
            airBalls && passKind === "cross" ? 1.5 : 1,
          );
          ball.position
            .lerpVectors(passStart, passTarget, fraction)
            .addScaledVector(assistOffset, fraction * fraction);
          ball.position.y =
            (passKind === "cross"
              ? T.MathUtils.lerp(passStart.y, restingHeight, fraction)
              : restingHeight) +
            (passKind === "cross"
              ? 4 * crossLift * fraction * (1 - fraction)
              : heightAt(arc, passTime));
        }
        const interceptor = perfectPass
          ? -1
          : interceptPass(
              previousPassPosition,
              ball.position,
              opponents,
              tutorialReturnKicker,
            );
        const wantsFinish =
          passKind === "cross" &&
          (charge?.action === "shot" || queued?.action === "shot");
        const collector = perfectPass
          ? fraction === 1
            ? ballPlayer
            : -1
          : interceptPass(
              previousPassPosition,
              ball.position,
              players,
              lastSender,
              wantsFinish
                ? 1.15 * (airBalls ? airBallsProfile.contact : 1)
                : 0.78,
              wantsFinish ? 2 * (airBalls ? airBallsProfile.contact : 1) : 0.84,
            );
        let passContact: "bounce" | "out" | "live" = "live";
        if (enclosed) {
          outVelocity
            .subVectors(ball.position, previousPassPosition)
            .divideScalar(Math.max(0.000001, dt));
          passContact = millContact(
            previousPassPosition,
            ball.position,
            outVelocity,
            street ? rules.goal : undefined,
          );
        }
        if (passContact === "bounce") {
          inFlight = perfectPass = false;
          rollingPass = clearanceLoose = struckLoose = true;
          curveRate = 0;
          vx = outVelocity.x;
          vz = outVelocity.z;
          reboundVY = outVelocity.y;
          audio.play("board", 0.42);
        } else if (passContact === "out" || outsidePitch()) {
          const step = Math.max(0.000001, dt);
          ballOut(
            (ball.position.x - previousPassPosition.x) / step,
            (ball.position.y - previousPassPosition.y) / step,
            (ball.position.z - previousPassPosition.z) / step,
          );
        } else if (!perfectPass && claimAirball()) {
          /* Claimed in flight. */
        } else if (interceptor >= 0) blueWins(interceptor, "INTERCEPTED");
        else if (collector >= 0) {
          lastBlue = false;
          const completedPerfectPass =
            perfectPass && performance.now() - passCallAt <= 1500;
          receivePass(collector, wantsFinish);
          if (!inFlight && windupReceiver < 0) perfectPass = false;
          if (completedPerfectPass) {
            feedbackActor = players[collector];
            feedbackTime = 1.05;
            callout.textContent = "PERFECT PASS!";
            callout.dataset.grade = "PERFECT PASS";
            callout.hidden = false;
          }
        } else if (fraction === 1) {
          perfectPass = false;
          if (crossingDrill && training.drill !== 4)
            finishRep(0, "Missed receiver");
          if (airBalls && passKind === "cross") airBounceAt = performance.now();
          inFlight = false;
          rollingPass = true;
          clearanceLoose = true;
          reboundVY = 0;
          // Unmet assisted passes roll on. A through ball has already spent its momentum.
          vx =
            passKind === "through"
              ? 0
              : ((passTarget.x - passStart.x) / passDuration) *
                0.65 *
                surfaceMomentum;
          vz =
            passKind === "through"
              ? 0
              : ((passTarget.z - passStart.z) / passDuration) *
                0.65 *
                surfaceMomentum;
        }
      } else if (shot) {
        previousPassPosition.copy(ball.position);
        shotTime += groundStep(dt, shotTime);
        const t = Math.min(1, shotTime / shot.duration);
        ball.position.x = T.MathUtils.lerp(shotStart.x, shot.targetX, t);
        ball.position.z =
          T.MathUtils.lerp(shotStart.z, shot.targetZ, t) -
          (flightCurve ? bendOffset * t * (1 - t) : 0);
        ball.position.y =
          restingHeight +
          heightAt(arc, shotTime) +
          (shotStart.y - restingHeight) * (1 - t);
        if (shot.result === "Over") {
          const clearanceHeight = 2.65 + 0.6 * (shotMultiplier - 1);
          ball.position.y =
            shotStart.y +
            (clearanceHeight - shotStart.y) * t +
            2.2 * t * (1 - t);
        }
        if (shot.result === "Crossbar")
          ball.position.y = Math.max(
            ball.position.y,
            restingHeight + (rules.goal.height - restingHeight) * t,
          );
        if (!street && !(rushing && shotDirection === -keeperDirection())) {
          const goalie = shotDirection === attackSign ? keeper : homeKeeper;
          const dive = T.MathUtils.smoothstep(t, 0.25, 1);
          const reach = flightCurve
            ? shot.targetZ - bendOffset * (1 - t) ** 2
            : shot.result === "Goal"
              ? shot.targetZ - Math.sign(shot.targetZ - keeperStart || 1) * 1.2
              : shot.targetZ;
          if (shot.result === "Save")
            goalie.position.x = T.MathUtils.lerp(
              keeperStartX,
              shot.targetX,
              dive,
            );
          goalie.position.z = T.MathUtils.lerp(
            keeperStart,
            T.MathUtils.clamp(reach, -2, 2),
            dive,
          );
          goalie.position.y =
            shot.result === "Save"
              ? dive * Math.min(0.85, ball.position.y * 0.65)
              : 0;
        }
        let curveContact = false;
        if (flightCurve) {
          const goalie = shotDirection === attackSign ? keeper : homeKeeper;
          const dx = ball.position.x - previousPassPosition.x;
          const atKeeper = dx
            ? (goalie.position.x - previousPassPosition.x) / dx
            : -1;
          if (goalie.visible && atKeeper >= 0 && atKeeper <= 1) {
            const z = T.MathUtils.lerp(
              previousPassPosition.z,
              ball.position.z,
              atKeeper,
            );
            const y = T.MathUtils.lerp(
              previousPassPosition.y,
              ball.position.y,
              atKeeper,
            );
            if (
              Math.hypot((z - goalie.position.z) / 0.82, (y - 0.7) / 1.12) <= 1
            ) {
              ball.position.set(goalie.position.x, y, z);
              shot.result = "Save";
              curveContact = true;
            }
          }
          if (
            !enclosed &&
            !curveContact &&
            Math.abs(ball.position.z) > fieldZ
          ) {
            shot.result = "Wide";
            curveContact = true;
          }
          if (
            !curveContact &&
            t === 1 &&
            Math.abs(ball.position.z) < rules.goal.halfWidth + 0.08 &&
            ball.position.y >= rules.goal.height - 0.08
          ) {
            shot.result =
              ball.position.y > rules.goal.height + 0.08 ? "Over" : "Crossbar";
          }
        }
        if (
          street &&
          t === 1 &&
          shot.result === "Goal" &&
          (Math.abs(ball.position.z) >= rules.goal.halfWidth - 0.08 ||
            ball.position.y >= rules.goal.height - 0.08)
        )
          shot.result =
            ball.position.y >= rules.goal.height - 0.08 ? "Over" : "Wide";
        let shotBoard: "live" | "out" | "bounce" = "live";
        if (
          enclosed &&
          (street || shot.result === "Wide" || (flightCurve && !curveContact))
        ) {
          outVelocity
            .subVectors(ball.position, previousPassPosition)
            .divideScalar(Math.max(0.000001, dt));
          shotBoard = millContact(
            previousPassPosition,
            ball.position,
            outVelocity,
            street ? rules.goal : undefined,
          );
          if (shotBoard !== "live") {
            shot.result = "Wide";
            curveContact = true;
          }
        }
        const blocker =
          shotDirection !== attackSign
            ? interceptPass(previousPassPosition, ball.position, players)
            : blastFlying
              ? blastBlocker(previousPassPosition, ball.position)
              : flightCurve || street
                ? interceptPass(previousPassPosition, ball.position)
                : -1;
        if (canCollect()) keeperTouch();
        else if (blocker >= 0) {
          shot = null;
          careerShots[shotDirection === attackSign ? 0 : 1]++;
          if (shotDirection === attackSign) {
            blastFlying = false;
            blueWins(blocker, "BLOCKED");
          } else winBack(blocker, "BLOCKED");
        } else if (t === 1 || curveContact) {
          if (
            airOnly &&
            !crossingDrill &&
            shot.result === "Goal" &&
            !airGoalEligible(shot.airFinish ?? "GROUNDED")
          ) {
            invalidAirGoals++;
            const end = shotDirection,
              side = Math.sign(ball.position.z) || 1;
            shot = null;
            goalEvent = null;
            blastFlying = false;
            held = inFlight = false;
            blueCarrier = -1;
            vx = vz = reboundVY = 0;
            resultTime = 0;
            cancelCharge();
            lastDelivery = null;
            const start = new T.Vector3(
              end * (fieldX - 1.5),
              restingHeight,
              side * 1.5,
            );
            if (end === attackSign) startBlueBuild(start, true);
            else
              keeperRestart = {
                age: 0,
                start,
                end: new T.Vector3(-end * 4, restingHeight, side * 3),
              };
            el("shotResult").textContent = "NO GOAL! · AERIAL FINISHES ONLY!";
            noticeTime = 2;
            goalBanner.textContent = "NO GOAL! · KEEP IT UP!";
            goalBanner.hidden = false;
            airInvalidUntil = now + 1800;
            requestAnimationFrame(tick);
            return;
          }
          if (shot.result !== "Goal") audio.nearGoal();
          if (crossingDrill) {
            const distance = Math.hypot(fieldX - shotStart.x, shotStart.z),
              angle = Math.atan2(
                Math.abs(shotStart.z),
                Math.max(0.1, fieldX - shotStart.x),
              );
            const valid =
              training.drill === 1 ||
              ((training.drill === 2 || training.drill === aerialDrill) &&
                firstTimeCross);
            finishRep(
              valid
                ? shotPoints(
                    shot.result,
                    distance,
                    angle,
                    shotMultiplier - 1,
                    firstTimeCross,
                  )
                : 0,
              shot.result,
            );
            shot = null;
          } else {
            const shootingSide = shotDirection === attackSign ? 0 : 1;
            if (!blastFlying)
              changeBurn(shot.result === "Save" ? 10 : 0, shootingSide);
            if (shot.result === "Goal") {
              const wasOnFire = meters[shootingSide].value === 100;
              for (const [i, m] of meters.entries())
                if (m.value === 100) resetBurn(i);
              if (!wasOnFire) changeBurn(20, shootingSide);
            }
            {
              const side = shotDirection === attackSign ? 0 : 1;
              careerShots[side]++;
              if (longRange && shot.points === 2) longAttempts[side]++;
              if (
                side === 0 &&
                (shot.result === "Goal" || shot.result === "Save")
              )
                tutorial?.record("onTarget");
              if (side === 0 && shot.result === "Save")
                tutorial?.record("saved");
              if (shot.result === "Goal" || shot.result === "Save")
                onTarget[side]++;
              if (shot.result === "Post" || shot.result === "Crossbar")
                woodwork[side]++;
              if (shot.result !== "Goal") lastDelivery = null;
              if (shot.result === "Goal") {
                replay.record(1 / 30, 0);
                goalEvent = {
                  start: replay.time - 6,
                  direction: shotDirection,
                  label:
                    matchMinute() +
                    "′ · " +
                    (scorer?.displayName ?? "Team") +
                    ((longRange || mystery || house) && shot.points === 2
                      ? " · +2 GOAL"
                      : " · Goal"),
                };
              }
            }
            if (shotDirection === attackSign) recordAttempt(shot.result);
            el("shotResult").textContent =
              shotDirection !== attackSign && shot.result === "Goal"
                ? matchOpponent.name + " GOAL"
                : shot.result.toUpperCase();
            if (
              enclosed &&
              shot.result === "Wide" &&
              shotBoard !== "out" &&
              (shotBoard === "bounce" ||
                ball.position.y <= courtBoards.top + courtBoards.radius)
            ) {
              if (shotBoard === "bounce") audio.play("board", 0.42);
              else
                outVelocity
                  .subVectors(ball.position, previousPassPosition)
                  .divideScalar(Math.max(0.000001, dt));
              vx = outVelocity.x;
              vz = outVelocity.z;
              reboundVY = outVelocity.y;
              clearanceLoose = struckLoose = true;
              rollingPass = false;
              curveRate = 0;
            } else if (shot.result === "Wide" || shot.result === "Over") {
              ballOut(
                (shot.targetX - shotStart.x) / shot.duration,
                (ball.position.y - previousPassPosition.y) /
                  Math.max(dt, 0.000001),
                (shot.targetZ - shotStart.z) / shot.duration,
                shot.result,
              );
            } else if (shot.result === "Goal") {
              cancelCharge();
              if (
                ticket &&
                shotDirection === attackSign &&
                lastDelivery &&
                lastDelivery.receiver === scorer?.displayName &&
                lastDelivery.sender === ticket.career.player
              )
                facts.assists++;
              const goalRecord = {
                assist:
                  (street || shotDirection === attackSign) &&
                  lastDelivery &&
                  lastDelivery.receiver === scorer?.displayName
                    ? lastDelivery.sender
                    : undefined,
                minute: matchMinute(),
                club:
                  shotDirection === attackSign
                    ? 0
                    : ticket
                      ? opponent(ticket.career)
                      : 1,
                player: scorer?.displayName ?? "Team goal",
              };
              careerGoals.push(goalRecord);
              const points =
                longRange || mystery || house ? (shot.points ?? 1) : 1;
              goalValues.set(goalRecord, points);
              const beatScored =
                beatTheClock &&
                (shotDirection === attackSign ? -1 : 1) === beatTeam;
              if (longRange && points === 2)
                twoPointGoals[shotDirection === attackSign ? 0 : 1]++;
              queueSurvivalElimination(shotDirection === attackSign ? 0 : 1);
              if (beatTheClock) {
                beatRemaining = adjustBeatClock(
                  beatRemaining,
                  shotDirection === attackSign ? -1 : 1,
                  beatTeam!,
                );
                beatPendingEnd = beatRemaining === 0;
              }
              if (shotDirection === attackSign) {
                homeScore += points;
                tutorial?.record("goal");
              } else awayScore += points;
              if (tutorial && tutorial.chapter < 11) {
                // Lessons keep their cast and camera. Use the ordinary boundary/keeper
                // restart instead of the celebration -> replay -> full-team kickoff path.
                goalEvent = null;
                updateScore();
                ballOut(
                  ((shot.targetX - shotStart.x) / shot.duration) * 0.15,
                  0,
                  ((shot.targetZ - shotStart.z) / shot.duration) * 0.15,
                );
                el("shotResult").textContent = "GOAL";
              } else {
                audio.goalFire();
                scoringColor = goalColors[shotDirection === attackSign ? 0 : 1];
                fireEnd = shotDirection;
                showGoalFire(0);
                updateScore();
                endFollowUpRuns();
                celebrating = true;
                replay.goal = replay.time;
                goalBanner.textContent =
                  firstToFive && targetReached(rules, homeScore, awayScore)
                    ? "MATCH WINNER!"
                    : firstToFive &&
                        homeScore === rules.targetScore - 1 &&
                        awayScore === rules.targetScore - 1
                      ? "NEXT GOAL WINS!"
                      : firstToFive &&
                          Math.max(homeScore, awayScore) ===
                            rules.targetScore - 1
                        ? "MATCH POINT!"
                        : (longRange || mystery || house) && points === 2
                          ? "DOUBLE POINTS!"
                          : flightCurve && flightCurve.style !== "Curler"
                            ? "BURNING CURVE!"
                            : "GOAL!";
                if (airBalls)
                  goalBanner.textContent =
                    shot.airFinish && shot.airFinish !== "GROUNDED"
                      ? shot.airFinish + "!"
                      : "GOAL!";
                goalBanner.classList.toggle("beat-clock-goal", beatTheClock);
                if (beatTheClock) {
                  goalBanner.innerHTML = `<span class="beat-goal-title">GOAL!</span><span class="beat-time-change ${beatScored ? "positive" : "negative"}">${beatScored ? "+30 seconds!" : "-15 seconds!"}</span>`;
                  audio.play(beatScored ? "burnReady" : "keeperSave", 0.65);
                }
                goalBanner.hidden = false;
                replayPanel.hidden = true;
                el("shotResult").textContent = "";
                netTravel = true;
                vx = (shot.targetX - shotStart.x) / shot.duration;
                vz = (shot.targetZ - shotStart.z) / shot.duration;
                showGoalCard();
                startGoalScene();
              }
            } else {
              if (shot.result === "Save") audio.kick(0.13);
              else audio.play(shot.result === "Post" ? "post" : "bar", 0.48);
              vx =
                -shotDirection *
                (shot.result === "Save" ? 7 : 5) *
                shotMultiplier;
              lastBlue =
                shot.result === "Save"
                  ? shotDirection === attackSign
                  : shotDirection !== attackSign;
              clearanceLoose = shotDirection !== attackSign;
              vz =
                (shot.targetZ >= 0 ? 1 : -1) *
                (shot.result === "Post" ? -2 : 2.5);
              reboundVY = shot.result === "Crossbar" ? -2 : 2;
              lastSender = -1;
            }
            if (
              airBalls &&
              shot &&
              ["Save", "Post", "Crossbar"].includes(shot.result)
            )
              airLooseAttempt = {
                finish: shot.airFinish ?? "GROUNDED",
                scorer: scorer ?? null,
                direction: shotDirection,
              };
            shot = null;
          }
        }
      } else if (resultTime > 0) {
        resultTime -= dt;
      } else if (bluePass) {
        previousPassPosition.copy(ball.position);
        bluePass.age += groundStep(dt, bluePass.age) * physics.ballSpeed;
        const t = Math.min(1, bluePass.age / bluePass.duration);
        ball.position.lerpVectors(bluePass.start, bluePass.end, t);
        ball.position.y += 4 * (bluePass.loft ?? 0) * t * (1 - t);
        const cut = interceptPass(previousPassPosition, ball.position, players);
        outVelocity
          .subVectors(ball.position, previousPassPosition)
          .divideScalar(Math.max(dt, 0.000001));
        const blueContact = street
          ? millContact(
              previousPassPosition,
              ball.position,
              outVelocity,
              rules.goal,
            )
          : "live";
        if (blueContact === "bounce") {
          bluePass = null;
          vx = outVelocity.x;
          vz = outVelocity.z;
          reboundVY = outVelocity.y;
          clearanceLoose = struckLoose = true;
          audio.play("board", 0.42);
        } else if (street && (blueContact === "out" || outsidePitch()))
          ballOut(outVelocity.x, outVelocity.y, outVelocity.z);
        else if (bluePass.loft && claimAirball()) {
          /* Claimed in flight. */
        } else if (cut >= 0) winBack(cut, "INTERCEPTED");
        else if (
          slippery &&
          t === 1 &&
          opponents[bluePass.receiver].sprite.position.distanceTo(
            ball.position,
          ) > 1.4
        ) {
          vx =
            ((bluePass.end.x - bluePass.start.x) / bluePass.duration) *
            physics.ballSpeed *
            0.65;
          vz =
            ((bluePass.end.z - bluePass.start.z) / bluePass.duration) *
            physics.ballSpeed *
            0.65;
          bluePass = null;
          rollingPass = clearanceLoose = true;
          lastBlue = true;
          reboundVY = 0;
        } else if (t === 1) {
          if (street)
            lastDelivery = {
              sender: bluePass.sender,
              receiver: opponents[bluePass.receiver].displayName,
            };
          passBurn(
            1,
            bluePass.sender,
            opponents[bluePass.receiver].displayName,
            bluePass.loft ? 8 : 5,
          );
          facts.passes[1]++;
          const aerialDelivery = airBalls && !!bluePass.loft;
          blueCarrier = bluePass.receiver;
          bluePass = null;
          blueDecisionTime = difficulty().reactionDelayMs / 1000;
          if (aerialDelivery) {
            const actor = opponents[blueCarrier];
            airIntents.set(actor, {
              finish: "HALF-VOLLEY",
              until: performance.now() + airBallsProfile.halfVolleyMs,
            });
            const buffer = [...airSeatShots.entries()].find(
              ([, b]) => b.side === 1 && performance.now() <= b.expires,
            );
            if (buffer || !seats?.some((s) => s.side === 1)) {
              airIntents.set(actor, {
                finish: "HALF-VOLLEY",
                until: performance.now() + 1500,
              });
              if (buffer) {
                airShotPower.set(
                  actor,
                  buffer[1].expires === Infinity
                    ? heldPower(buffer[1].start)
                    : buffer[1].power,
                );
                const strike = buffer[1].gesture.finish(
                  meters[1].value === 100,
                );
                pendingCurve = strike ? { actor, strike } : null;
                airSeatShots.delete(buffer[0]);
              }
              tryBlueShot(false, true);
            }
          }
        }
      } else if (blueCarrier >= 0) {
        lastBlue = true;
        const o = opponents[blueCarrier],
          foot = o.sprite.position;
        const [dx, dz] = dirs[o.face];
        ball.position.set(
          foot.x + dx * 0.48,
          restingHeight,
          foot.z + dz * 0.38,
        );
        if (street && outsidePitch()) {
          ballOut(dx * 4, 0, dz * 4);
        } else if (
          tutorial?.chapter !== 5 &&
          turnoverGrace <= 0 &&
          o.sprintTime > 0 &&
          p.age < 0 &&
          p.reactionTime <= 0 &&
          Math.hypot(pos.x - foot.x, pos.z - foot.z) < 0.82
        ) {
          winBack(active, "SPRINT STRIP");
        } else {
          const tackler =
            tutorial?.chapter !== 5 && o.sprintTime > 0 && turnoverGrace <= 0
              ? players.findIndex(
                  (mate, i) =>
                    !mate.penalty &&
                    i !== active &&
                    mate.age < 0 &&
                    mate.reactionTime <= 0 &&
                    mate.sprite.position.distanceTo(foot) < 0.82,
                )
              : -1;
          if (tackler >= 0) winBack(tackler, "SPRINT STRIP");
          else decideBlueAttack(dt);
        }
      } else if (!held) {
        previousPassPosition.copy(ball.position);
        if (reboundVY !== 0 || ball.position.y > restingHeight) {
          reboundVY -=
            17 * (house?.gravity ?? (mysteryOn("moonBall") ? 0.4 : 1)) * dt;
          ball.position.y += reboundVY * dt;
          if (ball.position.y <= restingHeight) {
            ball.position.y = restingHeight;
            if (reboundVY < -1.5)
              audio.play("bounce", Math.min(0.38, -reboundVY * 0.045));
            reboundVY = reboundVY < -1.5 ? -reboundVY * 0.35 : 0;
          }
        }
        if (slippery) {
          const speed = Math.hypot(vx, vz);
          if (speed > 45) {
            vx *= 45 / speed;
            vz *= 45 / speed;
          }
        }
        const onWetGround =
          matchSurface && ball.position.y <= restingHeight + 0.025;
        const friction =
          (house || slippery || mysteryOn("heavyBall")) &&
          ball.position.y <= restingHeight + 0.025
            ? physics.rollingResistance
            : onWetGround
              ? matchSurface.friction()
              : 1;
        const groundScale = onWetGround ? matchSurface.groundSpeed() : 1;
        if (onWetGround) {
          const retention = matchSurface.retention(ball.position, dt);
          vx *= retention;
          vz *= retention;
        }
        if (struckLoose) {
          if (curveRate) {
            const angle = curveRate * dt,
              c = Math.cos(angle),
              s = Math.sin(angle);
            const nextX = vx * c - vz * s;
            vz = vx * s + vz * c;
            vx = nextX;
            curveRate *= Math.exp(-1.25 * dt);
          }
          const speed = Math.hypot(vx, vz);
          if (speed > 0) {
            const deceleration = 6 * friction;
            const travelTime = Math.min(dt, speed / deceleration),
              factor =
                travelTime * (1 - (0.5 * deceleration * travelTime) / speed);
            ball.position.x += vx * factor * groundScale;
            ball.position.z += vz * factor * groundScale;
            const remaining = Math.max(
              0,
              1 - (deceleration * travelTime) / speed,
            );
            vx *= remaining;
            vz *= remaining;
          }
        } else {
          ball.position.x += vx * dt * groundScale;
          ball.position.z += vz * dt * groundScale;
          const drag = Math.exp(-1.25 * friction * dt);
          vx *= drag;
          vz *= drag;
        }
        if (curveLab && labBend && struckLoose) {
          const bend = labBend;
          const progress = Math.max(
            0,
            Math.min(
              1,
              ((ball.position.x - bend.x) * bend.dx +
                (ball.position.z - bend.z) * bend.dz) /
                bend.distance,
            ),
          );
          // The bow peaks halfway out and returns to the original aiming line.
          const offset =
            progress === 1 ? 0 : bend.amplitude * Math.sin(Math.PI * progress);
          const change = offset - bend.offset;
          ball.position.x -= bend.dz * change;
          ball.position.z += bend.dx * change;
          bend.offset = offset;
          if (progress === 1) labBend = null;
        }
        let boardExit = false;
        if (enclosed) {
          outVelocity.set(vx, reboundVY, vz);
          const contact = millContact(
            previousPassPosition,
            ball.position,
            outVelocity,
            street ? rules.goal : undefined,
          );
          if (contact === "bounce") {
            vx = outVelocity.x;
            vz = outVelocity.z;
            audio.play("board", 0.42);
          }
          boardExit = contact === "out";
        }
        if (clearanceLoose && claimAirball()) {
          /* Claimed in flight. */
        } else if (clearanceLoose && attackSign * vx > 0 && gatherPunt()) {
          /* Keeper takes possession before the line. */
        } else if (boardExit || outsidePitch()) ballOut(vx, reboundVY, vz);
        else if (ball.position.y <= restingHeight + 0.28) {
          let collector = -1,
            closest = 0.8;
          for (const [i, mate] of players.entries()) {
            if (
              mate.penalty ||
              (tutorial?.chapter === 5 &&
                !isTutorialParticipant(5, mate.displayName, false)) ||
              mate.age >= 0 ||
              (celebrationLab && i !== labIndex)
            )
              continue;
            const foot = mate.sprite.position;
            const distance = Math.hypot(
              ball.position.x - foot.x,
              ball.position.z - foot.z,
            );
            if (distance < closest) {
              closest = distance;
              collector = i;
            }
          }
          let blueCollector = -1;
          if (clearanceLoose || keepAwayLooseBall()) {
            opponents.forEach((o, i) => {
              const distance = Math.hypot(
                ball.position.x - o.sprite.position.x,
                ball.position.z - o.sprite.position.z,
              );
              if (
                !o.penalty &&
                o.age < 0 &&
                distance < closest &&
                (tutorial?.chapter !== 5 ||
                  isTutorialParticipant(5, o.displayName, true))
              ) {
                blueCollector = i;
                closest = distance;
              }
            });
          }
          if (blueCollector >= 0) {
            clearanceLoose = false;
            vx = vz = reboundVY = 0;
            if (lastBlue && bankReceiver === opponents[blueCollector]) {
              passBurn(
                1,
                opponents[recentKicker].displayName,
                bankReceiver.displayName,
                5,
              );
              facts.passes[1]++;
              blueCarrier = blueCollector;
              bankReceiver = null;
              blueDecisionTime = difficulty().reactionDelayMs / 1000;
            } else blueWins(blueCollector, matchOpponent.name + " BALL");
          } else if (collector >= 0) {
            lastBlue = false;
            clearanceLoose = false;
            endFollowUpRuns();
            vx = vz = reboundVY = 0;
            players[collector].moving = false;
            el("shotResult").textContent = "";
            if (
              charge?.action === "shot" ||
              queued?.action === "shot" ||
              (rollingPass && collector !== lastSender) ||
              (tutorial &&
                !isTutorialParticipant(
                  tutorial.chapter,
                  players[collector].displayName,
                  false,
                ))
            )
              receivePass(collector, false);
            else {
              cancelCharge();
              active = ballPlayer = collector;
              held = true;
              carry();
            }
            if (!inFlight) lastSender = -1;
          }
        }
      }
      if (canCollect()) keeperTouch();
      if (ticket && !outBall && !keeperRestart && !celebrating) {
        for (const actor of pitchActors) {
          if (actor === referee || actor.penalty || !actor.sprite.visible)
            continue;
          const pos = actor.sprite.position,
            distance = Math.hypot(pos.x - actor.world.x, pos.z - actor.world.z);
          // Exclude restart placements. Pitch units approximate metres.
          if (distance <= 10 * dt + 0.01)
            facts.metres[homeSlots.includes(actor) ? 0 : 1] += distance;
        }
      }
      for (const actor of celebrationLab ? homeSlots : outfield) {
        const running = actor.moving && actor.age < 0;
        if (actor.sprintTime === 0) {
          actor.staminaCapacity = Math.min(
            100,
            actor.staminaCapacity + dt * rules.capacityRecovery,
          );
          actor.sprintCharge = Math.min(
            actor.staminaCapacity,
            actor.sprintCharge + (dt * actor.staminaCapacity) / rechargeSeconds,
          );
        }
        actor.runClock = running
          ? actor.runClock + dt + actor.sprintTime * (sprintCadence - 1)
          : 0;
      }
      if (
        aerial &&
        (aerial.age += dt) >
          (["Pam", "José"].includes(players[aerial.index]?.displayName)
            ? headerAnimationSeconds
            : 0.42)
      )
        aerial = null;
      updateReferee(dt);
      if (feedbackActor && (feedbackTime -= dt) <= 0) {
        feedbackActor = null;
        callout.hidden = true;
      }
      if (
        passCallIndex >= 0 &&
        (paused ||
          phase !== "play" ||
          !held ||
          performance.now() - passCallAt > 1500)
      )
        clearPassCall();
      const controlled = keeperGather > 0 ? keeperActor() : players[active];
      if (nameText.textContent !== controlled.displayName)
        nameText.textContent = controlled.displayName;
      capacity.style.transform =
        "scaleX(" + controlled.staminaCapacity / 100 + ")";
      capacity.setAttribute(
        "aria-valuenow",
        String(Math.round(controlled.staminaCapacity)),
      );
      energy.style.transform = "scaleX(" + controlled.sprintCharge / 100 + ")";
      energy.setAttribute(
        "aria-valuenow",
        String(Math.round(controlled.sprintCharge)),
      );
      ring.position.copy(controlled.sprite.position);
      ring.position.y = 0.045;
      homeGoal.update(dt);
      attackingGoal.update(dt);
      updateSpin();
      camTarget.lerp(ball.position, 1 - Math.exp(-9 * dt));
    }
    const carryingKeeper =
      keeperGather > 0
        ? keeperActor()
        : keeperRestart?.blueBuild && !keeperRestart.goalKick
          ? awayGK
          : null;
    ball.visible = shadow.visible = !carryingKeeper?.sprite.visible;
    if (!paused && !celebrating && !celebrationLab) {
      for (const goalie of street ? [] : [sean, awayGK]) {
        const homeSide = goalie === sean;
        const outward = homeSide ? attackSign : -attackSign;
        const pos = goalie.sprite.position;
        const dx = pos.x - (homeSide ? keeperX : awayKeeperX);
        const dz = pos.z - (homeSide ? keeperZ : awayKeeperZ);
        goalie.moving =
          phase === "play" && pos.y < 0.05 && Math.hypot(dx, dz) > 0.15 * dt;
        if (goalie.age < 0 || goalie === carryingKeeper) {
          if (goalie.moving) goalie.face = facing(outward * Math.abs(dx), dz);
          else if (goalie !== carryingKeeper) {
            goalie.face = facing(
              outward * Math.max(0.01, Math.abs(ball.position.x - pos.x)),
              ball.position.z - pos.z,
            );
          } else if (dirs[goalie.face][0] * outward < 0)
            goalie.face = facing(outward, 0);
        }
        const backwards = dx * outward < -0.01 * dt;
        goalie.runClock = goalie.moving
          ? T.MathUtils.euclideanModulo(
              goalie.runClock + (backwards ? -dt : dt),
              goalie.frameSeconds * goalie.runFrames,
            )
          : 0;
      }
    }
    const kickLabel =
      keeperGather > 0
        ? "PUNT"
        : canTackle() && !(rushSource && canRush())
          ? "TACKLE"
          : held && ownBox(players[active].sprite.position)
            ? "CLEAR"
            : "KICK";
    if (el("kick").textContent !== kickLabel)
      el("kick").textContent = kickLabel;
    updateLandingRing();
    targetRing.visible =
      crossingDrill &&
      (training.drill === 0 ||
        training.drill === 2 ||
        (training.drill === aerialDrill && !!keeperRestart)) &&
      training.count < 5;
    if (targetRing.visible && training.drill !== aerialDrill) {
      targetRing.position.copy(players[practiceTarget].sprite.position);
      targetRing.position.y = 0.04;
    }
    if (keeperGather > 0 && outlet >= 0) {
      targetRing.visible = true;
      targetRing.position.copy(keeperTeam()[outlet].sprite.position);
      targetRing.position.y = 0.04;
    }
    switchButton.disabled = !canSwitch();
    for (const { mesh, sprite } of contactShadows) {
      mesh.visible = sprite.visible;
      mesh.position.set(
        sprite.position.x + 0.18,
        0.024,
        sprite.position.z + 0.12,
      );
      mesh.scale.setScalar(0.7);
    }
    shadow.scale.setScalar(1.15 - 0.16 * (ball.position.y - restingHeight));
    shadow.position.set(ball.position.x, 0.03, ball.position.z);
    if (broadcast) {
      const carrier =
        blueCarrier >= 0
          ? opponents[blueCarrier]
          : held
            ? players[ballPlayer]
            : undefined;
      const attack = lastBlue ? -attackSign : attackSign;
      broadcastRotation = film(
        camera,
        elapsed,
        ball.position,
        carrier?.sprite.position,
        carrier?.face ?? (attack === 1 ? 2 : 6),
        attack,
        innerWidth / innerHeight,
      );
      ring.visible = false;
    }
    for (const actor of pitchActors) {
      actor.sprite.scale.divideScalar(
        actor.sprite.userData.appliedMatchScale ?? 1,
      );
      actor.sprite.userData.appliedMatchScale = 1;
      if (
        celebrating &&
        actor === celebrant &&
        runCelebration === spiderRun &&
        goalAge >= costumeRevealTime &&
        !groupStarted &&
        !actor.moving
      ) {
        spiderIdle.offset.x = ((actor.face + screenRotation() + 8) % 8) / 8;
        actor.sprite.material.map = spiderIdle;
        actor.sprite.scale.setScalar(cinematicPlayerSize);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(
            spiderIdle.image,
            8,
            1,
            0,
            (actor.face + screenRotation() + 8) % 8,
            true,
          ) / 48,
        );
        continue;
      }
      if (
        celebrating &&
        actor === celebrant &&
        !groupStarted &&
        runCelebration &&
        (!costumeReveal || goalAge >= costumeRevealTime)
      ) {
        const cell = runCelebration.userData.cell ?? 48,
          frames = runCelebration.image.width / cell;
        if (runCelebration === stubbsSlide)
          runCelebration.offset.set(
            Math.min(frames - 1, Math.floor(goalAge / 0.2)) / frames,
            (7 - ((actor.face + screenRotation() + 8) % 8)) / 8,
          );
        else
          runCelebration.offset.set(
            (Math.floor(actor.runClock / 0.12) % frames) / frames,
            (7 - ((actor.face + screenRotation() + 8) % 8)) / 8,
          );
        actor.sprite.material.map = runCelebration;
        const celebrationScale = actor.maps[0].userData.celebrationScale as
          | number
          | undefined;
        if (celebrationScale)
          actor.sprite.scale.setScalar(
            ((cinematicPlayerSize * cell) / 48) * celebrationScale,
          );
        else if (
          cell === 50 ||
          cell === 54 ||
          actor.displayName === "Jan" ||
          actor.displayName === "Jules" ||
          actor.displayName === "Mina" ||
          runCelebration.userData.useNativeRunScale ||
          runCelebration === meghanSkate ||
          runCelebration === spiderRun
        )
          actor.sprite.scale.setScalar((cinematicPlayerSize * cell) / 48);
        else actor.sprite.scale.setScalar(cinematicPlayerSize);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(
            runCelebration.image,
            frames,
            8,
            (actor.face + screenRotation() + 8) % 8,
            0,
            true,
          ) / cell,
        );
        continue;
      }
      const keeperCheering =
        actor === (shotDirection === attackSign ? sean : awayGK);
      const groupMap =
        celebrating &&
        groupStarted &&
        (keeperCheering ||
          ((actor !== sean || celebrationLab) && actor !== awayGK))
          ? supportMap(actor)
          : undefined;
      const groupWalk = walks.find((w) => w.actor === actor && w.gather);
      if (
        celebrating &&
        groupStarted &&
        !actor.moving &&
        (actor !== celebrant || ownGoalCelebration) &&
        groupMap &&
        (groupWalk ||
          keeperCheering ||
          (ownGoalCelebration && actor === celebrant))
      ) {
        const cell = groupMap.userData.cell ?? 48,
          frames = groupMap.image.width / cell;
        groupMap.offset.x =
          (Math.floor(
            (goalAge - celebrationRunSeconds + (groupWalk?.phase ?? 0)) / 0.2,
          ) %
            frames) /
          frames;
        if (groupMap.userData.directionalCelebration)
          groupMap.offset.y =
            (7 - ((actor.face + screenRotation() + 8) % 8)) / 8;
        actor.sprite.material.map = groupMap;
        const rows = groupMap.image.height / cell;
        const celebrationScale = actor.maps[0].userData.celebrationScale as
          | number
          | undefined;
        if (celebrationScale)
          actor.sprite.scale.setScalar(
            ((cinematicPlayerSize * cell) / 48) * celebrationScale,
          );
        else if (
          groupMap.userData.greenKeeperGroup ||
          cell === 50 ||
          cell === 54 ||
          actor.displayName === "Jan" ||
          actor.displayName === "Jeremy" ||
          actor.displayName === "Mandy" ||
          actor.displayName === "Jules" ||
          actor.displayName === "Mina"
        )
          actor.sprite.scale.setScalar((cinematicPlayerSize * cell) / 48);
        else actor.sprite.scale.setScalar(cinematicPlayerSize);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(
            groupMap.image,
            frames,
            rows,
            rows === 8 ? (actor.face + screenRotation() + 8) % 8 : 0,
            0,
            true,
          ) / cell,
        );
        continue;
      }
      if (celebrating && actor === celebrant && goalMap && groupStarted) {
        const groupAge = groupStarted
          ? goalAge - celebrationRunSeconds
          : goalAge;
        const cell = goalMap.userData.cell ?? 48,
          frames = goalMap.image.width / cell;
        const frame =
          goalMap === mandyGoal
            ? Math.min(
                frames - 1,
                Math.floor(Math.max(0, groupAge - photoStart) / 0.2),
              )
            : Math.floor(groupAge / 0.2) % frames;
        if (goalMap.userData.directionalCelebration)
          goalMap.offset.y =
            (7 - ((actor.face + screenRotation() + 8) % 8)) / 8;
        goalMap.offset.x = frame / frames;
        actor.sprite.material.map = goalMap;
        const rows = goalMap.image.height / cell;
        const celebrationScale = actor.maps[0].userData.celebrationScale as
          | number
          | undefined;
        if (celebrationScale)
          actor.sprite.scale.setScalar(
            ((cinematicPlayerSize * cell) / 48) * celebrationScale,
          );
        else if (
          cell === 50 ||
          cell === 54 ||
          actor.displayName === "Jan" ||
          actor.displayName === "Jeremy" ||
          actor.displayName === "Mandy" ||
          actor.displayName === "Jules" ||
          actor.displayName === "Mina" ||
          goalMap === spiderGoalStand
        )
          actor.sprite.scale.setScalar((cinematicPlayerSize * cell) / 48);
        else actor.sprite.scale.setScalar(cinematicPlayerSize);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(
            goalMap.image,
            frames,
            rows,
            rows === 8 ? (actor.face + screenRotation() + 8) % 8 : 0,
            0,
            true,
          ) / cell,
        );
        continue;
      }
      const running = actor.moving && actor.age < 0;
      // Adjacent walking poses must persist briefly; strikes and decisive turns read immediately.
      const turn = Math.abs(actor.face - actor.drawFace);
      if (actor.age >= 0 || phase !== "play" || (turn > 1 && turn < 7))
        actor.drawFace = actor.face;
      else if (actor.face !== actor.drawFace) {
        if (actor.turnCandidate !== actor.face) {
          actor.turnCandidate = actor.face;
          actor.turnTime = 0;
        }
        if (!paused) actor.turnTime += dt;
        if (actor.turnTime >= 0.065) actor.drawFace = actor.face;
      } else {
        actor.turnCandidate = actor.face;
        actor.turnTime = 0;
      }
      const spriteFace = (actor.drawFace + screenRotation() + 8) % 8;
      if (actor.reactionTime > 0 && actor.reactionMap) {
        const age = 0.5 - actor.reactionTime;
        const map =
          actor.reactionFlashMap && Math.floor(age / 0.075) % 2 === 0
            ? actor.reactionFlashMap
            : actor.reactionMap;
        if (actor.reactionMap === actor.maps[0]) {
          map.repeat.set(1 / 8, 1);
          map.offset.set(spriteFace / 8, 0);
          actor.sprite.material.map = map;
          const cell = map.image.height;
          actor.sprite.scale.setScalar((cinematicPlayerSize * cell) / 48);
          actor.sprite.center.set(
            0.5,
            spriteGroundPadding(map.image, 8, 1, 0, spriteFace) / cell,
          );
          continue;
        }
        const reactionFrames = map.image.width / (map.image.height / 8);
        const frame = Math.min(
          reactionFrames - 1,
          Math.floor((age / 0.5) * reactionFrames),
        );
        map.repeat.set(1 / reactionFrames, 1 / 8);
        map.offset.set(frame / reactionFrames, (7 - spriteFace) / 8);
        actor.sprite.material.map = map;
        const reactionCell = map.image.height / 8;
        actor.sprite.scale.setScalar((cinematicPlayerSize * reactionCell) / 48);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(map.image, reactionFrames, 8, spriteFace, frame) /
            reactionCell,
        );
        continue;
      }
      if (actor.reactionMap) {
        actor.sprite.scale.setScalar(cinematicPlayerSize);
        actor.sprite.center.set(0.5, 2 / 48);
      }
      // Play the contact reaction during the whistle, including a brief recovery before the restart.
      if (
        freeKick &&
        freeKick.wait > 0 &&
        freeKick.fallAge < 0.94 &&
        actor.maps[3] &&
        actor === (freeKick.blue ? opponents : players)[freeKick.taker] &&
        actor.displayName === freeKick.victimName
      ) {
        const map = actor.maps[3];
        const cell = map.image.height / 8,
          frames = map.image.width / cell;
        const age = freeKick.fallAge;
        const frame =
          actor.displayName === "José" || frames >= 9
            ? Math.min(frames - 1, Math.floor((age / 0.76) * frames))
            : age < 0.73
              ? Math.min(frames - 1, Math.floor(age / 0.085))
              : Math.max(0, 5 - Math.floor((age - 0.73) / 0.035));
        map.repeat.set(1 / frames, 1 / 8);
        map.offset.set(frame / frames, (7 - spriteFace) / 8);
        actor.sprite.material.map = map;
        actor.sprite.scale.setScalar((cinematicPlayerSize * cell) / 48);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(map.image, frames, 8, spriteFace, frame) / cell,
        );
        continue;
      }
      if (actor === referee) {
        const showing = cardScene && cardScene.time > 0;
        actor.sprite.scale.setScalar(
          cinematicPlayerSize * (showing ? 64 / 48 : 1),
        );
        actor.sprite.center.y = 2 / (showing ? 64 : 48);
        if (showing) {
          const col = Math.min(
            cardFrames - 1,
            Math.floor(cardScene!.time / 0.09),
          );
          cardMap.offset.set(col / cardFrames, (7 - spriteFace) / 8);
          actor.sprite.material.map = cardMap;
          continue;
        }
      }
      if (spriteFace !== 0 && spriteFace !== 4)
        actor.lastSideFace = spriteFace < 4 ? 2 : 6;
      const directionalKick =
        actor.maps[2]?.image.height === 384 ||
        actor.maps[2]?.image.height === 480 ||
        actor.maps[2]?.image.height === 512 ||
        actor.maps[2]?.image.height === 544 ||
        actor.maps[2]?.image.height === 576 ||
        actor.maps[2]?.image.height === 608 ||
        actor.maps[2]?.image.height === 640;
      const kickRow = directionalKick
        ? spriteFace
        : actor.lastSideFace === 2
          ? 0
          : actor.westKickRow;
      if (actor.age < 0) aerialRecovery.delete(actor);
      const mode =
        actor.age >= 0 &&
        !aerialRecovery.has(actor) &&
        (actor.shooting || (actor.tackling && actor.displayName !== "José")) &&
        actor.maps[2]
          ? 2
          : (running || actor.tackling) && actor.maps[1]
            ? 1
            : 0;
      const kickFrames = directionalKick
        ? actor.maps[2].image.width / (actor.maps[2].image.height / 8)
        : kickPoseTimes.length;
      const poseTimes =
        kickFrames >= 9 ||
        ((actor !== sean || celebrationLab) &&
          actor !== awayGK &&
          (actor.displayName === "José" || actor.displayName === "Pam"))
          ? joseKickPoseTimes
          : kickFrames === 8
            ? eightKickPoseTimes
            : kickPoseTimes;
      const cols = [
          8,
          actor.runFrames,
          directionalKick ? kickFrames : poseTimes.length,
        ][mode],
        rows =
          mode === 2
            ? directionalKick
              ? 8
              : actor.maps[2].image.height / 48
            : mode === 1
              ? actor.runRows
              : 1;
      const runFrame = actor.tackling
        ? Math.min(
            actor.runFrames - 1,
            Math.floor((actor.age / 0.42) * actor.runFrames),
          )
        : actor.frameSeconds
          ? Math.floor(actor.runClock / actor.frameSeconds)
          : Math.floor(actor.travel / 0.28);
      const col =
        mode === 2
          ? cols > poseTimes.length
            ? Math.min(
                cols - 1,
                Math.floor((actor.age / kickAnimationSeconds) * cols),
              )
            : poseTimes.findLastIndex((time) => actor.age >= time)
          : mode === 1
            ? runFrame % cols
            : spriteFace;
      const row = mode === 2 ? kickRow : mode === 0 ? 0 : spriteFace;
      const tex =
        celebrating &&
        groupStarted &&
        goalMap === mandyGoal &&
        frontRow.has(actor) &&
        !actor.moving &&
        mode === 0
          ? kneelingPose(actor.maps[0])
          : actor.maps[mode];
      tex.repeat.set(1 / cols, 1 / rows);
      tex.offset.set(col / cols, (rows - 1 - row) / rows);
      actor.sprite.material.map = tex;
      const poseCell = tex.image.height / rows;
      actor.sprite.scale.setScalar((cinematicPlayerSize * poseCell) / 48);
      actor.sprite.center.set(
        0.5,
        spriteGroundPadding(tex.image, cols, rows, row, col) / poseCell,
      );
      if (actor.tackling && actor.tackleMap) {
        const frame = Math.min(
          8,
          Math.floor((actor.age / (0.56 * physics.slideRecovery)) * 9),
        );
        actor.tackleMap.repeat.set(1 / 9, 1 / 8);
        actor.tackleMap.offset.set(frame / 9, (7 - spriteFace) / 8);
        actor.sprite.material.map = actor.tackleMap;
        const cell = actor.tackleMap.image.height / 8;
        actor.sprite.scale.setScalar((cinematicPlayerSize * cell) / 48);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(actor.tackleMap.image, 9, 8, spriteFace, frame) /
            cell,
        );
      }
      if (
        actor.displayName === "José" &&
        !actor.maps[0].userData.keeperName &&
        !actor.tackling
      ) {
        actor.sprite.scale.setScalar(cinematicPlayerSize);
        actor.sprite.center.set(0.5, 2 / 48);
      }
      if (
        aerial &&
        actor === players[aerial.index] &&
        actor.displayName === "Pam"
      ) {
        const frame = Math.min(
          8,
          Math.floor((aerial.age / headerAnimationSeconds) * 9),
        );
        pamHeader.repeat.set(1 / 9, 1 / 8);
        pamHeader.offset.set(frame / 9, (7 - spriteFace) / 8);
        actor.sprite.material.map = pamHeader;
        actor.sprite.scale.setScalar((cinematicPlayerSize * 68) / 48);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(pamHeader.image, 9, 8, spriteFace, frame, true) /
            68,
        );
      } else if (
        aerial &&
        actor === players[aerial.index] &&
        actor.displayName === "José" &&
        aerial.style !== "BICYCLE KICK"
      ) {
        const frame = Math.min(
          8,
          Math.floor((aerial.age / headerAnimationSeconds) * 9),
        );
        joseHeader.repeat.set(1 / 9, 1 / 8);
        joseHeader.offset.set(frame / 9, (7 - spriteFace) / 8);
        actor.sprite.material.map = joseHeader;
        actor.sprite.scale.setScalar((cinematicPlayerSize * 68) / 48);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(joseHeader.image, 9, 8, spriteFace, frame, true) /
            68,
        );
      } else if (aerial && actor === players[aerial.index] && actor.jumpMap) {
        const jumpCell = actor.jumpMap.image.height / 8;
        const jumpFrames = actor.jumpMap.image.width / jumpCell;
        const jumpDuration = jumpFrames >= 9 ? headerAnimationSeconds : 0.42;
        const jumpFrame = Math.min(
          jumpFrames - 1,
          Math.floor((aerial.age / jumpDuration) * jumpFrames),
        );
        actor.jumpMap.repeat.set(1 / jumpFrames, 1 / 8);
        actor.jumpMap.offset.set(jumpFrame / jumpFrames, (7 - spriteFace) / 8);
        actor.sprite.material.map = actor.jumpMap;
        actor.sprite.scale.setScalar((cinematicPlayerSize * jumpCell) / 48);
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(
            actor.jumpMap.image,
            jumpFrames,
            8,
            spriteFace,
            0,
            true,
          ) / jumpCell,
        );
      }
      if (actor === sean || actor === awayGK) {
        const pink = !!actor.maps[0].userData.seanKeeper;
        if (actor === carryingKeeper) {
          const walking = actor.moving;
          const name = actor.maps[0].userData.keeperName;
          const poses =
            name === "José"
              ? joseKeeperPoses
              : name === "Spencer"
                ? spencerKeeperPoses
                : undefined;
          const original = poses
            ? poses[walking ? 1 : 2]
            : pink
              ? walking
                ? seanCarry
                : seanHold
              : walking
                ? greenCarry
                : greenHold;
          const sheet = useSnowBall()
            ? (snowKeeperSheets.get(original) ?? original)
            : original;
          const cell = sheet.image.height / 8;
          const frames = sheet.image.width / cell;
          const col = Math.floor(actor.runClock / actor.frameSeconds) % frames;
          const row = (actor.face + screenRotation() + 8) % 8;
          sheet.repeat.set(1 / frames, 1 / 8);
          sheet.offset.set(col / frames, (7 - row) / 8);
          actor.sprite.material.map = sheet;
          actor.sprite.material.rotation = 0;
          actor.sprite.scale.setScalar((cinematicPlayerSize * cell) / 48);
          actor.sprite.center.set(
            0.5,
            spriteGroundPadding(sheet.image, frames, 8, row, col) / cell,
          );
        }
        const activeDive =
          shot &&
          (shot.result === "Save" || shot.result === "Goal") &&
          actor === (shotDirection === attackSign ? awayGK : sean);
        if (activeDive) {
          const lateral = shot.targetZ - keeperStart;
          const quick = Math.abs(lateral) < 1;
          const sheet = keeperDiveSheet(actor.maps[0], quick);
          const face = facing(0, Math.sign(lateral) || 1);
          showKeeperDive(
            actor.sprite,
            sheet,
            (face + screenRotation() + 8) % 8,
            shotTime / shot.duration,
            cinematicPlayerSize,
          );
        }
      }
      if (
        aerial &&
        actor === players[aerial.index] &&
        actor.displayName === "José" &&
        aerial.style === "BICYCLE KICK"
      ) {
        const frames = joseOverhead.image.width / 48;
        joseOverhead.offset.set(
          Math.min(frames - 1, Math.floor((aerial.age / 0.42) * frames)) /
            frames,
          (7 - spriteFace) / 8,
        );
        actor.sprite.material.map = joseOverhead;
        actor.sprite.center.set(
          0.5,
          spriteGroundPadding(
            joseOverhead.image,
            frames,
            8,
            spriteFace,
            0,
            true,
          ) / 48,
        );
      }
    }
    if (cardScene && cardScene.time > 0) {
      const center = referee.sprite.position,
        t = cardScene.time / cardSceneSeconds,
        yaw =
          Math.atan2(
            cardScene.offender.sprite.position.x - center.x,
            cardScene.offender.sprite.position.z - center.z,
          ) + 0.65;
      camera.position.set(
        center.x + Math.sin(yaw) * (6 - 1.4 * t),
        2.4 - 0.5 * t,
        center.z + Math.cos(yaw) * (6 - 1.4 * t),
      );
      camera.lookAt(center.x, 0.9, center.z);
    } else if (!broadcast)
      frameAction(
        camera,
        view,
        camTarget,
        viewportAspect(),
        view.end ? attackSign : 1,
        view.end ? 0.8 : 0,
      );
    camera.updateMatrixWorld();
    if (matchSurface && !paused && !squadOpen && !document.hidden)
      matchSurface.updateSnow(
        dt,
        weatherTest
          ? (elapsed * 25) / (60 * halfMinutesForSpeed[settings.speed])
          : surfaceMinutes,
        pitchActors,
        ball,
        ball.position.y <= restingHeight + 0.025,
      );
    const canvas = renderer.domElement;
    for (const actor of pitchActors) {
      const matchScale = actor.sprite.userData.matchScale ?? 1;
      actor.sprite.scale.multiplyScalar(matchScale);
      actor.sprite.userData.appliedMatchScale = matchScale;
      actor.world.copy(actor.sprite.position);
      actor.sprite.position.y += jumpHeight(actor);
      if (actor !== sean && actor !== awayGK)
        actor.sprite.material.rotation = 0;
      if (aerial && actor === players[aerial.index]) {
        const jump = Math.sin(
          Math.PI *
            Math.min(
              1,
              aerial.age /
                (["Pam", "José"].includes(actor.displayName)
                  ? headerAnimationSeconds
                  : 0.42),
            ),
        );
        actor.sprite.position.y +=
          jump * (aerial.style === "VOLLEY" ? 0.19 : 0.305);
      }
      if (celebrating) {
        // Sort overlapping sprites by their feet with stable ties while the camera follows the scorer.
        actor.sprite.renderOrder =
          10_000 +
          Math.round(
            screenPoint
              .copy(actor.world)
              .applyMatrix4(camera.matrixWorldInverse).z * 20,
          );
        continue;
      }
      actor.sprite.renderOrder = 0;
      screenPoint.copy(actor.sprite.position).project(camera);
      screenPoint.x = snap(screenPoint.x, 2 / canvas.width);
      screenPoint.y = snap(screenPoint.y, 2 / canvas.height);
      actor.sprite.position.copy(screenPoint.unproject(camera));
    }
    const selected =
      keeperGather > 0 ? keeperActor().sprite : players[active].sprite;
    screenUp.setFromMatrixColumn(camera.matrixWorld, 1);
    headScreen
      .copy(selected.position)
      .addScaledVector(screenUp, selected.scale.y * (1 - selected.center.y))
      .project(camera);
    const depth = -screenPoint
      .copy(selected.position)
      .applyMatrix4(camera.matrixWorldInverse).z;
    const cellWidth =
      (selected.scale.x *
        canvas.clientWidth *
        camera.projectionMatrix.elements[0]) /
      (2 * Math.max(0.1, depth));
    const visibleFraction = players[active].maps[0].userData.bodyWidth ?? 0.55;
    const plateWidth = Math.min(
      canvas.clientWidth * 0.34,
      cellWidth * visibleFraction * 2.25,
    );
    nameplate.style.width = plateWidth + "px";
    nameplate.style.fontSize =
      Math.max(
        7,
        Math.min(
          18,
          plateWidth / (Math.max(5, nameText.textContent?.length ?? 5) * 0.9),
        ),
      ) + "px";
    nameplate.style.left =
      Math.round(((headScreen.x + 1) * canvas.clientWidth) / 2) + "px";
    nameplate.style.top =
      Math.round(((1 - headScreen.y) * canvas.clientHeight) / 2 - 3) + "px";
    const multiplayer = (seats?.length ?? 0) > 1;
    for (const [number, label] of seatLabels) {
      if (!multiplayer || !seats?.some((seat) => seat.number === number))
        label.root.hidden = true;
    }
    if (multiplayer)
      for (const seat of seats!) {
        let label = seatLabels.get(seat.number);
        if (!label) {
          label = createSeatLabel(seat.number);
          seatLabels.set(seat.number, label);
        }
        const actor =
          keeperGather > 0 && keeperSeat === seat
            ? keeperActor()
            : teamActors(seat)[seat.actor];
        label.root.hidden =
          !actor?.sprite.visible || celebrating || replay.cut >= 0;
        if (label.root.hidden) continue;
        const sprite = actor.sprite;
        if (label.name.textContent !== actor.displayName)
          label.name.textContent = actor.displayName;
        label.reserve.style.transform =
          "scaleX(" + actor.staminaCapacity / 100 + ")";
        label.charge.style.transform =
          "scaleX(" + actor.sprintCharge / 100 + ")";
        headScreen
          .copy(sprite.position)
          .addScaledVector(screenUp, sprite.scale.y * (1 - sprite.center.y))
          .project(camera);
        label.root.style.fontSize =
          Math.max(8, Math.min(18, plateWidth / 5)) + "px";
        label.root.style.left =
          Math.round(((headScreen.x + 1) * canvas.clientWidth) / 2) + "px";
        label.root.style.top =
          Math.round(((1 - headScreen.y) * canvas.clientHeight) / 2 - 4) + "px";
      }
    nameplate.hidden = celebrating || multiplayer;
    if (celebrating) ring.visible = false;
    for (const { actor, icon } of exhaustionMarkers) {
      const sprite = actor.sprite;
      icon.hidden = actor.staminaCapacity > 0 || !sprite.visible;
      if (icon.hidden) continue;
      icon.title = actor.displayName + " · stamina depleted";
      headScreen
        .copy(sprite.position)
        .addScaledVector(screenUp, sprite.scale.y * (1 - sprite.center.y))
        .project(camera);
      icon.style.left =
        Math.round(((headScreen.x + 1) * canvas.clientWidth) / 2) + "px";
      const gap = sprite === selected ? nameplate.offsetHeight + 19 : 4;
      icon.style.top =
        Math.round(((1 - headScreen.y) * canvas.clientHeight) / 2 - gap) + "px";
    }
    if (feedbackActor) {
      const sprite = feedbackActor.sprite;
      headScreen
        .copy(sprite.position)
        .addScaledVector(screenUp, sprite.scale.y * (1 - sprite.center.y))
        .project(camera);
      callout.style.left =
        Math.round(((headScreen.x + 1) * canvas.clientWidth) / 2) + "px";
      callout.style.top =
        Math.round(
          ((1 - headScreen.y) * canvas.clientHeight) / 2 -
            (feedbackActor === players[active] ? 58 : 8) -
            8 * (1 - feedbackTime / 1.05),
        ) + "px";
      callout.style.opacity = String(Math.min(1, feedbackTime / 0.22));
    }
    if (passCallIndex >= 0) {
      const sprite = players[passCallIndex].sprite;
      headScreen
        .copy(sprite.position)
        .addScaledVector(screenUp, sprite.scale.y * (1 - sprite.center.y))
        .project(camera);
      passCall.style.left =
        Math.round(((headScreen.x + 1) * canvas.clientWidth) / 2) + "px";
      passCall.style.top =
        Math.round(((1 - headScreen.y) * canvas.clientHeight) / 2 - 8) + "px";
    }

    const burningPossession =
      ((meters[0].value === 100 &&
        blueCarrier < 0 &&
        !bluePass &&
        (held || inFlight || (rollingPass && !lastBlue))) ||
        (meters[1].value === 100 && (blueCarrier >= 0 || !!bluePass))) &&
      phase === "play" &&
      !crossingDrill &&
      !celebrating &&
      !outBall &&
      !keeperRestart &&
      !shot &&
      !blastShooter;
    burningBall.update(
      ball.position,
      burningPossession ||
        (!!shot && flightCurve?.style === "Fire Spiral") ||
        (!!curveRate && struckLoose && !held && curveStyle === "Fire Spiral"),
      ball.position.y <= restingHeight + 0.25,
      paused ? 0 : dt,
    );
    if (!shot) blastFlying = false;
    for (const [i, ember] of flames.entries()) {
      ember.visible = ((!!blastShooter && windupBurn) || blastFlying) && replay.cut < 0;
      if (!ember.visible) continue;
      if (blastShooter) {
        const angle = (i * Math.PI) / 6 + blastWindup * 9,
          radius = 0.12 + 0.8 * (1 - Math.min(1, blastWindup / 0.65));
        ember.position.copy(ball.position);
        ember.position.x += radius * Math.cos(angle);
        ember.position.y += radius * Math.sin(angle);
        ember.scale.setScalar(0.08 + blastWindup * 0.17);
      } else {
        ember.position
          .copy(ball.position)
          .lerp(
            shotStart,
            Math.min(
              1,
              (i * 0.014) / Math.max(0.1, shotTime / (shot?.duration || 1)),
            ),
          );
        ember.scale.setScalar(0.36 * (1 - i / 14));
      }
    }
    if (
      !celebrationLab &&
      !broadcast &&
      !paused &&
      (phase === "play" || cardScene)
    )
      replay.record(
        celebrating || blastShooter ? Math.min(elapsed, 0.1) : dt,
        (shotDirection === 1 ? attackingGoal : homeGoal).rippleTime,
      );
    renderer.render(scene, camera);
    if (revealFirstFrame || (broadcast && !matchView.dataset.live))
      matchView.removeAttribute("data-loading");
    if (revealFirstFrame) {
      revealFirstFrame = false;
      reveal(
        matchView,
        crossingDrill
          ? ":scope > canvas,.training-panel"
          : ":scope > canvas,.bug-stack",
      );
    }
    if (broadcast && !matchView.dataset.live) {
      matchView.dataset.live = "true";
      window.frameElement?.classList.add("feed-live");
    }
    for (const actor of pitchActors) actor.sprite.position.copy(actor.world);
    if (celebrating && (resultTime <= 0 || skipCelebration)) {
      finishGoalEvent();
      celebrating = false;
      if (celebrationLab) {
        reset(true, true);
        breakSeconds = 6;
        matchView.classList.add("lab-kickoff");
      } else if (!broadcast && replay.begin()) {
        for (const actor of pitchActors) actor.sprite.renderOrder = 0;
        beginReplayInset();
        goalBanner.hidden = true;
        setReplayHint();
        ring.visible = false;
        nameplate.hidden = true;
        callout.hidden = true;
        clearPassCall();
        switchButton.disabled = true;
        el("shotResult").textContent = "";
      } else reset(shotDirection === attackSign, true);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
start().catch((error) => {
  const target =
    error instanceof Event
      ? (error.target as (HTMLImageElement & { responseURL?: string }) | null)
      : null;
  const resource = target?.currentSrc || target?.src || target?.responseURL;
  console.error("Pitch startup failed", resource || error, error);
  const detail = resource
    ? `Could not load ${decodeURIComponent(new URL(resource, location.href).pathname.split("/").pop() || "an asset")}.`
    : error instanceof Error
      ? error.message
      : "An asset could not load.";
  const message = el("pitchError");
  message.replaceChildren(
    document.createTextNode(`The pitch could not load. ${detail} `),
  );
  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "Retry";
  retry.onclick = () => location.reload();
  message.append(retry);
  message.hidden = false;
});
