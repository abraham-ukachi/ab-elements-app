<p align="center">
  <!-- Ab - Logo --> 
  <a href="https://abraham-ukachi.vercel.app" target="_blank">
    <img src="./.github/ab-logo.svg" alt="Ab Logo" width="256" height="256" />
  </a>

</p>


<p align="center" style="width:512px; margin:0 auto;">
  <b>abElements</b> is a lightweight library of 100% free UI elements for all your Next.js, React, Polymer, Lit and Flutter projects.
</p>

<p align="center" style="margin-top:12px;">
    <a href="https://ab-elements.vercel.app" target="_blank"><b>Checkout abElements &rarr;</b></a>
</p>




# `ab-elements-app`

> IMPORTANT: This is a work in progress and subject to major changes until version 1.0


This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).




## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


---


## Ab NextJS Components

This project uses the [ab-nextjs-components](https://github.com/abraham-ukachi/ab-nextjs-components) package, and can be installed by running the following command:

```bash
npm i ab-nextjs-components
# or
pnpm install ab-nextjs-component
```


---


## Requirements

These are a couple of the main requirements for this project:

1. A **`splash`** screen - always 😜 
2. A **`home`** page - duh ;) 
3. A **`docs`** page.
4. A **`search`** page.
5. A **`demo`** page.
6. TBD


## Jobs
> MOTTO: I'll always do [**more**](#More) 😜

Jobs related to this `ab-elements-app` project - a list of some specific files to be submitted as well as their corresponding / current **status** for this project:


| No. | Name | File | Status |
|:----|:-----|:-----|:-------|
| 1 | *`Splash - Screen`* | **@splash/page.tsx** | Pending |
| 2 | *`Welcome - Screen`* | **@welcome/page.tsx** | Pending |
| 3 | *`Home - Page`* | **(pages)/page.tsx** | Pending |
| 4 | *`Docs - Page`* | **(pages)/docs/page.tsx** | Pending |
| 5 | *`Search - Page`* | **(pages)/search/page.tsx** | Pending |
| 6 | *`Demo - Page`* | **(pages)/demo/page.tsx** | Pending |
| 7 | *`Color - Theme`* | **assets/theme/color.css** | Pending |
| 8 | *`Styles - Theme`* | **assets/theme/styles.css** | Pending |
| 9 | *`Colors - Theme Module`* | **assets/theme/colors.js** | Pending |
| 10 | *`Typography - Theme`* | **assets/theme/typography.css** | Pending |
| 11 | *`Root / App - Styles`* | **src/app/globals.css** | Pending |
| 12 | *`Root / App - Layout`* | **src/app/[locale]/layout.tsx** | Pending |
| 13 | *`Root / App`* | **src/app/[locale]/page.tsx** | Pending |
| 14 | *`Pages - Styles`* | **(pages)/styles.module.css** | Pending  |
| 15 | *`Pages - Layout`* | **(pages)/layout.tsx** | Pending |
| 16 | *`Pages - Loading`* | **(pages)/loading.tsx** | Pending |
| 17 | *`Pages - Error`* | **(pages)/error.tsx** | Pending |
| 18 | *`Pages - Default`* | **(pages)/default.tsx** | Pending |
| 19 | *`useElement - Hook`* | **hooks/useElement.ts** | Pending |
| 20 | *`Element - Provider`* | **providers/element-provider** | Pending |


> WARNING: This list is a work in progress and will change soon

> NOTE: (\*) = still needs to be updated
>       (TBD) = to be determined ;)




