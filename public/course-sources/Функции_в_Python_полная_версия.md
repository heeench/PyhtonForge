# Функции в Python — фундамент без пробелов

> Это третий фундаментальный модуль.
>
> Он написан так, чтобы его можно было открыть после долгого перерыва и восстановить понимание **без другого учебника**.
>
> Здесь не предполагается, что ты помнишь, что такое объект-функция, callable, параметр, аргумент, binding, scope, closure, decorator, iterator, generator или side effect.
>
> Каждое важное понятие сначала определяется, затем объясняется через mental model, после этого показывается в коде и связывается с реальной backend-разработкой.
>
> Главный принцип:
>
> **ты не должен угадывать теорию, которую обязан знать уверенно.**

---

# Содержание

1. Что такое функция
2. Функция как объект
3. `def`: что происходит при объявлении
4. Вызов функции и `callable`
5. Параметры и аргументы
6. Позиционные и именованные аргументы
7. `return`
8. `None` и функция без `return`
9. Несколько возвращаемых значений
10. Ссылки, mutation и аргументы функций
11. Контракт функции
12. Значения параметров по умолчанию
13. Mutable default arguments
14. `None` как sentinel и отдельный sentinel-объект
15. `*args`
16. `**kwargs`
17. Positional-only и keyword-only параметры
18. Полная модель сигнатуры функции
19. Распаковка `*` и `**` при вызове
20. Функции высшего порядка
21. `lambda`
22. `sorted(..., key=...)`
23. `map`
24. `filter`
25. `zip`
26. `any` и `all`
27. Scope и namespace
28. LEGB
29. `global`
30. `nonlocal`
31. Замыкания
32. Late binding
33. Рекурсия
34. Call stack
35. Iterable, iterator и generator
36. Generator expressions
37. Generator functions и `yield`
38. `yield from`
39. Жизненный цикл generator
40. Декораторы
41. `functools.wraps`
42. Декораторы с параметрами
43. Несколько декораторов
44. Полезные инструменты `functools`
45. Type hints для функций
46. `Callable`
47. `Iterable`, `Iterator`, `Generator`
48. `TypedDict` и `Protocol`
49. Docstrings
50. Side effects и pure-ish функции
51. Исключения как часть контракта
52. Проектирование хороших функций
53. Production/reliability паттерны
54. Типичные ошибки
55. Debugging
56. Code reading
57. Практика
58. Production exercise
59. Mini-exam
60. Interview questions
61. Критерий освоения
62. Термины «как своё имя»

---

# 1. Что такое функция

**Функция** — объект, который инкапсулирует набор инструкций и может быть вызван.

Простейший пример:

```python
def greet(name):
    return f"Привет, {name}!"
```

Вызов:

```python
message = greet("Анна")
```

Результат:

```python
"Привет, Анна!"
```

Функция позволяет отделить:

```text
что нужно сделать
```

от:

```text
когда и с какими данными это нужно сделать
```

---

# 1.1. Функция — не просто «кусок кода»

У хорошей функции обычно есть:

- имя;
- входные данные;
- ответственность;
- возвращаемый результат;
- возможные ошибки;
- иногда side effects.

Например:

```python
def calculate_discount(price, percent):
    ...
```

Из имени уже должно быть понятно:

> функция вычисляет скидку.

Но для полноценного контракта ещё нужно решить:

- можно ли передать отрицательную цену;
- можно ли `percent > 100`;
- что вернётся;
- может ли функция выбросить исключение;
- изменяет ли она переданные объекты.

---

# 1.2. Зачем нужны функции

Функции помогают:

1. давать операциям имена;
2. отделять ответственности;
3. повторно использовать поведение;
4. тестировать логику отдельно;
5. скрывать детали реализации;
6. строить программу из небольших компонентов;
7. уменьшать дублирование;
8. передавать поведение как объект.

Последний пункт особенно важен в Python.

---

# 1.3. DRY — но без фанатизма

**DRY — Don't Repeat Yourself.**

Идея:

> не поддерживать одну и ту же бизнес-логику в нескольких независимых местах.

Но это не значит:

> любые две похожие строки немедленно вынести в функцию.

Иногда преждевременная абстракция делает код хуже.

Хорошая функция появляется, когда у кода есть отдельная понятная ответственность.

---

# 2. Функция как объект

В Python функция — **объект первого класса**.

Это значит, что с функцией можно делать многие вещи, которые можно делать с другими объектами:

- связать с именем;
- положить в list;
- передать аргументом;
- вернуть из другой функции;
- хранить в dict.

---

# 2.1. Имя функции и вызов — не одно и то же

```python
print
```

— объект-функция.

```python
print()
```

— вызов.

Круглые скобки означают:

> вызвать callable.

---

# 2.2. Ссылка на функцию

```python
another_print = print

another_print("hello")
```

Работает, потому что:

```text
print ─────────┐
               ├──► function object
another_print ─┘
```

---

# 2.3. Пользовательская функция ведёт себя так же

```python
def add(a, b):
    return a + b

operation = add
```

Теперь:

```python
operation(2, 3)
# 5
```

---

# 2.4. Функции в коллекциях

```python
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

operations = {
    "add": add,
    "multiply": multiply,
}
```

Вызов:

```python
operations["add"](2, 3)
# 5
```

Это простая форма dispatch table.

В реальном backend похожие идеи используются для:

- обработчиков событий;
- роутинга;
- стратегий;
- validators;
- callbacks;
- plugin-like архитектуры.

---

# 3. `def`: что происходит при объявлении функции

Код:

```python
def greet(name):
    return f"Hello, {name}"
```

не просто «описывает будущую функцию».

При выполнении инструкции `def` Python создаёт объект-функцию и связывает его с именем:

```text
greet ──► function object
```

Тело функции при этом **не выполняется как обычный вызов**.

---

# 3.1. Тело выполняется при вызове

```python
def demo():
    print("inside")

print("before")
demo()
print("after")
```

Вывод:

```text
before
inside
after
```

---

# 3.2. Почему функцию обычно нельзя вызвать до выполнения `def`

```python
hello()

def hello():
    print("hello")
```

Если интерпретатор ещё не выполнил `def hello`, имя `hello` не связано с функцией.

Получим:

```text
NameError
```

Важно:

> дело не в том, что функция обязана текстуально находиться «выше» всегда, а в том, что к моменту фактического вызова её `def` должен быть выполнен.

Например:

```python
def main():
    hello()

def hello():
    print("hello")

main()
```

работает, потому что к моменту вызова `main()` обе инструкции `def` уже выполнились.

---

# 4. Callable

**Callable** — объект, который можно вызвать оператором `()`.

Проверка:

```python
callable(print)
# True
```

```python
callable(10)
# False
```

Не только функции могут быть callable.

Позже в OOP ты увидишь объекты с методом:

```python
__call__
```

которые тоже вызываются через `()`.

---

# 5. Параметры и аргументы

Эти термины нельзя путать.

## Параметр

Имя в определении функции:

```python
def greet(name):
    ...
```

`name` — параметр.

## Аргумент

Конкретное значение при вызове:

```python
greet("Alice")
```

`"Alice"` — аргумент.

---

# 5.1. Mental model binding

При вызове:

```python
def greet(name):
    return name.upper()

greet("Alice")
```

Python связывает локальное имя параметра:

```text
name ──► "Alice"
```

на время конкретного вызова.

---

# 5.2. Параметр не «копирует значение»

Если передан mutable-объект:

```python
def add_item(items):
    items.append("new")
```

```python
data = []

add_item(data)
```

Теперь:

```python
data
# ['new']
```

Параметр `items` внутри функции ссылался на тот же list.

---

# 6. Позиционные аргументы

```python
def show_user(name, age):
    return f"{name}: {age}"
```

Вызов:

```python
show_user("Alice", 25)
```

Binding идёт по позиции:

```text
name → "Alice"
age  → 25
```

Если перепутать:

```python
show_user(25, "Alice")
```

Python может синтаксически принять вызов, но логический контракт нарушен.

---

# 7. Именованные аргументы

```python
show_user(
    age=25,
    name="Alice",
)
```

Здесь аргументы связываются по имени параметра.

Порядок уже не важен.

---

# 7.1. Смешивание

Можно:

```python
show_user(
    "Alice",
    age=25,
)
```

Но нельзя поставить обычный positional argument после keyword argument в таком виде:

```python
show_user(
    name="Alice",
    25,
)
```

Это `SyntaxError`.

---

# 7.2. Зачем keyword arguments

Они делают вызов самодокументируемым.

Сравни:

```python
request(url, "POST", 5, 3, True)
```

и:

```python
request(
    url,
    method="POST",
    timeout=5,
    retries=3,
    verify_ssl=True,
)
```

Второй вариант гораздо легче читать.

---

# 8. `return`

`return` делает две вещи:

1. завершает текущий вызов функции;
2. передаёт вызывающему коду значение.

```python
def add(a, b):
    return a + b
```

```python
result = add(2, 3)
```

Теперь:

```python
result == 5
```

---

# 8.1. `print` и `return` — не одно и то же

Плохо для вычислительной функции:

```python
def add(a, b):
    print(a + b)
```

```python
result = add(2, 3)
```

На экран выведется:

```text
5
```

Но:

```python
result is None
```

---

# 8.2. Почему return важнее print в бизнес-логике

Функция:

```python
def calculate_total(orders):
    return total
```

может использоваться:

```python
save(total)
send(total)
compare(total)
test(total)
```

А функция, которая только печатает:

```python
print(total)
```

жёстко привязана к side effect вывода.

---

# 8.3. Ранний return

```python
def process_order(order):
    if order is None:
        return None

    if order["status"] != "paid":
        return None

    return calculate(order)
```

