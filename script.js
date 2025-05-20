document.addEventListener('DOMContentLoaded', () => {
    const overallProgressSpan = document.getElementById('overallProgress');
    const clearButton = document.getElementById('clearButton');
    const languageSelector = document.getElementById('languageSelector');
    const checklistProgressStorageKey = 'darkSoulsChecklistProgress';
    const languageStorageKey = 'voidStrangerChecklistLanguage';

    const allChecklistSections = document.querySelectorAll('.checklist-section');
    const masterChecklistSection = document.getElementById('masterChecklistSection');
    const gameChecklistSections = Array.from(allChecklistSections).filter(section => section.id !== 'masterChecklistSection');

    const translations = {
        en: {
            pageTitle: "Mementos Checklist",
            mainTitle: "Mementos Checklist",
            masterChecklistTitle: "Checklist",
            domainSuffix: "'s Domain", // For Add's Domain, Eus's Domain etc.
            alphabetDomain: "Alphabet Domain",
            secretMementos: "Secret Mementos",
            chambersSuffix: " Chambers", // For Void Lord Chambers
            voidLordChambersSectionTitle: "Void Lord", // Only "Void Lord" part for the H2
            shortcuts: "Shortcuts", // Section title
            shortcutPrefix: "Shortcut", // For "Shortcut 1", "Shortcut 2"
            developerRoom: "Developer Room",
            levsChamberItem: "Lev's Chamber",
            beesStinkyHole: "Bee's Stinky Hole",
            monsLair: "Mon's Lair",
            clearButton: "Reset all checklists",
            doneStatus: "[DONE]",
            confirmReset: "Are you sure you want to reset all checklists?",
            alertReset: "Checklist has been reset!"
        },
        ko: {
            pageTitle: "메멘토 체크리스트",
            mainTitle: "메멘토 체크리스트",
            masterChecklistTitle: "체크리스트",
            domainSuffix: "의 영역",
            alphabetDomain: "알파벳 영역",
            secretMementos: "비밀 메멘토",
            chambersSuffix: "의 방",
            voidLordChambersSectionTitle: "공허 군주",
            shortcuts: "지름길",
            shortcutPrefix: "지름길",
            developerRoom: "개발자 방",
            levsChamberItem: "Lev의 방",
            beesStinkyHole: "Bee의 악취나는 구멍",
            monsLair: "Mon의 은신처",
            clearButton: "모든 체크리스트 초기화",
            doneStatus: "[완료]",
            confirmReset: "정말 모든 체크리스트를 초기화하시겠습니까?",
            alertReset: "체크리스트가 초기화되었습니다!"
        },
        ja: {
            pageTitle: "メメントチェックリスト",
            mainTitle: "メメントチェックリスト",
            masterChecklistTitle: "チェックリスト",
            domainSuffix: "の領域",
            alphabetDomain: "アルファベット領域",
            secretMementos: "秘密のメメント",
            chambersSuffix: "の部屋",
            voidLordChambersSectionTitle: "虚無の君主",
            shortcuts: "ショートカット",
            shortcutPrefix: "ショートカット",
            developerRoom: "開発者ルーム",
            levsChamberItem: "Levの部屋",
            beesStinkyHole: "Beeの臭い穴",
            monsLair: "Monの隠れ家",
            clearButton: "全てのチェックリストをリセット",
            doneStatus: "[完了]",
            confirmReset: "本当にすべてのチェックリストを初期化しますか？",
            alertReset: "チェックリストが初期化されました！"
        },
        'zh-CN': {
            pageTitle: "Mementos 清单",
            mainTitle: "Mementos 清单",
            masterChecklistTitle: "清单",
            domainSuffix: "的领域",
            alphabetDomain: "字母领域",
            secretMementos: "秘密 Mementos",
            chambersSuffix: "的房间",
            voidLordChambersSectionTitle: "虚空领主",
            shortcuts: "快捷方式",
            shortcutPrefix: "快捷方式",
            developerRoom: "开发者房间",
            levsChamberItem: "Lev的房间",
            beesStinkyHole: "Bee的臭洞",
            monsLair: "Mon的巢穴",
            clearButton: "重置所有清单",
            doneStatus: "[已完成]",
            confirmReset: "您确定要重置所有清单吗？",
            alertReset: "清单已重置！"
        },
        'zh-TW': {
            pageTitle: "Mementos 清單",
            mainTitle: "Mementos 清單",
            masterChecklistTitle: "清單",
            domainSuffix: "的領域",
            alphabetDomain: "字母領域",
            secretMementos: "秘密 Mementos",
            chambersSuffix: "的房間",
            voidLordChambersSectionTitle: "虛空領主",
            shortcuts: "捷徑",
            shortcutPrefix: "捷徑",
            developerRoom: "開發者房間",
            levsChamberItem: "Lev的房間",
            beesStinkyHole: "Bee的臭洞",
            monsLair: "Mon的巢穴",
            clearButton: "重設所有清單",
            doneStatus: "[已完成]",
            confirmReset: "您確定要重設所有清單嗎？",
            alertReset: "清單已重設！"
        }
    };

    let currentLanguage = 'ko';

    function updateUIText(lang) {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        localStorage.setItem(languageStorageKey, lang);

        const trans = translations[lang];
        if (!trans) {
            console.error(`Translations not found for language: ${lang}`);
            return;
        }

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (trans[key]) {
                // For elements that are part of a larger text (like suffixes in labels or H2s)
                if (element.tagName === 'SPAN' && (key === 'domainSuffix' || key === 'chambersSuffix' || key === 'shortcutPrefix')) {
                    element.textContent = trans[key];
                     // Special handling for H2 titles with suffixes
                    if (element.parentElement.tagName === 'H2') {
                        // Ensure the H2's structure is: ProperName + TranslatedSuffix + ProgressSpan
                        const h2 = element.parentElement;
                        const progressSpan = h2.querySelector('.section-progress');
                        // Reconstruct H2 content carefully
                        // The proper name part is the text node before the span with data-translate-key
                        let properName = "";
                        h2.childNodes.forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                                properName = node.textContent.trim();
                            }
                        });
                        h2.textContent = ''; // Clear existing content
                        h2.appendChild(document.createTextNode(properName + " ")); // Add proper name
                        element.textContent = trans[key]; // Set suffix on the span
                        h2.appendChild(element); // Add suffix span
                        if (progressSpan) {
                             h2.appendChild(document.createTextNode(" ")); // Add space before progress
                             h2.appendChild(progressSpan); // Add progress span
                        }
                    } else if (element.parentElement.tagName === 'LABEL' && key === 'shortcutPrefix') {
                        // For "Shortcut X" labels, the number is a text node after the span
                        const label = element.parentElement;
                        const numberNode = element.nextSibling; // Should be the text node with the number
                        label.textContent = ''; // Clear
                        element.textContent = trans[key]; // Set "Shortcut"
                        label.appendChild(element);
                        if (numberNode && numberNode.nodeType === Node.TEXT_NODE) {
                            label.appendChild(document.createTextNode(numberNode.textContent)); // Add " X"
                        }
                    } else if (element.parentElement.tagName === 'LABEL') { // For domainSuffix in master list labels
                        const label = element.parentElement;
                        let properName = "";
                         label.childNodes.forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                                properName = node.textContent.trim();
                            }
                        });
                        label.textContent = '';
                        label.appendChild(document.createTextNode(properName));
                        element.textContent = trans[key];
                        label.appendChild(element);
                    }

                }
                // For H1 title, preserve the overallProgress span
                else if (element.tagName === 'H1' && key === 'mainTitle') {
                    const progressSpan = element.querySelector('#overallProgress');
                    element.textContent = trans[key];
                    if (progressSpan) element.appendChild(progressSpan);
                }
                // For H2 titles that are fully translated or have a suffix span
                else if (element.tagName === 'H2') {
                    const progressSpan = element.querySelector('.section-progress');
                    // If H2 has a child span for suffix, it's handled above.
                    // This handles H2s that are fully translated by their key.
                    if (!element.querySelector('span[data-translate-key]')) {
                        element.textContent = trans[key] + " ";
                        if (progressSpan) element.appendChild(progressSpan);
                    }
                }
                 // For regular labels or other elements
                else {
                    element.textContent = trans[key];
                }
            }
        });
        
        // Handle Void Lord Chambers H2 separately as it's "Void Lord" + suffix
        const voidLordChambersH2 = document.querySelector('#voidLordChambers > h2');
        if (voidLordChambersH2) {
            const progressSpan = voidLordChambersH2.querySelector('.section-progress');
            const suffixSpan = voidLordChambersH2.querySelector('span[data-translate-key="chambersSuffix"]');
            voidLordChambersH2.textContent = ''; // Clear
            voidLordChambersH2.appendChild(document.createTextNode(translations.en.voidLordChambersSectionTitle)); // "Void Lord" (or could be from trans[voidLordChambersSectionTitle])
            if (suffixSpan) {
                suffixSpan.textContent = trans.chambersSuffix;
                voidLordChambersH2.appendChild(suffixSpan);
            }
            if (progressSpan) {
                voidLordChambersH2.appendChild(document.createTextNode(" "));
                voidLordChambersH2.appendChild(progressSpan);
            }
        }


        if (trans.pageTitle) {
            document.title = trans.pageTitle;
        }
        updateAllProgressDisplays();
    }


    function loadProgress() {
        const savedLang = localStorage.getItem(languageStorageKey) || 'ko';
        languageSelector.value = savedLang;
        // updateUIText must be called BEFORE progress display updates to get correct [DONE] text
        updateUIText(savedLang);

        const savedProgress = localStorage.getItem(checklistProgressStorageKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            allChecklistSections.forEach(section => {
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if (progress[checkbox.id] !== undefined) {
                        checkbox.checked = progress[checkbox.id];
                        updateLabelStyle(checkbox);
                    }
                });
            });
        }
        updateAllProgressDisplays(); // This will now use the correct language for [DONE]
    }

    function saveProgress() {
        const progress = {};
        allChecklistSections.forEach(section => {
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                progress[checkbox.id] = checkbox.checked;
            });
        });
        localStorage.setItem(checklistProgressStorageKey, JSON.stringify(progress));
        updateAllProgressDisplays();
    }

    function updateLabelStyle(checkbox) {
        const label = checkbox.nextElementSibling;
        if (label) {
            if (checkbox.checked) {
                label.style.textDecoration = 'line-through';
                label.style.color = '#888';
            } else {
                label.style.textDecoration = 'none';
                label.style.color = ''; // Reset to default CSS color
            }
        }
    }

    function updateSectionProgress(section) {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const totalItems = checkboxes.length;
        const checkedItems = Array.from(checkboxes).filter(cb => cb.checked).length;
        const sectionProgressSpan = section.querySelector('.section-progress');

        if (sectionProgressSpan) {
            if (totalItems > 0 && checkedItems === totalItems) {
                sectionProgressSpan.textContent = translations[currentLanguage].doneStatus || '[DONE]';
                sectionProgressSpan.classList.add('done');
            } else {
                sectionProgressSpan.textContent = `[${checkedItems}/${totalItems}]`;
                sectionProgressSpan.classList.remove('done');
            }
        }
    }

    function updateOverallProgress() {
        let totalItems = 0;
        let totalCheckedItems = 0;

        gameChecklistSections.forEach(section => {
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            totalItems += checkboxes.length;
            totalCheckedItems += Array.from(checkboxes).filter(cb => cb.checked).length;
        });

        if (overallProgressSpan) {
            overallProgressSpan.textContent = `[${totalCheckedItems}/${totalItems}]`;
        }
    }

    function updateMasterChecklist() {
        if (!masterChecklistSection) return;

        gameChecklistSections.forEach(section => {
            const masterCheckboxId = `master_${section.id}`;
            const masterCheckbox = document.getElementById(masterCheckboxId);

            if (masterCheckbox) {
                const checkboxesInSection = section.querySelectorAll('input[type="checkbox"]');
                const totalItems = checkboxesInSection.length;
                const checkedItems = Array.from(checkboxesInSection).filter(cb => cb.checked).length;

                const shouldBeChecked = (totalItems > 0 && checkedItems === totalItems);
                if (masterCheckbox.checked !== shouldBeChecked) {
                    masterCheckbox.checked = shouldBeChecked;
                    updateLabelStyle(masterCheckbox);
                }
            }
        });
        updateSectionProgress(masterChecklistSection);
    }

    function updateAllProgressDisplays() {
        gameChecklistSections.forEach(section => updateSectionProgress(section));
        updateMasterChecklist();
        updateOverallProgress();
    }

    gameChecklistSections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                updateLabelStyle(event.target);
                saveProgress();
            });
        });
    });

    if (masterChecklistSection) {
        const masterCheckboxes = masterChecklistSection.querySelectorAll('input[type="checkbox"]');
        masterCheckboxes.forEach(masterCheckbox => {
            masterCheckbox.addEventListener('change', (event) => {
                const targetSectionId = event.target.id.replace('master_', '');
                const targetSection = document.getElementById(targetSectionId);

                if (targetSection) {
                    const checkboxesInSection = targetSection.querySelectorAll('input[type="checkbox"]');
                    checkboxesInSection.forEach(cb => {
                        cb.checked = event.target.checked;
                        updateLabelStyle(cb);
                    });
                }
                saveProgress();
            });
        });
    }

    clearButton.addEventListener('click', () => {
        const confirmMessage = translations[currentLanguage].confirmReset || "Are you sure you want to reset all checklists?";
        if (confirm(confirmMessage)) {
            allChecklistSections.forEach(section => {
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    updateLabelStyle(checkbox);
                });
            });
            localStorage.removeItem(checklistProgressStorageKey);
            updateAllProgressDisplays();
            const alertMessage = translations[currentLanguage].alertReset || "Checklist has been reset!";
            alert(alertMessage);
        }
    });

    languageSelector.addEventListener('change', (event) => {
        updateUIText(event.target.value);
    });

    loadProgress();
});
