# Cafetería Origen

Aplicación web para **Cafetería Origen**, una cafetería de especialidad que vende café expreso, café filtrado y pastelería. Incluye una **API REST** para gestionar el menú, los pedidos y los reportes de ventas, y un **frontend** pensado para que el cliente arme y confirme su pedido desde el celular escaneando el QR de su mesa.

Proyecto desarrollado por el **Grupo 17** — Trabajo Práctico 3 de Programación 4.

## Funcionalidades

**Backend (API)**

- **Catálogo de productos:** expresos y filtrados en tres tamaños (Pocillo, Mediano, Taza grande) y tres variedades de grano (Brasil, Colombia, Etiopía), más pastelería.
- **Precio calculado por dominio:** el precio de un café depende de los gramos de grano y de la variedad elegida.
- **Pedidos:** alta con varios ítems (opcionalmente asociados a una mesa), consulta y cambio de estado con reglas de transición.
- **Reportes:** facturación total y tipo de producto más vendido, ignorando los pedidos cancelados.
- **Validación y manejo de errores centralizado**, con respuestas JSON consistentes.

**Frontend**

- **Menú** con selector de café (tipo, tamaño y origen) y sección de pastelería, con estados de carga, error y reintento.
- **Carrito** con cantidades y subtotales.
- **Confirmación del pedido** y **seguimiento del estado** en tiempo real (consulta periódica hasta que el pedido llega a un estado final).
- **Mesa por URL:** `/?mesa=4` muestra "Mesa 4"; sin el parámetro, el pedido es para retiro en barra.
- **Diseño pensado para celular** (mobile first, sin scroll horizontal en 375 px), con la paleta de la cafetería sobre Bootstrap.
- **Modo oscuro automático**, según la configuración del celular o de la PC.
- **Animaciones de entrada** suaves, que se desactivan si el usuario pidió reducir el movimiento (`prefers-reduced-motion`).
- Precios con formato (incluido el total del pedido confirmado) y pruebas de accesibilidad.

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Backend | TypeScript 5.9 · Node.js 20 · Express 4 |
| Base de datos | PostgreSQL 16 (driver `pg`) |
| Frontend | React 19 · Vite 7 · TypeScript · Bootstrap 5 · Sass · Zod |
| Tests backend | Jest · ts-jest · Supertest |
| Tests frontend | Vitest · Testing Library · MSW · Playwright (E2E) |
| Infraestructura | Docker · Docker Compose · pgAdmin |

## Puesta en marcha

