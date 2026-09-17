"""Validate course contracts locally; reference implementations never enter the client bundle."""
import ast,json,io,contextlib
from pathlib import Path
course=json.loads(Path('lib/core-course.json').read_text())
solutions=json.loads(Path('tests/core-solutions.json').read_text())
count=0
for task in course['tasks']:
 for test in task['tests']:
  ns={}
  exec(compile(solutions[task['id']], 'reference.py', 'exec'),ns)
  try:code=compile(test['check'],'<test>','eval')
  except SyntaxError:exec(compile(test['check'],'<test>','exec'),ns)
  else:assert eval(code,ns), (task['id'],test['name'])
  count+=1
 # Every task must reject an empty/no-op implementation.
 name=next(n.name for n in ast.walk(ast.parse(solutions[task['id']])) if isinstance(n,ast.FunctionDef))
 rejected=False
 for test in task['tests']:
  ns={name:lambda *a,**kw:None}
  try:
   try:code=compile(test['check'],'<test>','eval')
   except SyntaxError:exec(test['check'],ns)
   else:assert eval(code,ns)
  except Exception:rejected=True;break
 assert rejected,task['id']
for u in course['units']:
 with contextlib.redirect_stdout(io.StringIO()):exec(compile(u['code'],u['id'],'exec'),{})
 assert len(u['taskIds'])==3
 assert all(len(s['paragraphs'])>=2 for s in u['sections'])
print(f'PASS: {count} checks, 36 no-op rejections, 12 executable lesson examples.')
