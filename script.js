const STORAGE_KEY = 'vocabCards';
const defaultWords = [
  {
    word: 'apple',
    translation: '蘋果',
    partOfSpeech: '名詞',
    example: 'I eat an apple every day.',
    root: 'apple：源自古英語 æppel，表示圓形果實。',
  },
  {
    word: 'discover',
    translation: '發現',
    partOfSpeech: '動詞',
    example: 'She discovered a small cave behind the waterfall.',
    root: 'dis- 表示否定，cover 覆蓋 → 露出、發現。',
  },
  {
    word: 'energy',
    translation: '能量',
    partOfSpeech: '名詞',
    example: 'The machine uses a lot of energy.',
    root: 'en- 表示使..., erg- 表示工作。',
  },
];

const elements = {
  tabStudy: document.getElementById('tab-study'),
  tabManage: document.getElementById('tab-manage'),
  studyView: document.getElementById('study-view'),
  manageView: document.getElementById('manage-view'),
  vocabCard: document.getElementById('vocab-card'),
  cardWord: document.getElementById('card-word'),
  cardTranslation: document.getElementById('card-translation'),
  cardPos: document.getElementById('card-pos'),
  cardExample: document.getElementById('card-example'),
  cardRoot: document.getElementById('card-root'),
  prevWord: document.getElementById('prev-word'),
  nextWord: document.getElementById('next-word'),
  manageForm: document.getElementById('manage-form'),
  wordInput: document.getElementById('word-input'),
  translationInput: document.getElementById('translation-input'),
  posInput: document.getElementById('pos-input'),
  exampleInput: document.getElementById('example-input'),
  rootInput: document.getElementById('root-input'),
  autoFill: document.getElementById('auto-fill'),
  resetForm: document.getElementById('reset-form'),
  statusMessage: document.getElementById('status-message'),
  wordListItems: document.getElementById('word-list-items'),
};

let vocabCards = [];
let currentIndex = 0;
let editingIndex = -1;

function loadCards() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        vocabCards = parsed;
        return;
      }
    } catch (error) {
      console.warn('無法解析儲存資料', error);
    }
  }
  vocabCards = defaultWords;
  saveCards();
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabCards));
}

function renderCard() {
  if (vocabCards.length === 0) {
    elements.cardWord.textContent = '尚無單字';
    elements.cardTranslation.textContent = '-';
    elements.cardPos.textContent = '-';
    elements.cardExample.textContent = '-';
    elements.cardRoot.textContent = '-';
    return;
  }

  const wordData = vocabCards[currentIndex];
  elements.cardWord.textContent = wordData.word || '-';
  elements.cardTranslation.textContent = wordData.translation || '暫無翻譯';
  elements.cardPos.textContent = wordData.partOfSpeech || '暫無資料';
  elements.cardExample.textContent = wordData.example || '暫無例句';
  elements.cardRoot.textContent = wordData.root || '暫無分析';
}

function renderWordList() {
  elements.wordListItems.innerHTML = '';
  if (vocabCards.length === 0) {
    elements.wordListItems.innerHTML = '<p>目前尚未新增任何單字。</p>';
    return;
  }

  vocabCards.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.innerHTML = `
      <strong>${item.word}</strong>
      <small>翻譯：${item.translation || '無'} · 詞性：${item.partOfSpeech || '無'}</small>
      <p>${item.example || '暫無例句'}</p>
      <small>${item.root || '暫無字根分析'}</small>
      <div class="card-actions">
        <button type="button" data-action="edit" data-index="${index}">編輯</button>
        <button type="button" data-action="delete" data-index="${index}">刪除</button>
      </div>
    `;
    elements.wordListItems.appendChild(card);
  });
}

function showMessage(text, isError = false) {
  elements.statusMessage.textContent = text;
  elements.statusMessage.style.color = isError ? '#ffb4b4' : '#a3d9a5';
}

function updateStudyIndex(delta) {
  if (vocabCards.length === 0) return;
  currentIndex = (currentIndex + delta + vocabCards.length) % vocabCards.length;
  elements.vocabCard.classList.remove('flipped');
  renderCard();
}

function switchTab(toManage) {
  elements.studyView.classList.toggle('active', !toManage);
  elements.manageView.classList.toggle('active', toManage);
  elements.tabStudy.classList.toggle('active', !toManage);
  elements.tabManage.classList.toggle('active', toManage);
}

function resetForm() {
  editingIndex = -1;
  elements.manageForm.reset();
  showMessage('欄位已清除。');
}

function fillFormForEdit(index) {
  const item = vocabCards[index];
  if (!item) return;
  editingIndex = index;
  elements.wordInput.value = item.word;
  elements.translationInput.value = item.translation || '';
  elements.posInput.value = item.partOfSpeech || '';
  elements.exampleInput.value = item.example || '';
  elements.rootInput.value = item.root || '';
  showMessage(`正在編輯「${item.word}」。`);
  switchTab(true);
}

