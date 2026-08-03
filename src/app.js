const CONFIG = {
  currency: "USD",
};

const PUBLIC_CONFIG = window.SOW_YOUR_SEED_CONFIG || {};
const STORAGE_KEY = "sow-your-seed:v1";
const ADMIN_SESSION_KEY = "sow-your-seed:admin-session";
const DONOR_TOKEN_KEY = "sow-your-seed:donor-token";
const VISITOR_KEY_KEY = "sow-your-seed:visitor-key";
const ADMIN_PASSWORD = "sowseed";
const PAYMENT_ANIMATION_MS = 220;
const SEED_DOLLAR_VALUE = 7;
const TOP_BRAND_TITLE = "Christ Paradise Garden💫✨🌱";
const GOLDEN_SEED_AMOUNTS = new Set([111, 333, 777, 999]);
const MAX_LOCAL_POST_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_REMOTE_POST_IMAGE_BYTES = 5 * 1024 * 1024;
const FORTUNE_NUMBER_SPECIAL_CHANCE = 0.01;
const DIGITAL_ORDER_ITEM_NAME = "Personalised Digital Blessing and Sowing Seed";
const LEGACY_FOOTER_TEXT = "Sow Your Seed exists to make support feel generous, clear, and personal.";
const DEFAULT_FOOTER_TEXT =
  "This is a creator tipping platform where supporters can voluntarily tip the creator for their work. Tips are freely given, paid directly to the creator, and are not tied to any indirect exchange, guaranteed result, or required purchase.";
const DONATION_EXPORT_HEADERS = [
  "DateTime (UTC)",
  "From",
  "Item",
  "Received",
  "Given",
  "Currency",
  "TransactionType",
  "TransactionId",
  "Reference",
  "SalesTax",
  "SalesTaxPercentage",
  "SalesTaxIncludesShipping",
  "BuyerCountry",
  "BuyerStateOrProvince",
  "BuyerEmail",
  "PaymentProvider",
];
const DONATION_EXPORT_HEADER_LINE = `DateTime (UTC),${DONATION_EXPORT_HEADERS.slice(1).map(csvQuotedCell).join(",")}`;
const AMOUNT_TIER_DESCRIPTIONS = {
  7: "Receive a Blessing",
  11: "Heaven's Special Blessing",
  33: "Prayer for Your Soulmate",
  77: "Bless Your Soulmate & Your Bond",
  111: "Sacred Blessing for Soulmate & Family",
  333: "Soulmate Divine Guidance & Protection",
  777: "For You & Everyone You Love",
  999: "Ultimate Prayer Offering for Love, Family & Protection",
};
const FORTUNE_MESSAGES = [
  "In Jesus' name, may the love between you and your soulmate grow softer, deeper, and more patient with every day.",
  "May your soulmate feel cherished by you, and may your family feel surrounded by peace, warmth, and protection.",
  "May God bless your relationship with gentle words, honest affection, and a home filled with family laughter.",
  "May you and your soulmate keep choosing each other with tenderness, loyalty, and grace.",
  "In the name of Jesus, may every small misunderstanding between you and your soulmate turn into deeper understanding.",
  "May your home be a soft place for your soulmate, your family, and every heart that needs rest.",
  "May your soulmate feel safe in your love, and may your family feel steady under God's blessing.",
  "May the Lord fill your relationship with romance that stays kind and family bonds that stay strong.",
  "May you and your soulmate protect each other's peace and build a family atmosphere full of affection.",
  "In Jesus' name, may your soulmate's heart be comforted, your heart be understood, and your family be united.",
  "May God bless the conversations between you and your soulmate with patience, softness, and healing.",
  "May your family table be filled with joy, your soulmate's smile, and moments you will remember with gratitude.",
  "May your soulmate feel loved in the ordinary moments, not only the grand ones.",
  "In the name of Jesus, may your relationship be covered with forgiveness, laughter, and faithful devotion.",
  "May God place peace in your home and sweetness in the way you and your soulmate care for one another.",
  "May your soulmate see your effort, feel your love, and respond with tenderness.",
  "May your family be protected from division, and may your soulmate bond be protected from pride.",
  "In Jesus' name, may your love be patient in hard days and joyful in easy days.",
  "May the Lord bless your soulmate with peace and bless you with the wisdom to love them well.",
  "May affection rise in your home today, touching your soulmate, your family, and your own heart.",
  "May you and your soulmate speak kindly, listen closely, and hold each other's dreams with care.",
  "In the name of Jesus, may your family home glow with trust, respect, and steady love.",
  "May God bless your soulmate with strength and bless your family with harmony.",
  "May every hug, prayer, and gentle word between you and your soulmate become a seed of lasting peace.",
  "May your relationship be refreshed with romance, your family refreshed with joy, and your home refreshed with grace.",
  "In Jesus' name, may your soulmate feel honored by your love and your family feel blessed by your unity.",
  "May the Lord help you and your soulmate forgive quickly, love deeply, and protect what you have built.",
  "May your family be a circle of warmth, and may your soulmate always feel welcome inside your heart.",
  "May God turn every tense moment into a chance for you and your soulmate to grow closer.",
  "In the name of Jesus, may your love stay faithful, your home stay peaceful, and your family stay protected.",
  "May your soulmate be blessed by your patience, and may you be blessed by their devotion.",
  "May your family witness more laughter, more hugs, and more gentle healing in your relationship.",
  "May Jesus guide your words so your soulmate feels loved, not judged, and your family feels safe.",
  "May your home be filled with affectionate routines, warm meals, honest talks, and peaceful rest.",
  "In Jesus' name, may every burden carried by your soulmate become lighter through love and prayer.",
  "May God strengthen your family ties and sweeten the bond between you and your soulmate.",
  "May your soulmate look at you and feel thankful for the love you share.",
  "May your relationship be rich in kindness, full of tenderness, and steady through every season.",
  "In the name of Jesus, may your family be guarded from conflict and your soulmate bond guarded from distance.",
  "May the Lord bless your private love with warmth and your family life with peace.",
  "May you and your soulmate keep finding new reasons to smile at each other.",
  "May your family home become a sanctuary of affection, prayer, forgiveness, and calm.",
  "In Jesus' name, may your soulmate's love feel like comfort and your family love feel like shelter.",
  "May God help you notice the little ways your soulmate loves you every day.",
  "May your relationship be filled with gentle touch, grateful hearts, and family blessings.",
  "May the Lord heal old hurts in your home and make room for softer love between you and your soulmate.",
  "In the name of Jesus, may your soulmate feel respected, treasured, and emotionally safe with you.",
  "May your family be blessed with unity and your relationship blessed with renewed affection.",
  "May God protect the joy between you and your soulmate from stress, fear, and bitterness.",
  "May your home echo with laughter, your relationship with loyalty, and your family with peace.",
  "In Jesus' name, may your soulmate feel chosen by you again and again.",
  "May the Lord bless your love with patience in waiting, grace in speaking, and peace in returning to each other.",
  "May your family feel the beauty of two hearts loving each other with maturity and faith.",
  "May your soulmate be encouraged today by your kindness, your presence, and your prayers.",
  "In the name of Jesus, may your relationship stay rooted in compassion and your family stay rooted in love.",
  "May God fill your home with warm affection and fill your soulmate's heart with assurance.",
  "May every meal, message, and shared silence between you and your soulmate carry peace.",
  "May your family be blessed by the love you and your soulmate continue to build.",
  "In Jesus' name, may your soulmate feel understood even before everything is explained.",
  "May the Lord bless your relationship with emotional safety and your family with lasting joy.",
  "May you and your soulmate grow in patience, playful affection, and holy friendship.",
  "May your home become a place where love is spoken clearly and forgiveness comes quickly.",
  "In the name of Jesus, may your soulmate's heart be protected and your family be covered with grace.",
  "May God bless your relationship with deeper romance and your family with sweeter togetherness.",
  "May your soulmate feel your love in your words, your actions, and your quiet loyalty.",
  "May your family be strengthened by peace, and may your relationship be strengthened by tenderness.",
  "In Jesus' name, may every hard conversation end with more understanding between you and your soulmate.",
  "May the Lord bless your home with calm mornings, affectionate evenings, and family gratitude.",
  "May your soulmate feel supported in their dreams and cherished in their vulnerable moments.",
  "May God keep your relationship free from coldness and fill it with warmth, care, and devotion.",
  "In the name of Jesus, may your family be restored where it is tired and joyful where it is strong.",
  "May you and your soulmate love each other in ways that heal, not harm.",
  "May your home be blessed with soft voices, kind apologies, and steady affection.",
  "May the Lord remind you and your soulmate that love is renewed through small faithful choices.",
  "In Jesus' name, may your family be wrapped in unity and your relationship wrapped in peace.",
  "May God bless your soulmate with joy and bless you with a heart that keeps loving wisely.",
  "May your relationship grow more romantic, more honest, and more peaceful with time.",
  "May your family feel the comfort of God's presence in every room of your home.",
  "In the name of Jesus, may your soulmate feel celebrated, valued, and never alone beside you.",
  "May the Lord bless your love with trust that deepens and affection that does not grow tired.",
  "May your home be filled with family memories that feel tender, sacred, and full of light.",
  "May you and your soulmate protect each other from harsh words and choose gentleness instead.",
  "In Jesus' name, may your family line be blessed through the love, peace, and faith in your home.",
  "May God bring sweetness back into any place where your relationship has felt heavy.",
  "May your soulmate feel loved through your patience, your loyalty, and your willingness to grow.",
  "May your family be blessed with laughter that returns easily and peace that settles deeply.",
  "In the name of Jesus, may your home carry the fragrance of affection, gratitude, and prayer.",
  "May the Lord strengthen the promise between you and your soulmate and bless everyone connected to your family.",
  "May your relationship be a refuge where both hearts can rest, heal, and be known.",
  "May God bless your family with unity and bless your soulmate bond with gentle passion.",
  "In Jesus' name, may love keep blooming in your home, even in the places that once felt dry.",
  "May your soulmate feel the blessing of being loved by you, and may you feel the blessing of being loved by them.",
  "May your family be protected from resentment and filled with compassion, patience, and joy.",
  "May the Lord bless your relationship with peaceful nights, hopeful mornings, and faithful hearts.",
  "In the name of Jesus, may every seed of kindness between you and your soulmate become a harvest of love.",
  "May God help you and your soulmate keep romance alive through care, respect, and thoughtful affection.",
  "May your home become brighter because love is practiced there every day.",
  "May your family be surrounded by grace, and may your soulmate bond be surrounded by trust.",
  "In Jesus' name, may your soulmate and family feel deeply loved, divinely protected, and beautifully blessed today.",
  "In the mighty name of Jesus Christ, may your soulmate, family, home, and shared future overflow with faithful love, divine peace, and lasting joy. Amen.",
];

const DEFAULT_SETTINGS = {
  profileTitle: "Sow Your Seed Here for Your Soulmate 💫",
  followersText: "167 Followers",
  seedGoal: 700,
  startingSeeds: 0,
  meterCurrentAmount: 0,
  seedPrice: 7,
  amountOptions: [7, 11, 33, 77, 111, 333, 777, 999],
  meterHeadline:
    "༺💗༻ Click the Donate button to sow your seed now. With every seed you sow, you whisper to the universe: “Bring my soulmate to me.” 🌱💫🌹",
  meterCollapsed:
    "Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. This is your sacred step toward the soulmate your heart whispers for....",
  meterExpanded:
    "Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. This is your sacred step toward the soulmate your heart whispers for.\n\nEvery seed you sow is a seed of intention. 🌱 1 seed ($7) – I'm ready. 🌱🌱🌱 3 seeds ($21) – Mind, body, soulmate aligned. 🌱🌱🌱🌱🌱🌱🌱 7 seeds ($49) – Protection over reunion. 🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱 11 seeds ($77) – Eternal love. ༺💗༻ Click Donate to sow your seed now. Whisper to the universe: “Bring my soulmate to me.” The field is open. 🌱💫🌹",
  aboutTitle: "About",
  aboutCollapsed:
    "🌱✨ Sow a Seed for the Soulmate You’ve Been Waiting For ✨🌱\nTired of waiting for that special someone to...",
  aboutExpanded:
    "🌱✨ Sow a Seed for the Soulmate You’ve Been Waiting For ✨🌱\n\nTired of waiting for that special someone to appear? Every seed you sow is a loving step toward calling in your soulmate. I channel warm, heartfelt soulmate messages, signs, and gentle guidance just for you.\n\nYour donation isn’t just support, it’s an act of faith, intention, and hope. Sow your seed and let love meet you where you are.",
  topicLabel: "Spirituality",
  supportTitle:
    "Buy a Seed to Sow for the Love You’ve Been Waiting For in 💕Christ Pradise garden💫",
  postAuthorName: "Sow Your Seed Here for Your Soulmate 💫",
  postTitle: "༺💗༻ A Divine Invitation: Sow Your Seed Here for Your Soulmate 🌱💫🌹",
  postBody:
    "Each seed is a small act of trust, a prayerful step toward the love your heart has been waiting for.",
  paymentCopy:
    "You're paying Sow Your Seed Here for Your Soulmate 💫 directly through international PayPal/card checkout. Tips are voluntary and freely given.",
  paymentNote:
    "By proceeding with your payment, you acknowledge that you are paying Sow Your Seed Here for Your Soulmate 💫 directly. Tips are voluntary support and are not tied to any guaranteed result.",
  footerText: DEFAULT_FOOTER_TEXT,
  fortuneNumberEnabled: false,
};

const seedFeed = [
  {
    name: "Ingrid Schneider",
    amount: 150,
    frequency: "monthly",
    message: "Thank you for creating work that keeps pointing people back to hope.",
    createdAt: "2026-07-26T11:30:00.000Z",
  },
  {
    name: "April Semper",
    amount: 85,
    frequency: "once",
    message: "Keep going. This ministry matters.",
    createdAt: "2026-07-25T16:15:00.000Z",
  },
  {
    name: "Donna Bakst",
    amount: 60,
    frequency: "once",
    message: "Sowing with gratitude.",
    createdAt: "2026-07-24T14:05:00.000Z",
  },
  {
    name: "Evelyn Abello",
    amount: 45,
    frequency: "once",
    message: "May this seed multiply.",
    createdAt: "2026-07-23T09:40:00.000Z",
  },
];

const defaultPosts = [
  {
    id: "post-default-1",
    title: DEFAULT_SETTINGS.postTitle,
    description: DEFAULT_SETTINGS.postBody,
    imageUrl: "assets/sow-cover.png",
    createdAt: "2026-07-27T12:00:00.000Z",
  },
];

