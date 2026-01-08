---
layout: post
title: "Living Out Loud With ADHD \u2013 Episode 3: Elvanse long-term"
date: "2026-01-02"
excerpt: "My experience with ADHD and what has been working so far ever since starting on medication. This episode is about the usage of Elvanse long-term. "
image: "/assets/images/unsplash-1675524375084.jpg"
tags:
  - ADHD
featured: true
---

# Some necesary background

Quick mandatory reminder 👇
<div class="kg-card kg-callout-card kg-callout-card-blue" ><div class="kg-callout-emoji">⚠️</div><div class="kg-callout-text" markdown="1">**This is not medical information**, nor am I a trained physician or any kind of expert in ADHD. I'm just another ADHDer untangling the data I got and detailing my own personal experience and effects (if any) of meds. 

If you think any of this relates to you, don't take it on your own hands, discuss it with your doctor. If any of it particularly helped you or you think I might be on the wrong track feel free to let me know. Interactions are **encouraged**.
</div></div>

# Some issues I've encountered from trying to operate in a way I am not used to

I think the main issue we've got to discuss globally is the fact I've functioned 39 years more or less succesffully without any medication. That means I have 39 years of workarounds and systems put in place, and behaviours to control what I thought was generic distractability and procrastination. For the most part, my ADHD only bothers me half the day when I'm not medicated, when these ways have exhausted my brain as even as hardcoded as they are, they are still forcing a machine to work in ways it shouldn't be doing.

**The main good thing:** On meds I start lots of things that I normally don't even have the drive to start, and I would do them to completion, but in the path to that; **the main bad thing:** everything else gets accumulated.

## 1. Priorities are hard to measure with extra dopamine

Without any extra dopamine all tasks feel as if they have the same weight so when you try to trust your guts and do what "feels right" you're indeed doing what reason tells you it is right.

With dopamine in abundance, that doesn't work, what feel rights is actually a scale of different things, the ones you do enjoy have a much bigger weight and the ones that were reasonably important become somehow less so. It's ridiculously easy to lose track on something you were even slightly passionate about and realise when it is too late in the day.

Deciding on priorities is a lot harder off the meds. I cannot stop a task until I finish it with meds, the problem is that task might not be the most important one for that day.

## 2. The Sargent™️ is missing and LIFO does not work.

Unmedicated I normally have this inner voice I call "The Sargent" that reminds me what's the main task I'm doing every few minutes and what other things I have to do, so I don't lose track of what I'm doing with some distraction. That voice is gone now. So what keeps me on track is now passion, which is easy to let myself get carried away with.

So my days require a lot more planning because whatever I'm doing I'm going to lose track of any other thing I had to do that day unless I keep checking.

Normally, unmedicated LIFO (last-in, first-out) works, I can be doing a main task and distractions come in that are necessary to remove to carry on with main task. This stack scheduling does not work at all medicated. The stack just keeps getting bigger because I keep forgetting the main task and getting carried away. So the only thing that works for me is to outsource The Sargent.

I have a humongous Fish shell script that prints a banner with the main task, duration, when I stated and whenever I get distracted, I run another command from that script file to record the distraction. The whole system is markdown based and kept in my obsidian vault, except the Fish shell file.
![Image](/assets/images/2026-01-image-2.png)
So today for that we get this, so far:
![Image](/assets/images/2026-01-image-3.png)
Without this artificial version of The Sargent, I wouldn't get anything done at all. So I'm introducing automation left and right to avoid making decisions the whole day and wasting hours on analysis paralysis.

I'm also going to rewrite this tool to remind me every 5 minutes of the task I'm doing instead, I just need to figure how to disable all other desktop notifications in the process.
<details markdown="1">
<summary>Update on 7th of January of 2026</summary>