Как только выполняется `return`, текущий вызов заканчивается.

---

# 8.4. Недостижимый код

```python
def func():
    return 10
    print("never")
```

`print` не выполнится.

---

# 9. Функция без `return`

Если выполнение доходит до конца функции без явного `return`, Python возвращает:

```python
None
```

```python
def log_message(message):
    print(message)
```

```python
result = log_message("hello")

print(result)
# None
```

То же самое:

```python
def func():
    return
```

возвращает:

```python
None
```

---

# 9.1. Почему это связано с ошибками `NoneType`

```python
def get_limit():
    print("loading")
```

```python
limit = get_limit()

if limit < 10:
    ...
```

Получишь:

```text
TypeError: '<' not supported between instances of 'NoneType' and 'int'
```

Причина:

> функция ничего не вернула явно, поэтому `limit is None`.

---

# 10. Несколько возвращаемых значений

```python
def min_max(values):
    return min(values), max(values)
```

Функция возвращает **один tuple**:

```python
result = min_max([3, 1, 7])

print(result)
# (1, 7)
```

Можно распаковать:

```python
minimum, maximum = min_max(
    [3, 1, 7]
)
```

---

# 10.1. Когда это удобно

Для небольшой логически связанной группы:

```python
quotient, remainder = divmod(10, 3)
```

---

# 10.2. Когда лучше отдельная структура

Если возвращаемых полей много и у них есть предметный смысл:

```text
user_id
total
currency
processed_count
skipped_count
```

tuple становится неочевидным.

Позже лучше использовать:

- `dataclass`;
- `NamedTuple`;
- Pydantic model;
- отдельный result object.

---

# 11. Ссылки, mutation и аргументы функций

Это нужно понимать очень уверенно.

```python
def mutate(items):
    items.append(3)
```

```python
data = [1, 2]
mutate(data)

print(data)
# [1, 2, 3]
```

Параметр `items` и имя `data` ссылались на один list.

---

# 11.1. Rebinding внутри функции

```python
def replace(items):
    items = [100]
```

```python
data = [1, 2]

replace(data)

print(data)
# [1, 2]
```

Почему?

Внутри функции:

```python
items = [100]
```

лишь перепривязало локальное имя `items`.

Исходный list не изменился.

---

# 11.2. Не «pass by reference» в упрощённом смысле

Фразы вроде:

> Python передаёт всё по ссылке

часто создают неправильную mental model.

Более точное описание:

> при вызове функции параметр связывается с тем же объектом, который передан аргументом.

Иногда это называют:

```text
call by sharing
```

или:

```text
pass-by-object-reference
```

Главное — понимать поведение объектов и имён, а не спорить о ярлыке.

---

# 12. Контракт функции

**Контракт** — набор ожиданий между функцией и вызывающим кодом.

Хороший контракт отвечает:

1. Что принимает функция?
2. Какие значения допустимы?
3. Что возвращает?
4. Может ли вернуть `None`?
5. Какие исключения возможны?
6. Мутирует ли вход?
7. Есть ли side effects?
8. Что происходит на edge cases?

---

# 12.1. Пример слабого контракта

```python
def parse_age(value):
    if bad(value):
        return "invalid"

    return int(value)
```

Функция возвращает:

```text
int | str
```

Вызывающий код обязан постоянно выяснять, что пришло.

---

# 12.2. Возможный более ясный контракт

```python
def parse_age(value):
    if invalid(value):
        raise ValueError(
            "invalid age"
        )

    return int(value)
```

Теперь:

```text
успех → int
ошибка → exception
```

Контракт стал проще.

---

# 12.3. `None` тоже может быть хорошим контрактом

Например:

```python
def find_user(...):
    ...
```

может возвращать:

```text
User | None
```

если «не найден» — ожидаемое состояние.

Важно не то, что один подход всегда лучше, а то, что контракт должен быть осознанным.

---

# 13. Значения по умолчанию

```python
def power(base, exponent=2):
    return base ** exponent
```

Вызов:

```python
power(5)
# 25
```

или:

```python
power(5, 3)
# 125
```

Default нужен, когда существует разумное стандартное поведение.

---

# 13.1. Важнейший факт: default вычисляется при выполнении `def`

Это значит:

```python
def func(value=some_expression()):
    ...
```

`some_expression()` обычно вычисляется в момент создания функции, а не при каждом вызове.

Это и объясняет mutable-default bug.

---

# 14. Mutable default arguments

Плохой пример:

```python
def add_item(
    item,
    items=[],
):
    items.append(item)
    return items
```

Первый вызов:

```python
add_item(1)
# [1]
```

Второй:

```python
add_item(2)
# [1, 2]
```

Почему?

Пустой list был создан один раз при выполнении `def`.

Параметр по умолчанию каждый раз использует тот же объект.

---

# 14.1. Правильная mental model

Не:

> функция каждый раз создаёт `[]`.

А:

```text
момент def:
    создаётся list []

вызов 1:
    используется тот же list
    append(1)

вызов 2:
    используется тот же list
    append(2)
```

---

# 14.2. Стандартный паттерн

```python
def add_item(
    item,
    items=None,
):
    if items is None:
        items = []

    items.append(item)
    return items
```

Теперь новый list создаётся внутри вызова, когда аргумент не передан.

---

# 14.3. Точное правило

Не нужно заучивать слишком грубое:

> mutable нельзя использовать как default никогда.

Точнее:

> не используй mutable default, если не хочешь намеренно разделять одно состояние между вызовами.

Такое намеренное поведение бывает, но редко и должно быть очевидным.

---

# 15. `None` как sentinel

**Sentinel** — специальное значение-маркер, означающее отдельное состояние.

Часто:

```python
None
```

используется как:

```text
аргумент не передан / значение отсутствует
```

Пример:

```python
def connect(timeout=None):
    if timeout is None:
        timeout = DEFAULT_TIMEOUT
```

---

# 15.1. Когда `None` недостаточно

Что если `None` — допустимое реальное значение?

Тогда нужно отличать:

```text
не передано
```

от:

```text
передано None
```

Можно создать уникальный sentinel:

```python
_MISSING = object()
```

```python
def func(value=_MISSING):
    if value is _MISSING:
        ...
```

Почему `is`?

Потому что sentinel определяется identity уникального объекта.

---

# 16. `*args`

Сигнатура:

```python
def func(*args):
    ...
```

собирает дополнительные позиционные аргументы в tuple.

```python
def show(*args):
    print(args)

show(1, 2, 3)
```

Вывод:

```python
(1, 2, 3)
```

---

# 16.1. `args` — соглашение, не ключевое слово

Работает:

```python
def total(*numbers):
    return sum(numbers)
```

Здесь `numbers` даже информативнее.

Магию делает:

```python
*
```

---

# 16.2. Вместе с обычными параметрами

```python
def func(first, *rest):
    print(first)
    print(rest)
```

Вызов:

```python
func(1, 2, 3, 4)
```

Binding:

```text
first → 1
rest  → (2, 3, 4)
```

---

# 17. `**kwargs`

```python
def func(**kwargs):
    print(kwargs)
```

```python
func(
    timeout=5,
    retries=3,
)
```

Внутри:

```python
{
    "timeout": 5,
    "retries": 3,
}
```

`kwargs` — dict.

---

# 17.1. `kwargs` тоже соглашение

Можно:

```python
def func(**options):
    ...
```

Но `kwargs` — общеизвестное имя для generic named arguments.

---

# 17.2. Не скрывай контракт без причины

Плохо:

```python
def create_user(**kwargs):
    ...
```

если реально обязательны:

```text
name
email
age
```

Лучше:

```python
def create_user(
    name,
    email,
    age,
):
    ...
```

Явная сигнатура — часть документации и проверки контракта.

---

# 18. Positional-only параметры

Синтаксис `/`:

```python
def func(a, b, /, c):
    ...
```

Все параметры **до `/`** можно передать только позиционно.

Допустимо:

```python
func(1, 2, 3)
```

Но нельзя:

```python
func(
    a=1,
    b=2,
    c=3,
)
```

для `a` и `b`.

---

# 18.1. Зачем positional-only

Это позволяет API не обещать стабильность имён внутренних параметров.

Некоторые built-in функции используют такой контракт.

В application-коде встречается реже, но читать сигнатуры ты обязан.

---

# 19. Keyword-only параметры

Параметры после `*` должны передаваться по имени.

```python
def send_request(
    url,
    *,
    timeout=5,
    retries=3,
):
    ...
```

Правильно:

```python
send_request(
    "/tickets",
    timeout=10,
    retries=2,
)
```

Нельзя:

```python
send_request(
    "/tickets",
    10,
    2,
)
```

---

# 19.1. Почему keyword-only полезны

Сравни:

```python
connect(host, 5, 3, True)
```

и:

```python
connect(
    host,
    timeout=5,
    retries=3,
    verify_ssl=True,
)
```

Второй вызов почти не требует дополнительной документации.

---

# 20. Полная модель параметров

Категории параметров Python:

1. positional-only;
2. positional-or-keyword;
3. var-positional (`*args`);
4. keyword-only;
5. var-keyword (`**kwargs`).

Пример:

```python
def func(
    a,
    b,
    /,
    c,
    d=10,
    *args,
    e,
    f=20,
    **kwargs,
):
    ...
```

Здесь:

```text
a, b       → positional-only
c, d       → positional-or-keyword
args       → дополнительные positional
e, f       → keyword-only
kwargs     → дополнительные keyword
```

Не нужно искусственно писать такие сложные сигнатуры.

Но ты должен уметь их читать.

---

# 21. Распаковка `*` при вызове

```python
def add(a, b):
    return a + b
```

