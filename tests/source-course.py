"""Verify that navigation never removes source text, code examples or exam sections."""
import hashlib,json,re
from pathlib import Path

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'lib/source-course.json').read_text())
ids=set()
for module in data['modules']:
    raw=(root/'public/course-sources'/module['sourceFile']).read_bytes()
    chapters=[l for l in data['lessons'] if l['moduleId']==module['id']]
    assert [c['id'] for c in chapters]==module['lessonIds']
    assert ''.join(c['markdown'] for c in chapters).encode('utf-8')==raw
    assert hashlib.sha256(raw).hexdigest()==module['sha256']
    assert len(raw)==module['bytes']
    for chapter in chapters:
        assert chapter['id'] not in ids
        ids.add(chapter['id'])
        # No chapter split may land in the middle of an example.
        fences=re.findall(r'^```',chapter['markdown'],re.M)
        assert len(fences)%2==0,chapter['id']
    print(f"PASS: {module['title']} — {len(chapters)} chapters, {len(raw)} bytes preserved")
assert len(data['modules'])==3
print(f'PASS: {len(ids)} unique chapter IDs; full source reconstructed without loss')
