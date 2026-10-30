/* =====================================================================
   BARNUM / ADHD STUDY — all texts and settings
   Edit wording here; the study logic lives in app.js.
   Text in [square brackets] is a placeholder to fill in before launch.
   ===================================================================== */

window.STUDY = {

  /* ---------- settings ---------- */
  settings: {
    // "manual"  -> participant/researcher picks the condition on the instruction page (pilot)
    // "random"  -> condition assigned at random (50/50)
    // The URL parameter ?cond=self or ?cond=neutral always overrides this.
    conditionMode: "manual",

    minReadingSeconds: 40,      // article: "Next" is enabled only after this time AND scrolling to the end
    autoAdvanceMs: 350,         // CSS-12: delay before moving to the next item after an answer

    // "crop"    -> the YouTube videos are vertical recordings uploaded as 16:9 (with side stripes):
    //              show only the central part, filling the whole phone screen
    // "contain"  -> show the whole YouTube frame (black bars above/below)
    youtubeFit: "crop",

    // Each video is either { youtube: "VIDEO_ID" } (embedded YouTube player)
    // or a path to an own .mp4 file, e.g. "media/self1.mp4" (fully preloaded before play).
    videos: {
      self:    { v1: "media/self1.mp4",    v2: "media/self2.mp4" },
      neutral: { v1: "media/neutral1.mp4", v2: "media/neutral2.mp4" }
      // YouTube versions (not used): self1 hhLIEpmyS28, self2 ysQmtyF7nVw, neutral1 usnwD11TUJs, neutral2 Dtxlf9Pl_0o
    }
  },

  /* ---------- 1. informed consent (DRAFT — check against the ethics-committee template) ---------- */
  consent: {
    title: "Information for participants and informed consent",
    html: `
      <p class="lead">You are invited to take part in a study on how people perceive short popular-science materials about ADHD in adults.</p>

      <h3>Who is conducting the study?</h3>
      <p>The study is conducted by dr Maciej Kościelniak, Institute of Psychology, Faculty of Psychology and Law, SWPS University (Poznań, Poland).</p>

      <h3>What will I be asked to do?</h3>
      <p>You will watch two short videos and read one short article about ADHD in adults. After each of them you will answer a brief question, and at the end you will complete a few short questionnaires about how you feel and about your online habits. The study takes about <strong>[10] minutes</strong>. You will need sound (speakers or headphones).</p>
      <p>Some details of the study’s aims will be explained at the end. Knowing them in advance could influence your answers.</p>

      <h3>Who can take part?</h3>
      <p>Adults aged 18 or over.</p>

      <h3>Is participation voluntary?</h3>
      <p>Yes. You can stop at any time, without giving a reason and without any consequences, simply by closing this browser window. Responses from unfinished sessions will not be analysed.</p>

      <h3>Are there any risks or benefits?</h3>
      <p>The risks are minimal and do not exceed those of everyday life. The materials describe difficulties commonly associated with ADHD, and some people may find themselves reflecting on their own concentration or organisation. The materials are not a diagnostic tool. There are no direct benefits for you, but your participation will help us understand how people respond to health information in the media.</p>

      <h3>How will my data be used?</h3>
      <p>We do not ask for your name, e-mail address or any other information that could identify you. Your responses are stored together with your Prolific ID only, which is needed to process your participation and any request to withdraw your data; the Prolific ID will be removed from the dataset before it is analysed or shared. Your responses will be used for scientific purposes only. Results will be reported in aggregated form, and the anonymised dataset may be made available in an open-science repository (e.g., OSF).</p>

      <h3>Ethical approval and contact</h3>
      <p>The study has been approved by the Research Ethics Committee of the Faculty of Psychology and Law, SWPS University in Poznań (decision no. <strong>[____]</strong>). If you have any questions, please contact dr Maciej Kościelniak: <a href="mailto:mkoscielniak@swps.edu.pl">mkoscielniak@swps.edu.pl</a>.</p>
    `,
    checkbox: "I have read the information above, I am at least 18 years old, and I voluntarily agree to take part in this study."
  },

  /* ---------- 2. instruction ---------- */
  instruction: {
    title: "Instructions",
    html: `
      <p class="lead">In this study you will watch <strong>two short videos</strong> (podcast excerpts) about ADHD in adults and read <strong>one short article</strong> on the same topic.</p>
      <ol class="sequence">
        <li><span>Video 1</span></li>
        <li><span>Short article</span></li>
        <li><span>Video 2</span></li>
      </ol>
      <p>After each of them you will be asked one short question. At the end, there will be a few brief questionnaires.</p>
      <ul class="checklist">
        <li>Please turn on the sound or use headphones.</li>
        <li>Each video plays once, from beginning to end. It cannot be paused or skipped, so please watch it carefully.</li>
        <li>Please complete the study in one sitting, in a quiet place.</li>
      </ul>
    `
  },

  /* ---------- 3a. screen before the article (shown for `seconds`, then moves on automatically) ---------- */
  articleIntro: {
    title: "Next: a short article",
    seconds: 10,
    // {seconds} is replaced with settings.minReadingSeconds
    html: `
      <p class="lead">On the next screen you will see a short article on a tablet.</p>
      <p>Please read it <strong>carefully</strong>, from beginning to end. You will be able to continue after <strong>{seconds} seconds</strong> – the “Next” button shows how much time is left.</p>
    `
  },

  /* ---------- 3. article texts ---------- */
  article: {
    title: "An ordinary week",
    kicker: "Health · Psychology",
    // Each array element = one paragraph. Wording identical to the approved stimuli.
    self: [
      "Think about an ordinary week in your life. You start the day with a clear plan, but by noon you have jumped between several tasks and finished none of them. Starting a boring or complex task is hard, so it waits until the deadline is close and then gets done in a last-minute rush. Time is slippery: “five minutes” turns into forty, and you are often late even when you meant to be early.",
      "You keep a calendar, yet appointments and bills still get forgotten. Instructions you heard a moment ago are gone before you can use them. Restlessness has not disappeared; it has moved inside. You can sit through a meeting, but your foot taps, your hands fidget and your thoughts race ahead. Queues and slow conversations feel almost unbearable. Sometimes you speak before thinking, finish other people’s sentences or interrupt without meaning to. You may buy things on impulse or agree to new plans before checking whether there is time.",
      "None of this is laziness or a lack of willpower. Researchers link many of these difficulties to executive functions – the mental skills for planning, organising, holding instructions in mind and stopping an impulse in time. Have you recognised your own week in this description?"
    ],
    neutral: [
      "Think about an ordinary week in the life of an adult with ADHD. They start the day with a clear plan, but by noon they have jumped between several tasks and finished none of them. Starting a boring or complex task is hard, so it waits until the deadline is close and then gets done in a last-minute rush. Time is slippery: “five minutes” turns into forty, and they are often late even when they meant to be early.",
      "They keep a calendar, yet appointments and bills still get forgotten. Instructions they heard a moment ago are gone before they can use them. Restlessness has not disappeared; it has moved inside. They can sit through a meeting, but their foot taps, their hands fidget and their thoughts race ahead. Queues and slow conversations feel almost unbearable. Sometimes they speak before thinking, finish other people’s sentences or interrupt without meaning to. They may buy things on impulse or agree to new plans before checking whether there is time.",
      "None of this is laziness or a lack of willpower. Researchers link many of these difficulties to executive functions – the mental skills for planning, organising, holding instructions in mind and stopping an impulse in time. This is how such a week often looks in adult ADHD."
    ]
  },

  /* ---------- 4. self-identification question (after each material) ---------- */
  selfId: {
    question: {
      video: "How many of the symptoms described in the video do you recognise in yourself?",
      article: "How many of the symptoms described in the article do you recognise in yourself?"
    },
    options: [
      { value: 1, label: "None of them" },
      { value: 2, label: "Very few of them" },
      { value: 3, label: "Some of them" },
      { value: 4, label: "Many of them" },
      { value: 5, label: "Almost all of them" }
    ]
  },

  /* ---------- 5. ADHD-related symptoms in general (slider 0–100, random order) ---------- */
  adhd: {
    title: "How do you usually feel?",
    intro: `
      <p class="lead">Below are statements about how people may feel or behave.</p>
      <p>For each one, use the slider to show how much it applies to you <strong>in general</strong> – how you usually feel and behave in your everyday life. There are no right or wrong answers.</p>
    `,
    prompt: "How much does this apply to you in general?",
    left: "Not at all",
    right: "Very much",
    items: [
      { id: "adhd1", text: "I find it hard to concentrate." },
      { id: "adhd2", text: "I feel easily distracted." },
      { id: "adhd3", text: "My mind feels disorganised and forgetful." },
      { id: "adhd4", text: "I feel tension in my body." },
      { id: "adhd5", text: "I feel an inner need for immediate movement." },
      { id: "adhd6", text: "I feel impatient and find it hard to wait." },
      { id: "adhd7", text: "I feel an urge to do things right away, without thinking them through." }
    ]
  },

  /* ---------- 6. CSS-12 (McElroy et al., 2019), random order ---------- */
  css12: {
    title: "Online health information",
    intro: `
      <p class="lead">Please read the following statements and indicate how they typically apply to you by selecting the appropriate answer.</p>
      <p>Please note that this questionnaire relates to perceived medical conditions (i.e. conditions you think you might have) rather than conditions that have been diagnosed by a medical profession.</p>
    `,
    scale: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Always" }
    ],
    items: [
      { id: "css1",  text: "If I notice an unexplained bodily sensation I will search for it on the internet" },
      { id: "css2",  text: "Researching symptoms or perceived medical conditions online distracts me from reading news/sports/entertainment articles online" },
      { id: "css3",  text: "I read different web pages about the same perceived condition" },
      { id: "css4",  text: "I start to panic when I read online that a symptom I have is found in a rare/serious condition" },
      { id: "css5",  text: "Researching symptoms or perceived medical conditions online leads me to consult with my GP" },
      { id: "css6",  text: "I enter the same symptoms into a web search on more than one occasion" },
      { id: "css7",  text: "Researching symptoms or perceived medical conditions online interrupts my work (e.g. writing emails, working on word documents or spreadsheets)" },
      { id: "css8",  text: "I think I am fine until I read about a serious condition online" },
      { id: "css9",  text: "I feel more anxious or distressed after researching symptoms or perceived medical conditions online" },
      { id: "css10", text: "Researching symptoms or perceived medical conditions online interrupts my offline social activities (e.g. reduces time spent with friends/family)" },
      { id: "css11", text: "I suggest to my GP/medical professional that I may need a diagnostic procedure that I read about online (e.g. a biopsy/ a specific blood test)" },
      { id: "css12", text: "Researching symptoms or perceived medical conditions online leads me to consult with other medical specialists (e.g. consultants)" }
    ]
  },

  /* ---------- 7. suspicion probe ---------- */
  suspicion: {
    title: "One last question",
    question: "What do you think this study was about? Please describe in a sentence or two what you think its aim was.",
    note: "Optional – if nothing comes to mind, just leave the field empty and click “Next”.",
    placeholder: "Type your answer here…"
  },

  /* ---------- 8. debriefing (DRAFT) ---------- */
  debrief: {
    title: "Thank you! What this study was really about",
    html: `
      <p class="lead">Thank you for taking part. Here is what we did not tell you at the beginning.</p>

      <h3>The aim of the study</h3>
      <p>We are examining whether the <strong>way health information is phrased</strong> affects how much people recognise symptoms in themselves. Participants see one of two versions of the materials. In one version, the videos and the article speak to you directly (“you start the day with a clear plan…”, “Have you recognised your own week?”). In the other version, the very same content describes “an adult with ADHD”.</p>
      <p>Short health videos on social media often use this direct, personal style. Descriptions that are general enough to fit almost anyone tend to feel personally accurate – a phenomenon known as the <strong>Barnum (or Forer) effect</strong>. We want to find out whether this can lead people to see symptoms in themselves and to feel that they might have a condition. We did not tell you this at the start because knowing it could have changed your answers.</p>

      <h3>Important</h3>
      <p>The difficulties described in the materials – getting distracted, putting things off, forgetting, feeling restless or impatient – are <strong>very common</strong>. Almost everyone experiences them from time to time, especially when tired, stressed or busy. <strong>Recognising yourself in such descriptions does not mean that you have ADHD.</strong></p>
      <p>ADHD can be diagnosed only by a qualified professional (a psychiatrist or a clinical psychologist) after a thorough assessment, which takes into account, among other things, whether the difficulties have been present since childhood and how much they affect many areas of life. If this study has left you with any concerns, please talk to your GP or a mental-health professional rather than relying on online materials.</p>

      <h3>Please keep it to yourself</h3>
      <p>Please do not share the details of this study with people who might take part in it – this would affect the results.</p>

      <h3>Withdrawing your data</h3>
      <p>Now that you know the real aim of the study, you may decide that you do not want your responses to be used. If so, please send a message to the researcher through <strong>Prolific’s messaging system</strong> and ask for your data to be deleted. Your responses are linked only to your Prolific ID, so we will be able to find and delete them.</p>

      <h3>Contact</h3>
      <p>If you have any questions or comments, please contact the researcher, dr Maciej Kościelniak, through Prolific’s messaging system or by e-mail: <a href="mailto:mkoscielniak@swps.edu.pl">mkoscielniak@swps.edu.pl</a>.</p>
    `,
    finishButton: "Finish"
  },

  thankYou: {
    title: "Thank you!",
    html: `<p class="lead">Your participation is complete. You can now close this window.</p>`
  }
};
