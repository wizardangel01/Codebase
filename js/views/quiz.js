import { h, plural, clear } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { loadCourse, findModule, loadDoc } from '../content.js';
import { store } from '../store.js';
import { createQuestion, questionSpec, correctAnswerText } from '../ui/question.js';
import { renderMarkdown } from '../lib/markdown.js';

export async function quizView({ course: cid, module: mid }) {
  const course = await loadCourse(cid);
  const m = findModule(course, mid);
  if (!m || !m.quiz) throw Object.assign(new Error('This module has no quiz.'), { notFound: true });
  const doc = await loadDoc(cid, mid, m.quiz);
  const nodes = doc.nodes.filter((n) => n.type === 'container' && n.name === 'question');
  const passMark = (doc.meta.pass ?? 70) / 100;
  const intro = doc.nodes.find((n) => n.type === 'md');
  const prev = store.quiz(m.key);
  store.setLast(`/c/${cid}/${mid}/quiz`, `${m.title}: quiz`);

  const stage = h('div.quiz-stage');
  const node = h(
    'article.page.narrow.quiz-page',
    { dataset: { line: m.line.id } },
    h('p.crumbs', h('a', { href: `#/c/${cid}` }, course.title), h('span', ' / '), h('a', { href: `#/c/${cid}/${mid}` }, m.title)),
    h('header.quiz-head', h('h1', doc.meta.title || `${m.title}: quiz`)),
    stage
  );

  let order = [];
  let results = [];
  function start() {
    order = nodes.slice();
    results = [];
    showQuestion(0);
  }

  function showIntro() {
    clear(stage);
    stage.append(
      intro ? h('div.prose', { html: renderMarkdown(intro.text) }) : h('p.lede', 'Check what you remember from this module.'),
      h('ul.quiz-facts', h('li', plural(nodes.length, 'question')), h('li', `${Math.round(passMark * 100)}% passes`), h('li', 'You see the answer after each question.'), prev ? h('li', `Your best so far: ${prev.best} of ${prev.total}`) : null),
      h('button.btn.btn-primary.btn-lg', { type: 'button', onclick: start }, icon('play', 18), prev ? 'Take it again' : 'Start the quiz')
    );
  }

  function showQuestion(i) {
    clear(stage);
    const nextBtn = h('button.btn.btn-primary', { type: 'button', hidden: true, onclick: () => (i + 1 < order.length ? showQuestion(i + 1) : showResults()) }, i + 1 < order.length ? 'Next question' : 'See my score', icon('arrow-right', 16));
    const q = createQuestion(order[i], {
      key: m.key + '/quiz',
      mode: 'quiz',
      onResult: (correct) => {
        results[i] = correct;
        nextBtn.hidden = false;
        nextBtn.focus({ preventScroll: false });
      },
    });
    stage.append(h('div.quiz-progress', h('span', `Question ${i + 1} of ${order.length}`), h('div.progress-bar', h('i', { style: { width: (i / order.length) * 100 + '%' } }))), q, h('div.q-next', nextBtn));
  }

  function showResults() {
    const correct = results.filter(Boolean).length;
    const total = order.length;
    const passed = correct / total >= passMark;
    const gained = store.recordQuiz(m.key, correct, total, passMark);
    const missed = order.map((n, i) => ({ n, i })).filter(({ i }) => !results[i]);
    const nextHref = m.game ? `#/c/${cid}/${mid}/game` : `#/c/${cid}/${mid}`;
    clear(stage);
    stage.append(
      ...[
      h(
        'section.quiz-result' + (passed ? '.is-pass' : '.is-fail'),
        h('div.score', h('strong', `${correct}`), h('span', `of ${total}`)),
        h('h2', passed ? (correct === total ? 'Perfect score' : 'You passed') : 'Not quite there yet'),
        h('p', passed ? (gained ? `You earned ${gained} XP.` : 'Your best score is saved.') : `You need ${Math.ceil(passMark * total)} correct to pass. Review the answers below, then try again.`),
        h(
          'div.btn-row',
          h('button.btn.btn-secondary', { type: 'button', onclick: start }, icon('reset', 16), 'Try again'),
          passed ? h('a.btn.btn-primary', { href: nextHref }, m.game ? icon('gamepad', 16) : null, m.game ? 'On to the game' : 'Back to the module', icon('arrow-right', 16)) : h('a.btn.btn-primary', { href: `#/c/${cid}/${mid}` }, 'Review the lessons')
        )
      ),
      missed.length
        ? h(
            'section.quiz-review',
            h('h2', `Review: ${plural(missed.length, 'question')} to revisit`),
            missed.map(({ n }) => {
              const spec = questionSpec(n);
              return h('div.review-item', h('div.prose', { html: renderMarkdown(spec.prompt) }), h('p', h('strong', 'Answer: '), h('span.review-answer', correctAnswerText(spec))), spec.explain ? h('div.prose.q-explain', { html: renderMarkdown(spec.explain) }) : null);
            })
          )
        : null
    ].filter(Boolean));
    stage.scrollIntoView({ block: 'start' });
  }

  showIntro();
  return { node, title: `Quiz · ${m.title}` };
}
