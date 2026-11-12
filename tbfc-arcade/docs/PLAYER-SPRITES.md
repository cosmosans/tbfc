# TBFC player sprite direction

**Current production workflow.** The artist supplies the sprites and animation frames. Preserve their pixels and timing on import. Jersey numbers are optional and need no legibility pass. The drawing notes below are reference material for the artist.

## Required references for every generation

Open the actual jersey PNGs under `/Users/cosmopro/Sites/tbfc/public/jerseys/` before drawing any TBFC player, including animation revisions. Use black-front.png and black-back.png for the master. Inspect white-front.png and white-back.png for the alternate. Attach the relevant view to the prompt. Use the club crest at public/crests/tbfc.png and the player’s confirmed photoUrl or supplied photos. An earlier sprite is a pose and style reference. The jersey images govern the uniform.

## Reusable prompt

> Draw [player name and confirmed number] for TBFC Arcade using the attached portrait, original jersey view and approved Meghan idle sheet. Match Meghan’s pixel density, dark contour, cluster shading, upper-left light, camera angle and scale. Preserve [confirmed hair, build, sleeve treatment and cleats]. Copy the kit’s red neckline, asymmetric orange and red panels and small round crest on the wearer’s left chest. Keep the center fabric clear. Simplify tiny marks at match size. Use transparent cells, a common ground line and fixed scale throughout. Draw [action, direction and ordered poses]. Keep the ball separate.

## Production and review

1. Establish a single idle pose beside Meghan at native size and 3× zoom. Keep the working grid, foot anchor and palette consistent. Record the player's assigned cleat color once, from black, pink, yellow or white.
2. Use Meghan’s production idle and run atlases to compare size, pixel density, kit placement and silhouette on the pitch.
3. Use the eight supplied facing directions. Meghan’s run has eight frames per direction, each held for 200 ms at normal speed. Use one stable foot anchor per animation and preserve the artist’s frame-to-frame motion.
4. Make the white kit from the approved black frames using separate shirt-fabric and shorts-fabric masks. Map both black shirt and black shorts shading to white. Protect skin, hair, crest, red and orange panels, outlines, socks and cleats. Retain the original alpha, poses, anchors, cell order and timing.
5. Review on dark turf at match size and enlarged. Compare chest and hem against the source and across all frames. Reject invented graphics and lettering. Check the planted foot, ball release, and silhouette flicker before promoting the sheet into gameplay.

## Approved roster style reference

Use **#6 Meghan Wahlstrom** as the roster art master. The [idle atlas](../art/meghan-master/meghan-pixellab-idle.png), [run atlas](../art/meghan-master/meghan-pixellab-run.png) and original PixelLab GIFs are together in the meghan-master folder. Match her native 48 × 48 Practice presentation, common foot baseline, crisp pixels and readable features on dark turf.
 
Order the eight frames south, southeast, east, northeast, north, northwest, west, southwest. Use the supplied artwork as delivered. Back numbers are optional. Keep the ball separate. Build from two to four reusable silhouettes, sharing frame sizes, foot anchors and timing. Personalize faces, hair, sleeves, cleats and numbers from each player's references. The earlier 24 × 24 artwork documents the prototype.


## Modular head registration

For every new head and every facing, export a transparent 18 × 18 PNG with a black outline. On the bottom row, fill exactly the four centered pixels (columns 8–11, counting from one) in solid black. Leave the other fourteen pixels transparent. Use this shared attachment point when placing the head above the collar.
