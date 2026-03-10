---
name: magic-rules
description: Provides complete rules, mechanics, formats, and comprehensive reference for Magic: The Gathering by Wizards of the Coast
---

# Magic: The Gathering Rules Agent

When the user asks about Magic: The Gathering rules, mechanics, formats, or gameplay, respond using this knowledge base. Provide complete, accurate information with references to official sources where applicable.

---

## 1. Game Objective & Winning Conditions

### Primary Objective
Reduce your opponent's life total to 0, or satisfy an alternate win condition.

### Starting Conditions
- Players begin with **20 life** (Commander: 40 life)
- Each player starts with a deck of 60+ cards (Commander: 100 cards)
- Draw opening hand of 7 cards (Commander: 7 cards)

### Winning the Game
1. **Life Reduction:** Reduce opponent's life to 0
2. **Poison Counters:** Accumulate 10 poison counters
3. **Alternate Win Conditions:** Cards with "you win the game" effects
4. **Conceding:** Opponent chooses to concede

### Losing the Game
- Life reduced to 0 or less
- Receive 10 or more poison counters
- Forced to draw when no cards remain in library
- Affected by effects that cause "you lose the game"

**Source:** https://magic.wizards.com/en/how-to-play

---

## 2. Card Types

### Lands
- **Function:** Produce mana
- **Subtypes:** Plains, Island, Swamp, Mountain, Forest, Wastes
- **Basic Lands:** Can have any number in a deck
- **Non-basic Lands:** Subject to format restrictions

### Creatures
- **Function:** Attack and block
- **Characteristics:** Power/Toughness, Types, Abilities
- **Summoning Sickness:** Cannot attack or tap for abilities the turn they're cast (unless haste)

### Instants
- **Timing:** Cast anytime during the game when you have priority
- **Resolution:** Resolves immediately, goes to graveyard
- **Stack:** Can be responded to

### Sorceries
- **Timing:** Cast during main phases when stack is empty
- **Resolution:** Resolves, goes to graveyard
- **Stack:** Can be responded to

### Artifacts
- **Types:** Equipment, Vehicles, Regular Artifacts
- **Casting:** Pay mana cost, enter battlefield
- **Abilities:** Often have activated abilities (tap to use)

### Enchantments
- **Auras:** Attach to permanents, can be destroyed if enchanted permanent leaves battlefield
- **Global Enchantments:** Affect the game without attaching

### Planeswalkers
- **Function:** Powerful allies with loyalty abilities
- **Damage:** Damage dealt to planeswalkers removes loyalty counters
- ** Loyalty Abilities:** Can be used once per turn, only at specific times

### Battle (New Type)
- **Function:** Can be attacked like a planeswalker or dealt damage
- **Defense:** Can block creatures

**Source:** https://magic.wizards.com/en/how-to-play

---

## 3. Mana System

### Mana Types
- **White (W):** Healing, protection, order
- **Blue (U):** Control, card draw, manipulation
- **Black (B):** Death, destruction, disease
- **Red (R):** Damage, destruction, chaos
- **Green (G):** Growth, creatures, nature
- **Colorless:** Generic mana, any color

### Mana Production
- Lands produce mana when tapped
- Some cards produce mana through abilities
- Mana pool empties at end of each step/phase

### Mana Costs
- **Generic Mana:** Can be paid with any color or colorless
- **Colored Mana Symbols:** Must be paid with that specific color
- **X Mana:** You choose value, pay that much mana
- **Hybrid Mana:** Can be paid with either of two colors

### Color Identity (Commander)
- Card's color identity = its color + colors of mana symbols in rules text
- Determines what colors can be in your Commander deck

**Source:** https://magic.wizards.com/en/how-to-play

---

## 4. Turn Phases

### 1. Beginning Phase
#### Untap Step
- Untap all permanents you control
- You cannot tap during this step

#### Upkeep Step
- Abilities that trigger "at the beginning of your upkeep" resolve
- Players receive priority

#### Draw Step
- Draw one card
- Triggered abilities that say "at the beginning of your draw step" resolve

### 2. Precombat Main Phase
- Play lands (one per turn)
- Cast spells (creatures, sorcery, instant, etc.)
- Activate abilities

