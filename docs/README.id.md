# 🍥 Fuwari

Template blog statis yang dibangun dengan [Astro](https://astro.build).

[**🖥️ Demo Langsung (Vercel)**](https://fuwari.vercel.app)

![Gambar Pratinjau](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

🌏 README dalam
[**中文**](https://github.com/saicaca/fuwari/blob/main/docs/README.zh-CN.md) /
[**日本語**](https://github.com/saicaca/fuwari/blob/main/docs/README.ja.md) /
[**한국어**](https://github.com/saicaca/fuwari/blob/main/docs/README.ko.md) /
[**Español**](https://github.com/saicaca/fuwari/blob/main/docs/README.es.md) /
[**ไทย**](https://github.com/saicaca/fuwari/blob/main/docs/README.th.md) /
[**Tiếng Việt**](https://github.com/saicaca/fuwari/blob/main/docs/README.vi.md) /
**Bahasa Indonesia (ini)** (Disediakan oleh komunitas, mungkin tidak selalu paling mutakhir)

## ✨ Fitur

- [x] Dibangun dengan [Astro](https://astro.build) dan [Tailwind CSS](https://tailwindcss.com)
- [x] Animasi dan transisi halaman yang halus
- [x] Mode terang / gelap
- [x] Warna tema & banner yang bisa dikustomisasi
- [x] Desain responsif
- [x] Fitur pencarian dengan [Pagefind](https://pagefind.app/)
- [x] [Fitur markdown tambahan](#-markdown-sintaks-ekstensi)
- [x] Daftar isi (Table of Contents)
- [x] RSS feed

## 🚀 Memulai

1. Buat repositori blog kamu:
    - [Generate repositori baru](https://github.com/saicaca/fuwari/generate) dari template ini atau fork repositori ini.
    - Atau jalankan salah satu perintah berikut:
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
2. Untuk mengedit blog secara lokal, klon repositori kamu, jalankan `pnpm install` untuk instalasi dependensi.
    - Install [pnpm](https://pnpm.io) `npm install -g pnpm` jika belum punya.
3. Edit file konfigurasi `src/config.ts` untuk menyesuaikan blog.
4. Jalankan `pnpm new-post <nama-file>` untuk membuat postingan baru dan edit di `src/content/posts/`.
5. Deploy blog ke Vercel, Netlify, GitHub Pages, dll. sesuai [panduan](https://docs.astro.build/en/guides/deploy/). Jangan lupa edit konfigurasi situs di `astro.config.mjs` sebelum deploy.

## 📝 Frontmatter Postingan

```yaml
---
title: Judul Postingan Pertama Saya
published: 2023-09-09
description: Ini adalah postingan pertama blog Astro saya.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: id   # Isi hanya jika bahasa postingan berbeda dari bahasa default di `config.ts`
---
```

## 🧩 Markdown Sintaks Ekstensi

Selain dukungan default Astro untuk [GitHub Flavored Markdown](https://github.github.com/gfm/), terdapat beberapa fitur tambahan:

- Admonisi ([Pratinjau & Cara Pakai](https://fuwari.vercel.app/posts/markdown-extended/#admonitions))
- Kartu repositori GitHub ([Pratinjau & Cara Pakai](https://fuwari.vercel.app/posts/markdown-extended/#github-repository-cards))
- Kode blok ekspresif lewat Expressive Code ([Pratinjau](https://fuwari.vercel.app/posts/expressive-code/) / [Dokumentasi](https://expressive-code.com/))

## ⚡ Perintah

Semua perintah dijalankan dari root proyek, via terminal:

| Perintah                     | Aksi                                                      |
|:-----------------------------|:----------------------------------------------------------|
| `pnpm install`               | Instalasi dependensi                                      |
| `pnpm dev`                   | Menjalankan server dev lokal di `localhost:4321`          |
| `pnpm build`                 | Build untuk produksi ke folder `./dist/`                  |
| `pnpm preview`               | Pratinjau hasil build sebelum deploy                      |
| `pnpm check`                 | Cek error atau masalah di kode                            |
| `pnpm format`                | Format kode dengan Biome                                  |
| `pnpm new-post <nama-file>`  | Membuat postingan baru                                    |
| `pnpm astro ...`             | Jalankan perintah CLI seperti `astro add`, `astro check`  |
| `pnpm astro --help`          | Bantuan menggunakan Astro CLI                             |

## ✏️ Kontribusi

Lihat [Panduan Kontribusi](https://github.com/saicaca/fuwari/blob/main/CONTRIBUTING.md) untuk detail tentang cara berkontribusi ke proyek ini.

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License.

---

> Dokumentasi ini tersedia dalam Bahasa Indonesia. Untuk bahasa lain, lihat README di direktori docs.
