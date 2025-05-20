document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section'); // 모든 섹션 div를 찾음
    const clearButton = document.getElementById('clearButton');
    const storageKey = 'myChecklistProgressWithSections'; // 로컬 스토리지 키 변경

    // 1. 페이지 로드 시 저장된 상태 불러오기 및 진행도 업데이트
    function loadProgress() {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            sections.forEach(section => {
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if (progress[checkbox.id] !== undefined) {
                        checkbox.checked = progress[checkbox.id];
                        // 체크된 항목에 줄 긋기 스타일 적용
                        if (checkbox.checked) {
                            checkbox.nextElementSibling.style.textDecoration = 'line-through';
                            checkbox.nextElementSibling.style.color = '#888';
                        } else {
                            checkbox.nextElementSibling.style.textDecoration = 'none';
                            checkbox.nextElementSibling.style.color = '#333';
                        }
                    }
                });
                updateSectionProgress(section); // 각 섹션의 진행도 업데이트
            });
        } else {
            // 저장된 내용이 없을 경우에도 진행도를 한번 계산하여 표시
            sections.forEach(section => {
                updateSectionProgress(section);
            });
        }
    }

    // 2. 현재 체크 상태 저장하기
    function saveProgress() {
        const progress = {};
        sections.forEach(section => {
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                progress[checkbox.id] = checkbox.checked;
            });
        });
        localStorage.setItem(storageKey, JSON.stringify(progress));
    }

    // 3. 섹션별 진행도 업데이트 함수
    function updateSectionProgress(section) {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const totalItems = checkboxes.length;
        let checkedItems = 0;

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkedItems++;
            }
        });

        const progressTextSpan = section.querySelector('.progress-text');
        if (progressTextSpan) {
            if (checkedItems === totalItems) {
                progressTextSpan.textContent = '[DONE]';
                progressTextSpan.classList.add('done'); // 'DONE'일 때 초록색 스타일 적용
            } else {
                progressTextSpan.textContent = `[${checkedItems}/${totalItems}]`;
                progressTextSpan.classList.remove('done'); // 'DONE'이 아닐 때 스타일 제거
            }
        }
    }

    // 4. 체크박스 상태 변경 시 저장 및 해당 섹션 진행도 업데이트
    sections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                saveProgress(); // 전체 진행도 저장
                // 체크박스 상태에 따라 라벨 스타일 변경
                if (event.target.checked) {
                    event.target.nextElementSibling.style.textDecoration = 'line-through';
                    event.target.nextElementSibling.style.color = '#888';
                } else {
                    event.target.nextElementSibling.style.textDecoration = 'none';
                    event.target.nextElementSibling.style.color = '#333';
                }
                updateSectionProgress(section); // 해당 섹션의 진행도 업데이트
            });
        });
    });

    // 5. '모든 체크리스트 초기화' 버튼 클릭 시 모든 체크 해제 및 저장된 내용 삭제
    clearButton.addEventListener('click', () => {
        if (confirm('정말 모든 체크리스트를 초기화하시겠습니까?')) {
            sections.forEach(section => {
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.nextElementSibling.style.textDecoration = 'none';
                    checkbox.nextElementSibling.style.color = '#333';
                });
                updateSectionProgress(section); // 초기화 후 각 섹션 진행도 업데이트
            });
            localStorage.removeItem(storageKey); // 로컬 스토리지에서 데이터 삭제
            alert('모든 체크리스트가 초기화되었습니다!');
        }
    });

    // 페이지가 로드되면 저장된 진행도 불러오고 각 섹션 진행도 초기화
    loadProgress();
});
