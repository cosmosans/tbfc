"""Convert the authoritative matchlog CSV into app seed data without changing it."""
import csv
import json
import re
import sys
from datetime import datetime
from pathlib import Path


source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('/Users/cosmopro/Downloads/TBFC STATS - Matchlog.csv')
output = Path(__file__).resolve().parents[1] / 'src/data/seedMatches.json'
matches = []
with source.open(encoding='utf-8-sig', newline='') as handle:
    for row_number, row in enumerate(csv.DictReader(handle), start=2):
        date = datetime.strptime(row['Date'].strip(), '%m/%d/%Y').date().isoformat()
        goals_for = int(re.match(r'^\d+', row['Goals Scored'].strip()).group())
        goals_against = int(re.match(r'^\d+', row['Goals Allowed'].strip()).group())
        # The 2026-10-15 1–1 vs Inter Your Mom was confirmed as an erroneous row.
        if (date, row['Opponent'].strip(), goals_for, goals_against) == ('2026-10-15', 'Inter Your Mom', 1, 1):
            continue
        shootout_for = re.search(r'\((\d+)\)', row['Goals Scored'])
        shootout_against = re.search(r'\((\d+)\)', row['Goals Allowed'])
        competition_value = row['League/Type'].strip()
        league_match = re.match(r'^(D[56])\s*[-–—]\s*(.*)$', competition_value, re.I)
        matches.append({
            'id': f'import-{row_number}',
            'status': 'completed',
            'seasonId': 'season-' + re.sub(r'[^a-z0-9]+', '-', row['Season'].strip().casefold()).strip('-'),
            'opponentId': 'opponent-' + re.sub(r'[^a-z0-9]+', '-', row['Opponent'].strip().casefold()).strip('-'),
            'season': row['Season'].strip(),
            'league': league_match.group(1).upper() if league_match else '',
            'competition': league_match.group(2).strip() if league_match else competition_value,
            'date': date,
            'opponent': row['Opponent'].strip(),
            'venue': row['Location'].strip(),
            'kickoff': row['Time'].strip(),
            'resultLabel': row['Result'].strip(),
            'goalsFor': goals_for,
            'goalsAgainst': goals_against,
            'shootoutFor': int(shootout_for.group(1)) if shootout_for else None,
            'shootoutAgainst': int(shootout_against.group(1)) if shootout_against else None,
            'scoreRaw': f"{row['Goals Scored'].strip()}-{row['Goals Allowed'].strip()}",
            'kit': row['Kit Color'].strip(),
            'scorerNotes': row['Goal Scorers'].strip(),
            'report': '',
            'sourceRow': row_number,
        })
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(matches, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Imported {len(matches)} source rows to {output}')