const state = loadState();

const elements = {
  aboutCollapsed: document.querySelector("#aboutCollapsed"),
  aboutExpanded: document.querySelector("#aboutExpanded"),
  aboutTitle: document.querySelector("#aboutTitle"),
  adminActionStatus: document.querySelector("#adminActionStatus"),
  adminAnalyticsUpdated: document.querySelector("#adminAnalyticsUpdated"),
  adminBackdrop: document.querySelector("#adminBackdrop"),
  adminCalendarDetails: document.querySelector("#adminCalendarDetails"),
  adminCalendarGrid: document.querySelector("#adminCalendarGrid"),
  adminCalendarNext: document.querySelector("#adminCalendarNext"),
  adminCalendarPrev: document.querySelector("#adminCalendarPrev"),
  adminCalendarSummary: document.querySelector("#adminCalendarSummary"),
  adminCalendarTitle: document.querySelector("#adminCalendarTitle"),
  adminCheckoutClicks24h: document.querySelector("#adminCheckoutClicks24h"),
  adminEmailInput: document.querySelector("#adminEmailInput"),
  adminExportCsvButton: document.querySelector("#adminExportCsvButton"),
  adminExportEndDate: document.querySelector("#adminExportEndDate"),
  adminExportStartDate: document.querySelector("#adminExportStartDate"),
  adminForm: document.querySelector("#adminForm"),
  adminLoginDialog: document.querySelector("#adminLoginDialog"),
  adminLoginForm: document.querySelector("#adminLoginForm"),
  adminMenuButton: document.querySelector("#adminMenuButton"),
  adminNewPostDescription: document.querySelector("#adminNewPostDescription"),
  adminNewPostImage: document.querySelector("#adminNewPostImage"),
  adminNewPostTitle: document.querySelector("#adminNewPostTitle"),
  adminPanel: document.querySelector("#adminPanel"),
  adminPageViews24h: document.querySelector("#adminPageViews24h"),
  adminPasswordError: document.querySelector("#adminPasswordError"),
  adminPasswordInput: document.querySelector("#adminPasswordInput"),
  adminPaymentsCompleted24h: document.querySelector("#adminPaymentsCompleted24h"),
  adminPaypalStarts24h: document.querySelector("#adminPaypalStarts24h"),
  adminPostList: document.querySelector("#adminPostList"),
  adminPublishPostButton: document.querySelector("#adminPublishPostButton"),
  resetAdminAnalyticsButton: document.querySelector("#resetAdminAnalyticsButton"),
  adminUploadFileName: document.querySelector("#adminUploadFileName"),
  adminUploadPreview: document.querySelector("#adminUploadPreview"),
  adminUploadPreviewImage: document.querySelector("#adminUploadPreviewImage"),
  adminUniqueVisitors24h: document.querySelector("#adminUniqueVisitors24h"),
  amountError: document.querySelector("#amountError"),
  amountGrid: document.querySelector("#amountGrid"),
  amountInput: document.querySelector("#amountInput"),
  backPaymentButton: document.querySelector("#backPaymentButton"),
  brandTitle: document.querySelector("#brandTitle"),
  cardButton: document.querySelector("#cardButton"),
  cardButtonContainer: document.querySelector("#cardButtonContainer"),
  cancelAdminLoginButton: document.querySelector("#cancelAdminLoginButton"),
  checkoutButton: document.querySelector("#checkoutButton"),
  checkoutLabel: document.querySelector("#checkoutLabel"),
  closeAdminButton: document.querySelector("#closeAdminButton"),
  closeReceiptButton: document.querySelector("#closeReceiptButton"),
  copyReceiptButton: document.querySelector("#copyReceiptButton"),
  decreaseQuantityButton: document.querySelector("#decreaseQuantityButton"),
  doneButton: document.querySelector("#doneButton"),
  feedList: document.querySelector("#feedList"),
  followButton: document.querySelector("#followButton"),
  followersText: document.querySelector("#followersText"),
  footerText: document.querySelector("#footerText"),
  closeFortuneNumberButton: document.querySelector("#closeFortuneNumberButton"),
  fortuneNumberCopy: document.querySelector("#fortuneNumberCopy"),
  fortuneNumberDialog: document.querySelector("#fortuneNumberDialog"),
  fortuneNumberDoneButton: document.querySelector("#fortuneNumberDoneButton"),
  fortuneNumberResult: document.querySelector("#fortuneNumberResult"),
  fortuneNumberTitle: document.querySelector("#fortuneNumberTitle"),
  fortuneSeedButton: document.querySelector("#fortuneSeedButton"),
  galleryGrid: document.querySelector("#galleryGrid"),
  increaseQuantityButton: document.querySelector("#increaseQuantityButton"),
  messageInput: document.querySelector("#messageInput"),
  meterCollapsed: document.querySelector("#meterCollapsed"),
  meterExpanded: document.querySelector("#meterExpanded"),
  meterHeadline: document.querySelector("#meterHeadline"),
  meterShareButton: document.querySelector("#meterShareButton"),
  nameError: document.querySelector("#nameError"),
  nameInput: document.querySelector("#nameInput"),
  paymentCopy: document.querySelector("#paymentCopy"),
  paymentDialog: document.querySelector("#paymentDialog"),
  paymentEmailInput: document.querySelector("#paymentEmailInput"),
  paymentNote: document.querySelector("#paymentNote"),
  paymentStatus: document.querySelector("#paymentStatus"),
  paypalButton: document.querySelector("#paypalButton"),
  paypalButtonContainer: document.querySelector("#paypalButtonContainer"),
  postAuthorName: document.querySelector("#postAuthorName"),
  postsPageList: document.querySelector("#postsPageList"),
  profileTitle: document.querySelector("#profileTitle"),
  profileTabs: document.querySelectorAll("[data-section-tab]"),
  progressFill: document.querySelector("#progressFill"),
  progressPercent: document.querySelector("#progressPercent"),
  recentDonationList: document.querySelector("#recentDonationList"),
  refreshAdminButton: document.querySelector("#refreshAdminButton"),
  quantityValue: document.querySelector("#quantityValue"),
  receiptDialog: document.querySelector("#receiptDialog"),
  receiptSummary: document.querySelector("#receiptSummary"),
  receiptTitle: document.querySelector("#receiptTitle"),
  resetAdminButton: document.querySelector("#resetAdminButton"),
  saveAdminButton: document.querySelector("#saveAdminButton"),
  seedCommentsList: document.querySelector("#seedCommentsList"),
  seedPriceLabel: document.querySelector("#seedPriceLabel"),
  sectionViews: document.querySelectorAll("[data-section-view]"),
  showMoreButtons: document.querySelectorAll("[data-toggle-target]"),
  sidebarPostList: document.querySelector("#sidebarPostList"),
  supportForm: document.querySelector("#supportForm"),
  supportTitle: document.querySelector("#supportTitle"),
  toast: document.querySelector("#toast"),
  topSupporters: document.querySelector("#topSupporters"),
  topicPill: document.querySelector("#topicPill"),
  adminInputs: {
    aboutCollapsed: document.querySelector("#adminAboutCollapsed"),
    aboutExpanded: document.querySelector("#adminAboutExpanded"),
    aboutTitle: document.querySelector("#adminAboutTitle"),
    amountOptions: document.querySelector("#adminAmountOptions"),
    followersText: document.querySelector("#adminFollowersText"),
    footerText: document.querySelector("#adminFooterText"),
    fortuneNumberEnabled: document.querySelector("#adminFortuneNumberEnabled"),
    meterCollapsed: document.querySelector("#adminMeterCollapsed"),
    meterExpanded: document.querySelector("#adminMeterExpanded"),
    meterHeadline: document.querySelector("#adminMeterHeadline"),
    paymentCopy: document.querySelector("#adminPaymentCopy"),
    paymentNote: document.querySelector("#adminPaymentNote"),
    postAuthorName: document.querySelector("#adminPostAuthorName"),
    profileTitle: document.querySelector("#adminProfileTitle"),
    seedGoal: document.querySelector("#adminSeedGoal"),
    seedPrice: document.querySelector("#adminSeedPrice"),
    meterCurrentAmount: document.querySelector("#adminMeterCurrentAmount"),
    supportTitle: document.querySelector("#adminSupportTitle"),
    topicLabel: document.querySelector("#adminTopicLabel"),
  },
};

let currentFrequency = "once";
let currentReceiptText = "";
let backendReady = false;
const paypalSdkPromises = new Map();
let paypalSdkKey = "";
let paymentConfig = {
  paypalClientId: PUBLIC_CONFIG.paypalClientId || "",
  currency: PUBLIC_CONFIG.paypalCurrency || CONFIG.currency,
  env: "sandbox",
};
let paymentCloseTimer = 0;
let pendingDonation = null;
let quantity = 1;
const initialAdminCalendarDate = getLatestDonationDateKey();
let adminCalendarCursor = fromDateKey(initialAdminCalendarDate);
let selectedAdminCalendarDate = initialAdminCalendarDate;
function cloneDefaultSettings() {
  return {
    ...DEFAULT_SETTINGS,
    amountOptions: [...DEFAULT_SETTINGS.amountOptions],
  };
}

function cloneDefaultPosts() {
  return defaultPosts.map((post) => ({
    ...post,
    comments: Array.isArray(post.comments) ? post.comments.map((comment) => ({ ...comment })) : [],
  }));
}

function parseAmountOptions(value) {
  const rawOptions = Array.isArray(value) ? value : String(value || "").split(",");
  const options = rawOptions
    .map((item) => Number.parseInt(item, 10))
    .filter((amount) => Number.isFinite(amount) && amount > 0);

  return options.length ? [...new Set(options)].slice(0, 8) : [...DEFAULT_SETTINGS.amountOptions];
}

function normalizeSettings(settings) {
  const defaults = cloneDefaultSettings();
  const next = {
    ...defaults,
    ...(settings && typeof settings === "object" ? settings : {}),
  };

  next.seedGoal = Math.max(Number.parseInt(next.seedGoal, 10) || defaults.seedGoal, 1);
  next.startingSeeds = Math.max(Number.parseInt(next.startingSeeds, 10) || 0, 0);
  next.meterCurrentAmount = Math.max(Number.parseFloat(next.meterCurrentAmount ?? next.startingSeeds) || 0, 0);
  next.meterCurrentAmount = getCurrentGoalCycleAmount(next.meterCurrentAmount, next.seedGoal);
  next.startingSeeds = 0;
  next.seedPrice = Math.max(Number.parseInt(next.seedPrice, 10) || defaults.seedPrice, 1);
  next.amountOptions = parseAmountOptions(next.amountOptions);
  next.fortuneNumberEnabled = next.fortuneNumberEnabled === true || next.fortuneNumberEnabled === "true";

  Object.keys(defaults).forEach((key) => {
    if (key === "amountOptions" || typeof defaults[key] !== "string") return;
    next[key] = String(next[key] || defaults[key]).trim() || defaults[key];
  });

  if (next.footerText === LEGACY_FOOTER_TEXT) {
    next.footerText = defaults.footerText;
  }

  return next;
}

