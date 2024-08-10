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
I had the privilege
of attending [Coventry University's Summer School](https://www.coventry.ac.uk/study-at-coventry/summer-schools/)
(at the time of writing, this is what comes up when you search for "Coventry university summer school")
organized by [Vishwaniketan Incubation Center](https://vic.vishwaniketan.edu.in/)
(VIC from hereon).
This was a 4-week experience sold to us by VIC as ["International Summer Internship"](https://ugfellowship.vishwaniketan.edu.in/).
However, when we got to the UK, it turned out to be summer school, which made more sense to me than internship.

This blog entry is a retro on what all I learnt and did during the summer school.
Also, this is from my perspective, and I already knew the basics of Godot,
I participated in Game Maker's Toolkit's Game Jam in 2023 ([my submission to the game jam](https://pawarherschel.itch.io/cosmos-conquerors)).
I also know unity on a surface level due to uploading avatars and making minor changes to them for VRChat.
I feel like the best way to divide the content will be what I did each week,
however, I will avoid going into excruciating details about each topic, 
since that will just imply me practically copying their presentation.

---

# Week 1

For the first week, we got introduced to the unity game engine from complete scratch.
The professors didn't expect you to know anything about unity,
so, we started with the UI of the editor, first lines in C# for unity,
how to run the games,
how to fix Visual Studio if the LSP
(Language Server Protocol, the thing that gives you the red squiggly line in your editor) doesn't work (which was really important since the LSP kept breaking for us lol),
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

All in all, to my surprise, the professors could condense down the content and even with that,
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
seem intelligent by making them follow a path towards some target without getting stuck on a corner or on some object.
The default algorithm for pathfinding in unity is A*
(I learnt A* by watching [A* Pathfinding Algorithm (Coding Challenge 51 - Part 1)](https://www.youtube.com/watch?v=aKYlikFAV4k) 
by [The Coding Train](https://www.youtube.com/@TheCodingTrain).
While it's on the longer side and has three parts,
I do recommend watching it since Daniel Shiffman
made it really easy to understand, and, also implemented it).

Unity uses NavMesh for navigation.
The topics they covered were NavMesh, Off-Mesh Link, NavMesh Obstacle, and NavMesh Agent.
They showed us how to generate a NavMesh by baking it in the editor,
made a NavMesh Agent, and made the agent move to the target location by writing some glue code.
Then the professors taught about NavMesh Obstacles, why, and how to use it.

The lab task for the day was to make a character which pathfinds to a sphere using the NavMesh System.
For the challenge, we had to make it so that you can move the target sphere and the character will still follow it.
The challenge wasn't challenging enough for me,
so I wanted to make the character use auto generated Off Mesh Links
and I did it by changing the cost for surfaces to wacky numbers.


## Finite State Machine (FSM)

The second AI technique we learnt about was FSM.
The professors gave us examples of what good AI and bad AI are
by showing us example videos and explaining why they're good or bad.
They then explained where exactly does FSM fit into the pipeline
and gave some example of a rudimentary way to implement FSM by chaining if-else.

To me, FSM is interesting because if the language has a strong type system and supports generics then its possible to get a type-safe FSM. 
The technique mentioned in the last sentence is called typestate 
([Wikipedia article for Typestate analysis](https://en.wikipedia.org/wiki/Typestate_analysis) and
[Encoding States and Behavior as Types from The Rust Programming Language book](https://doc.rust-lang.org/book/ch17-03-oo-design-patterns.html#encoding-states-and-behavior-as-types)), 
which I have implemented before in rust.
Typestate pattern can be used in C# as well, however, I didn't use it myself due to how much time it would have required.

We have already used FSMs in Unity, the animation tree is an example of FSM.
The states are the available animations,
the parameters along with the conditions are the state transitions, and the animation being played is the current state.

FSMs are also an example of event driven programming 
([Wikipedia entry for Event-driven finite-state machine](https://en.wikipedia.org/wiki/Event-driven_finite-state_machine)), 
which you might be familiar with if you use JavaScript/Typescript/ECMAScript (whatever, idfk what its called).
I have used event driven programming in Godot with the help of [signals](https://docs.godotengine.org/en/stable/classes/class_signal.html) 
([Godot documentation for Using Signals](https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html)).
They made connecting scripts really easy.
Unity also has an [Event System](https://docs.unity3d.com/560/Documentation/Manual/EventSystem.html)
but I didn't feel confident in myself to learn how to make events and connect scripts using them by using the Unity docs.
(Tangent:
the documentation for both Godot and Rust is really good and easy to understand. On the other hand,
Unity's and Java's official documentation is scary and it was hard for me.)

The professors recommended (or at least they only taught)
us to make an abstract class with all the functions and then use inheritance to create actual classes for the states.
Coming from Rust, composition would have been my choice rather than inheritance.

There were three lab tasks we had to do,
Implementing a basic If/else FSM,
Implementing a FSM using Rabin events, and
Implementing a FSM using the State Pattern.
The project we made was a cat pathfinding to a chicken,
and when the cat is in a certain radius of the chicken, the chicken tried to flee. 
The challenge was creating an first person controller,
which can shoot spheres, and a cube which will follow the player,
once the cube is shot, it will stop following the player.

## My thoughts

Week 2 was interesting, its where majority of the learning happened for me, and it was the most information dense week.
While I was familiar with (or even used) the techniques,
it was still fun to learn about the history and the whys of the techniques.
This is the reason I love the academic setting.

# Week 3

The third week was all about game design and how it's done in the industry.
I am not a creative person, I am a developer.
I take in requirements, and spit out code to the best of my ability.
On the other hand, I have no idea how to make a game fun,
I can add game mechanics and build a game around them, however, I won't be able to make it a fun experience.
But, it's important to know what the designers do and what their struggles are.
That way I can contribute more to the team while also somewhat bridging the gap between developers and designers.

While the second week was all the things I wanted to learn, the third week was not as interesting for me. 

## High Concept Document (HCD)

We made an HCD for a game idea we got from [Game Idea Generator](https://ygd.bafta.org/resources/game-idea-generator).
I was going to put the document I made for the [SCP-3008](https://scp-wiki.wikidot.com/scp-3008)
(the IKEA store) inspired game, but due to technical issues i wasn't able to save the file...

## Game Mechanics

## Level Design

## Storytelling with Games

# Week 4 and wrapping up

During the fourth week, as a culmination of all our efforts and knowledge, we participated in a game jam hosted by
[Mohilly](https://mohilly.itch.io/),
[ae2720](https://ae2720.itch.io/),
[ae2791](https://ae2791.itch.io/), and 
[ab8809](https://ab8809.itch.io/) at [itch.io](https://itch.io/jam/summer-school-24).

The requirements for the game jam were:
 - 2D Platformer
    - Create a game in the 2D platformer genre, focusing on movement, jumping, and
      exploration 
 - Continuous Change
    -  Implement mechanics that highlight the theme. This could include
       changing environments, shifting levels, evolving abilities, or any other creative interpretation
   
We satisfied the requirements by creating a 2 d platformer where every level fits in one screen. 
The theme of `Continuous Change` was incorporated by changing the player character and their abilities every few seconds.

We decided to name the resulting game `Fractured Elements`. Its available for download at [itch.io](https://pawarherschel.itch.io/fractured-elements)
and the source code is available on GitHub [link to repo](https://github.com/pawarherschel/CovUniGJ2024).

In my next blog post, I want to go into how the game works.