### 3. Combat Phase
#### Beginning of Combat Step
- Declare attackers step not yet reached
- Abilities that trigger "at the beginning of combat" resolve

#### Declare Attackers Step
- Declare which creatures attack
- Creatures must be tapped to attack (unless haste)
- Attack individually or simultaneously

#### Declare Blockers Step
- Defending player declares blockers
- Each blocking creature can block only one attacker
- Multiple creatures can block one attacker

#### Combat Damage Step
- Assign combat damage
- First strike / double strike resolution
- Damage dealt simultaneously
- Abilities that trigger "during combat" or "when dealt combat damage" resolve

#### End of Combat Step
- Abilities that trigger "at end of combat" resolve
- Combat ends, creatures are removed from combat

### 4. Postcombat Main Phase
- Same as precombat main phase
- Can play more lands if haven't played one this turn

### 5. Ending Phase
#### End Step
- Abilities that trigger "at the beginning of the end step" resolve
- "Until end of turn" effects expire

#### Cleanup Step
- Discard down to hand size limit (usually 7)
- Damage wearing off all permanents
- "Until end of turn" effects expire

**Source:** https://magic.wizards.com/en/how-to-play

---

## 5. Combat

### Attacking
- Creatures attack a player or planeswalker
- Attacking creatures become tapped (unless granted haste)
- Cannot attack if summoning sick (no haste)

### Blocking
- Defending player chooses which creatures to block
- Each creature can block only one attacker
- Multiple creatures can block one attacker
- Blocking creatures become tapped

### Damage Assignment
- Attacker assigns damage to blockers
- In multiplayer, damage can be redirected to planeswalker
- Lethal damage = creature's toughness or more

### Damage Resolution
- Damage dealt simultaneously (except first strike)
- Damage is dealt, then removed at end of turn
- Damage does not reduce toughness permanently

### First Strike & Double Strike
- **First Strike:** Deals damage in First Strike damage step, before regular damage
- **Double Strike:** Deals damage in both steps

### Trample
- Excess damage beyond lethal to blocking creatures is dealt to defending player/planeswalker

### Deathtouch
- Any amount of damage is lethal

### Lifelink
- Damage dealt also gives that much life

**Source:** https://magic.wizards.com/en/how-to-play

---

## 6. The Stack

### How the Stack Works
The stack is a holding area for spells and abilities waiting to resolve.

1. Player casts spell or activates ability
2. It goes on the stack
3. Other players can respond with instants or abilities
4. When no one adds to stack, top object resolves
5. Then check for new triggered abilities

### LIFO Resolution
- Last In, First Out
- Top of stack resolves first
- Then the next, and so on

### Priority
- Player with priority can cast spells/activate abilities
- Turn player gets priority first in each step
- Must pass priority to move to next step/phase

### Types of Effects on Stack
- Spells (Instant, Sorcery, Enchantment, Artifact, Creature)
- Activated Abilities (tap: ability)
- Triggered Abilities (when/whenever/at)
- Static Abilities (do NOT use stack)

### Countering Spells
- Counterspell, Dispel, etc.
- "Destroy" effects after they're on stack
- Some spells cannot be countered

### Copying Spells/Abilities
- Some cards copy spells on stack
- Copy resolves independently of original

**Source:** https://magic.wizards.com/en/how-to-play

---

## 7. Constructed Formats

### Standard
- **Deck Size:** 60+ cards
- **Sideboard:** Up to 15 cards
- **Rotation:** ~3 years, rotates yearly in Fall
- **Legal Sets:** Most recent 4-5 sets
- **Current (as of 2026):** Check magic.wizards.com/en/formats/standard

### Modern
- **Deck Size:** 60+ cards
- **Sideboard:** Up to 15 cards
- **Legal Sets:** Mirrodin forward (2003+)
- **Banned List:** Specific cards restricted
- **Playstyle:** Diverse, powerful, no rotation

### Pioneer
- **Deck Size:** 60+ cards
- **Sideboard:** Up to 15 cards
- **Legal Sets:** Return to Ravnica forward (2012+)
- **Between Standard and Modern power level**

### Legacy
- **Deck Size:** 60+ cards
- **Sideboard:** Up to 15 cards
- **Legal Sets:** All sets, restricted banned list
- **Most powerful format, cards from entire history**

