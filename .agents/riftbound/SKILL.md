---
name: riftbound-rules
description: Provides complete rules, mechanics, formats, and comprehensive reference for Riftbound TCG by Riot Games
---

# Riftbound Rules Agent

When the user asks about Riftbound rules, mechanics, formats, or gameplay, respond using this knowledge base. Provide complete, accurate information with references to official sources where applicable.

---

## 1. Game Objective & Winning Conditions

### Primary Objective
The goal in Riftbound is to score points by **conquering** and **holding** Battlefields. Points are scored as follows:

| Action | When | Points |
|--------|------|--------|
| **Conquer** | After your move and any showdown, if you control a Battlefield | +1 |
| **Hold** | At the start of your turn, if you still control a Battlefield you conquered earlier | +1 |

### Points Needed to Win

| Mode | Points Required |
|------|-----------------|
| 1v1 Duel | 8 |
| 3-player Skirmish | 8 |
| 4-player War | 8 |
| 2v2 (Magma Chamber) | 11 |

### The Final Point Rule (Critical)
If conquering would give you your winning point, you generally cannot win by conquering only one Battlefield that turn.

- **1v1:** If you are one point away and conquer just one Battlefield, you do **not** score that point. Instead, you **draw a card** for the first Battlefield you conquer. You only win if you also score on the other Battlefield that same turn.
- **3-player Skirmish:** To win by conquering a Battlefield, you must have already held or conquered the **other two** Battlefields that same turn.

**Source:** https://lolnow.gg/riftbound-rules/

---

## 2. Card Types

### Champion Legend
- **Location:** Starts on the board
- **Behavior:** Always in play, never leaves play
- **Function:** Provides always-active ability, defines your strategy and Domains
- **Domains:** Each Legend shows two Domains (color pair) that determine your deck's theme and Power rune colors

### Chosen Champion
- **Location:** Starts next to your Legend (not in play)
- **Behavior:** Can be played as a unit once you can pay its cost
- **Function:** Enters your Base as a unit (usually exhausted), designed to match your Legend's strengths

### Units
- **Location:** Main Deck → Base → Battlefields
- **Behavior:** Used to conquer and hold Battlefields, fight in combat
- **Anatomy:**
  - **Energy cost:** Number in top-left corner
  - **Power cost:** Colored symbols under Energy cost (sometimes)
  - **Might:** Top-right, used for both attack and defense
  - **Ability text:** Rules text box
- **Key Rule:** Units enter **exhausted** when played to Base

### Spells
- **Location:** Main Deck
- **Behavior:** One-time effects, go to Trash after use
- **Function:** Many can be used during Showdowns, including on opponent's turn (depending on tags)
- **Tags:** Action (playable during showdowns), Reaction (playable in response during showdowns)

### Gear
- **Location:** Main Deck → Base
- **Behavior:** Stays in Base, provides repeatable value
- **Key Points:**
  - Does not have Might
  - Typically enters **ready**, can often be used immediately
  - Often exhausts to use abilities

### Runes
- **Location:** Rune Deck → Rune Area (after channeling)
- **Behavior:** Resources used to pay costs
- **See Section 3: Resource System**

### Battlefields
- **Location:** Played during setup, placed in center
- **Behavior:** Objectives with unique effects that change how fights play out
- **Function:** Fight over these to score points
- **Tip:** Always read Battlefield text before committing to a big fight

**Source:** https://lolnow.gg/riftbound-rules/

---

## 3. Resource System: Energy vs Power

Riftbound uses two decks: Main Deck and Rune Deck. Runes are channeled onto your board each turn.

### Energy
- **Appearance:** A number
- **Payment Method:** Exhaust that many runes (any color works)
- **Exhausting:** Turn runes sideways. Exhausted runes cannot be used for Energy again until they ready

### Power
- **Appearance:** Colored symbols
- **Payment Method:** Recycle matching color runes to the bottom of your Rune Deck
- **Recycling:** Place cards on the bottom of the Rune Deck

### Key Rules
- You can recycle a rune even if it is exhausted
- A rune can be exhausted for Energy AND recycled for Power in the same card payment
- Some Power symbols allow recycling a rune of **any** color (rainbow symbol)

