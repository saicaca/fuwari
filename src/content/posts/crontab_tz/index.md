---
title: ubuntu中crontab时区调整
published: 2024-11-14
description: crontab设置定时运行后因为时区问题导致运行时间与预想不一致
tags: [crontab,timezone]
category: Record
image: ./images/crontab.png
draft: false
---
# 一键运行
```bash
apt install -y tzdata && timedatectl set-timezone Asia/Shanghai && timedatectl && timedatectl set-ntp true  && service cron restart
```