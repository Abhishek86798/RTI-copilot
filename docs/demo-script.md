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

Still screen. No clicking.

### 1:00 · The hook

> Here's the part nobody sees. If you just ask an AI which office holds your
> records, it will make one up. Sound perfect. Be completely wrong. And you'd
> never know.

### 1:13 · How it actually works

> So we don't let it. We built the directory ourselves. Thirty eight
> authorities, central and state, each with its information officer, its appeal
> officer, and the words a real person would type. Your complaint is matched
> against those words first. Ministry of education beats a loose word like
> scholarship. Only that shortlist goes to the model, and it can only answer
> with an id from the list. It can't invent an office, because there's nothing
> to invent from. And it scores itself. Under sixty percent, it tells you to go
> check the department yourself.

### 1:50 · Close

> An honest maybe beats a confident mistake. That's the whole idea. We don't
> file it for you. We write it, you file it, and we say so on the screen.

---

**Running long?** Cut "with the officer who has to reply, and the officer you
appeal to if he doesn't", then "And it scores itself. Under sixty percent, it
tells you to go check the department yourself." Never cut the draft line at
0:42 or the directory line at 1:13.
