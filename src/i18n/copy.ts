// Real English + Hindi copy pulled directly from the production Next.js app
// (D:\clearcutoff-projects\clearcut-master) — next-intl `messages/{en,hi}.json`
// for shared chrome (nav/footer/common), and each section component's own
// `Record<Locale, ...>` CONTENT object for everything else. Nothing here is
// machine-translated; see PROJECT_PLAN.md for the source-file mapping.
//
// A few real components (the auth modal / login screen, the mobile floating
// CTA button) have NO Hindi translation in the real source at all — verified
// by reading them directly, not an oversight here. Those strings are defined
// once (not per-locale) in landing.astro/htet.astro and stay English on both
// locale variants, matching real production behavior.

export type Locale = "en" | "hi";

export function resolveLocale(pathname: string): Locale {
	return pathname.includes("/hi/") || pathname.endsWith("/hi") ? "hi" : "en";
}

// ---- Shared chrome (messages/en.json, messages/hi.json) ----
export const chrome = {
	en: {
		continueFree: "Continue Free Prep",
		startFree: "Start for free",
		navPricing: "Pricing",
		navFeatures: "Features",
		navFaqs: "FAQs",
		footerPhone: "Phone",
		footerWhatsapp: "WhatsApp",
		footerPolicy: "Policy",
		footerTerms: "Terms & Conditions",
		footerRefund: "Refund",
		footerContact: "Contact",
		footerRights: "© 2026 Clear Cutoff. All rights reserved!",
	},
	hi: {
		continueFree: "फ्री तैयारी जारी रखें",
		startFree: "फ्री में शुरू करें",
		navPricing: "प्राइसिंग",
		navFeatures: "फीचर्स",
		navFaqs: "सामान्य प्रश्न",
		footerPhone: "फ़ोन",
		footerWhatsapp: "व्हाट्सऐप",
		footerPolicy: "नीति",
		footerTerms: "नियम और शर्तें",
		footerRefund: "रिफंड",
		footerContact: "संपर्क",
		footerRights: "© 2026 Clear Cutoff. सभी अधिकार सुरक्षित!",
	},
};

// ---- Guarantee badge (shared/GuaranteeBadge.tsx) ----
export const guaranteeBadge = {
	en: {
		title: 'Get a <span class="text-brand">refund</span> if you don\'t pass the exam!',
		subtitle: "No risk, just results.",
	},
	hi: {
		title: 'परीक्षा पास न होने पर <span class="text-brand">रिफंड</span> पाएं!',
		subtitle: "कोई जोखिम नहीं, सिर्फ परिणाम।",
	},
};

// ---- Pricing checklist points (shared between landing.astro's 3 cards and
// htet.astro's single card — SinglePricingSection.tsx / PricingSection.tsx) ----
export function pricingPoints(locale: Locale, examName: string) {
	if (locale === "hi") {
		return [
			{ title: "सभी विषय शामिल", desc: `एक ही जगह पर ${examName} के सभी विषय पढ़ें।` },
			{
				title: "असीमित अभ्यास टेस्ट",
				desc: "मिनी टेस्ट, सेक्शनल टेस्ट और PYQs से प्रैक्टिस करें - अपने नंबर बढ़ाएं।",
			},
			{
				title: "अपना प्लान चुनें",
				desc: "6 या 15 महीने के लिए अनलिमिटेड एक्सेस। अपनी गति से पढ़ें, चाहे परीक्षा कब भी हो।",
			},
			{
				title: "भुगतान से पहले 3 दिन मुफ्त ट्रायल",
				desc: `${examName} की तैयारी बिना पैसे दिए शुरू करें।`,
			},
		];
	}
	return [
		{ title: "All subjects included", desc: `Study all ${examName} subjects in one place.` },
		{
			title: "Unlimited practice tests",
			desc: "Practise with mini tests, sectional tests and PYQs — and boost your score.",
		},
		{
			title: "Choose your plan",
			desc: "Unlimited access for 6 or 15 months. Study at your own pace, whenever your exam is.",
		},
		{
			title: "3-day free trial before paying",
			desc: `Start preparing for ${examName} without paying anything.`,
		},
	];
}

// ---- Trusted-by / logo-carousel heading (sections/carousal/CourseLogoCarousalData.tsx) ----
export function trustedByHeading(locale: Locale, examLabel: string) {
	return locale === "hi"
		? `भारत भर में कई ${examLabel} परीक्षाएं पास करने के लिए <span class="text-brand">10,000+</span> विद्यार्थियों का भरोसा`
		: `Trusted by <span class="text-brand">10,000+</span> students to pass ${examLabel} exams across India`;
}

