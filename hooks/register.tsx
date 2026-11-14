import type { Register, ThemeBackdrop } from 'claude-code'

import { SCENE } from './scene'

const PLUGIN = 'nexus-cyberpunk'
const BACKDROP_ID = 'nexus'
const OFF_KEY = 'isOff'

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
        <Svg
          source={SCENE}
          alt="Ciudad cyberpunk NEXUS de noche: torres con ventanas de neón, holograma giratorio, lluvia y rejilla magenta"
          isInteractive
        />
      </Box>
    )
  })
}
