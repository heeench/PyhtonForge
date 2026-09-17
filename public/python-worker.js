let runtime;
async function boot(){if(!runtime){importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');runtime=loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});}return await runtime;}
self.onmessage=async({data})=>{try{const py=await boot();if(data.type==='boot'){postMessage({type:'ready'});return;}
postMessage({type:'loading'});
if(data.packages?.length){await py.loadPackage('micropip');const mp=py.pyimport('micropip');await mp.install(data.packages);mp.destroy();}
postMessage({type:'running'});
py.globals.set('_source_input',data.code);py.globals.set('_tests_input',JSON.stringify(data.tests));
const out=await py.runPythonAsync(`
import json, ast, inspect, traceback, io, contextlib
_tests = json.loads(_tests_input)
_source = _source_input
_results = []
_stdout = io.StringIO()
for _test in _tests:
    _ns = {'__name__': '__main__'}
    _check = _test.get('check', '')
    try:
        with contextlib.redirect_stdout(_stdout), contextlib.redirect_stderr(_stdout):
            exec(compile(_source, 'solution.py', 'exec'), _ns)
            try:
                _compiled = compile(_check, '<test>', 'eval', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
                _value = eval(_compiled, _ns)
                if inspect.isawaitable(_value): _value = await _value
                if not _value: raise AssertionError('Результат не совпал с ожидаемым')
            except SyntaxError:
                _compiled = compile(_check, '<test>', 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
                _value = eval(_compiled, _ns)
                if inspect.isawaitable(_value): await _value
        _results.append({'name': _test['name'], 'pass': True})
    except BaseException as _err:
        _trace = ''.join(traceback.format_exception(type(_err), _err, _err.__traceback__))
        _results.append({'name': _test['name'], 'pass': False, 'type': type(_err).__name__, 'error': str(_err) or type(_err).__name__, 'check': _check, 'traceback': _trace[-2200:]})
json.dumps({'results': _results, 'output': _stdout.getvalue()[-3000:]})
`);postMessage({type:'done',...JSON.parse(out)});
}catch(e){postMessage({type:'error',error:String(e)});}};
