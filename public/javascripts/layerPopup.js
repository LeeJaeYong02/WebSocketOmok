class twoButtonLayerPopup {
    constructor(leftBtnObj, rightBtnObj, confirmBtnObj) {
        // 팝업과 배경을 관리할 요소
        this.popup = ""
        this.overlay = ""
        this.leftBtnText = leftBtnObj.text;
        this.rightBtnText = rightBtnObj.text;
        this.confirmBtnText = confirmBtnObj.text;

        this.leftBtnClickMethod = leftBtnObj.callback;
        this.rightBtnClickMethod = rightBtnObj.callback;
        this.confirmBtnClickMethod = confirmBtnObj.callback;

        this.btn1 = ""
        this.btn2 = ""

        this.openYnFlag = false;
    }

    // 팝업을 열기 위한 함수
    openPopup() {
        // body 요소의 스크롤을 막습니다.
        document.body.style.overflow = 'hidden';

        // 어두운 배경을 생성하고 스타일을 설정합니다.
        this.overlay = document.createElement('div');
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.overlay.style.zIndex = '1';
        //this.overlay.addEventListener('click', this.closePopup);

        // 팝업을 생성하고 스타일을 설정합니다.
        this.popup = document.createElement('div');
        this.popup.style.position = 'fixed';
        this.popup.style.top = '50%';
        this.popup.style.left = '50%';
        this.popup.style.transform = 'translate(-50%, -50%)';
        this.popup.style.backgroundColor = '#fff';
        this.popup.style.padding = '20px';
        this.popup.style.zIndex = '2';

        // 팝업 안에 버튼을 생성하고 스타일을 설정합니다.
        this.btn1 = this.createButton(this.leftBtnText, this.leftBtnClickMethod);

        this.btn2 = this.createButton(this.rightBtnText, this.rightBtnClickMethod);

        const confirmButton = this.createButton(this.confirmBtnText, this.confirmBtnClickMethod);

        // 팝업에 버튼을 추가합니다.
        this.popup.appendChild(this.btn1);
        this.popup.appendChild(this.btn2);
        this.popup.appendChild(confirmButton);

        // 어두운 배경과 팝업을 body에 추가합니다.
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.popup);

        this.openYnFlag = true;
    }

    // 버튼을 생성하는 함수
    createButton(text, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.marginRight = '10px';
        button.style.marginBottom = '10px';  // 아래에 여백 추가
        button.style.padding = '15px';
        button.style.fontSize = '18px';
        button.style.cursor = 'pointer';
        button.style.border = '2px solid transparent'; // 초기에 테두리 없음

        button.addEventListener('click', function() {
            clickHandler();
        });
        return button;
    }

    leftBtnBorder(color) {
        // 클릭 시 테두리가 생기도록 스타일을 변경하고, 기존 테두리는 없앱니다.
        this.btn1.style.border = '2px solid ' + color;
        document.querySelectorAll('button').forEach(otherButton => {
            if (otherButton !== this.btn1) {
                if(!this.btn1.disabled && !this.btn2.disabled)
                    otherButton.style.border = '2px solid transparent';
            }
        });

    }

    rightBtnBorder(color) {
        // 클릭 시 테두리가 생기도록 스타일을 변경하고, 기존 테두리는 없앱니다.
        this.btn2.style.border = '2px solid ' + color;
        document.querySelectorAll('button').forEach(otherButton => {
            if (otherButton !== this.btn2) {
                if(!this.btn1.disabled && !this.btn2.disabled)
                    otherButton.style.border = '2px solid transparent';
            }
        });

    }

    leftBtnDisable(flag) {
        this.btn1.disabled = flag;
    }

    rightBtnDisable(flag) {
        this.btn2.disabled = flag;
    }
}

// 팝업을 닫기 위한 함수
function closePopup(obj) {

    // 어두운 배경과 팝업을 삭제합니다.
    try {
        document.body.removeChild(obj.overlay);
        document.body.removeChild(obj.popup);
    } catch (e) {
        // console.log("이미 제거된 팝업");
    } finally {
        this.openYnFlag = false;

        // body 요소의 스크롤을 허용합니다.
        document.body.style.overflow = 'auto';
    }

}