function applyWordListEvents() {
  elements.wordListItems.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const index = Number(button.dataset.index);
    if (action === 'edit') {
      fillFormForEdit(index);
    } else if (action === 'delete') {
      vocabCards.splice(index, 1);
      if (currentIndex >= vocabCards.length) {
        currentIndex = Math.max(vocabCards.length - 1, 0);
      }
      saveCards();
      renderWordList();
      renderCard();
      showMessage('已刪除單字。');
    }
  });
}

async function fetchDictionaryData(word) {
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('無法取得字典資料');
  }
  return response.json();
}

async function fetchTranslation(word) {
  const apiUrl = 'https://libretranslate.com/translate';
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: word, source: 'en', target: 'zh', format: 'text' }),
  });

  if (!response.ok) {
    throw new Error('翻譯 API 錯誤');
  }
  const data = await response.json();
  if (data && data.translatedText) {
    return data.translatedText;
  }
  throw new Error('無法解析翻譯結果');
}

function extractRootInfo(entry) {
  if (!entry) return '';
  if (entry.origin) {
    return entry.origin;
  }
  const word = entry.word || '';
  const suffixes = ['ing', 'ed', 'ly', 'tion', 'sion', 'able', 'ible'];
  const match = suffixes.find((suffix) => word.toLowerCase().endsWith(suffix));
  if (match) {
    return `此單字可能包含後綴 ${match}。`; 
  }
  return '暫無字根分析資料。';
}

async function autoFillFields() {
  const word = elements.wordInput.value.trim();
  if (!word) {
    showMessage('請先輸入英文單字。', true);
    return;
  }

  showMessage('正在自動填入資料，請稍候...');
  elements.autoFill.disabled = true;

  try {
    const dictionaryData = await fetchDictionaryData(word);
    if (Array.isArray(dictionaryData) && dictionaryData.length > 0) {
      const entry = dictionaryData[0];
      const meaning = entry.meanings && entry.meanings[0];
      const definition = meaning?.definitions?.[0];
      elements.posInput.value = meaning?.partOfSpeech || '';
      elements.exampleInput.value = definition?.example || '';
      elements.rootInput.value = extractRootInfo(entry);
    }

    try {
      const translation = await fetchTranslation(word);
      elements.translationInput.value = translation;
    } catch (translateError) {
      console.warn('翻譯 API 失敗', translateError);
      if (!elements.translationInput.value) {
        elements.translationInput.value = '翻譯 API 無回應，請手動輸入。';
      }
    }

    showMessage('自動填入完成，請檢查欄位內容。');
  } catch (error) {
    console.error(error);
    showMessage('自動填入失敗，請確認英文單字或稍後再試。', true);
  } finally {
    elements.autoFill.disabled = false;
  }
}

function saveForm(event) {
  event.preventDefault();
  const word = elements.wordInput.value.trim();
  if (!word) {
    showMessage('英文單字為必填。', true);
    return;
  }

  const item = {
    word,
    translation: elements.translationInput.value.trim(),
    partOfSpeech: elements.posInput.value.trim(),
    example: elements.exampleInput.value.trim(),
    root: elements.rootInput.value.trim(),
  };

  if (editingIndex >= 0 && editingIndex < vocabCards.length) {
    vocabCards[editingIndex] = item;
    showMessage(`已更新「${word}」。`);
  } else {
    const exists = vocabCards.some((entry) => entry.word.toLowerCase() === word.toLowerCase());
    if (exists) {
      showMessage('單字已存在，請編輯現有單字或輸入新的單字。', true);
      return;
    }
    vocabCards.push(item);
    currentIndex = vocabCards.length - 1;
    showMessage(`已新增「${word}」。`);
  }

  saveCards();
  renderWordList();
  renderCard();
  resetForm();
}

function setupEvents() {
  elements.tabStudy.addEventListener('click', () => switchTab(false));
  elements.tabManage.addEventListener('click', () => switchTab(true));
  elements.vocabCard.addEventListener('click', () => {
    elements.vocabCard.classList.toggle('flipped');
  });
  elements.vocabCard.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      elements.vocabCard.classList.toggle('flipped');
    }
  });
  elements.prevWord.addEventListener('click', () => updateStudyIndex(-1));
  elements.nextWord.addEventListener('click', () => updateStudyIndex(1));
  elements.autoFill.addEventListener('click', autoFillFields);
  elements.manageForm.addEventListener('submit', saveForm);
  elements.resetForm.addEventListener('click', resetForm);
}

function initialize() {
  loadCards();
  renderCard();
  renderWordList();
  setupEvents();
}

initialize();