```python
values = [2, 3]

add(*values)
```

Эквивалентно:

```python
add(2, 3)
```

---

# 22. Распаковка `**` при вызове

```python
def create_user(name, age):
    ...
```

```python
data = {
    "name": "Alice",
    "age": 25,
}
```

```python
create_user(**data)
```

Эквивалентно:

```python
create_user(
    name="Alice",
    age=25,
)
```

Ключи dict должны соответствовать именам принимаемых keyword parameters.

---

# 22.1. Практическая польза

Например, есть config:

```python
options = {
    "timeout": 5,
    "retries": 3,
}
```

и функция:

```python
request(
    url,
    **options,
)
```

Но использовать это стоит только когда структура данных и сигнатура действительно согласованы.

---

# 23. Функции высшего порядка

**Higher-order function** — функция, которая:

- принимает функцию как аргумент;
- и/или возвращает функцию.

Пример:

```python
def apply(func, value):
    return func(value)
```

```python
def double(value):
    return value * 2
```

```python
apply(double, 5)
# 10
```

---

# 23.1. Где это встречается

- `sorted(key=...)`;
- `map`;
- `filter`;
- decorators;
- callbacks;
- retry wrappers;
- dependency injection;
- event handlers.

---

# 24. `lambda`

`lambda` создаёт маленькую анонимную функцию.

```python
lambda x: x * 2
```

Эквивалент по смыслу простому:

```python
def double(x):
    return x * 2
```

Но lambda ограничена **одним выражением**.

---

# 24.1. Хороший сценарий

```python
sorted(
    users,
    key=lambda user: user["age"],
)
```

Функция нужна локально, короткая и очевидная.

---

# 24.2. Плохой сценарий

```python
validate_order = lambda order: (
    complicated_logic(...)
)
```

Если логика важна и имеет предметное имя, обычный `def` обычно лучше.

---

# 24.3. Не использовать lambda ради краткости

Вот это:

```python
status = (
    lambda value: value == "pass"
)(status)
```

хуже, чем:

```python
status = status == "pass"
```

Краткость синтаксиса не равна качеству кода.

---

# 25. `sorted(..., key=...)`

`key` получает функцию.

Для каждого элемента Python вычисляет ключ сортировки.

```python
people = [
    {"name": "Anna", "age": 20},
    {"name": "Boris", "age": 25},
]
```

```python
sorted_people = sorted(
    people,
    key=lambda person: person["age"],
)
```

Важно передавать **функцию**, а не вызывать её заранее.

Правильно:

```python
key=get_age
```

Не:

```python
key=get_age()
```

если `get_age` ожидает элемент.

---

# 26. `map`

```python
map(func, iterable)
```

применяет `func` к элементам iterable.

```python
values = ["1", "2", "3"]

converted = map(int, values)
```

`map` возвращает **iterator**, а не готовый list.

```python
list(converted)
# [1, 2, 3]
```

---

# 26.1. List comprehension часто читается лучше

```python
converted = [
    int(value)
    for value in values
]
```

В современном Python это часто предпочтительнее для простой трансформации.

Но `map` нужно уверенно читать и понимать его lazy nature.

---

# 27. `filter`

```python
filter(predicate, iterable)
```

оставляет элементы, для которых predicate truthy.

```python
numbers = [1, 2, 3, 4]

even = filter(
    lambda x: x % 2 == 0,
    numbers,
)
```

```python
list(even)
# [2, 4]
```

Comprehension:

```python
even = [
    x
    for x in numbers
    if x % 2 == 0
]
```

часто проще читается.

---

# 28. `zip`

```python
names = ["Alice", "Bob"]
ages = [30, 22]
```

```python
for name, age in zip(
    names,
    ages,
):
    print(name, age)
```

`zip` возвращает iterator пар.

---

# 28.1. Обычный zip обрезается

```python
names = [
    "Alice",
    "Bob",
    "Charlie",
]

ages = [30, 22]
```

Обычный `zip` проигнорирует лишний `"Charlie"`.

Если длины обязаны совпадать:

```python
zip(
    names,
    ages,
    strict=True,
)
```

даст `ValueError` при расхождении.

Это полезно для валидации согласованных данных.

---

# 29. `any`

```python
any(iterable)
```

возвращает `True`, если хотя бы один элемент truthy.

```python
orders = [
    {"status": "cancelled"},
    {"status": "paid"},
]
```

```python
has_paid = any(
    order["status"] == "paid"
    for order in orders
)
```

---

# 29.1. Short-circuit

`any` останавливается, как только найден truthy-элемент.

Это значит, что generator не обязан вычисляться до конца.

---

# 30. `all`

```python
all(iterable)
```

возвращает `True`, если все элементы truthy.

```python
all_valid = all(
    order["amount"] > 0
    for order in orders
)
```

Останавливается на первом falsy.

---

# 30.1. Важные edge cases

```python
any([])
# False
```

```python
all([])
# True
```

Почему `all([]) == True`?

Потому что в пустом наборе нет элемента, нарушающего условие.

Это называется vacuous truth.

Для программирования достаточно запомнить контракт built-in функции.



---

# 31. Scope и namespace

Эти понятия связаны, но не одно и то же.

## Namespace

**Namespace** — отображение:

```text
имя → объект
```

Например, в глобальном namespace может существовать:

```text
"timeout" → 5
"process" → function object
```

## Scope

**Scope** — область программы, из которой конкретное имя доступно без дополнительной квалификации.

Проще:

> namespace хранит связи имён с объектами, scope определяет, где эти имена видны.

---

# 32. LEGB

Python ищет обычное имя примерно по цепочке:

```text
L → Local
E → Enclosing
G → Global
B → Built-in
```

Это правило **LEGB**.

---

# 32.1. Local

```python
def func():
    value = 10
    print(value)
```

`value` локален для вызова `func`.

Снаружи:

```python
print(value)
```

получим:

```text
NameError
```

---

# 32.2. Enclosing

```python
def outer():
    value = "outer"

    def inner():
        return value

    return inner()
```

`inner` не находит `value` локально и ищет во внешней функции.

---

# 32.3. Global

```python
TIMEOUT = 5

def show_timeout():
    return TIMEOUT
```

Функция может читать глобальное имя.

---

# 32.4. Built-in

Если имя не найдено раньше, Python может найти built-in:

```python
len
print
sum
max
```

Поэтому не стоит делать:

```python
len = 10
```

Иначе встроенная функция `len` будет затенена в текущем scope.

---

# 33. Важная тонкость локальных переменных

Если внутри функции есть присваивание имени, Python рассматривает это имя как локальное, если не указано `global` или `nonlocal`.

Пример:

```python
value = 10

def func():
    print(value)
    value = 20
```

Можно ожидать, что первая строка прочитает глобальное `value`.

Но Python видит локальное присваивание:

```python
value = 20
```

и считает `value` локальным во всей функции.

Поэтому:

```python
print(value)
```

пытается читать локальное имя до присваивания.

Получим:

```text
UnboundLocalError
```

Это важный interview edge case.

---

# 34. `global`

```python
counter = 0

def increment():
    global counter
    counter += 1
```

`global` говорит:

> операции с именем `counter` внутри функции должны использовать глобальный binding.

---

# 34.1. Почему global часто ухудшает код

Функция:

```python
def increment():
    global counter
    counter += 1
```

имеет скрытую зависимость от внешнего состояния.

Тестировать и переиспользовать её труднее.

Часто лучше:

```python
def increment(counter):
    return counter + 1
```

Теперь зависимости явны.

---

# 34.2. Когда global допустим

Иногда для:

- простого module-level cache;
- константного конфигурационного окружения;
- маленьких scripts;
- специальных low-level случаев.

Но mutable global state в application-коде требует осторожности, особенно при concurrency.

---

# 35. `nonlocal`

`nonlocal` работает с ближайшим подходящим binding во внешнем function scope.

```python
def make_counter():
    value = 0

    def increment():
        nonlocal value
        value += 1
        return value

    return increment
```

```python
counter = make_counter()

counter()
# 1

counter()
# 2
```

---

# 35.1. `global` vs `nonlocal`

```text
global   → модульный/global scope
nonlocal → enclosing function scope
```

---

# 36. Замыкание

**Closure — замыкание** — функция, которая сохраняет доступ к значениям из окружающей области видимости после завершения внешней функции.

```python
def make_multiplier(multiplier):
    def multiply(value):
        return value * multiplier

    return multiply
```

```python
double = make_multiplier(2)
triple = make_multiplier(3)
```

Даже после завершения `make_multiplier`:

```python
double(10)
# 20
```

внутренняя функция продолжает иметь доступ к своему `multiplier`.

---

# 36.1. Mental model

Вызов:

```python
make_multiplier(2)
```

создаёт окружение примерно:

```text
multiplier → 2
```

и function object `multiply`, которому это окружение нужно.

Когда function возвращается наружу, необходимое окружение продолжает жить.

---

# 36.2. Замыкание — не магическое копирование значений

Обычно внутренняя функция сохраняет связь с binding, а не просто «фотографирует значение».

Это приводит к late binding.

---

# 37. Late binding

Пример:

```python
callbacks = []

for i in range(3):
    callbacks.append(
        lambda: i
    )
```

Можно ожидать:

```python
0
1
2
```

Но:

```python
[
    callback()
    for callback in callbacks
]
```

даст:

```python
[2, 2, 2]
```

---

# 37.1. Почему

Все lambda обращаются к одному binding `i`.

Они читают его **в момент вызова**.

К моменту вызова цикл завершился и:

```python
i == 2
```

---

# 37.2. Один способ зафиксировать текущее значение

```python
callbacks = []

for i in range(3):
    callbacks.append(
        lambda i=i: i
    )
```

