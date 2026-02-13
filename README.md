# PSI Mammoliti - Frontend

Aplicacion web para buscar profesionales de salud mental y agendar turnos. Construida con Next.js 16 y React 19.

## Instrucciones para correr el proyecto

### Requisitos previos

- Node.js 20+
- npm
- Backend corriendo en `http://localhost:3001` (ver README del backend)

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

### 2. Instalar dependencias y correr

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

### 3. Build de produccion

```bash
npm run build
npm start
```

### 4. Correr con Docker

```bash
docker build -t psi-mammoliti-frontend .
docker run -p 3000:3000 psi-mammoliti-frontend
```

Nota: `NEXT_PUBLIC_API_URL` se resuelve en build time. Para apuntar a otra API, setearlo antes del build:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.ejemplo.com -t psi-mammoliti-frontend .
```

