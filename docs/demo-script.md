# Two minute demo script

Runs entirely on **See it work on a real example**. Everything is pre-filled,
so nothing is typed on camera.

**Setup:** sign out, run `localStorage.clear()` in the console, 100% zoom,
landing page open.

---

## Minute one, the citizen

The flow, in one line: people don't file RTIs because they don't know who to
send them to. So you write your problem, we tell you the office, we write the
application, and you file it.

150 words, normal pace.

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

> And the system tells you exactly where it goes. This one goes to EPFO, with
> the officer who has to reply, and the officer you appeal to if he doesn't.

→ *Write my application*

### 0:42 · The draft

> Then it writes the application from what you typed. Your question becomes a
> request for documents, because an office can refuse to explain itself, but it
> cannot refuse to hand over a file.

→ *Continue to filing*

### 0:56 · Filing

Say it as one line while clicking *Next* through the steps.

> After that it's the normal filing. Your details, ten rupees, done. And we
> watch the thirty day deadline.

---

## Minute two, how we built it

Still screen. No clicking. Four decisions, and the reason for each one.
Assume the listener knows nothing about how any of this works.

### 1:00 · Why it is hard

> The hard part here isn't the writing. It's knowing which office. There are
> thousands of them, and if you pick wrong, nobody tells you for six weeks.

### 1:11 · The first decision

> So our first decision was to not let the AI answer that alone. Ask a language
> model which department holds your records, and it will name one that sounds
> right and doesn't exist.

### 1:24 · What we did instead

> We wrote the list ourselves instead. Thirty eight real offices, each with the
> officer who receives requests and the one who hears appeals. When you
> describe your problem, we match your words to that list, and the AI only
> chooses from what we hand it. It can never invent an office.

### 1:44 · Being honest about doubt

> And when it isn't sure, it says so instead of guessing. That mattered more
> than looking clever, because a confident wrong answer costs someone a month.

### 1:54 · Close

> And we never file it for you. We prepare it, you send it, and we say so on
> the screen.

---

**Running long?** Cut "with the officer who has to reply, and the officer you
appeal to if he doesn't", then "There are thousands of them, and if you pick
wrong, nobody tells you for six weeks." Never cut the draft line at 0:42 or
the list line at 1:24.
