# Two minute demo script

Runs entirely on **See it work on a real example**. Everything is pre-filled,
so nothing is typed on camera.

**Setup:** sign out, run `localStorage.clear()` in the console, 100% zoom,
landing page open.

---

## Minute one, the citizen

### 0:00 · Landing page

> You can legally make any government office in India open its files to you.
> Most people never do it once. Not because they don't care. Because guessing
> the wrong office costs them a month.

→ *See it work on a real example*, then *Send code*, then *Sign in*

### 0:19 · Describe the problem

> A pension stopped in April. No notice. He's seventy four, and it was his only
> income. Three trips to the office, no answers. That's how a real person
> writes it. Not like a form.

→ *Find the right office*

### 0:33 · The authority

> And it finds the office. EPFO, under the Ministry of Labour and Employment.
> Who to send it to. Who to appeal to. And how sure it is. Wrong office, and
> your thirty days start over.

→ *Write my application*

### 0:45 · The draft

> Now watch the wording. Why was it stopped becomes: give me the order, the
> notings, the officer's name. Records, not excuses.

→ *Continue to filing*

### 0:54 · Filing

Say it as one line while clicking *Next* through the steps.

> Details, declaration, request, ten rupees, filed. And the thirty day clock
> starts now.

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

**Running long?** Cut "Wrong office, and your thirty days start over", then
"Three trips to the office, no answers". Never cut the draft line at 0:45 or
the directory line at 1:13.