Почему работает?

Default argument вычисляется при создании каждой lambda.

Для каждой функции создаётся своё default-значение.

---

# 37.3. Более читаемый вариант

```python
def make_callback(value):
    def callback():
        return value

    return callback
```

```python
callbacks = [
    make_callback(i)
    for i in range(3)
]
```

Иногда обычная функция понятнее трюка с default argument.

---

# 38. Рекурсия

**Рекурсивная функция** — функция, которая прямо или косвенно вызывает сама себя.

Пример:

```python
def factorial(n):
    if n == 0:
        return 1

    return n * factorial(n - 1)
```

---

# 38.1. Два обязательных элемента

Хорошая рекурсия обычно имеет:

1. **base case** — условие остановки;
2. **recursive step** — переход к меньшей/более простой подзадаче.

---

# 38.2. Base case

```python
if n == 0:
    return 1
```

останавливает рекурсию.

Без него:

```python
def broken():
    return broken()
```

получим:

```text
RecursionError
```

---

# 38.3. Recursive step

```python
return n * factorial(n - 1)
```

задача уменьшается:

```text
factorial(3)
↓
factorial(2)
↓
factorial(1)
↓
factorial(0)
```

---

# 39. Call stack

Каждый обычный вызов функции создаёт frame выполнения.

Упрощённо frame содержит:

- локальные bindings;
- место возврата;
- текущее состояние выполнения.

При:

```python
factorial(3)
```

stack растёт:

```text
factorial(3)
factorial(2)
factorial(1)
factorial(0)
```

Затем разворачивается обратно.

---

# 39.1. Почему stack важен не только для рекурсии

Traceback:

```text
func_a
  → func_b
      → func_c
          → error
```

фактически показывает цепочку вызовов stack frames.

Понимание call stack помогает:

- читать traceback;
- отлаживать;
- понимать локальные variables;
- понимать recursion.

---

# 39.2. Ограничение рекурсии

Python ограничивает глубину обычной рекурсии.

Это защищает процесс от бесконтрольного роста C/Python call stack.

Не нужно пытаться использовать recursion для миллионов уровней.

---

# 39.3. Python не делает tail-call optimization

Даже если recursive call находится последней операцией, Python обычно не превращает его автоматически в цикл.

Поэтому для многих линейных задач:

```python
for
while
```

практичнее.

---

# 39.4. Где рекурсия естественна

- деревья;
- DFS;
- вложенные структуры;
- рекурсивные грамматики;
- divide-and-conquer алгоритмы.

---

# 40. Пример обхода дерева

```python
tree = {
    "value": 5,
    "children": [
        {
            "value": 3,
            "children": [],
        },
        {
            "value": 2,
            "children": [
                {
                    "value": -1,
                    "children": [],
                }
            ],
        },
    ],
}
```

Проверка отрицательного значения:

```python
def contains_negative(node):
    if node["value"] < 0:
        return True

    for child in node["children"]:
        if contains_negative(child):
            return True

    return False
```

Здесь естественная структура данных сама рекурсивна:

```text
node
 └─ children
     └─ node
```

поэтому recursion хорошо соответствует модели.

---

# 41. Iterable, iterator и generator

Эти три понятия нужно различать.

## Iterable

Объект, из которого можно получить iterator.

Примеры:

```python
list
tuple
str
dict
set
range
file
```

## Iterator

Объект, который хранит состояние текущего обхода и выдаёт следующий элемент через:

```python
next(iterator)
```

## Generator

Специальный вид iterator, созданный generator expression или generator function.

---

# 41.1. `iter()` и `next()`

```python
values = [10, 20, 30]

iterator = iter(values)
```

```python
next(iterator)
# 10
```

```python
next(iterator)
# 20
```

После конца:

```python
next(iterator)
```

даёт:

```text
StopIteration
```

---

# 41.2. Iterator обычно одноразовый

После полного обхода он исчерпан.

Это отличает его от list, по которому можно снова вызвать `iter()` и получить новый iterator.

---

# 42. Generator expression

```python
squares = (
    x * x
    for x in range(5)
)
```

Это generator object.

Значения не создаются все сразу.

Они вычисляются по запросу.

---

# 42.1. List comprehension vs generator expression

```python
[
    x * x
    for x in range(1_000_000)
]
```

создаёт list из миллиона значений.

А:

```python
(
    x * x
    for x in range(1_000_000)
)
```

хранит состояние вычисления и отдаёт элементы лениво.

---

# 42.2. Lazy evaluation

**Lazy** означает:

> вычислять значение тогда, когда оно реально понадобилось.

Это может уменьшить память и позволить начать обработку раньше.

---

# 42.3. Generator exhaustion

```python
values = (
    x
    for x in range(3)
)
```

```python
list(values)
# [0, 1, 2]
```

Теперь:

```python
list(values)
# []
```

Generator исчерпан.

---

# 43. Generator function и `yield`

Функция с `yield` становится generator function.

```python
def generate_numbers():
    yield 1
    yield 2
    yield 3
```

Вызов:

```python
generator = generate_numbers()
```

не выполняет функцию целиком и не возвращает `1`.

Он создаёт generator object.

---

# 43.1. Что делает `yield`

`yield`:

1. отдаёт значение наружу;
2. приостанавливает выполнение функции;
3. сохраняет локальное состояние;
4. следующий `next()` продолжает выполнение после `yield`.

---

# 43.2. Пример пошагово

```python
def demo():
    print("A")
    yield 1

    print("B")
    yield 2
```

```python
g = demo()
```

Пока ничего не напечатано.

Первый:

```python
next(g)
```

вывод:

```text
A
```

результат:

```python
1
```

Второй:

```python
next(g)
```

вывод:

```text
B
```

результат:

```python
2
```

---

# 43.3. `return` в generator function

В generator `return` означает:

> завершить генерацию.

```python
def gen():
    yield 1
    return
```

Следующий запрос после `1` приводит к `StopIteration`.

Технически:

```python
return value
```

может передать `value` внутрь `StopIteration.value`, но обычный `for` это значение не использует как очередной yielded element.

Не путай:

```python
yield value
```

с:

```python
return value
```

---

# 44. Generator для больших данных

Например:

```python
def iter_non_empty_lines(file):
    for line in file:
        line = line.strip()

        if line:
            yield line
```

Плюсы:

- не строим дополнительный list;
- можно обработать очень большой файл;
- результат начинает поступать сразу.

---

# 44.1. Батчи

```python
def iter_batches(
    iterable,
    batch_size,
):
    if batch_size <= 0:
        raise ValueError(
            "batch_size must be positive"
        )

    batch = []

    for item in iterable:
        batch.append(item)

        if len(batch) == batch_size:
            yield batch
            batch = []

    if batch:
        yield batch
```

Это production-relevant pattern для:

- bulk database inserts;
- API batches;
- message processing.

---

# 45. `yield from`

`yield from` делегирует выдачу элементов другому iterable/generator.

Вместо:

```python
def chain(a, b):
    for item in a:
        yield item

    for item in b:
        yield item
```

можно:

```python
def chain(a, b):
    yield from a
    yield from b
```

---

# 45.1. Это не просто syntactic sugar во всех деталях

Для простого чтения достаточно:

> `yield from iterable` отдаёт наружу элементы iterable.

Но protocol также умеет делегировать более сложное взаимодействие generator'ов.

На первом проходе этого достаточно.

---

# 46. Generator lifecycle

У generator есть состояния: до запуска, приостановлен, завершён.

Основные операции:

```python
next(generator)
```

```python
generator.close()
```

Есть и более продвинутые:

```python
generator.send(value)
generator.throw(exc)
```

Для большинства backend-задач достаточно уверенно знать `yield`, iteration, exhaustion и `close`.

---

# 46.1. `send`

Generator может получить значение в выражение `yield`.

Пример:

```python
def receiver():
    value = yield "ready"
    yield value
```

Это уже coroutine-like механизм старого стиля.

Для современного async Python обычно важнее `async/await`, поэтому не надо превращать `send` в приоритетную тему.

---

# 47. Декораторы

**Декоратор** — callable, который получает другой callable и возвращает новый callable или модифицированный объект.

Базовая форма:

```python
def decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper
```

---

# 47.1. Синтаксис `@`

```python
@decorator
def add(a, b):
    return a + b
```

примерно эквивалентен:

```python
def add(a, b):
    return a + b

add = decorator(add)
```

Это очень важная mental model.

---

# 47.2. Что происходит по шагам

1. создаётся исходный function object `add`;
2. он передаётся в `decorator`;
3. `decorator` возвращает другой callable;
4. имя `add` связывается уже с результатом декорирования.

---

# 47.3. Зачем декораторы

Cross-cutting concerns:

- logging;
- metrics;
- retry;
- caching;
- authorization;
- tracing;
- validation;
- transaction boundaries.

Но декоратор не должен скрывать критически важное поведение так, что код становится магическим и непредсказуемым.

---

# 48. Правильный wrapper

```python
def decorator(func):
    def wrapper(*args, **kwargs):
        result = func(
            *args,
            **kwargs,
        )

        return result

    return wrapper
```

Если забыть:

```python
return result
```

декорированная функция внезапно начнёт возвращать:

```python
None
```

---

# 49. `functools.wraps`

Наивный wrapper теряет metadata исходной функции.

```python
def decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper
```

После декорирования:

```python
add.__name__
```

может быть:

```python
"wrapper"
```

---

# 49.1. Почему metadata важна

Её используют:

- документация;
- introspection;
- debugging;
- frameworks;
- FastAPI-like системы;
- test tooling.

---

# 49.2. Стандартный шаблон

```python
from functools import wraps

def decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper
```

