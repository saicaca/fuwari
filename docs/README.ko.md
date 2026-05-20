# 🍥Fuwari

[Astro](https://astro.build)로 구축된 정적 블로그 템플릿입니다.

[**🖥️미리보기 (Vercel)**](https://fuwari.vercel.app)

![Preview Image](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ 특징

- [x] [Astro](https://astro.build) 및 [Tailwind CSS](https://tailwindcss.com)로 구축됨
- [x] 부드러운 애니메이션 및 페이지 전환
- [x] 라이트 모드 / 다크 모드
- [x] 사용자 정의 가능한 테마 색상 및 배너
- [x] 반응형 디자인
- [x] [Pagefind](https://pagefind.app/)를 이용한 검색 기능
- [x] [Markdown 확장 기능](https://github.com/saicaca/fuwari?tab=readme-ov-file#-markdown-extended-syntax)
- [x] 목차
- [x] RSS 피드
- [x] 친구 링크
- [x] Bilibili 방영작 페이지
- [x] Bilibili 팔로우 페이지
- [x] Bilibili 팬 페이지
- [x] Bilibili 동적 페이지
- [x] Bilibili 즐겨찾기 페이지
- [x] 모멘트 페이지
- [x] 음악 페이지
- [x] 사이드바 음악 플레이어
- [x] i18n 지원(영어, 일본어, 중국어, 한국어, 스페인어, 태국어, 베트남어, 인도네시아어)

## 🚀 시작하기
1. 블로그 저장소를 생성하세요:
   - 이 템플릿에서 [새 저장소를 생성](https://github.com/saicaca/fuwari/generate)하거나 이 저장소를 포크하세요.
   - 또는 다음 명령어 중 하나를 실행하세요:
   ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
   ```
2. 로컬에서 블로그를 수정하려면, 저장소를 복제하고 `pnpm install`을 실행하여 종속성을 설치하세요.
   - [pnpm](https://pnpm.io)이 설치되어 있지 않다면 `npm install -g pnpm`을 실행하여 설치하세요.
3. `src/config.ts`설정 파일을 수정하여 블로그를 커스터마이징하세요.
4. `pnpm new-post <filename>`을 실행하여 새 게시물을 만들고 `src/content/posts/`에서 수정하세요.
5. [가이드](https://docs.astro.build/en/guides/deploy/)에 따라 블로그를 Vercel, Netlify, Github Pages 등에 배포하세요. 배포하기 전에 `astro.config.mjs`에서 사이트 구성을 수정해야 합니다.

## ⚙️ 게시물의 머리말 설정

```yaml
---
title: 내 첫 블로그 게시물
published: 2023-09-09
description: 내 새로운 Astro 블로그의 첫 번째 게시물입니다!
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp      # 게시물의 언어가 `config.ts`의 사이트 언어와 다른 경우에만 설정합니다.
---
```
## 🧩 마크다운 확장 구문
Astro의 기본 [GitHub Flavored Markdown](https://github.github.com/gfm/) 지원 외에도 몇 가지 추가적인 마크다운 기능이 포함되어 있습니다.
- Admonitions ([미리보기 및 사용법](https://fuwari.vercel.app/posts/markdown-extended/#admonitions))
- GitHub 저장소 카드 ([미리보기 및 사용법](https://fuwari.vercel.app/posts/markdown-extended/#github-repository-cards))
- Expressive Code를 사용한 향상된 코드 블록 ([미리보기](https://fuwari.vercel.app/posts/expressive-code/) / [문서](https://expressive-code.com/))



## ⚡ 명령어

모든 명령어는 프로젝트 최상단, 터미널에서 실행됩니다:

| Command                             | Action                                           |
|:------------------------------------|:-------------------------------------------------|
| `pnpm install` | 종속성을 설치합니다.                            |
| `pnpm dev`                          | `localhost:4321`에서 로컬 개발 서버를 시작합니다.      |
| `pnpm build`                        | `./dist/`에 프로덕션 사이트를 구축합니다.         |
| `pnpm check`                        | 코드에서 오류를 확인합니다.         |
| `pnpm format`                        | Biome을 사용하여 코드를 포멧합니다.         |
| `pnpm preview`                      | 배포하기 전에 로컬에서 빌드 미리보기     |
| `pnpm new-post <filename>`          | 새 게시물 작성                                |
| `pnpm astro ...`                    | `astro add`, `astro check`와 같은 CLI 명령어 실행 |
| `pnpm astro --help`                 | Astro CLI를 사용하여 도움 받기                     |

## ✏️ 기여
이 프로젝트에 기여하는 방법에 대한 자세한 내용은 [기여 가이드](https://github.com/saicaca/fuwari/blob/main/CONTRIBUTING.md)를 확인하세요.

## 📄 라이선스
이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari?ref=badge_large&issueType=license)
