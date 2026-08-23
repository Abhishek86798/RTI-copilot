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
  "brand.name": "RTI Copilot",
  "brand.tagline": "Plain language in, a valid RTI application out",

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
  "nav.new": "New application",
  "nav.mine": "My applications",
  "nav.how": "How this works",
  "nav.language": "Language",
  "nav.menu": "Menu",
  "nav.skip": "Skip to main content",

  "common.back": "Back",
  "common.continue": "Continue",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.copy": "Copy",
  "common.copied": "Copied",
  "common.print": "Print or save as PDF",
  "common.tryAgain": "Try again",
  "common.optional": "optional",
  "common.required": "required",
  "common.loading": "Working…",
  "common.step": "Step",
  "common.of": "of",
  "common.close": "Close",
  "common.edit": "Edit",
  "common.done": "Done",

  "home.hero.title": "You should not need to know which department to ask.",
  "home.hero.body":
    "Describe what went wrong in your own words. We find the office that holds the records, rewrite your complaint into a request the law compels them to answer, and track the 30-day deadline for you.",
  "home.hero.start": "Start my application",
  "home.hero.demo": "See it work on a real example",
  "home.hero.note": "Free. No account needed. Nothing you type leaves your browser until you ask us to route it.",

  "home.problem.title": "Why most first RTI applications fail",
  "home.problem.1.title": "You must already know the department",
  "home.problem.1.body":
    "The official portal opens with Ministry, then Department, then Public Authority. If you pick wrong, your application is transferred under Section 6(3) and your 30-day clock starts again.",
  "home.problem.2.title": "Asking “why” is legally refusable",
  "home.problem.2.body":
    "The Act gives you records, not explanations. “Why was my pension stopped?” can be lawfully refused. “The order and file notings recording the stoppage” cannot.",
  "home.problem.3.title": "Nobody tells you the clock has run out",
  "home.problem.3.body":
    "If no reply comes in 30 days, you have 30 more to appeal. Miss that and you start over. No one sends you a reminder.",

  "home.solution.title": "What we do instead",
  "home.solution.1": "You write one paragraph in plain language.",
  "home.solution.2": "We match it to the public authority that holds the records, and show you how sure we are.",
  "home.solution.3": "We rewrite it as a numbered list of documents to produce.",
  "home.solution.4": "We tell you which portal actually accepts it, and what it costs.",
  "home.solution.5": "We watch the deadline and draft your appeal the day it lapses.",

  "steps.describe": "Describe",
  "steps.authority": "Authority",
  "steps.draft": "Draft",
  "steps.file": "File",
  "steps.track": "Track",

  "intake.title": "What happened?",
  "intake.help":
    "Write it the way you would tell a friend. Include any dates, and any reference numbers you have — a PPO number, a case number, an application number. We keep those exactly as you write them.",
  "intake.placeholder":
    "For example: My father's pension stopped in April without any notice. We went to the office three times and nobody would explain or show us anything in writing…",
  "intake.words": "words",
  "intake.minWords": "Please write at least 15 words so we can route this accurately.",
  "intake.submit": "Find the right authority",
  "intake.working": "Finding the right authority…",
  "intake.demoTitle": "Or try one of these",
  "intake.demoHelp": "Prepared examples, so you can see the whole journey before writing your own.",
  "intake.privacy": "Your text is sent to our server to be routed and rewritten. It is not stored on our server and is not used to train any model.",

  "confirm.title": "Is this the right office?",
  "confirm.help":
    "Filing with the wrong authority costs you a Section 6(3) transfer and restarts your 30-day clock. This is the one screen worth reading twice.",
  "confirm.pio": "Application goes to",
  "confirm.address": "Filing address",
  "confirm.appellate": "If they do not reply, your appeal goes to",
  "confirm.worthKnowing": "Worth knowing",
  "confirm.verify": "Confirm the exact office for your area at",
  "confirm.references": "Details we will keep exactly as you wrote them",
  "confirm.lowTitle": "We are not confident about this match",
  "confirm.lowBody":
    "No authority in our directory clearly holds these records. Please check the department's own website before filing. You can continue, but verify the office first.",
  "confirm.otherOptions": "Other possible offices",
  "confirm.submit": "Write my application",
  "confirm.submitUnsure": "Continue anyway",
  "confirm.working": "Writing your application…",

  "confidence.strong": "Strong match",
  "confidence.likely": "Likely match",
  "confidence.possible": "Possible match",
  "confidence.uncertain": "Uncertain — verify",
  "confidence.explain": "How sure are we?",
  "confidence.explainBody":
    "This is our own estimate, not an official figure, and it is not a probability. Treat it as a signal about how carefully to check, not as a guarantee.",

  "draft.title": "Your RTI application",
  "draft.help": "Every line is editable. You have the final say on what gets filed.",
  "draft.portalLabel": "Portal-ready text",
  "draft.portalHelp":
    "Paste this into the request box on the portal. It is kept under the 3,000-character limit the portal enforces.",
  "draft.chars": "characters",
  "draft.overLimit": "Over the portal's 3,000-character limit. Shorten it, or attach the full version as a PDF.",
  "draft.compare": "Compare with what you wrote",
  "draft.yourWords": "Your words",
  "draft.ourDraft": "What we are asking for",
  "draft.whyChanged": "Why it changed",
  "draft.whyChangedBody":
    "Questions were turned into requests for the records that would answer them. Under Section 2(f) an authority must give you information it holds; it does not have to explain itself or offer an opinion.",
  "draft.items": "Requested records",
  "draft.urgentTitle": "Flagged under Section 7(1): 48-hour window may apply",
  "draft.urgentBody":
    "State this ground in your application. The 48-hour window applies only to genuine life-or-liberty matters. If it does not fit your situation, remove the claim and the normal 30-day deadline applies.",
  "draft.urgentRemove": "This does not apply to me — use the 30-day deadline",
  "draft.urgentRestore": "Restore the 48-hour claim",
  "draft.submit": "Next: how to file this",
  "draft.regenerate": "Start over",

  "file.title": "How to file this",
  "file.applicantTitle": "Your details",
  "file.applicantHelp":
    "Required on the application under the RTI Rules, 2012. Stored only in this browser.",
  "file.name": "Full name",
  "file.address": "Postal address",
  "file.phone": "Phone number",
  "file.email": "Email address",
  "file.bpl": "I hold a Below Poverty Line (BPL) certificate",
  "file.bplHelp": "Section 7(5) waives the fee. You must attach a copy of the certificate.",
  "file.fee": "Fee",
  "file.attachments": "Have these ready",
  "file.stepsTitle": "Steps",
  "file.openPortal": "Open the portal",
  "file.copyText": "Copy the application text",
  "file.printTitle": "Or file on paper",
  "file.printHelp":
    "Print the application, sign it, and send it by registered post. Keep the posting receipt — it proves your filing date.",
  "file.markFiled": "I have filed this",
  "file.filedTitle": "Record your filing",
  "file.filedHelp": "This starts your statutory deadline. Enter the date you actually filed.",
  "file.filedDate": "Date filed",
  "file.regNumber": "Registration number",
  "file.regNumberHelp":
    "The number the portal gave you, or your registered-post tracking number. This is your only proof of filing — keep it.",
  "file.viaApio": "I filed through an Assistant Public Information Officer (APIO)",
  "file.viaApioHelp": "Adds 5 days to the deadline under the proviso to Section 5(2).",
  "file.confirm": "Start the deadline clock",

  "track.title": "Tracking your application",
  "track.filedOn": "Filed on",
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
  "track.overdueTitle": "The deadline has passed",
  "track.overdueBody":
    "No reply within the statutory period is a deemed refusal under Section 7(2). You can file a First Appeal now, free of charge. We have drafted it below.",
  "track.appealTitle": "Your First Appeal",
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

  "list.title": "My applications",
  "list.empty": "You have not started an application yet.",
  "list.emptyCta": "Start your first application",
  "list.stored": "Stored in this browser only. Clearing your browser data will remove them.",

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

  "footer.independent": "An independent project. Not a government website.",
  "footer.notGov":
    "RTI Copilot is not affiliated with, endorsed by, or operated by the Government of India or any State Government. It does not file applications on your behalf and cannot submit anything to rtionline.gov.in. It prepares a document that you review, sign, and file yourself.",
  "footer.notLegal":
    "This is a drafting aid, not legal advice. Read every draft before you file it — you are responsible for what it says. Nothing here guarantees that an authority will reply.",
  "footer.howLink": "How this works, and what is mocked",
  "footer.portalLink": "Official RTI Online portal",
  "footer.actLink": "The RTI Act, 2005",

  "error.title": "We could not continue",
} as const;

