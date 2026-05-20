# 🍥Fuwari

แม่แบบสำหรับเว็บบล็อกแบบ static สร้างด้วย [Astro](https://astro.build)

[**🖥️ ตัวอย่างการใช้งานจริง (Vercel)**](https://fuwari.vercel.app)

![ภาพตัวอย่าง](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ คุณสมบัติ

- [x] สร้างด้วย [Astro](https://astro.build) และ [Tailwind CSS](https://tailwindcss.com)
- [x] มีอนิเมชั่นและการเปลี่ยนหน้าอย่างลื่นไหล
- [x] โหมดสว่าง / โหมดมืด
- [x] ปรับแต่งสีธีมและแบนเนอร์ได้
- [x] Responsive design (หน้าตาเว็บปรับเปลี่ยนตามขนาดจอ)
- [x] ฟังก์ชันการค้นหา ขับเคลื่อนด้วย [Pagefind](https://pagefind.app/)
- [x] [คุณสมบัติเพิ่มเติมสำหรับมาร์กดาวน์](https://github.com/saicaca/fuwari/blob/main/docs/README.th.md#-markdown-extended-syntax)
- [x] สารบัญ
- [x] RSS feed
- [x] หน้าลิงก์เพื่อน
- [x] หน้าอนิเมะ Bilibili
- [x] หน้ารายการติดตาม Bilibili
- [x] หน้าแฟนคลับ Bilibili
- [x] หน้าฟีดไดนามิก Bilibili
- [x] หน้ารายการโปรด Bilibili
- [x] หน้า Moments
- [x] หน้าดนตรี
- [x] เครื่องเล่นเพลงบนแถบด้านข้าง
- [x] รองรับ i18n (อังกฤษ ญี่ปุ่น จีน เกาหลี สเปน ไทย เวียดนาม และอินโดนีเซีย)

## 🚀 เริ่มต้นใช้งาน

1. สร้าง repository ใหม่สำหรับบล็อกของคุณ:
    - [Generate repository ใหม่](https://github.com/saicaca/fuwari/generate) ขึ้นมาจากแม่แบบนี้ หรือจะ fork repository นี้ก็ได้
    - หรือจะสร้างโดยการเลือกรันคำสั่งต่อไปนี้ คำสั่งใดคำสั่งหนึ่ง:
       ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
       ```
2. เริ่มแก้ไขบล็อกของคุณแบบ local โดยการ clone repository ของคุณ (จากข้อ 1) ไว้ในเครื่องของคุณ แล้วรันคำสั่ง `pnpm install` เพื่อติดตั้ง dependencies ที่จำเป็น
    - ติดตั้ง [pnpm](https://pnpm.io) ด้วยคำสั่ง `npm install -g pnpm` ก่อน ถ้ายังไม่เคยติดตั้ง
3. แก้ไขไฟล์การตั้งค่า `src/config.ts` เพื่อปรับแต่งบล็อกของคุณ
4. รันคำสั่ง `pnpm new-post <filename>` เพื่อสร้างโพสต์ใหม่ใน `src/content/posts/` และแก้ไขไฟล์โพสต์นั้น ๆ ให้สมบูรณ์
5. Deploy เว็บบล็อกของคุณไปยัง Vercel, Netlify, GitHub Pages หรือบริการอื่น ๆ โดยอ้างอิงวิธีการจาก[คู่มือนี้](https://docs.astro.build/en/guides/deploy/) อย่าลืมแก้ไขการตั้งค่าเว็บไซต์ในไฟล์ `astro.config.mjs` ก่อนที่คุณจะ deploy เว็บ

## 📝 Frontmatter (ส่วนหัวไฟล์) ของโพสต์

```yaml
---
title: โพสต์แรกของฉัน
published: 2023-09-09
description: นี่คือโพสต์แรกของเว็บบล็อก Astro อันใหม่ของฉัน
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp      # เขียนค่านี้เมื่อภาษาของโพสต์นั้น ๆ แตกต่างจากภาษาของเว็บไซต์ที่ตั้งค่าไว้ใน `config.ts` เท่านั้น
---
```

## 🧩 Markdown Extended Syntax

เดิมที Astro มีการสนับสนุน[ภาษามาร์กดาวน์แบบของ GitHub](https://github.github.com/gfm/) ไว้อยู่แล้ว แต่ Fuwari ได้เพิ่มเติมคุณสมบัติพิเศษอื่น ๆ เข้าไปอีก:

- Admonitions หรือ กล่องข้อมูลพิเศษ ([ดูตัวอย่างและการใช้งาน](https://fuwari.vercel.app/posts/markdown-extended/#admonitions))
- การ์ด GitHub Repository ([ดูตัวอย่างและการใช้งาน](https://fuwari.vercel.app/posts/markdown-extended/#github-repository-cards))
- บล็อกโค้ดขั้นสูง ด้วย Expressive Code ([ดูตัวอย่าง](https://fuwari.vercel.app/posts/expressive-code/) / [เอกสารประกอบ](https://expressive-code.com/))

## ⚡ คำสั่ง

คำสั่งที่รันได้ใน terminal จาก root ของโปรเจกต์:

| คำสั่ง                       | การทำงาน                                               |
|:---------------------------|:-------------------------------------------------------|
| `pnpm install`             | ติดตั้ง dependencies                                      |
| `pnpm dev`                 | เปิดเซิร์ฟเวอร์สำหรับการพัฒนาแบบ local ที่ `localhost:4321`    |
| `pnpm build`               | Build เว็บไซต์สำหรับใช้งานจริงไปยังโฟลเดอร์ `./dist/`         |
| `pnpm preview`             | ดูตัวอย่าง build ของคุณแบบ local ก่อนที่จะ deploy จริง         |
| `pnpm check`               | ดำเนินการตรวจสอบหาข้อผิดพลาดในโค้ดของคุณ                    |
| `pnpm format`              | จัดรูปแบบโค้ดของคุณด้วย Biome                               |
| `pnpm new-post <filename>` | สร้างโพสต์ใหม่                                            |
| `pnpm astro ...`           | รันคำสั่ง CLI เช่น `astro add`, `astro check`              |
| `pnpm astro --help`        | แสดงวิธีใช้งาน Astro CLI                                  |

## ✏️ การมีส่วนร่วม

กรุณาอ่าน [แนวทางการมีส่วนร่วม](https://github.com/saicaca/fuwari/blob/main/CONTRIBUTING.md) สำหรับรายละเอียดวิธีการมีส่วนร่วมในโปรเจกต์นี้

## 📄 สัญญาอนุญาต

โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาตแบบ MIT License
