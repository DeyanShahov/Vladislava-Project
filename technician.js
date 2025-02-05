class TechnicianForm {
    constructor() {
        this.container = document.getElementById('form-container');
        this.initializeControls();
    }

    initializeControls() {
        const loadFormBtn = document.getElementById('load-form-btn');
        const loadFormInput = document.getElementById('load-form');
        const backButton = document.getElementById('back-to-home');

        loadFormBtn.addEventListener('click', () => loadFormInput.click());
        loadFormInput.addEventListener('change', (e) => this.loadForm(e));
        
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    loadForm(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const formData = JSON.parse(e.target.result);
                this.renderForm(formData);
            };
            reader.readAsText(file);
        }
    }

    renderForm(formData) {
        this.container.innerHTML = '';
        formData.elements.forEach(element => {
            const div = document.createElement('div');
            div.className = `form-element ${element.type}-input`;
            div.style.left = element.position.left;
            div.style.top = element.position.top;
            div.style.width = element.size.width;
            div.style.height = element.size.height;

            if (element.type === 'text') {
                const content = element.value.trim() || 'Празно поле';
                const className = element.value.trim() ? 'form-content' : 'form-content empty-field';
                
                div.innerHTML = `
                    <div class="${className}">${content}</div>
                `;
                
                if (element.fontSize) {
                    div.querySelector('.form-content').style.fontSize = element.fontSize;
                }
            } else if (element.type === 'image') {
                if (element.imageUrl) {
                    div.innerHTML = `
                        <div class="image-container">
                            <img class="preview-image" src="${element.imageUrl}" alt="Изображение">
                        </div>
                    `;
                } else {
                    div.innerHTML = `
                        <div class="image-container empty-field">
                            <i class="fas fa-image"></i>
                            <p>Няма качено изображение</p>
                        </div>
                    `;
                }
            }

            this.container.appendChild(div);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TechnicianForm();
}); 