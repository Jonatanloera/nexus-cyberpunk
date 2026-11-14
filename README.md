# NEXUS — tema cyberpunk para Claude Code desktop

Un mod que pone una ciudad cyberpunk animada detrás de la conversación en la app de escritorio de Claude Code: torres con ventanas de neón, holograma NEXUS girando con glitch, lluvia, coches voladores y una rejilla magenta en movimiento. Los paneles llevan un vidrio esmerilado morado para que el texto siga legible.

## Instalación

En una sesión de Claude Code en la terminal:

```
/plugin install nexus-cyberpunk --marketplace Jonatanloera/nexus-cyberpunk
```

Responde `y` para añadir el marketplace y elige el alcance (user).

Desde la shell:

```bash
claude plugin install nexus-cyberpunk --marketplace Jonatanloera/nexus-cyberpunk
```

En la app de escritorio: haz clic en **+** junto al cuadro del prompt → **Plugins** → **Add marketplace** con `Jonatanloera/nexus-cyberpunk` → **Add plugin**.

## Uso

El tema se activa solo al iniciar cada sesión.

```
/nexus-theme off
```

```
/nexus-theme on
```

Si lo apagas, sigue apagado en las siguientes sesiones hasta que lo enciendas otra vez.

## Archivos

- `hooks/scene.ts` — la escena SVG animada (colores en el objeto `C`).
- `hooks/register.tsx` — fija el fondo, el vidrio y el comando `/nexus-theme`.
