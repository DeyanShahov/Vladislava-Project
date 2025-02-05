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
                div.innerHTML = `
                    <textarea class="form-input" 
                             style="font-size: ${element.fontSize}"
                             placeholder="${element.placeholder}"></textarea>
                `;
            } else if (element.type === 'image') {
                div.innerHTML = `
                    <div class="image-container">
                        <input type="file" accept="image/*" class="image-input" style="display: none">
                        ${element.imageUrl ? 
                            `<img class="preview-image" src="${element.imageUrl}" style="display: block">` :
                            `<div class="image-placeholder">
                                <i class="fas fa-image"></i>
                                <p>Кликнете за да изберете изображение</p>
                             </div>`
                        }
                    </div>
                `;

                const imageContainer = div.querySelector('.image-container');
                const fileInput = div.querySelector('.image-input');

                imageContainer.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', () => {
                    const file = fileInput.files[0];
                    if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = div.querySelector('.preview-image') || 
                                      document.createElement('img');
                            img.className = 'preview-image';
                            img.src = e.target.result;
                            img.style.display = 'block';
                            
                            const placeholder = div.querySelector('.image-placeholder');
                            if (placeholder) {
                                placeholder.remove();
                            }
                            if (!div.querySelector('.preview-image')) {
                                imageContainer.appendChild(img);
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });
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
            } else if (elementData.type === 'image') {
                const img = element.querySelector('.preview-image');
                elementData.imageUrl = img ? img.src : '';
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