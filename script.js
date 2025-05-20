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
            domainSuffix: "'s Domain",
            alphabetDomain: "Alphabet Domain",
            secretMementos: "Secret Mementos",
            chambersSuffix: " Chambers", // For "Void Lord Chambers" H2 title
            chamberItemSuffix: "'s Chamber", // For "Eus's Chamber", "Mon's Chamber" etc. list items
            shortcuts: "Shortcuts",
            shortcutPrefix: "Shortcut",
            developerRoom: "Developer Room",
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
            chamberItemSuffix: "의 방",
            shortcuts: "지름길",
            shortcutPrefix: "지름길",
            developerRoom: "개발자 방",
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
            chamberItemSuffix: "の部屋",
            shortcuts: "ショートカット",
            shortcutPrefix: "ショートカット",
            developerRoom: "開発者ルーム",
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
            chamberItemSuffix: "的房间",
            shortcuts: "快捷方式",
            shortcutPrefix: "快捷方式",
            developerRoom: "开发者房间",
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
            chamberItemSuffix: "的房間",
            shortcuts: "捷徑",
            shortcutPrefix: "捷徑",
            developerRoom: "開發者房間",
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
                // Case 1: SPAN element (potentially part of a larger string)
                if (element.tagName === 'SPAN') {
                    // Subcase 1.1: Span is a suffix in an H2 (e.g., 's Domain, Chambers suffix)
                    if ((key === 'domainSuffix' || key === 'chambersSuffix') && element.parentElement.tagName === 'H2') {
                        const h2 = element.parentElement;
                        const progressSpan = h2.querySelector('.section-progress'); // Grab before clearing
                        
                        let properName = "";
                        let nodePointer = element.previousSibling;
                        while(nodePointer) {
                            if (nodePointer.nodeType === Node.TEXT_NODE && nodePointer.textContent.trim() !== "") {
                                properName = nodePointer.textContent.trim();
                                break;
                            }
                            nodePointer = nodePointer.previousSibling;
                        }

                        h2.textContent = ''; // Clear H2
                        if (properName) {
                            h2.appendChild(document.createTextNode(properName + " "));
                        }
                        element.textContent = trans[key]; 
                        h2.appendChild(element); 
                        
                        if (progressSpan) {
                             h2.appendChild(document.createTextNode(" ")); 
                             h2.appendChild(progressSpan); 
                        }
                    // Subcase 1.2: Span is part of a LABEL (e.g. 's Domain, 's Chamber, Shortcut prefix)
                    } else if ((key === 'domainSuffix' || key === 'chamberItemSuffix' || key === 'shortcutPrefix') && element.parentElement.tagName === 'LABEL') {
                        const label = element.parentElement;
                        const originalPrefixText = (element.previousSibling && element.previousSibling.nodeType === Node.TEXT_NODE) ? element.previousSibling.textContent : "";
                        const originalSuffixText = (element.nextSibling && element.nextSibling.nodeType === Node.TEXT_NODE) ? element.nextSibling.textContent : "";

                        label.textContent = ''; // Clear label

                        if (originalPrefixText) {
                            label.appendChild(document.createTextNode(originalPrefixText));
                        }
                        
                        element.textContent = trans[key];
                        label.appendChild(element);

                        if (originalSuffixText) {
                            label.appendChild(document.createTextNode(originalSuffixText));
                        }
                    // Subcase 1.3: Other SPANs (assume full translation by key, if any)
                    } else {
                        // This case might not be needed if all translatable spans are covered above
                        // or if a span is meant to be fully replaced by its key.
                        element.textContent = trans[key];
                    }
                // Case 2: H1 element (main title, preserve progress span)
                } else if (element.tagName === 'H1' && key === 'mainTitle') {
                    const progressSpan = element.querySelector('#overallProgress');
                    element.textContent = trans[key];
                    if (progressSpan) element.appendChild(progressSpan);
                // Case 3: H2 element (fully translated by its own key, preserve progress span)
                } else if (element.tagName === 'H2') {
                     const progressSpan = element.querySelector('.section-progress');
                     element.textContent = trans[key] + " "; 
                     if(progressSpan) element.appendChild(progressSpan);
                // Case 4: Other elements (fully translated by key)
                } else {
                    element.textContent = trans[key];
                }
            }
        });
        
        if (trans.pageTitle) {
            document.title = trans.pageTitle;
        }
        updateAllProgressDisplays(); // Ensure [DONE] text is also updated
    }


    function loadProgress() {
        const savedLang = localStorage.getItem(languageStorageKey) || 'ko';
        languageSelector.value = savedLang;
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
        // updateAllProgressDisplays() is called at the end of updateUIText, so not strictly needed here again
        // but calling it ensures consistency if loadProgress logic changes.
        updateAllProgressDisplays(); 
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
                label.style.color = ''; 
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
