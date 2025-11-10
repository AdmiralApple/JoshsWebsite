// Core DOM elements reused throughout the interaction.
const storyEl = document.getElementById("story");
const promptEl = document.getElementById("prompt");
const interactionForm = document.getElementById("interaction");
const responseInput = document.getElementById("response");
const resultsSection = document.getElementById("results");
const flavorEl = document.getElementById("flavor");
const statsList = document.getElementById("stats");
const rerollText = document.getElementById("reroll-text");
const rerollButton = document.getElementById("reroll-button");

// Mutable values that capture the player's choices.
let userName = "";
let userAge = "";
let classChoice = "";
let specialization = "";
let rerollsRemaining = 3;

// Small helper to append lines to the narrative block.
function appendStory(text) {
  storyEl.textContent = `${storyEl.textContent}\n\n${text}`.trim();
}

// Weighted stat generator that mirrors the original Python script.
function generateStats(spec) {
  const lowerSpec = spec.trim().toLowerCase();
  const totalPoints = getRandomInt(24, 42);

  // Weight map copied from the script so every specialization behaves the same.
  const baseWeights = {
    spear: { Strength: 3, Agility: 2, Knowledge: 1, Intuition: 2, Fortitude: 3 },
    sword: { Strength: 3, Agility: 2, Knowledge: 1, Intuition: 1, Fortitude: 3 },
    axe: { Strength: 4, Agility: 1, Knowledge: 1, Intuition: 1, Fortitude: 4 },
    pyromancy: { Strength: 1, Agility: 2, Knowledge: 4, Intuition: 3, Fortitude: 1 },
    lumenomancy: { Strength: 1, Agility: 2, Knowledge: 3, Intuition: 4, Fortitude: 1 },
    necromancy: { Strength: 1, Agility: 1, Knowledge: 4, Intuition: 3, Fortitude: 2 },
    shadowstepper: { Strength: 1, Agility: 4, Knowledge: 2, Intuition: 3, Fortitude: 1 },
    spellblade: { Strength: 2, Agility: 3, Knowledge: 2, Intuition: 4, Fortitude: 1 },
    venomancer: { Strength: 1, Agility: 3, Knowledge: 2, Intuition: 4, Fortitude: 1 },
  };

  const weights = baseWeights[lowerSpec] ?? {
    Strength: 2,
    Agility: 2,
    Knowledge: 2,
    Intuition: 2,
    Fortitude: 2,
  };

  const weightTotal = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const stats = {};

  Object.entries(weights).forEach(([stat, weight]) => {
    const baseValue = Math.round((totalPoints * weight) / weightTotal);
    const wobble = [-1, 0, 1][getRandomInt(0, 2)];
    stats[stat] = Math.max(1, baseValue + wobble);
  });

  return stats;
}

