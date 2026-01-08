---
layout: post
title: "I Tried Cursor and I'm Not Worried"
date: "2026-01-02"
excerpt: "I tested Cursor, for prototyping ideas to just figure if they are feasible it works, yet for production level it doesn't. Context is their kryptonite. Our jobs are VERY MUCH safe. "
image: "/assets/images/unsplash-1571441249554.jpg"
tags:
  - programming
  - tools
  - AI
featured: true
---

The image I've chosen from Unsplash for this article is no accident at all, keep reading and you'll figure out why.

I recently survived showing someone `sparkr_private`, a repo containing a prototype version of [Sparkr](https://codeberg.org/maikelthedev/sparkr) I built in React Native within a week. The goal wasn't to build production code. It was to rapidly test **feasibility** of ideas, disposing of concepts quickly just to see what could actually be possible based on ideas in my head.

The result? Shameful code. Heavily written with the help of LLMs (specifically Cursor), it's 100% slop built on top of slop, designed to answer one question after another:

1. Is this possible? Yes.
2. Ok, is this possible? Yes, ok, next.
3. Is this possible? Yes, ok, next.
4. Is this possible? No? Ohhh, what if I do it this way? Yes, ok next.

Rinse and repeat until I had all my questions answered.

The code **individually** worked, but integrated would probably make any mobile phone explode. There were no test suites, just monkey trialing after each idea. No integration tests. Once a feature was proved feasible I run the app on my phone, tested it manually, then I read the code to understand how, then I moved onto checking how the next one could be done. I guarantee you most new ideas broke the previous ones. I'm still debating with myself whether to make that code public.

But here's the thing: it worked for its purpose. I learned that NIP-17 e2ee direct chat was possible (even if implemented in extremely wasteful and verbose ways) to add to a chatting app easily. I proved uploading facepics using free-to-use [Blossom relays ](https://github.com/nostr-protocol/nips/blob/master/B7.md)could work. I validated a grid **directory** system based on relays passed via app signature, posted in public relays.

From there onwards, I had all I needed to know it was feasible.

## The Only Valid Use Case

After this experiment, I've found the only valid use case for LLMs in software development: testing feasibility of random ideas on disposable code to motivate yourself enough to code them yourself.

**Once you've seen it, you want to make it real**. You're no longer working with an idea in your head. You answered each and every question you could have about it, to completion, and saw its full potential. It's a bit like experiencing the joy of seeing your own children grow up and get married, knowing you made it happen, you raised a good kid, before actually deciding to have children. There's no what if, there's only a clear path. There's no scrum or agile ever changing requirements, you've gone from specification to final broken thing that kind of works. There's no ifs, there's no uncertainty. You've seen it, had it in your hands, made of your ideas. Ignore the code, you just wanted to know if it could exist. You know now it can exist. It is **a certainty**.

Or, put another way: helping you gather answers to all the burning questions you might have on a software project before you write the first line of actual decent code.

This is genuinely useful. When you're exploring a new domain, trying to understand if something is technically possible, or rapidly prototyping to validate concepts, discard what you figure doesn't work and move onto quicker into alternative options.

But that's where it ends.

## Where LLMs Fail Catastrophically

If you're thinking about using LLMs for actual software development, here's where they IMHO fall apart:

### 1. Elegance

LLMs don't understand elegance. They don't grasp clean architecture, beautiful abstractions, or thoughtful design patterns. They'll give you code that works, but it's the software equivalent of a functional but ugly building. It stands, but you wouldn't want to live in it. Stupid ridiculous thing never had to pass an exam on algorithms, data structure or Big O notation, [**you did.**](https://www.open.ac.uk/courses/modules/m269/)

They'll write stuff like this 👇

```js
function doStuff(a, b, c) {
  if (a != null) {
    if (a !== undefined) {
      if (a !== "") {
        if (b == true) {
          if (c > 0) {
            console.log("doing stuff");
            for (var i = 0; i < c; i++) {
              setTimeout(function () {
                console.log(a);
              }, 1000);
            }
          }
        }
      }
    }
  }
}

``` 
There are some basic principles of software development that they simply ignore:

- KISS, they write incredibly long lines of code with no specialisation or compartimentalisation in smaller functions, it's untestable due to how long and how many variables it depends on .
- DRY, they write the same lines across entire codebases again and again.
- ....you can find the whole damn list here in Wikipedia. No one who's studied software engineering would be unaware of the existence of those and many other rules.

Anyone who's coded for a couple of years can easily identify code written by a LLM compared to code written by a human.

### 2. Refactoring and Global View

Ask an LLM to refactor code, and you'll get a mess. They don't understand the subtle relationships between components, the reasons behind certain design decisions, or how to improve code while maintaining its integrity. They'll **change things that shouldn't be changed** and **leave problems that should be fixed.**

They're terrible at handling project specific requirements, domain knowledge, or nuanced business logic. They'll give you generic solutions that don't quite fit your actual needs. The devil is in the details, and LLMs are detail blind because they can't see things **globally**. Why? Context. Remember, they aren't human.

I'll talk more about this context thing later, but this is what makes them behave like elderly people with 👇 and the main reason I'll never fear them.
![white and yellow letter t](https://images.unsplash.com/photo-1619963030941-69eb5b7ef496?crop=entropy&amp;cs=tinysrgb&amp;fit=max&amp;fm=jpg&amp;ixid=M3wxMTc3M3wwfDF8c2VhcmNofDEzfHxhbHpoZWltZXJ8ZW58MHx8fHwxNzY3MzkxNTMzfDA&amp;ixlib=rb-4.1.0&amp;q=80&amp;w=2000)
### 3. Testing

Tests written by LLMs are **awful**. They test the wrong things, is not that they miss edge cases, but that they implementation details rather than behavior. Good testing requires understanding the system, its requirements, and potential failure modes, all things LLMs struggle with because of **a lack of a global view.** Context, my friend, that's why you'll always have a job.

### 4. Anything Involving Refinement

LLMs are one-shot generators. They don't iterate well. They don't learn from feedback in a meaningful way. Real software development is iterative refinement, taking something that works and making it better, cleaner, more maintainable. LLMs can't do this. You can tell them to rewrite the same function ten times and I gurantee you by the fourth time you'll get again the first version. Again, why? Repeat after me: **context.**

### 5. Language Support Beyond Python and JavaScript

LLMs fail catastrophically at any language that's not Python or JavaScript. In Elixir, for example, they even make up non-existent functions of core modules. They'll confidently suggest core-language functions that don't exist, use incorrect syntax, and provide solutions that simply won't compile or run. Let alone they are **dated by design**. Why do you think their best language for any of them to prototype with is JavaScript?

## The "Junior Dev" Fallacy

People who defend LLMs as if they were the 2nd cumming (typo intended) of Jesuschrist often say: "It's like sitting with a junior developer."
**No, it's not.</blockquote>
A junior developer **thinks**. They ask questions. They learn. They make mistakes and understand why they made them. They **grow their knowledge**, they refine, they get better. They bring human judgment, **creativity**, and reasoning to the table.

An LLM vomits. It generates text based on patterns it's seen, without understanding, without reasoning, without the ability to truly learn from **context** in the way a human does.

But here's the critical difference that makes human coders irreplaceable:
**context**.</blockquote>![People waiting at a mural-adorned bus stop](https://images.unsplash.com/photo-1762894764362-d264b9ffc92a?crop=entropy&amp;cs=tinysrgb&amp;fit=max&amp;fm=jpg&amp;ixid=M3wxMTc3M3wwfDF8c2VhcmNofDE0M3x8Y29udGV4dHxlbnwwfHx8fDE3NjczOTIzOTl8MA&amp;ixlib=rb-4.1.0&amp;q=80&amp;w=2000)
# What do you even mean with "context" Maikel?

A **human** developer can maintain a massively **humongous** context. They can hold in their head the entire architecture of a system, understand how components interact, remember why certain decisions were made months **if not years** ago, see the big picture and the small details simultaneously. They can trace through code mentally, understand the flow of data, see relationships that aren't explicitly documented, and make connections across the entire codebase. They have **a global vision.**

I have ADHD yet unlike most, when I'm unmedicated, my working memory is so large I can hold in my head the entire architecture of an idea for weeks if not months. I can think through complex systems, see how everything connects, and maintain that mental model continuously while I try pseudocode in my head.**An LLM can't do more than a few prompts without forgetting the entire subject.** Even the most advanced models with massive context windows can't maintain that kind of persistent, deep understanding. They reset. They forget. They can't hold onto the architecture the way a human mind can.
<div class="kg-card kg-callout-card kg-callout-card-blue"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text">**Context: T**here's a very tiny window of information you can supply to them, past this window they start from scratch as if an elderly person with dementia.</div></div>
That's what **context **means for an LLM. he bigger the context size, the slower they get and they **all **have this limitation. They'll never get global-type of understanding to any codebase unless it is so tiny it fits entirely in their context, together with the much larger amount of reasoning of what it does, why it does it, etc.

Any LLM, even with the largest context windows available, fails precisely where humans excel. Context windows are limited. They can't truly "remember" beyond what's in the current conversation. They can't maintain the kind of deep, interconnected understanding that a human developer builds over time working with a codebase. They process text, not meaning. They see tokens, not systems.

This is where human coders will always prevail. Real software development isn't about writing isolated functions. It's about understanding complex systems, maintaining mental models of how everything fits together, and making decisions that consider the entire context of the project, its history, its future, and its constraints. LLMs can't do this. They can only work with what's explicitly in their context window, and even then, they don't truly understand it.
**Moral of the story:** you cannot write professional code with an LLM. You can use it to test the feasibility of some ideas and that's it.</blockquote>
## The Professional's Approach that IMHO should be the gold-standard on LLM usage

So how do you use LLMs without destroying your career or your codebase?

First, **assume their knowledge is based on inaccuracies**. Don't ask them if something is feasible. Direct them to code your idea, so you can see with your own eyes if it is and fix what it gets wrong.**Never use LLMs as juries of what is possible**. Never take their opinion. They aren't people, **they are all snake oil salesmen.** Their job is to sound knowledgeable, not to produce actual knowledge. Do you think the guy at MediaMarkt has any clue of the actual power of an i7-13123 vs an AMD Ryzen 7 Gen 8 v2.5 (I just made up tha last part)? His job is neither to draw sillicon logic in ever shrinking transistor size, with an ever increasing set of instructions to process things ever quicker, using ever more complicated manufacturing processses. Nope, that's not his job, his job is to sell.

So instead focus on making them do quickly the prototypes of ideas you had in your head. Think of it as a feedback loop overcharged of the ideas that you will ask yourself over a number of weeks, in just days or 24 hours. But ultimately the machine would answer them a lot quicker, just a lot less accurately and more constrained. The prototype you end up with is just one of hundreds of millions of possibilities. **The box cannot think outside the box.** YOU CAN.

### 1. Use a Different Language for Prototyping one you don't care much about

Never use an LLM for the final programming language you're going to use. Only use it for with shite error-ignoring-prone languages that you don't get paid professionally to use anymore, like JavaScript (if that's not your main language).

Why? This ensures your knowledge of your food-on-the-table language remains intact due to constant use **unaided**. It also avoids future **licensing** issues. Most importantly, it makes copy and paste between prototype and final product impossible.

So prototype ideas on a shite language, write them yourself on the proper one.
![a red sign with a picture of a cow on it](https://images.unsplash.com/photo-1692734207733-a79de344ff3a?crop=entropy&amp;cs=tinysrgb&amp;fit=max&amp;fm=jpg&amp;ixid=M3wxMTc3M3wwfDF8c2VhcmNofDQ2fHxzaGl0fGVufDB8fHx8MTc2NzM5MzU5M3ww&amp;ixlib=rb-4.1.0&amp;q=80&amp;w=2000)
### 2. Never Use It With Your Professional Language or the one you feel passionate about

If JavaScript is your professional language, use Python for prototyping. The separation is crucial.

Here's my personal approach: JavaScript was my professional language for quite a while. I can still read it and code in React, Angular, React Native, or NativeScript when designing quick prototypes for Android, Angular was paying the bills. But I haven't used it professionally in a very long time, nor do I think I will. My main **decent **languages that I get paid sustenance money for are Elixir, which I deeply love, and hopefully soon Kotlin, which finally covers the problems of Java's obsessive OOP, and finally able to do what React Native had for me: multiplatform, thanks to Kotlin Multiplatform.

**I need to know what I'm doing with these languages,** so no LLMs with them. Even better if you can use pseudocode for prototyping. Pseudocode lets you think through the logic and architecture without committing to any specific language, and then you can implement it properly in your professional language yourself. This maintains your skills while still allowing you to rapidly prototype ideas.

We need to compartmentalize: code we write from code LLMs produce. The best way is to use it to understand a concept, read through it, close the fucking tool, and force yourself to write from scratch the code yourself in that different language. As I said before: test the feasibility of ideas, never their actual implementation.

The main reason is the one I mentioned earlier, licensing issues. Imagine you work on a project, you worked aided by some LLM and then months down the line you discover your code comes (inevitably) from copyrighted code with an incompatible viral license to what you've "written" for someone else. I'm not talking about some for loop, I'm talking about those **naive** fake-fluencers trying to sell you books, seminars, and other bullshit, about completely code-free coding using agentic-mode only. There's no way they aren't ending up with large sections of "their" code being copyright-breaking material with lawyers in-waiting. This is going to probably end up being so big, these kinds of ads will have to be created with different banner "**has your code being used in a large codebase elsewhere, no win, no fee**".
![Image](/assets/images/2026-01-image-1.png)
### 3. Use Local Models When Possible

Swap for local models with tools like Ollama as soon as you can. But be VERY aware: they are a black box. Every line of code out of an LLM is code stolen from somewhere and that somewhere clearly has a license just as much as anything sucked by a commercial-provider. NEVER copy and paste.

Even with local models, you're dealing with code that was trained on, **always assume, copyrighted materia**l. The licensing implications are enough to remember you cannot and should not use their code.

The local models have a big advantage: nothing leaves your PC. The code you write, using a commercial LLM, always end up on someone else's server. Cursor has a setting to keep thinks locally, I assume that setting is misleading.**Never put the code you write for one of your clients on LLMs but specially online ones.** Assume the company behind it is harvesting your prompts for further refinement of the model, and that everything you enter on it, will be used by someone else later. You might be digging your grave.

### 4. Never Invest in This Tech

Don't buy GPUs to use them locally, don't get the greatest 64 GB Apple Sillicon laptop to try different models locally, unless you have the spare funds. Assume it'll vanish into thin air. Don't put your value on requiring them. Never develop dependency on them.

Nothing depreciates faster than software, and this is clearly an unsustainable bubble on snakeoil sales-speech software.

You've lived through Uber, Airbnb, and other venture capitalistic cunts. You know what OpenAI and others will do. This shit is cheap now, **it'll cost 10 times more in the near future**. They are burning through VC cash to get you hooked into it. Same as Uber did while destroying their local taxi competitors, and now they are pricier than local taxis. Same as Starbucks does opening multiple stores to asphyxiate the competitors. It's all the same strategy: cheap now, gets you hooked, become a commodity, then raise the prices.

Don't build your career or your projects on something that will become unaffordable once they've eliminated the competition and you're locked in.

The LocalLLM market is entirely different, and for certain do investigate on it for fun as much as you'd like as I think this sub-are of LLMs is what will eventually rise victorious.

### 5. Maintain Self-Control

All of this requires self control. How much of an adult are you? How much do you value your employability?

The temptation to use LLMs for "real" work is strong. Short term might feel like you can do one week's worth of work in an couple of hours. But in the long term, it erodes your skills, creates technical debt, produces code that's harder to maintain, and makes you dependent on a service that will become eventually either unaffordable to you or unusable due to licensing issues.

Think about this: if running a local LLM that produces anything near the quality of Cursor's default model costs you a humongous debt in computer components, what incentive do the already existing commercial ones have to NOT eventually raise what they charge for it. They aren't NGOs, they are all for-profit companies.

It's a fad, it'll go and evolve into mini-local LLM models.

## Conclussion, why the rubbish image and why our Future is Safe

I don't think professional software development is going anywhere in favour of machines doing it.

The people who will ignore this advice? Clearly those who don't work professionally as coders. Professional developers understand that code isn't just about making something work, it's about making something work well, maintainably, and elegantly. It's like raising a kid.

But I don't think we're through the worse yet. I think first, will come the commodifying of LLMs, getting as many people hooked as possible, second the hiking of the prices, third, the selling of the convenience of commercial ones compared to local LLMs, then legislation will FINALLY catch up (if ever) and burst the bubble of the commercial ones (that's where the injury-lawyer industry re-focus will happen into **some major copyright battles**), then some local LLMs will become easier to understand and run, then there'll be probably more openness (enforced by the law, probably the EU first) about the source of LLMs "knowledge" and finally purpose-built per coding-language and ecosystem language models. Tiny thematicals LLMs capable of requiring less power since they are focused on a single thematic task (like, future Jetpack Compose UI generators).

I'm expecting the bubbele to burst spectacularly and in a similar way the housing crash did since we're humans, which means, our context window is neither infinite and love repeating our own mistakes. Every bank surely has directly or indirectly invested in this crap, and the moment OpenAI crash we'll have another Lehman Brothers moment
**OpenAI is the new Lehman Brothers </blockquote>
Now, why that image? Because when I think of Sillicon Valley and Big Tech™️, that's what comes to my mind: rubbish and people going through it, trying to find value. Yet instead of looking in the recyclable bin, where by definition it is easier to find something that worked in the past and refine it, they look into the non-recyclable one, the one filled with dog poo and cat litter, and try to sell it to us as The Cum of Christ, Microsoft is particularly guilty of this, no matter how many times people shout at them "I don't want to eat a used diaper" they persistently repeat "now with Premium Poo"👇

<center><strong>No, thank you.</strong></center>

LLMs are a tool. Like any tool, they're useful for specific tasks and terrible for others. Use them for what they're good at: rapid feasibility testing on disposable code. Don't use them for what they're bad at: actual software development.

Our future is safe because professional software development requires skills that LLMs simply won't ever have due to their main limitation: context.

The developers who will thrive are the ones who understand this distinction and maintain their skills accordingly. The ones that will have to re-skill themselves into some other industry are those who fell for the vibe-coding fad.

Thanks for coming to my house, tip your waitress. Byyeeeee!
<figure ><iframe src="https://tenor.com/embed/5266957" frameborder="0"></iframe></figure>