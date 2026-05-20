# 🍥Fuwari

Un tema estático para blogs construido con [Astro](https://astro.build).

[**🖥️ Demostración en Vivo (Vercel)**](https://fuwari.vercel.app)

![Imagen de Vista Previa](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ Características

- [x] Construido con [Astro](https://astro.build) y [Tailwind CSS](https://tailwindcss.com)
- [x] Animaciones suaves y transiciones de página
- [x] Modo claro / oscuro
- [x] Colores del tema y banner personalizables
- [x] Diseño responsivo
- [ ] Comentarios
- [x] Buscador
- [x] TOC (Tabla de Contenidos)
- [x] Fuente RSS
- [x] Enlaces de amigos
- [x] Página de animes de Bilibili
- [x] Página de seguidos de Bilibili
- [x] Página de fans de Bilibili
- [x] Página de dinámicas de Bilibili
- [x] Página de favoritos de Bilibili
- [x] Página de momentos
- [x] Página de música
- [x] Reproductor de música en la barra lateral
- [x] Soporte i18n (inglés, japonés, chino, coreano, español, tailandés, vietnamita e indonesio)

## 👀 requiere

- Node.js <= 22
- pnpm <= 9

## 🚀 Cómo Usar 1

Inicializa el proyecto localmente usando [create-fuwari](https://github.com/L4Ph/create-fuwari).

```sh
# npm
npm create fuwari@latest.

# yarn
yarn create fuwari.

# pnpm
pnpm create fuwari@latest

# bun
bun create fuwari@latest

# deno
deno run -A npm:create-fuwari@latest
```

1. Edita el archivo de configuración `src/config.ts` para personalizar tu blog.
2. Ejecuta `pnpm new-post <nombre-de-archivo>` para crear una nueva entrada y edítala en `src/content/posts/`.
3. Despliega tu blog en Vercel, Netlify, GitHub Pages, etc., siguiendo [las guías](https://docs.astro.build/en/guides/deploy/). Necesitas editar la configuración del sitio en `astro.config.mjs` antes del despliegue.

## 🚀 Cómo Usar 2

1. [Genera un nuevo repositorio](https://github.com/saicaca/fuwari/generate) desde esta plantilla o haz un fork de este repositorio.
2. Para editar tu blog localmente, clona tu repositorio, ejecuta `pnpm install` y `pnpm add sharp` para instalar las dependencias.
   - Instala [pnpm](https://pnpm.io) `npm install -g pnpm` si aún no lo tienes.
3. Edita el archivo de configuración `src/config.ts` para personalizar tu blog.
4. Ejecuta `pnpm new-post <nombre-de-archivo>` para crear una nueva entrada y edítala en `src/content/posts/`.
5. Despliega tu blog en Vercel, Netlify, GitHub Pages, etc., siguiendo [las guías](https://docs.astro.build/en/guides/deploy/). Necesitas editar la configuración del sitio en `astro.config.mjs` antes del despliegue.

## ⚙️ Cabecera de las Entradas

```yaml
---
title: Mi Primer Post en el Blog
published: 2023-09-09
description: Esta es la primera entrada de mi nuevo blog con Astro.
image: /images/cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
---
```

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto, desde una terminal:

| Comando                             | Acción                                            |
|:------------------------------------|:--------------------------------------------------|
| `pnpm install` y `pnpm add sharp`   | Instala las dependencias                          |
| `pnpm dev`                          | Inicia el servidor de desarrollo local en `localhost:4321` |
| `pnpm build`                        | Compila tu web para producción en `./dist/`     |
| `pnpm preview`                      | Previsualiza la web localmente, antes del despliegue |
| `pnpm new-post <nombre-de-archivo>` | Crea una nueva entrada                            |
| `pnpm astro ...`                    | Ejecuta comandos CLI como `astro add`, `astro check` |
| `pnpm astro --help`                 | Obtén ayuda para usar el CLI de Astro             |
