---
title: fractured-elements-breakdown
published: 2024-08-18
description: ''
image: ''
tags: []
category: ''
draft: false 
---

# Introduction

In the previous post,
I shared my experience attending Coventry University's Summer School
and provided a week-by-week breakdown of the program. 
As a culmination of all our efforts, we participated in a game jam during the final week,
which was an exciting and intense experience. 
Together with Shashank Bhave, we created a 2D platformer titled `Fractured Elements`. 

## Purpose of the Current Post

In this blog post, I will dive into the technical aspects of how we built Fractured Elements.
I'll discuss the game's mechanics,
how we implemented the core theme of "Continuous Change," and the challenges we faced during development.
Shashank will then share his insights on level design.

# Concept and Design of Fractured Elements

## Overview of Game Concept

`Fractured Elements` is a 2D platformer where the core mechanic is the constant switching between different elemental forms.
The player needs to juggle platforming, killing enemies, and the switching between forms.

The game was inspired by 
[Celeste](https://www.celestegame.com/), 
[Super Meat Boy](https://store.steampowered.com/app/40800/Super_Meat_Boy/), 
[Dungreed](https://store.steampowered.com/app/753420/Dungreed/),
[Terraria](https://terraria.org/),
and various other games.

## Collaborative Efforts with Shashank Bhave

Shashank Bhave was the key for the development of Fractured Elements.
He took on key responsibilities including level design, sourcing game art and music, and creating the game’s lore.
His ability to independently research and execute these tasks allowed me
to concentrate on the technical challenges of implementing the form-switching mechanic.
This effective collaboration was crucial for meeting our project deadlines
and ensuring that the game's theme of continuous change was thoroughly integrated into the final product.

# Implementation Details

The project contains the following scripts:

- BossController.cs
- BossPrefabSwitcherOnTimer.cs
- EnemyScript.cs
- HealthScript.cs
- InternalBossController.cs
- InternalPlayerController.cs
- LevelScript.cs
- PlayerController.cs
- PlayerPrefabSwitcherOnTimer.cs
- ProjectileScript.cs

## Important Scripts

The scripts related to the core mechanic of Continuously Changing are these:

| Player                         | Boss                         |
|--------------------------------|------------------------------|
| PlayerPrefabSwitcherOnTimer.cs | BossPrefabSwitcherOnTimer.cs |
| PlayerController.cs            | BossController.cs            |
| InternalPlayerController.cs    | InternalBossController.cs    |

Another special mention is the `ProjectileScript.cs` script which is used by both, the Player, and the Boss.

## Other Scripts

| Script Name              | Description                                                                                                                                                                                                     |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <br/>EnemyScript.cs<br/> | This script handles the AI for the normal enemies. <br/>The enemies have a `Circle Collider 2D` with trigger set to true. <br/>When this trigger is no longer being triggered, the enemy flips their direction. |
| HealthScript.cs          | Sets the player's max health to the health configured in the editor, can be set per level.                                                                                                                      |
| LevelScript.cs           | Checks if the number of enemies is zero, and then switches to the next level.                                                                                                                                   |



### EnemyScript.cs

This script handles the AI for the normal enemies.
The enemies have a `Circle Collider 2D` with trigger set to true.
When this trigger is no longer being triggered, the enemy flips their direction.



---

:::note[skeleton given by chatgpt]

---

# Introduction
## Overview of the Previous Post
## Purpose of the Current Post

# Concept and Design of Fractured Elements
## Overview of Game Concept
## Core Mechanics and Unique Features
## Collaborative Efforts with Shashank Bhave

# Implementation Details
## Character Design and Form Switching
## Combat and Platforming Mechanics
## Integration of Continuous Change Theme

# Level Design
## Overview of Level Structure
## Challenges Faced and Solutions
## Shashank Bhave’s Role in Level Creation

# Technical Challenges
## Issues Encountered During Development
## Strategies for Overcoming Technical Hurdles
## Reflections on the Learning Process

# Final Outcome and Reflections
## Reception of Fractured Elements
## Personal Reflections on the Game Jam Experience
## Lessons Learned and Future Directions

# Conclusion
## Summary of Key Points
## Future Plans and Next Steps

:::


