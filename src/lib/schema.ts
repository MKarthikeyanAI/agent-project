import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uuid,
  numeric,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// IMPORTANT! ID fields should ALWAYS use UUID types, EXCEPT the BetterAuth tables.

// ─── BetterAuth Tables ────────────────────────────────────────────────────────

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_account_idx").on(table.providerId, table.accountId),
  ]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Finance Enums ────────────────────────────────────────────────────────────

export const assetTypeEnum = pgEnum("asset_type", [
  "stock",
  "etf",
  "mutual_fund",
  "crypto",
  "bond",
  "reit",
  "cash",
  "other",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "buy",
  "sell",
  "dividend",
  "split",
]);

export const portfolioTypeEnum = pgEnum("portfolio_type", [
  "long_term",
  "short_term",
  "intraday",
  "mixed",
]);

export const goalTypeEnum = pgEnum("goal_type", [
  "retirement",
  "emergency_fund",
  "home_purchase",
  "education",
  "travel",
  "custom",
]);

// ─── Finance Tables ───────────────────────────────────────────────────────────

export const riskProfiles = pgTable(
  "risk_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    riskScore: integer("risk_score").notNull(), // 1–10
    investmentHorizon: text("investment_horizon").notNull(), // "short" | "medium" | "long"
    monthlyIncome: numeric("monthly_income", { precision: 15, scale: 2 }),
    monthlyInvestment: numeric("monthly_investment", { precision: 15, scale: 2 }),
    answers: text("answers").notNull(), // JSON string
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("risk_profiles_user_id_idx").on(table.userId)]
);

export const portfolios = pgTable(
  "portfolios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: portfolioTypeEnum("type").notNull().default("long_term"),
    currency: text("currency").notNull().default("USD"),
    description: text("description"),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("portfolios_user_id_idx").on(table.userId)]
);

export const holdings = pgTable(
  "holdings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => portfolios.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    name: text("name").notNull(),
    assetType: assetTypeEnum("asset_type").notNull().default("stock"),
    quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
    avgCostBasis: numeric("avg_cost_basis", { precision: 15, scale: 4 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("holdings_portfolio_id_idx").on(table.portfolioId),
    index("holdings_ticker_idx").on(table.ticker),
  ]
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    holdingId: uuid("holding_id")
      .notNull()
      .references(() => holdings.id, { onDelete: "cascade" }),
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => portfolios.id, { onDelete: "cascade" }),
    type: transactionTypeEnum("type").notNull(),
    ticker: text("ticker").notNull(),
    quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
    price: numeric("price", { precision: 15, scale: 4 }).notNull(),
    fees: numeric("fees", { precision: 10, scale: 2 }).default("0"),
    date: timestamp("date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transactions_holding_id_idx").on(table.holdingId),
    index("transactions_portfolio_id_idx").on(table.portfolioId),
    index("transactions_date_idx").on(table.date),
  ]
);

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    name: text("name").notNull(),
    assetType: assetTypeEnum("asset_type").notNull().default("stock"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("watchlist_user_id_idx").on(table.userId)]
);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: goalTypeEnum("type").notNull(),
    name: text("name").notNull(),
    targetAmount: numeric("target_amount", { precision: 15, scale: 2 }).notNull(),
    currentAmount: numeric("current_amount", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    targetDate: timestamp("target_date"),
    monthlySIP: numeric("monthly_sip", { precision: 15, scale: 2 }),
    expectedReturn: numeric("expected_return", { precision: 5, scale: 2 }).default("7"), // annual %
    currency: text("currency").notNull().default("USD"),
    isCompleted: boolean("is_completed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("goals_user_id_idx").on(table.userId)]
);

export const goalContributions = pgTable(
  "goal_contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("goal_contributions_goal_id_idx").on(table.goalId)]
);
