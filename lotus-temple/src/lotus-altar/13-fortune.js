/* ---------- fortune verses ---------- */
const GRADE = { top: "Supreme fortune", good: "Very auspicious", mid: "Auspicious", even: "Steady", low: "Take care" };
const FORTUNES = [
  { g: "top", p: ["The moon rises clear above the river,", "A boat drifts home on a gentle tide.", "What you have waited for arrives;", "Open the door and let it in."], a: "A long-awaited matter resolves well. Act now and accept help when it is offered." },
  { g: "good", p: ["Plum blossoms open in the late snow,", "Their fragrance reaches the far hall.", "Patience through the cold season", "Brings spring in its own time."], a: "Results come after a delay. Keep going; the timing is nearly right." },
  { g: "even", p: ["Clouds cover the mountain path,", "The traveller rests beneath a pine.", "Wait until the mist has lifted", "And the road will show itself."], a: "Do not force a decision this week. Gather more information first." },
  { g: "low", p: ["A kite pulls hard against the wind,", "Its string grows thin and frayed.", "Let out the line, do not grip tight,", "Or lose it to the sky."], a: "Loosen your hold on this matter. Pushing harder will cost you more. Rest well." },
  { g: "mid", p: ["Seeds sown in the spring field", "Need water, sun and many days.", "The farmer does not tug the shoots", "But tends the soil and waits."], a: "Steady work pays. Avoid shortcuts in money matters." },
  { g: "top", p: ["A golden carp leaps the dragon gate,", "Thunder rolls and the rain is sweet.", "The scholar's name is called aloud,", "Joy fills every room at home."], a: "Exams, interviews and new ventures go well. Celebrate with family." },
  { g: "even", p: ["The well rope is too short today,", "The bucket swings above the water.", "Tie on a length of new rope", "And drink tomorrow."], a: "Something small is missing. Ask a friend for what you lack." },
  { g: "good", p: ["Two swallows build beneath one roof,", "Their nest grows twig by twig.", "A promise kept in quiet ways", "Becomes a lasting home."], a: "Good for marriage and partnerships. Keep your word in small things." },
  { g: "low", p: ["Night rain on the lonely bridge,", "The lantern gutters in the wind.", "Turn back and wait for morning;", "The far shore is still there."], a: "Postpone travel or large purchases. Wait for a clearer sign." },
  { g: "mid", p: ["A lotus rises from the mud", "Untouched by what it grew from.", "Your trouble is the root", "Of something clean and bright."], a: "A hard situation turns into growth. Stay kind and honest." },
  { g: "even", p: ["Half the moon is lit, half dark,", "The tide is neither high nor low.", "Ask again when the moon is full", "For a fuller answer."], a: "The outcome is not yet decided. Your own effort tips the balance." },
  { g: "top", p: ["Spring wind crosses ten thousand li,", "Every branch puts on green.", "A traveller returns with treasure,", "The village gate swings wide."], a: "Travel, trade and reunions are favoured. Lost things are found." },
  { g: "mid", p: ["An old pine on the cliff edge", "Has stood through a hundred storms.", "Its roots go deep in stone,", "Its needles stay green."], a: "Health holds with care. Stay with what you know well." },
  { g: "low", p: ["Fishing in a dry pond,", "Hunting hares in a frozen field.", "The effort is not wasted", "If you learn to change the place."], a: "You are looking in the wrong place. Change direction rather than trying harder." },
  { g: "good", p: ["Lamps are lit along the river,", "A thousand lights upon the water.", "One kindness given freely", "Returns a thousandfold."], a: "Generosity brings luck now. Help someone without being asked." },
  { g: "even", p: ["The ox walks slowly up the hill,", "The cart is heavy, the road is long.", "It does not stop, it does not hurry;", "By evening it is home."], a: "Slow but sure. Do not compare your pace with others." },
  { g: "mid", p: ["Bamboo bends beneath the snow", "And springs back when the sun appears.", "Bend now, do not break;", "Your straightness will return."], a: "Give way in a dispute. Flexibility wins more than pride." },
  { g: "top", p: ["Guanyin pours the pure water,", "Her willow shakes dew upon the land.", "Fever cools and sorrow lifts,", "The household is at peace."], a: "Recovery from illness and peace at home. Give thanks with an offering." },
  { g: "low", p: ["A crack runs through the wine jar,", "Still it holds for one more day.", "Mend it now while it is small", "Before the feast is lost."], a: "Fix a small problem before it grows. Check your papers and your health." },
  { g: "good", p: ["The crane flies high above the reeds", "And sees the whole marsh at once.", "Rise above the small quarrel", "And the way becomes clear."], a: "Step back to see the bigger picture. A wise elder can help." }
];
function showFortune(n) {
  const f = FORTUNES[(n - 1) % FORTUNES.length];
  $("fHan").textContent = n;
  $("fNum").textContent = `Stick ${n} of 100`;
  $("fGrade").textContent = GRADE[f.g]; $("fGrade").dataset.g = f.g;
  $("fPoem").innerHTML = f.p.map(esc).join("<br>");
  $("fAdvice").textContent = f.a;
  $("fortune").hidden = false;
  $("shakeBtn").disabled = false; $("shakeBtn").textContent = "Shake again";
  $("fortune").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  toast(`Stick ${n} fell out: ${GRADE[f.g]}`);
}
$("shakeBtn").addEventListener("click", inHall(drawFortune));
$("chantBtn").addEventListener("click", inHall(chant));
