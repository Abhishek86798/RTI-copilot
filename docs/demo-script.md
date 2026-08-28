# Two minute demo script

Total: 120 seconds. Minute one is the citizen journey, driven entirely by
**See it work on a real example**. Minute two is how it was built.

Two presenters. Presenter A drives the browser and speaks for 0:00 to 1:00.
Presenter B speaks for 1:00 to 2:00 over the same screen, no new clicking
except where noted.

---

## Before you record

- Sign out first, so the landing page shows **Sign in** in the header.
- Clear the dashboard: open DevTools console and run
  `localStorage.clear(); location.reload();` so no old applications appear.
- Browser at 100% zoom, light or dark, whichever reads better on your camera.
- Have the page already on the landing screen when recording starts.
- Do a dry run once. The routing and drafting steps each take a few seconds,
  and knowing exactly how long they take is what keeps you on time.

Do not show: the header nav pages, Policies, Accessibility, FAQ, the Hindi
toggle, the appeal flow, the how it works page. They are all built and they
are all worth mentioning in words, but clicking into them costs the demo its
one minute.

---

## Minute one, the citizen (Presenter A)

### 0:00 to 0:10 — Landing page

**Screen:** the landing page, top of the hero.

> "This is RTI Online. An Indian citizen has a right to ask any government
> office for its records, and most people never use it, because you have to
> know which office holds them and you have to word the request the way the
> Act expects. Get either wrong and your application comes back weeks later.
> Let me show you the whole thing on a real case."

**Click:** `See it work on a real example`

---

### 0:10 to 0:18 — Sign in

**Screen:** the sign in dialog, already filled in.

> "Sign in is filled in for the walkthrough, so you can see the real flow
> without me typing an address."

**Click:** `Send code`, then `Sign in`. Do not stop to explain the code. Keep
moving.

---

### 0:18 to 0:32 — Step 1, Describe

**Screen:** `Describe the problem`, textarea already carrying the pension case.

> "This is how a person actually talks. A pension stopped in April, no notice,
> a PPO number, three visits to the office, and a question at the end: why was
> it stopped and who is responsible. Nothing here is in the language of the
> Act."

**Click:** `Find the right office`

Wait for the routing call. Talk over the wait, do not go silent.

---

### 0:32 to 0:44 — Step 2, Authority

**Screen:** the authority card, EPFO selected, confidence shown.

> "It has routed this to the Employees' Provident Fund Organisation, under the
> Ministry of Labour and Employment, with the officer the request goes to and
> the officer an appeal would go to. It also tells you how sure it is. That
> matters, because the wrong office means a transfer under Section 6(3), and
> your thirty day clock starts again."

**Click:** `Write my application`

---

### 0:44 to 0:56 — Step 3, Draft

**Screen:** the draft, with **Why the wording changed** visible.

> "And here is the part that decides whether you get an answer. The question
> 'why was it stopped' has become a request for the order that stopped it, the
> file notings behind it, and the name of the officer who signed it. Offices
> are not obliged to explain themselves. They are obliged to hand over records
> they hold. The PPO number and the dates are carried across exactly as
> written."

**Click:** `Continue to filing`

---

### 0:56 to 1:00 — Filing and done

**Screen:** the filing steps. Click `Next` through the five steps at speed,
then `Pay ₹10 and file`.

> "Details, declaration, the request itself, ten rupees, filed. The dashboard
> now watches the thirty day deadline, and if it passes with no reply, the
> first appeal is already drafted."

Land on the confirmation, let the dashboard appear behind it. Hand over.

---

## Minute two, how we built it (Presenter B)

Stay on the dashboard or scroll back to the authority step. No new clicking
except the one optional move at 1:40.

### 1:00 to 1:20 — The routing problem

> "The interesting engineering is in that second step. Asking a language model
> 'which government office holds these records' on its own gets you a
> confident, well written, non existent department. So we do not ask it that."

### 1:20 to 1:45 — How routing actually works

> "We hand curated a directory of public authorities. Thirty eight of them,
> central and state, each with the officer who receives requests, the appellate
> officer, the filing address, and around three hundred and forty keywords a
> citizen might actually type. A grievance is keyword matched against that
> directory first, weighted so a specific phrase like 'ministry of education'
> outranks a common word like 'scholarship'. Only the shortlist goes to Gemini,
> and it can only answer with an id from that list. It cannot invent an office,
> because there is nothing to invent from."

**Optional click at 1:40** if you have the pace for it: type a scholarship
query on a fresh application and show it landing on the Department of Higher
Education. Skip this if you are behind.

### 1:45 to 1:58 — Honesty and the rest

> "It also scores its own confidence, and below 0.6 the screen says plainly
> that we are not sure and tells you to check the department's own website.
> A wrong answer delivered confidently is worse for a citizen than an honest
> 'verify this first'.
>
> Everything else follows from the Act. Thirty days, or forty eight hours where
> someone's life or liberty is at stake. The appeal window under Section 19.
> The fee, and the exemption if you hold a BPL certificate. It works in English
> and Hindi, at every text size, on a phone, and without an account."

### 1:58 to 2:00 — Close

> "Filing is simulated. We prepare the application, you file it. That is on the
> screen, not in the footer."

---

## Timing safety

If you are running long, cut in this order:

1. The optional scholarship click at 1:40.
2. The second half of the 0:32 authority line, from "That matters".
3. The 0:56 filing narration down to "Details, declaration, ten rupees, filed."

Do not cut the draft explanation at 0:44. That is the product.