### Vintage
- **Deck Size:** 60+ cards
- **Sideboard:** Up to 15 cards
- **Legal Sets:** All sets, minimal restrictions
- **Power Nine restricted, not banned**

### Commander (EDH)
- **Deck Size:** Exactly 100 cards
- **Commander:** Legendary creature in command zone
- **Life:** 40
- **Color Identity:** Restricts cards in deck
- **Singleton:** No duplicates (except basic lands)
- **Win Condition:** Usually 21 combat damage from commander

### Pauper
- **Deck Size:** 60+ cards
- **Legal Cards:** Common only
- **Sideboard:** Up to 15 cards
- **Unique metagame**

### Brawl
- **Deck Size:** 60+ cards
- **Commander:** Legendary creature or planeswalker
- **Standard-legal cards only**
- **Life:** 30
- **One copy of each nonland card**

### Alchemy (MTG Arena)
- **Deck Size:** 60+ cards
- **Standard rotation
- **Digital-only cards**
- **Rebalanced cards**

### Historic (MTG Arena)
- **Deck Size:** 60+ cards
- **I/x sets + Pioneer**
- **Digital-only cards**

### Timeless (MTG Arena)
- **Deck Size:** 60+ cards
- **No rotation**
- **Historic + specific Vintage cards**

**Source:** https://magic.wizards.com/en/formats

---

## 8. Limited Formats

### Sealed Deck
- **Duration:** Build from 6 boosters
- **Pool:** ~90-120 cards to build 40+ card deck
- **No draft component**
- **Deck + sideboard**

### Booster Draft
- **Duration:** 3 packs per player
- **Process:** Open pack, pick one card, pass remaining
- **Build:** Minimum 40 cards
- **Variants:** 2-8 players

### Cube Draft
- **Custom pool:** Curated selection of cards
- **Usually singleton**
- **Draft from curated cube**

### Sealed Deck
- **Team Sealed:** Teams build from shared pool
- **Team Booster Draft:** Teams draft together

**Source:** https://magic.wizards.com/en/formats

---

## 9. Commander-Specific Rules

### Deck Construction
1. Choose a **legendary creature** as commander
2. **100 cards** total (commander is 101st)
3. **Singleton:** No duplicate cards (except basic lands)
4. **Color Identity:** Cards cannot have colors not in commander's color identity
5. **No duplicates** of cards with same name

### Play Rules
- **Starting Life:** 40
- **Commander starts in Command Zone**
- **Casting from Command Zone:** Additional cost of {2} for each previous cast
- **Recursion:** If commander goes to graveyard/exile, owner may move to command zone

### Damage & Victory
- **Commander Damage:** If a commander deals 21 combat damage to a player, that player loses
- **Multiple commanders:** If playing companion, follows same rules

### Variant: Commander 1v1
- 30 life
- 60 cards
- Slightly different banned list

**Source:** https://mtgcommander.net/index.php/rules/

---

## 10. Banned & Restricted Lists

### Format-Specific Lists
Each format has its own banned/restricted list:
- **Standard:** Minimal bans
- **Modern:** Some cards banned (e.g., Fetchlands sometimes restricted historically)
- **Legacy/Vintage:** Restricted list (Power Nine)
- **Commander:**RC bans by format
- **Pauper:** Different banned list

### Types of Restrictions
- **Banned:** Card cannot be used
- **Restricted:** Only one copy in deck (Vintage)
- **Suspended:** Temporarily banned while being reevaluated

### Commander Banned List
- Updated quarterly by Rules Committee
- Philosophy-based, not pure power level
- Check: https://mtgcommander.net/index.php/banned-list/

**Source:** https://magic.wizards.com/en/game-info/gameplay/rules-and-formats/banned-restricted

---

## 11. Keywords & Abilities

### Common Keywords
- **Haste:** Can attack and tap for abilities the turn it enters
- **Flying:** Can only be blocked by flying/Reach
- **Reach:** Can block flying creatures
- **Trample:** Excess damage to player/planeswalker
- **Deathtouch:** Any damage is lethal
- **Lifelink:** Gain life equal to damage dealt
- **First Strike:** Deal damage in first strike step
- **Double Strike:** Deal damage in both steps
- **Hexproof:** Cannot be targeted by spells/abilities
- **Shroud:** Cannot be targeted (cannot be enchanted either)
- **Indestructible:** Cannot be destroyed by damage or "destroy" effects
- **Vigilance:** Does not tap when attacking
- **Flash:** Can be cast anytime you could cast an instant
- **Fear:** Can only be blocked by artifact/-black creatures
- **Intimidate:** Can only be blocked by artifact creatures

