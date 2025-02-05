class SellerForm {
    constructor() {
        this.container = document.getElementById('form-container');
        this.initializeControls();
    }

    initializeControls() {
        const loadTemplateBtn = document.getElementById('load-template-btn');
        const loadTemplateInput = document.getElementById('load-template');
        const saveFormBtn = document.getElementById('save-form');
        const formNameInput = document.getElementById('form-name');
        const backButton = document.getElementById('back-to-home');

        loadTemplateBtn.addEventListener('click', () => loadTemplateInput.click());
        loadTemplateInput.addEventListener('change', (e) => this.loadTemplate(e));
        
        saveFormBtn.addEventListener('click', () => {
            const formName = formNameInput.value.trim();
            if (!formName) {
                this.showError('Моля, въведете име на формуляра!');
                return;
            }
            this.saveForm(formName);
        });

        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    loadTemplate(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const template = JSON.parse(e.target.result);
                this.renderTemplate(template);
            };
            reader.readAsText(file);
        }
    }

    renderTemplate(template) {
        this.container.innerHTML = '';
        template.elements.forEach(element => {
            const div = document.createElement('div');
            div.className = `form-element ${element.type}-input`;
            div.style.left = element.position.left;
            div.style.top = element.position.top;
            div.style.width = element.size.width;
            div.style.height = element.size.height;

            if (element.type === 'text') {
                const isLocked = element.isLocked;
                div.innerHTML = `
                    <textarea class="form-input" 
                             placeholder="${element.placeholder || 'Въведете текст'}"
                             ${isLocked ? 'readonly' : ''}
                    >${element.value || ''}</textarea>
                `;
                
                const textarea = div.querySelector('.form-input');
                if (element.fontSize) {
                    textarea.style.fontSize = element.fontSize;
                }
                
                if (isLocked) {
                    div.classList.add('locked-field');
                    textarea.style.backgroundColor = '#f8f9fa';
                    textarea.style.cursor = 'default';
                }
            } else if (element.type === 'image') {
                const isLocked = element.isLocked;
                div.innerHTML = `
                    <div class="image-container ${isLocked ? 'locked' : ''}">
                        ${element.imageUrl ? `
                            <img class="preview-image" src="${element.imageUrl}" alt="Изображение">
                        ` : ''}
                        ${!isLocked ? `
                            <input type="file" accept="image/*" class="image-input" style="display: none">
                            <div class="image-placeholder">
                                <i class="fas fa-image"></i>
                                <p>${element.imageUrl ? 'Кликнете за да промените изображението' : 'Кликнете за да добавите изображение'}</p>
                            </div>
                        ` : ''}
                    </div>
                `;

                if (!isLocked) {
                    const imageContainer = div.querySelector('.image-container');
                    const fileInput = div.querySelector('.image-input');
                    const placeholder = div.querySelector('.image-placeholder');

                    imageContainer.addEventListener('click', () => {
                        if (!isLocked) {
                            fileInput.click();
                        }
                    });

                    fileInput.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                let img = div.querySelector('.preview-image');
                                if (!img) {
                                    img = document.createElement('img');
                                    img.className = 'preview-image';
                                    imageContainer.insertBefore(img, placeholder);
                                }
                                img.src = e.target.result;
                                img.style.display = 'block';
                                
                                if (placeholder) {
                                    placeholder.querySelector('p').textContent = 'Кликнете за да промените изображението';
                                }
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }
            }

            this.container.appendChild(div);
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const oldError = document.querySelector('.error-message');
        if (oldError) oldError.remove();
        
        const sidebar = document.querySelector('.sidebar');
        sidebar.insertBefore(errorDiv, sidebar.firstChild);
        
        setTimeout(() => errorDiv.remove(), 3000);
    }

    async saveForm(formName) {
        const formData = {
            name: formName,
            date: new Date().toISOString(),
            elements: []
        };

        const elements = this.container.querySelectorAll('.form-element');
        elements.forEach(element => {
            const elementData = {
                type: element.classList.contains('text-input') ? 'text' : 'image',
                position: {
                    left: element.style.left,
                    top: element.style.top
                },
                size: {
                    width: element.style.width,
                    height: element.style.height
                }
            };

            if (elementData.type === 'text') {
                const textarea = element.querySelector('.form-input');
                elementData.value = textarea.value;
                elementData.fontSize = textarea.style.fontSize;
                elementData.isLocked = element.classList.contains('locked-field');
                elementData.placeholder = textarea.placeholder;
            } else if (elementData.type === 'image') {
                const img = element.querySelector('.preview-image');
                elementData.imageUrl = img ? img.src : '';
                elementData.isLocked = element.classList.contains('locked-field');
            }

            formData.elements.push(elementData);
        });

        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: `${formName}.json`,
                types: [{
                    description: 'JSON Files',
                    accept: {'application/json': ['.json']},
                }],
            });
            
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(formData, null, 2));
            await writable.close();
        } catch (err) {
            if (err.name !== 'AbortError') {
                this.showError('Грешка при запазване на файла!');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SellerForm();
}); 