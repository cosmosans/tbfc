#!/usr/bin/env python3
"""Prepare an iOS WhatsApp export and build a curated, match-only TBFC import.

This never publishes, infers match events, or modifies scores, rosters or lineups.
The editorial plan explicitly maps source messages and photos to existing matches.
"""
import argparse
import base64
import hashlib
import html
import json
import re
import zipfile
from datetime import datetime
from pathlib import Path


def read_messages(archive, cutoff):
    with zipfile.ZipFile(archive) as source:
        names = [name for name in source.namelist() if Path(name).name == '_chat.txt']
        if len(names) != 1:
            raise ValueError('Expected exactly one iOS WhatsApp _chat.txt export.')
        text = source.read(names[0]).decode('utf-8-sig').replace('\r\n', '\n')
    headers = list(re.finditer(r'^\u200e?\[(\d+/\d+/\d+, [^\]]+)\] ', text, re.M))
    if not headers:
        raise ValueError('Unrecognized WhatsApp timestamps; no data was imported.')
    messages = []
    for index, header in enumerate(headers):
        date = datetime.strptime(header[1].replace('\u202f', ' '), '%m/%d/%y, %I:%M:%S %p')
        if date.date().isoformat() < cutoff:
            continue
        body = text[header.end():headers[index + 1].start() if index + 1 < len(headers) else len(text)].strip()
        sender, separator, message = body.partition(': ')
        messages.append({'id': index, 'date': date.isoformat(),
                         'sender': sender.removeprefix('~\u202f').strip() if separator else '',
                         'text': message if separator else body})
    return messages


def clean_quote(text):
    text = re.sub(r'<attached: [^>]+>|<This message was edited>', '', text)
    text = re.sub(r'\u200e(?:image|video|GIF|sticker|document|audio) omitted', '', text)
    return text.translate({ord(c): None for c in '\u200e\u200f\u2068\u2069'}).strip()


def append_story(existing, story):
    if not story:
        return existing
    prefix = '<!--tbfc-rich-text-->'
    paragraphs = ''.join('<p>' + html.escape(p).replace('\n', '<br>') + '</p>'
                         for p in story.split('\n\n'))
    if story in existing or paragraphs in existing:
        return existing
    if not existing.strip():
        return story
    if existing.startswith(prefix):
        return existing + '<hr>' + paragraphs
    return existing + '\n\n' + story


def build(snapshot, plan, messages, plan_dir):
    original = snapshot['data']
    candidate = json.loads(json.dumps(original))
    matches = {m['id']: m for m in candidate['matches']}
    sources = {m['id']: m for m in messages}
    players = {p['id'] for p in candidate['players']}
    mappings = plan['players']
    changes, provenance, used_sources = [], [], set()
    seen_matches = set()
    for entry in plan['matches']:
        mid = entry['matchId']
        if mid in seen_matches or mid not in matches:
            raise ValueError(f'Duplicate or missing match: {mid}')
        seen_matches.add(mid)
        match = matches[mid]
        if match.get('status', 'completed') != 'completed':
            raise ValueError(f'Cannot enrich an unfinished match: {mid}')
        before = json.loads(json.dumps(match))
        match['report'] = append_story(match.get('report', ''), entry.get('story', ''))
        existing_ids = {m['id'] for m in match.get('chat', [])}
        existing_ids.update(r['id'] for m in match.get('chat', []) for r in m.get('replies', []))

        def quote(index):
            if index in used_sources:
                raise ValueError(f'Message selected more than once: {index}')
            used_sources.add(index)
            source = sources[index]
            pid = mappings.get(source['sender'])
            if pid not in players:
                raise ValueError(f'Unmapped sender: {source["sender"]}')
            text = clean_quote(source['text'])
            if not text or 'This message was deleted' in text or 'You deleted this message' in text:
                raise ValueError(f'Message has no usable quotation: {index}')
            digest = hashlib.sha256(json.dumps(source, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:24]
            result = {'id': 'whatsapp-' + digest, 'playerId': pid, 'text': text}
            provenance.append({'matchId': mid, 'chatId': result['id'], 'source': source})
            return result

        for selection in entry.get('quotes', []):
            group = selection if isinstance(selection, list) else [selection]
            converted = [quote(index) for index in group]
            root, replies = converted[0], converted[1:]
            if root['id'] in existing_ids:
                # Re-running a plan preserves any subsequent edits to its imported messages.
                continue
            if any(r['id'] in existing_ids for r in replies):
                raise ValueError('A reply already exists under a different parent.')
            if replies:
                root['replies'] = replies
            match.setdefault('chat', []).append(root)
            existing_ids.update(item['id'] for item in converted)

        for photo in entry.get('photos', []):
            source = sources[photo['sourceId']]
            if photo['sourceName'] not in re.findall(r'<attached: ([^>]+)>', source['text']):
                raise ValueError('Photo is not attached to the specified source message.')
            raw = (plan_dir / photo['file']).read_bytes()
            if not raw.startswith(b'\xff\xd8\xff'):
                raise ValueError('Prepared lineup photos must be JPEGs.')
            pid = 'whatsapp-photo-' + hashlib.sha256(photo['sourceName'].encode()).hexdigest()[:24]
            src = 'data:image/jpeg;base64,' + base64.b64encode(raw).decode()
            if any(p['id'] == pid or p['src'] == src for p in match.get('photos', [])):
                continue
            total = sum(len(p['src']) for p in match.get('photos', [])) + len(src)
            if total > 1_200_000:
                raise ValueError(f'Photo gallery would exceed its size limit: {mid}')
            match.setdefault('photos', []).append({'id': pid, 'name': photo['name'], 'src': src})
            provenance.append({'matchId': mid, 'photoId': pid, 'source': source,
                               'sourceName': photo['sourceName']})

        changed_fields = {k for k in set(match) | set(before) if match.get(k) != before.get(k)}
        if not changed_fields <= {'report', 'chat', 'photos'}:
            raise ValueError('Import attempted to modify a protected match field.')
        if changed_fields:
            changes.append({'collection': 'matches', 'id': mid, 'item': match})
    for collection in original:
        if collection != 'matches' and original[collection] != candidate[collection]:
            raise ValueError(f'Import attempted to modify {collection}.')
    return candidate, {'revision': snapshot['revision'], 'changes': changes}, provenance


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('--cutoff', default='2025-08-05')
    parser.add_argument('--snapshot', type=Path)
    parser.add_argument('--plan', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    datetime.strptime(args.cutoff, '%Y-%m-%d')
    if bool(args.snapshot) != bool(args.plan):
        parser.error('--snapshot and --plan must be supplied together')
    messages = read_messages(args.archive, args.cutoff)
    args.output.mkdir(parents=True, exist_ok=True)
    # Exports contain private conversations; keep generated material out of version control.
    (args.output / '.gitignore').write_text('*\n!.gitignore\n')
    (args.output / 'messages.json').write_text(json.dumps(messages, ensure_ascii=False, indent=2))
    if args.plan:
        snapshot = json.loads(args.snapshot.read_text())
        plan = json.loads(args.plan.read_text())
        candidate, changes, provenance = build(snapshot, plan, messages, args.plan.parent)
        for name, value in [('candidate.json', candidate), ('changes.json', changes), ('provenance.json', provenance)]:
            (args.output / name).write_text(json.dumps(value, ensure_ascii=False, indent=2))
        print(f'Prepared {len(changes["changes"])} match updates. No data has been published.')
    else:
        print(f'Prepared {len(messages)} messages from {args.cutoff}; ready for an editorial plan.')


if __name__ == '__main__':
    main()
