# MDRUN

Markdown code-block executor, mainly for
    - `YAML`: defines variables and configuration values
    - `SHELL`: executes shell commands
    - `SSH`: executes remote shell commands
    - `JavaScript`: executes scripts

<p align='center'>
    <img src='assets/background.jpg'/>
</p>

----


## `Infrastructure-as-Documentation`


----

[![Build Status](https://api.travis-ci.com/tenbits/mdrun.svg?branch=master)](https://app.travis-ci.com/github/tenbits/mdrun)
[![NPM version](https://badge.fury.io/js/mdrun.svg)](http://badge.fury.io/js/mdrun)


## Example

An example of `server.md`. The `.env` and the `ENV` values are preloaded.


````markdown

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Describe the project etc.

# deploy

Any text here... Here we define the the variables for the shell executor

```yml
ssh:
    host: example.foo
    # from environment, and supports also .env
    privateKeyPath: $KEY
    passphrase: $PASSPHRASE

name: mywebsite
domain: example.foo
```

Setup required dependencies

```sh
export DEBIAN_FRONTEND=noninteractive
apt update
apt install nodejs nginx npm -y
npm install -g n
n stable
npm i pm2 -g
pm2 startup
```

Create server directory

```sh
mkdir -p /var/www/$name
```

Setup the GIT repository for git deployments

```sh
git init --bare /var/www/$name.git

cat <<EOT >> /var/www/$name.git/hooks/post-receive
#!/bin/sh
git --work-tree=/var/www/$name --git-dir=/var/www/$name.git checkout -f
cd /var/www/$name
git --git-dir=/var/www/$name.git --work-tree=. submodule init
git --git-dir=/var/www/$name.git --work-tree=. submodule update
npm i
npm run build
pm2 start $name
EOT

chmod +x /var/www/$name.git/hooks/post-receive
```

Setup the nginx

```sh

rm /etc/nginx/sites-available/default

cat <<EOT >> /etc/nginx/sites-available/default
server {
    listen       80;
    server_name  $domain;
    location / {
        proxy_pass http://localhost:3000;
    }
}
EOT

service nginx restart
```

This was the example minimal deployment
````



### CLI

Execute shell commands from markdown

```shell
$ npm i mdrun -g
$ mdrun ./server.md

# or you can run the code only from specific h1 section(s), e.g. the deploy section from the example
$ mdrun ./server.md --run deploy
```


As we support `.env` files, you can execute the script with different environment variables:

```shell
$ mdrun ./server.md --env production
```

---
