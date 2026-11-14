import type { Register, ThemeBackdrop } from 'claude-code'

import { PANEL_SCENE, SCENE } from './scene'

const PLUGIN = 'nexus-cyberpunk'
const BACKDROP_ID = 'nexus'
const PANE_ID = 'nexus-panel'
const OFF_KEY = 'isOff'
const ALT = 'Ciudad cyberpunk NEXUS de noche: torres con ventanas de neón, holograma giratorio, lluvia y rejilla magenta'

// Vidrio morado oscuro: deja ver la ciudad pero mantiene el texto legible.
const BACKDROP: ThemeBackdrop = {
  id: BACKDROP_ID,
  colorScheme: 'dark',
  glass: { blur: 14, tint: '#0b0620', opacity: 0.58 },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'nexus-theme',
      description: 'Tema cyberpunk NEXUS: /nexus-theme on | off',
    })
    await $.command.register({
      name: 'nexus-panel',
      description: 'Abre la ciudad NEXUS animada en un panel lateral',
    })
    if ((await $.store.get(OFF_KEY)) !== true) {
      await $.theme.set({ backdrop: BACKDROP })
    }

    return next(e)
  })

  on('command.run', { command: 'nexus-theme' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()

    if (arg === 'off') {
      await $.store.set(OFF_KEY, true)
      await $.theme.clear()

      return { text: 'Tema NEXUS apagado. Vuelve a encenderlo con /nexus-theme on.' }
    }

    await $.store.set(OFF_KEY, false)
    const set = await $.theme.set({ backdrop: BACKDROP })

    return {
      text: set.isDrawn
        ? 'Tema NEXUS activado. Bienvenido a la red.'
        : `Tema NEXUS listo; se verá cuando la app lo dibuje (${set.reason}).`,
    }
  })

  on('command.run', { command: 'nexus-panel' }, async $ => {
    const opened = await $.ui.open({ id: PANE_ID, title: 'NEXUS', backgroundColor: '#04010b' })

    return {
      text: opened.isPlaced
        ? 'Panel NEXUS abierto.'
        : `El panel NEXUS está abierto pero la app aún no lo muestra (${opened.reason}).`,
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)

    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return (
        <Box>
          <Text color="magenta">NEXUS</Text>
          <Text dimColor> · la ciudad se ve en la app de escritorio</Text>
        </Box>
      )
    }
    const { Svg } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        <Svg source={PANEL_SCENE} alt={ALT} isInteractive />
      </Box>
    )
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.plugin !== PLUGIN || e.props.id !== BACKDROP_ID) {
      return next(e)
    }
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Box, Svg } = $.ui.resolve(e)

    return (
      <Box width="100%" height="100%">
        <Svg source={SCENE} alt={ALT} isInteractive />
      </Box>
    )
  })
}
