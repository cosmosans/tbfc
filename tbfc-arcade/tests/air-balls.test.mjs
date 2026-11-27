import test from 'node:test';
import assert from 'node:assert/strict';
import {airBallsRules,classicRules} from '../src/matchRules.ts';
import {airGoalEligible,airAccuracy,aerialFinish,airBallsProfile} from '../src/airBalls.ts';
import {supportsMode} from '../src/arenaCapabilities.ts';
test('Air Balls preserves Classic rules and six regular stadiums',()=>{
 assert.deepEqual({...airBallsRules(),mode:'classic'},classicRules());
 for(const venue of ['school','westend','southside','mill','eastside','topdeck']) assert.ok(supportsMode(venue,'airBalls'));
 assert.equal(supportsMode('gulch','airBalls'),false);
});
test('only aerial contacts, set pieces and own goals qualify',()=>{
 for(const kind of ['HEADER','VOLLEY','HALF-VOLLEY','BICYCLE KICK','DIRECT FREE KICK','PENALTY','OWN GOAL']) assert.ok(airGoalEligible(kind));
 assert.equal(airGoalEligible('GROUNDED'),false);
 assert.equal(airAccuracy('DIRECT FREE KICK'),1);
 assert.equal(airAccuracy('GROUNDED'),1);
});
test('half volley window includes 500ms but does not persist into subsequent possession',()=>{
 assert.equal(aerialFinish(.2,499),'HALF-VOLLEY');
 assert.equal(aerialFinish(.2,500),'HALF-VOLLEY');
 assert.notEqual(aerialFinish(1,501),'HALF-VOLLEY');
 assert.equal(aerialFinish(1.4),'HEADER');
 assert.equal(aerialFinish(.8),'VOLLEY');
 assert.equal(aerialFinish(1,Infinity,true),'BICYCLE KICK');
 assert.equal(airBallsProfile.inputBufferMs,600);
});