### Channeling
- At the start of most turns, you **channel** runes from your Rune Deck onto your board
- **First Turn Bonus (1v1):** First player channels **2 runes**, second player channels **3 runes**
- **After first turn:** Everyone channels 2 runes per turn (unless card says otherwise)

**Source:** https://lolnow.gg/riftbound-rules/

---

## 4. Turn Structure

Every turn follows the same four steps (A, B, C, D):

### Phase A: Awaken
- Ready your exhausted cards

### Phase B: Beginning
- Resolve start-of-turn effects
- Score for **holding** Battlefields you control

### Phase C: Channel
- Put runes from Rune Deck onto your board

### Phase D: Draw
- Draw 1 card from Main Deck

### Action Phase
After A-B-C-D, you enter the Action Phase where you can:
- Play units, gear, and spells
- Move units
- Use abilities
- Trigger showdowns and fight combats

Then end your turn and resolve any end-of-turn effects.

**Source:** https://lolnow.gg/riftbound-rules/

---

## 5. Conquering & Holding Battlefields

### Conquering an Empty Battlefield
1. Move a ready unit from your Base to an unoccupied Battlefield
2. The unit exhausts
3. This creates an **Open Showdown** window
4. If the unit survives and you end up controlling the Battlefield, you conquer and score +1

### Conquering an Occupied Battlefield
1. Move a ready unit to a Battlefield controlled by an opponent
2. This starts a **Combat Showdown**
3. Players can play spells and abilities using Action and Reaction tags
4. Combat resolves, and if only one player has units left there, they conquer and score +1

### Holding
- At the start of your turn, if you still control a Battlefield you conquered earlier, you score +1

**Source:** https://lolnow.gg/riftbound-rules/

---

## 6. Showdowns

A **Showdown** happens whenever a unit moves to a Battlefield the mover does not control.

### Types of Showdown

| Type | When | Meaning |
|------|------|---------|
| **Open Showdown** | Unit moves to empty Battlefield | Spells and abilities can stop the conquest |
| **Combat Showdown** | Unit moves into enemy-held Battlefield | Spells and abilities happen before combat damage |

### The Action/Reaction Chain
Many spells and abilities are tagged:
- **Action:** Playable during showdowns
- **Reaction:** Playable in response during showdowns

**Chain Resolution:**
1. A player uses an Action spell or ability
2. The other player may respond with a Reaction
3. Reactions can be played on Reactions
4. This continues until no one adds more

### Timing Rules
- Reactions can respond to **spells or abilities**
- Reactions cannot respond directly to playing a unit or gear
- Reactions can respond to abilities that trigger when those cards are played, if the ability timing allows

**Source:** https://lolnow.gg/riftbound-rules/

---

## 7. Combat & Damage

### Might
Might represents:
- How much damage a unit deals in combat
- How much damage a unit can take before it dies

### Combat Resolution
When combat resolves:
1. Each side totals the Might of their units at that Battlefield
2. Each player assigns their damage across the opposing units however they choose
3. A unit is destroyed if it takes damage **equal to or greater than** its Might, then it goes to the Trash

### Damage Healing (Critical Rule)
**Damage is healed at the end of combat and at the end of the turn.** Damage does not permanently lower Might.

- If you want to kill a unit with spells, you often need to do it in the same turn before it heals
- Even if no spells were played, a showdown still happened—it was just a showdown where nobody added to the chain

**Source:** https://lolnow.gg/riftbound-rules/

---

## 8. Multiplayer Formats

### Modes Overview

| Mode | Players | Battlefields | Special Rules |
|------|---------|--------------|---------------|
| **Duel** | 2 | 2 | Second player channels 3 runes on turn 1 |
| **Match** | 2 | 2 | Best of three, choose different Battlefield each game |
| **Skirmish** | 3 | 3 | To win by conquering, must also score on other 2 Battlefields that turn |
| **War** | 4 | 3 | First player skips first draw and removes their Battlefield, last player channels 3 on turn 1 |
| **2v2 (Magma Chamber)** | 4 | 3 | Play to 11 points, first player skips first draw, last player channels 3 on turn 1 |

### Multiplayer Showdowns
- Multiple players can participate in showdowns
- Players can help whoever they want, even if they weren't invited
- Combat itself only ever involves units from **two** players, even if more players cast spells

