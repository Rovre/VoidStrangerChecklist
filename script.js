document.addEventListener('DOMContentLoaded', () => {
    const overallProgressSpan = document.getElementById('overallProgress');
    const clearButton = document.getElementById('clearButton');
    const storageKey = 'darkSoulsChecklistProgress'; // 로컬 스토리지 키

    // 모든 체크리스트 섹션 가져오기
    const checklistSections = document.querySelectorAll('.checklist-section');

    // 1. 페이지 로드 시 저장된 상태 불러오기
    function loadProgress() {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            checklistSections.forEach(section => {
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
        checklistSections.forEach(section => {
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
        if (checkbox.checked) {
            label.style.textDecoration = 'line-through';
            label.style.color = '#888';
        } else {
            label.style.textDecoration = 'none';
            label.style.color = '#333';
        }
    }

    // 4. 각 섹션의 진행도를 업데이트하고 표시
    function updateSectionProgress(section) {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const totalItems = checkboxes.length;
        const checkedItems = Array.from(checkboxes).filter(cb => cb.checked).length;
        const sectionProgressSpan = section.querySelector('.section-progress');

        if (sectionProgressSpan) {
            if (checkedItems === totalItems && totalItems > 0) {
                sectionProgressSpan.textContent = '[DONE]';
                sectionProgressSpan.classList.add('done'); // DONE 스타일 추가
            } else {
                sectionProgressSpan.textContent = `[${checkedItems}/${totalItems}]`;
                sectionProgressSpan.classList.remove('done'); // DONE 스타일 제거
            }
        }
    }

    // 5. 전체 진행도를 업데이트하고 표시
    function updateOverallProgress() {
        let totalItems = 0;
        let totalCheckedItems = 0;

        checklistSections.forEach(section => {
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            totalItems += checkboxes.length;
            totalCheckedItems += Array.from(checkboxes).filter(cb => cb.checked).length;
        });

        if (overallProgressSpan) {
            overallProgressSpan.textContent = `[${totalCheckedItems}/${totalItems}]`;
        }
    }

    // 6. 모든 진행도 표시를 업데이트 (섹션별 + 전체)
    function updateAllProgressDisplays() {
        checklistSections.forEach(section => updateSectionProgress(section));
        updateOverallProgress();
    }

    // 7. 체크박스 변경 이벤트 리스너 설정
    checklistSections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                updateLabelStyle(event.target); // 라벨 스타일 업데이트
                saveProgress(); // 진행도 저장 (섹션 및 전체 업데이트 포함)
            });
        });
    });

    // 8. '초기화' 버튼 클릭 시 모든 체크 해제 및 저장된 내용 삭제
    clearButton.addEventListener('click', () => {
        if (confirm('정말 모든 체크리스트를 초기화하시겠습니까?')) {
            checklistSections.forEach(section => {
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    updateLabelStyle(checkbox); // 라벨 스타일 초기화
                });
            });
            localStorage.removeItem(storageKey); // 로컬 스토리지에서 데이터 삭제
            updateAllProgressDisplays(); // 모든 진행도 표시 초기화
            alert('체크리스트가 초기화되었습니다!');
        }
    });

    // 페이지가 로드되면 저장된 진행도 불러오기 (초기 진행도 계산 및 표시 포함)
    loadProgress();
});
