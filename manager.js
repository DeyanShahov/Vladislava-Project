class FormBuilder {
    constructor() {
        this.canvas = document.getElementById('form-canvas');
        this.selectedElement = null;
        this.initializeDragAndDrop();
        this.initializeTemplateControls();
        this.templateName = '';
    }

    initializeDragAndDrop() {
        const draggableItems = document.querySelectorAll('.drag-item');
        
        draggableItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', item.dataset.type);
            });
        });

        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('type');
            const element = this.createFormElement(type);
            
            element.style.left = `${e.offsetX}px`;
            element.style.top = `${e.offsetY}px`;
            
            this.canvas.appendChild(element);
        });
    }

    initializeTemplateControls() {
        const saveButton = document.getElementById('save-template');
        const templateNameInput = document.getElementById('template-name');
        
        saveButton.addEventListener('click', () => {
            const templateName = templateNameInput.value.trim();
            if (!templateName) {
                this.showError('Моля, въведете име на шаблона!');
                return;
            }
            this.templateName = templateName;
            this.saveTemplate();
        });

        const backButton = document.getElementById('back-to-home');
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Премахваме предишни съобщения за грешки
        const oldError = document.querySelector('.error-message');
        if (oldError) oldError.remove();
        
        const sidebar = document.querySelector('.sidebar');
        sidebar.insertBefore(errorDiv, sidebar.firstChild);
        
        setTimeout(() => errorDiv.remove(), 3000);
    }

    saveTemplate() {
        const template = {
            name: this.templateName,
            elements: []
        };

        const elements = this.canvas.querySelectorAll('.form-element');
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
                elementData.fontSize = textarea.style.fontSize;
                elementData.placeholder = textarea.placeholder;
                elementData.value = ''; // Празно за шаблона
            } else if (elementData.type === 'image') {
                const img = element.querySelector('.preview-image');
                elementData.imageUrl = img.style.display !== 'none' ? img.src : '';
            }

            template.elements.push(elementData);
        });

        // Използваме showSaveFilePicker вместо автоматично сваляне
        const saveFile = async () => {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `${this.templateName}.json`,
                    types: [{
                        description: 'JSON Files',
                        accept: {'application/json': ['.json']},
                    }],
                });
                
                const writable = await handle.createWritable();
                await writable.write(JSON.stringify(template, null, 2));
                await writable.close();
            } catch (err) {
                if (err.name !== 'AbortError') {
                    this.showError('Грешка при запазване на файла!');
                }
            }
        };

        saveFile();
    }

    createFormElement(type) {
        const element = document.createElement('div');
        element.className = `form-element ${type}-input`;
        element.draggable = false;
        
        const resizeHandles = `
            <div class="resize-handle resize-e"></div>
            <div class="resize-handle resize-s"></div>
            <div class="resize-handle resize-se"></div>
        `;
        
        if (type === 'text') {
            element.innerHTML = `
                <div class="drag-handle"></div>
                <div class="font-size-controls">
                    <button class="font-size-btn" data-size="large" title="Голям текст (Заглавие)">
                        <i class="fas fa-heading"></i>
                    </button>
                    <button class="font-size-btn" data-size="medium" title="Среден текст (Подзаглавие)">
                        <i class="fas fa-heading" style="font-size: 0.85em;"></i>
                    </button>
                    <button class="font-size-btn" data-size="small" title="Нормален текст (Съдържание)">
                        <i class="fas fa-paragraph"></i>
                    </button>
                </div>
                <textarea class="form-input" placeholder="Текстово поле"></textarea>
                ${resizeHandles}
            `;

            // Добавяме функционалност за промяна на размера на шрифта
            const textarea = element.querySelector('.form-input');
            const fontButtons = element.querySelectorAll('.font-size-btn');
            
            fontButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const size = btn.dataset.size;
                    fontButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    switch(size) {
                        case 'large':
                            textarea.style.fontSize = '24px';
                            break;
                        case 'medium':
                            textarea.style.fontSize = '18px';
                            break;
                        case 'small':
                            textarea.style.fontSize = '14px';
                            break;
                    }
                });
            });

        } else if (type === 'image') {
            element.innerHTML = `
                <div class="drag-handle"></div>
                <div class="image-container">
                    <input type="file" accept="image/*" class="image-input" style="display: none">
                    <div class="image-placeholder">
                        <i class="fas fa-image"></i>
                        <p>Кликнете за да изберете изображение</p>
                    </div>
                    <img class="preview-image" style="display: none">
                </div>
                ${resizeHandles}
            `;

            // Добавяме функционалност за качване на изображение
            const imageContainer = element.querySelector('.image-container');
            const fileInput = element.querySelector('.image-input');
            const placeholder = element.querySelector('.image-placeholder');
            const previewImage = element.querySelector('.preview-image');

            // Показваме диалога за избор на файл при клик
            imageContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('resize-handle')) return;
                fileInput.click();
            });

            // Обработваме избраното изображение
            fileInput.addEventListener('change', () => {
                const file = fileInput.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                        placeholder.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        this.makeElementDraggable(element);
        this.makeElementSelectable(element);
        this.makeElementResizable(element);

        return element;
    }

    makeElementDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        const dragHandler = (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('resize-handle')) {
                return;
            }
            
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
        };

        element.addEventListener('mousedown', dragHandler);

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            element.style.top = `${element.offsetTop - pos2}px`;
            element.style.left = `${element.offsetLeft - pos1}px`;
        }

        function closeDragElement() {
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('mouseup', closeDragElement);
        }
    }

    makeElementSelectable(element) {
        element.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            e.stopPropagation();
            if (this.selectedElement) {
                this.selectedElement.classList.remove('selected');
            }
            this.selectedElement = element;
            element.classList.add('selected');
        });
    }

    makeElementResizable(element) {
        const handles = {
            e: element.querySelector('.resize-e'),
            s: element.querySelector('.resize-s'),
            se: element.querySelector('.resize-se')
        };

        const initResize = (e, handle) => {
            e.stopPropagation();
            e.preventDefault();

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = element.offsetWidth;
            const startHeight = element.offsetHeight;

            const onMouseMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaY = moveEvent.clientY - startY;

                if (handle.includes('e')) {
                    element.style.width = `${startWidth + deltaX}px`;
                }
                if (handle.includes('s')) {
                    element.style.height = `${startHeight + deltaY}px`;
                }
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        handles.e.addEventListener('mousedown', (e) => initResize(e, 'e'));
        handles.s.addEventListener('mousedown', (e) => initResize(e, 's'));
        handles.se.addEventListener('mousedown', (e) => initResize(e, 'se'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormBuilder();
}); 