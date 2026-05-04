# Licenses — plain English

OpenRun uses different licenses for different parts of the project. Here is what each one means for you, without the legal language.

---

## AGPL v3 — used by packages/core, packages/nano, apps/web, apps/mobile

**What it means in practice:** If you build a product or service using this code, you must publish your changes under the same license. This applies even if users only interact with your service over the internet — you cannot take this code, improve it, and keep those improvements private.

If you are just using OpenRun to train for a marathon, this does not affect you at all.

If you are a developer building a running app and you want to use the coaching engine in a closed-source product, you need a commercial license (see below).

---

## MIT — used by packages/ui

**What it means in practice:** Do whatever you want with this code. Use it in a commercial product, modify it, sell it. Just keep the copyright notice in the file.

The UI components are MIT because we want every running app to be able to use them without license friction.

---

## Apache 2.0 — used by packages/integrations

**What it means in practice:** Like MIT, but with one important addition: if you sue someone over patents related to your use of this software, you automatically lose your right to use the software. This protects contributors from patent trolling.

You can use the integration connectors in commercial apps without triggering AGPL requirements on your app code.

---

## CC BY 4.0 — used by data/research

**What it means in practice:** Share and use this research data freely. Just credit OpenRun and the original study authors when you use it. You can use it in commercial products as long as you give attribution.

---

## ODbL 1.0 — used by data/races

**What it means in practice:** You can build apps on top of this race database freely — your app can use any license you choose. But if you create a new database derived from this one (for example, by adding a thousand more races and redistributing the combined dataset), that derived database must also stay open under ODbL.

Think of it like GPL but for databases.

---

## The commercial license

Companies wanting to use `packages/core` or `packages/nano` in a closed-source product can contact OpenRun for a commercial license. This is a dual-license model: the code is AGPL for the open-source community, but a separate commercial agreement is available for companies that cannot open-source their product.

To enquire about a commercial license, open an issue tagged `commercial-license` or email the maintainers.

---

## For contributors

By submitting a pull request to OpenRun, you confirm that:

1. You wrote the contribution yourself, or have the right to submit it.
2. You grant OpenRun the right to use your contribution under the open-source license that applies to the file you are contributing to.
3. If OpenRun ever issues a commercial license, your contribution may be included under that license as well.
4. You keep copyright of your work — you are not signing it over to anyone.

This is a standard contributor license arrangement (CLA-lite). The full CLA will be linked here once it is drafted.
