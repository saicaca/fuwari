---
title: NGINX - Reverse proxying your backend to a subdomain
published: 2024-04-24
description: A guide to help you with deploying a FastAPI service with Docker and NGINX
tags: [docker, fastapi, nginx, deployments]
category: Tutorial
draft: false
---

In the last post we saw how to deploy a FastApi service with Docker to a server. (If you have not checked it out yet check it here.) In this post we will see how we can use NGINX as a reverse proxy so that you can get a subdomain that your client side can use for calling the APIs.

### Here's what you can expect from this blog post:

1. Brief introduction to NGINX.
2. Understanding what is reverse proxying and how it works.
3. How to configure a subdomain for a domain.
