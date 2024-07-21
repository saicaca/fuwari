# 🍥Fuwari

[Astro](https://astro.build) で構築された静的ブログテンプレート

[**🖥️ライブデモ (Vercel)**](https://fuwari.vercel.app)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**📦旧 Hexo バージョン**](https://github.com/saicaca/hexo-theme-vivia)

> README バージョン：`2024-04-07` 

![Preview Image](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ 特徴

- [x] [Astro](https://astro.build) 及び [Tailwind CSS](https://tailwindcss.com) で構築
- [x] スムーズなアニメーションとページ遷移
- [x] ライト/ダークテーマ対応
- [x] カスタマイズ可能なテーマカラーとバナー
- [x] レスポンシブデザイン
- [ ] コメント機能
- [x] 検索機能
- [ ] 目次

## 🚀 使用方法

1. [テンプレート](https://github.com/saicaca/fuwari/generate)から新しいリポジトリを作成するかCloneをします。
2. ブログをローカルで編集するには、リポジトリをクローンした後、`pnpm install` と `pnpm add sharp` を実行して依存関係をインストールします。  
   - [pnpm](https://pnpm.io) がインストールされていない場合は `npm install -g pnpm` で導入可能です。
3. `src/config.ts` ファイルを編集する事でブログを自分好みにカスタマイズ出来ます。
4. `pnpm new-post <filename>` で新しい記事を作成し、`src/content/posts/`.フォルダ内で編集します。
5. 作成したブログをVercel、Netlify、GitHub Pagesなどにデプロイするには[ガイド](https://docs.astro.build/ja/guides/deploy/)に従って下さい。加えて、別途デプロイを行う前に `astro.config.mjs` を編集してサイト構成を変更する必要があります。

## ⚙️ 記事のフロントマター

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: /images/cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
---
```

## 🧞 コマンド

すべてのコマンドは、ターミナルでプロジェクトのルートから実行する必要があります:

| Command                             | Action                                      |
|:------------------------------------|:--------------------------------------------|
| `pnpm install` AND `pnpm add sharp` | 依存関係のインストール                                 |
| `pnpm dev`                          | `localhost:4321` で開発用ローカルサーバーを起動            |
| `pnpm build`                        | `./dist/` にビルド内容を出力                         |
| `pnpm preview`                      | デプロイ前の内容をローカルでプレビュー                         |
| `pnpm new-post <filename>`          | 新しい投稿を作成                                    |
| `pnpm astro ...`                    | `astro add`, `astro check` の様なコマンドを実行する際に使用 |
| `pnpm astro --help`                 | Astro CLIのヘルプを表示                            |
