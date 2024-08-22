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

# TODO

- [x] link the github repo
- [x] turn the file names into links to the file on GitHub
- [ ] diagrams where possible
- [ ] # Spawning projectiles at a specific moment in animation
- [ ] generics thing for prefab switchers and internal controllers
- [ ] what could i have done to solve it, composition / inheritance instead of generics

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

The source code is available on GitHub

::github{repo="pawarherschel/CovUniGJ2024"}

and the game is available for download on [itch.io](https://pawarherschel.itch.io/fractured-elements)

## Collaborative Efforts with Shashank Bhave

Shashank Bhave was the key for the development of Fractured Elements.
He took on key responsibilities including level design, sourcing game art and music, and creating the game's lore.
His ability to independently research and execute these tasks allowed me
to concentrate on the technical challenges of implementing the form-switching mechanic.
This effective collaboration was crucial for meeting our project deadlines
and ensuring that the game's theme of continuous change was thoroughly integrated into the final product.

# Implementation Details

The project contains the following scripts:

- [BossController.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/BossController.cs)
- [BossPrefabSwitcherOnTimer.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/BossPrefabSwitcherOnTimer.cs)
- [EnemyScript.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/EnemyScript.cs)
- [HealthScript.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/HealthScript.cs)
- [InternalBossController.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/InternalBossController.cs)
- [InternalPlayerController.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/InternalPlayerController.cs)
- [LevelScript.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/LevelScript.cs)
- [PlayerController.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/PlayerController.cs)
- [PlayerPrefabSwitcherOnTimer.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/PlayerPrefabSwitcherOnTimer.cs)
- [ProjectileScript.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/ProjectileScript.cs)

## Important Scripts

The scripts related to the core mechanic of Continuously Changing are these:

| Player                                                                                                                                 | Boss                                                                                                                               | Jump                                                                                                               |
|:---------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------|
| [PlayerPrefabSwitcherOnTimer.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/PlayerPrefabSwitcherOnTimer.cs) | [BossPrefabSwitcherOnTimer.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/BossPrefabSwitcherOnTimer.cs) | [Prefab Switcher on Timer](#prefab-switcher-on-timer)                                                              |
| [PlayerController.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/PlayerController.cs)                       | [BossController.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/BossController.cs)                       | [Player Controller](#player-controller) \| [Boss Controller](#boss-controller)                                     |
| [InternalPlayerController.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/InternalPlayerController.cs)       | [InternalBossController.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/InternalBossController.cs)       | [Internal Player Controller](#internal-player-controller) \| [Internal Boss Controller](#internal-boss-controller) |

Another special mention is the [ProjectileScript.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/ProjectileScript.cs) script used by both, the Player, and the Boss.

## Other Scripts

| Script Name                                                                                                      | Description                                                                                                                                                                                                     |
|:-----------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <br/>[EnemyScript.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/EnemyScript.cs)<br/> | This script handles the AI for the normal enemies. <br/>The enemies have a `Circle Collider 2D` with trigger set to true. <br/>When this trigger is no longer being triggered, the enemy flips their direction. |
| [HealthScript.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/HealthScript.cs)                | Sets the player's max health to the health configured in the editor, can be set per level.                                                                                                                      |
| [LevelScript.cs](https://github.com/pawarherschel/CovUniGJ2024/blob/main/Assets/Script/LevelScript.cs)           | Checks if the number of enemies is zero, and then switches to the next level.                                                                                                                                   |

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

| Name                 | Type       | Usage                                                                                                                                                                                                                                                                                                                  |
|:---------------------|:-----------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| projectile           | GameObject | The projectile to spawn                                                                                                                                                                                                                                                                                                |
| projectileLocation   | Transform  | The location where the projectile is spawned                                                                                                                                                                                                                                                                           |
| projectileVelocity   | float      | The velocity of projectile when it's spawned                                                                                                                                                                                                                                                                           |
| <br/>attackTimePoint | <br/>float | The point of time in animation when the projectile is spawned.<br/>The time is normalized between 0 and 1, both inclusive.<br/>The script attempts to only spawn the projectile only once (due to how fragile the system is, sometimes the projectile doesn't spawn and other times it will be spawned multiple times) |

### Animation Parameters

| Parameter | Type    | Description                            |
|:----------|:--------|:---------------------------------------|
| attack    | trigger | plays the attack animation             |
| jump      | trigger | plays the jump animation               |
| run       | bool    | plays the running animation while true |

### Public Functions

| Name         | Return Type | Description                                                                                                      |
|:-------------|:------------|:-----------------------------------------------------------------------------------------------------------------|
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

The boss controller acts according to the below truth table

| can attack | can chase | action       |
|:-----------|:----------|:-------------|
| ❌false❌    | ❌false❌   | do nothing   |
| ❌false❌    | ✅true✅    | chase        |
| ✅true✅     | ❌false❌   | not possible |
| ✅true✅     | ✅true✅    | attack       |

The script also keeps track of two variables:
1. `attackSuccess`
2. `chaseSuccess`

These are returned by the functions from `InternalBossController`.
If the boss successfully chases after the player, then the script exits early.
Otherwise, the boss moves towards the player.

Once the boss is dead, the scene switches to the game win screen.

## Internal Boss Controller

[Jump back](#important-scripts)

### Serialized Fields

| Name               | Type       | Usage                                                                                                                                                                                                                                                                                                                                       |
|:-------------------|:-----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| attackTriggerTime  | float      | (same as player)<br/>The point of time in animation when the projectile is spawned.<br/>The time is normalized between 0 and 1, both inclusive.<br/>The script attempts to only spawn the projectile only once (due to how fragile the system is, sometimes the projectile doesn't spawn and other times it will be spawned multiple times) |
| projectile         | GameObject | (same as player)<br/>The projectile to spawn                                                                                                                                                                                                                                                                                                |
| projectileLocation | Transform  | (same as player)<br/>The location where the projectile is spawned                                                                                                                                                                                                                                                                           |

### Animation Parameters

| Parameter | Type    | Description                                     |
|:----------|:--------|:------------------------------------------------|
| attack    | trigger | (same as player)<br/>plays the attack animation |
| chase     | bool    | plays the running animation while true          |

### Public Functions

| Name            | Return Type | Description                                                                                                      |
|:----------------|:------------|:-----------------------------------------------------------------------------------------------------------------|
| Attack          | bool        | Sets the animation parameter `attack` trigger, returns false if the attack animation is playing, otherwise false |
| Chase           | bool        | Returns `true` if the animation parameter `chase` boolean was set to `true`, otherwise returns false             |
| StopChase       | void        | Sets the animation parameter `chase` boolean to `false`                                                          |
| SpawnProjectile | void        | Spawns the attack projectile                                                                                     |

### Note

Boss attacks use the same system as player attack
([Spawning projectiles at a specific moment in animation](#spawning-projectiles-at-a-specific-moment-in-animation))

Once the boss is dead, it switches the scene to the win screen.


# Level Design

:::caution[TODO: Shashank]

---

:::


# Technical Challenges

1. [Switching prefabs](#switching-prefabs)
2. [Spawning projectiles at a specific moment in animation](#spawning-projectiles-at-a-specific-moment-in-animation)
3. [Reusing the prefab switching code](#reusing-the-prefab-switching-code)
4. [Boss AI](#boss-ai)
5. [Projectile spawning system](#projectile-spawning-system)

## Switching prefabs

[Jump back](#technical-challenges)

> ![boss scripts hierarchy](https://r2.sakurakat.systems/fractured-elements-breakdown--boss-scripts-hierarchy.svg)

> ![player scripts hierarchy](https://r2.sakurakat.systems/fractured-elements-breakdown--player-scripts-hierarchy.svg)

> ![all scripts hierarchy](https://r2.sakurakat.systems/fractured-elements-breakdown--all-scripts-hierarchy.svg)

## Spawning projectiles at a specific moment in animation

[Jump back](#technical-challenges)

My first instinct was
to check if I can just call functions on a specific frame similar to Godot [^godot-docs-call-method-track] .
On a cursory search,
I found out
that I will need
to use [AnimationEvent](https://docs.unity3d.com/Manual/script-AnimationWindowEvent.html) [^unity-discussions-call-a-function-dependent-on-frame-of-animation] .
However, I didn't want to learn the unity animation event system,
and the event system in general with the short timeline.
So, I resorted to digging around in the Unity docs.

The function I used is 
[AnimatorStateInfo.normalizedTime](https://docs.unity3d.com/ScriptReference/AnimatorStateInfo-normalizedTime.html).

## Reusing the prefab switching code

[Jump back](#technical-challenges)



## Boss AI

[Jump back](#technical-challenges)

The boss AI is not complex.
The boss has two transforms attached to the root,
one acts as a reference point for the boss' "vision," and the other one for the boss' attack range.

The functions used to check are below

:::note[CanChase]

```c#
private bool CanChase()
{
    var position = chasePosition.position;
    var playerInRange = _player != null && Vector2.Distance(_player.transform.position, position) <
        Vector2.Distance(Vector2.zero, position);

    return playerInRange;
}
```

:::

:::note[CanAttack]

```c#
private bool CanAttack()
{
    var position = attackPosition.position;
    var playerInRange = _player != null && Vector2.Distance(_player.transform.position, position) <
        Vector2.Distance(Vector2.zero, position);

    return playerInRange;
}
```

:::

As you might be able to see, both the functions are very similar.

:::note[diff between `CanAttack` and `CanChase`]

```diff
- private bool CanAttack()
+ private bool CanChase()
  {
-     var position = attackPosition.position;
+     var position = chasePosition.position;
      var playerInRange = _player != null && Vector2.Distance(_player.transform.position, position) <
          Vector2.Distance(Vector2.zero, position);
  
      return playerInRange;
  }
```

:::

Looking at the code again, it can be refactored into this function.

```c#
private bool InRange(Vector3 position)
{
    var playerInRange = _player != null && Vector2.Distance(_player.transform.position, position) <
        Vector2.Distance(Vector2.zero, position);

    return playerInRange;
}
```

> ![boss](https://r2.sakurakat.systems/fractured-elements-breakdown--boss.png)

## Projectile spawning system

[Jump back](#technical-challenges)

I remember hearing about the way 
[Terraria](https://terraria.org/)
spawns projectiles,
and I wanted to implement it the same way.

The controller spawns the projectile, gives it a velocity, and then everything else is done in the projectile script.
This way I can customize the behavior of projectiles depending on what the projectile needs to do.

There are three projectiles in the game at the moment.

1. player's axe attack
2. player's bow and arrow's arrow
3. boss' attack

The player's axe attack and the boss' attack have 0 velocity,
therefore they are stationary attacks, and their time to live is very low.

On the other hand, the arrow has a velocity, and its time to live is long.

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


---

[^godot-docs-call-method-track]: https://docs.godotengine.org/en/stable/tutorials/animation/animation_track_types.html#call-method-track
[^unity-discussions-call-a-function-dependent-on-frame-of-animation]: https://discussions.unity.com/t/call-a-function-dependent-on-frame-of-animation/73890



