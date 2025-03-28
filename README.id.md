# 🍥 Fuwari

Template blog statis yang dibuat dengan [Astro](https://astro.build).

[**🖥️ Demo Langsung (Vercel)**](https://fuwari.vercel.app) &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**📦 Versi Hexo Lama**](https://github.com/saicaca/hexo-theme-vivia) &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;

> Versi README: `2024-09-10`

![Gambar Pratinjau](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ Fitur

- [x] Dibangun dengan [Astro](https://astro.build) dan [Tailwind CSS](https://tailwindcss.com)
- [x] Animasi halus dan transisi halaman
- [x] Mode terang / gelap
- [x] Warna tema & banner yang bisa disesuaikan
- [x] Desain responsif
- [ ] Komentar
- [x] Pencarian
- [ ] Daftar isi (TOC)

## 🚀 Cara Menggunakan

1. [Buat repository baru](https://github.com/saicaca/fuwari/generate) dari template ini atau fork repository ini.
2. Untuk mengedit blog secara lokal, klon repository kamu, lalu jalankan `pnpm install` DAN `pnpm add sharp` untuk menginstal dependensi.
   - Instal [pnpm](https://pnpm.io) dengan `npm install -g pnpm` jika belum terpasang.
3. Edit file konfigurasi `src/config.ts` untuk menyesuaikan blog kamu.
4. Jalankan `pnpm new-post <filename>` untuk membuat postingan baru dan edit di `src/content/posts/`.
5. Deploy blog kamu ke Vercel, Netlify, GitHub Pages, dll., dengan mengikuti [panduan ini](https://docs.astro.build/en/guides/deploy/). Kamu juga perlu mengedit konfigurasi situs di `astro.config.mjs` sebelum deployment.

## ⚙️ Frontmatter untuk Postingan

```yaml
---
title: Postingan Blog Pertama Saya
published: 2023-09-09
description: Ini adalah postingan pertama di blog Astro saya.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp      # Atur hanya jika bahasa postingan berbeda dari bahasa situs di `config.ts`
---
```

## 🧞 Perintah

Semua perintah dijalankan dari root proyek melalui terminal:

| Perintah                             | Aksi                                              |
|:------------------------------------|:-------------------------------------------------|
| `pnpm install` DAN `pnpm add sharp` | Menginstal dependensi                            |
| `pnpm dev`                          | Menjalankan server pengembangan di `localhost:4321` |
| `pnpm build`                        | Membangun situs untuk produksi ke `./dist/`      |
| `pnpm preview`                      | Melihat pratinjau situs sebelum dideploy        |
| `pnpm new-post <filename>`          | Membuat postingan baru                          |
| `pnpm astro ...`                    | Menjalankan perintah CLI seperti `astro add`, `astro check` |
| `pnpm astro --help`                 | Menampilkan bantuan penggunaan CLI Astro        |
