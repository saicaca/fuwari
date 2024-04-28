export function getDefaultHue(): number {
  const fallback = '250'
  const configCarrier = document.getElementById('config-carrier')
  return parseInt(configCarrier?.dataset.hue || fallback)
}

export function getHue(): number {
  const stored = localStorage.getItem('hue')
  return stored ? parseInt(stored) : getDefaultHue()
}

export function setHue(hue: number): void {
  localStorage.setItem('hue', String(hue))
  const r = document.querySelector(':root')
  if (!r) {
    return
  }
  r.style.setProperty('--hue', hue)
}

export const LIGHT_MODE = 'light', DARK_MODE = 'dark', AUTO_MODE = 'auto'

export function setTheme(theme: string): void {
  localStorage.setItem('theme', theme)
  switch (theme) {
    case LIGHT_MODE:
      document.documentElement.classList.remove('dark');
      break
    case DARK_MODE:
      document.documentElement.classList.add('dark');
      break
    case AUTO_MODE:
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      break
  }
}

export function getStoredTheme(): string {
  return localStorage.getItem('theme') || AUTO_MODE
}