### 2v2 Specific Rules
- Your team wins at **11 points**
- Everyone can participate in showdowns, no invitation needed
- You and your ally cannot have units at the same Battlefield
- "Friendly" on cards includes your ally
- Your ally can play spells on your turn without waiting for a showdown

**Source:** https://lolnow.gg/riftbound-rules/

---

## 9. Constructed Formats

### Standard
- Cards from the most recent sets
- Expects rotation as new sets are released
- Default competitive format

### Eternal
- All cards are legal
- No rotation
- Includes cards from all sets

**Source:** https://riftbound.gg/riftbound-formats-constructed-limited-details/

---

## 10. Limited Formats

### Sealed
- Each player receives unopened boosters
- Build a deck from the cards provided
- No draft portion

### Booster Draft
- Open boosters, pick cards one at a time
- Build deck from selected cards
- Usually 3 packs per player

**Source:** https://riftbound.gg/riftbound-formats-constructed-limited-details/

---

## 11. Deck Construction Rules

### Required Components
Each player brings:
- **Main Deck:** Units, Spells, Gear (typically 40+ cards)
- **Rune Deck:** Rune cards used to pay costs (minimum size varies by format)
- **1 Battlefield:** The location contributed to the map
- **1 Champion Legend:** Always in play
- **1 Chosen Champion:** Starts available, becomes unit when played

### Domains
- Determined by your Champion Legend
- Shape your deck's theme
- Determine what colors of runes you will have for Power costs

**Source:** https://lolnow.gg/riftbound-rules/

---

## 12. Setup & Starting the Game

### Initial Setup
Each player's area includes:
- Champion Legend on the board
- Chosen Champion next to it
- Base area for units and gear
- Main Deck and Trash pile
- Rune Deck and Rune area for channeled runes
- Battlefields placed in shared center

### Starting Hand & Mulligan
1. Decide who goes first
2. Shuffle Main Deck and Rune Deck
3. Draw **4** cards from Main Deck
4. **Mulligan:** You may recycle up to **2** cards from your hand to the bottom of your Main Deck, then draw that many replacements

**Source:** https://lolnow.gg/riftbound-rules/

---

## 13. Glossary of Terms

| Term | Meaning |
|------|---------|
| **Ready** | Upright, can be used |
| **Exhaust** | Turned sideways, usually cannot be used again this turn |
| **Move** | Base to Battlefield, Battlefield to Base, or Battlefield to Battlefield |
| **Recycle** | Put a card on the bottom of its deck |
| **Card** | Main Deck card, not a Rune or Battlefield |
| **Tokens** | Units created during play, any marker can represent them |
| **Channel** | Put runes from Rune Deck onto your board |
| **Showdown** | Spell-and-ability window when moving to uncontrolled Battlefield |
| **Open Showdown** | Moving to empty Battlefield |
| **Combat Showdown** | Moving into enemy-held Battlefield |
| **Conquer** | Take control of a Battlefield |
| **Hold** | Start your turn still controlling a conquered Battlefield |

**Source:** https://lolnow.gg/riftbound-rules/

---

## Official Sources & References

### Core Rules
- Official Core Rules (PDF): https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/572377fcaa704a05f72eb42c104079d3b3bcf740.pdf
- Official Rules Page: https://riftbound.gg/rules/

### Tournament Rules
- Tournament Rules (January 2026): https://riftbound.leagueoflegends.com/en-us/news/announcements/tournament-rules-january-update/

### Formats
- Formats Guide: https://riftbound.gg/riftbound-formats-constructed-limited-details/
- All Formats Explained: https://mobalytics.gg/riftbound/guides/formats

### Additional Resources
- How to Play Guide: https://riftbound.leagueoflegends.com/en-us/news/rules-and-releases/how-to-play-get-started/
- Spiritforged FAQ: https://riftbound.leagueoflegends.com/en-us/news/rules-and-releases/riftbound-spiritforged-faq
- Origins FAQ: https://riftbound.leagueoflegends.com/en-us/news/rules-and-releases/riftbound-origins-faq

---

*Last Updated: March 2026*
*Skill Version: 1.0*