// ---- /go/landing — full homepage (LandingPage.tsx's section list) ----
export const landing = {
	en: {
		metaTitle: "Clear Cutoff — Crack HTET, CTET, UPTET & More",
		metaDescription:
			"Prepare for HTET, CTET, REET and other TET exams with PYQ-based mock tests, sectional tests, full-length papers, notes and video lessons — all in one place.",
		hero: {
			heading: 'Crack the <span class="text-brand">HTET</span> exam with PYQ-based tests, notes and videos',
			subtitle: "Real exam-level questions, sectional tests and full-length papers — all in one place.",
			trial: "3-day free trial",
			noCard: "No card or payment required",
			ratingCaption: "Average rating given by our students",
		},
		trustedByExamLabel: "TET",
		exploreOtherExams:
			'Preparing for other exams? Explore all of Clear Cutoff\'s <span class="text-brand font-semibold">Teaching Exams</span>!',
		seeAllCourses: "See all courses and test series!",
		features: {
			eyebrow: "Exam prep anytime, anywhere",
			heading: '<span class="text-brand">Everything you need</span> to pass the exam',
			description: "Videos, notes and tests for every subject to prepare, practise and succeed — all in one place",
			items: [
				{
					icon: "cloud",
					title: "Practise with PYQs, notes and videos",
					desc: "Solve PYQs as per the new syllabus, make notes on important topics, and watch videos for tough subjects.",
				},
				{
					icon: "flag",
					title: "Your favourite YouTube teachers",
					desc: "Learn easily in Hindi or English from your favourite, trusted teachers.",
				},
				{
					icon: "clock",
					title: "Try it for free",
					desc: "Use all features free during the trial. Watch videos, take tests, then decide whether to continue.",
				},
			],
		},
		howItWorks: {
			eyebrow: "How it works",
			heading: '3 easy steps to crack the Teaching <span class="text-brand">Exam</span>',
			description: "Follow these 3 simple steps to succeed in your exam",
			steps: [
				{
					id: "step-1",
					number: 1,
					title: "Start free on Clear Cutoff",
					subtitle: "Create your free account and get started!",
					desc: "Register with your mobile number in seconds and get instant access to all study material and tests.",
					btn: "Get started",
					image: "howitwork1.webp",
				},
				{
					id: "step-2",
					number: 2,
					title: "Learn with videos, notes and mini tests",
					subtitle: "Prepare with videos, notes and mini tests!",
					desc: "Strengthen every subject topic-by-topic with video lectures, revision notes and mini tests.",
					btn: "Start learning",
					image: "howitwork2.webp",
				},
				{
					id: "step-3",
					number: 3,
					title: "PYQ-based test series",
					subtitle: "Practise with sectional and full-length tests!",
					desc: "Build your confidence by solving PYQ-based sectional and full-length papers in Hindi and English.",
					btn: "Take a test",
					image: "howitwork3.webp",
				},
			],
		},
		comparison: {
			eyebrow: "Clear Cutoff vs coaching centres",
			heading: '<span class="text-brand">All</span> subjects, <span class="text-brand">unlimited</span> practice!',
			description: "Save money, study anytime and prepare fully without going to coaching!",
			colComparison: "Comparison",
			colCoaching: "Coaching centre",
			note: "Comparison based on common coaching-centre practices",
			rows: [
				{ label: "Affordable fee", labelIcon: true, coaching: "Fees ₹20,000+ (per course)", app: "<b>₹99</b> (full access)" },
				{
					label: "All subjects included",
					labelIcon: true,
					coaching: "Limited subject options",
					app: "<b>All subjects</b> in one place",
				},
				{
					label: "Unlimited practice tests",
					labelIcon: true,
					coaching: "Limited tests; mostly in class",
					app: "Mini tests + <b>sectional tests</b> + PYQs",
				},
				{
					label: "Refund guarantee",
					labelIcon: false,
					coaching: "No refund policy",
					app: "<b>Full refund</b> if you don't pass after completing the course",
				},
				{
					label: "Exam-ready",
					labelIcon: false,
					coaching: "Mostly theory; more focus on teaching",
					app: "Focus on PYQs and the <b>exam pattern</b>",
				},
				{
					label: "Subscription period",
					labelIcon: false,
					coaching: "Only for the course duration",
					app: "<b>1 year</b> of full access",
				},
				{
					label: "Extra charges?",
					labelIcon: false,
					coaching: "Pay separately for notes and study material",
					app: "<b>Free notes</b> and study material!",
				},
			],
		},
		pricing: {
			eyebrow: "Simple. Transparent. Affordable.",
			heading: '<span class="text-brand">One</span> price, <span class="text-brand">everything</span> included!',
			description: "Pay once. 6 months of access. Everything you need to pass on the first attempt.",
			priceSubscription: "6-month subscription",
			startForFree: "Start for FREE",
			studentsHeadline: '<span class="text-brand">10,000+</span> students used this to pass the TET exam.',
			studentsSubtext:
				"Join thousands of successful TET aspirants who chose smart, affordable prep over expensive coaching!",
			ratingSuffix: "average rating from our students!",
		},
		faq: {
			eyebrow: "Got a question? We've got the answer!",
			heading: 'Frequently asked <span class="text-brand">questions</span>',
			description: "Everything worth knowing before you start preparing with Clear Cutoff.",
			introTitle: "Can you actually pass the exam with Clear Cutoff?",
			introIntro: "Yes — if you practise, revise and prepare for the exam the smart way.",
			introBullets: [
				'Practise high-quality <b class="text-text-normal">Previous Year Questions (PYQs)</b> and exam-level questions',
				'Strengthen your concepts through <b class="text-text-normal">tests and analysis</b>',
				'Identify <b class="text-text-normal">your weak areas</b> with chapter-wise, sectional and full-length tests',
			],
			introFooter: "👉 You can start for free and decide for yourself (no payment required).",
			filters: [
				{ key: "refund", label: "Refund guarantee" },
				{ key: "general", label: "General" },
				{ key: "courses", label: "Courses & tests" },
				{ key: "payments", label: "Payments" },
			],
			items: {
				refund: [
					{
						q: "How does the refund guarantee work?",
						a: "We trust our platform, so we offer a <b>refund guarantee</b> if you don't pass the exam! To get a refund:<br/>1. <b>Complete the course</b> (all videos and mini tests)<br/>2. <b>Take all the tests</b> (mini, sectional and full-length)<br/>3. <b>Show your official result</b> (if you don't pass)<br/>If you put in the full effort and still don't pass, we'll refund your entire fee!",
					},
					{
						q: "Why is completing the course necessary for a refund?",
						a: "Dedication is essential for success! We want students to <b>honestly follow the entire preparation process</b>. If you complete the course, your chances of passing are very high. And if you still don't pass, we keep our promise — your money is refunded.",
					},
					{
						q: "What if I don't complete the course and still fail?",
						a: "The refund only applies to students <b>who complete the course.</b> If you don't complete it, you won't be eligible for a refund.",
					},
					{
						q: "Are there any hidden charges for the refund guarantee?",
						a: "<b>No hidden charges</b>! If you meet all the conditions, we refund your amount.",
					},
					{
						q: "How will I get my refund if I don't pass?",
						a: "Once you submit your official <b>admit card PDF</b> and <b>exam result</b>, the refund is sent to your original payment method <b>within 24 hours</b>.",
					},
				],
				general: [
					{
						q: "What is Clear Cutoff and how will it help me pass Teaching Exams?",
						a: "Clear Cutoff is a <b>smart exam preparation platform</b> built specifically for Teaching Exams. We provide:<br/>1. <b>Previous Year Questions (PYQs)</b> with solutions.<br/>2. <b>Detailed video lectures</b> from multiple teachers.<br/>3. <b>Revision notes</b> for quick revision.<br/>4. <b>Sectional and full-length tests</b> to track progress.<br/>5. A <b>refund guarantee</b> if you still don't pass after completing the course!",
					},
					{
						q: "Why choose Clear Cutoff when other platforms exist?",
						a: "We focus purely on exam-oriented learning:<br/>1. A <b>structured plan</b> with revision cycles<br/>2. A choice of <b>multiple teachers</b><br/>3. <b>Mini tests and full-length tests</b> (including all PYQs)<br/>4. A realistic <b>exam experience</b> with our test series<br/>5. A <b>refund guarantee</b> if you followed the course and still didn't pass!",
					},
					{
						q: "Who can Clear Cutoff's courses help?",
						a: "Clear Cutoff is perfect for:<br/>1. <b>First-time teaching-exam candidates</b>.<br/>2. <b>Repeat candidates</b> who want complete preparation.<br/>3. Students who prefer a structured, <b>exam-focused approach</b>.",
					},
					{
						q: "Is the content available in both Hindi and English?",
						a: "Yes! All our PYQs, solutions and tests are available in <b>both Hindi and English</b>.",
					},
					{
						q: "Can I access the content anytime?",
						a: "Yes! From the date of purchase right up to <b>exam day</b>, you get <b>full access</b> to all course materials.",
					},
				],
				courses: [
					{
						q: "What's included in the course?",
						a: "The course includes:<br/>1. <b>PYQs</b> with detailed solutions<br/>2. <b>Video lectures</b> (multiple teachers)<br/>3. Typed <b>notes</b> and <b>flash cards</b> for quick revision<br/>4. <b>Sectional tests</b> and <b>mini tests</b><br/>5. A full-length test series matching the exam pattern",
					},
					{
						q: "How are the tests designed?",
						a: "Tests come at three levels:<br/>1. <b>Mini tests</b>: for chapter- and topic-level practice<br/>2. <b>Sectional tests</b>: for strong section-wise preparation<br/>3. <b>Full-length tests</b>: a real exam-like experience",
					},
					{
						q: "Can repeat candidates benefit from Clear Cutoff?",
						a: "Yes! Clear Cutoff suits <b>both first-time and repeat candidates</b>.",
					},
					{
						q: "How are Clear Cutoff's tests better than others?",
						a: "Our tests <b>include all PYQs and are built to match the real exam pattern</b>. The test series gives detailed solutions and feedback so you keep improving.",
					},
					{
						q: "Can I prepare for just one subject or topic?",
						a: "You can study <b>all sections of the paper</b>, or take mini tests and sectional tests for focused practice.",
					},
				],
				payments: [
					{ q: "What does the course cost?", a: "The course costs <b>₹99</b> after discount." },
					{
						q: "Are there any charges beyond the course fee?",
						a: "No, everything is included in the course fee. There are <b>no hidden charges</b>.",
					},
					{
						q: "How can I pay?",
						a: "You can pay online via UPI, debit/credit card, net banking or wallet through a safe and <b>secure payment gateway</b>.",
					},
					{ q: "Is a trial period available?", a: "Yes, you can access a <b>free trial</b> of the course before buying." },
					{
						q: "What if the exam gets postponed?",
						a: "Your course access stays <b>valid until exam day</b>, even if the exam date is pushed back.",
					},
				],
			},
		},
		floatingCta: "Start 3-day FREE trial",
	},
	hi: {
		// Real production <title>/description stay English-only even on the
		// /hi page — confirmed via generateMetadata() in page.tsx, which takes
		// no locale param at all. Not an oversight, matches source exactly.
		metaTitle: "Clear Cutoff — Crack HTET, CTET, UPTET & More",
		metaDescription:
			"Prepare for HTET, CTET, REET and other TET exams with PYQ-based mock tests, sectional tests, full-length papers, notes and video lessons — all in one place.",
		hero: {
			heading: 'PYQ आधारित टेस्ट, नोट्स और वीडियो के साथ <span class="text-brand">HTET</span> परीक्षा पास करें',
			subtitle: "असली परीक्षा स्तर के प्रश्न, सेक्शनल टेस्ट और फुल लेंथ पेपर — सब कुछ एक ही जगह पर।",
			trial: "3 दिन का फ्री ट्रायल",
			noCard: "कोई कार्ड या भुगतान आवश्यक नहीं",
			ratingCaption: "हमारे विद्यार्थियों द्वारा दी गई औसत रेटिंग",
		},
		trustedByExamLabel: "TET",
		exploreOtherExams:
			'क्या आप अन्य परीक्षाओं की तैयारी कर रहे हैं? Clear Cutoff के सभी <span class="text-brand font-semibold">Teaching Exams</span> देखें!',
		seeAllCourses: "सभी कोर्स और टेस्ट सीरीज देखें!",
		features: {
			eyebrow: "कभी भी, कहीं भी परीक्षा की तैयारी",
			heading: 'परीक्षा पास करने के लिए <span class="text-brand">ज़रूरी सब कुछ</span>',
			description: "तैयारी, अभ्यास और सफलता के लिए सभी विषयों के वीडियो, नोट्स और टेस्ट — सब कुछ एक ही जगह",
			items: [
				{
					icon: "cloud",
					title: "PYQ, नोट्स और वीडियो से अभ्यास करें",
					desc: "नए सिलेबस के अनुसार PYQ हल करें, महत्वपूर्ण टॉपिक के नोट्स बनाएं और कठिन विषयों के वीडियो देखें।",
				},
				{
					icon: "flag",
					title: "YouTube के पसंदीदा शिक्षक",
					desc: "अपने पसंदीदा और भरोसेमंद शिक्षकों से हिंदी या अंग्रेजी में आसानी से सीखें।",
				},
				{
					icon: "clock",
					title: "फ्री में आज़माएं",
					desc: "ट्रायल अवधि में सभी फीचर्स मुफ्त उपयोग करें। वीडियो देखें, टेस्ट हल करें और फिर निर्णय लें कि आगे जारी रखना है या नहीं।",
				},
			],
		},
		howItWorks: {
			eyebrow: "यह कैसे काम करता है",
			heading: 'Teaching Exam पास करने के 3 आसान <span class="text-brand">स्टेप्स</span>',
			description: "परीक्षा में सफल होने के लिए इन 3 आसान चरणों का पालन करें",
			steps: [
				{
					id: "step-1",
					number: 1,
					title: "Clear Cutoff पर फ्री शुरुआत करें",
					subtitle: "अपना फ्री अकाउंट बनाएं और शुरू करें!",
					desc: "कुछ ही सेकंड में अपने मोबाइल नंबर से रजिस्टर करें और सभी स्टडी मटेरियल व टेस्ट का तुरंत एक्सेस पाएं।",
					btn: "शुरू करें",
					image: "howitwork1.webp",
				},
				{
					id: "step-2",
					number: 2,
					title: "वीडियो, नोट्स और मिनी टेस्ट से सीखें",
					subtitle: "वीडियो, नोट्स और मिनी टेस्ट के साथ तैयारी करें!",
					desc: "हर विषय को टॉपिक के अनुसार वीडियो लेक्चर, रिवीजन नोट्स और मिनी टेस्ट से मजबूत बनाएं।",
					btn: "सीखना शुरू करें",
					image: "howitwork2.webp",
				},
				{
					id: "step-3",
					number: 3,
					title: "PYQ आधारित टेस्ट सीरीज",
					subtitle: "सेक्शनल और फुल लेंथ टेस्ट से अभ्यास करें!",
					desc: "हिंदी और अंग्रेजी में PYQ आधारित सेक्शनल और फुल लेंथ पेपर हल करके अपना आत्मविश्वास बढ़ाएं।",
					btn: "टेस्ट दें",
					image: "howitwork3.webp",
				},
			],
		},
		comparison: {
			eyebrow: "Clear Cutoff बनाम कोचिंग सेंटर",
			heading: '<span class="text-brand">सभी</span> विषय, <span class="text-brand">अनलिमिटेड</span> अभ्यास!',
			description: "पैसे बचाएं, कभी भी पढ़ें और बिना कोचिंग जाए पूरी तैयारी करें!",
			colComparison: "तुलना",
			colCoaching: "कोचिंग सेंटर",
			note: "तुलना सामान्य कोचिंग सेंटर की प्रथाओं के आधार पर",
			rows: [
				{ label: "किफायती शुल्क", labelIcon: true, coaching: "फीस ₹20,000+ (प्रति कोर्स)", app: "<b>₹99</b> (पूरा एक्सेस)" },
				{
					label: "सभी विषय शामिल",
					labelIcon: true,
					coaching: "सीमित विषय विकल्प",
					app: '<b>सभी विषय</b> एक ही जगह',
				},
				{
					label: "अनलिमिटेड प्रैक्टिस टेस्ट",
					labelIcon: true,
					coaching: "सीमित टेस्ट; ज्यादातर क्लास में",
					app: "मिनी टेस्ट + <b>सेक्शनल टेस्ट</b> + PYQ",
				},
				{
					label: "रिफंड गारंटी",
					labelIcon: false,
					coaching: "कोई रिफंड नीति नहीं",
					app: "<b>पूरा रिफंड</b> यदि कोर्स पूरा करने के बाद भी पास न हों",
				},
				{
					label: "परीक्षा के लिए तैयार",
					labelIcon: false,
					coaching: "अधिकतर थ्योरी; पढ़ाने पर ज्यादा फोकस",
					app: 'PYQ और <b>परीक्षा पैटर्न</b> पर फोकस',
				},
				{
					label: "सदस्यता अवधि",
					labelIcon: false,
					coaching: "केवल कोर्स अवधि तक",
					app: "<b>1 साल</b> का पूरा एक्सेस",
				},
				{
					label: "अतिरिक्त शुल्क?",
					labelIcon: false,
					coaching: "नोट्स और स्टडी मटेरियल के लिए अलग से भुगतान",
					app: "<b>फ्री नोट्स</b> और स्टडी मटेरियल!",
				},
			],
		},
		pricing: {
			eyebrow: "सरल। पारदर्शी। किफायती।",
			heading: '<span class="text-brand">एक</span> कीमत, <span class="text-brand">सब कुछ</span> शामिल!',
			description: "एक बार भुगतान। 6 महीने का एक्सेस। पहली कोशिश में पास होने के लिए ज़रूरी सब कुछ।",
			priceSubscription: "6 महीने का सब्सक्रिप्शन",
			startForFree: "फ्री में शुरू करें",
			studentsHeadline: '<span class="text-brand">10,000+</span> विद्यार्थियों ने TET परीक्षा पास करने के लिए इसका उपयोग किया।',
			studentsSubtext:
				"हजारों सफल TET अभ्यर्थियों से जुड़ें जिन्होंने महंगी कोचिंग के बजाय स्मार्ट और किफायती तैयारी चुनी!",
			ratingSuffix: "हमारे विद्यार्थियों द्वारा औसत रेटिंग!",
		},
		faq: {
			eyebrow: "कोई सवाल है? हमारे पास जवाब है!",
			heading: 'अक्सर पूछे जाने वाले <span class="text-brand">प्रश्न</span>',
			description: "Clear Cutoff के साथ तैयारी शुरू करने से पहले जानने योग्य सभी जरूरी बातें।",
			introTitle: "क्या Clear Cutoff से परीक्षा पास की जा सकती है?",
			introIntro: "हाँ, अगर आप समझदारी से अभ्यास, दोहराव और परीक्षा की सही तैयारी करें।",
			introBullets: [
				'उच्च गुणवत्ता वाले <b class="text-text-normal">पिछले वर्ष के प्रश्न (PYQs)</b> और परीक्षा स्तर के प्रश्नों का अभ्यास करें',
				'<b class="text-text-normal">टेस्ट और विश्लेषण</b> के माध्यम से अपने कॉन्सेप्ट मजबूत करें',
				'अध्यायवार, सेक्शनल और फुल-लेंथ टेस्ट के जरिए <b class="text-text-normal">अपनी कमजोरियाँ पहचानें</b>',
			],
			introFooter: "👉 आप फ्री में शुरुआत कर सकते हैं और खुद तय कर सकते हैं (कोई भुगतान आवश्यक नहीं)।",
			filters: [
				{ key: "refund", label: "रिफंड गारंटी" },
				{ key: "general", label: "सामान्य प्रश्न" },
				{ key: "courses", label: "कोर्स और टेस्ट" },
				{ key: "payments", label: "भुगतान" },
			],
			items: {
				refund: [
					{
						q: "रिफंड गारंटी कैसे काम करती है?",
						a: "हमें अपने प्लेटफॉर्म पर भरोसा है, इसलिए हम <b>रिफंड गारंटी</b> देते हैं अगर आप परीक्षा पास नहीं करते! रिफंड पाने के लिए:<br/>1. <b>कोर्स पूरा करें</b> (सभी वीडियो और मिनी टेस्ट)<br/>2. <b>सभी टेस्ट दें</b> (मिनी, सेक्शनल और फुल-लेंथ)<br/>3. <b>अपना आधिकारिक रिजल्ट दिखाएँ</b> (यदि पास नहीं होते)<br/>यदि आपने पूरी मेहनत की और फिर भी पास नहीं हुए, तो हम आपकी पूरी फीस वापस कर देंगे!",
					},
					{
						q: "रिफंड के लिए कोर्स पूरा करना क्यों ज़रूरी है?",
						a: "सफलता के लिए समर्पण ज़रूरी है! हम चाहते हैं कि छात्र <b>ईमानदारी से पूरी तैयारी प्रक्रिया को फॉलो करें</b>। अगर आप कोर्स पूरा करते हैं, तो पास होने की संभावना बहुत अधिक होती है। फिर भी यदि आप पास नहीं होते, तो हम अपना वादा निभाते हैं — आपका पैसा वापस कर दिया जाएगा।",
					},
					{
						q: "अगर मैं कोर्स पूरा नहीं करता और फिर भी फेल हो जाता हूँ तो क्या होगा?",
						a: "रिफंड केवल उन छात्रों पर लागू होता है <b>जो कोर्स पूरा करते हैं।</b> यदि आप इसे पूरा नहीं करते, तो आप रिफंड के पात्र नहीं होंगे।",
					},
					{
						q: "क्या रिफंड गारंटी के लिए कोई छिपा हुआ शुल्क है?",
						a: "<b>कोई छिपा हुआ शुल्क नहीं</b>! यदि आप सभी शर्तें पूरी करते हैं, तो हम आपकी राशि वापस कर देते हैं।",
					},
					{
						q: "अगर मैं पास नहीं हुआ तो मुझे रिफंड कैसे मिलेगा?",
						a: "जब आप अपना आधिकारिक <b>एडमिट कार्ड PDF</b> और <b>परीक्षा परिणाम</b> जमा करेंगे, तो रिफंड आपकी मूल भुगतान विधि में <b>24 घंटे के अंदर</b> भेज दिया जाएगा।",
					},
				],
				general: [
					{
						q: "Clear Cutoff क्या है और यह मुझे Teaching Exams पास करने में कैसे मदद करेगा?",
						a: "Clear Cutoff एक <b>स्मार्ट परीक्षा तैयारी प्लेटफॉर्म</b> है, जो खास तौर पर Teaching Exams के लिए बनाया गया है। हम प्रदान करते हैं:<br/>1. <b>पिछले वर्षों के प्रश्न (PYQs)</b> हल सहित।<br/>2. अलग-अलग शिक्षकों के <b>विस्तृत वीडियो लेक्चर</b>।<br/>3. जल्दी दोहराने के लिए <b>रिविजन नोट्स</b>।<br/>4. प्रगति जांचने के लिए <b>सेक्शनल और फुल-लेंथ टेस्ट</b>।<br/>5. यदि आप पूरा कोर्स करने के बाद भी पास नहीं होते तो <b>रिफंड गारंटी</b>!",
					},
					{
						q: "Clear Cutoff को क्यों चुनें जब और भी प्लेटफार्म्स मौजूद हैं?",
						a: "हम केवल परीक्षा-केंद्रित पढ़ाई पर ध्यान देते हैं:<br/>1. रिविजन साइकिल के साथ एक <b>स्ट्रक्चर्ड प्लान</b><br/>2. <b>कई टीचर्स</b> का विकल्प<br/>3. <b>मिनी टेस्ट और फुल-लेंथ टेस्ट</b> (सभी PYQs सहित)<br/>4. हमारी टेस्ट सीरीज़ के साथ असली <b>एग्जाम अनुभव</b><br/>5. यदि आपने कोर्स फॉलो किया और फिर भी पास नहीं हुए तो <b>रिफंड गारंटी</b>!",
					},
					{
						q: "Clear Cutoff के कोर्स किसे मदद कर सकते हैं?",
						a: "Clear Cutoff इन छात्रों के लिए परफेक्ट है:<br/>1. <b>पहली बार टीचिंग एग्ज़ाम देने वाले उम्मीदवार</b>।<br/>2. पूरी तैयारी चाहने वाले <b>दोबारा परीक्षा देने वाले उम्मीदवार</b>।<br/>3. वे छात्र जो स्ट्रक्चर्ड और <b>परीक्षा-केंद्रित अप्रोच</b> पसंद करते हैं।",
					},
					{
						q: "क्या कंटेंट हिंदी और अंग्रेज़ी दोनों में उपलब्ध है?",
						a: "हाँ! हमारे सभी PYQs, सॉल्यूशन और टेस्ट <b>हिंदी और अंग्रेज़ी</b> दोनों में उपलब्ध हैं।",
					},
					{
						q: "क्या मैं कंटेंट कभी भी एक्सेस कर सकता हूँ?",
						a: "हाँ! खरीद की तारीख से लेकर <b>एग्ज़ाम के दिन तक</b> आपको सभी कोर्स मटेरियल्स का <b>पूरा एक्सेस</b> मिलता है।",
					},
				],
				courses: [
					{
						q: "कोर्स में क्या-क्या शामिल है?",
						a: "कोर्स में शामिल है:<br/>1. <b>PYQs</b> विस्तृत हल सहित<br/>2. <b>वीडियो लेक्चर</b> (एक से अधिक शिक्षक)<br/>3. जल्दी रिविजन के लिए टाइप किए हुए <b>नोट्स</b> और <b>फ्लैश कार्ड</b><br/>4. <b>सेक्शनल टेस्ट</b> और <b>मिनी टेस्ट</b><br/>5. परीक्षा पैटर्न के अनुसार फुल-लेंथ टेस्ट सीरीज़",
					},
					{
						q: "टेस्ट कैसे डिजाइन किए गए हैं?",
						a: "टेस्ट तीन स्तर पर:<br/>1. <b>मिनी टेस्ट</b>: अध्याय और टॉपिक स्तर की प्रैक्टिस के लिए<br/>2. <b>सेक्शनल टेस्ट</b>: सेक्शन की मजबूत तैयारी के लिए<br/>3. <b>फुल-लेंथ टेस्ट</b>: असली परीक्षा जैसा अनुभव",
					},
					{
						q: "क्या दोबारा परीक्षा देने वाले छात्र Clear Cutoff से लाभ उठा सकते हैं?",
						a: "हाँ! Clear Cutoff <b>पहली बार और दोबारा परीक्षा देने वाले दोनों छात्रों</b> के लिए उपयुक्त है।",
					},
					{
						q: "Clear Cutoff के टेस्ट दूसरों से बेहतर कैसे हैं?",
						a: "हमारे टेस्ट में सभी <b>PYQs शामिल हैं और वे असली परीक्षा पैटर्न के अनुसार बनाए गए हैं</b>। टेस्ट सीरीज़ विस्तृत समाधान और फीडबैक देती है ताकि आप लगातार सुधार कर सकें।",
					},
					{
						q: "क्या मैं केवल किसी एक विषय या टॉपिक की तैयारी कर सकता हूँ?",
						a: "आप पेपर के <b>सभी सेक्शन पढ़ सकते हैं</b>, या फोकस्ड प्रैक्टिस के लिए मिनी टेस्ट और सेक्शनल टेस्ट दे सकते हैं।",
					},
				],
				payments: [
					{ q: "कोर्स की कीमत क्या है?", a: "कोर्स की कीमत छूट के बाद <b>₹99</b> है।" },
					{
						q: "क्या कोर्स फीस के अलावा कोई अतिरिक्त शुल्क है?",
						a: "नहीं, कोर्स फीस में सब कुछ शामिल है। <b>कोई छिपा हुआ शुल्क नहीं</b> है।",
					},
					{
						q: "मैं भुगतान कैसे कर सकता हूँ?",
						a: "आप UPI, डेबिट/क्रेडिट कार्ड, नेट बैंकिंग या वॉलेट के माध्यम से सुरक्षित और <b>सुरक्षित पेमेंट गेटवे</b> से ऑनलाइन भुगतान कर सकते हैं।",
					},
					{ q: "क्या कोई ट्रायल अवधि उपलब्ध है?", a: "हाँ, खरीदने से पहले आप कोर्स का <b>फ्री ट्रायल</b> एक्सेस कर सकते हैं।" },
					{
						q: "अगर परीक्षा स्थगित हो जाती है तो क्या होगा?",
						a: "आपका कोर्स एक्सेस <b>परीक्षा के दिन तक मान्य रहेगा</b>, भले ही परीक्षा की तारीख आगे बढ़ जाए।",
					},
				],
			},
		},
		floatingCta: "Start 3-day FREE trial",
	},
};

