[![Dependency Status](https://www.versioneye.com/user/projects/54e2be9d8bd69f54f100005a/badge.svg?style=flat)](https://www.versioneye.com/user/projects/54e2be9d8bd69f54f100005a)

## Synopsis
Features on top of minecraft server
* Minecraft server backend API and misc functionalities implemented in PHP using CodeIgniter v3
* Minecraft server front-end web-app that display the information from the back-end API

## Details
The idea of this project is to create a wrapper around the game minecraft (v1.8) to propose a server self controlled by the community.
It currently support the following features:

* Automatic sign-up on white-list from the website
* Score system based on points calculated using the achievment system
* Hardcore mode with daily automatic resurrection based on number of lives
* Structure owner system to protect players from grief
* Analytics tool which details player action to identify lags & grief
* Reward system to encourage players to participate to the community effort
* Email templates to notify users on differents type of events
* Donation system using streamtip service

## Usage

There is currently no easy deployment and dependencies install, please ask for details. Here are the main steps:

* Set up frontend config for API base url
* Create Backend Crontab
* Update Backend configuration files
* Run migration script to set up database
* Install dependencies (minecraft overviewer & msm)
* Set up sudoers privileges

## TODO
* Create Event system
* Add player log in system (unique token)
* Migrate frontend to mvc framework
* API Documentation
* Backend deployment
