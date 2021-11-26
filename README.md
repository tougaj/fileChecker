# fileChecker

Утилиты, предназначенные для контроля целостности файлов.

Иногда бывает необходимо периодически контролировать изменение критических файлов. Данный набор утилит предназначен именно для этого. В набор входят следующие скрипты:

- **generateChecksum.js** — предназначен для генерации эталонных значений контрольных сумм и размеров файлов;
- **checkChecksum.js** — предназначен для проверки того, соответствуют ли текущие контрольные суммы и размеры файлов эталонным значениям.

## Настройка

1. Находясь в корневом каталоге, выполните команду

```bash
$ npm install
```

2. Создайте файл со списком отслеживания. Для этого создайте файл **./data/filesForCheck.txt** и поместите в него полные или относительные пути к файлам, изменения которых Вы хотите контролировать (пример можно посмотреть в файле **./data/filesForCheck.txt.tmpl**).

## Использование

### Генерация эталонных значений

Находясь в корневом каталоге, выполните команду

```bash
$ node generateChecksum.js
```

По окончании работы скрипта будет создан файл **./data/checksum.txt** с эталонными значениями контрольных сумм и размеров файлов, содержащихся в списке отслеживания (файл **./data/filesForCheck.txt**).

> Примечание: на всякий случай, если файл **./data/checksum.txt** уже существует, то он будет переименован в файл вида **./data/checksum.txt_&lt;timestamp&gt;.old**

### Проверка целостности файлов

Находясь в корневом каталоге, выполните команду

```bash
$ node checkChecksum.js
```

Результаты работы скрипта выводятся в консоль. В случае выявления расхождения эталонных контрольных сумм или размеров файлов с текущими значениями, на экран будут выведены соответствующие сообщения об ошибках.

Кроме того, код возврата скрипта (exit code) равен количеству файлов, нарушение целостности которых было выявлено в результате проверки:

- если ни один файлов не изменился, то код возврата будет равен нулю;
- если какие-либо файлы будут изменены (или удалены), то код возврата будет больше нуля.