## Structure
> IMPORTANT: `ab-elements-app` uses the [App Router](https://nextjs.org/docs/app/building-your-application/routing) feature of [Next.js](https://nextjs.org/).

The folder & file structure of this [Next.js](https://nextjs.org/) project, based on it's [Project Structure](https://nextjs.org/docs/app/building-your-application/routing):

### The `src` folder
```sh
src
├── app
│   ├── [locale]
│   │   ├── @splash
│   │   ├── @welcome
│   │   ├── (pages)
│   │   │   ├── docs
│   │   │   │   ├── aside.tsx
│   │   │   │   ├── main.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── styles.module.css
│   │   │   ├── demo
│   │   │   ├── search
│   │   │   ├── ... 
│   │   │   ├── page.tsx
│   │   ├── components # <- DEPRECATED: using `ab-nextjs-components` instead ;)
│   │   │   ├── ab-button
│   │   │   ├── ab-collapsible
│   │   │   ├── ab-icon-button
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.module.css
│   │   │   ├── ...
│   │   │   └── server
│   │   │       ├── ab-avatar
│   │   │       ├── ab-logo
│   │   │       │   ├── index.tsx
│   │   │       │   └── styles.module.css
│   │   │       └── ... 
│   │   ├── core # <- DEPRECATED: using `ab-nextjs-core` instead ;)
│   │   │   └── server
│   │   │       ├── ab-app-layout
│   │   │       ├── ab-aside-layout
│   │   │       └── ab-main-layout
│   │   ├── globals.css
│   │   ├── hooks # <- DEPRECATED: using `ab-nextjs-hooks` instead ;)
│   │   │   ├── index.ts
│   │   │   └── useElement.ts
│   │   ├── layout.tsx
│   │   ├── metadata.ts
│   │   ├── sections
│   │   ├── skeletons
│   │   └── views
│   └── favicon.ico
├── i18n.ts
├── messages
│   ├── en.json
│   ├── es.json
│   ├── fr.json
│   └── ru.json
└── middleware.ts
```



### The `public` folder

- [**public**](./public/)
- - * manifest.json
- - * *...*
- - [**assets**](./assets/)
- - * [**logos**](./assets/logos)
- - * [**images**](./assets/images)
- - * [**animations**](./assets/animations/)
- - * - *fade-in-animation.css*
- - * - *pop-in-animation.css*
- - * - *slide-from-down-animation.css*
- - * [**theme**](./assets/theme/)
- - * - *color.css*
- - * - *typography.css*
- - * - *styles.css*

### The top-level / root folder

- LICENSE
- README.md
- package.json
- *ab_translator.mjs*

> NOTE: This is just a relatively short snippet derived from the root folder, and it should get periodically update.


## More 

These are some of the things we did or plan to do, in addition to this project's [requirements](#Requirements):

| No. | Name | File | Status |
|:----|:-----|:-----|:-------|
| 1 | *`Pop In - Animation`* | **pop-in-animation.css** | Pending |
| 2 | *`Fade In - Animation`* | **fade-in-animation.css** | Pending |
| 3 | *`Slide From Down - Animation`* | **slide-from-down-animation.css** | Pending |
| 4 | *`Slide From Up - Animation`* | **slide-from-up-animation.css** | Pending |
| 5 | *`Slide Left - Animation`* | **slide-left-animation.css** | Pending |
| 6 | *`Slide From Left - Animation`* | **slide-from-left-animation.css** | Pending |
| 7 | *`Slide Right - Animation`* | **slide-right-animation.css** | Pending |
| 8 | *`Slide From Right - Animation`* | **slide-from-right-animation.css** | Pending |
| 9 | *`Manifest - JSON File`* | **manifest.json** | Pending |
| 10 | *`Package - JSON File`* | **package.json** | [Done](./package.json)\* |
| 11 | *`Fade Out - Animation`* | **fade-out-animation.css** | Pending |
| 12 | *`Slide Down - Animation`* | **slide-down-animation.css** | Pending |
| 13 | *`Slide Up - Animation`* | **slide-up-animation.css** | Pending |
| 14 | *`AB Translator - Script`* | **ab_translator.mjs** | Pending |
| 19 | *`AB Theme - Stylesheet`* | **assets/theme/ab-theme.css** | Pending |

> NOTE: (\*) = still needs to be updated. <br>
> There's certainly a couple of file we must've forgot or not added yet, so we'll keep the above list updated obv. :)


---

## Testing
> IMPORTANT: All the tests are performed end-to-end reliably using [playwright](https://playwright.dev/)

| Browser | Version | Status | Date | Time
|:--------|:--------|:-------|:-----|:-----
| *`Arc`* | **-** | *Pending* | - | - 
| *`Brave`* | **-** | *Pending*  | - | -
| *`Chrome`* | **-** | *Pending* | - | -
| *`Firefox`* | **-** | *Pending* | - | -
| *`Safari`* | **-** | *Pending* | - | -
| *`Opera`* | **-** | *Pending* | - | -
| *`Edge`* | **-** | *Pending* | - | -
| *`IE`* | **-** | *Pending* | - | -

> NOTE: *`IE`* = Internet Explorer = 👎🏽


## AB Translator
> IMPORTANT: You must install [translate-shell](https://github.com/soimort/translate-shell) first.

A script that currently automates the translation of `ab-elements-app` into 4 different languages (i.e. english, french, russian and spanish)

> GOOD-TO-KNOW: [next-intl](https://https://next-intl-docs.vercel.app/) is currently used for internationalization of `ab-elements-app`.

To translate the ab-elements-app ~~**strings**~~ **messages** to another language (say, french **`fr`**), use the **`ab_translator.mjs`** node script by running the code below in your terminal:

```sh
node ab_translator.mjs messages fr
```

<!-- TODO: tnsert Gif here -->


> NOTE: The source file (e.g. `fr.json`) should be updated afterwards to fix typos and/or adapt the texts accordingly.

## TODOs

- [x] Create the project-specific logos
- [ ] Add localization / internationalization (at least: **en**, **fr**, **ru** and **es**)
- [x] 🌱 Create a `ab-nextjs-core` **npm** package
- [x] 💫 Create a `ab-nextjs-animations` **npm** package
- [x] 🎨 Create a `ab-nextjs-theme` **npm** package
- [x] 📦 Create a `ab-nextjs-components` **npm** package
- [x] ✏️  Create a `ab-nextjs-fonts` **npm** package
- [x] ⭐️ Create a `ab-nextjs-icons` **npm** package
- [x] 🪝 Create a `ab-nextjs-hooks` **npm** package


## Inspirations

The design & development of this project was inspired by the following:

| Name | Type | Inspired By |
|:-----|:-----|:------------|
| [*`tailwindcss.com`*](https://tailwindcss.com/) | **`Framework`** | website, documentation, ui, search |
| [*`catalyst`*](https://tailwindui.com/templates/catalyst) | **`UI Kit`** | ui, components, documentation |
| [*`google fonts`*](https://fonts.google.com/icons) | **`Icons/Symbols`** | search, layout, icons/symbols |

> NOTE: The above **`catalyst`** UI kit is currently *€129* (plus local taxes), but `abElements` is 100% free and always will be ;)



## Learn More abElements

To learn more about **`abElements`**, take a look at the following resources:

- [abElements Documentation](https://ab-elements.vercel.app/docs) - learn about abElements features and API.

You can check out [the abElements GitHub repository](https://github.com/abraham-ukachi/ab-elements-app) for more details.



---

## License

This **`ab-elements-app`** project is [MIT Licensed](./LICENSE) ;)