`wraps` копирует/связывает полезную metadata и устанавливает `__wrapped__`.

---

# 50. Декоратор timing

```python
from functools import wraps
from time import perf_counter

def measure_time(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        started = perf_counter()

        try:
            return func(
                *args,
                **kwargs,
            )
        finally:
            elapsed = (
                perf_counter()
                - started
            )

            print(
                f"{func.__name__}: "
                f"{elapsed:.6f}s"
            )

    return wrapper
```

---

# 50.1. Почему `perf_counter`

Для измерения elapsed duration лучше использовать monotonic high-resolution clock.

`perf_counter()` предназначен именно для измерения интервалов времени.

---

# 50.2. Почему `finally`

Мы хотим измерить время даже если исходная функция выбросила exception.

`finally` выполняется при нормальном возврате и при исключении.

---

# 51. Декоратор с параметрами

Синтаксис:

```python
@retry(attempts=3)
def fetch():
    ...
```

означает более глубокую структуру:

```text
retry(attempts=3)
↓
decorator
↓
получает fetch
↓
возвращает wrapper
```

---

# 51.1. Пример

```python
from functools import wraps

def repeat(times):
    if times < 1:
        raise ValueError(
            "times must be >= 1"
        )

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = None

            for _ in range(times):
                result = func(
                    *args,
                    **kwargs,
                )

            return result

        return wrapper

    return decorator
```

---

# 52. Несколько декораторов

```python
@a
@b
def func():
    ...
```

примерно:

```python
func = a(b(func))
```

То есть ближайший к функции декоратор применяется первым.

Mental model:

```text
func
↓ b
b(func)
↓ a
a(b(func))
```

Порядок может существенно менять поведение.

---

# 53. Retry-декоратор и reliability

Плохой вариант:

```python
except Exception:
    retry()
```

Почему опасно?

Не каждая ошибка временная.

Не нужно retry:

- invalid input;
- `TypeError` из-за бага;
- authentication failure;
- permission denied;
- deterministic validation error.

---

# 53.1. Retry оправдан для transient failures

Например:

- timeout;
- temporary network reset;
- HTTP 502/503;
- временная недоступность dependency.

---

# 53.2. Retry требует контракта

Нужно определить:

- какие exceptions повторяем;
- сколько попыток;
- delay;
- exponential backoff;
- jitter;
- logging;
- timeout budget;
- idempotency операции.

---

# 53.3. Idempotency

**Идемпотентная операция** — повторное выполнение с теми же данными не создаёт дополнительных нежелательных эффектов.

GET часто идемпотентен по смыслу.

Создание платежа через POST может не быть идемпотентным.

Автоматический retry:

```text
создать платёж
```

может создать два платежа, если первый запрос дошёл до сервера, но ответ потерялся.

Поэтому retry и idempotency связаны напрямую.

---

# 54. Полезные инструменты `functools`

## `partial`

Позволяет заранее зафиксировать часть аргументов.

```python
from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(
    power,
    exponent=2,
)
```

```python
square(5)
# 25
```

---

# 54.1. Когда partial полезен

Когда API ожидает callable определённой формы, а у тебя есть более общая функция.

Но не стоит применять `partial`, если обычная named function читается лучше.

---

# 54.2. `cache`

```python
from functools import cache
```

Кэширует результаты вызовов на основе hashable arguments.

```python
@cache
def expensive(x):
    ...
```

При повторном вызове с теми же arguments функция может не вычисляться заново.

---

# 54.3. Опасности cache

- память растёт;
- arguments должны быть hashable;
- функция должна быть достаточно детерминированной;
- side effects могут ломать ожидания;
- external state может измениться.

Не кэшируй функцию, если её результат должен зависеть от актуальной базы/времени, если cache invalidation не продуман.

---

# 54.4. `lru_cache`

```python
from functools import lru_cache
```

Позволяет ограничивать cache:

```python
@lru_cache(maxsize=128)
def func(x):
    ...
```

---

# 54.5. `reduce`

```python
from functools import reduce
```

Сворачивает iterable в одно значение.

```python
reduce(
    lambda a, b: a + b,
    [1, 2, 3],
)
# 6
```

Но для суммы:

```python
sum(...)
```

намного понятнее.

`reduce` нужен реже, чем его любят показывать в курсах.

---

# 55. Type hints

Type hints делают контракт явнее.

```python
def calculate_total(
    amounts: list[float],
) -> float:
    return sum(amounts)
```

Аннотации помогают:

- IDE;
- static type checker;
- code review;
- документации;
- framework'ам.

---

# 55.1. Type hints не гарантируют runtime type safety

```python
def double(value: int) -> int:
    return value * 2
```

Можно вызвать:

```python
double("a")
```

Python сам по аннотации не обязан остановить вызов.

Аннотация — metadata/контракт для tooling, а не встроенная runtime validation.

---

# 55.2. Runtime validation — отдельная задача

Её может делать:

- собственный код;
- Pydantic;
- framework;
- validators;
- schema layer.

---

# 56. Современные union types

```python
def normalize(
    value: int | float,
) -> float:
    ...
```

Возврат optional:

```python
def find_user(
    user_id: int,
) -> User | None:
    ...
```

---

# 56.1. Не делай union слишком широким

Плохо:

```python
int | str | float | bool | dict | None
```

если это просто маскирует слабый контракт.

Type hints полезны тогда, когда отражают реальную модель.

---

# 57. `Callable`

```python
from collections.abc import Callable
```

Пример:

```python
def apply(
    func: Callable[[int], str],
    value: int,
) -> str:
    return func(value)
```

Значение:

```text
func принимает int
и возвращает str
```

---

# 57.1. Callable без параметров

```python
operation: Callable[[], str]
```

Означает:

```text
не принимает аргументов
возвращает str
```

---

# 58. `Iterable`, `Iterator`, `Generator` в type hints

```python
from collections.abc import (
    Iterable,
    Iterator,
)
```

Если функция только перебирает вход:

```python
def total(
    values: Iterable[int],
) -> int:
    return sum(values)
```

Это гибче:

```python
list[int]
```

потому что принимает:

- list;
- tuple;
- range;
- generator;
- другие iterable.

---

# 58.1. Возврат iterator

```python
def iter_ids(
    users: Iterable[dict],
) -> Iterator[int]:
    for user in users:
        yield user["id"]
```

---

# 58.2. Не делай тип шире без причины

Если функция требует:

```python
values.append(...)
```

ей нужен mutable sequence/list-like контракт, а не просто `Iterable`.

Type должен отражать реально используемые возможности.

---

# 59. `TypedDict`

Если dict имеет фиксированную структуру:

```python
from typing import TypedDict

class Order(TypedDict):
    id: int
    user_id: int
    amount: float
    status: str
```

Теперь:

```python
def process_order(
    order: Order,
) -> None:
    ...
```

информативнее, чем:

```python
dict[str, object]
```

---

# 59.1. TypedDict — static description

Это не делает обычный dict настоящим runtime class object с автоматической validation.

Для runtime schema в backend часто используют Pydantic models.

---

# 60. `Protocol`

**Protocol** описывает требуемое поведение, а не конкретный класс.

```python
from typing import Protocol

class Sender(Protocol):
    def send(
        self,
        message: str,
    ) -> None:
        ...
```

Функция:

```python
def notify(
    sender: Sender,
    message: str,
) -> None:
    sender.send(message)
```

Подходит любой объект с совместимым `send`.

Это называется структурной типизацией.

---

# 60.1. Зачем Protocol backend-разработчику

Помогает проектировать границы:

```text
service зависит не от ConcreteEmailSender,
а от поведения Sender
```

Это улучшает:

- тестируемость;
- заменяемость dependency;
- архитектурные границы.

Глубокие generics и `ParamSpec` можно изучать после уверенной базы.

---

# 61. Docstrings

Docstring — строка документации непосредственно внутри объекта.

```python
def calculate_total(
    amounts: list[float],
) -> float:
    """Return the total of all amounts."""
    return sum(amounts)
```

Доступ:

```python
calculate_total.__doc__
```

или:

```python
help(calculate_total)
```

---

# 61.1. Docstring vs comment

Comment объясняет код разработчику:

```python
# обход нужен в обратном порядке
```

Docstring описывает контракт объекта:

```text
что делает функция
какие важные условия
что возвращает
какие ошибки возможны
```

---

# 61.2. Не документируй очевидность

Плохой docstring:

```python
def add(a, b):
    """Adds a and b."""
```

если всё и так абсолютно очевидно.

Docstring особенно полезен для:

- public API;
- tricky contract;
- side effects;
- units;
- exceptions;
- non-obvious limitations.

---

# 62. Side effects

**Side effect** — наблюдаемое взаимодействие функции с внешним состоянием помимо возвращаемого значения.

Примеры:

```python
print(...)
```

запись в файл:

```python
file.write(...)
```

изменение переданного list:

```python
items.append(...)
```

database write:

```python
repository.save(...)
```

HTTP request:

```python
client.post(...)
```

---

# 62.1. Pure-ish функция

```python
def calculate_tax(
    amount: float,
    rate: float,
) -> float:
    return amount * rate
```

При одинаковых inputs возвращает тот же result и не изменяет внешнее состояние.

Такие функции проще:

- тестировать;
- кэшировать;
- понимать;
- повторно использовать.

---

# 62.2. Side effects необходимы

Backend без side effects невозможен.

Нужно:

- сохранять в DB;
- отправлять ответы;
- логировать;
- вызывать API.

Цель не «убрать side effects», а:

> отделить вычисления от взаимодействия с внешним миром, где это разумно.

---

# 63. Исключения как часть контракта

Функция может завершиться:

```text
return result
```

или:

```text
raise exception
```

