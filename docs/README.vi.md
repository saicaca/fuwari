# 🍥Fuwari  

Một mẫu blog tĩnh được xây bằng [Astro](https://astro.build).

[**🖥️ Xem bản dùng thử (Vercel)**](https://fuwari.vercel.app)

![Hình ảnh xem trước](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ Tính năng

- [x] Được xây dựng bằng [Astro](https://astro.build) và [Tailwind CSS](https://tailwindcss.com)
- [x] Có hoạt ảnh đổi chuyển trang mượt mà
- [x] Chế độ sáng / tối
- [x] Màu sắc và biểu ngữ có thể tùy chỉnh được
- [x] Thiết kế nhanh nhạy
- [x] Có chức năng tìm kiếm với [Pagefind](https://pagefind.app/)
- [x] [Có các tính năng mở rộng của Markdown](https://github.com/saicaca/fuwari?tab=readme-ov-file#-markdown-extended-syntax)
- [x] Có mục lục
- [x] Nguồn cấp dữ liệu RSS

## 🚀 Bắt đầu

1. Tạo kho lưu trữ blog của bạn:
    - [Tạo một kho lưu trữ mới](https://github.com/saicaca/fuwari/generate) từ mẫu này hoặc fork kho lưu trữ này.
    - Hoặc chạy một trong các lệnh sau:
       ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
       ```
2. Để chỉnh sửa blog của bạn trên máy cục bộ, hãy clone kho lưu trữ của bạn, chạy lệnh `pnpm install` để cài đặt các phụ thuộc..
    - Cài đặt [pnpm](https://pnpm.io) `npm install -g pnpm` nếu chưa có.
3. Chỉnh sửa tệp cấu hình `src/config.ts` để tùy chỉnh blog của bạn.
4. Chạy `pnpm new-post <filename>` để tạo một bài viết mới và chỉnh sửa nó trong `src/content/posts/`.
5. Triển khai blog của bạn lên Vercel, Netlify, GitHub Pages, etc. theo [chỉ dẫn](https://docs.astro.build/en/guides/deploy/). Bạn cần chỉnh sửa cấu hình trang web trong `astro.config.mjs` trước khi triển khai.

## 📝 Tiêu đề đầy đủ của bài viết

```yaml
---
title: Blog đầu tiên của mình
published: 2023-09-09
description: Đây là bài viết đầu tiên vủa mình trên trang blog tạo bằng Astro này.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp      # Chỉ đặt nếu ngôn ngữ của bài viết khác với ngôn ngữ của trang web trong `config.ts`
---
```

## 🧩 Cú pháp Markdown mở rộng

Ngoài việc Astro đã có hỗ trợ mặc định cho [Markdown vị Github](https://github.github.com/gfm/), một số tính năng Markdown khác cũng đã được bổ sung:

- Chêm xen ([Xem trước và Cách sử dụng](https://fuwari.vercel.app/posts/markdown-extended/#admonitions))
- Thẻ hiển thị kho lưu trữ GitHub ([Xem trước và Cách sử dụng](https://fuwari.vercel.app/posts/markdown-extended/#github-repository-cards))
- Các khối mã nâng cao với Expressive Code ([Xem trước](https://fuwari.vercel.app/posts/expressive-code/) / [Tài liệu](https://expressive-code.com/))

## ⚡ Lệnh

Tất cả các lệnh được chạy từ thư mục gốc của dự án, từ một bảng điều khiển:

| Lệnh                    | Mục đích                                              |
|:---------------------------|:----------------------------------------------------|
| `pnpm install`             | Cài đặt các phụ thuộc                               |
| `pnpm dev`                 | Khởi động máy chủ cục bộ tại `localhost:4321`         |
| `pnpm build`               | Xây dựng trang web của bạn vào `./dist/`             |
| `pnpm preview`             | Xem trước bản web cục bộ của bạn, trước khi triển khai        |
| `pnpm check`               | Chạy kiểm tra lỗi trong mã của bạn                 |
| `pnpm format`              | Định dạng mã của bạn bằng Biome                       |
| `pnpm new-post <filename>` | Tạo một bài viết mới                               |
| `pnpm astro ...`           | Chạy các lệnh CLI như `astro add`, `astro check`    |
| `pnpm astro --help`        | Nhận trợ giúp sử dụng Astro CLI                       |

## ✏️ Đóng góp

Xem [Hướng dẫn đóng góp](https://github.com/saicaca/fuwari/blob/main/CONTRIBUTING.md) để biết thêm chi tiết về cách đóng góp cho dự án này.

## 📄 Giấy phép

Dự án này đã được cấp Giấy phép MIT.