export type StringKey = keyof typeof en;

const hi: Record<StringKey, string> = {
  "brand.name": "आरटीआई कोपायलट",
  "brand.tagline": "सरल भाषा में लिखें, वैध आरटीआई आवेदन पाएँ",

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
  "nav.new": "नया आवेदन",
  "nav.mine": "मेरे आवेदन",
  "nav.how": "यह कैसे काम करता है",
  "nav.language": "भाषा",
  "nav.menu": "मेन्यू",
  "nav.skip": "मुख्य सामग्री पर जाएँ",

  "common.back": "पीछे",
  "common.continue": "आगे बढ़ें",
  "common.cancel": "रद्द करें",
  "common.delete": "हटाएँ",
  "common.copy": "कॉपी करें",
  "common.copied": "कॉपी हो गया",
  "common.print": "प्रिंट करें या पीडीएफ बनाएँ",
  "common.tryAgain": "फिर कोशिश करें",
  "common.optional": "वैकल्पिक",
  "common.required": "आवश्यक",
  "common.loading": "काम चल रहा है…",
  "common.step": "चरण",
  "common.of": "में से",
  "common.close": "बंद करें",
  "common.edit": "बदलें",
  "common.done": "पूर्ण",

  "home.hero.title": "आपको यह जानने की ज़रूरत नहीं होनी चाहिए कि किस विभाग से पूछना है।",
  "home.hero.body":
    "जो हुआ उसे अपने शब्दों में लिखिए। हम वह कार्यालय ढूँढ़ते हैं जिसके पास रिकॉर्ड है, आपकी शिकायत को ऐसे अनुरोध में बदलते हैं जिसका उत्तर देना कानूनन आवश्यक है, और 30 दिन की समय-सीमा पर नज़र रखते हैं।",
  "home.hero.start": "मेरा आवेदन शुरू करें",
  "home.hero.demo": "एक उदाहरण पर चलकर देखें",
  "home.hero.note":
    "निःशुल्क। खाता बनाने की ज़रूरत नहीं। जब तक आप न कहें, आपका लिखा हुआ ब्राउज़र से बाहर नहीं जाता।",

  "home.problem.title": "पहला आरटीआई आवेदन अक्सर क्यों विफल होता है",
  "home.problem.1.title": "विभाग का नाम पहले से पता होना ज़रूरी है",
  "home.problem.1.body":
    "सरकारी पोर्टल पहले मंत्रालय, फिर विभाग, फिर लोक प्राधिकरण पूछता है। गलत चुनने पर आवेदन धारा 6(3) के तहत स्थानांतरित होता है और आपकी 30 दिन की अवधि फिर से शुरू हो जाती है।",
  "home.problem.2.title": "“क्यों” पूछने पर मना किया जा सकता है",
  "home.problem.2.body":
    "अधिनियम आपको अभिलेख देता है, स्पष्टीकरण नहीं। “मेरी पेंशन क्यों रोकी गई?” को कानूनन अस्वीकार किया जा सकता है। “पेंशन रोकने का आदेश और फाइल नोटिंग” को नहीं।",
  "home.problem.3.title": "समय बीत जाने की सूचना कोई नहीं देता",
  "home.problem.3.body":
    "30 दिन में उत्तर न आए तो अपील के लिए 30 दिन और मिलते हैं। यह चूक गए तो सब फिर से शुरू। कोई याद नहीं दिलाता।",

  "home.solution.title": "हम इसके बदले क्या करते हैं",
  "home.solution.1": "आप सरल भाषा में एक अनुच्छेद लिखते हैं।",
  "home.solution.2":
    "हम उसे उस लोक प्राधिकरण से मिलाते हैं जिसके पास अभिलेख हैं, और बताते हैं कि हम कितने आश्वस्त हैं।",
  "home.solution.3": "हम उसे माँगे जाने वाले दस्तावेज़ों की क्रमांकित सूची में बदलते हैं।",
  "home.solution.4": "हम बताते हैं कि इसे वास्तव में कौन सा पोर्टल स्वीकार करेगा और कितना शुल्क लगेगा।",
  "home.solution.5": "हम समय-सीमा पर नज़र रखते हैं और अवधि बीतते ही आपकी अपील का मसौदा तैयार कर देते हैं।",

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
  "draft.portalLabel": "पोर्टल के लिए तैयार पाठ",
  "draft.portalHelp":
    "इसे पोर्टल के अनुरोध बॉक्स में चिपकाएँ। यह पोर्टल की 3,000 अक्षरों की सीमा के भीतर रखा गया है।",
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
  "file.copyText": "आवेदन का पाठ कॉपी करें",
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