Оба варианта — часть её API.

---

# 63.1. Validation vs sentinel

Вариант:

```python
def parse_age(value):
    if invalid:
        return None
```

подходит, если отсутствие результата ожидаемо.

Вариант:

```python
raise ValueError(
    "invalid age"
)
```

подходит, если invalid value нарушает контракт.

---

# 63.2. Не возвращай строку ошибки вместо нормального типа без причины

Плохо:

```python
return "ERROR"
```

там, где обычно функция возвращает:

```python
int
```

Вызывающий код получает сложный union и легко забывает проверить.

---

# 64. Проектирование хороших функций

Хорошая функция имеет одну ясную ответственность.

Не магическое правило:

```text
не больше 20 строк
```

Размер сам по себе не определяет качество.

---

# 64.1. Признаки слишком большой функции

- несколько независимых ответственностей;
- много уровней вложенности;
- множество unrelated local variables;
- сложно придумать одно точное имя;
- тест требует огромного setup;
- одна часть может изменяться независимо от другой.

---

# 64.2. Хорошие имена

Функции обычно называют действием:

```python
calculate_total
validate_order
load_config
send_notification
parse_date
```

Плохие generic names:

```python
process
handle
do_stuff
work
```

Иногда `process_*` или `handle_*` нормальны, если предметный объект делает смысл очевидным:

```python
handle_payment_webhook
```

---

# 64.3. Не передавай флаг, который создаёт две разные функции без причины

Подозрительный API:

```python
save_user(
    user,
    send_email=True,
)
```

Если flag полностью меняет ответственность, иногда лучше разделить операции.

Но не каждый bool flag плох.

Нужно смотреть на cohesion функции.

---

# 64.4. Явные зависимости

Плохо:

```python
def calculate():
    global CONFIG
    global DB
    ...
```

Лучше:

```python
def calculate(
    config,
    repository,
):
    ...
```

или dependency injection через объект/closure/framework.

---

# 65. Production pattern: validation boundary

```python
def validate_amount(
    amount: object,
) -> float:
    if isinstance(amount, bool):
        raise ValueError(
            "bool is not a valid amount"
        )

    if not isinstance(
        amount,
        (int, float),
    ):
        raise ValueError(
            "amount must be numeric"
        )

    if amount <= 0:
        raise ValueError(
            "amount must be positive"
        )

    return float(amount)
```

Идея:

> invalid external data отсекается на понятной границе.

После validation внутренняя логика может работать с более сильными гарантиями.

---

# 66. Production pattern: normalization

```python
def normalize_status(
    status: str,
) -> str:
    return (
        status
        .strip()
        .lower()
    )
```

Лучше отделить normalization от database write.

---

# 67. Production pattern: dependency injection через функцию

```python
def process_ticket(
    ticket,
    send_notification,
):
    result = calculate(ticket)

    send_notification(result)

    return result
```

В тесте можно передать:

```python
fake_sender
```

без реальной сети.

Function-as-object здесь напрямую улучшает тестируемость.

---

# 68. Production pattern: transaction callback — осторожно

Иногда API выглядит:

```python
with transaction():
    result = operation()
```

или higher-order helper:

```python
run_in_transaction(operation)
```

Важно понимать:

- callback может выбросить exception;
- rollback должен быть определён;
- retry transaction может повторить side effects;
- внешние HTTP calls внутри transaction опасны из-за долгих locks.

Функции как аргументы мощны, но архитектурный контракт важнее синтаксиса.

---

# 69. Типичные ошибки

## Ошибка 1 — `print` вместо `return`

```python
def calculate():
    print(10)
```

потом:

```python
result = calculate() + 5
```

падает, потому что функция вернула `None`.

---

## Ошибка 2 — mutable default

```python
def func(items=[]):
    ...
```

неожиданно разделяет state между вызовами.

---

## Ошибка 3 — слишком широкий `**kwargs`

Скрывает обязательные inputs и ошибки spelling.

---

## Ошибка 4 — забытый return в wrapper

Декоратор меняет return contract на `None`.

---

## Ошибка 5 — late binding

Несколько callbacks читают один финальный binding.

---

## Ошибка 6 — считать generator коллекцией

Нельзя ожидать:

```python
len(generator)
generator[0]
```

как от list.

---

## Ошибка 7 — повторно использовать исчерпанный iterator

```python
list(iterator)
list(iterator)
```

второй вызов может быть пустым.

---

## Ошибка 8 — retry всех exceptions

Маскирует bugs и повторяет deterministic failures.

---

## Ошибка 9 — type hint считать validation

```python
value: int
```

не проверяет runtime input сам по себе.

---

## Ошибка 10 — скрытая mutation input

Функция выглядит как вычислительная, но незаметно меняет аргумент.

Контракт должен быть ясен.



---

# 70. Debugging

## Debug 1 — потерянный return

```python
def multiply(a, b):
    a * b
```

Почему:

```python
result = multiply(2, 3)
```

даёт:

```python
None
```

Исправь и объясни разницу между:

```python
a * b
```

как выражением и:

```python
return a * b
```

как контрактом функции.

---

## Debug 2 — mutation vs rebinding

```python
def update(items):
    items.append(3)
    items = [100]
```

```python
data = [1, 2]

update(data)

print(data)
```

Предскажи результат и объясни каждую строку через:

```text
mutation
re-binding
```

---

## Debug 3 — mutable default

```python
def collect(value, values=[]):
    values.append(value)
    return values
```

Напиши два вызова, которые демонстрируют баг.

Потом исправь через `None`.

---

## Debug 4 — `NoneType`

```python
def get_timeout(config):
    print(
        config.get("timeout")
    )
```

```python
timeout = get_timeout({
    "timeout": 5
})

if timeout > 0:
    ...
```

Почему ошибка возникает даже при наличии ключа?

---

## Debug 5 — kwargs скрыли typo

```python
def send_request(**kwargs):
    timeout = kwargs.get(
        "timeout",
        5,
    )
```

Вызывающий код ошибся:

```python
send_request(
    tiemout=20,
)
```

Почему функция молча использует `5`?

Как явная сигнатура могла бы поймать такую ошибку?

---

## Debug 6 — closure late binding

```python
callbacks = []

for i in range(3):
    callbacks.append(
        lambda: i
    )

print([
    callback()
    for callback in callbacks
])
```

Объясни результат и исправь минимум двумя способами.

---

## Debug 7 — generator exhaustion

```python
values = map(
    int,
    ["1", "2", "3"],
)

print(list(values))
print(list(values))
```

Почему второй вывод пустой?

---

## Debug 8 — decorator return

```python
def log_call(func):
    def wrapper(*args, **kwargs):
        print("calling")
        func(*args, **kwargs)

    return wrapper
```

```python
@log_call
def add(a, b):
    return a + b
```

Почему:

```python
add(2, 3)
```

возвращает `None`?

---

## Debug 9 — metadata

```python
def decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper
```

Почему:

```python
@decorator
def calculate():
    """Important function."""
    return 10
```

может потерять корректные:

```python
__name__
__doc__
```

Исправь через `wraps`.

---

## Debug 10 — опасный retry

```python
def retry(func):
    def wrapper():
        while True:
            try:
                return func()
            except Exception:
                pass

    return wrapper
```

Найди минимум пять production-проблем.

Ожидаемые темы:

- бесконечный retry;
- ловится любой `Exception`;
- bugs скрываются;
- нет delay;
- нет backoff;
- нет logging;
- нет timeout budget;
- операция может быть non-idempotent.

---

# 71. Code Reading

Не запускай код до ответа.

## Вопрос 1

```python
def func(value=[]):
    value.append(1)
    return value

a = func()
b = func()

print(a)
print(b)
print(a is b)
```

Предскажи точный результат.

---

## Вопрос 2

```python
value = 10

def func():
    value = 20
    return value

print(func())
print(value)
```

Какие два разных bindings существуют?

---

## Вопрос 3

```python
value = 10

def func():
    print(value)
    value = 20

func()
```

Почему это не печатает global `10`?

---

## Вопрос 4

```python
def outer(value):
    def inner():
        return value

    return inner

a = outer(1)
b = outer(2)

print(a())
print(b())
```

Почему closure не конфликтуют?

---

## Вопрос 5

```python
def decorator(func):
    print("decorate")

    def wrapper():
        print("wrapper")
        return func()

    return wrapper

@decorator
def hello():
    print("hello")

print("ready")
hello()
```

Предскажи точный порядок вывода.

---

## Вопрос 6

```python
def gen():
    print("start")
    yield 1
    print("middle")
    yield 2
    print("end")

g = gen()

print("created")
print(next(g))
print(next(g))
```

Когда выполняется каждая строка?

---

## Вопрос 7

```python
values = (
    x * 2
    for x in range(3)
)

print(sum(values))
print(list(values))
```

Почему второй результат пустой?

---

## Вопрос 8

```python
def a(func):
    def wrapper():
        print("A before")
        result = func()
        print("A after")
        return result

    return wrapper

def b(func):
    def wrapper():
        print("B before")
        result = func()
        print("B after")
        return result

    return wrapper

@a
@b
def run():
    print("RUN")

run()
```

Разверни декораторы вручную и предскажи вывод.

---

# 72. Практика — базовые функции

## Задача 1 — `return` vs `print`

Исправь:

```python
def calculate_total(
    price,
    quantity,
):
    print(
        price * quantity
    )
```

Требования:

- функция возвращает результат;
- ничего не печатает;
- calling code решает, что делать с результатом.

---

## Задача 2 — mutation contract

Реализуй две версии:

```python
def add_tag_in_place(
    tags,
    tag,
):
    ...
```

и:

```python
def with_tag(
    tags,
    tag,
):
    ...
```

Первая должна мутировать переданный list.

Вторая должна возвращать новый list и не изменять вход.

Напиши тесты, доказывающие разницу.

---

## Задача 3 — validation

Реализуй:

```python
def validate_amount(
    amount,
):
    ...
```

Правила:

- `bool` запрещён;
- допустим `int | float`;
- значение должно быть `> 0`;
- invalid → `ValueError`;
- valid → вернуть numeric value.

Объясни порядок проверок.

---

# 73. Практика — параметры

## Задача 4 — defaults

Реализуй:

```python
def build_url(
    host,
    path="/",
    *,
    https=True,
):
    ...
```

Примеры:

```python
build_url("example.com")
```

→

```text
https://example.com/
```

```python
build_url(
    "example.com",
    "/api",
    https=False,
)
```

→

```text
http://example.com/api
```

Объясни, почему `https` сделан keyword-only.

---

## Задача 5 — sentinel

Нужно различать:

```text
аргумент не передан
```

и:

```text
явно передан None
```

Реализуй:

```python
_MISSING = object()

def update_setting(
    value=_MISSING,
):
    ...
```

Функция должна возвращать разные сообщения для трёх состояний:

- `_MISSING`;
- `None`;
- любое другое значение.

---

## Задача 6 — `*args`

Реализуй:

```python
def average(*numbers):
    ...
```

Правила:

- минимум одно число;
- `bool` запрещён;
- invalid type → `TypeError`;
- вернуть среднее.

---

## Задача 7 — `**kwargs`

Реализуй учебную функцию:

```python
def build_context(**kwargs):
    return kwargs
```

Затем объясни, почему в реальном API:

```python
def create_user(**kwargs)
```

обычно хуже явной сигнатуры, если поля известны заранее.

---

# 74. Практика — функции как объекты

## Задача 8 — transform

Реализуй без `map`:

```python
def transform(
    values,
    func,
):
    ...
```

Пример:

```python
transform(
    [1, 2, 3],
    lambda x: x * 2,
)
```

→

```python
[2, 4, 6]
```

После решения перепиши через `map`.

Сравни читаемость.

---

## Задача 9 — predicate

Реализуй:

```python
def select(
    values,
    predicate,
):
    ...
```

Без `filter`.

Затем перепиши через `filter`.

---

## Задача 10 — sorter

Есть:

```python
tickets = [
    {
        "id": 1,
        "priority": 2,
        "created_at": 30,
    },
    {
        "id": 2,
        "priority": 1,
        "created_at": 50,
    },
    {
        "id": 3,
        "priority": 1,
        "created_at": 10,
    },
]
```

Отсортируй по:

1. `priority`;
2. при равенстве — `created_at`.

Исходный list не менять.

---

# 75. Практика — any/all/zip

## Задача 11 — batch validation

```python
orders = [
    {"id": 1, "amount": 100},
    {"id": 2, "amount": 200},
]
```

Через:

```python
all(...)
```

проверить, что все amounts:

- numeric;
- не bool;
- `> 0`.

Сначала вынеси проверку одного amount в отдельную функцию.

---

## Задача 12 — first error

Через:

```python
any(...)
```

проверь, есть ли среди results хотя бы один:

```python
{"status": "error"}
```

Потом напиши обычный `for` с early return и сравни читаемость.

---

## Задача 13 — strict zip

Даны:

```python
user_ids = [1, 2, 3]
emails = [
    "a@example.com",
    "b@example.com",
]
```

Построй пары через:

```python
zip(..., strict=True)
```

и объясни, почему silent truncation здесь опасен.

---

# 76. Практика — scope и closure

## Задача 14 — LEGB

Дан код:

```python
value = "global"

def outer():
    value = "outer"

    def inner():
        value = "inner"
        return value

    return inner()

print(outer())
print(value)
```

Объясни каждый lookup через LEGB.

---

## Задача 15 — closure counter

Реализуй:

```python
def make_counter(
    start=0,
):
    ...
```

Использование:

```python
counter = make_counter(10)

counter()
# 11

counter()
# 12
```

Требования:

- без global;
- использовать closure;
- объяснить, зачем `nonlocal`.

---

## Задача 16 — multiplier factory

```python
double = make_multiplier(2)
triple = make_multiplier(3)
```

```python
double(10)
# 20

triple(10)
# 30
```

Объясни, где хранится `multiplier`.

---

## Задача 17 — late binding

Исправь:

```python
callbacks = [
    lambda: i
    for i in range(5)
]
```

минимум двумя способами.

---

# 77. Практика — recursion

## Задача 18 — factorial

Реализуй factorial.

Контракт:

- `n` — `int`, но не `bool`;
- `n >= 0`;
- invalid → подходящее exception.

После решения назови:

- base case;
- recursive case;
- что лежит в call stack для `factorial(4)`.

---

## Задача 19 — nested tree search

```python
tree = {
    "name": "root",
    "children": [
        {
            "name": "a",
            "children": [],
        },
        {
            "name": "b",
            "children": [
                {
                    "name": "target",
                    "children": [],
                }
            ],
        },
    ],
}
```

Реализуй:

```python
def contains_node(
    node,
    target,
):
    ...
```

Через recursion.

Используй early return.

---

# 78. Практика — generators

## Задача 20 — non-empty lines

```python
def iter_non_empty_lines(
    lines,
):
    ...
```

Требования:

- использовать `yield`;
- `strip`;
- пустые пропускать;
- list результата заранее не строить.

---

## Задача 21 — batches

```python
def iter_batches(
    iterable,
    size,
):
    ...
```

```python
list(
    iter_batches(
        range(7),
        3,
    )
)
```

→

```python
[
    [0, 1, 2],
    [3, 4, 5],
    [6],
]
```

`size <= 0` → `ValueError`.

---

## Задача 22 — flatten one level

Реализуй через:

```python
yield from
```

```python
def flatten(groups):
    ...
```

Вход:

```python
[
    [1, 2],
    [],
    [3, 4],
]
```

Выдаёт лениво:

```text
1, 2, 3, 4
```

---

# 79. Практика — decorators

## Задача 23 — log call

```python
@log_call
def add(a, b):
    return a + b
```

Decorator должен:

- использовать `wraps`;
- до вызова печатать имя функции;
- не менять return value;
- корректно пропускать `*args/**kwargs`.

---

## Задача 24 — count calls

```python
@count_calls
def calculate(...):
    ...
```

После вызовов:

```python
calculate.calls
```

должно содержать количество вызовов.

Подсказка:

атрибут можно хранить на wrapper function object.

---

## Задача 25 — retry

Реализуй:

```python
@retry(
    attempts=3,
    exceptions=(TimeoutError,),
)
def fetch():
    ...
```

Требования:

- `attempts >= 1`;
- retry только указанных exception types;
- после последней ошибки пробросить её;
- сохранить metadata;
- не ловить всё подряд.

Дополнительный вопрос:

> почему retry non-idempotent операции может быть опасен?

---

# 80. Практика — typing

## Задача 26 — Order

```python
from typing import TypedDict

class Order(TypedDict):
    ...
```

Опиши:

```python
{
    "id": 1,
    "user_id": 10,
    "amount": 250.0,
    "status": "paid",
}
```

Затем аннотируй:

```python
def calculate_user_totals(
    orders,
):
    ...
```

Результат:

```python
dict[int, float]
```

---

## Задача 27 — Callable

Аннотируй:

```python
def run_with_retry(
    operation,
    attempts,
):
    ...
```

Где:

```text
operation:
    аргументов нет
    возвращает str
```

---

## Задача 28 — Iterable

Напиши:

```python
def total_positive(
    values,
):
    ...
```

Так, чтобы функция принимала любой `Iterable[float]`, а не только list.

Объясни, почему нельзя рассчитывать на:

```python
len(values)
values[0]
```

для произвольного Iterable.

---

# 81. Production exercise — Ticket processing pipeline

Нужно собрать небольшой набор функций для backend-логики.

Входной ticket:

```python
{
    "id": 10,
    "title": " Shared folder unavailable ",
    "priority": "HIGH",
    "status": "open",
    "assignee": None,
}
```

Реализуй:

```python
def validate_ticket(
    ticket,
):
    ...
```

```python
def normalize_ticket(
    ticket,
):
    ...
```

```python
def calculate_priority(
    ticket,
):
    ...
```

```python
def process_ticket(
    ticket,
    *,
    save,
    notify=None,
):
    ...
```

Требования:

### `validate_ticket`

- проверяет обязательные поля;
- не мутирует input;
- invalid → `ValueError`;
- contract описан явно.

### `normalize_ticket`

- не мутирует исходный dict;
- возвращает новый dict;
- `title.strip()`;
- priority lowercase.

### `calculate_priority`

- pure-ish;
- возвращает нормализованный priority score/int;
- не делает I/O.

### `process_ticket`

- валидирует;
- нормализует;
- вычисляет priority;
- вызывает injected callable `save`;
- если `notify is not None`, вызывает notification callback;
- возвращает сохранённый результат.

---

# 81.1. Почему exercise важен

Он объединяет:

```text
function contract
↓
validation
↓
immutability decision
↓
return values
↓
keyword-only dependency
↓
Callable
↓
side effects boundary
↓
testability
```

---

# 81.2. Тестирование без реальной базы

Можно:

```python
saved = []

def fake_save(ticket):
    saved.append(ticket)
    return ticket
```

и передать:

```python
process_ticket(
    ticket,
    save=fake_save,
)
```

Функции как объекты позволяют тестировать orchestration без внешней инфраструктуры.

---

# 82. Production exercise — generator pipeline

Есть большой поток log lines.

Реализуй:

```python
def iter_parsed_logs(
    lines,
):
    ...
```

Каждая строка:

```text
2026-09-17|ERROR|database timeout
```

Функция лениво возвращает:

```python
{
    "date": "2026-09-17",
    "level": "ERROR",
    "message": "database timeout",
}
```

Правила:

- пустые строки пропускать;
- malformed line → `ValueError`;
- весь файл в память не загружать.

Дополнительно:

```python
def iter_errors(logs):
    ...
```

оставляет только `ERROR`.

---

# 83. Mini-exam

Время: 60 минут.

Без AI и подсказок.

## Часть A — object model functions

Объясни результат:

```python
def mutate(items):
    items.append(3)
    items = [100]

data = [1, 2]
mutate(data)

print(data)
```

Используй термины:

```text
parameter binding
mutation
rebinding
```

---

## Часть B — signature

Напиши сигнатуру:

```python
def request(...):
```

Требования:

- `url` — positional-only;
- `method` — positional-or-keyword, default `"GET"`;
- дополнительные positional запрещены;
- `timeout=5` — keyword-only;
- `retries=0` — keyword-only.

Затем приведи два корректных и два некорректных вызова.

---

## Часть C — defaults

Исправь:

```python
def add_error(
    error,
    errors=[],
):
    errors.append(error)
    return errors
```

Напиши тест, который ловит bug.

---

## Часть D — closure

Реализуй:

```python
def make_rate_limiter(
    limit,
):
    ...
```

Упрощённая версия:

- closure хранит число уже использованных вызовов;
- до `limit` возвращает `True`;
- после — `False`.

Без global.

---

## Часть E — generator

Реализуй:

```python
def iter_unique(
    values,
):
    ...
```

Лениво отдаёт уникальные hashable values в порядке первого появления.

Использовать:

```python
set
yield
```

---

## Часть F — decorator

Реализуй:

```python
@require_non_empty
def normalize_name(name):
    return name.strip().lower()
```

Decorator:

- проверяет первый positional argument;
- пустая строка после `strip` → `ValueError`;
- сохраняет metadata;
- сохраняет result исходной функции.

После решения обсуди, хорош ли такой decorator как API или явная validation внутри функции была бы понятнее.

---

## Часть G — explanation

Без запуска кода объясни:

1. function object vs function call;
2. parameter vs argument;
3. `return` vs `yield`;
4. почему функция без `return` возвращает `None`;
5. mutable default;
6. positional-only vs keyword-only;
7. `*args` vs `**kwargs`;
8. closure;
9. late binding;
10. recursion call stack;
11. iterable vs iterator vs generator;
12. decorator desugaring;
13. `wraps`;
14. type hint vs runtime validation;
15. side effect;
16. почему retry связан с idempotency.

---

# 84. Interview questions

Ты должен отвечать на них словами, без запуска кода.

1. Что такое function object?
2. Что делает `def`?
3. Что такое callable?
4. Имя функции vs вызов функции?
5. Parameter vs argument?
6. Что такое parameter binding?
7. Что возвращает функция без `return`?
8. Что делает `return` помимо передачи значения?
9. Как вернуть несколько значений?
10. Почему фактически возвращается tuple?
11. Как mutable object ведёт себя при передаче в функцию?
12. Mutation vs rebinding внутри функции?
13. Как корректнее описывать передачу аргументов в Python?
14. Что такое contract функции?
15. Когда `None` — хороший return?
16. Когда лучше exception?
17. Когда вычисляются default arguments?
18. Почему mutable defaults опасны?
19. Зачем использовать sentinel?
20. Когда отдельный `object()` лучше `None`?
21. Что такое `*args`?
22. Какой тип у `args`?
23. Что такое `**kwargs`?
24. Какой тип у `kwargs`?
25. Почему не стоит злоупотреблять `**kwargs`?
26. Что значит positional-only?
27. Что значит keyword-only?
28. Зачем `/` в signature?
29. Зачем `*` в signature без имени args?
30. Что делает `*` при вызове?
31. Что делает `**` при вызове?
32. Что такое higher-order function?
33. Когда lambda уместна?
34. Почему lambda не заменяет обычные функции?
35. Что принимает `sorted(key=...)`?
36. `map` возвращает list?
37. `filter` возвращает list?
38. Что делает `zip` при разных длинах?
39. Что делает `strict=True`?
40. Как работают `any` и `all`?
41. Что возвращает `all([])`?
42. Что такое namespace?
43. Что такое scope?
44. Расшифруй LEGB.
45. Почему assignment внутри function может вызвать `UnboundLocalError`?
46. `global` vs `nonlocal`?
47. Что такое closure?
48. Что такое free variable?
49. Что такое late binding?
50. Как исправить late-binding lambda loop?
51. Что такое recursion?
52. Что такое base case?
53. Что такое call stack?
54. Почему Python recursion имеет limit?
55. Есть ли tail-call optimization?
56. Iterable vs iterator?
57. Что делает `iter()`?
58. Что делает `next()`?
59. Что такое `StopIteration`?
60. Что такое generator?
61. Generator expression vs list comprehension?
62. Что делает `yield`?
63. Когда выполняется тело generator function?
64. Можно ли повторно обойти исчерпанный generator?
65. `return` внутри generator?
66. Что делает `yield from`?
67. Что такое decorator?
68. Во что разворачивается `@decorator`?
69. Почему wrapper принимает `*args/**kwargs`?
70. Зачем `functools.wraps`?
71. Как работают decorator factories?
72. В каком порядке применяются stacked decorators?
73. Когда retry оправдан?
74. Почему `except Exception` в retry опасен?
75. Что такое idempotency?
76. Зачем `partial`?
77. Когда cache опасен?
78. Проверяют ли type hints runtime types?
79. Что такое `Callable`?
80. Когда параметр лучше типизировать как `Iterable`, а не `list`?
81. Что такое `TypedDict`?
82. Делает ли `TypedDict` runtime validation?
83. Что такое `Protocol`?
84. Что такое structural typing?
85. Что такое side effect?
86. Почему pure-ish функция проще тестируется?
87. Что должно входить в function contract?
88. Почему слишком большой union return types — плохой сигнал?
89. Как понять, что функцию пора разделить?
90. Почему длина функции сама по себе не критерий качества?

---

# 85. Критерий освоения

Модуль считается освоенным, если без подсказки ты можешь:

- объяснить функцию как object;
- объяснить `def`;
- различить имя функции и вызов;
- различить параметр и аргумент;
- объяснить binding;
- уверенно использовать `return`;
- объяснить происхождение `None`;
- объяснить mutation/rebinding при вызове;
- сформулировать контракт функции;
- не допустить mutable-default bug;
- использовать sentinel;
- читать `*args/**kwargs`;
- читать `/` и `*` в signature;
- использовать argument unpacking;
- передавать function как argument;
- уверенно читать lambda;
- использовать `sorted(key=...)`;
- объяснить lazy `map/filter/zip`;
- использовать `any/all`;
- объяснить LEGB;
- объяснить `UnboundLocalError`;
- использовать `nonlocal`;
- написать closure;
- исправить late binding;
- объяснить recursion и call stack;
- различать iterable/iterator/generator;
- написать generator function;
- объяснить exhaustion;
- использовать `yield from`;
- написать decorator;
- не потерять return value;
- использовать `wraps`;
- написать decorator factory;
- объяснить decorator order;
- понимать retry/idempotency;
- типизировать callback через `Callable`;
- использовать `Iterable`/`Iterator`;
- описать dict contract через `TypedDict`;
- понимать `Protocol`;
- различать type hints и validation;
- отличать pure computation от side effects;
- пройти mini-exam без AI;
- объяснить написанное решение как на Middle-собеседовании.

---

# 86. Что нужно знать «как своё имя»

После этого модуля следующие термины не должны требовать догадки:

```text
function
function object
callable
def
call
parameter
argument
binding
positional argument
keyword argument
return
None
contract
mutation
rebinding
default argument
mutable default
sentinel
*args
**kwargs
positional-only
keyword-only
unpacking
higher-order function
callback
lambda
key function
map
filter
zip
any
all
namespace
scope
LEGB
local
enclosing
global
built-in
UnboundLocalError
global statement
nonlocal
closure
free variable
late binding
recursion
base case
recursive case
call stack
stack frame
iterable
iterator
generator
lazy evaluation
generator expression
generator function
yield
yield from
StopIteration
decorator
wrapper
functools.wraps
decorator factory
stacked decorators
partial
cache
lru_cache
type hint
Callable
Iterable
Iterator
TypedDict
Protocol
docstring
side effect
pure function
idempotency
retry
```

Если спустя несколько месяцев термин забылся, этот файл должен позволить восстановить его без поиска другого учебника.

---

# 87. Главная карта mental models

```text
function object
 ↓
def создаёт объект и binding имени
 ↓
call
 ↓
arguments связываются с parameters
 ↓
local scope
 ↓
работа с теми же объектами
 ↓
mutation / rebinding
 ↓
return или exception
 ↓
function contract
 ↓
defaults / *args / **kwargs
 ↓
functions как данные
 ↓
higher-order functions
 ↓
scope / LEGB
 ↓
closures
 ↓
decorators
 ↓
iterators / generators
 ↓
recursion / call stack
 ↓
typing / documentation
 ↓
side effects / reliability
 ↓
backend orchestration
```

Главная мысль:

> Функция в Python — не просто блок кода под `def`. Это объект с контрактом, областью видимости, правилами binding, возможными side effects и чётким местом в архитектуре программы.
>
> Чем лучше ты понимаешь функцию как механизм языка, тем легче становятся FastAPI dependencies, callbacks, decorators, generators, testing, async и архитектура backend-сервисов.