// Inclusive random integer utility.
function getRandomInt(min, max) {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

// Converts arbitrary user input into Title Case for celebratory moments.
function toTitleCase(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// The scripted steps, kept close to the CLI version for familiarity.
const steps = [
  {
    prompt: "Hey champ, what's your name?",
    onSubmit: (value) => {
      userName = value.trim();
      appendStory(`Nice to meet you, ${userName}!`);
    },
  },
  {
    prompt: () => `Well ${userName}, that’s a very cool name! Next up, your age?`,
    onSubmit: (value) => {
      userAge = value.trim();
      appendStory(`Ah, ${userAge} years of experience suits you well.`);
    },
  },
  {
    prompt: () =>
      `Soooo ${userName}, of the age ${userAge}, what sort of character class would you like?\nWarrior\nMage\nRogue\nSomething else?`,
    onSubmit: (value) => {
      classChoice = value.trim();
      const lowerChoice = classChoice.toLowerCase();

      // Dialogue echoes the Python flow, including the "else" path.
      switch (lowerChoice) {
        case "warrior":
          appendStory(
            `Ahh, a specimen of muscular prowess! All kneel in the glory and strength of ${userName}, truly a behemoth among humanity!`
          );
          break;
        case "mage":
          appendStory(
            `Mmmm, a conjurer of arcane knowledge, purveyor of astral wisdom — truly ${userName} is wise beyond comprehension!`
          );
          break;
        case "rogue":
          appendStory(
            `Ouuuu, the sly and stealthy ruler of shadows — a pleasure to meet the cunning and elusive ${userName}!`
          );
          break;
        default:
          appendStory(
            `Oh ho! What a specialized talent set you must have, ${userName}. I tremble at the thought of your mischief!`
          );
          break;
      }

      appendStory(
        `Nice to meet you, ${userName}! It's amazing that you're ${userAge} years old — and a ${lowerChoice}, hot darn!`
      );
      appendStory(
        `Now then mighty and cunning ${lowerChoice}, let's choose your specialty, expanding on your prowess as a ${lowerChoice}!`
      );
    },
  },
  {
    prompt: () => {
      const lowerChoice = classChoice.trim().toLowerCase();
      if (lowerChoice === "warrior") {
        return "Choose your preferred weapon of destruction: The Sword, the Spear, or the Axe?";
      }
      if (lowerChoice === "mage") {
        return "Hail wise Magi! Which school of the arcane do you wield? Pyromancy, Necromancy, or Lumenomancy?";
      }
      if (lowerChoice === "rogue") {
        return "So, you picked the big sneaky! What sort of big sneaky are you? Shadowstepper, Spellblade, or Venomancer?";
      }
      return "Ohh, you're something special! Please choose a statblock and unique skill best suited to your prowess!";
    },
    onSubmit: (value) => {
      specialization = value.trim();
      const lowerSpec = specialization.toLowerCase();

      // Specialization flavor text lifted from the CLI experience.
      const flavorMap = {
        spear: `The ${specialization}, eh? Bold choice — Kolzan’s weapon of chaos. He never met a wall he didn’t try to run through first… and somehow, it usually worked.`
          ,
        sword: `The classic ${specialization} — elegant, deadly, and timeless.`,
        axe: `A brutal choice, ${userName}! You crave power, not precision.`,
        pyromancy: `apple placeholder`,
        necromancy: `Darkness answers your call, ${userName}... the grave obeys.`,
        lumenomancy: `Lumenomancy, eh? Brandoni’s old art — a mind so bright it sometimes forgot to come back down. He once tried to bottle sunlight... and somehow, it worked.`,
        shadowstepper: `You vanish between blinks — a phantom in motion. The ${specialization} is feared by all who value their coin or their lives.`,
        spellblade: `Spellblade… Posti the Lion’s craft. Methodical. Precise. He didn’t fight battles — he solved them, one perfect strike at a time.`,
        venomancer: `Poison, patience, precision... the ${specialization} kills before the blade ever touches flesh.`,
      };

      const flavor =
        flavorMap[lowerSpec] ?? `An unconventional choice... I like your style, ${userName}!`;

      appendStory(
        `Your destiny begins, ${userName} the ${toTitleCase(specialization)} ${toTitleCase(classChoice)}!`
      );

      // Display the results panel now that the player is fully defined.
      flavorEl.textContent = flavor;
      renderStats();
      resultsSection.hidden = false;

      rerollText.textContent = `Is this to your liking ${userName}? You may roll the bones ${rerollsRemaining} more time(s).`;
      interactionForm.hidden = true;
      responseInput.disabled = true;
    },
  },
];

let currentStep = 0;

// Prompt initial question immediately on load.
updatePrompt();
responseInput.focus();

interactionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = responseInput.value.trim();
  if (!value) return;

  const step = steps[currentStep];
  step.onSubmit(value);

  responseInput.value = "";
  currentStep += 1;

  if (currentStep < steps.length) {
    updatePrompt();
  }
});

rerollButton.addEventListener("click", () => {
  if (rerollsRemaining <= 0) return;
  rerollsRemaining -= 1;
  renderStats();
  rerollText.textContent =
    rerollsRemaining > 0
      ? `Is this to your liking ${userName}? You may roll the bones ${rerollsRemaining} more time(s).`
      : `Fate is decided, ${userName}. May these stats guide your legend.`;

  if (rerollsRemaining <= 0) {
    rerollButton.disabled = true;
    rerollButton.textContent = "No rerolls remaining";
  }
});

// Updates the prompt label depending on the current step state.
function updatePrompt() {
  const step = steps[currentStep];
  const promptText = typeof step.prompt === "function" ? step.prompt() : step.prompt;
  promptEl.textContent = promptText;
}

// Renders the stat list using the stored specialization and player name.
function renderStats() {
  const stats = generateStats(specialization);
  statsList.innerHTML = "";
  Object.entries(stats).forEach(([stat, value]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${stat}</span><span>${value}</span>`;
    statsList.append(li);
  });
}
