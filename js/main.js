const DDragon = "https://ddragon.leagueoflegends.com";
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const cardGrid = document.querySelector("#build-card-grid");
const emptyBuilds = document.querySelector("#empty-builds");
const cardsStatus = document.querySelector("#cards-status");
const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

function showStorageError(error) {
    cardsStatus.classList.add("is-error");
    cardsStatus.textContent = error instanceof Error
        ? `Impossible de charger les builds publics : ${error.message}`
        : `Impossible de charger les builds publics : ${String(error)}`;
    cardGrid.replaceChildren();
    emptyBuilds.hidden = true;
}

function readStaticBuildCards() {
    const cards = window.SlipixTrollPixStaticBuildCards;
    const isStringArray = (values) => Array.isArray(values)
        && !values.some((value) => typeof value !== "string");
    const isValidCard = (card) => card && card.schemaVersion === 1
        && typeof card.id === "string" && typeof card.title === "string"
        && typeof card.patch === "string" && card.champion
        && typeof card.champion.id === "string" && typeof card.champion.name === "string"
        && typeof card.champion.image === "string"
        && Array.isArray(card.items) && card.items.length === 6
        && !card.items.some((item) => item !== null
            && (!item || typeof item.name !== "string" || typeof item.image !== "string"))
        && card.runes && typeof card.runes.primaryPath === "string"
        && typeof card.runes.keystone === "string" && typeof card.runes.secondaryPath === "string"
        && (card.runes.primaryRunes === undefined || isStringArray(card.runes.primaryRunes))
        && isStringArray(card.runes.secondaryRunes)
        && Array.isArray(card.runes.shards)
        && !card.runes.shards.some((shard) => !shard
            || typeof shard.label !== "string" || typeof shard.text !== "string");

    if (!Array.isArray(cards) || cards.some((card) => !isValidCard(card))) {
        throw new Error("Check js/static-builds.js; it must contain an array of valid build cards.");
    }
    return cards;
}

function addItemCard(container, item, patch, index) {
    if (!item) {
        const empty = document.createElement("div");
        empty.className = "build-card-item is-empty";
        empty.textContent = `Emplacement ${index + 1} · vide`;
        container.append(empty);
        return;
    }

    const tile = document.createElement("div");
    tile.className = "build-card-item";
    const image = document.createElement("img");
    image.src = `${DDragon}/cdn/${patch}/img/item/${item.image}`;
    image.alt = "";
    image.loading = "lazy";
    const name = document.createElement("span");
    name.textContent = item.name;
    tile.append(image, name);
    container.append(tile);
}

function addRunePath(container, heading, pathName, runeNames) {
    const section = document.createElement("section");
    section.className = "build-card-rune-path";
    const title = document.createElement("h4");
    title.textContent = heading;
    const path = document.createElement("p");
    path.className = "build-card-path-name";
    path.textContent = pathName || "No path selected";
    section.append(title, path);
    runeNames.forEach((name) => {
        const rune = document.createElement("p");
        rune.textContent = name || "No rune selected";
        section.append(rune);
    });
    container.append(section);
}

function renderBuildCard(card) {
    const article = document.createElement("article");
    article.className = "build-card";

    const header = document.createElement("header");
    header.className = "build-card-header";
    const championImage = document.createElement("img");
    championImage.className = "build-card-champion";
    championImage.src = `${DDragon}/cdn/${card.patch}/img/champion/${card.champion.image}`;
    championImage.alt = "";
    championImage.loading = "lazy";
    const heading = document.createElement("div");
    heading.className = "build-card-heading";
    const title = document.createElement("h3");
    title.textContent = card.title;
    const championName = document.createElement("p");
    championName.textContent = card.champion.name;
    heading.append(title, championName);
    const version = document.createElement("span");
    version.className = "build-card-version";
    version.textContent = card.patch ? `v${card.patch}` : "";
    header.append(championImage, heading, version);

    const equipment = document.createElement("div");
    equipment.className = "build-card-equipment";
    card.items.forEach((item, index) => addItemCard(equipment, item, card.patch, index));
    equipment.setAttribute("aria-label", "Full item build");

    const runes = document.createElement("div");
    runes.className = "build-card-runes";
    addRunePath(runes, "PRIMARY", card.runes.primaryPath, [
        card.runes.keystone,
        ...(card.runes.primaryRunes || [])
    ]);
    addRunePath(runes, "SECONDARY", card.runes.secondaryPath, card.runes.secondaryRunes);

    const shards = document.createElement("div");
    shards.className = "build-card-shards";
    card.runes.shards.forEach((shard) => {
        const badge = document.createElement("span");
        badge.className = "build-card-shard";
        badge.textContent = `${shard.label}: ${shard.text}`;
        shards.append(badge);
    });

    const footer = document.createElement("footer");
    footer.className = "build-card-footer";
    const created = document.createElement("time");
    created.className = "build-card-date";
    const createdTime = Date.parse(card.createdAt);
    if (Number.isFinite(createdTime)) {
        created.dateTime = new Date(createdTime).toISOString();
        created.textContent = dateFormat.format(createdTime);
    } else {
        created.textContent = "Saved build";
    }
    footer.append(created);

    article.append(header, equipment, runes, shards, footer);
    return article;
}

function renderCards() {
    try {
        const cards = readStaticBuildCards();
        cardGrid.replaceChildren(...cards.map(renderBuildCard));
        emptyBuilds.hidden = cards.length > 0;
        cardsStatus.classList.remove("is-error");
        cardsStatus.textContent = "";
    } catch (error) {
        showStorageError(error);
    }
}

menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.querySelector(".sr-only").textContent = isOpen ? "Ouvrir le menu" : "Fermer le menu";
    primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.querySelector(".sr-only").textContent = "Ouvrir le menu";
        primaryNav.classList.remove("is-open");
    });
});

renderCards();