I made my script show this in the middle of the screen using Zenity every five minutes. I think as it is it could be useful to other people so [here it is.](https://gist.github.com/maikelthedev/9695bcec08f85e36a613c7bcbdc3cd09#file-add-distraction-fish-L691)

### How it works

1. My daily journals in Obsidian have a section called "What I do want from today" in there every day I write the main tasks I need to get done.

2. In hyprland if I click Win+I it inserts a distraction, by asking me what is distracting me using Zenity for GUI creation from Fish shell.

3. If none of the tasks are currently active, it'll ask me which one is the main one I've been distracted from, once clicked, it'll mark when I started it.

4. Every five minutes that box below will show on the screen, you can clearly change this, but 5 minutes is enough for me, i can get rid of it with a quick enter key press, no mouse needed. YES, I WANT IT AS INTRUSIVE as I normally am off meds, that's how bad it gets on meds for me. I want it to mimic the behaviour of my internal scheduler.

5. It creates urgency on the main task.

6. I can move onto a new task by the shortcut Win+Ctrl+I, that runs "new-task" and writes on Obsidian the time it took to complete the previous one. If you have the right skin in Obsidian it'll change "[/]" for "[x]" and you'll notice it looks differnet, not all themes of Obsidian show "[/]" different to "[x]". The "[/]" exists to mark when a tasks is ongoing (not completed, but started). It'll also write there when I finished and how long it took.

It is incomplete but so far useful. Of course you can make the keys be whatever you want or use none and just call it from the terminal. The keys are not defined anywhere, they are just key bindings in my hyprland config to commands of the script.

</details>

![Image](/assets/images/2026-01-image-7.png)
## 4. Tyrosine matters

This is plain simple, less than 1 gram of tyrosine supplementation per day and the effects of Elvanse (Medikinet too) were jerky or erratic. Get the gram of tyrosine (at least first thing together with the Elvanse) and the effect just maintains the whole day.

So now I'm force to supplement myself with tyrosine. At least is cheap.

## 5. Sleeping is better but more rigid in some ways and flexible in others

I'm slowly realising I can sleep anytime, at any moment when I want to do so, but under some rules. Being able to put the mind in blank is the main rule, which I can do under the effect of the meds. Once the effect starts to fade it becomes increasingly harder.

It doesn't matter much when I wake up, what I'm realising matters **the most** is that I stay consistent in the time I take the pill. I can take it at 7am every day and still go back to sleep. If I don't, and I take it whenever I wake up and that time is noon, I'm going to struggle to go to sleep early that day, and then we enter a vicious circle of taking the pill each day later and going to sleep later. So taking the medication at the exact same time every day is crucial, more so than waking up every day at the same hour.

So now I have the pill prepared with a lot of water by the bed with the tyrosine.

## 6. Discovering I'm a workaholic and how this is negative

I've got lots of drive but in too many directions which generates procrastination by analysis paralysis. I want to:

- go to the gym
- lose fat (not weight)
- have a sleep schedule
- work
- study something new
- learn Kotlin
- code Sparkr

Each one of those have sub-tasks, and trying to do them without a system to set priorities nor The Sargent™️ is close to impossible. I end up picking up one and sticking to it most of the day completely forgetting of the existence of the other ones.

## 7. The rulebook changes in winter with less sun

A seasonal-affective disorder (SAD) light is not optional. It's mandatory if I want to work the whole day with the big PC. I might feel i have enough energy but nope, if I don't keep it on most of the day (it's a small one) then I'm going to feel tired at lot earlier. At least during winter or while living in a dark place, which I am, at the moment.

## 8. Task lock awareness or excessive drive actually has a name

This is connected with number 1 and number 3 and it's part of the [default-mode network](https://en.wikipedia.org/wiki/Default_mode_network). That's an area of the brain ADHDers have overdeveloped, and is in charge among many other things of the voice (or voices) we hear on our minds while we think.

That voice is my scheduler, with it going quiet or having zero independence, I lose the ability to realise I've been hours on the same task. It's also the reason I can't stand methylphenidate since it makes that voice completely silent while lisdexamphetamine give me more flexibility with it. At the same time, I feel like I'm so used to having "The Sargent" that internally I keep fighting the effects of the pill and if it weren't for the total emotional regulation I would rather never take these meds.

## 9. The role of the time the pill is taken and how your reward system is different

Going to the gym is a nightmare on Elvanse because it makes me sweat thrice as much and be a lot thirstier. Unfortunately taking it after the gym is impossible, because without it, I simply never leave the bed. Elvanse sets a new baseline for what "minimum energy levels" is required to jumpstart your day. This is why I rather take it and go back to bed, than wait until I'm fully awake and then take it.

While unmedicated, I just wake up and go to the gym. Every task feels the same ( = nothing) until I am actually finishing the task and THEN I get my dopamine reward. I get the motivation to go to the gym from chasing that high, the one I get when I hit the shower and I know I completed my workout, not from working out itself.

With Elvanse, this reward system is heavily modified. When I'm there I'm only there, I forget to even play music on my headphones. When I lift, I compete strongly with what I normally can lift, a lot more than usual. But on Elvanse working out is no longer something I do chasing the joy of having done it, but something that I do chasing the knowledge that I'm killing records. Which means a lot more ego-lifting than usual and I have to **re-calibrate** constantly to remember I'm on Elvanse and my perception of max weight is not what it's healthy.

## 10. Bullet time is gone

Remember that bullet time thing you got at the beginning on Elvanse, that's long gone. Not because suddenly time has slowed down, but because you are so long with it that you stop perceiving the difference. The days I do not take the meds, time feels nearly the same too, you do notice it flies quicker but still doesn't feel as before the meds.

## 11. Still got ADHD issues just different ones

- Procrastination is gone, I can do whatever I want at all times, in exchange I have a harder time to figure what I want.
- I'm getting messier, without a voice in my head reminding me stuff I keep forgetting keys, buying groceries, cleaning the house. This is a common ADHD issue but I don't have it off meds because I weaponized that internal distracting voice into what I call The Sargent.
- Setting priorities is very hard.
- My time perception is awful now.
- I have working memory issues always on meds, I can't hold unrelated data in my mind.

## 12. What happens on rest days and why I can't be more than 2 days without meds.

The positives:

- I can hold humongous amount of unrelated data
- The Sargent is back, I don't need TO-DO lists anymore.
- Global views on source code are easier to maintain.
- I can code in my head.
- I'm a lot more aware of my body and sensations.
- Going to the gym and enjoying it is a lot easier because I'm used to delayed rewards.

The negatives:

- They all happen in the afternoon
- I'm exhausted, mentally exhausted.
- I'm incredibly hungry, and overeat.
- Noise is a nightmare, especially when there's too much and is unpredictable. Is like being in twitchy, jumpy mode.
- I can't sleep, I have no control of my default-mode network. I can only sleep by physical exhaustion.
- I'm very irritable with everyone around me and spending humongous amounts of mental energy trying to not get irritated for things that I know shouldn't bother me that much.
- I can't stop yawning.
- Out-of-nowhere anxiety starts crippling in, a baseline anxiety that I had my entire life off-meds and I don't have in the slightest on meds. Financial worries are the biggest ones crippling in. While on meds, I can focus on finding solutions instead of constantly enumerating the problems in my head.

The negatives don't happen the first day off meds, they start to happen toward the ending of the 2nd day meds free, and they always come with an immediate and huge craving for caffeine.

## 13. I tried splitting my dosages and it only gives me anxiety

I have all the crazy chemistry doctor material to split my Elvanse dosages in whatever amounts of mutiple of 10 miligrams. Nothing works. It's got to be 50mg, any less than 50mg and all I have is anxiety. Only 50 reaches the threshold to build up the necessary dopamine to have more positives than negatives. Thirty only works when I've woken up really late and take it in the afternoon.

This has made me consider the option of changing into 30mgs and spending half day off meds, the other half with meds so I get to enjoy my favourite "me" format. But it's jerky. 30mg works when it's the pills, when it's the split dosage, it can keep me awake at night. I'm not going to spend 83€ on 30mg pills.

## 14. Bad trips

Not all days are perfect, some days I have really really bad effect and the memory issues are even worse. Then the inability to stretch my attention span enough to remember what I'm doing starts to make me feel anxious. The worst day this happened, it literally feels like having early-onset Alzheimer. It took me 3 hours to remember the main task I was doing was moving the shoes from mine and Remi's bedroom into the entrance shoes cabinet. Can you imagine the desparation of seeing the time fly while you spend it trying to remember what were you doing? You don't have even short-term memory enough to be able to reach a notepad or Obsidian to write it.

It fucks my short-term memory more than my working one. But, as I said, that's on the odd bad trip day which usually happen before I decide to take a couple of days off the meds. Those days are usually the reason I'd rather stop the meds altogether or even try the 30mg option. But right now what I'm studying the most is the modifying power of naps since that will dictate in the near future my dosage or even choice of med.

## 15. Why I find cycling meds on and meds off is so necessary?

Memory. Each state of mind (med/unmed) changes the way my memory works and what I have more easily accessible. I tend to forget the cons of being unmedicated after long time medicated, and the same happens the other way. Both are bad. None are optimal. The solution is **definitely** going to be self-directed cognitive-behavioral therapy (CBT) which I'm already doing every time I write this posts.

The key to figure out my strength, weakness and behavioral patterns I need to change is to figure which ones worked and which ones didn't. I only get that perspective swapping from one to the other. Everything I learn while medicated is stuff I apply later unmedicated with the hope of eventually stopping meds altogether.

# What I've learnt so far that will eventually help me take no meds.

## 1. What I thought were distractions were actually necessary aids to keep focus

I do watch a shitload of TV and can't do anything without music in the background. The gym is the moment of the day where I go through my "discovery weekly" playlist and classify what I like from what I don't. I'm normally following the rhythm of the music when I do so. I don't think about it, I just do. It's **the background task** that keeps me focused. The passive thing you do without paying much attention to it, that somehow keeps the most distracting inner dialogue from focusing on...distracting me.

On medication watching TV bores me, but because it normally does and I can do it without paying much attention to it. Medicated it becomes the main task and is simply not enough interesting.

## 2. The Sargent™️ has a cost

Maintaining the voice that every couple of minutes reminds me of what I have to do, to take the keys when going out, that the house is filthy, that I need to shower, that the fridge is empty...is the main reason my brain gets exhausted. I cannot turn it off unmedicated, too many years of practice.

But I can refrain from feeding it by writing down what I've got to do. This sounds easier than it is, because that voice is capable of sorting out priorities and take quick decisions on the fly, while writing down implies doing all that in advance and learning which tasks shouldn't need remembering.

## 3. The humongous working memory or internal blackboard also has a cost

I can code in my head, I can explore solutions without typing a single line. Together with the sargent this has another humongous costs and is probably the reason I get mentally exhausted by the afternoon. While I'm fine I don't even feel any effort in doing this I just keep getting progressively tired until at some point of the day, its gets a life of its own and feels like being enclosed in the Architect room of The Matrix with all the screens as the same volume claiming for your attention.

Again, the solution is of course to use it less, but how do you do that when it feels effortless to use. It's easy in the case of the sargent, but maintaining humongous abstractions gives you a lot of speed. Is like running a full OS from RAM instead of hard drive.

This is the main thing I need to fix to be pill free. And so far all I've got is that I don't have access to either while medicated. e.g: the abstractions on meds can be just as large but they are thinner, more specific, less global. Without meds I don't need to re-read this entire article to avoid repeating myself, I would know what I wrote, while medicated I do because each paragraph is a different issue.

And none of that is giving me yet a clue on how to avoid using the full available bandwidth unmedicated. So far all I got is that I can reset it by having a nap.

## 4. Napping is the key to everything

When I was a kid, something that I can only remember on meds because it expands the access and reach of my long-term memory, is that every afternoon I could spend ~4 hours sitting on sofa with nothing but myself, I wasn't bored, nor I had my eyes closed, even though I surely would have loved to do so and fall sleep and indeed sometimes I did, I was just letting go.

When I reached exhaustion and was overwhelmed by my own brain I just relaxed by becoming an spectator. There was nothing to fear, I've always known in the afternoon that I would feel exhausted until I got my second wind. What I didn't know until the diagnose is that it was untreated ADHD the reason.

So I would just sit comfortably in the nicest sofa around in my home and daydream until I eventually had a short nap or the exhaustion vanished.

The thing is on meds, I can just fall anytime. I'm definitely planning to do so after finishing this awful thing that is already consuming 6 hours of my time.
![Image](/assets/images/2026-01-image-4.png)
But without meds I cannot. So I need to figure how to transfer that skill from medicated to unmedicated. Because if I can have a nap then I can be unmedicated and in the right side of my ADHD symptoms the whole day.

## 5. Memory might not be erratic just different

Remember what I've just written, on medication I can remember things from the very-long-ago past better while my short-term and working memory are normally limited, while other days the short-term is kind of frustratingly non-existent.

But what if that's what's normal.

I have the theory that I've somehow specialised my brain in recycling the space for long-term memory in exchange for a bigger daily working memory. I notice same I can remember with 10x more detail what happened around the city where I live, street names, where to find stuff, etc from the most immediate past, I erase the stuff I don't care about from the far past very quickly while everybody around me can remember stuff from their childhood that I do not and for them is not normal I cannot, while for me, it is. e.g.: each generation has a cartoon they were addicted to, mine was Dragon Ball. I can't barely remember anything about it, not even names, while Adrian that is my same generation can tell me entire plotlines. And I do know I was addicted to those cartoons but I know it is information I did not care at all about storing.

I'm yet to meet someone else that can semi-consciously decide what information to delete.

## 6. Emotional disregulation is 100% tied to mental exhaustion

Once I cannot control my inner monologue, I can't do anything at will other than rest. So my body becomes this 1-goal zombie that only wants one thing: to rest. And anyone standing in the way between me and rest **they’re going to get run over** and there's nothing I can do about it other than subtract myself from their presence as I'm a ticking bomb with no control over what they say to be left alone and sleep.

## 7. Decision fatigue is a big issue

The Sargent does spend a humongous amount of energy moving priorities. In this sense there's a feedback loop between it and the abuse of the bandwidth of my working memory. You can take better decisions when you have as many possibilities displayed in your mind's eye as possible.

The solution is to delegate. To who? To me in the past. Decide ahead of the future, in small chunks. Avoid my daily routine to have menial decisions. Decisions are decisions big or small, the less you take, the less decision fatigue. If I can get rid off the smaller ones, then I'm further from suffering it.

Also, just doing what's right instead of what's optimal helps. What's optimal never gets an immediate answer, what's right always does.

## 8. Measure times

I'm making tasks that take really little time a lot longer by overthinking them, I should be measuring how long do they take me and challenge that timing.

## 9. Small increments

Only small changes stick but they have to be so simple and dumbed down that they are effortless. Like, instead of focusing on trying to wake up to go to the gym, focus on not taking the pill at 7am independently of leaving the bed or carrying on sleeping.

# Conclusion

In a nutshell meds-free life is going to be:

- Learning to not abuse and instead protect my bandwidth, by using it as little as possible, and changing ways I do stuff to save it for when I actually need it. e.g.: actually writing to-do lists.
- avoid analysis paralysis and decision fatigue as anything involving this, will undoubtedly make me think globally.
- Use meds as a tool to build new systems, then lean on external scaffolding. Don’t rely on internal memory or the “Sargent” voice.
- Cycle between medicated and unmedicated states to test what works and learn from each mode.

Manage mental energy smarter: naps, pacing, and avoiding afternoon crashes that make meds **be** necessary.