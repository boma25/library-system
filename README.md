# WELCOME TO THE PRICEPALLY TAKE HOME TEST

## Table of content

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Running Docker](#running-on-docker)
- [Running Test](#running-tests)

## Introduction

The project was built in nest js and typescript, data base of choice is postgress, orm of choice is Prisma

all `get` api except:

- get borrows
- get borrows by id

are not protected, the above can only be accessed by a user with user privileges

all `put, post and delete` api's are admin protected except

- create borrow
- update borrow
- delte borrow

these are user protected and can only be accessed with user privileges

there are two auth api's

- login
- signup

login return you a jwt you can use for all other requests
sign up is just a bare api that creates a record in the database with no much validation. note all users created with the signup api have user privileges.

Note: all api's are prefixed with the `api/v1` i.e `localhost:${PORT}/api/v1/auth/login` also the api docs can be found at `localhost:${PORT}/api/api-docs`

### Getting started

to get started kindly fill out your .env file with the following

```
DATABASE_URL="****"
NODE_ENV="****"
PORT=****
JWT_SECRET="****"

// very important for docker
POSTGRES_USER="****"
POSTGRES_PASSWORD="****"
POSTGRES_DB="****"
```

> NOTE: replace the above with the correct credentials

Next step run `yarn install`

after you are don installing dependencies

run `yarn migration:run`

last but not least run `yarn db:seed`

this seeds in the default admin credentials into the database

```
email:  admin@admin.com
password: Super123*
```

### Running on docker

first things first ensure you have docker engine running on you computer next

ensure your env is updated as expected the run this command

> docker-compose up -d

to stop docker run

> docker-compose down

### Running tests

due to the time constraint all unit tests were completed but not all integration test was completed. simply run the command

> yarn test
