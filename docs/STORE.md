# Витрина для площадок (CrazyGames, Poki, itch.io, Яндекс Игры)

Все картинки лежат в `docs/store/`. Они сделаны из самой игры скриптом, поэтому честно показывают геймплей.

## Файлы

| Файл | Размер | Для чего |
|---|---|---|
| `cover-landscape-en.png` | 1920×1080 | Обложка 16:9 (CrazyGames, itch.io) |
| `cover-portrait-en.png` | 800×1200 | Обложка 2:3 (CrazyGames) |
| `cover-square-en.png` | 800×800 | Обложка 1:1 (CrazyGames) |
| `cover-*-ru.png` | те же | Русские обложки «Малёк» (Яндекс Игры, ВК Игры) |
| `icon-512.png` | 512×512 | Иконка без текста |
| `screen-1…5-en.png` | 1920×1080 | Скриншоты: меню, малёк в гроте с обучением, охота, эволюция, магазин |
| `preview-landscape.mp4` | 1920×1080, 18 с | Ролик 16:9, без звука, первый кадр = обложка |
| `preview-portrait.mp4` | 1080×1620, 18 с | Ролик 2:3, без звука |

Требования CrazyGames к обложкам: три формата, из текста — только название игры, без рамок и логотипов. К ролику: 15–20 секунд, без звука, без ускорения, обе ориентации, первый кадр — обложка. Всё выполнено.

## Название

- **EN:** Bossfish
- **RU:** Малёк

Игр с названием «Bossfish» поиск не нашёл. Но «boss fish» — частое словосочетание в рыболовных играх, поэтому по точному названию игру будет сложнее найти в поиске.

## Короткое описание (до 150 символов)

**EN:** Hatch as a tiny fry, eat to evolve into a herbivore, omnivore or predator, grow rocket boosters and torpedoes, and rule the deep.

**RU:** Вылупись мальком, ешь и эволюционируй в травоядную, всеядную или хищника, отрасти ракету и торпеды и стань хозяином глубин.

## Полное описание

### EN
You hatch as a tiny fry in an underwater grotto. Everything around you is bigger and hungrier.

**Eat to evolve.** Green algae make you a herbivore with protective spikes. Red bugs and smaller fish turn you into a predator with a deadly dash. Mix both and become an omnivore.

**Grow a new body every 5 levels.** Pick one of three evolutions: a huge toothy jaw, bone armour, a rocket booster, a homing torpedo launcher, an electric organ, an ink sac, a glowing lure, camouflage and more. Every evolution shows on your fish.

**Survive the deep.** Hide in weeds, grottoes, coral arches and sunken boats where bigger fish can't follow. Watch out for jellyfish, fishermen's nets and predators hunting you from off-screen.

**Become the boss fish.** Grow up to level 50, take the crown and hold it — the biggest fish is visible to everyone on the minimap.

Earn coins every round and unlock skins: Clownfish, Tiger, Neon, Goldfish and Rainbow.

Features:
- Diet-based evolution with 3 paths and 15 visible evolutions
- 50 levels, the sea grows with you
- Shelters, nets, jellyfish, food chain from bugs to giant squid
- Coins and 5 skins
- Desktop and mobile controls, English and Russian
- Auto-save, pause, procedural underwater sound

### RU
Ты вылупляешься мальком в подводном гроте. Всё вокруг больше и голоднее тебя.

**Ешь — и эволюционируй.** Зелёные водоросли делают тебя травоядной с защитными шипами. Красные жучки и мелкие рыбы превращают в хищника со смертельным рывком. Ешь всё подряд — станешь всеядной.

**Каждые 5 уровней — новое тело.** Выбирай одну из трёх эволюций: огромная зубастая пасть, костяная броня, ракетный ускоритель, торпедный аппарат с наведением, электроорган, чернильный мешок, фонарь-приманка, маскировка и другие. Каждая эволюция видна на рыбе.

**Выживай.** Прячься в водорослях, гротах, коралловых арках и обломках лодок, куда крупные рыбы не пролезут. Берегись медуз, рыбацких сетей и охотников, которые подкрадываются из-за края экрана.

**Стань главной рыбой.** Дорасти до 50 уровня, надень корону и удержи её — самую крупную рыбу видно всем на мини-карте.

За каждый раунд — монеты, за монеты — скины: Клоун, Тигровая, Неон, Золотая рыбка и Радужная.

## Управление (для поля «Controls»)

**EN:** Mouse or arrows/WASD — swim · Space or left click — dash · E or right click — torpedo · Q — shock · R — ink · 1/2/3 — pick evolution · Esc/P — pause · M — sound · H — help. Mobile: drag anywhere to swim, buttons on the right for abilities.

**RU:** Мышь или стрелки/WASD — плыть · Пробел или левая кнопка — рывок · E или правая кнопка — торпеда · Q — разряд · R — чернила · 1/2/3 — выбор эволюции · Esc/P — пауза · M — звук · H — справка. На телефоне: веди пальцем в любом месте, умения — кнопками справа.

## Метки и категория

- **Категория:** IO / Casual / Arcade
- **Метки:** fish, ocean, underwater, evolution, eat and grow, io, survival, animal, singleplayer, mobile
- **Возраст:** PEGI 12 / 7+ (мультяшные рыбы едят друг друга, без крови)

## Технически

- Один HTML-файл ~360 КБ, без внешних запросов: шрифты встроены, звук синтезируется.
- Сохранение, монеты и скины — в `localStorage`, все обращения обёрнуты в try/catch (работает в режиме инкогнито).
- Для CrazyGames «Basic Launch» SDK не обязателен. Для полного запуска и рекламы нужно будет подключить SDK площадки.
