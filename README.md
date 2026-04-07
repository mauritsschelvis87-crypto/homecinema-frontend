# Home Cinema Frontend

Angular frontend for the Home Cinema project.

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm start
```

The app runs on `http://localhost:4200/`.

## Build

Create a production build:

```bash
npm run build
```

The output is written to `dist/HomeCinemaProject/browser`.

## Production configuration

This repository is already configured for student number `s1156856`.

- Frontend host: `http://s1156856.student.inf.st.hsleiden.nl`
- Frontend port: `16856`
- Backend API: `https://b1156856.student.inf.st.hsleiden.nl/api`
- NGINX config: [`nginx.conf`](./nginx.conf)
- Angular production environment: [`src/environments/environment.prod.ts`](./src/environments/environment.prod.ts)

If the student number changes, update both files above.

## Deploy to the student server

1. Build the frontend locally:

```bash
npm run build
```

2. Copy the NGINX config to the server:

```bash
scp nginx.conf s1156856@student.inf.st.hsleiden.nl:~/nginx.conf
```

3. Copy the built frontend files to the `frontend` folder on the server:

```bash
scp -r dist/HomeCinemaProject/browser/* s1156856@student.inf.st.hsleiden.nl:~/frontend
```

4. Start NGINX on the server:

```bash
/usr/sbin/nginx -c $HOME/nginx.conf -p $HOME
```

5. Open the deployed site:

```text
http://s1156856.student.inf.st.hsleiden.nl
```

## Troubleshooting

- `Address already in use`: run `killall nginx` on the server and start NGINX again.
- `...student.inf.st.hsleiden.nl refused to connect`: NGINX is not running or the configured port is incorrect.
- Frontend loads but API calls fail: verify the backend is reachable at `https://b1156856.student.inf.st.hsleiden.nl/api`.

## Useful commands

```bash
npm run lint
npm run test
```
