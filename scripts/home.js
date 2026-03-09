// store all issues globally so i dont have to refetch on filter
let allIssues = [];

// label name theke tailwind color class ber korbo
const getLabelStyle = label => {
  const map = {
    bug: 'bg-red-100 text-red-600 border-red-300',
    'help wanted': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    enhancement: 'bg-teal-100 text-teal-600 border-teal-300',
    invalid: 'bg-gray-100 text-gray-500 border-gray-300',
    question: 'bg-yellow-100 text-yellow-600 border-yellow-300',
    documentation: 'bg-indigo-100 text-indigo-600 border-indigo-300',
  };
  return map[label?.toLowerCase()] ?? 'bg-purple-100 text-purple-600 border-purple-300';
};

// bug and help wanted label er jonno icon show korechi
const getLabelIcon = label => {
  const iconMap = {
    bug: `<img src="./assets/GitHub Issues Tracker_icon/BugDroid.svg" class="w-3 h-3 inline-block" alt="bug" />`,
    'help wanted': `<img src="./assets/GitHub Issues Tracker_icon/Lifebuoy.svg" class="w-3 h-3 inline-block" alt="help wanted" />`,
  };
  return iconMap[label?.toLowerCase()] ?? '';
};

// loading spinner show/hide
const showLoader = () => (document.getElementById('loader-section').style.display = 'block');
const hideLoader = () => (document.getElementById('loader-section').style.display = 'none');

// API theke shob issues fetch kori
const loadIssues = () => {
  showLoader();
  fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues')
    .then(res => res.json())
    .then(json => {
      allIssues = json.data;
      displayIssues(allIssues);
    });
};

// issues gulo card hisebe screen e dekhao
const displayIssues = issues => {
  hideLoader();
  document.getElementById('issue-count').textContent = `${issues.length} Issues`;

  const issueWrapper = document.getElementById('issue-wrapper');
  issueWrapper.innerHTML = '';

  if (issues.length === 0) {
    issueWrapper.innerHTML = `<p class="col-span-4 text-center text-gray-400 py-10">No issues found.</p>`;
    return;
  }

  for (let issue of issues) {
    // open = green border, closed = purple border
    const borderColor = issue.status === 'open' ? 'border-t-green-500' : 'border-t-purple-500';

    const priority = issue.priority ?? 'n/a';

    // priority badge color
    const priorityColor =
      priority === 'high'
        ? 'bg-orange-100 text-orange-600'
        : priority === 'medium'
          ? 'bg-blue-100 text-blue-600'
          : priority === 'low'
            ? 'bg-green-100 text-green-600'
            : 'bg-gray-100 text-gray-500';

    const labelBadges = issue.labels?.length
      ? issue.labels
          .map(
            l =>
              `<span class="text-[10px] font-semibold border px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${getLabelStyle(l)}">${getLabelIcon(l)} ${l.toUpperCase()}</span>`
          )
          .join('')
      : '<span class="text-[10px] text-gray-400">No Label</span>';

    const card = document.createElement('div');
    card.className = `bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 border-t-4 ${borderColor} cursor-pointer hover:shadow-md transition`;

    card.innerHTML = `
      <div class="flex justify-between items-center">
        ${
          issue.status === 'open'
            ? `<img src="./assets/GitHub Issues Tracker_icon/CircleDashed.svg" class="w-7 h-7" alt="open" />`
            : `<img src="./assets/GitHub Issues Tracker_icon/Ellipse 3.svg" class="w-7 h-7" style="filter: hue-rotate(200deg) saturate(0.6) brightness(0.8)" alt="closed" />`
        }
        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColor}">${priority}</span>
      </div>

      <h3 class="font-semibold text-sm text-gray-800 line-clamp-2">${issue.title}</h3>
      <p class="text-xs text-gray-500 line-clamp-3">${issue.description ?? 'No description.'}</p>

      <div class="flex flex-wrap gap-1">${labelBadges}</div>

      <div class="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100 flex flex-col gap-0.5">
        <span>#${issue.id} by <b>${issue.author ?? 'Unknown'}</b></span>
        <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
      </div>
    `;

    card.addEventListener('click', () => openModal(issue));
    issueWrapper.appendChild(card);
  }
};