// ---- /go/htet — single exam course page (CoursePageHero + SinglePricingSection) ----
export function htetCopy(locale: Locale, examName = "HTET") {
	if (locale === "hi") {
		return {
			metaTitle: "HTET Exam Preparation Online — PYQ Mock Tests, Notes & Videos | Clearcutoff",
			metaDescription:
				"Prepare for HTET (Haryana Teacher Eligibility Test) with PYQ-based mock tests, sectional tests, full-length papers, notes and video lessons — all in one place.",
			heroHeading: `PYQ आधारित टेस्ट, नोट्स और वीडियो के साथ <span class="text-brand">${examName}</span> परीक्षा पास करें`,
			heroSubtitle: "असली परीक्षा स्तर के प्रश्न, सेक्शनल टेस्ट और फुल लेंथ पेपर — सब कुछ एक ही जगह पर।",
			heroFeatures: [
				`${examName} परीक्षा की स्मार्ट तैयारी`,
				"पूरा कोर्स + टेस्ट सीरीज़",
				"रिफंड एश्योरेंस पॉलिसी",
			],
			trial: "3 दिन का फ्री ट्रायल",
			noCard: "कोई कार्ड या भुगतान आवश्यक नहीं",
			ratingCaption: "हमारे विद्यार्थियों द्वारा<br />दी गई औसत रेटिंग",
			continueFreePrep: "फ्री तैयारी जारी रखें »",
			trustedByHeading: trustedByHeading("hi", examName),
			pricingEyebrow: "सरल। पारदर्शी। किफायती।",
			pricingHeading: '<span class="text-brand">एक</span> कीमत, <span class="text-brand">सब कुछ</span> शामिल!',
			pricingDescription: "एक बार भुगतान। 6 महीने का एक्सेस। पहली कोशिश में पास होने के लिए ज़रूरी सब कुछ।",
			priceSubscription: "6 महीने का सब्सक्रिप्शन",
			startForFree: "फ्री में शुरू करें »",
			studentsHeadline: `<span class="text-brand">10,000+</span> विद्यार्थियों ने TET परीक्षा पास करने के लिए इसका उपयोग किया।`,
		};
	}
	return {
		metaTitle: "HTET Exam Preparation Online — PYQ Mock Tests, Notes & Videos | Clearcutoff",
		metaDescription:
			"Prepare for HTET (Haryana Teacher Eligibility Test) with PYQ-based mock tests, sectional tests, full-length papers, notes and video lessons — all in one place.",
		heroHeading: `Crack the <span class="text-brand">${examName}</span> exam with PYQ-based tests, notes and videos`,
		heroSubtitle: "Real exam-level questions, sectional tests and full-length papers — all in one place.",
		heroFeatures: [`Smart prep for the ${examName} exam`, "Full course + test series", "Refund assurance policy"],
		trial: "3-day free trial",
		noCard: "No card or payment required",
		ratingCaption: "Average rating given<br />by our students",
		continueFreePrep: "Continue Free Prep »",
		trustedByHeading: trustedByHeading("en", examName),
		pricingEyebrow: "Simple. Transparent. Affordable.",
		pricingHeading: '<span class="text-brand">One</span> price, <span class="text-brand">everything</span> included!',
		pricingDescription: "Pay once. 6 months of access. Everything you need to pass on the first attempt.",
		priceSubscription: "6-month subscription",
		startForFree: "Start for free »",
		studentsHeadline: `<span class="text-brand">10,000+</span> students used this to pass the TET exam.`,
	};
}
