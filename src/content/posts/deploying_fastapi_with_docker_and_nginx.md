---
title: FastAPI - Beignner's Guide on deploying your FastAPI backend to production
published: 2024-04-24
description: A practical guide to help you with deploying a FastAPI backend with Docker and NGINX as a reverse proxying and configuring a subdomain so that your client can call APIs on it.
tags: [docker, fastapi, "nginx", deployments]
category: Guide
draft: false
---

## Reason for this post

I always had an issue deploying my backend services to a server, getting a server running, pushing the code, containerizing it, configuring a subdomain such that your client can hit an endpoint like `api.domain.com` and talk to your backend. But how does all of this come together, we will talk about that below together.

Whether you're new to FastAPI or looking to streamline your deployment process, this guide will provide you with step-by-step instructions to get your FastAPI application up and running in no time.

### Here's what you can expect from this blog post:

This is going to be a practical guide, so for any theoritical expalnations I will add relevant links, sorry but other wise the post will be too long. This is a step by step guide so follow these steps accordingly.

1. Setting Up the FastAPI Service locally and pushing it to a Git.
2. Getting a server and pulling the FastAPI service from a Git.
3. Dockerizing the FastAPI app and running it on the server.
4. Setting up a subdomain for your domain.
5. Configuring NGINX as a reverse proxy to redirect users to your FastAPI service when they come you your subdomain.
6. Configuring SSL certificates so that your backend endpoint is secure.
7. Conclusion: We'll wrap up with a summary of the key points covered in this guide and provide some additional resources for further exploration.

So let's get started!

#### 1. Setting Up the FastAPI Service locally and pushing it to a Git.

These steps will be agnostic of version controlling system you use, I am using Github.

- Create a folder and add a new virtual environment for your project.
- Initializing the FastAPI service, installing the packages and starting the server locally.
- Pushing code to Github.

#### 2. Getting a server and pulling the FastAPI service from a Git.

For the simplicity we will use Digital Ocean for getting a server, they call it a droplet. You can get an entry level droplet or if you already have a server on any other platform AWS, GCP, Azure you can use that. As long as you can SSH into it, it should be fine. I will use Digital Ocean.

1. Procuring a server: Signup, create a new droplet, base level droplet with $5-10/ month should be fine for now, you can scale it later based on your needs. Select SSH to login to the server while creation so that you can connect to it via your local systems terminal, it will ask you to add your local systems SSH key, do that.
2. SSH into server: Once the droplet is created SSH to the droplet from your local system's terminal. Update the packages via `sudo apt-get update`.
3. Create the new SSH keys for your new server: You will need these to pull your code from Git.
4. Pull the code from Git:
   I would suggest creating a new directory for your project to pull your code into.

```
mkdir project_name
cd project_name
git clone <Git clone link>
()
```

#### 3. Dockerizing the FastAPI app and running it on the server.

1. Installing Docker.
   https://docs.docker.com/engine/install/ubuntu/
2. Build a Docker Image for your FastAPI service.
3. Running the Docker Image as a Docker container.

#### 4. Setting up a subdomain for your domain.

1. UNderstanding subdomains.
2. Add the namespace configurations for your subdomain in the registrar.
   - Login to your registrar, GoDaddy, Hostinger, Cloudflare anything that you have domain purchased from. In my case it is Hostinger.
   - Go to Manage DNS for the domain you want to create subdomain for. All the registrar will have some conifguration available for managing DNS for a domain.
   - Add the following new namespace configuration for the domain and save.

```
type - A
name - subdomain (api)
value - IP address of your server
```

#### 5. Configuring NGINX as a reverse proxy to redirect users to your FastAPI service when they come you your subdomain.

1. Brief about NGINX, why we need it and installing NGINX on your server.
2. Understanding reverse proxying.
3. Adding configurations for NGINX to act as a reverse proxy and redirect the user to your running FastAPI service when they visit your subdomain.

#### 6. Configuring SSL certificates so that your backend endpoint is secure.

https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04

#### 7. Conclusion: We'll wrap up with a summary of the key points covered in this guide and provide some additional resources for further exploration.