// tab click e issues filter kori
const filterIssue = type => {
  showLoader();
  if (type === 'all') {
    displayIssues(allIssues);
  } else {
    const filtered = allIssues.filter(issue => issue.status === type);
    displayIssues(filtered);
  }
};

// 3 tab er data
const tabsData = [
  { id: 'btn-all', label: 'All', type: 'all' },
  { id: 'btn-open', label: 'Open', type: 'open' },
  { id: 'btn-closed', label: 'Closed', type: 'closed' },
];

// dynamically tab buttons banai and active state handle kori
const renderTabs = () => {
  const container = document.getElementById('filter-container');
  container.innerHTML = '';

  for (let tab of tabsData) {
    const btn = document.createElement('button');
    btn.id = tab.id;
    btn.textContent = tab.label;
    btn.className = `btn ${tab.type === 'all' ? 'btn-primary' : 'btn-ghost'}`;

    btn.addEventListener('click', () => {
      // shob button theke active class sore dei
      for (let t of tabsData) {
        document.getElementById(t.id).classList.remove('btn-primary');
        document.getElementById(t.id).classList.add('btn-ghost');
      }
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-ghost');
      filterIssue(tab.type);
    });

    container.appendChild(btn);
  }
};

// card click e modal e issue details dekhao
const openModal = issue => {
  const modalWrapper = document.getElementById('modal-wrapper');

  const modalLabels = issue.labels?.length
    ? issue.labels
        .map(
          l =>
            `<span class="text-xs font-semibold border px-3 py-1 rounded-full flex items-center gap-1 w-fit ${getLabelStyle(l)}">${getLabelIcon(l)} ${l.toUpperCase()}</span>`
        )
        .join('')
    : '<span class="text-xs text-gray-400">No Label</span>';

  const priority = issue.priority ?? 'n/a';
  const priorityColor =
    priority === 'high'
      ? 'bg-orange-100 text-orange-600'
      : priority === 'medium'
        ? 'bg-blue-100 text-blue-600'
        : priority === 'low'
          ? 'bg-green-100 text-green-600'
          : 'bg-gray-100 text-gray-500';

  modalWrapper.innerHTML = `
    <dialog class="modal modal-open">
      <div class="modal-box max-w-2xl">

        <div class="flex justify-between items-center mb-5">
          <h3 class="font-bold text-lg">${issue.title}</h3>
          <button onclick="closeModal()" class="btn btn-sm btn-ghost">✕</button>
        </div>

        <p class="text-sm text-gray-500 mb-5">${issue.description ?? 'No description.'}</p>

        <div class="grid grid-cols-2 gap-4 text-sm mb-5">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Author</span>
            <span class="font-medium">${issue.author ?? 'Unknown'}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Priority</span>
            <span class="text-xs font-bold uppercase px-2 py-0.5 rounded-full w-fit ${priorityColor}">${priority}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Created</span>
            <span class="font-medium">${new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Updated</span>
            <span class="font-medium">${new Date(issue.updatedAt).toLocaleDateString()}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Assignee</span>
            <span class="font-medium">${issue.assignee ?? 'Unassigned'}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Issue #</span>
            <span class="font-medium">${issue.id}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 mb-5">
          <span class="text-xs text-gray-400 uppercase tracking-wide">Labels</span>
          <div class="flex flex-wrap gap-2">${modalLabels}</div>
        </div>

        <div class="modal-action">
          <button onclick="closeModal()" class="btn btn-primary">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button onclick="closeModal()">close</button>
      </form>
    </dialog>
  `;
};

// modal band
const closeModal = () => {
  document.getElementById('modal-wrapper').innerHTML = '';
};

// search button click or Enter e API search call
document.getElementById('btn-search').addEventListener('click', () => {
  const query = document.getElementById('issue-search').value.trim();

  if (!query) {
    displayIssues(allIssues);
    return;
  }

  showLoader();
  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(json => displayIssues(json.data ?? []));
});

document.getElementById('issue-search').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-search').click();
});

// page load e tabs and issues render kora hoise ekhane,
// ?xm er por kichu bepar clear korte hobe ssupport theke must
renderTabs();
loadIssues();
