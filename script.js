document.addEventListener('DOMContentLoaded', () => {
    const overallProgressSpan = document.getElementById('overallProgress');
    const clearButton = document.getElementById('clearButton');
    const languageSelector = document.getElementById('languageSelector');
    const checklistProgressStorageKey = 'darkSoulsChecklistProgress'; // 로컬 스토리지 키
    const languageStorageKey = 'voidStrangerChecklistLanguage'; // 언어 설정 저장 키

    // 모든 체크리스트 섹션 가져오기 (마스터 섹션 포함)
    const allChecklistSections = document.querySelectorAll('.checklist-section');
    // 마스터 체크리스트 섹션만 따로 가져옴
    const masterChecklistSection = document.getElementById('masterChecklistSection');
    // 실제 게임 진행도와 관련된 하위 섹션들 (마스터 섹션 제외)
    const gameChecklistSections = Array.from(allChecklistSections).filter(section => section.id !== 'masterChecklistSection');

    // 번역 문자열 객체
    const translations = {
        en: {
            pageTitle: "Mementos Checklist",
            mainTitle: "Mementos Checklist",
            masterChecklistTitle: "Checklist",
            secretMementos: "Secret Mementos",
            voidLordChambers: "Void Lord Chambers",
            shortcuts: "Shortcuts",
            developerRoom: "Developer Room",
            clearButton: "Reset all checklists",
            doneStatus: "[DONE]",
            confirmReset: "Are you sure you want to reset all checklists?",
            alertReset: "Checklist has been reset!"
        },
        ko: {
            pageTitle: "메멘토 체크리스트",
            mainTitle: "메멘토 체크리스트",
            masterChecklistTitle: "체크리스트",
            secretMementos: "비밀 메멘토",
            voidLordChambers: "공허 군주의 방",
            shortcuts: "지름길",
            developerRoom: "개발자 방",
            clearButton: "모든 체크리스트 초기화",
            doneStatus: "[완료]",
            confirmReset: "정말 모든 체크리스트를 초기화하시겠습니까?",
            alertReset: "체크리스트가 초기화되었습니다!"
        },
        ja: {
            pageTitle: "メメントチェックリスト",
            mainTitle: "メメントチェックリスト",
            masterChecklistTitle: "チェックリスト",
            secretMementos: "秘密のメメント",
            voidLordChambers: "虚無の君主の部屋",
            shortcuts: "ショートカット",
            developerRoom: "開発者ルーム",
            clearButton: "全てのチェックリストをリセット",
            doneStatus: "[完了]",
            confirmReset: "本当にすべてのチェックリストを初期化しますか？",
            alertReset: "チェックリストが初期化されました！"
        },
        'zh-CN': {
            pageTitle: "Mementos 清单",
            mainTitle: "Mementos 清单",
            masterChecklistTitle: "清单",
            secretMementos: "秘密 Mementos",
            voidLordChambers: "虚空领主房间",
            shortcuts: "快捷方式",
            developerRoom: "开发者房间",
            clearButton: "重置所有清单",
            doneStatus: "[已完成]",
            confirmReset: "您确定要重置所有清单吗？",
            alertReset: "清单已重置！"
        },
        'zh-TW': {
            pageTitle: "Mementos 清單",
            mainTitle: "Mementos 清單",
            masterChecklistTitle: "清單",
            secretMementos: "秘密 Mementos",
            voidLordChambers: "虛空領主房間",
            shortcuts: "捷徑",
            developerRoom: "開發者房間",
            clearButton: "重設所有清單",
            doneStatus: "[已完成]",
            confirmReset: "您確定要重設所有清單嗎？",
            alertReset: "清單已重設！"
        }
    };

    let currentLanguage = 'ko'; // 기본 언어

    // UI 텍스트 업데이트 함수
    function updateUIText(lang) {
        currentLanguage = lang;
        document.documentElement.lang = lang; // html lang 속성 변경
        localStorage.setItem(languageStorageKey, lang); // 선택된 언어 저장

        const trans = translations[lang];
        if (!trans) {
            console.error(`Translations not found for language: ${lang}`);
            return;
        }

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (trans[key]) {
                // H1 태그의 경우 자식 span(overallProgress)을 유지해야 함
                if (element.tagName === 'H1' && key === 'mainTitle') {
                    const progressSpan = element.querySelector('#overallProgress');
                    element.textContent = trans[key]; // 먼저 텍스트 설정
                    if (progressSpan) element.appendChild(progressSpan); // 그 다음 span 추가
                } 
                // H2 태그의 경우 자식 span(section-progress)을 유지해야 함
                else if (element.tagName === 'H2' && element.querySelector('.section-progress')) {
                     const progressSpan = element.querySelector('.section-progress');
                     element.textContent = trans[key] + " "; // 텍스트와 공백 설정
                     if(progressSpan) element.appendChild(progressSpan); // 그 다음 span 추가
                }
                // Label for master checklist items
                else if (element.tagName === 'LABEL' && trans[key]) {
                     element.textContent = trans[key];
                }
                else {
                    element.textContent = trans[key];
                }
            }
        });
        // 페이지 타이틀도 업데이트
        if (trans.pageTitle) {
            document.title = trans.pageTitle;
        }
        // 진행도 표시도 언어 변경에 따라 업데이트 (특히 [DONE] 텍스트)
        updateAllProgressDisplays();
    }


    // 1. 페이지 로드 시 저장된 상태 불러오기
    function loadProgress() {
        const savedLang = localStorage.getItem(languageStorageKey) || 'ko';
        languageSelector.value = savedLang;
        updateUIText(savedLang); // 먼저 언어 설정 적용

        const savedProgress = localStorage.getItem(checklistProgressStorageKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            allChecklistSections.forEach(section => {
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if (progress[checkbox.id] !== undefined) {
                        checkbox.checked = progress[checkbox.id];
                        updateLabelStyle(checkbox); // 체크 상태에 따라 라벨 스타일 적용
                    }
                });
            });
        }
        updateAllProgressDisplays(); // 로드 후 모든 진행도 업데이트 (언어 적용 후 호출)
    }

    // 2. 현재 체크 상태 저장하기
    function saveProgress() {
        const progress = {};
        allChecklistSections.forEach(section => { // 모든 섹션의 체크박스 상태 저장
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                progress[checkbox.id] = checkbox.checked;
            });
        });
        localStorage.setItem(checklistProgressStorageKey, JSON.stringify(progress));
        updateAllProgressDisplays(); // 저장 후 모든 진행도 업데이트
    }

    // 3. 체크박스 상태에 따라 라벨 스타일 변경
    function updateLabelStyle(checkbox) {
        const label = checkbox.nextElementSibling;
        if (label) { // label이 존재하는지 확인
            if (checkbox.checked) {
                label.style.textDecoration = 'line-through';
                label.style.color = '#888';
            } else {
                label.style.textDecoration = 'none';
                label.style.color = '#333'; // 기본 라벨 색상으로 복원
            }
        }
    }

    // 4. 각 섹션의 진행도를 업데이트하고 표시
    function updateSectionProgress(section) {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const totalItems = checkboxes.length;
        const checkedItems = Array.from(checkboxes).filter(cb => cb.checked).length;
        const sectionProgressSpan = section.querySelector('.section-progress');

        if (sectionProgressSpan) {
            if (totalItems > 0 && checkedItems === totalItems) { // 항목이 있고 모두 체크되었을 때
                sectionProgressSpan.textContent = translations[currentLanguage].doneStatus || '[DONE]';
                sectionProgressSpan.classList.add('done'); // DONE 스타일 추가
            } else {
                sectionProgressSpan.textContent = `[${checkedItems}/${totalItems}]`;
                sectionProgressSpan.classList.remove('done'); // DONE 스타일 제거
            }
        }
    }

    // 5. 전체 진행도를 업데이트하고 표시 (모든 하위 체크리스트 항목만 계산)
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

    // 6. 마스터 체크리스트(상위 체크리스트) 업데이트 로직
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

    // 7. 모든 진행도 표시를 업데이트 (섹션별 + 전체 + 마스터)
    function updateAllProgressDisplays() {
        gameChecklistSections.forEach(section => updateSectionProgress(section));
        updateMasterChecklist();
        updateOverallProgress();
    }

    // 8. 체크박스 변경 이벤트 리스너 설정
    gameChecklistSections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                updateLabelStyle(event.target);
                saveProgress(); 
            });
        });
    });

    // 9. 마스터 체크박스 변경 시
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

    // 10. '모든 체크리스트 초기화' 버튼 클릭 시
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

    // 11. 언어 선택기 이벤트 리스너
    languageSelector.addEventListener('change', (event) => {
        updateUIText(event.target.value);
    });

    // 페이지가 로드되면 저장된 진행도 및 언어 불러오기
    loadProgress();
});
