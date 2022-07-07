# Overview

This project is a visualizer for the universal Turing machine known as Langton's Ant as well as a variety of its extensions. Originally invented by Christopher Langton while a graduate student at the University of Michigan, his eponymous ant is a close cousin of (and is in fact isomorphic to) the more familiar construction of classical cellular automaton. In the original formulation, we imagine the movement of an ant across an infinite grid of, initially, entirely white squares. The ant's movement is governed by a simple ruleset: if on a white square, turn left, flip the square to black, and take one step forward; if on a black square, turn right, flip the square to white, and take one step forward. After some time following these rules, the motion of the ant undergoes a startling transition from chaos to order.

From this starting point, a variety of extensions come easily to mind, such as adding more colors to the set of possible grid cell states, changing the topology of the universe from, say, a rectangular grid to a hexagonal grid, and extending the number of states the ant itself can be in at any given timestep. This project allows a user to play with some of these extensions, and aspires to someday include several more.

# Getting Started

## Requirements

**Node 14.0.0** or later as well as a browser that supports WebWorkers (which is most).

_Note_: The experience on a mobile browser is subpar at the moment. A desktop browser is highly encouraged

## Building

After cloning this repository, you can run the app on a local development server by, at the repository root, running

```
npm start
```

or alternatively

```
yarn start
```

## Using

Upon opening, the app presents some (hopefully familar-ish looking) media controls for playing, pausing, and restarting a run of the current ruleset. A left side drawer allows you to change the ruleset dictating the imaginary ant's movement, and a right side drawer allows you to change the grid type between square and hexagonal, as well as providing an option to prerender a number of steps at the next simulation start. Clicking and dragging provides for panning of the canvas, while your scroll wheel allows for zooming in and out. Have fun!

# Motivations

In reading up on the Langton's Ant fromulation of cellular automata, I wanted to be able to quickly experiment with and see the outcomes of different rulesets as I was reading about the underlying theory. I also wanted to gain some further experience with React while exploring the then more recently released Hooks API. The project also allowed me to delve into the HTML5 Canvas API as well as HTML5 Web Workers, which is employed to handle the panning and zooming of the canvas. I'm also just fascinated by the connection here between a model of computation (the ant in this case) and mesmerizing animations that anyone can enjoy!

# Disclaimers

There is still a lot of work I would like to do here. Don't be surprised if you find strange rendering bugs, unimplemented buttons, or performance problems. Usually a reset or two of the animation will get you back to a sane state if something goes whacky. If you feel compelled to file an issue I would be very grateful!

# Further References

- [Studying Artificial Life With Cellular Automata](https://deepblue.lib.umich.edu/bitstream/handle/2027.42/26022/0000093.pdf;jsessionid=7427F41347B0263C76205E166EF46D07?sequence=1)
- [Chris Langton Explaining the Interaction of Multiple Ants](https://www.youtube.com/watch?v=w6XQQhCgq5c)
- [The Ultimate in Anty-Particles](https://web.archive.org/web/20160303211426/http://dev.whydomath.org/Reading_Room_Material/ian_stewart/AntyParticles.pdf)
- [Complexity of Lanton's Ant](https://reader.elsevier.com/reader/sd/pii/S0166218X00003346?token=A594988D9299F18E4E7EC2430AF3FE5C808E840080978DD037CEC237CFB3D7391FD186AD80365509CE64D0A2AADCBF25&originRegion=us-east-1&originCreation=20220707073526)

🐜🐜🐜🐜🐜🐜🐜🐜🐜🐜🐜🐜🐜🐜🐜🐜🐜