Requisitos: [Docker](https://www.docker.com/) con Docker Compose.

```powershell
git clone https://github.com/ricardoherbas/tp3-programacion4.git
cd tp3-programacion4

# Variables de entorno (completá los valores vacíos, ver tabla más abajo)
Copy-Item .env.example .env

# Levanta PostgreSQL, la API, el frontend y pgAdmin
docker compose up --build
```

| Servicio | URL por defecto |
| --- | --- |
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 (según `API_PORT_HOST`) |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | `localhost:5433` |

> El esquema y los datos iniciales se cargan desde `backend/database/init.sql` **solo la primera vez** que se crea el volumen. Para reiniciar la base desde cero: `docker compose down -v`.

### Variables de entorno

Las define el archivo `.env` de la raíz (está en `.gitignore`). Varias vienen vacías en `.env.example` y hay que completarlas.

| Variable | Descripción |
| --- | --- |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Credenciales y nombre de la base de PostgreSQL |
| `DB_HOST` / `DB_PORT` | Conexión a la base cuando ejecutás los tests desde tu computadora (por ejemplo `localhost` y `5433`) |
| `POSTGRES_PORT_HOST` / `POSTGRES_PORT_CONTAINER` | Puerto de PostgreSQL en tu máquina y dentro del contenedor (`5433` / `5432`) |
| `API_PORT_HOST` / `API_PORT_CONTAINER` | Puerto de la API en tu máquina y dentro del contenedor (por defecto `3001` / `3000`) |
| `FRONTEND_PORT` | Puerto del frontend (por defecto `5173`) |
| `API_PROXY_TARGET` | A dónde redirige Vite las llamadas `/api` cuando se ejecuta fuera de Docker |
| `PGADMIN_PORT` / `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` | Puerto y credenciales de pgAdmin |

Si corrés el frontend fuera de Docker, asegurate de que `API_PROXY_TARGET` apunte al puerto donde publicaste la API (`API_PORT_HOST`).

## Endpoints

Base URL: `http://localhost:<API_PORT_HOST>/api`

### Productos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/productos` | Lista todos los productos |
| `GET` | `/productos/:id` | Devuelve un producto (`404` si no existe) |

Ejemplo (`GET /api/productos/5`):

```json
{
  "id": 5,
  "nombre": "Expreso Mediano",
  "precioBase": 2500,
  "tamanio": "Mediano",
  "gramosCafe": 27,
  "variedad": {
    "nombre": "Colombia",
    "precioPorGramo": 180,
    "descripcion": "Acidez Media, cuerpo Equilibrado y notas Cítricas y florales"
  }
}
```

### Pedidos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/pedidos` | Crea un pedido (nace en estado `pendiente`) |
| `GET` | `/pedidos` | Lista los pedidos |
| `GET` | `/pedidos/:id` | Devuelve un pedido con sus ítems |
| `PATCH` | `/pedidos/:id/estado` | Cambia el estado del pedido |

Crear un pedido (`mesaId` es opcional):

```powershell
$body = '{ "mesaId": 1, "items": [ { "productoId": 5, "cantidad": 2 } ] }'
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/pedidos `
  -ContentType "application/json" -Body $body
```

```json
{
  "id": 1,
  "mesaId": 1,
  "estado": "pendiente",
  "total": 14720,
  "items": [
    { "productoId": 5, "cantidad": 2, "precioUnitario": 7360, "subtotal": 14720 }
  ]
}
```

El precio unitario queda **congelado** en el pedido: si el menú cambia después, los pedidos existentes no se alteran.

Cambiar el estado:

```powershell
$body = '{ "estado": "confirmado" }'
Invoke-RestMethod -Method Patch -Uri http://localhost:3001/api/pedidos/1/estado `
  -ContentType "application/json" -Body $body
```

Transiciones permitidas:

```
pendiente ──► confirmado
    └───────► cancelado
```

`confirmado` y `cancelado` son estados finales. Cualquier otra transición responde `409`.

### Reportes

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/reportes/facturacion` | `{ "facturacionTotal": 14720 }` |
| `GET` | `/reportes/mas-vendido` | `{ "tipo": "expreso", "cantidad": 2 }` (`404` si no hay ventas) |

Los pedidos `cancelado` no se cuentan en ningún reporte.

### Códigos de error

Todos los errores responden con el formato `{ "error": "mensaje" }`.

| Código | Cuándo |
| --- | --- |
| `400` | Datos inválidos (ítems vacíos, `productoId` o `cantidad` no enteros positivos, id inválido, estado desconocido) |
| `404` | Producto o pedido inexistente, ruta inexistente o reporte sin ventas |
| `409` | Transición de estado no permitida |
| `500` | Error interno del servidor |

## Cómo se calcula el precio

| Tipo | Fórmula |
| --- | --- |
| Expreso / Filtrado | `precioBase + gramosCafe × precioPorGramo` |
| Pastelería | `precioBase` |

Ejemplo: Expreso Mediano de Colombia → `2500 + 27 × 180 = $7.360`.

Datos de ejemplo cargados por `init.sql`:

| Variedad | Acidez | Cuerpo | Notas | $/gramo |
| --- | --- | --- | --- | --- |
| Brasil | Baja | Denso | Avellana | 140 |
| Colombia | Media | Equilibrado | Cítricas y florales | 180 |
| Etiopía | Viva | Ligero | Frutales | 240 |

La base también incluye 5 mesas y 2 productos de pastelería (muffin de chocolate y porción de torta selva negra).

## Tests

### Backend

Desde `backend/`:

```powershell
npm install              # solo la primera vez
npm run test:unit        # tests unitarios (no necesitan base de datos)
npm run test:endpoints   # tests de integración contra PostgreSQL real
npm test                 # ambos, en serie
```

Los tests de integración usan la base real: necesitan el `.env` en la raíz y la base levantada (`docker compose up -d db`). Se ejecutan con `--runInBand` para que no se pisen entre sí.

### Frontend

Desde `frontend/`:

```powershell
npm install
npm test                 # Vitest: unitarios e integración (con MSW, sin backend)
npm run typecheck        # chequeo de tipos
npm run test:e2e         # Playwright (requiere la API levantada, ver abajo)
```

Los tests E2E reinician y siembran la base a través de las rutas `/__test__/reset` y `/__test__/seed`, que **solo existen cuando la API corre con `NODE_ENV=test`**:

```powershell
$env:NODE_ENV = "test"
docker compose up -d --build db api
cd frontend
npm run test:e2e
```

Al terminar, volvé la API a modo normal: `Remove-Item Env:NODE_ENV` y `docker compose up -d --build api`.

## Arquitectura

El backend sigue una arquitectura en capas, con las dependencias inyectadas a mano en `app.ts`:

```
Request ─► routes ─► middlewares (validación) ─► controllers ─► services ─► repositories ─► PostgreSQL
                                                                    │
                                                              models / factories
```

```
tp3-programacion4/
├── docker-compose.yml        # PostgreSQL + API + frontend + pgAdmin
├── .env.example
├── backend/
│   ├── app.ts                # arma la app Express y conecta las capas
│   ├── server.ts             # punto de entrada
│   ├── config/               # conexión a la base (pool de pg)
│   ├── routes/               # definición de rutas por recurso
│   ├── middlewares/          # validación de pedidos y manejo de errores
│   ├── controllers/          # traducen HTTP ⇄ servicios
│   ├── services/             # lógica de negocio
│   ├── repositories/         # acceso a datos (SQL)
│   ├── models/               # Producto (abstracta), Expreso, Filtrado, Pasteleria, Variedad, Pedido
│   ├── factories/            # ProductoFactory
│   ├── database/             # init.sql (esquema + datos) y datos de test
│   └── tests/                # unit/ e integration/
└── frontend/
    ├── src/
    │   ├── api/              # cliente HTTP y esquemas Zod
    │   ├── menu/             # menú y hook useMenu
    │   ├── cafe/             # selector de café
    │   ├── pasteleria/       # sección de pastelería
    │   ├── carrito/          # contexto, reducer y vista del carrito
    │   ├── pedidos/          # confirmación y seguimiento del pedido
    │   ├── mesa/             # lectura de la mesa desde la URL
    │   ├── styles/           # estilos Sass (tema, modo oscuro y animaciones)
    │   └── test/             # tests con Vitest
    └── e2e/                  # tests de extremo a extremo (Playwright)
```

## Equipo — Grupo 17

- Ricardo Herbas
- Celina Vega
- Gonzalo Herrera

## Flujo de trabajo

- Una rama por funcionalidad (`feature/…`, `fix/…`, `chore/…`, `build/…`) integrada a `main` mediante Pull Request.
- Desarrollo guiado por tests (TDD): los commits de tests marcan el ciclo `[rojo]` → `[verde]`.
- Mensajes de commit con prefijos convencionales (`feat`, `fix`, `test`, `build`, `chore`, `refactor`).

## Demo de la aplicacion

¡Escanea el código QR con tu celular para probar la aplicación en tiempo real en las diferentes ubicaciones!

<table align="center">
  <tr>
    <td align="center">
      <b>Retiro en Barra</b><br>
      <img src="./assets/barra.png" alt="QR Retiro en Barra" width="180" />
    </td>
    <td align="center">
      <b> Mesa 1</b><br>
      <img src="./assets/mesa1.png" alt="QR Mesa 1" width="180" />
    </td>
    <td align="center">
      <b> Mesa 2</b><br>
      <img src="./assets/mesa2.png" alt="QR Mesa 2" width="180" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <b> Mesa 3</b><br>
      <img src="./assets/mesa3.png" alt="QR Mesa 3" width="180" />
    </td>
    <td align="center">
      <b> Mesa 4</b><br>
      <img src="./assets/mesa4.png" alt="QR Mesa 4" width="180" />
    </td>
    <td align="center">
      <b> Mesa 5</b><br>
      <img src="./assets/mesa5.png" alt="QR Mesa 5" width="180" />
    </td>
  </tr>
</table>