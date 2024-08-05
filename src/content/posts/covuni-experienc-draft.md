---
title: covuni-experienc-draft
published: 2024-08-05
description: ''
image: ''
tags: []
category: ''
draft: true 
---

For July 2024,
I had the privilege of attending [Coventry University's Summer School](TODO: LINK TO THE WEBSITE)
organized by [Vishwaniketan Incubation Center](TODO: LINK TO THE WEBSITE)
(VIC from hereon).
This was a 4-week experience sold to us by VIC as "International Summer Internship."
However, when we got to the UK, it turned out to be summer school, which made more sense to me than internship.

This blog entry is a retro on what all I learnt and did during the summer school.
Also, this is from my perspective, and I already knew the basics of godot,
I participated in Game Maker's Toolkit's Game Jam in 2023 ([my submission to the game jam](TODO: LINK TO THE WEBSITE)).
I also know unity on a surface level due to uploading avatars and making minor changes to them for VRChat.
I feel like the best way to divide the content will be what I did each week,
however, I will avoid going into excruciating details about each topic, 
since that will just imply me practically copying their presentation.

---

# Week 1

For the first week, we got introduced to the unity game engine from complete scratch.
The professors didn't expect you to know anything about unity.
So we started with the UI of the editor, first lines in C# for unity,
how to run the games,
how to fix Visual Studio if the LSP
(Language Server Protocol, it's the thing that gives you the red squiggly line in your editor) doesn't work (which was really important since the LSP kept breaking for us lol),
and so on.

## Physics

After that, we moved on to what physics is in games and why it's important.
The professors then explained the key terms related to physics in unity and where they can be found.
They also explained how colliders are done in professional games. 
For me, the most significant part of this day was the event functions required to make colliders (and triggers) useful.
As the lab task of the day, we made a red square jump and move on a platform.
As an extra challenge, we were given skeleton pinball project.
In the project, we had to configure some parameters and write some scripts as glue code.

## Animation

On the next day we were taught how to use the animation system in unity, the 2 d and 3 d systems.
They started by explaining what a rig is for 3 d animations and how 3 d models are animated using it.
Then we were given a rundown on how to *actually* use the animation system,
that is, animator controller, animation clips,
the transitions required as glue, animation parameters, animator component, and finally, how to use the animator in code.
We then moved on to 2 d animation by using sprites and how to make them from spritesheets. 
As for the lab task, we made a flappy bird clone where the background moves and loops infinitely.
We also animated a Lora Croft inspired 2 d character.
We sliced her body parts from a spritesheet
and animated in a way where it looked like her body parts were connected using joints without using joints. 

Thus, they managed to complete the three core concepts required to make games. 

## My thoughts

All in all, I was surprised at how much the professors could condense down the content and even with that,
we were still able to complete the lab tasks during the afternoon sessions,
and we had excess time, at least for the first week (lol).

I anticipated that we would have lots of free time during the first week, and I was correct. 

# Week 2

The focus for the second week was AI used in games.
The major why the specific AI techniques used is their performance cost.
They are proven to work well on all kinds of hardware while also giving the illusion of intelligence.

## Navigation

Navigation is a big part
of making NPCs
seem intelligent by making them follow a path towards some target without getting stuck on a corner or some object.
The default algorithm for pathfinding in unity is A*
(I learnt A* by watching []() by [The Coding Train]() and while it's on the longer side,
I do recommend watching it since Daniel Shiffman
(TODO: CHECK HIS SPELLING) made it really easy to understand, and, also implemented it).
Unity uses NavMesh for navigation.
The topics they covered were NavMesh, Off-Mesh Link, NavMesh Obstacle, and NavMesh Agent.
They showed us how to generate a NavMesh by baking,
made a NavMesh Agent, and made the agent move to the target location by writing some glue code.
Then the professors taught about NavMesh Obstacles, why, and how to use it.

TODO: STUFF

## Finite State Machine (FSM)


