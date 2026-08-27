"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

/**
 * Interface translation, English and Hindi.
 *
 * Scope is deliberate: the chrome a citizen has to read to get through the
 * journey — labels, buttons, help text, status names — is translated. The
 * generated RTI application is not. A PIO expects the application in English
 * or in the state's official language, and machine-translating a legal
 * document into Hindi would risk changing what was actually requested. So the
 * person is guided in the language they think in, and the document stays in
 * the language it has to be filed in.
 */

export type Locale = "en" | "hi";

const STORAGE_KEY = "rti-copilot:locale";

const en = {
  "brand.name": "RTI Online",
  "brand.tagline": "Version 3.0 (Copilot Edition) — An Initiative of Department of Personnel & Training, Government of India",

  "migrate.title": "Save these to your account?",
  "migrate.body":
    "You have {count} application(s) saved in this browser only. Copying them to your account lets us email you when a deadline runs out — and keeps them if you clear your browser or switch device.",
  "migrate.privacy":
    "Your application text can include a PPO, FIR, or PAN number. Nothing is uploaded unless you choose to.",
  "migrate.confirm": "Copy to my account",
  "migrate.dismiss": "Keep them in this browser",
  "migrate.working": "Copying…",
  "migrate.done": "{count} copied to your account.",
  "migrate.failed": "{count} could not be copied. They are still saved in this browser.",
  "file.state": "State",
  "file.statePlaceholder": "Select your state",
  "file.pincode": "PIN code",
  "file.pincodeHelp": "Six digits.",
  "file.bplRef": "BPL certificate number",
  "file.bplRefHelp":
    "Section 7(5) waives the fee only if the certificate is produced. Without it the application is treated as unpaid and returned.",
  "file.submitPortal": "File this application",
  "file.submitting": "Filing…",
  "file.simulatedTitle": "This is a simulated filing",
  "file.simulatedBody":
    "Nothing is sent to rtionline.gov.in and no public authority receives this. The portal has no public way to accept applications from another site, so filing is simulated here — the validation, the fee rules and the registration number all follow the real ones.",
  "file.problemsTitle": "Fix these before filing",
  "pay.title": "Pay the application fee",
  "pay.help": "₹10 under the RTI Rules, 2012. This is a simulated payment — no money moves.",
  "pay.method": "Payment method",
  "pay.upi": "UPI",
  "pay.card": "Debit or credit card",
  "pay.netbanking": "Net banking",
  "pay.bplTitle": "No fee payable",
  "pay.bplBody":
    "You have declared a Below Poverty Line certificate, so Section 7(5) exempts you from the fee. Attach the certificate when you file.",
  "pay.confirm": "Pay ₹10 and file",
  "pay.confirmBpl": "File with the fee exemption",
  "receipt.title": "Your application has been filed",
  "receipt.help": "Keep the registration number. It is the only key the portal accepts for status checks, appeals and complaints.",
  "receipt.regNumber": "Registration number",
  "receipt.filedOn": "Filed on",
  "receipt.authority": "Public authority",
  "receipt.ministry": "Ministry",
  "receipt.fee": "Fee",
  "receipt.feePaid": "₹10 paid",
  "receipt.feeExempt": "Exempt under Section 7(5)",
  "receipt.dueBy": "Reply due by",
  "receipt.track": "Track this application",
  "receipt.download": "Download the application (PDF)",
  "theme.label": "Colour theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "Match my device",
  "nav.new": "Initiate Requisition",
  "nav.mine": "Applicant Dashboard",
  "nav.manual": "How to use",
  "nav.contact": "Contact",
  "nav.faq": "Questions",
  "nav.payment": "Fees",
  "nav.how": "System Capabilities",
  "nav.language": "Language Select",
  "nav.menu": "Menu",
  "nav.skip": "Skip to main content",

  "common.back": "Back",
  "common.continue": "Continue",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.print": "Print or save as PDF",
  "common.tryAgain": "Try again",
  "common.optional": "optional",
  "common.required": "required",
  "common.loading": "Working…",
  "common.step": "Step",
  "common.of": "of",
  "common.stepDone": "done",
  "common.stepCurrent": "current step",
  "common.close": "Close",
  "common.edit": "Edit",
  "common.done": "Done",

  "home.hero.title": "Submit RTI Request / Submit RTI First Appeal",
  "home.hero.body":
    "This is a portal to file RTI applications/first appeals online along with payment gateway. Payment can be made through internet banking, debit/credit cards of Master/Visa, RuPay cards and UPI. Through this portal, RTI applications/first appeals can be filed by Indian Citizens for all Ministries/Departments and other Public Authorities of Central Government.",
  "home.hero.start": "Start my application",
  "home.hero.demo": "See it work on a real example",
  "home.hero.note": "Please read instructions carefully while submitting request/appeal.",

  "home.problem.title": "Important Updates & Advisories",
  "home.problem.1.title": "State Government Notice",
  "home.problem.1.body":
    "Please do not file RTI applications through this portal for the public authorities under the State Governments, including Government of NCT Delhi. If filed, the application would be returned, without refund of amount.",
  "home.problem.2.title": "Second Appeal Notice",
  "home.problem.2.body":
    "The Central Information Commission (CIC) has integrated its Second Appeal Filing Portal with the DoPT RTI Online Portal. Now, while submitting a Second Appeal, the system will automatically retrieve related details of the RTI Application.",
  "home.problem.3.title": "Maintenance Notice",
  "home.problem.3.body":
    "System will not be available on 30-8-2026 (Friday) from 11:00 AM to 3:00 PM due to maintenance activity. Inconvenience caused is highly regretted.",

  "home.solution.title": "Copilot Routing Integration",
  "home.solution.1": "The Central Information Commission (CIC) has integrated its Second Appeal Filing Portal with the DoPT RTI Online Portal.",
  "home.solution.2": "Copilot now automatically retrieves related details of the RTI Application to ensure a smooth and more streamlined filing process.",
  "home.solution.3": "Email verification via OTP will be implemented for all RTI requests starting Monday.",
  "home.solution.4": "This will enhance citizen privacy and data security.",
  "home.solution.5": "It will strengthen the portal's cybersecurity framework.",

  "steps.describe": "Describe",
  "steps.authority": "Authority",
  "steps.draft": "Draft",
  "steps.file": "File",
  "steps.track": "Track",

  "intake.title": "Grievance / Subject Matter Description",
  "intake.help":
    "Furnish factual details of the grievance. Include all relevant reference numbers (e.g., PPO number, FIR, or application number). Submissions are recorded verbatim.",
  "intake.placeholder":
    "For example: My father's pension stopped in April without any notice. We went to the office three times and nobody would explain or show us anything in writing…",
  "intake.words": "words",
  "intake.minWords": "Please write at least 15 words so we can route this accurately.",
  "intake.submit": "Identify Public Authority",
  "intake.working": "Identifying relevant Public Authority…",
  "intake.demoTitle": "Pre-configured Exemplars",
  "intake.demoHelp": "Simulated configurations for procedural demonstration prior to drafting.",
  "intake.privacy": "Your text is sent to our server to be routed and rewritten. It is not stored on our server and is not used to train any model.",

  "confirm.title": "Authority Designation Verification",
  "confirm.help":
    "Statutory Notice: Misdirected submissions initiate Section 6(3) transfer protocols, restarting the statutory 30-day response period. Strict verification is mandated.",
  "confirm.office": "Designated Authority",
  "confirm.pio": "Application goes to",
  "confirm.address": "Filing address",
  "confirm.appellate": "If they do not reply, your appeal goes to",
  "confirm.worthKnowing": "Worth knowing",
  "confirm.verify": "Confirm the exact office for your area at",
  "confirm.references": "Details we will keep exactly as you wrote them",
  "confirm.lowTitle": "Low System Confidence Designation",
  "confirm.lowBody":
    "No authority in our directory clearly holds these records. Please check the department's own website before filing. You can continue, but verify the office first.",
  "confirm.otherOptions": "Other possible offices",
  "confirm.submit": "Generate Statutory Draft",
  "confirm.submitUnsure": "Proceed with Current Selection",
  "confirm.working": "Generating statutory draft…",

  "confidence.strong": "Strong match",
  "confidence.likely": "Likely match",
  "confidence.possible": "Possible match",
  "confidence.uncertain": "Uncertain — verify",
  "confidence.explain": "How sure are we?",
  "confidence.explainBody":
    "This is our own estimate, not an official figure, and it is not a probability. Treat it as a signal about how carefully to check, not as a guarantee.",

  "draft.title": "RTI Requisition Draft",
  "draft.help": "Draft is subject to applicant review. The applicant retains ultimate responsibility for submitted content.",
  "draft.portalLabel": "Your application text",
  "draft.portalHelp":
    "This is the text that will be submitted with your application. It is kept within the 3,000-character limit the RTI request field allows.",
  "draft.chars": "characters",
  "draft.overLimit": "Over the portal's 3,000-character limit. Shorten it, or attach the full version as a PDF.",
  "draft.compare": "Compare with what you wrote",
  "draft.yourWords": "Your words",
  "draft.ourDraft": "What we are asking for",
  "draft.whyChanged": "Drafting Rationale",
  "draft.whyChangedBody":
    "Interrogatives were converted into requests for material records in strict adherence to Section 2(f). Public authorities are statutorily obliged to furnish existing information, not explanations.",
  "draft.items": "Requested records",
  "draft.urgentTitle": "Flagged under Section 7(1): 48-hour window may apply",
  "draft.urgentBody":
    "State this ground in your application. The 48-hour window applies only to genuine life-or-liberty matters. If it does not fit your situation, remove the claim and the normal 30-day deadline applies.",
  "draft.urgentRemove": "This does not apply to me — use the 30-day deadline",
  "draft.urgentRestore": "Restore the 48-hour claim",
  "draft.submit": "Proceed to Filing Directives",
  "draft.regenerate": "Restart Drafting Process",

  "file.title": "Statutory Filing Directives",
  "file.applicantTitle": "Applicant Particulars",
  "file.applicantHelp":
    "Mandatory applicant particulars pursuant to the RTI Rules, 2012. Data is retained strictly within local browser storage.",
  "file.name": "Full name",
  "file.address": "Postal address",
  "file.phone": "Phone number",
  "file.email": "Email address",
  "file.bpl": "I hold a Below Poverty Line (BPL) certificate",
  "file.bplHelp": "Section 7(5) waives the fee. You must attach a copy of the certificate.",
  "file.fee": "Fee",
  "file.attachments": "Have these ready",
  "file.stepsTitle": "Procedural Steps",
  "file.openPortal": "Access Central Portal",
  "file.printTitle": "Or file on paper",
  "file.printHelp":
    "Print the application, sign it, and send it by registered post. Keep the posting receipt — it proves your filing date.",
  "file.markFiled": "I have filed this",
  "file.filedTitle": "Formalize Filing Registration",
  "file.filedHelp": "This entry initiates the statutory tracking period. Provide the exact date of physical or electronic filing.",
  "file.filedDate": "Date of Filing",
  "file.regNumber": "Registration number",
  "file.regNumberHelp":
    "The number the portal gave you, or your registered-post tracking number. This is your only proof of filing — keep it.",
  "file.viaApio": "I filed through an Assistant Public Information Officer (APIO)",
  "file.viaApioHelp": "Adds 5 days to the deadline under the proviso to Section 5(2).",
  "file.confirm": "Start the deadline clock",

  "track.title": "Application Status Tracking",
  "track.filedOn": "Date of Filing",
  "track.deadline": "Reply due by",
  "track.appealBy": "Appeal by",
  "track.basis": "Deadline basis",
  "track.remaining": "Time remaining",
  "track.gotReply": "I received a reply",
  "track.noReply": "No reply received",
  "track.simulate": "Simulate +31 days",
  "track.simulateHelp":
    "Fast-forwards this example's clock so you can see the appeal draft itself without waiting a month. Only available on prepared examples, never on something you actually filed.",
  "track.simulateOn": "Clock fast-forwarded by {days} days (demo)",
  "track.simulateReset": "Reset the clock",
  "track.overdueTitle": "Statutory Period Lapsed",
  "track.overdueBody":
    "No reply within the statutory period is a deemed refusal under Section 7(2). You can file a First Appeal now, free of charge. We have drafted it below.",
  "track.appealTitle": "First Appellate Draft",
  "track.appealHelp":
    "Under Section 19(1), addressed to the appellate officer senior to the PIO. No fee is payable on a first appeal.",
  "track.appealDeadlineWarn": "You have {days} days left to file this appeal.",
  "track.appealClosed":
    "The 30-day appeal window has closed. You can still appeal, but you must ask the appellate authority to condone the delay and give a reason.",
  "track.markAppealed": "I have filed this appeal",
  "track.resolved": "Mark as resolved",

  "status.drafting": "Drafting",
  "status.filed": "Filed",
  "status.awaiting-response": "Awaiting response",
  "status.overdue": "Overdue",
  "status.appealed": "Appealed",
  "status.resolved": "Resolved",

  "list.title": "Applicant Dashboard",
  "list.empty": "No active applications on record.",
  "list.emptyCta": "Initiate New Requisition",
  "list.stored": "Data resides strictly within local browser storage. Clearing browser cache will irrevocably purge all records.",

  "disclosure.title": "What is real and what is mocked",
  "disclosure.fixture":
    "The server was unreachable, so this prepared example is showing its saved response instead of a freshly generated one.",

  "time.overdueToday": "Deadline passed today",
  "time.overdueOne": "1 day overdue",
  "time.overdueMany": "{days} days overdue",
  "time.hourLeft": "1 hour left",
  "time.hoursLeft": "{hours} hours left",
  "time.dayLeft": "1 day left",
  "time.daysLeft": "{days} days left",

  "basis.48h": "48 hours — Section 7(1) proviso",
  "basis.apio": "35 days — filed via Assistant PIO, Section 5(2)",
  "basis.standard": "30 days — Section 7(1)",

  "list.example": "Example",
  "list.open": "Open",
  "list.started": "Started {date}",

  "demo.pension.label": "A pension stopped without notice",
  "demo.pension.teaches": "Turns an angry “why” into a request for the actual order",
  "demo.ration.label": "A ration card application stuck",
  "demo.ration.teaches": "Shows why this one cannot be filed on the central portal",
  "demo.urgent.label": "Treatment being refused right now",
  "demo.urgent.teaches": "Triggers the 48-hour window under Section 7(1)",

  "footer.independent": "Build What Moves India Hackathon Prototype. Not an official government website.",
  "footer.notGov":
    "This portal is a prototype build demonstrating AI-assisted RTI filing. It is not affiliated with, endorsed by, or operated by the Government of India or any State Government. It does not file applications on your behalf and cannot submit anything to the live rtionline.gov.in systems. It prepares a document that you review, sign, and file yourself.",
  "footer.notLegal":
    "This is a drafting aid, not legal advice. Read every draft before you file it — you are responsible for what it says. Nothing here guarantees that an authority will reply.",
  "footer.howLink": "How this works, and what is mocked",
  "footer.portalLink": "Official RTI Online portal",
  "footer.actLink": "The RTI Act, 2005",

  "home.hero.eyebrow": "Right to Information Act, 2005",
  "home.hero.scroll": "How it works",

  "home.sec.problem.eyebrow": "Common Deficiencies",
  "home.sec.problem.title": "Grounds for Rejection under RTI Act, 2005",
  "home.sec.problem.lead":
    "Statistical analysis indicates a high rejection rate for initial applications due to procedural non-compliance and improper authority designation, leading to inevitable delays.",

  "home.sec.scale.eyebrow": "Systematic Backlog",
  "home.sec.scale.title": "Administrative Scale and Scope",
  "home.sec.scale.lead":
    "The volume of citizen queries often outpaces administrative processing capacity, necessitating precise drafting and correct initial routing to avoid systematic backlog.",

  "home.sec.routing.eyebrow": "Authority Routing",
  "home.sec.routing.title": "Verification of Public Authority",
  "home.sec.routing.lead":
    "An automated review matches the grievance against the official directory of public authorities to mitigate Section 6(3) transfer delays and statutory clock resets.",

  "home.sec.rewrite.eyebrow": "Statutory Translation",
  "home.sec.rewrite.title": "Drafting Requisites for Information Requests",
  "home.sec.rewrite.lead":
    "The Act mandates the provision of existing records, not the justification of administrative actions. Queries are transcribed into formal document requisitions compliance with Section 2(f).",

  "home.sec.clock.eyebrow": "Statutory Timelines",
  "home.sec.clock.title": "Section 7 and 19 Compliance",
  "home.sec.clock.lead":
    "Non-response within the stipulated 30-day period constitutes a deemed refusal under Section 7(2), mandating the filing of a First Appeal within the subsequent 30-day window.",

  "home.sec.honest.eyebrow": "Advisory",
  "home.sec.honest.title": "Prototype Usage Notification",
  "home.sec.honest.lead":
    "This system serves strictly as a drafting and routing assistant. It does not interface directly with internal government databases, and no requests are automatically transmitted.",
  "home.sec.honest.cta": "View full technical limitations",

  "home.stat.filed.value": "≈53 lakh",
  "home.stat.filed.label": "RTI applications filed every year",
  "home.stat.filed.source": "Central and State public authorities combined",
  "home.stat.pending.value": "4 lakh+",
  "home.stat.pending.label": "Appeals pending before Information Commissions",
  "home.stat.pending.source": "29 commissions, as on 30 June 2025",
  "home.stat.wait.value": "31 months",
  "home.stat.wait.label": "Typical wait for an appeal to be heard",
  "home.stat.wait.source": "Longest reported backlog runs to decades",
  "home.stat.defunct.value": "7 of 29",
  "home.stat.defunct.label": "Commissions defunct for part of the year",
  "home.stat.defunct.source": "Report Card on Information Commissions",
  "home.stat.attrib":
    "Figures from Satark Nagrik Sangathan's Report Card on Information Commissions and Central Information Commission annual reports.",

  "clock.filed": "Filed",
  "clock.deadline": "Day 30 — deemed refusal",
  "clock.appealCloses": "Appeal closes",
  "clock.alt":
    "A thirty-day response window running out at a deadline, followed by a thirty-day window in which a free First Appeal can be filed.",

  "home.hero.covers": "What it covers",
  "home.hero.coversNote": "Twenty domains, hand-curated. Central and State.",


  "a11y.statement": "Accessibility",
  "a11y.textSize": "Text size",
  "a11y.size.normal": "Normal text size",
  "a11y.size.large": "Larger text size",
  "a11y.size.larger": "Largest text size",
  "a11y.contrast": "High contrast",

  "nav.breadcrumb": "Breadcrumb",
  "nav.home": "Home",

  "footer.col.legal": "Policies",
  "footer.accessibility": "Accessibility statement",
  "footer.sitemap": "Sitemap",
  "footer.policies": "Website policies",
  "footer.updated": "Page last reviewed",

  "footer.col.start": "Start",
  "footer.col.about": "About",
  "footer.col.official": "Official sources",
  "footer.colophon":
    "An independent prototype. Not affiliated with any government body.",

  "home.cta.title": "It takes one paragraph to start",
  "home.cta.lead":
    "No account, no dropdowns, and nothing leaves your browser until you ask us to route it.",

  "error.title": "System Exception Encountered",
} as const;