### Triggered Abilities
- Start with "when," "whenever," or "at"
- Trigger automatically when condition is met
- Go on stack when triggered

### Activated Abilities
- [Cost]: [Effect]
- Can be activated anytime you have priority (unless restriction)

### Static Abilities
- Continuous effects
- Do not use the stack

### Replacement Effects
- Modify how events happen
- Use "instead" language

**Source:** https://magic.wizards.com/en/keyword-glossary

---

## 12. Mulligan Rules

### Standard Mulligan
1. Draw opening hand of 7
2. May shuffle back and redraw (varies by format)
3. Keep hand, game begins

### Partial Paris Mulligan (Commander)
- Put any number of cards on bottom, draw that many

### Vancouver Mulligan
- Draw 7, put up to 1 on bottom, draw back to 7

### London Mulligan
- Draw 7, put any number on bottom, scry 1, draw back to 7
- Used in most competitive formats

**Source:** https://magic.wizards.com/en/rules

---

## 13. Glossary of Terms

| Term | Meaning |
|------|---------|
| **Life Total** | Health points, start at 20 (Commander: 40) |
| **Poison Counters** | 10 = lose the game |
| **Library (Deck)** | Draw pile |
| **Graveyard (Yard)** | Discard pile |
| **Hand** | Cards available to play |
| **Battlefield** | Where permanents are played |
| **Exile** | Removed from game, separate zone |
| **Command Zone** | Where commander starts, can be recast |
| **Stack** | Zone where spells wait to resolve |
| **Mana Pool** | Temporary mana available |
| **Tap** | Turn card sideways to use |
| **Untapped** | Ready to use |
| **Summoning Sickness** | Cannot attack or tap for abilities |
| **Target** | Object or player chosen for spell/ability |
| **Damage** | Reduces life, can be prevented |
| **Destroy** | Send to graveyard |
| **Sacrifice** | Destroy voluntarily, goes to graveyard |
| **Counter (spell)** | Cancel before resolution |
| **Mill** | Put cards from library into graveyard |
| **Scry** | Look at top cards, decide to keep or put on bottom |
| **Fateseal** | Look at top cards, decide to keep or put on bottom (opponent) |
| **Regenerate** | Replace destruction with tapped + -1/-1 |
| **Copy** | Create duplicate on stack |
| **Token** | Non-card permanent created by spell/ability |
| **Charge Counter** | Marker for various abilities |
| **Loyalty** | Planeswalker counters |
| **Color Identity** | Colors allowed in Commander deck |

**Source:** https://magic.wizards.com/en/keyword-glossary

---

## Official Sources & References

### Main Resources
- **Formats Hub:** https://magic.wizards.com/en/formats
- **How to Play:** https://magic.wizards.com/en/how-to-play
- **Comprehensive Rules:** https://media.wizards.com/2024/downloads/MagicCompRules%20202401.txt
- **Keyword Glossary:** https://magic.wizards.com/en/keyword-glossary
- **Banned & Restricted:** https://magic.wizards.com/en/game-info/gameplay/rules-and-formats/banned-restricted

### Commander Specific
- **Official Commander Website:** https://mtgcommander.net/
- **Commander Rules:** https://mtgcommander.net/index.php/rules/
- **Banned List:** https://mtgcommander.net/index.php/banned-list/
- **Philosophy:** https://mtgcommander.net/index.php/the-philosophy-of-commander/

### Digital Formats
- **MTG Arena:** https://magic.wizards.com/en/mtgarena
- **Alchemy:** https://magic.wizards.com/en/mtgarena/alchemy
- **Historic:** https://magic.wizards.com/en/formats/historic

### Card Database
- **Gatherer:** https://gatherer.wizards.com/Pages/Default.aspx
- **Scryfall:** https://scryfall.com/

---

*Last Updated: March 2026*
*Skill Version: 1.0*
