document.addEventListener('DOMContentLoaded', () => {
    const checklist = document.getElementById('checklist');
    const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');
    const clearButton = document.getElementById('clearButton');
    const storageKey = 'myChecklistProgress'; // 로컬 스토리지에 저장될 키 이름

    // 1. 페이지 로드 시 저장된 상태 불러오기
    function loadProgress() {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            checkboxes.forEach(checkbox => {
                if (progress[checkbox.id] !== undefined) {
                    checkbox.checked = progress[checkbox.id];
                    // 체크된 항목에 줄 긋기 스타일 적용
                    if (checkbox.checked) {
                        checkbox.nextElementSibling.style.textDecoration = 'line-through';
                        checkbox.nextElementSibling.style.color = '#888';
                    } else {
                        checkbox.nextElementSibling.style.textDecoration = 'none';
                        checkbox.nextElementSibling.style.color = '#333'; // 기본 색상으로 되돌림
                    }
                }
            });
        }
    }

    // 2. 현재 체크 상태 저장하기
    function saveProgress() {
        const progress = {};
        checkboxes.forEach(checkbox => {
            progress[checkbox.id] = checkbox.checked;
        });
        localStorage.setItem(storageKey, JSON.stringify(progress));
    }

    // 3. 체크박스 상태 변경 시 저장
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            saveProgress();
            // 체크박스 상태에 따라 라벨 스타일 변경
            if (event.target.checked) {
                event.target.nextElementSibling.style.textDecoration = 'line-through';
                event.target.nextElementSibling.style.color = '#888';
            } else {
                event.target.nextElementSibling.style.textDecoration = 'none';
                event.target.nextElementSibling.style.color = '#333';
            }
        });
    });

    // 4. '초기화' 버튼 클릭 시 모든 체크 해제 및 저장된 내용 삭제
    clearButton.addEventListener('click', () => {
        if (confirm('정말 모든 체크리스트를 초기화하시겠습니까?')) {
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.nextElementSibling.style.textDecoration = 'none';
                checkbox.nextElementSibling.style.color = '#333';
            });
            localStorage.removeItem(storageKey); // 로컬 스토리지에서 데이터 삭제
            alert('체크리스트가 초기화되었습니다!');
        }
    });

    // 페이지가 로드되면 저장된 진행도 불러오기
    loadProgress();
});