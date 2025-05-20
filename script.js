document.addEventListener('DOMContentLoaded', () => {
    const overallProgressSpan = document.getElementById('overallProgress');
    const clearButton = document.getElementById('clearButton');
    const storageKey = 'voidStrangerChecklistProgress'; // 로컬 스토리지 키

    // 모든 체크리스트 섹션 가져오기 (마스터 섹션 포함)
    const allChecklistSections = document.querySelectorAll('.checklist-section');
    // 마스터 체크리스트 섹션만 따로 가져옴
    const masterChecklistSection = document.getElementById('masterChecklistSection');
    // 실제 게임 진행도와 관련된 하위 섹션들 (마스터 섹션 제외)
    // masterChecklistSection의 자식 체크박스 ID가 'master_SECTIONID' 형식이라고 가정
    const gameChecklistSections = Array.from(allChecklistSections).filter(section => section.id !== 'masterChecklistSection');

    // 1. 페이지 로드 시 저장된 상태 불러오기
    function loadProgress() {
        const savedProgress = localStorage.getItem(storageKey);
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
        updateAllProgressDisplays(); // 로드 후 모든 진행도 업데이트
    }

    // 2. 현재 체크 상태 저장하기 (그리고 모든 진행도 업데이트)
    function saveProgress() {
        const progress = {};
        allChecklistSections.forEach(section => {
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                progress[checkbox.id] = checkbox.checked;
            });
        });
        localStorage.setItem(storageKey, JSON.stringify(progress));
        updateAllProgressDisplays(); // 모든 진행도 표시 업데이트
    }

    // 3. 체크박스 라벨 스타일 업데이트
    function updateLabelStyle(checkbox) {
        const label = checkbox.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
            if (checkbox.checked) {
                label.style.textDecoration = 'line-through';
                label.style.color = '#888';
            } else {
                label.style.textDecoration = 'none';
                label.style.color = '#333';
            }
        }
    }

    // 4. 특정 섹션의 진행도를 업데이트 (섹션 제목 옆 [X/Y] 표시)
    function updateSectionProgress(section) {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const totalItems = checkboxes.length;
        const checkedItems = Array.from(checkboxes).filter(cb => cb.checked).length;
        const progressText = `[${checkedItems}/${totalItems}]`;

        const sectionProgressSpan = section.querySelector('.section-progress');
        if (sectionProgressSpan) {
            sectionProgressSpan.textContent = progressText;
        }
    }

    // 5. 전체 진행도 표시를 업데이트 (<h1> 태그 옆 [X/Y] 표시)
    function updateOverallProgress() {
        let totalItems = 0;
        let totalCheckedItems = 0;

        gameChecklistSections.forEach(section => { // 실제 게임 진행도 섹션만 포함
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            totalItems += checkboxes.length;
            totalCheckedItems += Array.from(checkboxes).filter(cb => cb.checked).length;
        });

        if (overallProgressSpan) {
            overallProgressSpan.textContent = `[${totalCheckedItems}/${totalItems}]`;
        }
    }

    // 6. 마스터 체크리스트 내의 각 하위 섹션 진행도를 업데이트
    function updateMasterChecklistProgress() {
        const masterListItems = masterChecklistSection.querySelectorAll('ul.section-checklist > li');

        masterListItems.forEach(listItem => {
            const masterCheckbox = listItem.querySelector('input[type="checkbox"]');
            const progressSpan = listItem.querySelector('.section-master-progress'); // 이 span을 업데이트

            if (masterCheckbox && progressSpan) {
                // master_ 접두사를 제거하여 실제 하위 섹션 ID를 얻음
                const subSectionId = masterCheckbox.id.replace('master_', '');
                const subSection = document.getElementById(subSectionId);

                if (subSection) {
                    const checkboxes = subSection.querySelectorAll('input[type="checkbox"]');
                    const totalItems = checkboxes.length;
                    const checkedItems = Array.from(checkboxes).filter(cb => cb.checked).length;
                    progressSpan.textContent = `[${checkedItems}/${totalItems}]`;
                }
            }
        });
    }

    // 7. 모든 진행도 표시를 업데이트 (섹션별 + 마스터 항목별 + 전체)
    function updateAllProgressDisplays() {
        gameChecklistSections.forEach(section => updateSectionProgress(section));
        updateMasterChecklistProgress(); // 새로 추가된 마스터 항목별 진행도 업데이트
        updateOverallProgress();
        updateMasterChecklistStatus(); // 마스터 체크박스 자체의 체크 상태 동기화
    }

    // 8. 하위 섹션의 체크 상태에 따라 마스터 체크리스트의 체크박스 상태 동기화
    function updateMasterChecklistStatus() {
        masterChecklistSection.querySelectorAll('input[type="checkbox"]').forEach(masterCheckbox => {
            const subSectionId = masterCheckbox.id.replace('master_', '');
            const subSection = document.getElementById(subSectionId);

            if (subSection) {
                const checkboxesInSection = subSection.querySelectorAll('input[type="checkbox"]');
                const totalItems = checkboxesInSection.length;
                const checkedItems = Array.from(checkboxesInSection).filter(cb => cb.checked).length;

                // 모든 하위 항목이 체크되면 마스터 체크박스도 체크
                masterCheckbox.checked = (totalItems > 0 && checkedItems === totalItems);
                updateLabelStyle(masterCheckbox); // 마스터 체크박스의 라벨 스타일도 업데이트
            }
        });
    }

    // 9. 개별 체크박스 변경 이벤트 리스너 설정
    gameChecklistSections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                updateLabelStyle(event.target); // 라벨 스타일 업데이트
                saveProgress(); // 진행도 저장 (모든 진행도 업데이트 포함)
            });
        });
    });

    // 10. 마스터 체크리스트 체크박스 변경 이벤트 리스너 설정
    masterChecklistSection.querySelectorAll('input[type="checkbox"]').forEach(masterCheckbox => {
        masterCheckbox.addEventListener('change', (event) => {
            const targetSectionId = event.target.id.replace('master_', ''); // 예: master_addsDomain -> addsDomain
            const targetSection = document.getElementById(targetSectionId);

            if (targetSection) {
                const checkboxesInSection = targetSection.querySelectorAll('input[type="checkbox"]');
                checkboxesInSection.forEach(cb => {
                    cb.checked = event.target.checked; // 마스터 체크박스 상태에 따라 하위 체크박스 상태 변경
                    updateLabelStyle(cb);
                });
            }
            saveProgress(); // saveProgress가 updateAllProgressDisplays를 호출함
        });
    });

    // 11. '모든 체크리스트 초기화' 버튼 클릭 시
    clearButton.addEventListener('click', () => {
        if (confirm('정말 모든 체크리스트를 초기화하시겠습니까?')) {
            allChecklistSections.forEach(section => { // 모든 섹션의 체크박스 초기화
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    updateLabelStyle(checkbox);
                });
            });
            localStorage.removeItem(storageKey); // 로컬 스토리지 데이터 삭제
            updateAllProgressDisplays(); // 모든 진행도 표시 초기화
            alert('체크리스트가 초기화되었습니다!');
        }
    });

    // 페이지가 로드되면 저장된 진행도 불러오기
    loadProgress();
});
