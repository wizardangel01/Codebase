import { h } from '../lib/util.js';
import { icon } from '../lib/icons.js';
import { runner } from '../py/runner.js';
import { offlineSupported, loadManifest, savedSoFar, saveAll, megabytes } from '../offline.js';
import { gateOn } from '../auth.js';
import { toast } from '../ui/toast.js';
import { QUOTE_CHOICES, quoteSetting, setQuoteSetting, showQuoteNow } from '../ui/quote-card.js';

function qa(q, ...a) {
  return h('details.faq', h('summary', q), h('div.prose', ...a));
}

/** The "Learn offline" card: one button that keeps the whole course on this device. */
function offlineCard() {
  const status = h('p.offline-status', { 'aria-live': 'polite' }, 'Checking what is saved on this device…');
  const fill = h('i', { style: { width: '0%' } });
  const bar = h('div.progress-bar', { hidden: true, role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': 0, 'aria-label': 'Saving the course' }, fill);
  const btn = h('button.btn.btn-primary', { type: 'button', hidden: true }, icon('download', 16), 'Save the course for offline use');
  const card = h(
    'section.offline-card',
    h('h2', 'Learn without internet'),
    h('p', 'One tap keeps every lesson, quiz, game and the Python engine on this device. You download them once, and afterwards the whole course opens with no connection and no data. Your progress is already stored on this device.'),
    status,
    bar,
    h('div.btn-row', btn)
  );

  if (!offlineSupported()) {
    status.textContent = 'This browser cannot keep the site for offline use. Lessons still work while you are online.';
    return card;
  }

  let manifest = null;
  let busy = false;
  const label = (text, name = 'download') => btn.replaceChildren(icon(name, 16), text);
  const show = (pct) => {
    fill.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  };

  async function refresh() {
    try {
      manifest = manifest || (await loadManifest());
    } catch {
      status.textContent = 'This copy of the site has no file list, so the save button is not available here. Lessons you open are still kept on your device as you go.';
      btn.hidden = true;
      return;
    }
    let saved;
    try {
      saved = await savedSoFar(manifest);
    } catch {
      status.textContent = 'This browser will not keep files for offline use here (private windows often cannot). Lessons still work while you are online.';
      btn.hidden = true;
      return;
    }
    btn.hidden = false;
    btn.disabled = false;
    if (saved.have >= saved.total) {
      status.textContent = `Saved. All ${saved.total} files are on this device (${megabytes(manifest.bytes)}), so the course works without internet.`;
      btn.className = 'btn btn-secondary';
      label('Check for updates and save again', 'reset');
    } else {
      status.textContent = `Not saved yet. ${saved.have} of ${saved.total} files are on this device. Saving the whole course downloads about ${megabytes(manifest.bytes)}, so Wi-Fi is best.`;
      btn.className = 'btn btn-primary';
      label(`Save the course (${megabytes(manifest.bytes)})`);
    }
  }

  btn.addEventListener('click', async () => {
    if (busy || !manifest) return;
    busy = true;
    btn.disabled = true;
    bar.hidden = false;
    show(0);
    status.textContent = 'Saving… keep this page open.';
    try {
      const res = await saveAll(manifest, ({ done, total, bytes }) => {
        show((bytes / manifest.bytes) * 100);
        status.textContent = `Saving… ${done} of ${total} files (${megabytes(bytes)} of ${megabytes(manifest.bytes)}). Keep this page open.`;
      });
      show(100);
      await refresh();
      if (res.failed.length) status.textContent = `Saved all but ${res.failed.length} of ${res.total} files. Check your connection and press the button again.`;
    } catch (err) {
      status.textContent = err.message || 'Saving stopped. Check your connection and try again.';
      btn.disabled = false;
    } finally {
      busy = false;
      setTimeout(() => (bar.hidden = true), 1200);
    }
  });

  refresh();
  return card;
}

/** The "Motivational quotes" card: how often one appears, and a button to see one now. */
function quotesCard() {
  const select = h(
    'select.select#quote-freq',
    {
      onchange: () => {
        setQuoteSetting(select.value);
        const label = QUOTE_CHOICES.find((c) => c.value === select.value).label;
        toast(select.value === 'off' ? 'Quotes are off' : `Quotes: ${label.toLowerCase()}`, { icon: 'check' });
      },
    },
    QUOTE_CHOICES.map((c) => h('option', { value: c.value }, c.label))
  );
  select.value = quoteSetting();
  return h(
    'section.quotes-card',
    h('h2', 'Motivational quotes'),
    h('p', 'A short quote appears in the corner now and then. It waits for a calm moment: never while you are typing, running code, taking a quiz or playing a game. It fades away by itself, and the × button closes it sooner.'),
    h('div.field', h('label', { for: 'quote-freq' }, 'How often'), select),
    h('div.btn-row', h('button.btn.btn-secondary', { type: 'button', onclick: showQuoteNow }, icon('sparkle', 16), 'Show one now'))
  );
}

export async function helpView() {
  const node = h(
    'section.page.narrow.help-page',
    h('h1', 'Help'),
    h('p.lede', 'How the site works, and what to do when something does not.'),
    offlineCard(),
    quotesCard(),
    h(
      'section',
      h('h2', 'Using the course'),
      qa('How is the course organised?', h('p', 'The course is a route with five lines. Each line has three modules, and each module has lessons, a quiz and a game. Take them in order or jump to any station. Nothing is locked.')),
      qa('What counts as finishing a lesson?', h('p', 'Press “Finish lesson” at the bottom. Exercises are optional for finishing, but they are where most of the learning happens, so do them.')),
      qa('How do the exercises check my code?', h('p', 'Each exercise runs your program, then runs its own checks against what your code printed or defined. Failed checks say what they expected and what they got. Hints appear one at a time, and the model solution unlocks after two failed attempts or when you have used every hint.')),
      qa('What are the games?', h('p', 'Every module ends with a game. Some are programmed by writing Python (you give a rover instructions, or write a function that plays), others are quick rounds where you predict output or fix bugs. Stars are awarded for cleaner solutions, and you can replay any level.'))
    ),
    h(
      'section',
      h('h2', 'Running Python'),
      qa('Where does the Python run?', h('p', 'In your browser, using Pyodide (CPython compiled to WebAssembly). Your code never leaves your device. The first run downloads about 13 MB; after that it is stored on your device and also works offline.')),
      qa('Why does the first run take a while?', h('p', 'The Python engine is downloaded once. A progress bar shows it. On later visits it starts in a couple of seconds.')),
      qa('How does input() work?', h('p', 'In Chrome, Edge and other Chromium browsers, the program pauses and a box appears in the output panel for you to type into. In other browsers, type your answers into the “Program input” box above the output, one line per input() call, before you press Run.')),
      qa('My program says it ran too long.', h('p', 'Programs are stopped after 10 seconds so a loop that never ends cannot freeze the page. Check that every while loop eventually changes its condition. You can also press Stop at any time.')),
      qa('What cannot I do?', h('p', 'There is no internet access, no threads, no windows (tkinter, turtle) and no third-party packages such as numpy. The whole standard library, including json, csv, sqlite3, random, datetime, collections and asyncio, is available. Files you create live only for the duration of one run.'))
    ),
    h(
      'section',
      h('h2', 'Your progress'),
      qa('Where is my progress stored?', h('p', 'Only in this browser, on this device. There are no accounts. Download a backup from the Progress page to keep it safe or to move it to another device. Clearing your browser data erases it.')),
      qa('Is anything sent to a server?', h('p', 'No. The site is a set of static files. There is no tracking and there are no accounts.' + (gateOn() ? ' The password is checked on your device: what you type is never sent anywhere.' : ''))),
      gateOn()
        ? qa(
            'Why does the site ask for a password, and how do I log out?',
            h('p', 'The course is shared with a password. If you have lost it, ask the person who gave you the link. “Keep me logged in on this device” makes this device remember you for 30 days. “Log out” at the bottom of any page makes the site ask again. Logging out does not delete your progress.')
          )
        : null
    ),
    h(
      'section',
      h('h2', 'Keyboard shortcuts in the editor'),
      h(
        'div.tbl',
        h(
          'table',
          h('thead', h('tr', h('th', 'Keys'), h('th', 'What happens'))),
          h(
            'tbody',
            row('Ctrl+Enter (Cmd+Enter on Mac)', 'Run the code, or check the exercise'),
            row('Tab, Shift+Tab', 'Indent or un-indent the selected lines'),
            row('Ctrl+/ (Cmd+/)', 'Comment or uncomment the selected lines'),
            row('Esc, then Tab', 'Leave the editor without indenting')
          )
        )
      )
    ),
    h(
      'section',
      h('h2', 'Troubleshooting'),
      qa('Nothing happens when I press Run.', h('p', 'Open the site from its web address (https://…), not from a downloaded file: browsers do not allow Python to start from a file:// address. If you are running it locally, start a small web server in the project folder, for example “python -m http.server 8000”, and visit http://localhost:8000.')),
      qa('Python could not start.', h('p', 'You need a recent version of Chrome, Edge, Firefox or Safari. If it says it ran out of memory, close other tabs and reload.')),
      h('p.muted', runner.status === 'ready' ? 'The Python engine is loaded and ready.' : 'The Python engine has not been loaded in this visit yet.')
    )
  );
  return { node, title: 'Help' };
}

function row(a, b) {
  return h('tr', h('td', h('kbd', a)), h('td', b));
}
