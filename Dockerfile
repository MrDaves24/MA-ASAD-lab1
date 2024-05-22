FROM oven/bun:1 as bun

WORKDIR /app/frontend

COPY ./frontend/bun.lockb /app/frontend
COPY ./frontend/package.json /app/frontend
RUN bun install --frozen-lockfile

COPY ./frontend /app/frontend
RUN bun run build

FROM python:3.9-slim as server

COPY ./backend/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt && rm /tmp/requirements.txt

WORKDIR /app
COPY ./backend/server.py .

COPY --from=bun /app/frontend/dist /app/static

EXPOSE 8080
CMD ["python", "server.py"]
