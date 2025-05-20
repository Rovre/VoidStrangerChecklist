document.addEventListener('DOMContentLoaded', () => {
    const overallProgressSpan = document.getElementById('overallProgress');
    const clearButton = document.getElementById('clearButton');
    const storageKey = 'voidStrangerChecklistProgress'; // 로컬 스토리지 키

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
            // 실제 게임 진행도 섹션의 체크박스만 로드
            gameChecklistSections.forEach(section => {
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
        // 실제 게임 진행도 섹션의 체크박스만 저장
        gameChecklistSections.forEach(section => {
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
        // masterChecklistSection 내의 모든 .master-section-link 요소를 찾습니다.
        const masterLinks = masterChecklistSection.querySelectorAll('.master-section-link');

        masterLinks.forEach(link => {
            // 진행도 텍스트가 표시될 <span> 요소를 찾습니다.
            const progressSpan = link.querySelector('.section-master-progress'); 

            if (progressSpan) {
                // 링크의 href 속성에서 하위 섹션 ID를 얻습니다. (예: #addsDomain -> addsDomain)
                const subSectionId = link.getAttribute('href').substring(1); // '#' 제거
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
        updateMasterChecklistProgress(); // 마스터 항목별 진행도 업데이트 호출
        updateOverallProgress();
        // 마스터 체크박스 자체의 체크 상태 동기화 기능은 제거되었습니다.
    }

    // 8. 개별 체크박스 변경 이벤트 리스너 설정
    gameChecklistSections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                updateLabelStyle(event.target); // 라벨 스타일 업데이트
                saveProgress(); // 진행도 저장 (모든 진행도 업데이트 포함)
            });
        });
    });

    // 9. 마스터 체크리스트 링크 클릭 이벤트 리스너 설정 (체크 기능 제거, 스크롤 이동 기능 추가)
    masterChecklistSection.querySelectorAll('.master-section-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // 기본 링크 이동 방지

            const targetId = link.getAttribute('href'); // 예: #addsDomain
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // 부드러운 스크롤 효과
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // 섹션 상단으로 스크롤
                });
            }
        });
    });

    // 10. '모든 체크리스트 초기화' 버튼 클릭 시
    clearButton.addEventListener('click', () => {
        if (confirm('정말 모든 체크리스트를 초기화하시겠습니까?')) {
            gameChecklistSections.forEach(section => { // 실제 게임 진행도 섹션의 체크박스만 초기화
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
