# 🍥Fuwari

[Astro](https://astro.build)로 구축된 정적 블로그 템플릿입니다.

[**🖥️미리보기 (Vercel)**](https://fuwari.vercel.app)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**📦Old Hexo Version**](https://github.com/saicaca/hexo-theme-vivia)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 English**](https://github.com/saicaca/fuwari/blob/main/README.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 中文**](https://github.com/saicaca/fuwari/blob/main/README.zh-CN.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 日本語**](https://github.com/saicaca/fuwari/blob/main/README.ja-JP.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 Español**](https://github.com/saicaca/fuwari/blob/main/README.es.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 ไทย**](https://github.com/saicaca/fuwari/blob/main/README.th.md)

> README 버전: `2025-04-24`

![Preview Image](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ 특징

- [x] [Astro](https://astro.build) 및 [Tailwind CSS](https://tailwindcss.com)로 구축됨
- [x] 부드러운 애니메이션 및 페이지 전환
- [x] 라이트 모드 / 다크 모드
- [x] 사용자 정의 가능한 테마 색상 및 배너
- [x] 반응형 디자인
- [ ] 댓글
- [x] 검색
- [x] 목차

## 요구 사항

- Node.js <= 22
- pnpm <= 9

## 🚀 사용하는 방법 1

[create-fuwari](https://github.com/L4Ph/create-fuwari)를 사용하여 로컬에서 프로젝트를 초기화합니다.

```sh
# npm
npm create fuwari@latest

# yarn
yarn create fuwari

# pnpm
pnpm create fuwari@latest

# bun
bun create fuwari@latest

# deno
deno run -A npm:create-fuwari@latest
```

1. 블로그를 사용자 정의하려면 `src/config.ts` 구성 파일을 편집하세요.
2. `pnpm new-post <filename>`을 실행하여 새 게시물을 만들고 `src/content/posts/`에서 편집하세요.
3. [가이드](https://docs.astro.build/en/guides/deploy/)에 따라 블로그를 Vercel, Netlify, GitHub 페이지 등에 배포하세요. 배포하기 전에 `astro.config.mjs`에서 사이트 구성을 편집해야 합니다.

## 🚀 사용하는 방법

1. 이 템플릿에서 [새 저장소를 생성](https://github.com/saicaca/fuwari/generate)하거나 이 저장소를 포크하세요.
2. 블로그를 로컬에서 편집하려면 저장소를 복제하고 `pnpm install` 및 `pnpm add sharp`를 실행하여 종속성을 설치하세요.  
   - 아직 [pnpm](https://pnpm.io)을 설치하지 않았다면 `npm install -g pnpm`을 실행하여 [pnpm](https://pnpm.io)을 설치하세요.
3. 블로그를 사용자 정의하려면 `src/config.ts` 구성 파일을 편집하세요.
4. `pnpm new-post <filename>`을 실행하여 새 게시물을 만들고 `src/content/posts/`에서 편집하세요.
5. [가이드](https://docs.astro.build/en/guides/deploy/)에 따라 블로그를 Vercel, Netlify, GitHub 페이지 등에 배포하세요. 배포하기 전에 `astro.config.mjs`에서 사이트 구성을 편집해야 합니다.

## ⚙️ 게시물의 머리말 설정

```yaml
---
title: 내 첫 블로그 게시물
published: 2023-09-09
description: 내 새로운 Astro 블로그의 첫 번째 게시물입니다!
image: /images/cover.jpg
tags: [푸, 바, 오]
category: 앞-끝
draft: false
lang: jp      # 게시물의 언어가 `config.ts`의 사이트 언어와 다른 경우에만 설정합니다.
---
```

## 🧞 명령어

모든 명령어는 프로젝트 최상단, 터미널에서 실행됩니다:

| Command                             | Action                                           |
|:------------------------------------|:-------------------------------------------------|
| `pnpm install` AND `pnpm add sharp` | 종속성을 설치합니다.                            |
| `pnpm dev`                          | `localhost:4321`에서 로컬 개발 서버를 시작합니다.      |
| `pnpm build`                        | `./dist/`에 프로덕션 사이트를 구축합니다.         |
| `pnpm preview`                      | 배포하기 전에 로컬에서 빌드 미리보기     |
| `pnpm new-post <filename>`          | 새 게시물 작성                                |
| `pnpm astro ...`                    | `astro add`, `astro check`와 같은 CLI 명령어 실행 |
| `pnpm astro --help`                 | Astro CLI를 사용하여 도움 받기                     |