function toSafeIsoDate(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeComments(comments) {
  return Array.isArray(comments)
    ? comments
        .map((comment, index) => {
          const text = String(comment?.text || comment?.body || "").trim();
          const name = String(comment?.name || "Supporter").trim().slice(0, 48) || "Supporter";

          if (!text) return null;

          return {
            id: String(comment?.id || `comment-${Date.now()}-${index}`),
            name,
            text: text.slice(0, 180),
            createdAt: toSafeIsoDate(comment?.createdAt),
          };
        })
        .filter(Boolean)
    : [];
}

function normalizeSeedComments(comments) {
  return Array.isArray(comments)
    ? comments
        .map((comment, index) => {
          const text = String(comment?.text || comment?.body || "").trim();
          const name = String(comment?.name || comment?.display_name || "Supporter").trim().slice(0, 80) || "Supporter";
          const createdAt = toSafeIsoDate(comment?.createdAt || comment?.created_at);

          if (!text) return null;

          return {
            id: String(comment?.id || `seed-comment-${Date.now()}-${index}`),
            name,
            text: text.slice(0, 280),
            amount: comment?.amount === null || comment?.amount === undefined ? null : Number(comment.amount),
            seedCount:
              comment?.seedCount === null || comment?.seedCount === undefined
                ? null
                : Math.max(Number.parseInt(comment.seedCount, 10) || 0, 0),
            source: comment?.source === "payment" ? "payment" : "legacy",
            createdAt,
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    : [];
}

function normalizePosts(posts) {
  const normalized = Array.isArray(posts)
    ? posts
        .map((post, index) => {
          const title = String(post?.title || "").trim();
          const description = String(post?.description || post?.body || "").trim();
          const imageUrl = String(post?.imageUrl || post?.image || "").trim();
          const createdAt = toSafeIsoDate(post?.createdAt);
          const liked = Boolean(post?.liked);
          const likes = Math.max(Number.parseInt(post?.likes, 10) || 0, liked ? 1 : 0);

          if (!title && !description) return null;

          return {
            id: String(post?.id || `post-${Date.now()}-${index}`),
            title: title || "Untitled post",
            description,
            imageUrl: imageUrl || "assets/sow-cover.png",
            createdAt,
            likes,
            liked,
            comments: normalizeComments(post?.comments),
          };
        })
        .filter(Boolean)
    : [];

  return normalized.length ? normalized : cloneDefaultPosts();
}

function createEmptyAnalytics() {
  return {
    checkoutButtonClicksLast24h: 0,
    completedPaymentsLast24h: 0,
    generatedAt: null,
    pageViewsLast24h: 0,
    paypalCheckoutStartsLast24h: 0,
    resetAt: null,
    topPaths: [],
    uniqueVisitorsLast24h: 0,
  };
}

function normalizeAnalytics(analytics) {
  const defaults = createEmptyAnalytics();
  const topPaths = Array.isArray(analytics?.topPaths)
    ? analytics.topPaths
        .map((item) => ({
          path: String(item?.path || "/").slice(0, 180),
          views: Math.max(Number.parseInt(item?.views, 10) || 0, 0),
        }))
        .filter((item) => item.path)
    : [];

  return {
    checkoutButtonClicksLast24h: Math.max(Number.parseInt(analytics?.checkoutButtonClicksLast24h, 10) || 0, 0),
    completedPaymentsLast24h: Math.max(Number.parseInt(analytics?.completedPaymentsLast24h, 10) || 0, 0),
    generatedAt: analytics?.generatedAt || defaults.generatedAt,
    pageViewsLast24h: Math.max(Number.parseInt(analytics?.pageViewsLast24h, 10) || 0, 0),
    paypalCheckoutStartsLast24h: Math.max(Number.parseInt(analytics?.paypalCheckoutStartsLast24h, 10) || 0, 0),
    resetAt: analytics?.resetAt || defaults.resetAt,
    topPaths,
    uniqueVisitorsLast24h: Math.max(Number.parseInt(analytics?.uniqueVisitorsLast24h, 10) || 0, 0),
  };
}

function loadState() {
  if (isBackendConfigured()) {
    return {
      analytics: createEmptyAnalytics(),
      donations: [],
      followed: false,
      posts: [],
      seedComments: [],
      settings: {
        ...cloneDefaultSettings(),
        startingSeeds: 0,
      },
      totals: { donationSeeds: 0, donationAmount: 0 },
    };
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {
      analytics: createEmptyAnalytics(),
      donations: seedFeed,
      followed: false,
      posts: cloneDefaultPosts(),
      seedComments: [],
      settings: cloneDefaultSettings(),
      totals: { donationSeeds: null, donationAmount: null },
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      analytics: normalizeAnalytics(parsed.analytics),
      donations: Array.isArray(parsed.donations) ? parsed.donations : seedFeed,
      followed: Boolean(parsed.followed),
      posts: normalizePosts(parsed.posts),
      seedComments: normalizeSeedComments(parsed.seedComments),
      settings: normalizeSettings(parsed.settings),
      totals: normalizeTotals(parsed.totals),
    };
  } catch {
    return {
      analytics: createEmptyAnalytics(),
      donations: seedFeed,
      followed: false,
      posts: cloneDefaultPosts(),
      seedComments: [],
      settings: cloneDefaultSettings(),
      totals: { donationSeeds: null, donationAmount: null },
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeTotals(totals) {
  const donationSeeds = Number.parseInt(totals?.donationSeeds, 10);
  const donationAmount = Number.parseFloat(totals?.donationAmount);

  return {
    donationSeeds: Number.isFinite(donationSeeds) && donationSeeds >= 0 ? donationSeeds : null,
    donationAmount: Number.isFinite(donationAmount) && donationAmount >= 0 ? donationAmount : null,
  };
}

function isBackendConfigured() {
  return Boolean(PUBLIC_CONFIG.backendEnabled && PUBLIC_CONFIG.supabaseUrl && PUBLIC_CONFIG.supabaseAnonKey);
}

function getVisitorKey() {
  let key = localStorage.getItem(VISITOR_KEY_KEY);
  if (!key) {
    key = crypto.randomUUID ? crypto.randomUUID() : `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(VISITOR_KEY_KEY, key);
  }
  return key;
}

function getDonorToken() {
  return localStorage.getItem(DONOR_TOKEN_KEY) || "";
}

function setDonorToken(token) {
  if (token) {
    localStorage.setItem(DONOR_TOKEN_KEY, token);
  }
}

function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function setAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

function getAdminAccessToken() {
  const session = getAdminSession();
  return session?.access_token || "";
}

function edgeUrl(functionName) {
  return `${PUBLIC_CONFIG.supabaseUrl.replace(/\/$/, "")}/functions/v1/${functionName}`;
}

async function callEdge(functionName, options = {}) {
  if (!isBackendConfigured()) {
    throw new Error("Backend is not configured. Fill src/config.js first.");
  }

  const headers = {
    apikey: PUBLIC_CONFIG.supabaseAnonKey,
    Authorization: options.admin ? `Bearer ${getAdminAccessToken()}` : `Bearer ${PUBLIC_CONFIG.supabaseAnonKey}`,
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  const response = await fetch(edgeUrl(functionName), {
    method: options.method || "POST",
    headers,
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function trackCheckoutEvent(eventName, donation = pendingDonation) {
  if (!isBackendConfigured() || !donation) return null;

  try {
    return await callEdge("track-checkout-event", {
      body: {
        amount: donation.amount || getAmount(),
        eventName,
        path: window.location.pathname || "/",
        visitorKey: getVisitorKey(),
      },
    });
  } catch (error) {
    console.warn("Checkout analytics event was not recorded.", error);
    return null;
  }
}

async function signInAdmin(email, password) {
  const response = await fetch(`${PUBLIC_CONFIG.supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: PUBLIC_CONFIG.supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || "Could not sign in.");
  }

  setAdminSession(payload);
  return payload;
}

async function loadAdminProfile() {
  const payload = await callEdge("admin-profile", {
    admin: true,
    method: "GET",
  });

  return payload.profile || null;
}

function applyBootstrap(payload) {
  if (!payload) return;

  state.settings = normalizeSettings(payload.settings);
  state.donations = Array.isArray(payload.donations) ? payload.donations : [];
  state.seedComments = normalizeSeedComments(payload.seedComments);
  state.posts = normalizePosts(payload.posts);
  state.totals = normalizeTotals(payload.totals);
  paymentConfig = {
    paypalClientId: payload.payment?.paypalClientId || PUBLIC_CONFIG.paypalClientId || "",
    currency: payload.payment?.currency || PUBLIC_CONFIG.paypalCurrency || CONFIG.currency,
    env: payload.payment?.env || "sandbox",
  };
  backendReady = true;
}

async function loadBackendData(options = {}) {
  if (!isBackendConfigured()) return;

  try {
    const params = new URLSearchParams({
      path: window.location.pathname || "/",
      visitorKey: getVisitorKey(),
    });
    const payload = await callEdge(`public-bootstrap?${params.toString()}`, { method: "GET" });
    applyBootstrap(payload);
  } catch (error) {
    backendReady = false;
    if (options.throwOnError) {
      throw error;
    }
    showToast(error.message || "Backend data could not load.");
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForInitialAssets() {
  const imagePromises = Array.from(document.querySelectorAll(".brand-avatar, .cover-image, .profile-photo")).map(
    (image) => {
      if (image.complete) return Promise.resolve();

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    },
  );
  const fontPromise = document.fonts?.ready?.catch?.(() => undefined) || Promise.resolve();

  return Promise.race([Promise.all([...imagePromises, fontPromise]), wait(1800)]);
}

function finishInitialLoading() {
  document.body.classList.remove("app-loading");
  document.body.classList.add("app-ready");

  const loader = document.querySelector("#appLoader");
  if (loader) {
    window.setTimeout(() => {
      loader.hidden = true;
    }, 260);
  }
}

function getInitialDonationAmount() {
  return Math.max(Number(state.settings.seedPrice) || SEED_DOLLAR_VALUE, 1);
}

async function initializeApp() {
  try {
    await loadBackendData();
    setAmount(getInitialDonationAmount());
    renderApp();
    setActiveView(getViewIdFromHash());
    await waitForInitialAssets();
  } finally {
    finishInitialLoading();

    if (window.location.hash === "#admin") {
      openAdminLogin();
    }
  }
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    notation: Number(value) >= 10000 ? "compact" : "standard",
  }).format(Math.max(Number(value) || 0, 0));
}

function getAmount() {
  return Number.parseFloat(elements.amountInput.value) || 0;
}

function getSeedCountFromAmount(amount) {
  const numericAmount = Math.max(Number(amount) || 0, 0);

  if (!numericAmount) return 0;

  return Math.max(1, Math.round(numericAmount / SEED_DOLLAR_VALUE));
}

function getSeedUnitsFromAmount(amount, seedPrice) {
  const numericAmount = Math.max(Number(amount) || 0, 0);
  const numericSeedPrice = Math.max(Number(seedPrice) || SEED_DOLLAR_VALUE, 1);

  return numericAmount / numericSeedPrice;
}

function formatSeedUnits(value) {
  const roundedValue = Math.max(Math.round(Number(value) || 0), 0);

  return `${roundedValue} Seed${roundedValue === 1 ? "" : "s"}`;
}

function randomIntegerInRange(min, max) {
  const floorMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - floorMin + 1)) + floorMin;
}

function getFortuneSeedNumber() {
  if (Math.random() < FORTUNE_NUMBER_SPECIAL_CHANCE) {
    return {
      isSpecial: true,
      seedCount: 25,
      title: "You have a fortune of great",
      message: "Sow Your Seed My Child. 25 Seeds.",
    };
  }

  const roll = Math.random();

  if (roll < 0.7) {
    return {
      isSpecial: false,
      seedCount: randomIntegerInRange(0, 3),
    };
  }

  if (roll < 0.9) {
    return {
      isSpecial: false,
      seedCount: randomIntegerInRange(3, 15),
    };
  }

  return {
    isSpecial: false,
    seedCount: randomIntegerInRange(15, 19),
  };
}

function getCurrentGoalCycleAmount(totalAmount, goalAmount) {
  const numericTotal = Math.max(Number(totalAmount) || 0, 0);
  const numericGoal = Math.max(Number(goalAmount) || 0, 0);

  if (!numericGoal) return 0;

  return numericTotal % numericGoal;
}

function getTotals() {
  const seedPrice = Math.max(Number.parseInt(state.settings.seedPrice, 10) || SEED_DOLLAR_VALUE, 1);
  const backendDonationSeeds = state.totals?.donationSeeds;
  const donationSeeds =
    backendReady && Number.isFinite(backendDonationSeeds)
      ? backendDonationSeeds
      : state.donations.reduce((total, donation) => total + getSeedCountFromAmount(donation.amount), 0);
  const backendDonationAmount = state.totals?.donationAmount;
  const donationAmount =
    backendReady && Number.isFinite(backendDonationAmount)
      ? backendDonationAmount
      : backendReady && Number.isFinite(backendDonationSeeds)
        ? backendDonationSeeds * seedPrice
        : state.donations.reduce((total, donation) => total + Math.max(Number(donation.amount) || 0, 0), 0);
  const paidSeedUnits = getSeedUnitsFromAmount(donationAmount, seedPrice);

  return { donationAmount, paidSeedUnits, seeds: donationSeeds };
}

function getSortedPosts() {
  return state.posts
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function relativeTime(dateString) {
  const created = new Date(dateString);
  const diff = Date.now() - created.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function readableDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function readableTime(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function formatCsvDateTime(dateString) {
  const date = new Date(dateString || Date.now());
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return [
    padDatePart(safeDate.getUTCMonth() + 1),
    padDatePart(safeDate.getUTCDate()),
    safeDate.getUTCFullYear(),
  ].join("/") + ` ${padDatePart(safeDate.getUTCHours())}:${padDatePart(safeDate.getUTCMinutes())}`;
}

function formatCsvAmount(value) {
  return (Number.parseFloat(value) || 0).toFixed(2);
}

function csvQuotedCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function getDonationRawRow(donation) {
  const rawPayment = donation?.rawPayment && typeof donation.rawPayment === "object" ? donation.rawPayment : {};
  return rawPayment.row && typeof rawPayment.row === "object" ? rawPayment.row : rawPayment;
}

function getDonationRawValue(donation, key, fallback = "") {
  const rawRow = getDonationRawRow(donation);
  const value = rawRow[key];
  return value === undefined || value === null ? fallback : value;
}

function getPaymentProviderLabel(value) {
  const provider = String(value || "").trim();
  if (!provider) return "PayPal";
  return provider.toLowerCase() === "paypal" ? "PayPal" : provider;
}

function getDonationExportRow(donation) {
  return {
    "DateTime (UTC)": getDonationRawValue(donation, "DateTime (UTC)", formatCsvDateTime(donation.createdAt)),
    From: getDonationRawValue(donation, "From", donation.name || "Supporter"),
    Item: "Tip to Creator",
    Received: getDonationRawValue(donation, "Received", formatCsvAmount(donation.amount)),
    Given: getDonationRawValue(donation, "Given", "0"),
    Currency: getDonationRawValue(donation, "Currency", CONFIG.currency),
    TransactionType: getDonationRawValue(donation, "TransactionType", "Tip"),
    TransactionId: getDonationRawValue(donation, "TransactionId", donation.captureId || donation.id || ""),
    Reference: getDonationRawValue(donation, "Reference", donation.orderId || ""),
    SalesTax: getDonationRawValue(donation, "SalesTax", ""),
    SalesTaxPercentage: getDonationRawValue(donation, "SalesTaxPercentage", ""),
    SalesTaxIncludesShipping: getDonationRawValue(donation, "SalesTaxIncludesShipping", ""),
    BuyerCountry: getDonationRawValue(donation, "BuyerCountry", ""),
    BuyerStateOrProvince: getDonationRawValue(donation, "BuyerStateOrProvince", ""),
    BuyerEmail: getDonationRawValue(donation, "BuyerEmail", donation.payerEmail || ""),
    PaymentProvider: getPaymentProviderLabel(getDonationRawValue(donation, "PaymentProvider", donation.paymentMethod)),
  };
}

function buildDonationCsv(donations) {
  const sortedDonations = donations
    .slice()
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  const rows = sortedDonations.map(getDonationExportRow);
  const lines = [
    DONATION_EXPORT_HEADER_LINE,
    ...rows.map((row) => DONATION_EXPORT_HEADERS.map((header) => csvQuotedCell(row[header])).join(",")),
  ];

  return { csv: `\uFEFF${lines.join("\n")}\n`, rowCount: rows.length };
}

function getAdminExportRange() {
  const startDate = elements.adminExportStartDate?.value || "";
  const endDate = elements.adminExportEndDate?.value || "";

  if (startDate && endDate && startDate > endDate) {
    throw new Error("Choose a start date before the end date.");
  }

  return { startDate, endDate };
}

function getDonationExportQuery({ startDate, endDate }) {
  const params = new URLSearchParams({ export: "csv" });

  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  return `admin-donations?${params.toString()}`;
}

function getDonationExportFilename({ startDate, endDate }) {
  const dateStamp = toDateKey(new Date());
  const rangeLabel = startDate || endDate ? `${startDate || "start"}-to-${endDate || "today"}` : dateStamp;

  return `sow-your-seed-donations-${rangeLabel}.csv`;
}

function downloadTextFile(filename, text, mimeType = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type: mimeType });
  downloadBlobFile(filename, blob);
}

function downloadBlobFile(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportAdminDonationCsv() {
  if (!isBackendConfigured() || !getAdminAccessToken()) {
    setAdminStatus("Sign in as admin before exporting donations.", "error", { persist: true });
    showToast("Sign in as admin before exporting donations.");
    return;
  }

  let range;
  try {
    range = getAdminExportRange();
  } catch (error) {
    setAdminStatus(error.message, "error", { persist: true });
    showToast(error.message);
    return;
  }

  const rangeText =
    range.startDate || range.endDate
      ? ` from ${range.startDate || "the first donation"} to ${range.endDate || "today"}`
      : "";

  await runAdminAction(
    {
      button: elements.adminExportCsvButton,
      busyText: "Exporting...",
      loadingMessage: `Preparing donation CSV export${rangeText}...`,
      successMessage: (result) =>
        `Exported ${result?.rowCount || 0} donation row${result?.rowCount === 1 ? "" : "s"}${rangeText} as CSV.`,
      errorMessage: "Could not export donation CSV.",
    },
    async () => {
      const payload = await callEdge(getDonationExportQuery(range), {
        admin: true,
        method: "GET",
      });
      const donations = Array.isArray(payload.donations) ? payload.donations : [];
      const { csv, rowCount } = buildDonationCsv(donations);

      downloadTextFile(getDonationExportFilename(range), csv);
      return { rowCount };
    },
  );
}

function getDigitalOrder(donation) {
  if (donation?.digitalOrder && typeof donation.digitalOrder === "object") {
    return donation.digitalOrder;
  }

  const rawPayment = donation?.rawPayment && typeof donation.rawPayment === "object" ? donation.rawPayment : {};
  const rawOrder = rawPayment.digitalOrder && typeof rawPayment.digitalOrder === "object" ? rawPayment.digitalOrder : {};

  if (!Object.keys(rawOrder).length) return null;

  return {
    orderNumber: rawOrder.orderNumber,
    itemName: rawOrder.itemName,
    customerName: rawOrder.customerName,
    contactEmail: rawOrder.contactEmail,
    payerEmail: rawOrder.payerEmail,
    paypalOrderId: rawOrder.paypalOrderId,
    paypalCaptureId: rawOrder.paypalCaptureId,
    amount: rawOrder.amount,
    currency: rawOrder.currency,
    personalizedRequest: donation?.message || "",
    blessingMessage: donation?.fortuneMessage || "",
    fulfillmentStatus: rawOrder.fulfillmentStatus,
    fulfillmentNote: rawOrder.fulfillmentNote,
    fulfilledAt: rawOrder.fulfilledAt,
    createdAt: rawOrder.createdAt,
  };
}

function getDigitalOrderValue(donation, key, fallback = "") {
  const order = getDigitalOrder(donation);
  const value = order?.[key];

  return value === undefined || value === null || value === "" ? fallback : value;
}

function getFulfillmentStatusLabel(status) {
  return status === "fulfilled" ? "Fulfilled" : "Paid, awaiting personalized writing";
}

function readableUtcDateTime(dateString) {
  const date = new Date(dateString || Date.now());
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return `${formatCsvDateTime(safeDate.toISOString())} UTC`;
}

function normalizePdfText(value) {
  return String(value ?? "")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function wrapPdfText(value, maxLength = 86) {
  const normalized = normalizePdfText(value);
  const sourceLines = normalized ? normalized.split(/\n+/) : [""];
  const lines = [];

  sourceLines.forEach((sourceLine) => {
    const words = sourceLine.split(/\s+/).filter(Boolean);
    let line = "";

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxLength && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });

    if (line) lines.push(line);
  });

  return lines.length ? lines : [""];
}

function pdfEscape(value) {
  return normalizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildProofPdfLines(donation) {
  const order = getDigitalOrder(donation) || {};
  const rawOrder = getDonationRawRow(donation);
  const orderNumber = getDigitalOrderValue(donation, "orderNumber", getDonationRawValue(donation, "Reference", donation.orderId || donation.id || ""));
  const itemName = getDigitalOrderValue(donation, "itemName", DIGITAL_ORDER_ITEM_NAME);
  const request = getDigitalOrderValue(donation, "personalizedRequest", donation.message || "No personalized request was entered.");
  const blessing = getDigitalOrderValue(donation, "blessingMessage", donation.fortuneMessage || "Blessing message was delivered after confirmed payment.");
  const status = getDigitalOrderValue(donation, "fulfillmentStatus", "paid_awaiting_personalized_writing");
  const fulfilledAt = getDigitalOrderValue(donation, "fulfilledAt", "");
  const fulfillmentNote = getDigitalOrderValue(donation, "fulfillmentNote", "No fulfillment note has been added yet.");
  const contactEmail = getDigitalOrderValue(donation, "contactEmail", "");
  const payerEmail = getDigitalOrderValue(donation, "payerEmail", donation.payerEmail || getDonationRawValue(donation, "BuyerEmail", ""));
  const paypalOrderId = getDigitalOrderValue(donation, "paypalOrderId", donation.orderId || getDonationRawValue(donation, "Reference", ""));
  const paypalCaptureId = getDigitalOrderValue(donation, "paypalCaptureId", donation.captureId || getDonationRawValue(donation, "TransactionId", ""));
  const createdAt = donation.createdAt || order.createdAt || rawOrder["DateTime (UTC)"] || new Date().toISOString();
  const amount = Number(donation.amount || order.amount || 0);
  const currency = order.currency || getDonationRawValue(donation, "Currency", CONFIG.currency);
  const lines = [
    "Sow Your Seed - Digital Service Order Proof",
    "",
    `Generated: ${readableUtcDateTime(new Date().toISOString())}`,
    `Order ID: ${orderNumber || "Not available"}`,
    `Payment date: ${readableUtcDateTime(createdAt)}`,
    `Customer name: ${donation.name || order.customerName || "Supporter"}`,
    `Contact email: ${contactEmail || "Not provided by supporter"}`,
    `Buyer email: ${payerEmail || "Not provided by PayPal"}`,
    `Item: ${itemName}`,
    `Amount received: ${formatCsvAmount(amount)} ${currency}`,
    `Payment provider: ${getPaymentProviderLabel(donation.paymentMethod)}`,
    `PayPal order ID: ${paypalOrderId || "Not available"}`,
    `PayPal transaction/capture ID: ${paypalCaptureId || "Not available"}`,
    `Payment status: ${donation.status || "COMPLETED"}`,
    `Frequency: ${donation.frequency === "monthly" ? "Monthly" : "One time"}`,
    `Fulfillment status: ${getFulfillmentStatusLabel(status)}`,
    `Fulfilled at: ${fulfilledAt ? readableUtcDateTime(fulfilledAt) : "Not marked fulfilled yet"}`,
    "",
    "Personalized-writing request:",
    ...wrapPdfText(request),
    "",
    "Heartfelt blessing delivered after payment:",
    ...wrapPdfText(blessing),
    "",
    "Admin fulfillment note:",
    ...wrapPdfText(fulfillmentNote),
  ];

  return lines.slice(0, 58);
}

function buildSimplePdf(lines) {
  const pageLines = lines.map((line) => pdfEscape(line));
  const content = [
    "BT",
    "/F1 18 Tf",
    "50 760 Td",
    `(${pageLines[0] || "Digital Service Order Proof"}) Tj`,
    "/F1 10.5 Tf",
    "0 -28 Td",
    ...pageLines.slice(1).flatMap((line) => [`(${line}) Tj`, "0 -15 Td"]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function getDonationById(donationId) {
  return state.donations.find((donation) => String(donation.id) === String(donationId)) || null;
}

function getOrderProofFilename(donation) {
  const orderNumber = getDigitalOrderValue(donation, "orderNumber", donation.captureId || donation.id || "transaction");
  const safeOrderNumber = String(orderNumber).replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "") || "transaction";

  return `sow-your-seed-${safeOrderNumber}.pdf`;
}

function downloadOrderProofPdf(donationId) {
  const donation = getDonationById(donationId);
  const statusElement = elements.adminActionStatus;

  if (!donation) {
    setAdminStatus("Could not find that payment in the current calendar data.", "error", { persist: true, statusElement });
    showToast("Payment record not found.");
    return;
  }

  const pdf = buildSimplePdf(buildProofPdfLines(donation));
  downloadBlobFile(getOrderProofFilename(donation), new Blob([pdf], { type: "application/pdf" }));
  setAdminStatus("Downloaded PayPal proof PDF for this digital-service order.", "success", { statusElement });
}

function updateDonationDigitalOrder(donationId, order) {
  state.donations = state.donations.map((donation) =>
    String(donation.id) === String(donationId)
      ? {
          ...donation,
          digitalOrder: order,
        }
      : donation,
  );
}

function cssAttributeValue(value) {
  const stringValue = String(value);
  return window.CSS?.escape ? window.CSS.escape(stringValue) : stringValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function saveDigitalOrderFulfillment(donationId, button) {
  const donation = getDonationById(donationId);
  const statusElement = elements.adminActionStatus;
  const panel = elements.adminPanel;
  const detailRoot = elements.adminCalendarDetails;
  const noteField = detailRoot.querySelector(`[data-fulfillment-note="${cssAttributeValue(donationId)}"]`);
  const note = noteField?.value || "";
  const order = getDigitalOrder(donation);
  const nextStatus = order?.fulfillmentStatus === "fulfilled" ? "paid_awaiting_personalized_writing" : "fulfilled";

  await runAdminAction(
    {
      panel,
      statusElement,
      button,
      busyText: "Saving...",
      loadingMessage: "Saving digital order fulfillment status...",
      successMessage:
        nextStatus === "fulfilled"
          ? "Digital order marked fulfilled. The proof PDF will include this status."
          : "Digital order moved back to awaiting personalized writing.",
      errorMessage: "Could not update digital order fulfillment.",
    },
    async () => {
      const payload = await callEdge("admin-donations", {
        admin: true,
        method: "PUT",
        body: {
          donationId,
          fulfillmentStatus: nextStatus,
          fulfillmentNote: note,
        },
      });

      updateDonationDigitalOrder(donationId, payload.order);
      renderAdminCalendar();
      return payload;
    },
  );
}

function toDateKey(date) {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);

  if (!year || !month || !day) return new Date();

  return new Date(year, month - 1, day);
}

function getDonationDateKey(donation) {
  return toDateKey(new Date(donation.createdAt || Date.now()));
}

function getLatestDonationDateKey() {
  const latestDonation = state.donations
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

  return latestDonation ? getDonationDateKey(latestDonation) : toDateKey(new Date());
}

function getDonationsByDate(donations = state.donations) {
  return donations.reduce((groups, donation) => {
    const dateKey = getDonationDateKey(donation);
    groups[dateKey] = groups[dateKey] || [];
    groups[dateKey].push(donation);
    return groups;
  }, {});
}

function formatMonthTitle(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthKey(date) {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  return `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, "0")}`;
}

async function approveSuperAdminDonation(donationId, button) {
  if (!donationId) return;

  const prevText = button.textContent;
  button.disabled = true;
  button.textContent = "Approving...";

  try {
    await callEdge("admin-donations", {
      admin: true,
      method: "PATCH",
      body: { donationId, superApproved: true },
    });
    const donation = state.donations.find((d) => d.id === donationId);
    if (donation) donation.superApproved = true;
    renderAdminCalendarDetails();
    showToast("Superadmin donation approved.");
  } catch (error) {
    button.disabled = false;
    button.textContent = prevText;
    showToast(error.message || "Could not approve donation.");
  }
}

async function loadAdminDonations(options = {}) {
  if (!isBackendConfigured() || !getAdminAccessToken()) return;

  const announce = Boolean(options.announce);

  if (announce) {
    setAdminBusy(true);
    elements.adminCalendarPrev.disabled = true;
    elements.adminCalendarNext.disabled = true;
    setAdminStatus(`Loading donations for ${formatMonthTitle(adminCalendarCursor)}...`, "loading", { persist: true });
  }

  try {
    const payload = await callEdge(`admin-donations?month=${getMonthKey(adminCalendarCursor)}`, {
      admin: true,
      method: "GET",
    });

    if (Array.isArray(payload.donations)) {
      state.donations = payload.donations;
      renderAdminCalendar();
      renderRecentDonations();
      renderFeed();
      renderTopSupporters();
      renderTotals();
    }

    if (announce) {
      setAdminStatus(`Donation calendar loaded for ${formatMonthTitle(adminCalendarCursor)}.`, "success");
    }
  } catch (error) {
    const message = error.message || "Could not load admin donation calendar.";
    setAdminStatus(message, "error", { persist: true });
    showToast(message);
  } finally {
    if (announce) {
      elements.adminCalendarPrev.disabled = false;
      elements.adminCalendarNext.disabled = false;
      setAdminBusy(false);
    }
  }
}

async function loadAdminAnalytics(options = {}) {
  if (!isBackendConfigured() || !getAdminAccessToken()) return;

  const announce = Boolean(options.announce);

  if (announce) {
    setAdminStatus("Loading page views from the last 24 hours...", "loading", { persist: true });
  }

  try {
    const payload = await callEdge("admin-analytics", {
      admin: true,
      method: "GET",
    });

    state.analytics = normalizeAnalytics(payload);
    renderAdminAnalytics();

    if (announce) {
      setAdminStatus("Page view analytics loaded for the last 24 hours.", "success");
    }
  } catch (error) {
    const message = error.message || "Could not load page view analytics.";
    setAdminStatus(message, "error", { persist: true });
    showToast(message);
  }
}

async function resetAdminAnalytics() {
  if (!isBackendConfigured() || !getAdminAccessToken()) {
    state.analytics = createEmptyAnalytics();
    renderAdminAnalytics();
    showToast("Page view analytics reset locally.");
    return;
  }

  await runAdminAction(
    {
      button: elements.resetAdminAnalyticsButton,
      busyText: "Resetting...",
      loadingMessage: "Resetting page view analytics...",
      successMessage: "Page view analytics reset. New activity will count from now.",
      errorMessage: "Could not reset page view analytics.",
    },
    async () => {
      const payload = await callEdge("admin-analytics", {
        admin: true,
        method: "DELETE",
      });

      state.analytics = normalizeAnalytics(payload);
      renderAdminAnalytics();
      return payload;
    },
  );
}

async function refreshAdminPortalData() {
  if (!isBackendConfigured() || !getAdminAccessToken()) {
    setAdminStatus("Sign in as admin before reloading portal data.", "error", { persist: true });
    return;
  }

  setAdminBusy(true);
  setButtonBusy(elements.refreshAdminButton, true, "Reloading...");
  if (elements.adminCalendarPrev) elements.adminCalendarPrev.disabled = true;
  if (elements.adminCalendarNext) elements.adminCalendarNext.disabled = true;
  setAdminStatus("Reloading page content, donations, posts, and page views...", "loading", { persist: true });

  try {
    await loadBackendData({ throwOnError: true });
    renderApp();
    await Promise.all([loadAdminDonations(), loadAdminAnalytics()]);
    setAdminStatus("Admin portal data reloaded.", "success");
    showToast("Admin portal data reloaded.");
  } catch (error) {
    const message = error.message || "Could not reload admin portal data.";
    setAdminStatus(message, "error", { persist: true });
    showToast(message);
  } finally {
    if (elements.adminCalendarPrev) elements.adminCalendarPrev.disabled = false;
    if (elements.adminCalendarNext) elements.adminCalendarNext.disabled = false;
    setButtonBusy(elements.refreshAdminButton, false, "Reloading...");
    setAdminBusy(false);
  }
}

function renderTextWithBreaks(element, value) {
  if (!element) return;
  element.innerHTML = escapeHtml(value).replace(/\n/g, "<br />");
}

function renderParagraphs(element, value) {
  if (!element) return;
  const paragraphs = String(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  element.innerHTML = paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function renderAmountOptions(selectedAmount = getAmount()) {
  elements.amountGrid.innerHTML = state.settings.amountOptions
    .map((amount) => {
      const activeClass = amount === selectedAmount ? " active" : "";
      const description = AMOUNT_TIER_DESCRIPTIONS[amount] || "Sow a Seed of Faith";
      return `
        <button class="amount-option${activeClass}" type="button" data-amount="${amount}">
          <span class="amount-option-value">
            <span class="amount-option-number">${amount}</span>
            <img class="amount-option-seed-mark" src="assets/seed-favicon.svg" alt="" />
          </span>
          <span class="amount-option-title">${escapeHtml(description)}</span>
        </button>
      `;
    })
    .join("");
}

function renderSettings() {
  const settings = state.settings;

  document.title = `${TOP_BRAND_TITLE} | Creator Support`;
  elements.brandTitle.textContent = TOP_BRAND_TITLE;
  elements.profileTitle.textContent = settings.profileTitle;
  elements.followersText.textContent = settings.followersText;
  elements.meterHeadline.textContent = settings.meterHeadline;
  renderTextWithBreaks(elements.meterCollapsed, settings.meterCollapsed);
  renderParagraphs(elements.meterExpanded, settings.meterExpanded);
  elements.aboutTitle.textContent = settings.aboutTitle;
  renderTextWithBreaks(elements.aboutCollapsed, settings.aboutCollapsed);
  renderParagraphs(elements.aboutExpanded, settings.aboutExpanded);
  elements.topicPill.textContent = settings.topicLabel;
  elements.supportTitle.textContent = settings.supportTitle;
  elements.postAuthorName.textContent = settings.postAuthorName;
  elements.paymentCopy.textContent = settings.paymentCopy;
  elements.paymentNote.textContent = settings.paymentNote;
  elements.footerText.textContent = settings.footerText;
  renderAmountOptions();
  renderAdminForm();
  updateCheckoutLabel();
}

function renderTotals() {
  const { donationAmount } = getTotals();
  const seedPrice = Math.max(Number.parseInt(state.settings.seedPrice, 10) || SEED_DOLLAR_VALUE, 1);
  const goalAmount = Math.max(Number.parseInt(state.settings.seedGoal, 10) || 1, 1);
  const cycleAmount = getCurrentGoalCycleAmount(donationAmount, goalAmount);
  const paidSeedUnits = getSeedUnitsFromAmount(cycleAmount, seedPrice);
  const goalSeedUnits = goalAmount / seedPrice;
  const rawPercent = goalSeedUnits > 0 ? (paidSeedUnits / goalSeedUnits) * 100 : 0;
  const boundedPercent = Math.min(Math.max(rawPercent, 0), 100);
  const displayPercent = Math.floor(boundedPercent);

  elements.progressPercent.textContent = `${displayPercent}% of goal`;
  elements.progressFill.style.width = `${boundedPercent}%`;
}

function renderFeed() {
  if (!elements.feedList) return;

  elements.feedList.innerHTML = state.donations
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
    .map((item) => {
      const name = item.anonymous ? "Private supporter" : item.name;
      const seedCount = getSeedCountFromAmount(item.amount);
      const cadence = item.frequency === "monthly" ? "monthly seed" : "seed";

      return `
        <article class="feed-card">
          <div class="feed-meta">
            <span class="avatar">${initials(name)}</span>
            <div class="feed-title">
              ${escapeHtml(name)} sowed ${seedCount} ${cadence}${seedCount === 1 ? "" : "s"}
              <small>${relativeTime(item.createdAt)}</small>
            </div>
          </div>
          ${item.message ? `<p class="feed-message">${escapeHtml(item.message)}</p>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderRecentDonations() {
  if (!elements.recentDonationList) return;

  const donations = state.donations
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 50);

  elements.recentDonationList.innerHTML = donations.length
    ? donations
        .map((donation) => {
          const name = donation.anonymous ? "Private supporter" : donation.name || "Friend of the ministry";
          const seedCount = getSeedCountFromAmount(donation.amount);
          const createdAt = donation.createdAt || new Date().toISOString();

          return `
            <article class="recent-donation-item">
              <span class="avatar">${initials(name)}</span>
              <div>
                <strong>${escapeHtml(name)} sowed ${seedCount} seed${seedCount === 1 ? "" : "s"}</strong>
                <small>${readableDate(createdAt)} · ${relativeTime(createdAt)}</small>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="empty-state">No seeds have been recorded yet.</p>`;
}

function renderSeedComments() {
  if (!elements.seedCommentsList) return;

  const comments = normalizeSeedComments(state.seedComments);

  elements.seedCommentsList.innerHTML = comments.length
    ? comments
        .map((comment) => {
          const seedCount = Number.isFinite(comment.seedCount) && comment.seedCount > 0 ? comment.seedCount : null;
          const seedLabel = seedCount
            ? `Sowed ${seedCount} seed${seedCount === 1 ? "" : "s"}`
            : "Blessing comment";

          return `
            <article class="seed-comment-item">
              <span class="avatar">${initials(comment.name)}</span>
              <div>
                <div class="seed-comment-heading">
                  <strong>${escapeHtml(comment.name)}</strong>
                  <small>${seedLabel} · ${readableDate(comment.createdAt)} · ${readableTime(comment.createdAt)}</small>
                </div>
                <p>${escapeHtml(comment.text)}</p>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="empty-state">Blessing comments will appear here after supporters sow a seed.</p>`;
}

function renderPostCard(post, compact = false) {
  const image = post.imageUrl
    ? `<img class="post-image" src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" />`
    : "";
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const likeCount = Math.max(Number.parseInt(post.likes, 10) || 0, 0);
  const likedClass = post.liked ? " is-liked" : "";
  const commentsLabel = `${comments.length} comment${comments.length === 1 ? "" : "s"}`;
  const commentsThread = comments.length
    ? `<div class="post-comments">
        ${comments
          .slice()
          .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
          .map(
            (comment) => `
              <article class="post-comment">
                <strong>${escapeHtml(comment.name)}</strong>
                <p>${escapeHtml(comment.text)}</p>
                <small>${relativeTime(comment.createdAt)}</small>
              </article>
            `,
          )
          .join("")}
      </div>`
    : `<p class="post-no-comments">Be the first to leave a comment.</p>`;
  const commentForm = compact
    ? ""
    : `<form class="post-comment-form" data-comment-post="${escapeHtml(post.id)}">
        <label>
          <span class="visually-hidden">Write a comment</span>
          <input name="comment" type="text" maxlength="180" placeholder="Write a comment..." autocomplete="off" />
        </label>
        <button type="submit">Comment</button>
      </form>`;

  return `
    <article class="panel post-card public-post-card${compact ? " compact-post-card" : ""}">
      ${image}
      <div class="post-card-copy">
        <small>${readableDate(post.createdAt)}</small>
        <h2>${escapeHtml(post.title)}</h2>
        ${post.description ? `<p>${escapeHtml(post.description)}</p>` : ""}
        <div class="post-engagement" aria-label="Post engagement">
          <button class="post-like-button${likedClass}" type="button" data-like-post="${escapeHtml(post.id)}" aria-pressed="${post.liked ? "true" : "false"}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s-7-4.35-9.5-9.2C.3 7.55 2.8 4 6.6 4c2.1 0 3.6 1.1 4.4 2.3C11.8 5.1 13.3 4 15.4 4c3.8 0 6.3 3.55 4.1 7.8C19 16.65 12 21 12 21Z" />
            </svg>
            <span>Like</span>
            <strong>${likeCount}</strong>
          </button>
          <span class="post-comment-count">${commentsLabel}</span>
        </div>
        ${compact ? "" : commentsThread}
        ${commentForm}
      </div>
    </article>
  `;
}

function renderPublicPosts() {
  const posts = getSortedPosts();

  if (elements.sidebarPostList) {
    elements.sidebarPostList.innerHTML = posts.length
      ? posts.slice(0, 3).map((post) => renderPostCard(post, true)).join("")
      : `<p class="empty-state">No posts published yet.</p>`;
  }

  if (elements.postsPageList) {
    elements.postsPageList.innerHTML = posts.length
      ? posts.map((post) => renderPostCard(post)).join("")
      : `<p class="empty-state">No posts published yet.</p>`;
  }
}

function renderGallery() {
  if (!elements.galleryGrid) return;

  const galleryPosts = getSortedPosts().filter((post) => post.imageUrl);

  elements.galleryGrid.innerHTML = galleryPosts.length
    ? galleryPosts
        .map(
          (post) => `
            <article class="gallery-card">
              <img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" />
              <div>
                <strong>${escapeHtml(post.title)}</strong>
                <span>${readableDate(post.createdAt)}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p class="empty-state">Publish a post with an uploaded photo to build the gallery.</p>`;
}

function renderAdminPosts() {
  if (!elements.adminPostList) return;

  const posts = getSortedPosts();

  elements.adminPostList.innerHTML = posts.length
    ? posts
        .map(
          (post) => `
            <article class="admin-post-item">
              <img src="${escapeHtml(post.imageUrl || "assets/sow-cover.png")}" alt="" />
              <div>
                <strong>${escapeHtml(post.title)}</strong>
                <span>${readableDate(post.createdAt)}</span>
                ${post.description ? `<p>${escapeHtml(post.description)}</p>` : ""}
              </div>
              <button class="button button-secondary" type="button" data-delete-post="${escapeHtml(post.id)}">Delete</button>
            </article>
          `,
        )
        .join("")
    : `<p class="empty-state">No posts published yet.</p>`;
}

function renderTopSupporters() {
  if (!elements.topSupporters) return;

  const totals = state.donations.reduce((acc, item) => {
    const name = item.anonymous ? "Private supporter" : item.name;
    acc[name] = (acc[name] || 0) + getSeedCountFromAmount(item.amount);
    return acc;
  }, {});

  elements.topSupporters.innerHTML = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(
      ([name, seeds], index) => `
        <div class="supporter-row">
          <div>
            <strong>${index + 1}. ${escapeHtml(name)}</strong>
            <span>${index === 0 ? "Leading supporter" : "Community supporter"}</span>
          </div>
          <div class="total">${seeds} seed${seeds === 1 ? "" : "s"}</div>
        </div>
      `,
    )
    .join("");
}

function renderFollowState() {
  const iconPath = state.followed ? "m5 12 4 4L19 6" : "M12 5v14M5 12h14";
  elements.followButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPath}" /></svg>
    <span>${state.followed ? "Following" : "Follow"}</span>
  `;
}

function renderAdminForm() {
  const settings = state.settings;
  const inputs = elements.adminInputs;

  inputs.seedGoal.value = settings.seedGoal;
  inputs.meterCurrentAmount.value = settings.meterCurrentAmount;
  inputs.seedPrice.value = settings.seedPrice;
  inputs.amountOptions.value = settings.amountOptions.join(", ");
  inputs.profileTitle.value = settings.profileTitle;
  inputs.followersText.value = settings.followersText;
  inputs.meterHeadline.value = settings.meterHeadline;
  inputs.meterCollapsed.value = settings.meterCollapsed;
  inputs.meterExpanded.value = settings.meterExpanded;
  inputs.aboutTitle.value = settings.aboutTitle;
  inputs.aboutCollapsed.value = settings.aboutCollapsed;
  inputs.aboutExpanded.value = settings.aboutExpanded;
  inputs.topicLabel.value = settings.topicLabel;
  inputs.postAuthorName.value = settings.postAuthorName;
  inputs.supportTitle.value = settings.supportTitle;
  inputs.paymentCopy.value = settings.paymentCopy;
  inputs.paymentNote.value = settings.paymentNote;
  inputs.footerText.value = settings.footerText;
  inputs.fortuneNumberEnabled.checked = Boolean(settings.fortuneNumberEnabled);
}

function renderAdminAnalytics() {
  if (!elements.adminUniqueVisitors24h || !elements.adminPageViews24h || !elements.adminAnalyticsUpdated) return;

  const analytics = normalizeAnalytics(state.analytics);
  const generatedAt = analytics.generatedAt ? new Date(analytics.generatedAt) : null;
  const hasValidDate = generatedAt && !Number.isNaN(generatedAt.getTime());
  const topPath = analytics.topPaths[0];

  elements.adminUniqueVisitors24h.textContent = formatCompactNumber(analytics.uniqueVisitorsLast24h);
  elements.adminPageViews24h.textContent = formatCompactNumber(analytics.pageViewsLast24h);
  if (elements.adminCheckoutClicks24h) {
    elements.adminCheckoutClicks24h.textContent = formatCompactNumber(analytics.checkoutButtonClicksLast24h);
  }
  if (elements.adminPaypalStarts24h) {
    elements.adminPaypalStarts24h.textContent = formatCompactNumber(analytics.paypalCheckoutStartsLast24h);
  }
  if (elements.adminPaymentsCompleted24h) {
    elements.adminPaymentsCompleted24h.textContent = formatCompactNumber(analytics.completedPaymentsLast24h);
  }
  elements.adminAnalyticsUpdated.textContent = hasValidDate
    ? `Updated ${readableDate(generatedAt)} at ${readableTime(generatedAt)}${topPath ? ` · Top path: ${topPath.path}` : ""}`
    : "Open the admin portal to load page-view analytics.";
}

function renderAdminCalendarDetails() {
  if (!elements.adminCalendarDetails) return;

  const donationsByDate = getDonationsByDate();
  const donations = (donationsByDate[selectedAdminCalendarDate] || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const selectedDate = fromDateKey(selectedAdminCalendarDate);
  const total = donations.reduce((sum, donation) => sum + (Number.parseFloat(donation.amount) || 0), 0);

  if (!donations.length) {
    elements.adminCalendarDetails.innerHTML = `
      <div class="admin-calendar-empty">
        <strong>${readableDate(selectedDate)}</strong>
        <span>No donations recorded on this day.</span>
      </div>
    `;
    return;
  }

  elements.adminCalendarDetails.innerHTML = `
    <div class="admin-calendar-detail-heading">
      <div>
        <span>Selected day</span>
        <strong>${readableDate(selectedDate)}</strong>
      </div>
      <b>${donations.length} donation${donations.length === 1 ? "" : "s"} · ${money(total)}</b>
    </div>
    <div class="admin-calendar-list">
      ${donations
        .map((donation) => {
          const name = donation.anonymous ? "Private supporter" : donation.name || "Unknown supporter";
          const amount = Number.parseFloat(donation.amount) || 0;
          const frequency = donation.frequency === "monthly" ? "Monthly" : "One time";
          const createdAt = donation.createdAt || new Date().toISOString();
          const order = getDigitalOrder(donation);
          const orderNumber = getDigitalOrderValue(
            donation,
            "orderNumber",
            getDonationRawValue(donation, "Reference", donation.orderId || donation.id || "Pending"),
          );
          const captureId = getDigitalOrderValue(
            donation,
            "paypalCaptureId",
            donation.captureId || getDonationRawValue(donation, "TransactionId", "Not available"),
          );
          const contactEmail = getDigitalOrderValue(donation, "contactEmail", "");
          const request = getDigitalOrderValue(donation, "personalizedRequest", donation.message || "No request entered.");
          const status = getDigitalOrderValue(donation, "fulfillmentStatus", "paid_awaiting_personalized_writing");
          const note = getDigitalOrderValue(donation, "fulfillmentNote", "");
          const isFulfilled = status === "fulfilled";

          return `
            <article class="admin-calendar-donation">
              <div class="admin-calendar-donation-main">
                <div>
                  <strong>${escapeHtml(name)}</strong>
                  <span>${frequency} · ${readableTime(createdAt)}</span>
                </div>
                <b>${money(amount)}</b>
              </div>
              <div class="admin-order-meta">
                <span><strong>Order ID</strong>${escapeHtml(orderNumber)}</span>
                <span><strong>Transaction ID</strong>${escapeHtml(captureId)}</span>
                <span><strong>Contact email</strong>${escapeHtml(contactEmail || "Not provided")}</span>
                <span><strong>Item</strong>${escapeHtml(order?.itemName || DIGITAL_ORDER_ITEM_NAME)}</span>
                <span><strong>Status</strong>${escapeHtml(getFulfillmentStatusLabel(status))}</span>
              </div>
              <p class="admin-order-request"><strong>Request:</strong> ${escapeHtml(request)}</p>
              <label class="admin-fulfillment-field">
                <span>Fulfillment note</span>
                <textarea data-fulfillment-note="${escapeHtml(donation.id)}" placeholder="Write proof notes, delivery details, or custom writing summary.">${escapeHtml(note)}</textarea>
              </label>
              <div class="admin-order-actions">
                ${donation.paymentRoute === "superadmin" && !donation.superApproved ? `
                  <button class="button button-primary button-approve" type="button" data-approve-superadmin="${escapeHtml(donation.id)}">
                    Approve (Yes)
                  </button>
                ` : ""}
                <button class="button button-secondary" type="button" data-download-order-proof="${escapeHtml(donation.id)}">Download PDF</button>
                <button class="button button-primary" type="button" data-save-fulfillment="${escapeHtml(donation.id)}">
                  ${isFulfilled ? "Reopen order" : "Mark fulfilled"}
                </button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function getAdminMonthDonations() {
  const year = adminCalendarCursor.getFullYear();
  const month = adminCalendarCursor.getMonth();

  return state.donations.filter((donation) => {
    const date = new Date(donation.createdAt || Date.now());
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

function renderAdminCalendarSummary() {
  if (!elements.adminCalendarSummary) return;

  const donationsByDate = getDonationsByDate();
  const dayDonations = donationsByDate[selectedAdminCalendarDate] || [];
  const monthDonations = getAdminMonthDonations();
  const dayTotal = dayDonations.reduce((sum, donation) => sum + (Number.parseInt(donation.amount, 10) || 0), 0);
  const monthTotal = monthDonations.reduce((sum, donation) => sum + (Number.parseInt(donation.amount, 10) || 0), 0);

  elements.adminCalendarSummary.innerHTML = `
    <article>
      <span>${readableDate(fromDateKey(selectedAdminCalendarDate))}</span>
      <strong>${money(dayTotal)}</strong>
      <small>${dayDonations.length} donation${dayDonations.length === 1 ? "" : "s"} selected day</small>
    </article>
    <article>
      <span>${formatMonthTitle(adminCalendarCursor)}</span>
      <strong>${money(monthTotal)}</strong>
      <small>${monthDonations.length} donation${monthDonations.length === 1 ? "" : "s"} this month</small>
    </article>
  `;
}

function renderAdminCalendar() {
  if (!elements.adminCalendarGrid || !elements.adminCalendarTitle) return;

  const donationsByDate = getDonationsByDate();
  const year = adminCalendarCursor.getFullYear();
  const month = adminCalendarCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());
  const cells = [];

  for (let offset = 0; offset < firstDay.getDay(); offset += 1) {
    cells.push(`<span class="admin-calendar-day is-empty" role="presentation"></span>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = toDateKey(date);
    const donations = donationsByDate[dateKey] || [];
    const total = donations.reduce((sum, donation) => sum + (Number.parseInt(donation.amount, 10) || 0), 0);
    const classes = [
      "admin-calendar-day",
      donations.length ? "has-donations" : "",
      dateKey === selectedAdminCalendarDate ? "is-selected" : "",
      dateKey === todayKey ? "is-today" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const donationLabel = donations.length
      ? `${donations.length} donation${donations.length === 1 ? "" : "s"}, ${money(total)}`
      : "no donations";

    cells.push(`
      <button
        class="${classes}"
        type="button"
        role="gridcell"
        aria-selected="${dateKey === selectedAdminCalendarDate}"
        aria-label="${readableDate(date)}, ${donationLabel}"
        data-admin-calendar-date="${dateKey}"
      >
        <span>${day}</span>
        ${donations.length ? `<small>${money(total)}</small>` : ""}
      </button>
    `);
  }

  elements.adminCalendarTitle.textContent = formatMonthTitle(adminCalendarCursor);
  elements.adminCalendarGrid.innerHTML = cells.join("");
  renderAdminCalendarDetails();
  renderAdminCalendarSummary();
}

function updateCheckoutLabel() {
  const amount = Math.max(getAmount(), 0);
  const cadence = currentFrequency === "monthly" ? "/mo" : "";
  const seedUnits = getSeedUnitsFromAmount(amount, state.settings.seedPrice);

  elements.checkoutLabel.textContent = "Sow Your Seed";
  elements.checkoutButton.setAttribute("aria-label", `Sow Your Seed ${money(amount)}${cadence}`);
  elements.seedPriceLabel.textContent = formatSeedUnits(seedUnits);
}

function getPaymentEmail() {
  return String(elements.paymentEmailInput?.value || "").trim();
}

function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function requirePaymentEmail() {
  const email = getPaymentEmail();

  if (isValidEmailAddress(email)) {
    return email;
  }

  setPaymentStatus("Add a valid email before opening PayPal checkout.", true);
  elements.paymentEmailInput?.focus();
  throw new Error("A valid email is required for your order detail.");
}

function setAmount(amount) {
  elements.amountInput.value = amount;
  renderAmountOptions(amount);
  elements.amountError.textContent = "";
  updateCheckoutLabel();
}

function setQuantity(nextQuantity) {
  quantity = Math.max(1, Math.min(nextQuantity, 99));
  elements.quantityValue.textContent = quantity;
  setAmount(state.settings.seedPrice * quantity);
}

function setFrequency(frequency) {
  currentFrequency = frequency;
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.frequency === frequency);
  });
  updateCheckoutLabel();
}

function validateForm() {
  const amount = getAmount();
  const name = elements.nameInput.value.trim();
  let isValid = true;

  elements.amountError.textContent = "";
  elements.nameError.textContent = "";

  if (amount < 1) {
    elements.amountError.textContent = "Enter at least $1.";
    isValid = false;
  }

  if (!name) {
    elements.nameError.textContent = "Add your name.";
    isValid = false;
  }

  return isValid;
}

function getRandomFortuneMessage() {
  const index = Math.floor(Math.random() * FORTUNE_MESSAGES.length);
  return FORTUNE_MESSAGES[index];
}

function setPaymentStatus(message, isError = false) {
  if (!elements.paymentStatus) return;
  elements.paymentStatus.textContent = message;
  elements.paymentStatus.classList.toggle("is-error", isError);
}

function submitDonation(event) {
  event.preventDefault();

  if (!validateForm()) return;

  pendingDonation = {
    name: elements.nameInput.value.trim(),
    amount: getAmount(),
    frequency: currentFrequency,
    message: elements.messageInput.value.trim(),
    privateMessage: false,
    anonymous: false,
    createdAt: new Date().toISOString(),
  };

  trackCheckoutEvent("checkout_button_clicked", pendingDonation);
  openPaymentDialog();
}

function isValidPayPalSdk(paypal) {
  return Boolean(paypal && typeof paypal.Buttons === "function" && paypal.FUNDING);
}

function resetPayPalSdk() {
  document.querySelectorAll("script[data-sys-paypal-sdk]").forEach((script) => script.remove());

  if (paypalSdkKey) {
    paypalSdkPromises.delete(paypalSdkKey);
    paypalSdkKey = "";
  }

  try {
    delete window.paypalSys;
  } catch {
    window.paypalSys = undefined;
  }
}

function loadPayPalSdk() {
  const clientId = paymentConfig.paypalClientId;
  const sdkKey = `standard:${clientId}:${paymentConfig.currency || CONFIG.currency}`;
  const namespace = "paypalSys";

  if (!clientId) {
    return Promise.reject(new Error("Missing PayPal client id."));
  }

  if (isValidPayPalSdk(window[namespace])) {
    return Promise.resolve(window[namespace]);
  }

  if (window[namespace]) {
    resetPayPalSdk();
  }

  if (paypalSdkKey && paypalSdkKey !== sdkKey) {
    resetPayPalSdk();
  }

  if (paypalSdkPromises.has(sdkKey)) return paypalSdkPromises.get(sdkKey);

  const sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      "client-id": clientId,
      currency: paymentConfig.currency || CONFIG.currency,
      intent: "capture",
      components: "buttons",
      "enable-funding": "card",
    });

    script.dataset.sysPaypalSdk = "true";
    script.setAttribute("data-namespace", namespace);
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.onload = () => {
      const paypal = window[namespace];

      if (isValidPayPalSdk(paypal)) {
        resolve(paypal);
        return;
      }

      resetPayPalSdk();
      reject(new Error("PayPal checkout loaded without buttons. Please refresh and try again."));
    };
    script.onerror = () => {
      resetPayPalSdk();
      reject(new Error("PayPal checkout could not load."));
    };
    document.head.append(script);
  });

  paypalSdkKey = sdkKey;
  paypalSdkPromises.set(sdkKey, sdkPromise);

  return sdkPromise;
}

function clearPayPalButtons() {
  if (elements.paypalButtonContainer) elements.paypalButtonContainer.innerHTML = "";
  if (elements.cardButtonContainer) elements.cardButtonContainer.innerHTML = "";
}

function buildPayPalButtonOptions(paypal, fundingSource) {
  return {
    fundingSource,
    style: {
      layout: "vertical",
      shape: "pill",
      label: fundingSource === paypal.FUNDING.CARD ? "pay" : "paypal",
      height: 44,
    },
    createOrder: async () => {
      if (!pendingDonation) throw new Error("Donation details are missing.");
      const email = requirePaymentEmail();
      pendingDonation = { ...pendingDonation, email };
      setPaymentStatus("Opening secure international PayPal checkout...");
      const payload = await callEdge("create-paypal-order", {
        body: pendingDonation,
      });
      pendingDonation.paymentRoute = payload.paymentRoute;
      await trackCheckoutEvent("paypal_checkout_started", pendingDonation);
      return payload.id;
    },
    onApprove: async (data) => {
      setPaymentStatus("Confirming your seed with PayPal...");
      const payload = await callEdge("capture-paypal-order", {
        body: {
          orderId: data.orderID,
          donation: pendingDonation,
        },
      });
      await finishVerifiedDonation(payload);
    },
    onCancel: () => {
      setPaymentStatus("Payment cancelled. Your donation was not recorded.", true);
    },
    onError: (error) => {
      setPaymentStatus(error?.message || "PayPal checkout failed. Please try again.", true);
    },
  };
}

async function renderPayPalButtons() {
  clearPayPalButtons();

  if (!isBackendConfigured() || !backendReady) {
    setPaymentStatus("Backend is not configured yet. Fill src/config.js and deploy Supabase functions before live checkout.", true);
    return;
  }

  try {
    const paypal = await loadPayPalSdk();
    const paypalButtons = paypal.Buttons(buildPayPalButtonOptions(paypal, paypal.FUNDING.PAYPAL));
    if (paypalButtons.isEligible()) {
      await paypalButtons.render(elements.paypalButtonContainer);
    } else {
      elements.paypalButtonContainer.innerHTML = `<small>PayPal checkout is unavailable for this session.</small>`;
    }

    const cardButtons = paypal.Buttons(buildPayPalButtonOptions(paypal, paypal.FUNDING.CARD));
    if (cardButtons.isEligible()) {
      await cardButtons.render(elements.cardButtonContainer);
    } else {
      elements.cardButtonContainer.innerHTML = `<small>Card checkout is currently unavailable. Please use PayPal.</small>`;
    }

    setPaymentStatus("International PayPal/card checkout is ready.");
  } catch (error) {
    setPaymentStatus(error.message || "Payment buttons could not load.", true);
  }
}

async function finishVerifiedDonation(payload) {
  const donation = payload.donation;
  const fortuneMessage = payload.fortune || donation?.fortune_message || getRandomFortuneMessage();

  if (payload.donorAccessToken) {
    setDonorToken(payload.donorAccessToken);
  }

  if (donation) {
    state.donations.unshift({
      id: donation.id,
      name: donation.display_name || donation.name || pendingDonation?.name || "Supporter",
      amount: Number(donation.amount || pendingDonation?.amount || 0),
      frequency: donation.frequency || pendingDonation?.frequency || "once",
      message: donation.supporter_message || pendingDonation?.message || "",
      fortuneMessage: donation.fortune_message || fortuneMessage,
      digitalOrder: payload.digitalOrder || null,
      paymentRoute: "standard",
      createdAt: donation.created_at || new Date().toISOString(),
    });
    selectedAdminCalendarDate = getDonationDateKey(state.donations[0]);
    adminCalendarCursor = fromDateKey(selectedAdminCalendarDate);
  }

  if (payload.seedComment) {
    state.seedComments = normalizeSeedComments([payload.seedComment, ...(state.seedComments || [])]);
  } else if (!isBackendConfigured() && pendingDonation?.message) {
    state.seedComments = normalizeSeedComments([
      {
        id: `seed-comment-${Date.now()}`,
        name: pendingDonation.name || "Supporter",
        text: pendingDonation.message,
        amount: pendingDonation.amount,
        seedCount: getSeedCountFromAmount(pendingDonation.amount),
        source: "payment",
        createdAt: new Date().toISOString(),
      },
      ...(state.seedComments || []),
    ]);
  }

  if (isBackendConfigured()) {
    await loadBackendData();
  } else {
    saveState();
  }

  renderApp();
  currentReceiptText = `Your fortune for today\n\n${fortuneMessage}`;
  elements.receiptTitle.textContent = "Your fortune for today";
  elements.receiptSummary.textContent = fortuneMessage;
  elements.supportForm.reset();
  if (elements.paymentEmailInput) {
    elements.paymentEmailInput.value = "";
  }
  quantity = 1;
  elements.quantityValue.textContent = quantity;
  setAmount(getInitialDonationAmount());
  setFrequency("once");
  pendingDonation = null;
  closePaymentDialog(() => openReceipt());
}

function openPaymentDialog() {
  window.clearTimeout(paymentCloseTimer);
  document.body.classList.add("payment-open");
  setPaymentStatus("Loading secure international PayPal/card checkout...");
  elements.paymentDialog.classList.remove("is-closing");
  if (elements.paymentEmailInput) {
    elements.paymentEmailInput.value = pendingDonation?.email || "";
  }

  if (typeof elements.paymentDialog.showModal === "function") {
    elements.paymentDialog.showModal();
  } else {
    elements.paymentDialog.setAttribute("open", "");
  }

  window.requestAnimationFrame(() => {
    elements.paymentDialog.classList.add("is-open");
  });
  renderPayPalButtons();
}

function closePaymentDialog(afterClose) {
  if (!elements.paymentDialog.open) {
    if (typeof afterClose === "function") afterClose();
    return;
  }

  window.clearTimeout(paymentCloseTimer);
  elements.paymentDialog.classList.remove("is-open");
  elements.paymentDialog.classList.add("is-closing");

  paymentCloseTimer = window.setTimeout(() => {
    pendingDonation = null;

    if (typeof elements.paymentDialog.close === "function") {
      elements.paymentDialog.close();
    } else {
      elements.paymentDialog.removeAttribute("open");
    }

    document.body.classList.remove("payment-open");
    elements.paymentDialog.classList.remove("is-closing");

    if (typeof afterClose === "function") afterClose();
  }, PAYMENT_ANIMATION_MS);
}

function openReceipt() {
  document.body.classList.add("receipt-open");

  if (typeof elements.receiptDialog.showModal === "function") {
    elements.receiptDialog.showModal();
  } else {
    elements.receiptDialog.setAttribute("open", "");
  }
}

function closeReceipt() {
  document.body.classList.remove("receipt-open");
  elements.receiptDialog.close();
}

function resetFortuneNumberDialog() {
  if (!elements.fortuneNumberDialog) return;

  elements.fortuneNumberTitle.textContent = "A golden seed, My Child";
  elements.fortuneNumberCopy.textContent = "The blessing is in your hand. Sow the seed.";
  elements.fortuneNumberResult.hidden = true;
  elements.fortuneNumberResult.textContent = "";
  elements.fortuneNumberDoneButton.hidden = false;
  elements.fortuneSeedButton.disabled = false;
  elements.fortuneSeedButton.classList.add("is-revealed");
  elements.fortuneSeedButton.classList.remove("is-special");
}

function openGoldenSeedBlessingDialog() {
  if (!elements.fortuneNumberDialog || elements.fortuneNumberDialog.open) return;

  resetFortuneNumberDialog();
  document.body.classList.add("fortune-number-open");

  if (typeof elements.fortuneNumberDialog.showModal === "function") {
    elements.fortuneNumberDialog.showModal();
  } else {
    elements.fortuneNumberDialog.setAttribute("open", "");
  }
}

function closeFortuneNumberDialog() {
  if (!elements.fortuneNumberDialog?.open) return;

  document.body.classList.remove("fortune-number-open");
  elements.fortuneNumberDialog.close();
}

function revealFortuneSeedNumber() {
  const fortune = getFortuneSeedNumber();
  const seedLabel = `${fortune.seedCount} Seed${fortune.seedCount === 1 ? "" : "s"}`;

  elements.fortuneSeedButton.disabled = true;
  elements.fortuneSeedButton.classList.add("is-revealed");
  elements.fortuneSeedButton.classList.toggle("is-special", Boolean(fortune.isSpecial));
  elements.fortuneNumberDoneButton.hidden = false;
  elements.fortuneNumberResult.hidden = false;

  if (fortune.isSpecial) {
    elements.fortuneNumberTitle.textContent = fortune.title;
    elements.fortuneNumberCopy.textContent = "A rare golden blessing has opened for you.";
    elements.fortuneNumberResult.textContent = fortune.message;
    return;
  }

  elements.fortuneNumberTitle.textContent = "Your Fortune Seed Number";
  elements.fortuneNumberCopy.textContent = "Carry this number as your seed of intention today.";
  elements.fortuneNumberResult.textContent = seedLabel;
}

function openAdminLogin() {
  clearAdminSession();
  if (elements.adminEmailInput) {
    elements.adminEmailInput.value = "";
    elements.adminEmailInput.required = isBackendConfigured();
  }
  elements.adminPasswordInput.value = "";
  elements.adminPasswordError.textContent = "";

  if (typeof elements.adminLoginDialog.showModal === "function") {
    elements.adminLoginDialog.showModal();
  } else {
    elements.adminLoginDialog.setAttribute("open", "");
  }

  window.requestAnimationFrame(() => {
    elements.adminLoginDialog.classList.add("is-open");
  });
  window.setTimeout(() => {
    if (isBackendConfigured() && elements.adminEmailInput) {
      elements.adminEmailInput.focus();
    } else {
      elements.adminPasswordInput.focus();
    }
  }, 80);
}

function closeAdminLogin() {
  elements.adminLoginDialog.classList.remove("is-open");

  if (typeof elements.adminLoginDialog.close === "function") {
    elements.adminLoginDialog.close();
  } else {
    elements.adminLoginDialog.removeAttribute("open");
  }
}

function openAdminPanel() {
  renderAdminForm();
  renderAdminCalendar();
  renderAdminAnalytics();
  setAdminStatus("Admin ready. Make edits, then use Save changes or Publish post.", "info", { persist: true });
  document.body.classList.add("admin-open");
  elements.adminBackdrop.hidden = false;
  elements.adminPanel.setAttribute("aria-hidden", "false");
  elements.adminMenuButton.setAttribute("aria-expanded", "true");
  window.requestAnimationFrame(() => {
    elements.adminBackdrop.classList.add("is-open");
    elements.adminPanel.classList.add("is-open");
  });
}

function closeAdminPanel() {
  clearAdminSession();
  window.clearTimeout(setAdminStatus.timeout);
  if (elements.adminActionStatus) {
    elements.adminActionStatus.hidden = true;
  }
  document.body.classList.remove("admin-open");
  elements.adminBackdrop.classList.remove("is-open");
  elements.adminPanel.classList.remove("is-open");
  elements.adminPanel.setAttribute("aria-hidden", "true");
  elements.adminMenuButton.setAttribute("aria-expanded", "false");
  window.setTimeout(() => {
    if (!elements.adminPanel.classList.contains("is-open")) {
      elements.adminBackdrop.hidden = true;
    }
  }, 180);
}

function getAdminSettings() {
  const inputs = elements.adminInputs;

  return normalizeSettings({
    aboutCollapsed: inputs.aboutCollapsed.value,
    aboutExpanded: inputs.aboutExpanded.value,
    aboutTitle: inputs.aboutTitle.value,
    amountOptions: parseAmountOptions(inputs.amountOptions.value),
    followersText: inputs.followersText.value,
    footerText: inputs.footerText.value,
    fortuneNumberEnabled: inputs.fortuneNumberEnabled.checked,
    meterCollapsed: inputs.meterCollapsed.value,
    meterExpanded: inputs.meterExpanded.value,
    meterHeadline: inputs.meterHeadline.value,
    paymentCopy: inputs.paymentCopy.value,
    paymentNote: inputs.paymentNote.value,
    postAuthorName: inputs.postAuthorName.value,
    profileTitle: inputs.profileTitle.value,
    meterCurrentAmount: inputs.meterCurrentAmount.value,
    seedGoal: inputs.seedGoal.value,
    seedPrice: inputs.seedPrice.value,
    supportTitle: inputs.supportTitle.value,
    topicLabel: inputs.topicLabel.value,
  });
}

function createPostId() {
  return `post-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSelectedPostImageFile() {
  return elements.adminNewPostImage.files?.[0] || null;
}

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function clearAdminPostForm() {
  elements.adminNewPostTitle.value = "";
  elements.adminNewPostDescription.value = "";
  elements.adminNewPostImage.value = "";
  elements.adminUploadPreview.hidden = true;
  elements.adminUploadPreviewImage.removeAttribute("src");
  elements.adminUploadFileName.textContent = "";
}

function previewAdminUpload() {
  const file = getSelectedPostImageFile();

  if (!file) {
    elements.adminUploadPreview.hidden = true;
    elements.adminUploadPreviewImage.removeAttribute("src");
    elements.adminUploadFileName.textContent = "";
    return;
  }

  if (file.size > MAX_LOCAL_POST_IMAGE_BYTES) {
    elements.adminNewPostImage.value = "";
    elements.adminUploadPreview.hidden = true;
    setAdminStatus("Choose an image under 2 MB for local preview.", "error", { persist: true });
    showToast("Choose an image under 2 MB for local preview.");
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  elements.adminUploadPreviewImage.src = previewUrl;
  elements.adminUploadFileName.textContent = file.name;
  elements.adminUploadPreview.hidden = false;
  setAdminStatus("Photo selected. Add post text, then click Publish post.", "dirty", { persist: true });
}

async function publishAdminPost() {
  const title = elements.adminNewPostTitle.value.trim();
  const description = elements.adminNewPostDescription.value.trim();
  const imageFile = getSelectedPostImageFile();

  if (!title || !description) {
    setAdminStatus("Add a post title and description before publishing.", "error", { persist: true });
    showToast("Add a post title and description.");
    return;
  }

  if (imageFile && !isBackendConfigured() && imageFile.size > MAX_LOCAL_POST_IMAGE_BYTES) {
    setAdminStatus("Choose an image under 2 MB for local demo mode.", "error", { persist: true });
    showToast("Choose an image under 2 MB for local demo mode.");
    return;
  }

  if (imageFile && isBackendConfigured() && imageFile.size > MAX_REMOTE_POST_IMAGE_BYTES) {
    setAdminStatus("Choose an image under 5 MB.", "error", { persist: true });
    showToast("Choose an image under 5 MB.");
    return;
  }

  if (isBackendConfigured() && getAdminAccessToken()) {
    await runAdminAction(
      {
        button: elements.adminPublishPostButton,
        busyText: "Publishing...",
        loadingMessage: imageFile ? "Uploading image and publishing post..." : "Publishing post...",
        successMessage: "Post published. Gallery and posts refreshed.",
        errorMessage: "Could not publish post.",
      },
      async () => {
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        if (imageFile) form.append("image", imageFile);

        const payload = await callEdge("admin-posts", {
          admin: true,
          body: form,
          method: "POST",
        });

        clearAdminPostForm();
        if (payload.post) {
          state.posts.unshift(payload.post);
        }
        await loadBackendData();
        renderApp();
      },
    );

    return;
  }

  await runAdminAction(
    {
      button: elements.adminPublishPostButton,
      busyText: "Publishing...",
      loadingMessage: "Publishing local demo post...",
      successMessage: "Post published locally. Gallery and posts refreshed.",
      errorMessage: "Could not publish post.",
    },
    async () => {
      let imageUrl = "assets/sow-cover.png";

      if (imageFile) {
        imageUrl = await readImageFileAsDataUrl(imageFile);
      }

      state.posts.unshift({
        id: createPostId(),
        title,
        description,
        imageUrl,
        createdAt: new Date().toISOString(),
        likes: 0,
        liked: false,
        comments: [],
      });

      clearAdminPostForm();
      saveState();
      renderApp();
    },
  );
}

async function deleteAdminPost(postId, triggerButton) {
  if (isBackendConfigured() && getAdminAccessToken()) {
    await runAdminAction(
      {
        button: triggerButton,
        busyText: "Deleting...",
        loadingMessage: "Deleting post...",
        successMessage: "Post deleted. Gallery and posts refreshed.",
        errorMessage: "Could not delete post.",
      },
      async () => {
        await callEdge("admin-posts", {
          admin: true,
          body: { postId },
          method: "DELETE",
        });
        await loadBackendData();
        renderApp();
      },
    );

    return;
  }

  await runAdminAction(
    {
      button: triggerButton,
      busyText: "Deleting...",
      loadingMessage: "Deleting local demo post...",
      successMessage: "Post deleted locally. Gallery and posts refreshed.",
      errorMessage: "Could not delete post.",
    },
    async () => {
      state.posts = state.posts.filter((post) => post.id !== postId);
      saveState();
      renderApp();
    },
  );
}

function findPost(postId) {
  return state.posts.find((post) => post.id === postId);
}

async function togglePostLike(postId) {
  const post = findPost(postId);
  if (!post) return;

  if (isBackendConfigured() && backendReady) {
    try {
      const payload = await callEdge("post-engagement", {
        body: {
          action: "like",
          postId,
          visitorKey: getVisitorKey(),
        },
      });
      post.likes = payload.likes;
      post.liked = payload.liked;
      renderPublicPosts();
    } catch (error) {
      showToast(error.message || "Could not update like.");
    }

    return;
  }

  const currentLikes = Math.max(Number.parseInt(post.likes, 10) || 0, 0);
  post.liked = !post.liked;
  post.likes = post.liked ? currentLikes + 1 : Math.max(currentLikes - 1, 0);

  saveState();
  renderPublicPosts();
}

async function addPostComment(postId, text) {
  const post = findPost(postId);
  const commentText = String(text || "").trim();

  if (!post) return;

  if (!commentText) {
    showToast("Write a comment first.");
    return;
  }

  if (isBackendConfigured() && backendReady) {
    const donorAccessToken = getDonorToken();

    if (!donorAccessToken) {
      showToast("Complete a donation to unlock comments.");
      return;
    }

    try {
      const payload = await callEdge("post-engagement", {
        body: {
          action: "comment",
          postId,
          donorAccessToken,
          displayName: elements.nameInput.value.trim().slice(0, 48) || "Supporter",
          comment: commentText,
        },
      });

      post.comments = Array.isArray(post.comments) ? post.comments : [];
      if (payload.comment) post.comments.push(payload.comment);
      renderPublicPosts();
      showToast("Comment posted.");
    } catch (error) {
      showToast(error.message || "Could not post comment.");
    }

    return;
  }

  const commenterName = elements.nameInput.value.trim().slice(0, 48) || "Supporter";
  post.comments = Array.isArray(post.comments) ? post.comments : [];
  post.comments.push({
    id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: commenterName,
    text: commentText.slice(0, 180),
    createdAt: new Date().toISOString(),
  });

  saveState();
  renderPublicPosts();
  showToast("Comment posted.");
}

function handlePostClick(event) {
  const likeButton = event.target.closest("[data-like-post]");
  if (!likeButton) return;

  togglePostLike(likeButton.dataset.likePost);
}

function handlePostCommentSubmit(event) {
  const form = event.target.closest("[data-comment-post]");
  if (!form) return;

  event.preventDefault();
  addPostComment(form.dataset.commentPost, new FormData(form).get("comment"));
}

function getViewIdFromHash() {
  if (window.location.hash === "#gallery") return "galleryView";
  if (window.location.hash === "#posts") return "postsView";
  return "aboutView";
}

function setActiveView(viewId, updateHash = false) {
  const targetTab = Array.from(elements.profileTabs).find((tab) => tab.dataset.sectionTab === viewId);

  elements.sectionViews.forEach((view) => {
    const isActive = view.id === viewId;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
  });

  elements.profileTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.sectionTab === viewId);
  });

  if (updateHash && targetTab) {
    history.pushState(null, "", targetTab.getAttribute("href"));
  }
}

function setAdminStatus(message, type = "info", options = {}) {
  const statusElement = options.statusElement || elements.adminActionStatus;
  if (!statusElement) return;

  window.clearTimeout(setAdminStatus.timeout);
  statusElement.hidden = false;
  statusElement.textContent = message;
  statusElement.className = `admin-status is-${type}`;

  if (!options.persist) {
    setAdminStatus.timeout = window.setTimeout(() => {
      statusElement.hidden = true;
    }, options.delay || 5200);
  }
}

function setAdminBusy(isBusy, panel = elements.adminPanel) {
  if (!panel) return;
  panel.setAttribute("aria-busy", String(isBusy));
  panel.classList.toggle("is-busy", isBusy);
}

function setButtonBusy(button, isBusy, busyText = "") {
  if (!button) return;

  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }

  button.disabled = isBusy;
  button.classList.toggle("is-loading", isBusy);

  if (busyText) {
    button.textContent = isBusy ? busyText : button.dataset.defaultText;
  } else if (!isBusy) {
    button.textContent = button.dataset.defaultText;
  }
}

function getSettingsChangeCount(previousSettings, nextSettings) {
  const previous = normalizeSettings(previousSettings);
  const next = normalizeSettings(nextSettings);

  return Object.keys(next).reduce((count, key) => {
    const before = Array.isArray(previous[key]) ? previous[key].join(",") : String(previous[key] ?? "");
    const after = Array.isArray(next[key]) ? next[key].join(",") : String(next[key] ?? "");
    return count + (before === after ? 0 : 1);
  }, 0);
}

async function runAdminAction({ button, busyText, loadingMessage, successMessage, errorMessage }, action) {
  const config = arguments[0] || {};
  const panel = config.panel || elements.adminPanel;
  const statusElement = config.statusElement || elements.adminActionStatus;

  setAdminBusy(true, panel);
  setButtonBusy(button, true, busyText);
  setAdminStatus(loadingMessage, "loading", { persist: true, statusElement });

  try {
    const result = await action();
    const message = typeof successMessage === "function" ? successMessage(result) : successMessage;
    setAdminStatus(message, "success", { statusElement });
    showToast(message);
    return result;
  } catch (error) {
    const message = error.message || errorMessage || "Admin action failed.";
    setAdminStatus(message, "error", { persist: true, statusElement });
    showToast(message);
    return null;
  } finally {
    setButtonBusy(button, false, busyText);
    setAdminBusy(false, panel);
  }
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast(text);
  }
}

function showToast(message) {
  const toast = elements.toast;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderApp() {
  renderSettings();
  renderTotals();
  renderFeed();
  renderRecentDonations();
  renderSeedComments();
  renderPublicPosts();
  renderGallery();
  renderAdminPosts();
  renderTopSupporters();
  renderFollowState();
  renderAdminCalendar();
  renderAdminAnalytics();
  updateCheckoutLabel();
}

elements.amountGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".amount-option");
  if (!button) return;
  const amount = Number(button.dataset.amount);
  quantity = 1;
  elements.quantityValue.textContent = quantity;
  setAmount(amount);

  if (GOLDEN_SEED_AMOUNTS.has(amount)) {
    openGoldenSeedBlessingDialog();
  }
});

elements.amountInput.addEventListener("input", () => {
  document.querySelectorAll(".amount-option").forEach((button) => button.classList.remove("active"));
  elements.amountError.textContent = "";
  updateCheckoutLabel();
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => setFrequency(button.dataset.frequency));
});

elements.decreaseQuantityButton.addEventListener("click", () => setQuantity(quantity - 1));
elements.increaseQuantityButton.addEventListener("click", () => setQuantity(quantity + 1));

elements.adminCalendarPrev.addEventListener("click", () => {
  adminCalendarCursor = new Date(adminCalendarCursor.getFullYear(), adminCalendarCursor.getMonth() - 1, 1);
  selectedAdminCalendarDate = toDateKey(adminCalendarCursor);
  renderAdminCalendar();
  loadAdminDonations({ announce: true });
});

elements.adminCalendarNext.addEventListener("click", () => {
  adminCalendarCursor = new Date(adminCalendarCursor.getFullYear(), adminCalendarCursor.getMonth() + 1, 1);
  selectedAdminCalendarDate = toDateKey(adminCalendarCursor);
  renderAdminCalendar();
  loadAdminDonations({ announce: true });
});

elements.adminCalendarGrid.addEventListener("click", (event) => {
  const dateButton = event.target.closest("[data-admin-calendar-date]");
  if (!dateButton) return;

  selectedAdminCalendarDate = dateButton.dataset.adminCalendarDate;
  adminCalendarCursor = fromDateKey(selectedAdminCalendarDate);
  renderAdminCalendar();
});

elements.adminCalendarDetails.addEventListener("click", (event) => {
  const proofButton = event.target.closest("[data-download-order-proof]");
  if (proofButton) {
    downloadOrderProofPdf(proofButton.dataset.downloadOrderProof);
    return;
  }

  const approveButton = event.target.closest("[data-approve-superadmin]");
  if (approveButton) {
    approveSuperAdminDonation(approveButton.dataset.approveSuperadmin, approveButton);
    return;
  }

  const fulfillmentButton = event.target.closest("[data-save-fulfillment]");
  if (fulfillmentButton) {
    saveDigitalOrderFulfillment(fulfillmentButton.dataset.saveFulfillment, fulfillmentButton);
  }
});

elements.profileTabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveView(tab.dataset.sectionTab, true);
  });
});

elements.adminPublishPostButton.addEventListener("click", publishAdminPost);
elements.adminExportCsvButton.addEventListener("click", exportAdminDonationCsv);
elements.refreshAdminButton.addEventListener("click", refreshAdminPortalData);
elements.resetAdminAnalyticsButton.addEventListener("click", resetAdminAnalytics);
elements.adminNewPostImage.addEventListener("change", previewAdminUpload);
elements.adminForm.addEventListener("input", (event) => {
  if (event.target.closest(".admin-export-section")) {
    setAdminStatus("CSV export range selected. Click Export CSV to download the report.", "dirty", { persist: true });
    return;
  }

  if (event.target.closest(".admin-posts-section")) {
    setAdminStatus("Post draft changed. Click Publish post to update Posts and Gallery.", "dirty", { persist: true });
    return;
  }

  setAdminStatus("Unsaved page changes. Click Save changes to publish them.", "dirty", { persist: true });
});
elements.adminPostList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-post]");
  if (!deleteButton) return;
  deleteAdminPost(deleteButton.dataset.deletePost, deleteButton);
});

[elements.sidebarPostList, elements.postsPageList].forEach((postList) => {
  if (!postList) return;
  postList.addEventListener("click", handlePostClick);
  postList.addEventListener("submit", handlePostCommentSubmit);
});

elements.showMoreButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = document.querySelector(`#${button.dataset.toggleTarget}`);
    const card = button.closest(".collapsible-card");
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    button.textContent = isExpanded ? "Show more" : "Show less";
    content.classList.toggle("is-expanded", !isExpanded);
    card.classList.toggle("is-expanded", !isExpanded);
  });
});

elements.supportForm.addEventListener("submit", submitDonation);
elements.paymentEmailInput?.addEventListener("input", () => {
  if (!elements.paymentStatus.classList.contains("is-error")) return;
  if (!isValidEmailAddress(getPaymentEmail())) return;
  setPaymentStatus("International PayPal/card checkout is ready.");
});

elements.followButton.addEventListener("click", () => {
  state.followed = !state.followed;
  saveState();
  renderFollowState();
  showToast(state.followed ? "You are now following Sow Your Seed." : "You unfollowed Sow Your Seed.");
});

if (elements.copyReceiptButton) {
  elements.copyReceiptButton.addEventListener("click", () => {
    copyText(currentReceiptText, "Fortune copied.");
  });
}

elements.meterShareButton.addEventListener("click", () => {
  copyText(window.location.href.split("#")[0], "Page link copied.");
});

elements.backPaymentButton.addEventListener("click", closePaymentDialog);
elements.paymentDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePaymentDialog();
});
elements.paymentDialog.addEventListener("close", () => {
  window.clearTimeout(paymentCloseTimer);
  document.body.classList.remove("payment-open");
  elements.paymentDialog.classList.remove("is-open", "is-closing");
  pendingDonation = null;
});

elements.adminMenuButton.addEventListener("click", openAdminLogin);
elements.adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isBackendConfigured()) {
    const email = elements.adminEmailInput.value.trim();
    const password = elements.adminPasswordInput.value;

    if (!email || !password) {
      elements.adminPasswordError.textContent = "Enter your admin email and password.";
      return;
    }

    try {
      await signInAdmin(email, password);
      await loadAdminProfile();
      closeAdminLogin();
      openAdminPanel();
      await loadAdminDonations({ announce: true });
      await loadAdminAnalytics({ announce: true });
    } catch (error) {
      elements.adminPasswordError.textContent = error.message || "Could not sign in.";
      elements.adminPasswordInput.select();
    }

    return;
  }

  if (elements.adminPasswordInput.value !== ADMIN_PASSWORD) {
    elements.adminPasswordError.textContent = "Incorrect password.";
    elements.adminPasswordInput.select();
    return;
  }

  closeAdminLogin();
  openAdminPanel();
});
elements.cancelAdminLoginButton.addEventListener("click", closeAdminLogin);
elements.adminLoginDialog.addEventListener("close", () => {
  elements.adminLoginDialog.classList.remove("is-open");
  elements.adminPasswordError.textContent = "";
});
elements.closeAdminButton.addEventListener("click", closeAdminPanel);
elements.adminBackdrop.addEventListener("click", closeAdminPanel);
elements.adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nextSettings = getAdminSettings();
  const changedCount = getSettingsChangeCount(state.settings, nextSettings);
  const successMessage = changedCount
    ? `Saved ${changedCount} setting${changedCount === 1 ? "" : "s"}. Page preview refreshed.`
    : "No setting changes found. Page preview refreshed.";

  await runAdminAction(
    {
      button: elements.saveAdminButton,
      busyText: "Saving...",
      loadingMessage: "Saving page settings and refreshing preview...",
      successMessage,
      errorMessage: "Could not save admin settings.",
    },
    async () => {
      if (isBackendConfigured() && getAdminAccessToken()) {
        const payload = await callEdge("admin-settings", {
          admin: true,
          body: { settings: nextSettings },
          method: "PUT",
        });
        state.settings = normalizeSettings(payload.settings || nextSettings);
        await loadBackendData();
      } else {
        state.settings = nextSettings;
        saveState();
      }

      setAmount(state.settings.amountOptions[0] || state.settings.seedPrice);
      renderApp();
    },
  );
});
elements.resetAdminButton.addEventListener("click", async () => {
  const defaults = cloneDefaultSettings();

  await runAdminAction(
    {
      button: elements.resetAdminButton,
      busyText: "Resetting...",
      loadingMessage: "Restoring default settings and refreshing preview...",
      successMessage: "Defaults restored. Page preview refreshed.",
      errorMessage: "Could not reset admin settings.",
    },
    async () => {
      if (isBackendConfigured() && getAdminAccessToken()) {
        const payload = await callEdge("admin-settings", {
          admin: true,
          body: { settings: defaults },
          method: "PUT",
        });
        state.settings = normalizeSettings(payload.settings || defaults);
        await loadBackendData();
      } else {
        state.settings = defaults;
        saveState();
      }

      setAmount(state.settings.amountOptions[0]);
      renderApp();
    },
  );
});

elements.closeReceiptButton.addEventListener("click", closeReceipt);
elements.doneButton.addEventListener("click", closeReceipt);
elements.receiptDialog.addEventListener("close", () => {
  document.body.classList.remove("receipt-open");
});
elements.closeFortuneNumberButton.addEventListener("click", closeFortuneNumberDialog);
elements.fortuneNumberDoneButton.addEventListener("click", closeFortuneNumberDialog);
elements.fortuneNumberDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeFortuneNumberDialog();
});
elements.fortuneNumberDialog.addEventListener("close", () => {
  document.body.classList.remove("fortune-number-open");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("admin-open")) {
    closeAdminPanel();
  }
});

window.addEventListener("hashchange", () => {
  if (window.location.hash === "#admin") return;
  setActiveView(getViewIdFromHash());
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
  initializeApp();
}
