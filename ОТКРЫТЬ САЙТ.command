#!/bin/sh
# Двойной клик по этому файлу открывает сайт Golden Palace в браузере.
# Пока это окно открыто — сайт работает. Чтобы закрыть сайт, закройте окно.

cd "$(dirname "$0")" || exit 1

PORT=8901
while lsof -i ":$PORT" >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

clear
printf '\n'
printf '   Golden Palace — сайт запускается…\n'
printf '   Адрес: http://localhost:%s\n' "$PORT"
printf '\n'
printf '   Это окно должно оставаться открытым.\n'
printf '   Закроете окно — сайт перестанет открываться.\n'
printf '\n'

( sleep 1; open "http://localhost:$PORT/index.html" ) &

python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1
