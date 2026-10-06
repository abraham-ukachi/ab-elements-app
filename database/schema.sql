-- =============================================================================
--  AbElements (ab-elements-app) - MySQL 8 schema
-- =============================================================================
--  Target   : MySQL 8.0.16+ / 8.4 LTS (InnoDB, utf8mb4) and MySQL-compatible
--             serverless providers on Vercel (TiDB Cloud Starter recommended,
--             PlanetScale Vitess supported - see database/README.md).
--  Status   : DESIGN ONLY - not applied anywhere yet. Create it on Vercel later.
--  Author   : Abraham Ukachi
--  License  : MIT
--
--  Conventions
--  - Every table: ENGINE=InnoDB, utf8mb4 / utf8mb4_0900_ai_ci (case-insensitive,
--    so emails/usernames/slugs are unique regardless of case).
--  - Surrogate keys: BIGINT UNSIGNED AUTO_INCREMENT (INT/SMALLINT for small
--    lookup tables). Public-facing user id: users.public_id (ULID, CHAR(26)).
--  - All timestamps are DATETIME(3) and stored in UTC by the app.
--  - Secrets are NEVER stored in clear text: session/magic-link/reset tokens are
--    stored as SHA-256 digests (BINARY(32)); passwords as argon2id hashes; OAuth
--    tokens encrypted by the app (VARBINARY) before insert.
--  - Foreign keys are explicit, named, and carry ON DELETE rules:
--      CASCADE  -> data owned by the parent (a user's sessions, bookmarks, ...)
--      SET NULL -> history we keep anonymised (audit logs, feedback, ...)
--      RESTRICT -> catalogue integrity (cannot drop a package with versions)
--  - No FULLTEXT indexes in the portable part (TiDB/PlanetScale differ); an
--    optional MySQL-only FULLTEXT index is at the very bottom, commented out.
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- CREATE DATABASE IF NOT EXISTS ab_elements
--   DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;
-- USE ab_elements;


-- =============================================================================
-- 1. LOOKUPS
-- =============================================================================

-- Languages offered in Settings > Docs preferences > Language (ab-nextjs-i18n).
CREATE TABLE locales (
  code          VARCHAR(16)   NOT NULL,                 -- BCP-47, e.g. 'en-US', 'fr-FR'
  english_name  VARCHAR(64)   NOT NULL,                 -- 'English (US)'
  native_name   VARCHAR(64)   NOT NULL,                 -- 'Français'
  is_rtl        TINYINT(1)    NOT NULL DEFAULT 0,
  is_enabled    TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order    SMALLINT      NOT NULL DEFAULT 0,
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO locales (code, english_name, native_name, sort_order) VALUES
  ('en-US', 'English (US)', 'English (US)', 1),
  ('fr-FR', 'French',       'Français',     2),
  ('es-ES', 'Spanish',      'Español',      3),
  ('ru-RU', 'Russian',      'Русский',      4);


-- =============================================================================
-- 2. IDENTITY & AUTH  (Login, Register, Magic link, GitHub OAuth, Profile)
-- =============================================================================

-- One row per human. Auth methods hang off it (passwords, oauth_accounts).
CREATE TABLE users (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id          CHAR(26)        NOT NULL,           -- ULID used in URLs/cookies/API
  email              VARCHAR(320)    NOT NULL,           -- primary email (Profile > Connected accounts > Email)
  email_verified_at  DATETIME(3)         NULL,           -- 'Verified' badge in Settings > Account
  username           VARCHAR(39)         NULL,           -- '@abrahamukachi' (GitHub max length = 39)
  role               ENUM('user','editor','admin') NOT NULL DEFAULT 'user',
  status             ENUM('active','locked','disabled','deleted') NOT NULL DEFAULT 'active',
  terms_accepted_at  DATETIME(3)         NULL,           -- Register: 'I agree to the Terms and Privacy Policy'
  last_sign_in_at    DATETIME(3)         NULL,
  created_at         DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),   -- 'Joined Sep 2026'
  updated_at         DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at         DATETIME(3)         NULL,           -- soft delete window before hard delete
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_public_id (public_id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username),
  KEY ix_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Public-ish profile data (Profile screen header).
CREATE TABLE profiles (
  user_id        BIGINT UNSIGNED NOT NULL,
  display_name   VARCHAR(100)    NOT NULL,               -- 'Abraham Ukachi' (Register > Name)
  initials       VARCHAR(4)          NULL,               -- 'AU' avatar fallback (computed by app)
  avatar_url     VARCHAR(2048)       NULL,
  avatar_source  ENUM('initials','github','upload') NOT NULL DEFAULT 'initials',
  bio            VARCHAR(280)        NULL,
  website_url    VARCHAR(2048)       NULL,
  location       VARCHAR(100)        NULL,
  timezone       VARCHAR(64)         NULL,               -- IANA, e.g. 'Europe/Paris'
  created_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Email + password credential (optional: magic-link/GitHub-only users have no row).
CREATE TABLE user_passwords (
  user_id              BIGINT UNSIGNED NOT NULL,
  password_hash        VARCHAR(255)    NOT NULL,         -- argon2id (or bcrypt) PHC string
  hash_algorithm       VARCHAR(32)     NOT NULL DEFAULT 'argon2id',
  password_changed_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),  -- 'Last changed 3 months ago'
  failed_attempts      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until         DATETIME(3)         NULL,         -- brute-force lockout
  created_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_passwords_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- External identity providers ('Continue with GitHub'). Built for more providers later.
CREATE TABLE oauth_accounts (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id               BIGINT UNSIGNED NOT NULL,
  provider              VARCHAR(32)     NOT NULL,        -- 'github'
  provider_account_id   VARCHAR(191)    NOT NULL,        -- GitHub numeric user id (stable)
  provider_username     VARCHAR(100)        NULL,        -- '@abrahamukachi' shown on Profile
  provider_email        VARCHAR(320)        NULL,
  provider_avatar_url   VARCHAR(2048)       NULL,
  access_token_enc      VARBINARY(1024)     NULL,        -- app-encrypted (AES-GCM), never plain
  refresh_token_enc     VARBINARY(1024)     NULL,
  token_type            VARCHAR(32)         NULL,
  scope                 VARCHAR(512)        NULL,        -- e.g. 'read:user user:email'
  access_token_expires_at DATETIME(3)       NULL,
  linked_at             DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_used_at          DATETIME(3)         NULL,
  updated_at            DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_oauth_provider_account (provider, provider_account_id),
  UNIQUE KEY uq_oauth_user_provider (user_id, provider),
  CONSTRAINT fk_oauth_accounts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Server-side sessions (opaque cookie -> SHA-256 digest here). 'Sign out' revokes one row.
CREATE TABLE sessions (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  token_hash    BINARY(32)      NOT NULL,                -- SHA-256(session token)
  auth_method   ENUM('password','magic_link','github') NOT NULL,  -- Profile aside: 'Signed in with GitHub'
  ip_address    VARBINARY(16)       NULL,                -- INET6_ATON()
  user_agent    VARCHAR(512)        NULL,
  device_label  VARCHAR(100)        NULL,                -- 'Chrome on macOS', 'AbElements PWA (iOS)'
  created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_seen_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at    DATETIME(3)     NOT NULL,
  revoked_at    DATETIME(3)         NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token_hash (token_hash),
  KEY ix_sessions_user (user_id, revoked_at),
  KEY ix_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Single-use, short-lived tokens: magic-link sign-in/sign-up, email verification,
-- password reset ('Forgot password?') and email change (Settings > Account > Change).
CREATE TABLE auth_tokens (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED     NULL,                -- NULL for sign-up links (user not created yet)
  email         VARCHAR(320)    NOT NULL,                -- where the link was sent
  purpose       ENUM('magic_sign_in','magic_sign_up','email_verification','password_reset','email_change') NOT NULL,
  token_hash    BINARY(32)      NOT NULL,                -- SHA-256(token in the emailed URL)
  payload       JSON                NULL,                -- e.g. {"name":"Ada Lovelace"} or {"new_email":"..."}
  redirect_to   VARCHAR(2048)       NULL,                -- where to land after success (validated relative path)
  requested_ip  VARBINARY(16)       NULL,
  user_agent    VARCHAR(512)        NULL,
  created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at    DATETIME(3)     NOT NULL,                -- magic links: +15 min (per Login mock copy)
  consumed_at   DATETIME(3)         NULL,                -- single use
  PRIMARY KEY (id),
  UNIQUE KEY uq_auth_tokens_hash (token_hash),
  KEY ix_auth_tokens_email_purpose (email, purpose, created_at),
  KEY ix_auth_tokens_user (user_id),
  KEY ix_auth_tokens_expires (expires_at),
  CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =============================================================================
-- 3. SETTINGS & PREFERENCES  (Settings screen, synced across devices)
-- =============================================================================

CREATE TABLE user_settings (
  user_id                  BIGINT UNSIGNED NOT NULL,
  theme                    ENUM('system','light','dark') NOT NULL DEFAULT 'system',  -- Appearance > Theme
  accent_color             VARCHAR(32)     NOT NULL DEFAULT 'primary', -- ab-nextjs-theme accent key (6 swatches)
  density                  ENUM('compact','comfortable') NOT NULL DEFAULT 'comfortable',
  font_size_px             TINYINT UNSIGNED NOT NULL DEFAULT 16,       -- 14 | 15 | 16 | 18
  reduced_motion           TINYINT(1)          NULL,                   -- NULL = follow OS prefers-reduced-motion
  always_show_focus_rings  TINYINT(1)      NOT NULL DEFAULT 0,         -- Accessibility
  package_manager          ENUM('pnpm','npm','yarn','bun') NOT NULL DEFAULT 'pnpm',  -- install snippets
  locale_code              VARCHAR(16)     NOT NULL DEFAULT 'en-US',   -- Docs preferences > Language
  docs_version_id          INT UNSIGNED        NULL,                   -- 'Docs v1.x' selector (NULL = default)
  sidebar_collapsed        TINYINT(1)      NOT NULL DEFAULT 0,         -- '<<' / '>>' rail state
  settings_version         INT UNSIGNED    NOT NULL DEFAULT 1,         -- optimistic concurrency for sync
  created_at               DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at               DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id),
  KEY ix_user_settings_locale (locale_code),
  KEY ix_user_settings_docs_version (docs_version_id),
  CONSTRAINT ck_user_settings_font_size CHECK (font_size_px IN (14, 15, 16, 18)),
  CONSTRAINT fk_user_settings_user   FOREIGN KEY (user_id)     REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT fk_user_settings_locale FOREIGN KEY (locale_code) REFERENCES locales (code) ON UPDATE CASCADE
  -- fk to doc_versions is added after that table is created (see section 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Settings > Notifications ('What's new emails') + legally required mail toggles.
CREATE TABLE email_preferences (
  user_id                   BIGINT UNSIGNED NOT NULL,
  whats_new_digest          TINYINT(1)      NOT NULL DEFAULT 1,       -- monthly digest of releases & guides
  digest_frequency          ENUM('weekly','monthly') NOT NULL DEFAULT 'monthly',
  product_announcements     TINYINT(1)      NOT NULL DEFAULT 0,
  security_alerts           TINYINT(1)      NOT NULL DEFAULT 1,       -- new sign-in, password changed (recommended always on)
  unsubscribe_token_hash    BINARY(32)          NULL,                 -- one-click List-Unsubscribe
  unsubscribed_all_at       DATETIME(3)         NULL,
  updated_at                DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_email_prefs_unsub (unsubscribe_token_hash),
  CONSTRAINT fk_email_preferences_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =============================================================================
-- 4. CATALOGUE: packages, versions, elements  (Home, Docs, Changelog)
-- =============================================================================

-- The npm packages documented by AbElements (fonts, icons, animations, theme,
-- hooks, core, components ... and the upcoming i18n).
CREATE TABLE packages (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  slug            VARCHAR(64)     NOT NULL,              -- 'components' -> /docs/components
  npm_name        VARCHAR(214)    NOT NULL,              -- 'ab-nextjs-components'
  display_name    VARCHAR(64)     NOT NULL,              -- 'Components'
  framework       ENUM('nextjs','react','vue','lit','flutter') NOT NULL DEFAULT 'nextjs',
  tagline         VARCHAR(160)        NULL,              -- card copy on Home
  description     TEXT                NULL,
  icon_name       VARCHAR(64)         NULL,              -- ab-nextjs-icons name for the sidebar/card
  github_repo     VARCHAR(140)        NULL,              -- 'abraham-ukachi/ab-nextjs-components'
  default_branch  VARCHAR(64)     NOT NULL DEFAULT 'main',
  status          ENUM('planned','pending','beta','stable','deprecated') NOT NULL DEFAULT 'pending',
  latest_version  VARCHAR(32)         NULL,              -- denormalised from package_versions
  sort_order      SMALLINT        NOT NULL DEFAULT 0,
  is_published    TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_packages_slug (framework, slug),
  UNIQUE KEY uq_packages_npm_name (npm_name),
  KEY ix_packages_sort (is_published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Released versions per package (version badges, 'v1.x' lines, Changelog, What's new).
CREATE TABLE package_versions (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  package_id          INT UNSIGNED    NOT NULL,
  version             VARCHAR(32)     NOT NULL,          -- semver '0.1.4'
  release_line        VARCHAR(16)     NOT NULL,          -- 'v0.x', 'v1.x'
  channel             ENUM('latest','beta','next','canary') NOT NULL DEFAULT 'latest',
  is_latest           TINYINT(1)      NOT NULL DEFAULT 0,
  git_tag             VARCHAR(64)         NULL,
  changelog_md        MEDIUMTEXT          NULL,
  next_peer_range     VARCHAR(64)         NULL,          -- e.g. '16.3.4' / '^16' (compat matrix)
  react_peer_range    VARCHAR(64)         NULL,
  deprecated_message  VARCHAR(255)        NULL,
  released_at         DATETIME(3)     NOT NULL,
  created_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_package_versions (package_id, version),
  KEY ix_package_versions_latest (package_id, is_latest),
  KEY ix_package_versions_released (released_at),
  CONSTRAINT fk_package_versions_package FOREIGN KEY (package_id) REFERENCES packages (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Everything a package exports: components (client/server), layouts, hooks,
-- icons/icon sets, animations, fonts, theme tokens, helpers, providers.
CREATE TABLE elements (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  package_id      INT UNSIGNED    NOT NULL,
  slug            VARCHAR(100)    NOT NULL,              -- 'button' -> /docs/components/button
  name            VARCHAR(100)    NOT NULL,              -- 'Button' (display)
  export_name     VARCHAR(100)    NOT NULL,              -- 'AbButton', 'useAbTheme', 'popIn'
  kind            ENUM('component','layout','hook','helper','provider','icon','icon_set','animation','font','theme_token','type') NOT NULL,
  rendering       ENUM('client','server','universal') NOT NULL DEFAULT 'universal',  -- 'client' chip on Docs header
  import_path     VARCHAR(255)    NOT NULL,              -- 'ab-nextjs-components/ab-button'
  source_path     VARCHAR(255)        NULL,              -- 'ab-button/index.tsx' (GitHub 'Source' link)
  summary         VARCHAR(500)        NULL,
  status          ENUM('pending','beta','stable','deprecated') NOT NULL DEFAULT 'stable',
  since_version   VARCHAR(32)         NULL,
  sort_order      SMALLINT        NOT NULL DEFAULT 0,
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_elements_export (package_id, export_name, rendering),
  KEY ix_elements_slug (package_id, slug),
  KEY ix_elements_kind (kind),
  CONSTRAINT fk_elements_package FOREIGN KEY (package_id) REFERENCES packages (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Props table on element docs + the 'PROPS' group in Cmd/Ctrl+K.
CREATE TABLE element_props (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  element_id      BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(100)    NOT NULL,              -- 'variant'
  type_signature  VARCHAR(1024)   NOT NULL,              -- '"filled" | "tonal" | "outlined" | "text"'
  default_value   VARCHAR(255)        NULL,              -- '"filled"'
  is_required     TINYINT(1)      NOT NULL DEFAULT 0,
  description     VARCHAR(1000)       NULL,
  deprecated      TINYINT(1)      NOT NULL DEFAULT 0,
  sort_order      SMALLINT        NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_element_props (element_id, name),
  CONSTRAINT fk_element_props_element FOREIGN KEY (element_id) REFERENCES elements (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Live Preview / Code tabs and Usage snippets ('toolbar.tsx').
CREATE TABLE element_examples (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  element_id      BIGINT UNSIGNED NOT NULL,
  slug            VARCHAR(100)    NOT NULL,              -- 'with-an-icon'
  title           VARCHAR(150)    NOT NULL,              -- 'With an icon'
  filename        VARCHAR(150)        NULL,              -- 'toolbar.tsx'
  language        VARCHAR(32)     NOT NULL DEFAULT 'tsx',
  code            MEDIUMTEXT      NOT NULL,
  preview_key     VARCHAR(150)        NULL,              -- key into the app's live-preview registry
  sort_order      SMALLINT        NOT NULL DEFAULT 0,
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_element_examples (element_id, slug),
  CONSTRAINT fk_element_examples_element FOREIGN KEY (element_id) REFERENCES elements (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =============================================================================
-- 5. DOCS CONTENT  (Docs sidebar, pages, On This Page, Related, Redirects)
-- =============================================================================

-- 'Docs v1.x' version switcher.
CREATE TABLE doc_versions (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  label         VARCHAR(16)     NOT NULL,                -- 'v1.x'
  slug          VARCHAR(16)     NOT NULL,                -- 'v1'
  status        ENUM('next','current','legacy','archived') NOT NULL DEFAULT 'current',
  is_default    TINYINT(1)      NOT NULL DEFAULT 0,
  released_at   DATETIME(3)         NULL,
  created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_doc_versions_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE user_settings
  ADD CONSTRAINT fk_user_settings_docs_version
  FOREIGN KEY (docs_version_id) REFERENCES doc_versions (id) ON DELETE SET NULL;

-- Sidebar groups: 'Getting started', 'Packages', 'Guides', 'Account'.
CREATE TABLE doc_sections (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  doc_version_id  INT UNSIGNED    NOT NULL,
  slug            VARCHAR(64)     NOT NULL,
  title           VARCHAR(100)    NOT NULL,
  requires_auth   TINYINT(1)      NOT NULL DEFAULT 0,    -- 'Account' group only when signed in
  sort_order      SMALLINT        NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doc_sections (doc_version_id, slug),
  CONSTRAINT fk_doc_sections_version FOREIGN KEY (doc_version_id) REFERENCES doc_versions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Every docs page: guides (Introduction, Installation, Theming & dark mode, PWA shell),
-- package overviews, element pages (Button, Card, ...), changelog.
-- Content stays in MDX (git); this table is the index/metadata.
CREATE TABLE doc_pages (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  doc_version_id   INT UNSIGNED    NOT NULL,
  section_id       INT UNSIGNED        NULL,
  parent_id        BIGINT UNSIGNED     NULL,             -- Components > Button (nested sidebar)
  package_id       INT UNSIGNED        NULL,
  element_id       BIGINT UNSIGNED     NULL,
  kind             ENUM('guide','package','element','reference','changelog','page') NOT NULL DEFAULT 'guide',
  slug             VARCHAR(100)    NOT NULL,
  path             VARCHAR(255)    NOT NULL,             -- '/docs/components/button'
  title            VARCHAR(150)    NOT NULL,
  description      VARCHAR(500)        NULL,             -- lead paragraph + <meta description>
  icon_name        VARCHAR(64)         NULL,
  mdx_source_path  VARCHAR(255)        NULL,             -- e.g. 'pop-in/page.mdx' in ab-nextjs-animations
  content_hash     BINARY(32)          NULL,             -- re-index only when MDX changes
  edit_url         VARCHAR(2048)       NULL,             -- 'Edit this page'
  source_url       VARCHAR(2048)       NULL,             -- 'View source'
  sort_order       SMALLINT        NOT NULL DEFAULT 0,
  is_published     TINYINT(1)      NOT NULL DEFAULT 1,
  published_at     DATETIME(3)         NULL,
  created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_doc_pages_path (doc_version_id, path),
  KEY ix_doc_pages_section (section_id, sort_order),
  KEY ix_doc_pages_parent (parent_id),
  KEY ix_doc_pages_package (package_id),
  KEY ix_doc_pages_element (element_id),
  CONSTRAINT fk_doc_pages_version FOREIGN KEY (doc_version_id) REFERENCES doc_versions (id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_pages_section FOREIGN KEY (section_id)     REFERENCES doc_sections (id) ON DELETE SET NULL,
  CONSTRAINT fk_doc_pages_parent  FOREIGN KEY (parent_id)      REFERENCES doc_pages (id)    ON DELETE SET NULL,
  CONSTRAINT fk_doc_pages_package FOREIGN KEY (package_id)     REFERENCES packages (id)     ON DELETE SET NULL,
  CONSTRAINT fk_doc_pages_element FOREIGN KEY (element_id)     REFERENCES elements (id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 'On this page' table of contents + deep-link search hits.
CREATE TABLE doc_headings (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  page_id     BIGINT UNSIGNED NOT NULL,
  parent_id   BIGINT UNSIGNED     NULL,                  -- h3 under h2 (Preview > Variants)
  anchor      VARCHAR(150)    NOT NULL,                  -- 'preview'
  text        VARCHAR(255)    NOT NULL,
  level       TINYINT UNSIGNED NOT NULL,                 -- 2..4
  sort_order  SMALLINT        NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doc_headings (page_id, anchor),
  KEY ix_doc_headings_parent (parent_id),
  CONSTRAINT fk_doc_headings_page   FOREIGN KEY (page_id)   REFERENCES doc_pages (id)    ON DELETE CASCADE,
  CONSTRAINT fk_doc_headings_parent FOREIGN KEY (parent_id) REFERENCES doc_headings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 'Related' card in the docs aside (Chip, BottomNav, Theme tokens).
CREATE TABLE doc_page_relations (
  page_id          BIGINT UNSIGNED NOT NULL,
  related_page_id  BIGINT UNSIGNED NOT NULL,
  sort_order       SMALLINT        NOT NULL DEFAULT 0,
  PRIMARY KEY (page_id, related_page_id),
  KEY ix_doc_page_relations_related (related_page_id),
  CONSTRAINT fk_doc_rel_page    FOREIGN KEY (page_id)         REFERENCES doc_pages (id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_rel_related FOREIGN KEY (related_page_id) REFERENCES doc_pages (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 404 'Did you mean /docs/components/button?' + permanent redirects for moved docs.
CREATE TABLE redirects (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  from_path     VARCHAR(255)    NOT NULL,
  to_path       VARCHAR(255)    NOT NULL,
  status_code   SMALLINT UNSIGNED NOT NULL DEFAULT 308,
  is_suggestion TINYINT(1)      NOT NULL DEFAULT 0,      -- 1 = only suggest on 404, do not auto-redirect
  hits          INT UNSIGNED    NOT NULL DEFAULT 0,
  last_hit_at   DATETIME(3)         NULL,
  created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_redirects_from (from_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Aggregated views ('Popular pages' on 404, ordering suggestions). Updated by a cron/job.
CREATE TABLE doc_page_stats (
  page_id         BIGINT UNSIGNED NOT NULL,
  views_total     BIGINT UNSIGNED NOT NULL DEFAULT 0,
  views_7d        INT UNSIGNED    NOT NULL DEFAULT 0,
  views_30d       INT UNSIGNED    NOT NULL DEFAULT 0,
  bookmarks_count INT UNSIGNED    NOT NULL DEFAULT 0,
  helpful_yes     INT UNSIGNED    NOT NULL DEFAULT 0,
  helpful_no      INT UNSIGNED    NOT NULL DEFAULT 0,
  last_viewed_at  DATETIME(3)         NULL,
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (page_id),
  KEY ix_doc_page_stats_popular (views_7d),
  CONSTRAINT fk_doc_page_stats_page FOREIGN KEY (page_id) REFERENCES doc_pages (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =============================================================================
-- 6. SEARCH, BOOKMARKS, HISTORY  (Cmd/Ctrl+K, Profile)
-- =============================================================================

-- Denormalised search documents for Cmd/Ctrl+K (packages, elements, props,
-- pages, headings, guides). Rebuilt at deploy time from the catalogue + MDX.
CREATE TABLE search_documents (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  doc_version_id  INT UNSIGNED    NOT NULL,
  entity_type     ENUM('package','element','prop','page','heading','guide') NOT NULL,
  entity_id       BIGINT UNSIGNED NOT NULL,              -- id in its own table (polymorphic, no FK)
  page_id         BIGINT UNSIGNED     NULL,              -- the page the hit opens
  title           VARCHAR(255)    NOT NULL,              -- 'Button' / 'Button > variant'
  breadcrumb      VARCHAR(255)        NULL,              -- 'Packages > Components'
  url             VARCHAR(512)    NOT NULL,              -- '/docs/components/button#props'
  keywords        VARCHAR(1024)       NULL,
  excerpt         TEXT                NULL,
  weight          SMALLINT        NOT NULL DEFAULT 0,    -- ranking boost
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_search_documents_entity (doc_version_id, entity_type, entity_id),
  KEY ix_search_documents_title (title),
  KEY ix_search_documents_page (page_id),
  CONSTRAINT fk_search_documents_version FOREIGN KEY (doc_version_id) REFERENCES doc_versions (id) ON DELETE CASCADE,
  CONSTRAINT fk_search_documents_page    FOREIGN KEY (page_id)        REFERENCES doc_pages (id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 'Recent searches' chips (+ Clear) in Cmd/Ctrl+K and search analytics.
CREATE TABLE search_queries (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id           BIGINT UNSIGNED     NULL,            -- NULL = signed-out visitor
  anon_id           CHAR(26)            NULL,            -- device ULID cookie for signed-out recents
  query             VARCHAR(255)    NOT NULL,
  scope             ENUM('all','components','props','guides','packages') NOT NULL DEFAULT 'all',  -- 'All docs' filter
  source            ENUM('cmdk','searchbar','not_found') NOT NULL DEFAULT 'cmdk',
  results_count     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  selected_url      VARCHAR(512)        NULL,            -- what the user opened (Enter)
  selected_doc_id   BIGINT UNSIGNED     NULL,            -- search_documents.id
  cleared_at        DATETIME(3)         NULL,            -- 'Clear' hides it from recents, keeps analytics
  created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_search_queries_user (user_id, cleared_at, created_at),
  KEY ix_search_queries_anon (anon_id, created_at),
  KEY ix_search_queries_created (created_at),
  CONSTRAINT fk_search_queries_user FOREIGN KEY (user_id)         REFERENCES users (id)            ON DELETE CASCADE,
  CONSTRAINT fk_search_queries_doc  FOREIGN KEY (selected_doc_id) REFERENCES search_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Profile > 'Bookmarked docs' / 'All bookmarks' (a.k.a. favorites).
CREATE TABLE bookmarks (
  user_id     BIGINT UNSIGNED NOT NULL,
  page_id     BIGINT UNSIGNED NOT NULL,
  note        VARCHAR(280)        NULL,
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, page_id),
  KEY ix_bookmarks_user_created (user_id, created_at),
  KEY ix_bookmarks_page (page_id),
  CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users (id)     ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_page FOREIGN KEY (page_id) REFERENCES doc_pages (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Profile > 'Recently viewed' ('2h ago', 'Yesterday') + Clear. One row per user/page (upsert).
CREATE TABLE recently_viewed (
  user_id          BIGINT UNSIGNED NOT NULL,
  page_id          BIGINT UNSIGNED NOT NULL,
  view_count       INT UNSIGNED    NOT NULL DEFAULT 1,
  first_viewed_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_viewed_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, page_id),
  KEY ix_recently_viewed_user_last (user_id, last_viewed_at),
  KEY ix_recently_viewed_page (page_id),
  CONSTRAINT fk_recently_viewed_user FOREIGN KEY (user_id) REFERENCES users (id)     ON DELETE CASCADE,
  CONSTRAINT fk_recently_viewed_page FOREIGN KEY (page_id) REFERENCES doc_pages (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =============================================================================
-- 7. COMMUNICATION, FEEDBACK & AUDIT
-- =============================================================================

-- Home aside 'New: BottomNav & Sheet' card, Changelog highlights, digest content.
CREATE TABLE announcements (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  badge               VARCHAR(16)     NOT NULL DEFAULT 'New',
  title               VARCHAR(150)    NOT NULL,
  body                VARCHAR(500)        NULL,
  url                 VARCHAR(512)        NULL,
  package_id          INT UNSIGNED        NULL,
  package_version_id  BIGINT UNSIGNED     NULL,
  starts_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ends_at             DATETIME(3)         NULL,
  include_in_digest   TINYINT(1)      NOT NULL DEFAULT 1,
  created_by          BIGINT UNSIGNED     NULL,
  created_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_announcements_active (starts_at, ends_at),
  KEY ix_announcements_package (package_id),
  KEY ix_announcements_version (package_version_id),
  KEY ix_announcements_created_by (created_by),
  CONSTRAINT fk_announcements_package FOREIGN KEY (package_id)         REFERENCES packages (id)         ON DELETE SET NULL,
  CONSTRAINT fk_announcements_version FOREIGN KEY (package_version_id) REFERENCES package_versions (id) ON DELETE SET NULL,
  CONSTRAINT fk_announcements_author  FOREIGN KEY (created_by)         REFERENCES users (id)            ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Outbound transactional + digest email log (magic links, resets, digests). No bodies stored.
CREATE TABLE email_deliveries (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id              BIGINT UNSIGNED     NULL,
  to_email             VARCHAR(320)    NOT NULL,
  template             ENUM('magic_sign_in','magic_sign_up','email_verification','password_reset','email_change','password_changed','new_sign_in','whats_new_digest','account_deleted') NOT NULL,
  auth_token_id        BIGINT UNSIGNED     NULL,
  provider             VARCHAR(32)         NULL,         -- 'resend', 'postmark', ...
  provider_message_id  VARCHAR(191)        NULL,
  status               ENUM('queued','sent','delivered','bounced','complained','failed') NOT NULL DEFAULT 'queued',
  error                VARCHAR(500)        NULL,
  created_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  sent_at              DATETIME(3)         NULL,
  PRIMARY KEY (id),
  KEY ix_email_deliveries_user (user_id, created_at),
  KEY ix_email_deliveries_token (auth_token_id),
  KEY ix_email_deliveries_provider_msg (provider_message_id),
  CONSTRAINT fk_email_deliveries_user  FOREIGN KEY (user_id)       REFERENCES users (id)       ON DELETE SET NULL,
  CONSTRAINT fk_email_deliveries_token FOREIGN KEY (auth_token_id) REFERENCES auth_tokens (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 'Report an issue', 'Report a broken link' (404), page helpfulness votes.
CREATE TABLE feedback (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id           BIGINT UNSIGNED     NULL,
  page_id           BIGINT UNSIGNED     NULL,
  kind              ENUM('broken_link','issue','helpful','not_helpful','suggestion') NOT NULL,
  path              VARCHAR(512)    NOT NULL,            -- where it was sent from (404 path included)
  message           TEXT                NULL,
  contact_email     VARCHAR(320)        NULL,
  github_issue_url  VARCHAR(512)        NULL,            -- when triaged into GitHub
  status            ENUM('new','triaged','resolved','spam') NOT NULL DEFAULT 'new',
  user_agent        VARCHAR(512)        NULL,
  created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_feedback_status (status, created_at),
  KEY ix_feedback_page (page_id),
  KEY ix_feedback_user (user_id),
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users (id)     ON DELETE SET NULL,
  CONSTRAINT fk_feedback_page FOREIGN KEY (page_id) REFERENCES doc_pages (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Security & account audit trail (sign-ins, failed logins, password/email change,
-- OAuth link/unlink, settings changes, account deletion).
CREATE TABLE audit_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED     NULL,                  -- kept as NULL after account deletion
  session_id  BIGINT UNSIGNED     NULL,
  event       VARCHAR(64)     NOT NULL,                  -- 'auth.sign_in', 'auth.sign_in_failed', 'account.deleted', ...
  ip_address  VARBINARY(16)       NULL,
  user_agent  VARCHAR(512)        NULL,
  metadata    JSON                NULL,                  -- never secrets
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_audit_logs_user (user_id, created_at),
  KEY ix_audit_logs_session (session_id),
  KEY ix_audit_logs_event (event, created_at),
  CONSTRAINT fk_audit_logs_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE SET NULL,
  CONSTRAINT fk_audit_logs_session FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- =============================================================================
-- 8. SEED: the AbElements package catalogue (as of 2026-10-03)
-- =============================================================================

INSERT INTO packages (slug, npm_name, display_name, tagline, icon_name, github_repo, status, latest_version, sort_order) VALUES
  ('fonts',      'ab-nextjs-fonts',      'Fonts',      'Font presets for next/font, zero layout shift.',  'text_fields', 'abraham-ukachi/ab-nextjs-fonts',      'stable',  '0.2.3', 1),
  ('icons',      'ab-nextjs-icons',      'Icons',      'Material Symbols as tree-shakable React icons.',  'interests',   'abraham-ukachi/ab-nextjs-icons',      'stable',  '0.1.4', 2),
  ('animations', 'ab-nextjs-animations', 'Animations', 'Motion presets and easings, reduced-motion aware.', 'animation', 'abraham-ukachi/ab-nextjs-animations', 'beta',    '0.2.1', 3),
  ('theme',      'ab-nextjs-theme',      'Theme',      'Design tokens, light/dark modes, CSS variables.', 'palette',     'abraham-ukachi/ab-nextjs-theme',      'stable',  '0.2.8', 4),
  ('hooks',      'ab-nextjs-hooks',      'Hooks',      'Typed React hooks for media, theme and storage.', 'phishing',    'abraham-ukachi/ab-nextjs-hooks',      'stable',  '0.1.2', 5),
  ('core',       'ab-nextjs-core',       'Core',       'Layouts, providers and shared utilities.',        'deployed_code','abraham-ukachi/ab-nextjs-core',      'stable',  '0.1.2', 6),
  ('components', 'ab-nextjs-components', 'Components', 'Accessible UI built on core and theme.',          'widgets',     'abraham-ukachi/ab-nextjs-components', 'stable',  '0.1.4', 7),
  ('i18n',       'ab-nextjs-i18n',       'i18n',       'Locales, messages and translation helpers (to be created).', 'translate', NULL,                   'planned', NULL,    8);

INSERT INTO doc_versions (label, slug, status, is_default) VALUES ('v1.x', 'v1', 'current', 1);


-- =============================================================================
-- 9. OPTIONAL (vanilla MySQL 8 / InnoDB only - NOT TiDB/PlanetScale-portable)
-- =============================================================================
-- ALTER TABLE search_documents
--   ADD FULLTEXT INDEX ftx_search_documents (title, keywords, excerpt) WITH PARSER ngram;
