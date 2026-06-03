# BGG · Sistema Mobile do Técnico

Protótipo mobile do fluxo do técnico (login, dashboard, orçamento, checklist).

## Stack

- React 19 + Vite 6
- Tailwind CSS 3 (tokens BGG em `tailwind.config.js`; estilos operacionais em `src/styles/`)

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Ligação à API (`bgggarage-api`)

O mobile comunica com o backend Nest em `../bgggarage-api` (porta **3000**, prefixo **`/api`**).

1. Na pasta da API:
   ```bash
   cd ../bgggarage-api
   cp .env.example .env   # se existir — configure DATABASE_URL e JWT_SECRET
   npm install
   npx prisma migrate dev
   npm run start:dev
   ```
2. Confirme no browser ou terminal: `GET http://localhost:3000/api/auth/setup` (200) e, com login, `GET http://localhost:3000/api/quotes` (401 sem token, não 404).
3. No mobile, copie `.env.example` para `.env`:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```
4. Inicie o mobile: `npm run dev` (http://localhost:5173).

**Rotas usadas pelo mobile**

| Mobile | API |
|--------|-----|
| `POST /auth/login` | Login técnico |
| `GET /quotes` | Lista de orçamentos |
| `POST /quotes` | Novo orçamento |
| `PATCH /quotes/:id` | Atualizar |
| `PATCH /quotes/:id/submit` | Enviar para aprovação |
| `GET /appointments` | Agendamentos do admin |

Se `/quotes` devolver **404**, a API em execução está desatualizada — pare o processo na porta 3000 e volte a correr `npm run start:dev` em `bgggarage-api`.

## Estrutura

```
public/
src/
  main.jsx
  App.jsx
  index.css
  assets/
  components/
    Icon.jsx
    ui/
    tweaks/
  screens/
  styles/
  utils/
```
