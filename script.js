document.addEventListener('DOMContentLoaded', () => {
    const overallProgressSpan = document.getElementById('overallProgress');
    const clearButton = document.getElementById('clearButton');
    const storageKey = 'darkSoulsChecklistProgress'; // 로컬 스토리지 키

    // 모든 체크리스트 섹션 가져오기 (마스터 섹션 포함)
    const allChecklistSections = document.querySelectorAll('.checklist-section');
    // 마스터 체크리스트 섹션만 따로 가져옴
    const masterChecklistSection = document.getElementById('masterChecklistSection');
    // 실제 게임 진행도와 관련된 하위 섹션들 (마스터 섹션 제외)
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

    // 2. 현재 체크 상태 저장하기
    function saveProgress() {
        const progress = {};
        allChecklistSections.forEach(section => { // 모든 섹션의 체크박스 상태 저장
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                progress[checkbox.id] = checkbox.checked;
            });
        });
        localStorage.setItem(storageKey, JSON.stringify(progress));
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
                label.style.color = '#333';
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
                sectionProgressSpan.textContent = '[DONE]';
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

        // 마스터 섹션을 제외한 실제 게임 진행도 섹션만 계산
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
        if (!masterChecklistSection) return; // 마스터 섹션이 없으면 종료

        gameChecklistSections.forEach(section => {
            const masterCheckboxId = `master_${section.id}`; // 예: master_undeadAsylum
            const masterCheckbox = document.getElementById(masterCheckboxId);

            if (masterCheckbox) {
                const checkboxesInSection = section.querySelectorAll('input[type="checkbox"]');
                const totalItems = checkboxesInSection.length;
                const checkedItems = Array.from(checkboxesInSection).filter(cb => cb.checked).length;

                // 하위 섹션이 모두 완료되면 마스터 체크박스도 체크
                const shouldBeChecked = (totalItems > 0 && checkedItems === totalItems);
                if (masterCheckbox.checked !== shouldBeChecked) {
                    masterCheckbox.checked = shouldBeChecked;
                    updateLabelStyle(masterCheckbox);
                }
            }
        });
        updateSectionProgress(masterChecklistSection); // 마스터 섹션 자체의 진행도 업데이트
    }

    // 7. 모든 진행도 표시를 업데이트 (섹션별 + 전체 + 마스터)
    function updateAllProgressDisplays() {
        // 하위 섹션 진행도 업데이트
        gameChecklistSections.forEach(section => updateSectionProgress(section));
        // 마스터 체크리스트 업데이트 (하위 섹션의 완료 상태에 따라)
        updateMasterChecklist();
        // 전체 진행도 업데이트 (하위 항목만)
        updateOverallProgress();
    }

    // 8. 체크박스 변경 이벤트 리스너 설정
    // 하위 체크박스 변경 시: 라벨 스타일, 저장, 전체 진행도 업데이트, 해당 섹션 진행도 업데이트, 마스터 체크리스트 업데이트
    gameChecklistSections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                updateLabelStyle(event.target);
                saveProgress(); // saveProgress가 updateAllProgressDisplays를 호출함
            });
        });
    });

    // 9. 마스터 체크박스 변경 시: 하위 체크박스 동기화, 저장, 전체 진행도 업데이트
    if (masterChecklistSection) {
        const masterCheckboxes = masterChecklistSection.querySelectorAll('input[type="checkbox"]');
        masterCheckboxes.forEach(masterCheckbox => {
            masterCheckbox.addEventListener('change', (event) => {
                const targetSectionId = event.target.id.replace('master_', ''); // 예: master_undeadAsylum -> undeadAsylum
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
    }

    // 10. '모든 체크리스트 초기화' 버튼 클릭 시
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all checklists?')) {
            allChecklistSections.forEach(section => { // 모든 섹션의 체크박스 초기화
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    updateLabelStyle(checkbox);
                });
            });
            localStorage.removeItem(storageKey); // 로컬 스토리지 데이터 삭제
            updateAllProgressDisplays(); // 모든 진행도 표시 초기화
            alert('Checklist reset!');
        }
    });

    // 페이지가 로드되면 저장된 진행도 불러오기 (초기 진행도 계산 및 표시 포함)
    loadProgress();
});
