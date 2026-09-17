"""Lossless import: sources are copied byte-for-byte; chapters retain every character."""
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ("fundamentals", "Python_Fundamentals_I.md", "Python Fundamentals I", "Python core"),
    ("collections", "Коллекции_итерации_и_вложенные_структуры_полная_версия.md", "Коллекции, итерации и вложенные структуры", "Collections"),
    ("functions", "Функции_в_Python_полная_версия.md", "Функции в Python", "Functions"),
]
CORE = {1:"core-references",2:"core-values",3:"core-operators",4:"core-conditions",5:"core-conditions",6:"core-conditions",7:"core-strings",8:"core-sequences",9:"core-loops",10:"core-loops",11:"core-loops",12:"core-loops",13:"core-loops",14:"core-files",15:"core-debugging",16:"core-debugging"}
COLLECTIONS = {9:["core-comprehensions-transfer"],13:["unique"],19:["foundation-count-statuses"],25:["group"],26:["unique"],32:["core-references-transfer"],38:["group"],43:["group"]}
FUNCTIONS = {11:["core-references-transfer"],14:["defaults"],23:["compose"],41:["generator"],43:["generator"],44:["take"],47:["decorator"],49:["decorator"],54:["memo"],55:["typing"],60:["protocol"]}

def split_chapters(text):
    starts = [0]
    offset = 0
    fence = None
    for line in text.splitlines(keepends=True):
        marker = re.match(r"^\s*(`{3,}|~{3,})", line)
        if marker:
            token = marker.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
        elif fence is None and re.match(r"^# \d+\.\s", line) and offset:
            starts.append(offset)
        offset += len(line)
    starts.append(len(text))
    return [text[a:b] for a,b in zip(starts,starts[1:])]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path)
    args = parser.parse_args()
    target = ROOT / "public/course-sources"
    target.mkdir(parents=True, exist_ok=True)
    modules, lessons = [], []
    for key, filename, title, topic in FILES:
        destination = target / filename
        if args.source_dir:
            shutil.copyfile(args.source_dir / filename, destination)
        raw = destination.read_bytes()
        text = raw.decode("utf-8")
        chunks = split_chapters(text)
        assert "".join(chunks).encode("utf-8") == raw
        ids = []
        for i, markdown in enumerate(chunks):
            heading = markdown.splitlines()[0].removeprefix("# ")
            number = re.match(r"(\d+)\.", heading)
            n = int(number.group(1)) if number else -1
            lesson_id = f"source-{key}-{n if n >= 0 else 'intro'}"
            ids.append(lesson_id)
            task_ids = []
            if key == "fundamentals" and n in CORE:
                task_ids = [CORE[n] + "-complete", CORE[n] + "-write", CORE[n] + "-transfer"]
            elif key == "collections":
                task_ids = COLLECTIONS.get(n, [])
            elif key == "functions":
                task_ids = FUNCTIONS.get(n, [])
            lessons.append({
                "id":lesson_id, "moduleId":key, "moduleTitle":title,
                "title":heading.replace("`","") if i else "Введение и содержание",
                "topic":topic, "path":"Полный материал из вашего курса",
                "markdown":markdown, "sourceFile":filename,
                "taskId":task_ids[0] if task_ids else None, "taskIds":task_ids,
                "sections":[], "code":"", "walkthrough":[], "pitfall":"",
                "question":"Объясните основную идею этой главы своими словами. Приведите свой пример кода, ожидаемый результат и один граничный случай.",
                "reference":"Вернитесь к примерам главы и проверьте объяснение на собственном примере. Сохранение ответа фиксирует попытку, но не оценивает освоение навыка.",
            })
        modules.append({"id":key,"title":title,"sourceFile":filename,"lessonIds":ids,
                        "sha256":hashlib.sha256(raw).hexdigest(),"bytes":len(raw)})
    (ROOT/"lib/source-course.json").write_text(json.dumps({"modules":modules,"lessons":lessons},ensure_ascii=False,indent=2)+"\n")
    print(f"Imported {len(modules)} full sources, {len(lessons)} chapters; exact reconstruction verified.")

if __name__ == "__main__":
    main()