export type StringKey = keyof typeof en;

const hi: Record<StringKey, string> = {
  "brand.name": "आरटीआई ऑनलाइन",
  "brand.tagline": "संस्करण 3.0 (कोपायलट संस्करण) — कार्मिक और प्रशिक्षण विभाग, भारत सरकार की एक पहल",

  "migrate.title": "इन्हें अपने खाते में सहेजें?",
  "migrate.body":
    "आपके पास {count} आवेदन केवल इसी ब्राउज़र में सहेजे हैं। इन्हें अपने खाते में कॉपी करने पर समय-सीमा समाप्त होने पर हम आपको ईमेल कर सकेंगे — और ब्राउज़र साफ़ करने या डिवाइस बदलने पर भी ये सुरक्षित रहेंगे।",
  "migrate.privacy":
    "आपके आवेदन में PPO, FIR या PAN नंबर हो सकता है। आपकी अनुमति के बिना कुछ भी अपलोड नहीं किया जाता।",
  "migrate.confirm": "मेरे खाते में कॉपी करें",
  "migrate.dismiss": "इसी ब्राउज़र में रहने दें",
  "migrate.working": "कॉपी हो रहा है…",
  "migrate.done": "{count} आपके खाते में कॉपी हो गए।",
  "migrate.failed": "{count} कॉपी नहीं हो सके। वे अब भी इसी ब्राउज़र में सुरक्षित हैं।",
  "file.state": "राज्य",
  "file.statePlaceholder": "अपना राज्य चुनें",
  "file.pincode": "पिन कोड",
  "file.pincodeHelp": "छह अंक।",
  "file.bplRef": "बीपीएल प्रमाणपत्र संख्या",
  "file.bplRefHelp":
    "धारा 7(5) शुल्क तभी माफ़ करती है जब प्रमाणपत्र प्रस्तुत किया जाए। इसके बिना आवेदन अवैतनिक मानकर लौटा दिया जाता है।",
  "file.submitPortal": "यह आवेदन दाख़िल करें",
  "file.submitting": "दाख़िल हो रहा है…",
  "file.simulatedTitle": "यह एक नक़ली (सिम्युलेटेड) फ़ाइलिंग है",
  "file.simulatedBody":
    "rtionline.gov.in पर कुछ नहीं भेजा जाता और कोई लोक प्राधिकरण इसे प्राप्त नहीं करता। पोर्टल के पास किसी दूसरी साइट से आवेदन स्वीकार करने का कोई सार्वजनिक तरीक़ा नहीं है, इसलिए यहाँ फ़ाइलिंग नक़ली है — पर जाँच, शुल्क नियम और पंजीकरण संख्या असली नियमों का पालन करते हैं।",
  "file.problemsTitle": "दाख़िल करने से पहले इन्हें ठीक करें",
  "pay.title": "आवेदन शुल्क का भुगतान करें",
  "pay.help": "आरटीआई नियम, 2012 के तहत ₹10। यह नक़ली भुगतान है — कोई पैसा नहीं जाता।",
  "pay.method": "भुगतान का तरीक़ा",
  "pay.upi": "यूपीआई",
  "pay.card": "डेबिट या क्रेडिट कार्ड",
  "pay.netbanking": "नेट बैंकिंग",
  "pay.bplTitle": "कोई शुल्क देय नहीं",
  "pay.bplBody":
    "आपने बीपीएल प्रमाणपत्र घोषित किया है, इसलिए धारा 7(5) आपको शुल्क से छूट देती है। दाख़िल करते समय प्रमाणपत्र संलग्न करें।",
  "pay.confirm": "₹10 देकर दाख़िल करें",
  "pay.confirmBpl": "शुल्क छूट के साथ दाख़िल करें",
  "receipt.title": "आपका आवेदन दाख़िल हो गया है",
  "receipt.help": "पंजीकरण संख्या सँभालकर रखें। स्थिति जाँच, अपील और शिकायत के लिए पोर्टल यही स्वीकार करता है।",
  "receipt.regNumber": "पंजीकरण संख्या",
  "receipt.filedOn": "दाख़िल करने की तिथि",
  "receipt.authority": "लोक प्राधिकरण",
  "receipt.ministry": "मंत्रालय",
  "receipt.fee": "शुल्क",
  "receipt.feePaid": "₹10 भुगतान किया गया",
  "receipt.feeExempt": "धारा 7(5) के तहत छूट",
  "receipt.dueBy": "उत्तर देय तिथि",
  "receipt.track": "इस आवेदन को ट्रैक करें",
  "receipt.download": "आवेदन डाउनलोड करें (PDF)",
  "theme.label": "रंग थीम",
  "theme.light": "उजला",
  "theme.dark": "गहरा",
  "theme.system": "मेरे डिवाइस जैसा",
  "nav.new": "नया आवेदन",
  "nav.mine": "मेरे आवेदन",
  "nav.manual": "उपयोगकर्ता मैनुअल",
  "nav.contact": "संपर्क करें",
  "nav.faq": "सामान्य प्रश्न",
  "nav.payment": "भुगतान समाधान",
  "nav.how": "यह कैसे काम करता है",
  "nav.language": "भाषा",
  "nav.menu": "मेनू",
  "nav.skip": "मुख्य सामग्री पर जाएं",

  "common.back": "पीछे",
  "common.continue": "आगे बढ़ें",
  "common.cancel": "रद्द करें",
  "common.delete": "हटाएँ",
  "common.print": "प्रिंट करें या पीडीएफ बनाएँ",
  "common.tryAgain": "फिर कोशिश करें",
  "common.optional": "वैकल्पिक",
  "common.required": "आवश्यक",
  "common.loading": "काम चल रहा है…",
  "common.step": "चरण",
  "common.of": "में से",
  "common.stepDone": "पूर्ण",
  "common.stepCurrent": "वर्तमान चरण",
  "common.close": "बंद करें",
  "common.edit": "बदलें",
  "common.done": "पूर्ण",

  "home.hero.title": "आरटीआई अनुरोध प्रस्तुत करें / आरटीआई प्रथम अपील प्रस्तुत करें",
  "home.hero.body":
    "यह पेमेंट गेटवे के साथ ऑनलाइन आरटीआई आवेदन/प्रथम अपील प्रस्तुत करने के लिए एक पोर्टल है। पेमेंट मास्टर/वीजा के इंटरनेट बैंकिंग, डेबिट/क्रेडिट कार्ड, रुपे कार्ड और यूपीआई के माध्यम से किया जा सकता है। इस पोर्टल के माध्यम से, भारतीय नागरिक केंद्र सरकार के सभी मंत्रालयों/विभागों और अन्य सार्वजनिक प्राधिकरणों के लिए आरटीआई आवेदन/प्रथम अपील प्रस्तुत कर सकते हैं।",
  "home.hero.start": "मेरा आवेदन शुरू करें",
  "home.hero.demo": "एक उदाहरण पर चलकर देखें",
  "home.hero.note":
    "कृपया अनुरोध/अपील प्रस्तुत करते समय निर्देशों को ध्यान से पढ़ें।",

  "home.problem.title": "महत्वपूर्ण अपडेट और सलाह",
  "home.problem.1.title": "राज्य सरकार की सूचना",
  "home.problem.1.body":
    "कृपया एनसीटी दिल्ली सरकार सहित राज्य सरकारों के अंतर्गत आने वाले सार्वजनिक प्राधिकरणों के लिए इस पोर्टल के माध्यम से आरटीआई आवेदन दाखिल न करें। यदि दाखिल किया जाता है, तो राशि वापस किए बिना आवेदन लौटा दिया जाएगा।",
  "home.problem.2.title": "द्वितीय अपील सूचना",
  "home.problem.2.body":
    "केंद्रीय सूचना आयोग (CIC) ने अपने द्वितीय अपील फाइलिंग पोर्टल को DoPT RTI ऑनलाइन पोर्टल के साथ एकीकृत किया है। अब, द्वितीय अपील प्रस्तुत करते समय, सिस्टम स्वचालित रूप से आरटीआई आवेदन का संबंधित विवरण प्राप्त कर लेगा।",
  "home.problem.3.title": "अनुरक्षण सूचना",
  "home.problem.3.body":
    "रखरखाव गतिविधि के कारण सिस्टम 30-8-2026 (शुक्रवार) को सुबह 11:00 बजे से दोपहर 3:00 बजे तक उपलब्ध नहीं रहेगा। असुविधा के लिए अत्यधिक खेद है।",

  "home.solution.title": "कोपायलट रूटिंग एकीकरण",
  "home.solution.1": "केंद्रीय सूचना आयोग (CIC) ने अपने द्वितीय अपील फाइलिंग पोर्टल को DoPT RTI ऑनलाइन पोर्टल के साथ एकीकृत किया है।",
  "home.solution.2":
    "कोपायलट अब एक सुचारू और अधिक सुव्यवस्थित फाइलिंग प्रक्रिया सुनिश्चित करने के लिए आरटीआई आवेदन के संबंधित विवरणों को स्वचालित रूप से प्राप्त करता है।",
  "home.solution.3": "सभी आरटीआई अनुरोधों के लिए ओटीपी के माध्यम से ईमेल सत्यापन सोमवार से लागू किया जाएगा।",
  "home.solution.4": "यह नागरिकों की गोपनीयता और डेटा सुरक्षा को बढ़ाएगा।",
  "home.solution.5": "यह पोर्टल के साइबर सुरक्षा ढांचे को मजबूत करेगा।",

  "steps.describe": "विवरण",
  "steps.authority": "कार्यालय",
  "steps.draft": "मसौदा",
  "steps.file": "दाख़िल",
  "steps.track": "निगरानी",

  "intake.title": "क्या हुआ?",
  "intake.help":
    "जैसे किसी मित्र को बताते, वैसे लिखिए। तारीखें और जो भी संदर्भ संख्या आपके पास है — पीपीओ नंबर, केस नंबर, आवेदन संख्या — ज़रूर लिखें। हम उन्हें हूबहू वैसे ही रखते हैं।",
  "intake.placeholder":
    "उदाहरण: मेरे पिता की पेंशन अप्रैल में बिना किसी सूचना के बंद हो गई। हम तीन बार कार्यालय गए, किसी ने न कारण बताया, न कुछ लिखित दिया…",
  "intake.words": "शब्द",
  "intake.minWords": "सही कार्यालय ढूँढ़ने के लिए कृपया कम से कम 15 शब्द लिखें।",
  "intake.submit": "सही कार्यालय ढूँढ़ें",
  "intake.working": "सही कार्यालय ढूँढ़ा जा रहा है…",
  "intake.demoTitle": "या इनमें से कोई आज़माएँ",
  "intake.demoHelp": "तैयार उदाहरण, ताकि अपना लिखने से पहले आप पूरी प्रक्रिया देख सकें।",
  "intake.privacy":
    "आपका लिखा हुआ पाठ रूटिंग और पुनर्लेखन के लिए हमारे सर्वर पर भेजा जाता है। यह सर्वर पर संग्रहीत नहीं होता और किसी मॉडल के प्रशिक्षण में उपयोग नहीं होता।",

  "confirm.title": "क्या यही सही कार्यालय है?",
  "confirm.help":
    "गलत प्राधिकरण में दाख़िल करने पर धारा 6(3) के तहत स्थानांतरण होता है और 30 दिन की अवधि फिर से शुरू होती है। यह स्क्रीन दो बार पढ़ने लायक है।",
  "confirm.office": "यह कार्यालय",
  "confirm.pio": "आवेदन यहाँ जाएगा",
  "confirm.address": "दाख़िल करने का पता",
  "confirm.appellate": "उत्तर न मिलने पर अपील यहाँ जाएगी",
  "confirm.worthKnowing": "जानने योग्य",
  "confirm.verify": "अपने क्षेत्र का सही कार्यालय यहाँ जाँचें",
  "confirm.references": "ये विवरण हम हूबहू वैसे ही रखेंगे",
  "confirm.lowTitle": "इस मिलान को लेकर हम आश्वस्त नहीं हैं",
  "confirm.lowBody":
    "हमारी सूची में कोई प्राधिकरण स्पष्ट रूप से इन अभिलेखों को नहीं रखता। दाख़िल करने से पहले कृपया विभाग की अपनी वेबसाइट देखें। आप आगे बढ़ सकते हैं, पर पहले कार्यालय की पुष्टि कर लें।",
  "confirm.otherOptions": "अन्य संभावित कार्यालय",
  "confirm.submit": "मेरा आवेदन लिखें",
  "confirm.submitUnsure": "फिर भी आगे बढ़ें",
  "confirm.working": "आपका आवेदन लिखा जा रहा है…",

  "confidence.strong": "पक्का मिलान",
  "confidence.likely": "संभावित मिलान",
  "confidence.possible": "हो सकता है",
  "confidence.uncertain": "अनिश्चित — जाँच लें",
  "confidence.explain": "हम कितने आश्वस्त हैं?",
  "confidence.explainBody":
    "यह हमारा अपना अनुमान है, कोई सरकारी आँकड़ा नहीं, और यह प्रायिकता भी नहीं है। इसे इस संकेत की तरह लें कि कितनी सावधानी से जाँचना है — गारंटी की तरह नहीं।",

  "draft.title": "आपका आरटीआई आवेदन",
  "draft.help": "हर पंक्ति बदली जा सकती है। क्या दाख़िल होगा, यह अंततः आप तय करते हैं।",
  "draft.portalLabel": "आपके आवेदन का पाठ",
  "draft.portalHelp":
    "यही पाठ आपके आवेदन के साथ जमा किया जाएगा। यह आरटीआई अनुरोध क्षेत्र की 3,000 अक्षरों की सीमा के भीतर रखा गया है।",
  "draft.chars": "अक्षर",
  "draft.overLimit":
    "पोर्टल की 3,000 अक्षरों की सीमा से अधिक। इसे छोटा करें, या पूरा संस्करण पीडीएफ के रूप में संलग्न करें।",
  "draft.compare": "आपने जो लिखा था उससे मिलाएँ",
  "draft.yourWords": "आपके शब्द",
  "draft.ourDraft": "हम क्या माँग रहे हैं",
  "draft.whyChanged": "यह क्यों बदला",
  "draft.whyChangedBody":
    "प्रश्नों को उन अभिलेखों की माँग में बदला गया जो उनका उत्तर देंगे। धारा 2(f) के तहत प्राधिकरण को अपने पास मौजूद सूचना देनी होती है; सफ़ाई देना या राय देना ज़रूरी नहीं।",
  "draft.items": "माँगे गए अभिलेख",
  "draft.urgentTitle": "धारा 7(1) के तहत चिह्नित: 48 घंटे की समय-सीमा लागू हो सकती है",
  "draft.urgentBody":
    "यह आधार अपने आवेदन में स्पष्ट रूप से लिखें। 48 घंटे की अवधि केवल वास्तविक जीवन या स्वतंत्रता के मामलों पर लागू होती है। यदि यह आपकी स्थिति पर लागू नहीं होता, तो इसे हटा दें और सामान्य 30 दिन की सीमा लागू होगी।",
  "draft.urgentRemove": "यह मुझ पर लागू नहीं — 30 दिन की सीमा रखें",
  "draft.urgentRestore": "48 घंटे का दावा वापस लाएँ",
  "draft.submit": "आगे: इसे कैसे दाख़िल करें",
  "draft.regenerate": "फिर से शुरू करें",

  "file.title": "इसे कैसे दाख़िल करें",
  "file.applicantTitle": "आपका विवरण",
  "file.applicantHelp":
    "आरटीआई नियम, 2012 के अंतर्गत आवेदन पर आवश्यक। केवल इसी ब्राउज़र में सुरक्षित रहता है।",
  "file.name": "पूरा नाम",
  "file.address": "डाक पता",
  "file.phone": "फ़ोन नंबर",
  "file.email": "ईमेल पता",
  "file.bpl": "मेरे पास गरीबी रेखा से नीचे (बीपीएल) का प्रमाणपत्र है",
  "file.bplHelp": "धारा 7(5) के तहत शुल्क माफ़ है। प्रमाणपत्र की प्रति संलग्न करना अनिवार्य है।",
  "file.fee": "शुल्क",
  "file.attachments": "ये तैयार रखें",
  "file.stepsTitle": "चरण",
  "file.openPortal": "पोर्टल खोलें",
  "file.printTitle": "या कागज़ पर दाख़िल करें",
  "file.printHelp":
    "आवेदन प्रिंट करें, हस्ताक्षर करें और पंजीकृत डाक से भेजें। डाक की रसीद संभालकर रखें — वही आपकी तिथि का प्रमाण है।",
  "file.markFiled": "मैंने इसे दाख़िल कर दिया है",
  "file.filedTitle": "अपना दाख़िला दर्ज करें",
  "file.filedHelp": "इससे आपकी वैधानिक समय-सीमा शुरू होती है। वही तिथि लिखें जब आपने वास्तव में दाख़िल किया।",
  "file.filedDate": "दाख़िल करने की तिथि",
  "file.regNumber": "पंजीकरण संख्या",
  "file.regNumberHelp":
    "पोर्टल से मिली संख्या, या पंजीकृत डाक की ट्रैकिंग संख्या। यही आपके दाख़िले का एकमात्र प्रमाण है — इसे संभालकर रखें।",
  "file.viaApio": "मैंने सहायक लोक सूचना अधिकारी (APIO) के माध्यम से दाख़िल किया",
  "file.viaApioHelp": "धारा 5(2) के परंतुक के तहत समय-सीमा में 5 दिन जुड़ते हैं।",
  "file.confirm": "समय-सीमा शुरू करें",

  "track.title": "आपके आवेदन की स्थिति",
  "track.filedOn": "दाख़िल किया गया",
  "track.deadline": "उत्तर की अंतिम तिथि",
  "track.appealBy": "अपील की अंतिम तिथि",
  "track.basis": "समय-सीमा का आधार",
  "track.remaining": "शेष समय",
  "track.gotReply": "मुझे उत्तर मिल गया",
  "track.noReply": "कोई उत्तर नहीं मिला",
  "track.simulate": "+31 दिन आगे बढ़ाएँ",
  "track.simulateHelp":
    "इस उदाहरण की घड़ी आगे बढ़ाता है ताकि आप महीना भर रुके बिना अपील का मसौदा बनते देख सकें। केवल तैयार उदाहरणों पर उपलब्ध, आपके वास्तविक आवेदन पर कभी नहीं।",
  "track.simulateOn": "घड़ी {days} दिन आगे बढ़ाई गई (डेमो)",
  "track.simulateReset": "घड़ी वापस करें",
  "track.overdueTitle": "समय-सीमा बीत चुकी है",
  "track.overdueBody":
    "वैधानिक अवधि में उत्तर न आना धारा 7(2) के तहत मानी गई अस्वीकृति है। आप अभी निःशुल्क प्रथम अपील दाख़िल कर सकते हैं। हमने नीचे उसका मसौदा तैयार कर दिया है।",
  "track.appealTitle": "आपकी प्रथम अपील",
  "track.appealHelp":
    "धारा 19(1) के तहत, पीआईओ से वरिष्ठ अपीलीय अधिकारी के नाम। प्रथम अपील पर कोई शुल्क नहीं लगता।",
  "track.appealDeadlineWarn": "यह अपील दाख़िल करने के लिए आपके पास {days} दिन बचे हैं।",
  "track.appealClosed":
    "30 दिन की अपील अवधि समाप्त हो चुकी है। आप अब भी अपील कर सकते हैं, पर अपीलीय प्राधिकारी से विलंब क्षमा करने का अनुरोध और कारण देना होगा।",
  "track.markAppealed": "मैंने यह अपील दाख़िल कर दी है",
  "track.resolved": "निपटा हुआ चिह्नित करें",

  "status.drafting": "मसौदा",
  "status.filed": "दाख़िल",
  "status.awaiting-response": "उत्तर की प्रतीक्षा",
  "status.overdue": "अवधि बीती",
  "status.appealed": "अपील की गई",
  "status.resolved": "निपटा",

  "list.title": "मेरे आवेदन",
  "list.empty": "आपने अभी कोई आवेदन शुरू नहीं किया है।",
  "list.emptyCta": "अपना पहला आवेदन शुरू करें",
  "list.stored": "केवल इसी ब्राउज़र में सुरक्षित। ब्राउज़र डेटा मिटाने पर ये हट जाएँगे।",

  "disclosure.title": "क्या वास्तविक है और क्या नकली",
  "disclosure.fixture":
    "सर्वर उपलब्ध नहीं था, इसलिए यह तैयार उदाहरण ताज़ा उत्तर के बजाय अपना सहेजा हुआ उत्तर दिखा रहा है।",

  "time.overdueToday": "समय-सीमा आज समाप्त हो गई",
  "time.overdueOne": "1 दिन बीत चुका",
  "time.overdueMany": "{days} दिन बीत चुके",
  "time.hourLeft": "1 घंटा बाक़ी",
  "time.hoursLeft": "{hours} घंटे बाक़ी",
  "time.dayLeft": "1 दिन बाक़ी",
  "time.daysLeft": "{days} दिन बाक़ी",

  "basis.48h": "48 घंटे — धारा 7(1) का परंतुक",
  "basis.apio": "35 दिन — सहायक लोक सूचना अधिकारी के माध्यम से, धारा 5(2)",
  "basis.standard": "30 दिन — धारा 7(1)",

  "list.example": "उदाहरण",
  "list.open": "खोलें",
  "list.started": "{date} को शुरू किया",

  "demo.pension.label": "बिना सूचना बंद हुई पेंशन",
  "demo.pension.teaches": "गुस्से भरे “क्यों” को असली आदेश की माँग में बदलता है",
  "demo.ration.label": "अटका हुआ राशन कार्ड आवेदन",
  "demo.ration.teaches": "दिखाता है कि इसे केंद्रीय पोर्टल पर क्यों नहीं भरा जा सकता",
  "demo.urgent.label": "अभी इलाज से मना किया जा रहा है",
  "demo.urgent.teaches": "धारा 7(1) की 48 घंटे की समय-सीमा सक्रिय करता है",

  "footer.independent": "एक स्वतंत्र परियोजना। यह सरकारी वेबसाइट नहीं है।",
  "footer.notGov":
    "आरटीआई कोपायलट का भारत सरकार या किसी राज्य सरकार से कोई संबंध नहीं है, न ही इसे उनकी मान्यता प्राप्त है या वे इसे चलाते हैं। यह आपकी ओर से आवेदन दाख़िल नहीं करता और rtionline.gov.in पर कुछ भी जमा नहीं कर सकता। यह केवल एक दस्तावेज़ तैयार करता है, जिसे आप स्वयं जाँचकर, हस्ताक्षर करके दाख़िल करते हैं।",
  "footer.notLegal":
    "यह मसौदा तैयार करने में सहायक है, कानूनी सलाह नहीं। दाख़िल करने से पहले हर मसौदा पढ़ें — उसमें जो लिखा है उसकी ज़िम्मेदारी आपकी है। यहाँ कुछ भी इसकी गारंटी नहीं देता कि प्राधिकरण उत्तर देगा।",
  "footer.howLink": "यह कैसे काम करता है, और क्या नकली है",
  "footer.portalLink": "आधिकारिक आरटीआई ऑनलाइन पोर्टल",
  "footer.actLink": "सूचना का अधिकार अधिनियम, 2005",

  "home.hero.eyebrow": "सूचना का अधिकार अधिनियम, 2005",
  "home.hero.scroll": "यह कैसे काम करता है",

  "home.sec.problem.eyebrow": "सामान्य कमियाँ",
  "home.sec.problem.title": "आरटीआई अधिनियम, 2005 के तहत अस्वीकृति के आधार",
  "home.sec.problem.lead":
    "प्रक्रियागत अनुपालन न होने और अनुचित प्राधिकरण के चयन के कारण प्रारंभिक आवेदनों की अस्वीकृति दर उच्च पाई गई है, जिससे अनावश्यक विलंब होता है।",

  "home.sec.scale.eyebrow": "प्रणालीगत बैकलॉग",
  "home.sec.scale.title": "प्रशासनिक दायरा और सीमा",
  "home.sec.scale.lead":
    "नागरिक प्रश्नों की संख्या अक्सर प्रशासनिक प्रसंस्करण क्षमता से अधिक होती है, इसलिए सटीक प्रारूपण और सही प्रारंभिक मार्ग निर्धारण आवश्यक है।",

  "home.sec.routing.eyebrow": "प्राधिकरण चयन",
  "home.sec.routing.title": "लोक प्राधिकरण का सत्यापन",
  "home.sec.routing.lead":
    "यह प्रणाली सार्वजनिक प्राधिकरणों की आधिकारिक निर्देशिका के साथ शिकायत का मिलान करती है ताकि धारा 6(3) के तहत स्थानांतरण में होने वाले विलंब से बचा जा सके।",

  "home.sec.rewrite.eyebrow": "वैधानिक अनुवाद",
  "home.sec.rewrite.title": "सूचना अनुरोधों के लिए प्रारूपण आवश्यकताएं",
  "home.sec.rewrite.lead":
    "अधिनियम प्रशासनिक कार्रवाइयों के औचित्य को नहीं, बल्कि मौजूदा रिकॉर्ड प्रदान करने को अनिवार्य बनाता है। धारा 2(एफ) के अनुपालन में प्रश्नों को औपचारिक दस्तावेज़ अनुरोधों में बदल दिया जाता है।",

  "home.sec.clock.eyebrow": "वैधानिक समय-सीमा",
  "home.sec.clock.title": "धारा 7 और 19 का अनुपालन",
  "home.sec.clock.lead":
    "निर्धारित 30 दिनों की अवधि के भीतर उत्तर न देना धारा 7(2) के तहत मानी गई अस्वीकृति है, जिसके लिए अगले 30 दिनों के भीतर प्रथम अपील दायर करना अनिवार्य है।",

  "home.sec.honest.eyebrow": "परामर्श",
  "home.sec.honest.title": "प्रोटोटाइप उपयोग की सूचना",
  "home.sec.honest.lead":
    "यह प्रणाली केवल प्रारूपण और चयन सहायक के रूप में कार्य करती है। यह सीधे सरकारी डेटाबेस से नहीं जुड़ती है, और कोई भी अनुरोध स्वचालित रूप से प्रेषित नहीं होता है।",
  "home.sec.honest.cta": "पूर्ण तकनीकी सीमाएं देखें",

  "home.stat.filed.value": "≈53 लाख",
  "home.stat.filed.label": "हर साल दाख़िल होने वाले आरटीआई आवेदन",
  "home.stat.filed.source": "केंद्र और राज्य के लोक प्राधिकरण मिलाकर",
  "home.stat.pending.value": "4 लाख+",
  "home.stat.pending.label": "सूचना आयोगों में लंबित अपीलें",
  "home.stat.pending.source": "29 आयोग, 30 जून 2025 तक",
  "home.stat.wait.value": "31 माह",
  "home.stat.wait.label": "अपील की सुनवाई के लिए सामान्य प्रतीक्षा",
  "home.stat.wait.source": "सबसे लंबी प्रतीक्षा दशकों तक जाती है",
  "home.stat.defunct.value": "29 में से 7",
  "home.stat.defunct.label": "वर्ष के कुछ भाग में निष्क्रिय रहे आयोग",
  "home.stat.defunct.source": "सूचना आयोगों का रिपोर्ट कार्ड",
  "home.stat.attrib":
    "आँकड़े सतर्क नागरिक संगठन के “रिपोर्ट कार्ड ऑन इन्फ़ॉर्मेशन कमीशंस” और केंद्रीय सूचना आयोग की वार्षिक रिपोर्टों से।",

  "clock.filed": "दाख़िल",
  "clock.deadline": "दिन 30 — मानी गई अस्वीकृति",
  "clock.appealCloses": "अपील की अवधि समाप्त",
  "clock.alt":
    "तीस दिन की उत्तर अवधि समय-सीमा पर समाप्त होती है, उसके बाद तीस दिन की वह अवधि जिसमें निःशुल्क प्रथम अपील दाख़िल की जा सकती है।",

  "home.hero.covers": "यह किन क्षेत्रों को कवर करता है",
  "home.hero.coversNote": "बीस क्षेत्र, हाथ से चुने गए। केंद्र और राज्य दोनों।",


  "a11y.statement": "सुगम्यता",
  "a11y.textSize": "अक्षर का आकार",
  "a11y.size.normal": "सामान्य अक्षर आकार",
  "a11y.size.large": "बड़ा अक्षर आकार",
  "a11y.size.larger": "सबसे बड़ा अक्षर आकार",
  "a11y.contrast": "उच्च कंट्रास्ट",

  "nav.breadcrumb": "पथ",
  "nav.home": "मुख्य पृष्ठ",

  "footer.col.legal": "नीतियाँ",
  "footer.accessibility": "सुगम्यता विवरण",
  "footer.sitemap": "साइट मानचित्र",
  "footer.policies": "वेबसाइट नीतियाँ",
  "footer.updated": "पृष्ठ की अंतिम समीक्षा",

  "footer.col.start": "शुरू करें",
  "footer.col.about": "परिचय",
  "footer.col.official": "आधिकारिक स्रोत",
  "footer.colophon":
    "एक स्वतंत्र प्रोटोटाइप। किसी सरकारी संस्था से संबद्ध नहीं।",

  "home.cta.title": "शुरू करने के लिए एक अनुच्छेद काफ़ी है",
  "home.cta.lead":
    "कोई खाता नहीं, कोई ड्रॉप-डाउन नहीं, और जब तक आप न कहें आपका लिखा हुआ ब्राउज़र से बाहर नहीं जाता।",

  "error.title": "हम आगे नहीं बढ़ सके",
};

