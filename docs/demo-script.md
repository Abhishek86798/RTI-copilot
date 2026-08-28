# Two minute demo script

Runs entirely on **See it work on a real example**. Everything is pre-filled,
so nothing is typed on camera.

**Setup:** sign out, run `localStorage.clear()` in the console, 100% zoom,
landing page open.

---

## Minute one, the citizen

Minute one is one explanation told across four screens: the problem, how we
solve it, and the filing. Full sentences, normal pace, roughly 150 words.

### 0:00 · Landing page — the problem

> Under the Right to Information Act, any citizen can make a government office
> hand over its records. The catch is that you have to name the right office
> yourself, and word it the way the law expects.

→ Click *See it work on a real example*, then *Send code*, then *Sign in*.
Keep talking through those clicks. Do not stop to explain the sign in.

### 0:15 · Describe the problem — the citizen's words

> So here, you just say what happened. A pension stopped in April with no
> notice, and three visits to the office got no answer.

→ *Find the right office*

### 0:26 · The authority — where it has to go

> It then finds the office that actually holds those records. Here, EPFO. It
> names the officer who has to answer you, and the senior officer you appeal to
> if nobody does. Send it to the wrong office, and your thirty days start
> again.

→ *Write my application*

### 0:42 · The draft — how it has to be worded

> Then it rewrites the complaint. An office can refuse to explain itself, but
> it cannot refuse to hand over a document. So why was it stopped becomes: the
> order, the file notings, the officer's name.

→ *Continue to filing*

### 0:56 · Filing

Say it as one line while clicking *Next* through the steps.

> Ten rupees, filed, and from here we count the thirty days for you.

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

**Running long?** Cut "Send it to the wrong office, and your thirty days start
again", then "And it scores itself. Under sixty percent, it tells you to go
check the department yourself." Never cut the draft line at 0:42 or the
directory line at 1:13.
