# Two minute demo script

Runs entirely on **See it work on a real example**. Everything is pre-filled,
so nothing is typed on camera.

**Setup:** sign out, run `localStorage.clear()` in the console, 100% zoom,
landing page open.

The framing throughout: this is RTI, rebuilt. Not a service sitting on top of
it. Never say "we help you" when you can say "you do this here".

---

## Minute one, the citizen

The flow: people don't file RTIs because they don't know who to send them to.
So you write your problem, the office comes back, the application writes
itself, and you file it. 150 words, normal pace.

### 0:00 · Landing page

> This is RTI Online. Under the Right to Information Act, any Indian can ask a
> government office to show its records. Almost nobody does. Not because they
> don't want to, but because they don't know who to send it to.

→ Click *See it work on a real example*, then *Send code*, then *Sign in*.
Keep talking through those clicks.

### 0:16 · Describe the problem

> So you don't have to know. You just write it the way you'd say it. A pension
> stopped in April, no notice, three visits to the office, no answer.

→ *Find the right office*

### 0:28 · The authority

> And it tells you exactly where it goes. This one goes to EPFO, with the
> officer who has to reply to you. And if you disagree, the other offices are
> right there. You can change it.

→ *Write my application*

### 0:42 · The draft

> Then the application writes itself from what you typed. Your question becomes
> a request for documents, because an office can refuse to explain itself, but
> it cannot refuse to hand over a file.

→ *Continue to filing*

### 0:56 · Filing

Say it as one line while clicking *Next* through the steps.

> After that it's the normal filing. Your details, ten rupees, done. And the
> thirty day deadline is now being counted.

---

## Minute two, how we built it

Still screen. No clicking. Assume the listener knows nothing about how any of
this works.

### 1:00 · What we actually built

> We didn't build a helper on top of the RTI portal. We rebuilt the thing
> itself, around the one step that stops everybody: knowing which office to
> send it to.

### 1:12 · Why not just AI

> We could have just asked an AI. But ask a language model which department
> holds your records, and it will name one that sounds right and doesn't exist.
> So we don't rely on it alone.

### 1:26 · What we did instead

> We built our own list of real offices first. Thirty eight of them, with the
> officer who takes the request and the one who hears an appeal. Your words are
> matched against that list, and the AI only picks from what we hand it. It can
> never name an office that isn't real.

### 1:46 · And you stay in charge

> And it's a suggestion, not a decision. The other offices we considered are
> right there on the screen, and you can switch in one click. You decide where
> your application goes.

### 1:57 · Close

> Filing here is simulated, so nothing reaches a real office yet.

---

**Running long?** Cut "with the officer who has to reply to you" at 0:28, then
"with the officer who takes the request and the one who hears an appeal" at
1:26. Never cut the draft line at 0:42, the list line at 1:26, or the change-it
line at 1:46.
