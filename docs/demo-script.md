# Two minute demo script

Total: 120 seconds. Minute one is the citizen journey. Minute two is how it is
built and why.

The entire recording runs on **See it work on a real example**. That path is a
prepared case: the grievance, the routing answer, the draft and the applicant
details are all seeded, so nothing depends on a live model call while you are
recording. Nothing is typed on camera and nothing can time out.

Two presenters. Presenter A drives the browser and speaks for 0:00 to 1:00.
Presenter B speaks for 1:00 to 2:00 over the same screen, with no further
clicking.

---

## Before you record

- Sign out first, so the landing page shows **Sign in** in the header.
- Clear the dashboard: open DevTools console and run
  `localStorage.clear(); location.reload();` so no old applications appear.
- Walk the example once, end to end, before you hit record. You are checking
  that every screen appears and how long each click takes, so that your
  narration lands on the right screen.
- Browser at 100% zoom. Start with the landing page already open.

**Do not click anything outside the example path.** Not the nav pages, not
Policies, Accessibility, FAQ, the Hindi toggle, the appeal screens, or the how
it works page. They are all built and all worth a sentence in minute two, but
clicking into them costs the demo its one minute and takes you off the prepared
case.

---

## Minute one, the citizen (Presenter A)

### 0:00 to 0:12 — Landing page

**Screen:** the landing page, top of the hero.

> "This is RTI Online. Any Indian citizen can ask a government office for its
> records, and almost nobody does, because you have to know which office holds
> them and you have to word the request the way the Act expects. Get either
> wrong and it comes back weeks later. Here is the whole thing on a real case."

**Click:** `See it work on a real example`

---

### 0:12 to 0:20 — Sign in

**Screen:** the sign in dialog, already filled in.

> "Sign in is filled in for the walkthrough, so nothing here costs you typing."

**Click:** `Send code`, then `Sign in`. Do not explain the code. Keep moving.

---

### 0:20 to 0:34 — Step 1, Describe

**Screen:** `Describe the problem`. The banner at the top says you are walking
through an example, and the box already carries the pension case.

> "This is our prepared case, and this is how a person actually talks. A
> pension stopped in April, no notice, a PPO number, three visits to the
> office, and a question at the end. Why was it stopped, and who is
> responsible. None of this is in the language of the Act."

**Click:** `Find the right office`

---

### 0:34 to 0:46 — Step 2, Authority

**Screen:** the authority card, EPFO selected, with the confidence shown.

> "It comes back with the Employees' Provident Fund Organisation, under the
> Ministry of Labour and Employment. The officer the request goes to, the
> officer an appeal would go to, and how sure the system is. That last part
> matters, because the wrong office means a transfer under Section 6(3), and
> the citizen's thirty day clock starts again."

**Click:** `Write my application`

---

### 0:46 to 0:58 — Step 3, Draft

**Screen:** the draft, with **Why the wording changed** visible. Give this
screen the most time. It is the product.

> "And this is the part that decides whether you get an answer. The question
> 'why was it stopped' has become a request for the order that stopped it, the
> file notings behind it, and the name of the officer who signed it. An office
> is not obliged to explain itself. It is obliged to hand over records it
> holds. The PPO number and the dates are carried across exactly as written."

**Click:** `Continue to filing`

---

### 0:58 to 1:00 — Filing

**Screen:** the filing steps, with the applicant details already filled in.
Click `Next` through them at speed and stop on the fee step.

> "Details, declaration, the request, ten rupees. Filed, and from there the
> dashboard watches the thirty day deadline."

Hand over. Do not wait for the confirmation dialog if you are tight on time.

---

## Minute two, how we built it (Presenter B)

Stay where minute one ended. No clicking. Everything below is spoken over a
still screen, so nothing here can go wrong on camera.

### 1:00 to 1:18 — The problem worth solving

> "The hard part of this product is the step you just watched, where a
> complaint became an office. Asking a language model 'which government office
> holds these records' on its own gets you a confident, well written, non
> existent department. A citizen cannot tell the difference, and finds out six
> weeks later. So we do not ask it that."

### 1:18 to 1:42 — How the routing is designed

> "We hand curated a directory of public authorities. Thirty eight of them,
> central and state, each carrying the officer who receives requests, the
> appellate officer, the filing address, and around three hundred and forty
> keywords a citizen might actually type. The grievance is keyword matched
> against that directory first, weighted so a specific phrase like 'ministry of
> education' counts for more than a common word like 'scholarship'. Only that
> shortlist reaches the model, and the model can answer only with an id from
> the list. It cannot invent an office, because there is nothing to invent
> from."

### 1:42 to 1:56 — Honesty, and what else is in there

> "It also scores its own confidence. Below 0.6 the screen stops being
> confident and says plainly that we are not sure, and to check the
> department's own website first. For someone spending a month on this, an
> honest 'verify this' beats a confident wrong answer.
>
> The rest follows the Act itself. Thirty days, or forty eight hours where
> someone's life or liberty is at stake. The appeal window under Section 19,
> with the first appeal drafted for you when the deadline passes. The fee, and
> the exemption if you hold a BPL certificate. It runs in English and Hindi, at
> every text size, on a phone, and without an account."

### 1:56 to 2:00 — Close

> "And filing is simulated. We prepare the application, you file it. That is on
> the screen, not buried in a footer."

---

## Timing safety

If you are running long, cut in this order:

1. The second half of the 0:34 authority line, from "That last part matters".
2. The 0:58 filing narration, down to "Details, declaration, ten rupees, filed."
3. The list of extras at 1:42, from "The fee, and the exemption".

Do not cut the draft explanation at 0:46, and do not cut the routing
explanation at 1:18. Those two are the whole submission.
