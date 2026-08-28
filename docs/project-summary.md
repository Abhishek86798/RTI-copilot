# RTI Online

Every Indian citizen can ask a government office for its records. Almost nobody
does, and it is not apathy. You have to know which of thousands of offices holds
the papers, and word the request as a demand for documents rather than a
question. Get either wrong and it returns weeks later, your clock reset.

The official portal assumes you know all this before you arrive. It opens with
a dropdown of ministries.

We rebuilt it around the two steps that stop people. You describe the problem
in your own words. The office comes back, and the application is drafted from
what you wrote, turning the complaint into an itemised request for the order,
the file notings, the officer's name. Your reference numbers carry across
untouched.

We did not let a language model choose the office alone, because it will invent
one that sounds right and does not exist. We built the directory ourselves,
thirty eight authorities with their information and appellate officers, match
your words against it first, and let the model pick only from that list. It is
a suggestion, not a verdict: the alternatives sit alongside it, one click away.

It flags the cases where the law allows forty eight hours instead of thirty
days, warns when a request belongs to a state portal, waives the fee for a BPL
certificate, counts the deadline, and drafts your first appeal when it passes.
English and Hindi, at any text size. Filing is simulated, and we say so.
