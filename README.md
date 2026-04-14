# Home Cinema Frontend

Angular frontend for the Home Cinema project.

## Local development

- Frontend dev server: `http://localhost:4200`
- Backend API: `http://localhost:26856/api`
- PostgreSQL: `localhost:5432` for the backend only

Important: the frontend must never connect to `localhost:5432`. All frontend API calls go to the backend on `http://localhost:26856/api`.

Install dependencies and start the dev server:

```bash
npm install
npm start
```

The app runs on `http://localhost:4200/`.

## Product listing

The shopping/product listing flow uses `FilmService.getAllFilms()` and calls:

```text
GET http://localhost:26856/api/films
```

## Build

Create a build:

```bash
npm run build
```

The output is written to `dist/HomeCinemaProject/browser`.

## Troubleshooting

- If films do not load, verify the backend is reachable at `http://localhost:26856/api/films`.
- If the browser reports a CORS issue, the backend must allow origin `http://localhost:4200`.

## Useful commands

```bash
npm run lint
npm run test
```
