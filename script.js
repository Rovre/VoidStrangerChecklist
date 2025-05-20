document.addEventListener('DOMContentLoaded', () => {
    const overallProgressSpan = document.getElementById('overallProgress');
    const clearButton = document.getElementById('clearButton');
    const languageSelector = document.getElementById('languageSelector');
    const checklistProgressStorageKey = 'darkSoulsChecklistProgress';
    const languageStorageKey = 'voidStrangerChecklistLanguage';

    const allChecklistSections = document.querySelectorAll('.checklist-section');
    const masterChecklistSection = document.getElementById('masterChecklistSection');
    // masterChecklistItems는 masterChecklistSection이 존재할 때만 초기화
    const masterChecklistItems = masterChecklistSection ? masterChecklistSection.querySelectorAll('.section-checklist li') : [];
    const gameChecklistSections = Array.from(allChecklistSections).filter(section => section.id !== 'masterChecklistSection');

    const translations = {
        en: {
            pageTitle: "Mementos Checklist",
            mainTitle: "Mementos Checklist",
            masterChecklistTitle: "Checklist",
            domainSuffix: "'s Domain",
            alphabetDomain: "Alphabet Domain",
            secretMementos: "Secret Mementos",
            chambersSuffix: " Chambers", // For "Void Lord Chambers" H2 title AND master list item
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
                if (element.tagName === 'SPAN') {
                    if ((key === 'domainSuffix' || key === 'chambersSuffix') && element.parentElement.tagName === 'H2') { // H2 내의 suffix
                        const h2 = element.parentElement;
                        const progressSpan = h2.querySelector('.section-progress');
                        let properName = "";
                        let nodePointer = element.previousSibling;
                        while(nodePointer) {
                            if (nodePointer.nodeType === Node.TEXT_NODE && nodePointer.textContent.trim() !== "") {
                                properName = nodePointer.textContent.trim();
                                break;
                            }
                            nodePointer = nodePointer.previousSibling;
                        }
                        h2.textContent = '';
                        if (properName) {
                            h2.appendChild(document.createTextNode(properName + " "));
                        }
                        element.textContent = trans[key]; 
                        h2.appendChild(element); 
                        if (progressSpan) {
                             h2.appendChild(document.createTextNode(" ")); 
                             h2.appendChild(progressSpan); 
                        }
                    } else if ((key === 'domainSuffix' || key === 'chamberItemSuffix' || key === 'shortcutPrefix' || key === 'chambersSuffix') && element.parentElement.tagName === 'LABEL') { // LABEL 내의 suffix/prefix
                        const label = element.parentElement;
                        const originalPrefixText = (element.previousSibling && element.previousSibling.nodeType === Node.TEXT_NODE) ? element.previousSibling.textContent : "";
                        const originalSuffixText = (element.nextSibling && element.nextSibling.nodeType === Node.TEXT_NODE) ? element.nextSibling.textContent : "";
                        
                        // Clear only the span, then reconstruct
                        let newLabelContent = [];
                        if(originalPrefixText) newLabelContent.push(document.createTextNode(originalPrefixText));
                        
                        const newSpan = document.createElement('span');
                        newSpan.setAttribute('data-translate-key', key);
                        newSpan.textContent = trans[key];
                        newLabelContent.push(newSpan);

                        if(originalSuffixText) newLabelContent.push(document.createTextNode(originalSuffixText));
                        
                        // Clear label and append new nodes
                        label.innerHTML = ''; // Clear previous content
                        newLabelContent.forEach(node => label.appendChild(node));

                    } else {
                        element.textContent = trans[key];
                    }
                } else if (element.tagName === 'H1' && key === 'mainTitle') {
                    const progressSpan = element.querySelector('#overallProgress');
                    element.textContent = trans[key];
                    if (progressSpan) element.appendChild(progressSpan);
                } else if (element.tagName === 'H2') {
                     const progressSpan = element.querySelector('.section-progress');
                     element.textContent = trans[key] + " "; 
                     if(progressSpan) element.appendChild(progressSpan);
                } else { // Includes LABELs with direct data-translate-key
                    element.textContent = trans[key];
                }
            }
        });
        
        if (trans.pageTitle) {
            document.title = trans.pageTitle;
        }
        updateAllProgressDisplays();
    }


    function loadProgress() {
        const savedLang = localStorage.getItem(languageStorageKey) || 'ko';
        languageSelector.value = savedLang;
        // updateUIText will be called, which in turn calls updateAllProgressDisplays
        updateUIText(savedLang); 

        const savedProgress = localStorage.getItem(checklistProgressStorageKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            allChecklistSections.forEach(section => {
                // Do not process masterChecklistSection here for checkbox states
                if (section.id === 'masterChecklistSection') return;

                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if (progress[checkbox.id] !== undefined) {
                        checkbox.checked = progress[checkbox.id];
                        updateLabelStyle(checkbox);
                    }
                });
            });
        }
        // updateAllProgressDisplays is called at the end of updateUIText
    }

    function saveProgress() {
        const progress = {};
        gameChecklistSections.forEach(section => { // Only save progress for game sections
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
        if (label && label.tagName === 'LABEL') { // Ensure it's a label
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
        const sectionProgressSpan = section.querySelector('h2 .section-progress'); // Progress is in H2

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

        let masterItemsDoneCount = 0;
        const totalMasterItems = masterChecklistItems.length;

        masterChecklistItems.forEach(item => {
            const targetSectionId = item.dataset.targetSectionId;
            const targetSection = document.getElementById(targetSectionId);
            const progressSpan = item.querySelector('.master-item-progress');

            if (targetSection && progressSpan) {
                const checkboxesInSection = targetSection.querySelectorAll('input[type="checkbox"]');
                const totalSubItems = checkboxesInSection.length;
                const checkedSubItems = Array.from(checkboxesInSection).filter(cb => cb.checked).length;

                if (totalSubItems > 0 && checkedSubItems === totalSubItems) {
                    progressSpan.textContent = translations[currentLanguage].doneStatus || '[DONE]';
                    progressSpan.classList.add('done');
                    // This master item is considered "done" if its target section is done
                } else {
                    progressSpan.textContent = `[${checkedSubItems}/${totalSubItems}]`;
                    progressSpan.classList.remove('done');
                }
            }
        });
        
        // Update the progress for the master checklist section title (e.g., Checklist [X/Y])
        // This counts how many master *items* (target sections) are fully completed.
        let completedMasterItems = 0;
        masterChecklistItems.forEach(item => {
            const progressSpan = item.querySelector('.master-item-progress');
            if (progressSpan && progressSpan.classList.contains('done')) {
                completedMasterItems++;
            }
        });

        const masterSectionProgressSpan = masterChecklistSection.querySelector('h2 .section-progress');
        if (masterSectionProgressSpan) {
            if (totalMasterItems > 0 && completedMasterItems === totalMasterItems) {
                masterSectionProgressSpan.textContent = translations[currentLanguage].doneStatus || '[DONE]';
                masterSectionProgressSpan.classList.add('done');
            } else {
                masterSectionProgressSpan.textContent = `[${completedMasterItems}/${totalMasterItems}]`;
                masterSectionProgressSpan.classList.remove('done');
            }
        }
    }

    function updateAllProgressDisplays() {
        gameChecklistSections.forEach(section => updateSectionProgress(section));
        updateMasterChecklist(); // Update master items based on sub-sections
        updateOverallProgress(); // Update overall based on sub-sections
    }

    // Event listeners for game checklist sections (sub-sections)
    gameChecklistSections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                updateLabelStyle(event.target);
                saveProgress(); // This will trigger updateAllProgressDisplays
            });
        });
    });

    // Event listeners for master checklist items (for scrolling)
    if (masterChecklistSection) {
        masterChecklistItems.forEach(item => {
            item.addEventListener('click', (event) => {
                // Prevent click if a nested interactive element was clicked (though not expected here)
                if (event.target !== item && event.target.closest('span, label') !== event.target) {
                     // Allow clicks on text/spans inside label, or the label itself, or the span.master-item-progress
                     // but if something else inside li is clicked, ignore.
                     // More robust: if (event.target.closest('a, button, input')) return;
                }

                const targetSectionId = item.dataset.targetSectionId;
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    clearButton.addEventListener('click', () => {
        const confirmMessage = translations[currentLanguage].confirmReset || "Are you sure you want to reset all checklists?";
        if (confirm(confirmMessage)) {
            allChecklistSections.forEach(section => {
                // Only reset checkboxes in game sections
                if (section.id === 'masterChecklistSection') return;

                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    updateLabelStyle(checkbox);
                });
            });
            localStorage.removeItem(checklistProgressStorageKey);
            updateAllProgressDisplays(); // This will update master list progress spans too
            const alertMessage = translations[currentLanguage].alertReset || "Checklist has been reset!";
            alert(alertMessage);
        }
    });

    languageSelector.addEventListener('change', (event) => {
        updateUIText(event.target.value); // This will trigger updateAllProgressDisplays
    });

    loadProgress(); // Initial load
});