const DICTIONARIES: Record<Locale, Record<StringKey, string>> = { en, hi };

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Look up a string, optionally interpolating `{name}` placeholders. */
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

/*
 * The stored preference is an external system, so it is read through
 * useSyncExternalStore rather than copied into state by an effect. That keeps
 * the server snapshot ("en") and the first client paint consistent without a
 * cascading re-render, and makes a change in one tab apply in the others.
 */
const localeListeners = new Set<() => void>();

/**
 * In-memory value is the source of truth; storage is only how it survives a
 * reload. If writing fails — private browsing, storage disabled, quota — the
 * toggle still works for this visit instead of appearing to do nothing.
 */
let currentLocale: Locale | null = null;

function subscribeLocale(listener: () => void): () => void {
  localeListeners.add(listener);
  const onStorage = () => {
    currentLocale = null; // Another tab changed it; re-read on next snapshot.
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    localeListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readLocale(): Locale {
  if (currentLocale) return currentLocale;
  try {
    currentLocale = window.localStorage.getItem(STORAGE_KEY) === "hi" ? "hi" : "en";
  } catch {
    currentLocale = "en";
  }
  return currentLocale;
}

function writeLocale(next: Locale) {
  currentLocale = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Preference will not survive a reload, but the switch still applies now.
  }
  localeListeners.forEach((listener) => listener());
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => "en" as Locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => writeLocale(next), []);

  const t = useCallback<I18nValue["t"]>(
    (key, vars) => {
      const raw = DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce(
        (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
        raw
      );
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside <I18nProvider>.");
  }
  return context;
}
