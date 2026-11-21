# TBFC Broadcast Studio

The Final Cut multicam round-trip was verified by the user: editable picture cuts and both audio angles active. The original project and library are never modified by these scripts.

## Opening five-minute experiment

`scripts/gameplay.py` is a fixture-specific prototype for the updated Whiff City export. It estimates activity from frame differences inside manually estimated pitch masks, then compares normalized near-pitch activity between cameras. It does not detect the ball, identify players, or establish metric field coordinates. The evidence score is a heuristic, not a probability. SuperView distortion is accommodated only by per-view masks and normalization in this first experiment.

The analysis AVI files are sampled at 2 fps from both original media files, starting at the trimmed multicam source position (13165/60 seconds), with Cam A's synchronization offset preserved. Original 59.94-to-60 conformity remains in the exported XML. Analysis sampling is approximate to a half-second; all XML cut times are exact project frames.

Run with the prepared Python environment:

```
/tmp/tbfc-vision-env/bin/python broadcast-studio/scripts/gameplay.py
```

Tune `config/director.json`, then use `--cached` to reuse the activity measurements without decoding footage again. Pitch-mask changes require a new analysis pass. Frame extraction and source resolution are currently specific to this five-minute section; do not use this script for other matches or full-match media boundaries without extending those parts.

Outputs in `output/whiff-gameplay/` include the importable `.fcpxmld` bundle, decisions in integer 60fps frames, cached measurements, and diagnostics. Both audio angles are enabled on every segment. Resources, bookmarks, synchronization offsets and camera compound clips are preserved. Review the imported result before expanding scope.

No ball detector or automatic goal detection has been validated. Adjacent players, referees, exposure changes, and quiet possession can confuse motion-only scoring. Low evidence retains the current angle.

## Full first half

`scripts/full_half.py` resolves the angle compound clips into their constituent camera files and samples across file boundaries using rational timeline times and the existing rate conformity. It preserves the approved opening edit and uses its activity normalization for the remainder. Analysis caches are tied to the source XML hash. Both audio sources stay enabled; video selection falls back to Cam A at the exact end of Cam B's recording. A short terminal sampling pad affects analysis frames only, never the edited source footage.

Run with the same Python environment. Hardware decoding requires access to macOS VideoToolbox. Outputs are under `output/whiff-first-half/`. Full timeline coverage is retained; the script does not detect the halftime whistle or trim postgame footage.
