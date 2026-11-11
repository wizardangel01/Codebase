import { h, formatDate } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { loadCourse, moduleProgress } from '../content.js';
import { store } from '../store.js';
import { SITE } from '../config.js';

export async function certificateView({ course: cid }) {
  const course = await loadCourse(cid);
  const s = store.state;
  const real = course.modules.filter((m) => !m.missing);
  const done = real.filter((m) => moduleProgress(m, s).complete).length;
  const complete = real.length > 0 && done === real.length;

  if (!complete) {
    return {
      title: 'Certificate',
      node: h(
        'section.page.narrow',
        h('h1', 'Certificate'),
        h('p', `The certificate unlocks when every module is complete. You have finished ${done} of ${real.length}.`),
        h('a.btn.btn-primary', { href: `#/c/${cid}` }, icon('map', 16), 'Back to the course map')
      ),
    };
  }

  const when = Math.max(...real.map((m) => store.game(m.key).done || (store.quiz(m.key) && store.quiz(m.key).ts) || 0), Date.now() - 1) || Date.now();
  const nameField = h('input.input.cert-name', { type: 'text', value: s.name, placeholder: 'Type your name', maxlength: 60, 'aria-label': 'Name on the certificate' });
  const nameOut = h('p.cert-person', s.name || 'Your name');
  nameField.addEventListener('input', () => {
    nameOut.textContent = nameField.value || 'Your name';
    store.setName(nameField.value.trim());
  });

  const node = h(
    'section.page.cert-page',
    h('div.cert-controls', h('h1', 'Your certificate'), h('div.field', h('label', 'Name on the certificate'), nameField), h('button.btn.btn-primary', { type: 'button', onclick: () => window.print() }, icon('printer', 16), 'Print or save as PDF')),
    h(
      'div.certificate',
      h('p.cert-site', SITE.name),
      h('h2', 'Certificate of completion'),
      h('p.cert-lead', 'This certifies that'),
      nameOut,
      h('p.cert-lead', 'completed every lesson, exercise set, quiz and game in'),
      h('p.cert-course', course.title),
      h('p.cert-date', formatDate(when)),
      h('ul.cert-modules', real.map((m) => h('li', { dataset: { line: m.line.id } }, m.title))),
      h('p.cert-fine', 'A self-paced course certificate. It records what you completed here and is not an accredited qualification.')
    )
  );
  return { node, title: 'Certificate' };
}
