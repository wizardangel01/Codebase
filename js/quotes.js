// The motivational quotes (js/ui/quote-card.js shows one now and then). One per line: [the quote, who said it].
// Leave the second part empty ('') for a line without a name under it.
//
// Change this list freely: add your favourites, take lines out. Nothing else needs to change. Keep each quote short
// (under about 130 characters) so that it fits the small card on a phone. tools/quotes.mjs checks the list.
//
// The first lines are written for this course. The named ones are proverbs and writers whose words are very old, so
// the name beside each can be trusted: many modern "famous quotes" are credited to the wrong person.
const LIST = [
  ["Every program you admire began as a few lines that did not work yet.", ""],
  ["An error message is not a verdict. It is a clue.", ""],
  ["You do not need to understand everything today. Understand the next small thing.", ""],
  ["Confusion is what learning feels like just before it clicks.", ""],
  ["Ten minutes of practice today beats a perfect plan for someday.", ""],
  ["Every bug you fix makes you someone who can fix bugs.", ""],
  ["Progress is not a straight line. Take a breath, then run it again.", ""],
  ["Mistakes are how the computer teaches you to be precise.", ""],
  ["Today's hard problem is next month's easy one.", ""],
  ["Curiosity is a skill. Keep asking: what happens if I change this?", ""],
  ["Type it, run it, break it, fix it. That is how programmers are made.", ""],
  ["Good programmers are not the ones who never get stuck. They are the ones who get unstuck.", ""],
  ["One more exercise. One more line. One more level.", ""],
  ["Be patient with yourself. Beginners are allowed to be slow.", ""],
  ["A streak is just a lot of small decisions in a row.", ""],
  ["You have already learned things that once looked impossible. This is one more.", ""],
  ["Being stuck means you are at the edge of what you know. That is where you grow.", ""],
  ["Your chapter one is allowed to look like chapter one.", ""],
  ["Rest is part of the work. Come back with fresh eyes and the bug often shows itself.", ""],
  ["Write a little. Run it. Learn something. Repeat.", ""],
  ["The computer does exactly what you say. Learning to say it clearly is the whole craft.", ""],
  ["Courage, in programming, looks like pressing Run.", ""],
  ["You are building a way of thinking, not just memorising Python.", ""],
  ["Small steps still move you forward. Keep going.", ""],
  ["Read the error message slowly. It is usually trying to help.", ""],
  ["Doing the exercise yourself, even badly, teaches more than reading the answer.", ""],
  ["Showing up today matters more than showing off today.", ""],
  ["A journey of a thousand miles begins with a single step.", "Lao Tzu"],
  ["Fall seven times, stand up eight.", "Japanese proverb"],
  ["Little strokes fell great oaks.", "Benjamin Franklin"],
  ["Well done is better than well said.", "Benjamin Franklin"],
  ["He that can have patience can have what he will.", "Benjamin Franklin"],
  ["Slow and steady wins the race.", "Aesop's fables"],
  ["Fortune favours the bold.", "Latin proverb"],
  ["Through hardships to the stars.", "Latin motto"],
  ["The best way out is always through.", "Robert Frost"],
  ["Nothing great was ever achieved without enthusiasm.", "Ralph Waldo Emerson"],
  ["Great works are performed not by strength but by perseverance.", "Samuel Johnson"],
  ["A drop hollows out the stone, not by force but by falling often.", "Ovid"],
  ["It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.", "Seneca"],
  ["They can because they think they can.", "Virgil"],
  ["Little by little, the bird builds its nest.", "Proverb"],
  ["The roots of education are bitter, but the fruit is sweet.", "Attributed to Aristotle"],
  ["The Analytical Engine weaves algebraical patterns just as the Jacquard loom weaves flowers and leaves.", "Ada Lovelace, 1843"],
];

export const QUOTES = LIST.map(([text, by]) => ({ text, by: by ? '\u2014 ' + by : '' }));
