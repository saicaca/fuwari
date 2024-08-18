---
title: fractured-elements-breakdown
published: 2024-08-18
description: ''
image: ''
tags: []
category: ''
draft: false 
---

:::caution[TODO]

- [ ] link the github repo
- [ ] turn the file names into links to the file on github
- [ ] diagrams where possible

:::

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

| Player                         | Boss                         | Jump                                                                                                               |
|--------------------------------|------------------------------|--------------------------------------------------------------------------------------------------------------------|
| PlayerPrefabSwitcherOnTimer.cs | BossPrefabSwitcherOnTimer.cs | [Prefab Switcher on Timer](#prefab-switcher-on-timer)                                                              |
| PlayerController.cs            | BossController.cs            | [Player Controller](#player-controller) \| [Boss Controller](#boss-controller)                                     |
| InternalPlayerController.cs    | InternalBossController.cs    | [Internal Player Controller](#internal-player-controller) \| [Internal Boss Controller](#internal-boss-controller) |

Another special mention is the `ProjectileScript.cs` script used by both, the Player, and the Boss.

## Other Scripts

| Script Name              | Description                                                                                                                                                                                                     |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <br/>EnemyScript.cs<br/> | This script handles the AI for the normal enemies. <br/>The enemies have a `Circle Collider 2D` with trigger set to true. <br/>When this trigger is no longer being triggered, the enemy flips their direction. |
| HealthScript.cs          | Sets the player's max health to the health configured in the editor, can be set per level.                                                                                                                      |
| LevelScript.cs           | Checks if the number of enemies is zero, and then switches to the next level.                                                                                                                                   |

## Prefab Switcher on Timer

[Jump back](#important-scripts)

These scripts have a serialized field called `prefabs`. It is an array of `GameObject`.

This class is overly complex for the sake of being easy to use.
To switch prefabs, you need to change the `SpriteIndex`,
everything else will be handled by a chain of getters and setters.

This script also has a `changeCooldown` field.
This is the time in seconds after which the prefab will be switched automatically.

These scripts are applied to the root of player, and boss. 
They contain their respective internal controllers in code.

## Player Controller

[Jump back](#important-scripts)

Let us focus on the unique points of the player controller.
The `PlayerController` class has an instance of `PlayerPrefabSwitcherOnTimer`.
`PlayerPrefabSwitcherOnTimer` exposes the current internal controller via the public variable `CurrentInternalController`.
Now, `CurrentInternalController` exposes functions required for the player controller.

## Internal Player Controller

[Jump back](#important-scripts)

### Serialized Fields

| Name               | Type       | Usage                                                                                                                                                                                                                                                                                                                  |
|--------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| projectile         | GameObject | The projectile to spawn                                                                                                                                                                                                                                                                                                |
| projectileLocation | Transform  | The location where the projectile is spawned                                                                                                                                                                                                                                                                           |
| projectileVelocity | float      | The velocity of projectile when it's spawned                                                                                                                                                                                                                                                                           |
| attackTimePoint    | float      | The point of time in animation when the projectile is spawned.<br/>The time is normalized between 0 and 1, both inclusive.<br/>The script attempts to only spawn the projectile only once (due to how fragile the system is, sometimes the projectile doesn't spawn and other times it will be spawned multiple times) |

### Animation Parameters

| Parameter | Type    | Description                            |
|-----------|---------|----------------------------------------|
| attack    | trigger | plays the attack animation             |
| jump      | trigger | plays the jump animation               |
| run       | bool    | plays the running animation while true |

### Public Functions

| Name         | Return Type | Description                                                                                                      |
|--------------|-------------|------------------------------------------------------------------------------------------------------------------|
| SetRunning   | void        | Sets the animation parameter `running` boolean to `true`                                                         |
| ResetRunning | void        | Sets the animation parameter `running` boolean to `false`                                                        |
| Attack       | bool        | Sets the animation parameter `attack` trigger, returns false if the attack animation is playing, otherwise false |
| Jump         | bool        | If the player can jump, sets the animation parameter `jump` trigger and returns true, otherwise returns false    |
| FaceRight    | void        | Sets sprite to face `right` and changes the projectile location appropriately                                    |
| FaceLeft     | void        | Sets sprite to face `left` and changes the projectile location appropriately                                     |

### Note

One of the challenges I had to tackle was making the player attack.
I will explain it in the [Spawning projectiles at a specific moment in animation](#spawning-projectiles-at-a-specific-moment-in-animation) Section.

## Boss Controller

[Jump back](#important-scripts)



## Internal Boss Controller

[Jump back](#important-scripts)

### Serialized Fields

| Name               | Type       | Usage                                                                                                                                                                                                                                                                                                                                       |
|--------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| attackTriggerTime  | float      | (same as player)<br/>The point of time in animation when the projectile is spawned.<br/>The time is normalized between 0 and 1, both inclusive.<br/>The script attempts to only spawn the projectile only once (due to how fragile the system is, sometimes the projectile doesn't spawn and other times it will be spawned multiple times) |
| projectile         | GameObject | (same as player)<br/>The projectile to spawn                                                                                                                                                                                                                                                                                                |
| projectileLocation | Transform  | (same as player)<br/>The location where the projectile is spawned                                                                                                                                                                                                                                                                           |

### Animation Parameters

| Parameter | Type    | Description                                     |
|-----------|---------|-------------------------------------------------|
| attack    | trigger | (same as player)<br/>plays the attack animation |
| chase     | bool    | plays the running animation while true          |

### Public Functions

| Name            | Return Type | Description                                                                                                      |
|-----------------|-------------|------------------------------------------------------------------------------------------------------------------|
| Attack          | bool        | Sets the animation parameter `attack` trigger, returns false if the attack animation is playing, otherwise false |
| Chase           | bool        | Returns `true` if the animation parameter `chase` boolean was set to `true`, otherwise returns false             |
| StopChase       | void        | Sets the animation parameter `chase` boolean to `false`                                                          |
| SpawnProjectile | void        | Spawns the attack projectile                                                                                     |

### Note

Boss attacks use the same system as player attack
([Spawning projectiles at a specific moment in animation](#spawning-projectiles-at-a-specific-moment-in-animation))

Once the boss is killed, it switches the scene to the win screen.



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


