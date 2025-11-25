// script.js - Versión con botón "Vaciar Todo" y Habilidades corregido
// Desarrollado por: Hernández Guadarrama Hellen Aylén
document.addEventListener('DOMContentLoaded', () => {

    // Elementos globales
    const cvContainer = document.getElementById('cv-container');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const clearAllBtn = document.getElementById('clear-all-btn'); // NUEVO BOTÓN
    const importFileInput = document.getElementById('import-file-input');

    // === Botón para importar datos adicionales ===
    // Proyecto UAMEX - Roberto Bonifacio Castelan Sanagustín
    const importAdditionalBtn = document.createElement('button');
    importAdditionalBtn.innerHTML = '<i class="bx bx-plus"></i> Añadir Datos desde JSON';
    importAdditionalBtn.id = 'import-additional-btn';
    importAdditionalBtn.style.marginTop = '0.5rem';
    importAdditionalBtn.classList.add('actions-button');
    
    // Insertar el botón después del botón de importar datos
    importDataBtn.parentNode.insertBefore(importAdditionalBtn, importDataBtn.nextSibling);

    const importAdditionalInput = document.createElement('input');
    importAdditionalInput.type = 'file';
    importAdditionalInput.id = 'import-additional-input';
    importAdditionalInput.hidden = true;
    importAdditionalInput.accept = '.json,.zip';
    document.body.appendChild(importAdditionalInput);

    // === FUNCIÓN PARA VACIAR TODO ===
    const clearAllData = () => {
        if (confirm('¿Estás seguro de que quieres vaciar todo el contenido del CV?\n\nEsta acción eliminará todos los bloques y datos, y no se puede deshacer.')) {
            // Limpiar el contenedor principal
            cvContainer.innerHTML = '';
            
            // Limpiar el localStorage
            localStorage.removeItem('cvData');
            
            // Mostrar mensaje de confirmación
            alert('Todo el contenido ha sido eliminado correctamente.\n\nPuedes comenzar a crear un nuevo CV desde cero.');
            
            console.log('Todos los datos han sido eliminados');
        }
    };

    // Selector de diseño
    let selectedLayout = 'single-column';
    const layoutBtns = document.querySelectorAll('.layout-btn');
    layoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            layoutBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedLayout = btn.dataset.layout;
        });
    });

    // Sortable
    new Sortable(cvContainer, {
        animation: 150, handle: '.handle', ghostClass: 'sortable-ghost',
    });

    // === FUNCIÓN PARA CARGAR ARCHIVOS PDF DESDE EL SERVIDOR ===
    const loadPDFFromServer = async (filePath, fileName) => {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('Archivo no encontrado');
            
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        fileData: e.target.result,
                        fileName: fileName
                    });
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn('Error cargando PDF:', error);
            return null;
        }
    };

    // === FUNCIONES PARA CREAR ITEMS ESTRUCTURADOS COMPLETOS ===
    const createItemHTML = (type, data = {}) => {
        const templates = {
            education: `
                <div class="item education-item">
                    <div class="item-controls"><i class="bx bx-trash delete-item-btn"></i></div>
                    <div class="item-header">
                        <h3 class="item-title" contenteditable="true" data-placeholder="DOCTORADO / MAESTRÍA / LICENCIATURA">${data.level || ''}</h3>
                    </div>
                    <div class="item-content">
                        <p class="item-field" contenteditable="true" data-field="degree" data-placeholder="Título obtenido">${data.degree || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="institution" data-placeholder="Institución">${data.institution || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="location" data-placeholder="Ubicación">${data.location || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="status" data-placeholder="Estado (Concluida / En curso)">${data.status || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="thesis" data-placeholder="Tesis: Título de tesis">${data.thesis || ''}</p>
                        <p class="item-field date-field" contenteditable="true" data-field="graduation-date" data-date-format="true" data-placeholder="Fecha de obtención del grado (dd/mm/aa)">${data.graduationDate || ''}</p>
                    </div>
                </div>`,

            languages: `
                <div class="item language-item">
                    <div class="item-controls"><i class="bx bx-trash delete-item-btn"></i></div>
                    <div class="item-header">
                        <span class="item-year" contenteditable="true" data-placeholder="Año">${data.year || ''}</span>
                    </div>
                    <div class="item-content">
                        <p class="item-field" contenteditable="true" data-field="language" data-placeholder="Idioma (Ej: Inglés, Francés, etc.)">${data.language || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="institution" data-placeholder="Institución donde estudió el idioma">${data.institution || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="level" data-placeholder="Nivel (Básico, Intermedio, Avanzado)">${data.level || ''}</p>
                        <p class="item-field date-field" contenteditable="true" data-field="date" data-date-format="true" data-placeholder="Fecha de certificación (dd/mm/aa)">${data.date || ''}</p>
                    </div>
                </div>`,

            diplomas: `
                <div class="item diploma-item">
                    <div class="item-controls"><i class="bx bx-trash delete-item-btn"></i></div>
                    <div class="item-header">
                        <span class="item-year" contenteditable="true" data-placeholder="Año">${data.year || ''}</span>
                    </div>
                    <div class="item-content">
                        <p class="item-field" contenteditable="true" data-field="institution" data-placeholder="Institución">${data.institution || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="title" data-placeholder="Título del diplomado">${data.title || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="duration" data-placeholder="Duración en horas">${data.duration || ''}</p>
                        <p class="item-field date-field" contenteditable="true" data-field="date" data-date-format="true" data-placeholder="Fecha (dd/mm/aa)">${data.date || ''}</p>
                        <div class="file-area">
                            <div class="file-options">
                                <button class="attach-file-btn" type="button"><i class='bx bx-paperclip'></i> Subir PDF</button>
                                <span class="file-option-separator">y/o</span>
                                <button class="add-link-btn" type="button"><i class='bx bx-link'></i> Agregar Enlace</button>
                            </div>
                            <div class="file-preview">
                                ${(data.fileName || data.fileUrl) ? renderFilePreviewHTML(data.fileData, data.fileName, data.filePath, data.fileUrl, data.linkName) : ''}
                            </div>
                            <input type="file" class="file-input" hidden accept="application/pdf,.pdf">
                            <div class="link-input-container" hidden>
                                <input type="url" class="link-input" placeholder="https://ejemplo.com/documento.pdf" value="${data.fileUrl || ''}">
                                <input type="text" class="link-name-input" placeholder="Nombre del documento" value="${data.linkName || ''}">
                                <div class="link-buttons">
                                    <button class="save-link-btn"><i class='bx bx-check'></i> Guardar Enlace</button>
                                    <button class="cancel-link-btn"><i class='bx bx-x'></i> Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`,

            experience: `
                <div class="item experience-item">
                    <div class="item-controls"><i class="bx bx-trash delete-item-btn"></i></div>
                    <div class="item-content">
                        <p class="item-field" contenteditable="true" data-placeholder="Descripción del puesto y responsabilidades">${data.position || ''}</p>
                    </div>
                </div>`,

            courses: `
                <div class="item course-item" 
                    ${data.fileData ? `data-file-data="${data.fileData}"` : ''} 
                    ${data.fileName ? `data-file-name="${data.fileName}"` : ''} 
                    ${data.filePath ? `data-file-path="${data.filePath}"` : ''} 
                    ${data.fileUrl ? `data-file-url="${data.fileUrl}"` : ''}
                    ${data.linkName ? `data-link-name="${data.linkName}"` : ''}>
                    <div class="item-controls"><i class="bx bx-trash delete-item-btn"></i></div>
                    <div class="item-header">
                        <span class="item-year" contenteditable="true" data-placeholder="Año">${data.year || ''}</span>
                    </div>
                    <div class="item-content">
                        <p class="item-field" contenteditable="true" data-field="institution" data-placeholder="Institución">${data.institution || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="title" data-placeholder="Título del curso">${data.title || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="duration" data-placeholder="Duración en horas">${data.duration || ''}</p>
                        <p class="item-field date-field" contenteditable="true" data-field="date" data-date-format="true" data-placeholder="Fecha (dd/mm/aa)">${data.date || ''}</p>
                        <div class="file-area">
                            <div class="file-options">
                                <button class="attach-file-btn" type="button"><i class='bx bx-paperclip'></i> Subir PDF</button>
                                <span class="file-option-separator">y/o</span>
                                <button class="add-link-btn" type="button"><i class='bx bx-link'></i> Agregar Enlace</button>
                            </div>
                            <div class="file-preview">
                                ${(data.fileName || data.fileUrl) ? renderFilePreviewHTML(data.fileData, data.fileName, data.filePath, data.fileUrl, data.linkName) : ''}
                            </div>
                            <input type="file" class="file-input" hidden accept="application/pdf,.pdf">
                            <div class="link-input-container" hidden>
                                <input type="url" class="link-input" placeholder="https://ejemplo.com/documento.pdf" value="${data.fileUrl || ''}">
                                <input type="text" class="link-name-input" placeholder="Nombre del documento" value="${data.linkName || ''}">
                                <div class="link-buttons">
                                    <button class="save-link-btn"><i class='bx bx-check'></i> Guardar Enlace</button>
                                    <button class="cancel-link-btn"><i class='bx bx-x'></i> Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`,

            'academic-production': `
                <div class="item academic-item">
                    <div class="item-controls"><i class="bx bx-trash delete-item-btn"></i></div>
                    <div class="item-header">
                        <h3 class="item-subsection" contenteditable="true" data-placeholder="ARTÍCULOS / CAPÍTULOS / LIBROS">${data.subsection || ''}</h3>
                        <span class="item-year" contenteditable="true" data-placeholder="Año">${data.year || ''}</span>
                    </div>
                    <div class="item-content">
                        <p class="item-field" contenteditable="true" data-field="title" data-placeholder="Título">${data.title || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="journal" data-placeholder="Revista / Editorial">${data.journal || ''}</p>
                        <p class="item-field" contenteditable="true" data-field="details" data-placeholder="Detalles adicionales (ISSN, ISBN, etc.)">${data.details || ''}</p>
                        <div class="file-area">
                            <div class="file-options">
                                <button class="attach-file-btn" type="button"><i class='bx bx-paperclip'></i> Subir PDF</button>
                                <span class="file-option-separator">y/o</span>
                                <button class="add-link-btn" type="button"><i class='bx bx-link'></i> Agregar Enlace</button>
                            </div>
                            <div class="file-preview">
                                ${(data.fileName || data.fileUrl) ? renderFilePreviewHTML(data.fileData, data.fileName, data.filePath, data.fileUrl, data.linkName) : ''}
                            </div>
                            <input type="file" class="file-input" hidden accept="application/pdf,.pdf">
                            <div class="link-input-container" hidden>
                                <input type="url" class="link-input" placeholder="https://ejemplo.com/documento.pdf" value="${data.fileUrl || ''}">
                                <input type="text" class="link-name-input" placeholder="Nombre del documento" value="${data.linkName || ''}">
                                <div class="link-buttons">
                                    <button class="save-link-btn"><i class='bx bx-check'></i> Guardar Enlace</button>
                                    <button class="cancel-link-btn"><i class='bx bx-x'></i> Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`,

            // === CORRECCIÓN: TEMPLATE DE HABILIDADES COMPLETO ===
            skills: `
                <div class="item skill-item">
                    <div class="item-controls"><i class="bx bx-trash delete-item-btn"></i></div>
                    <div class="item-content">
                        <div class="skill-inputs">
                            <input type="text" class="skill-name" placeholder="Nombre de la habilidad" value="${data.name || ''}">
                            <select class="skill-level">
                                <option value="Principiante" ${data.level === 'Principiante' ? 'selected' : ''}>Principiante</option>
                                <option value="Básico" ${data.level === 'Básico' ? 'selected' : ''}>Básico</option>
                                <option value="Intermedio" ${data.level === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
                                <option value="Avanzado" ${data.level === 'Avanzado' ? 'selected' : ''}>Avanzado</option>
                                <option value="Experto" ${data.level === 'Experto' ? 'selected' : ''}>Experto</option>
                            </select>
                        </div>
                    </div>
                </div>`
        };

        return templates[type] || '';
    };

    // === FUNCIÓN MEJORADA PARA RENDERIZAR PREVIEW DE ARCHIVOS Y ENLACES ===
    const renderFilePreviewHTML = (fileData, fileName, filePath = '', fileUrl = '', linkName = '') => {
        let content = '';
        
        // Si hay archivo PDF
        if (fileData || filePath) {
            const viewButton = fileData ? 
                `<button class="view-pdf-btn" data-file="${fileData}"><i class='bx bx-show'></i> Ver PDF</button>` :
                `<button class="view-pdf-btn" data-file-path="${filePath}"><i class='bx bx-show'></i> Ver PDF</button>`;
            
            content += `
                <div class="file-preview-item file-preview">
                    <i class='bx bxs-file-pdf'></i> 
                    <span class="file-name">${fileName || 'Documento PDF'}</span>
                    ${viewButton}
                    <button class="remove-pdf-btn" data-type="file"><i class='bx bx-trash'></i> Eliminar PDF</button>
                </div>
            `;
        }
        
        // Si hay enlace
        if (fileUrl) {
            content += `
                <div class="file-preview-item link-preview">
                    <i class='bx bx-link-external'></i> 
                    <span class="file-name">${linkName || 'Documento en línea'}</span>
                    <a href="${fileUrl}" target="_blank" class="view-link-btn">
                        <i class='bx bx-show'></i> Abrir Enlace
                    </a>
                    <button class="remove-pdf-btn" data-type="link"><i class='bx bx-trash'></i> Eliminar Enlace</button>
                </div>
            `;
        }
        
        return content;
    };

    const renderFilePreview = (previewElement, fileData, fileName, filePath = '', fileUrl = '', linkName = '') => {
        if (!previewElement) return;
        previewElement.innerHTML = renderFilePreviewHTML(fileData, fileName, filePath, fileUrl, linkName);
        
        // === CORRECCIÓN: SIEMPRE MOSTRAR OPCIONES PARA PERMITIR AGREGAR MÁS ===
        const fileArea = previewElement.closest('.file-area');
        if (!fileArea) return;
        
        // Siempre mostrar las opciones para permitir agregar ambos
        showFileOptions(fileArea);
    };

    // === FUNCIONES MEJORADAS PARA MOSTRAR/OCULTAR OPCIONES ===
    const showFileOptions = (fileArea) => {
        const fileOptions = fileArea.querySelector('.file-options');
        const linkInputContainer = fileArea.querySelector('.link-input-container');
        
        if (fileOptions) {
            fileOptions.hidden = false;
            fileOptions.style.display = 'flex';
        }
        if (linkInputContainer) {
            linkInputContainer.hidden = true;
            linkInputContainer.style.display = 'none';
        }
    };

    const hideFileOptions = (fileArea) => {
        const fileOptions = fileArea.querySelector('.file-options');
        const linkInputContainer = fileArea.querySelector('.link-input-container');
        
        if (fileOptions) {
            fileOptions.hidden = true;
            fileOptions.style.display = 'none';
        }
        if (linkInputContainer) {
            linkInputContainer.hidden = true;
            linkInputContainer.style.display = 'none';
        }
    };

    const toggleLinkInput = (fileArea, show = true) => {
        const linkInputContainer = fileArea.querySelector('.link-input-container');
        const fileOptions = fileArea.querySelector('.file-options');
        
        if (show) {
            if (linkInputContainer) {
                linkInputContainer.hidden = false;
                linkInputContainer.style.display = 'block';
            }
            if (fileOptions) {
                fileOptions.hidden = true;
                fileOptions.style.display = 'none';
            }
            linkInputContainer.querySelector('.link-input').focus();
        } else {
            if (linkInputContainer) {
                linkInputContainer.hidden = true;
                linkInputContainer.style.display = 'none';
            }
            
            // === CORRECCIÓN: SIEMPRE MOSTRAR OPCIONES AL CANCELAR ===
            if (fileOptions) {
                fileOptions.hidden = false;
                fileOptions.style.display = 'flex';
            }
        }
    };

    // === SISTEMA DE BLOQUES MEJORADO ===

    const addBlock = async (type, data = {}, options = {}) => {
        const template = document.getElementById(`${type}-template`);
        if (!template) return;

        const newBlock = template.content.cloneNode(true).firstElementChild;
        
        // Si se especifica insertar al inicio, lo insertamos al principio
        if (options.insertAtStart) {
            cvContainer.insertBefore(newBlock, cvContainer.firstChild);
        } else {
            cvContainer.appendChild(newBlock);
        }

        // Configurar event listeners para el nuevo bloque
        setupBlockEventListeners(newBlock);

        if (Object.keys(data).length > 0) {
            if (data.title) {
                const t = newBlock.querySelector('.block-title');
                if (t) t.innerHTML = data.title;
            }

            if (data.items && ['education', 'languages', 'diplomas', 'experience', 'courses', 'academic-production', 'skills'].includes(type)) {
                const itemList = newBlock.querySelector('.item-list');
                
                // Procesar items
                for (const itemData of data.items) {
                    let processedItemData = { ...itemData };
                    
                    // Si hay filePath pero no fileData, cargar el PDF desde el servidor
                    if ((type === 'courses' || type === 'diplomas' || type === 'academic-production') && itemData.filePath && !itemData.fileData) {
                        const pdfData = await loadPDFFromServer(itemData.filePath, itemData.fileName);
                        if (pdfData) {
                            processedItemData.fileData = pdfData.fileData;
                            processedItemData.fileName = pdfData.fileName;
                        }
                    }
                    
                    itemList.insertAdjacentHTML('beforeend', createItemHTML(type, processedItemData));
                    
                    // Actualizar el dataset del elemento recién creado
                    const newItem = itemList.lastElementChild;
                    if (type === 'courses' || type === 'diplomas' || type === 'academic-production') {
                        if (processedItemData.fileData) {
                            newItem.dataset.fileData = processedItemData.fileData;
                        }
                        if (processedItemData.fileName) {
                            newItem.dataset.fileName = processedItemData.fileName;
                        }
                        if (processedItemData.filePath) {
                            newItem.dataset.filePath = processedItemData.filePath;
                        }
                        if (processedItemData.fileUrl) {
                            newItem.dataset.fileUrl = processedItemData.fileUrl;
                        }
                        if (processedItemData.linkName) {
                            newItem.dataset.linkName = processedItemData.linkName;
                        }
                    }
                    
                    // Configurar event listeners para el nuevo item
                    setupItemEventListeners(newItem);
                }
            }

            // Reconstruir foto si existe - CORREGIDO
            if (type === 'personal' && data.photo) {
                const photoArea = newBlock.querySelector('.photo-area');
                const img = photoArea.querySelector('.profile-photo');
                const placeholder = photoArea.querySelector('.photo-placeholder');
                const addBtn = photoArea.querySelector('.add-photo-btn');
                const removeBtn = photoArea.querySelector('.remove-photo-btn');
                
                img.src = data.photo;
                img.classList.add('show');
                placeholder.classList.add('hidden');
                addBtn.classList.add('hidden');
                removeBtn.classList.remove('hidden');
            }
        }
        
        // Configurar event listeners para botones de añadir items
        const addItemBtn = newBlock.querySelector('.add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                const block = addItemBtn.closest('.cv-block');
                const type = block.dataset.blockType;
                const itemList = block.querySelector('.item-list');
                if (itemList) {
                    const newItemHTML = createItemHTML(type);
                    itemList.insertAdjacentHTML('beforeend', newItemHTML);
                    const newItem = itemList.lastElementChild;
                    setupItemEventListeners(newItem);
                    saveCV();
                }
            });
        }

        return newBlock;
    };

    // === CONFIGURACIÓN DE EVENT LISTENERS POR ELEMENTO ===
    const setupBlockEventListeners = (block) => {
        // Botón de eliminar bloque
        const deleteBtn = block.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (block && block.parentNode) {
                    block.remove();
                    saveCV();
                    console.log('Bloque eliminado correctamente');
                }
            });
        }

        // Botón de añadir foto - CORREGIDO
        const addPhotoBtn = block.querySelector('.add-photo-btn');
        if (addPhotoBtn) {
            addPhotoBtn.addEventListener('click', () => {
                const photoInput = block.querySelector('.photo-input');
                if (photoInput) photoInput.click();
            });
        }

        // Botón de eliminar foto - CORREGIDO
        const removePhotoBtn = block.querySelector('.remove-photo-btn');
        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', () => {
                const photoArea = removePhotoBtn.closest('.photo-area');
                const img = photoArea.querySelector('.profile-photo');
                const placeholder = photoArea.querySelector('.photo-placeholder');
                const addBtn = photoArea.querySelector('.add-photo-btn');
                const removeBtn = photoArea.querySelector('.remove-photo-btn');
                
                // CORRECCIÓN: Usar clases CSS en lugar de hidden attribute
                img.src = ""; 
                img.classList.remove('show');
                placeholder.classList.remove('hidden');
                removeBtn.classList.add('hidden');
                addBtn.classList.remove('hidden');
                saveCV();
            });
        }

        // Input de foto - CORREGIDO
        const photoInput = block.querySelector('.photo-input');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const photoArea = photoInput.closest('.photo-area');
                    const img = photoArea.querySelector('.profile-photo');
                    const placeholder = photoArea.querySelector('.photo-placeholder');
                    const addBtn = photoArea.querySelector('.add-photo-btn');
                    const removeBtn = photoArea.querySelector('.remove-photo-btn');
                    
                    // CORRECCIÓN: Usar clases CSS en lugar de hidden attribute
                    img.src = event.target.result; 
                    img.classList.add('show');
                    placeholder.classList.add('hidden');
                    addBtn.classList.add('hidden');
                    removeBtn.classList.remove('hidden');
                    saveCV();
                };
                reader.readAsDataURL(file);
            });
        }

        // Botones de archivos
        const attachFileBtn = block.querySelector('.attach-file-btn');
        if (attachFileBtn) {
            attachFileBtn.addEventListener('click', () => {
                const fileArea = attachFileBtn.closest('.file-area');
                const fileInput = fileArea.querySelector('.file-input');
                if (fileInput) fileInput.click();
            });
        }

        const addLinkBtn = block.querySelector('.add-link-btn');
        if (addLinkBtn) {
            addLinkBtn.addEventListener('click', () => {
                const fileArea = addLinkBtn.closest('.file-area');
                const linkInput = fileArea.querySelector('.link-input');
                const nameInput = fileArea.querySelector('.link-name-input');
                linkInput.value = block.dataset.fileUrl || '';
                nameInput.value = block.dataset.linkName || '';
                toggleLinkInput(fileArea, true);
            });
        }

        const saveLinkBtn = block.querySelector('.save-link-btn');
        if (saveLinkBtn) {
            saveLinkBtn.addEventListener('click', () => {
                const fileArea = saveLinkBtn.closest('.file-area');
                const linkInput = fileArea.querySelector('.link-input');
                const nameInput = fileArea.querySelector('.link-name-input');
                const url = linkInput.value.trim();
                const name = nameInput.value.trim() || 'Documento en línea';
                
                if (!url) {
                    alert('Por favor, ingresa una URL válida');
                    return;
                }
                
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    alert('Por favor, ingresa una URL válida que comience con http:// o https://');
                    return;
                }
                
                block.dataset.fileUrl = url;
                block.dataset.linkName = name;
                
                const previewElement = fileArea.querySelector('.file-preview');
                const fileData = block.dataset.fileData;
                const fileName = block.dataset.fileName;
                const filePath = block.dataset.filePath;
                
                renderFilePreview(previewElement, fileData, fileName, filePath, url, name);
                toggleLinkInput(fileArea, false);
                
                saveCV();
            });
        }

        const cancelLinkBtn = block.querySelector('.cancel-link-btn');
        if (cancelLinkBtn) {
            cancelLinkBtn.addEventListener('click', () => {
                const fileArea = cancelLinkBtn.closest('.file-area');
                toggleLinkInput(fileArea, false);
            });
        }
    };

    const setupItemEventListeners = (item) => {
        // Botón de eliminar item
        const deleteItemBtn = item.querySelector('.delete-item-btn');
        if (deleteItemBtn) {
            deleteItemBtn.addEventListener('click', () => {
                if (item && item.parentNode) {
                    item.remove();
                    saveCV();
                    console.log('Item eliminado correctamente');
                }
            });
        }

        // Botones de archivos
        const attachFileBtn = item.querySelector('.attach-file-btn');
        if (attachFileBtn) {
            attachFileBtn.addEventListener('click', () => {
                const fileArea = attachFileBtn.closest('.file-area');
                const fileInput = fileArea.querySelector('.file-input');
                if (fileInput) fileInput.click();
            });
        }

        const addLinkBtn = item.querySelector('.add-link-btn');
        if (addLinkBtn) {
            addLinkBtn.addEventListener('click', () => {
                const fileArea = addLinkBtn.closest('.file-area');
                const linkInput = fileArea.querySelector('.link-input');
                const nameInput = fileArea.querySelector('.link-name-input');
                linkInput.value = item.dataset.fileUrl || '';
                nameInput.value = item.dataset.linkName || '';
                toggleLinkInput(fileArea, true);
            });
        }

        const saveLinkBtn = item.querySelector('.save-link-btn');
        if (saveLinkBtn) {
            saveLinkBtn.addEventListener('click', () => {
                const fileArea = saveLinkBtn.closest('.file-area');
                const linkInput = fileArea.querySelector('.link-input');
                const nameInput = fileArea.querySelector('.link-name-input');
                const url = linkInput.value.trim();
                const name = nameInput.value.trim() || 'Documento en línea';
                
                if (!url) {
                    alert('Por favor, ingresa una URL válida');
                    return;
                }
                
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    alert('Por favor, ingresa una URL válida que comience con http:// o https://');
                    return;
                }
                
                item.dataset.fileUrl = url;
                item.dataset.linkName = name;
                
                const previewElement = fileArea.querySelector('.file-preview');
                const fileData = item.dataset.fileData;
                const fileName = item.dataset.fileName;
                const filePath = item.dataset.filePath;
                
                renderFilePreview(previewElement, fileData, fileName, filePath, url, name);
                toggleLinkInput(fileArea, false);
                
                saveCV();
            });
        }

        const cancelLinkBtn = item.querySelector('.cancel-link-btn');
        if (cancelLinkBtn) {
            cancelLinkBtn.addEventListener('click', () => {
                const fileArea = cancelLinkBtn.closest('.file-area');
                toggleLinkInput(fileArea, false);
            });
        }

        // Input de archivo
        const fileInput = item.querySelector('.file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (file.type !== 'application/pdf') {
                    alert('Por favor, selecciona un archivo PDF');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const fileArea = fileInput.closest('.file-area');
                    const previewElement = fileArea.querySelector('.file-preview');
                    
                    item.dataset.fileData = event.target.result;
                    item.dataset.fileName = file.name;
                    item.dataset.filePath = '';
                    
                    const fileUrl = item.dataset.fileUrl;
                    const linkName = item.dataset.linkName;
                    
                    renderFilePreview(previewElement, event.target.result, file.name, '', fileUrl, linkName);
                    saveCV();
                };
                reader.readAsDataURL(file);
            });
        }

        // === CORRECCIÓN: EVENT LISTENERS ESPECÍFICOS PARA HABILIDADES ===
        if (item.classList.contains('skill-item')) {
            const skillNameInput = item.querySelector('.skill-name');
            const skillLevelSelect = item.querySelector('.skill-level');
            
            if (skillNameInput) {
                skillNameInput.addEventListener('input', () => {
                    saveCV();
                });
            }
            
            if (skillLevelSelect) {
                skillLevelSelect.addEventListener('change', () => {
                    saveCV();
                });
            }
        }

        // Event delegation para botones dinámicos en file-preview
        const filePreview = item.querySelector('.file-preview');
        if (filePreview) {
            filePreview.addEventListener('click', (e) => {
                const target = e.target;
                const button = target.closest('button');
                
                if (button && button.classList.contains('view-pdf-btn')) {
                    const fileData = button.dataset.file;
                    const filePath = button.dataset.filePath;
                    
                    if (fileData) {
                        const newWindow = window.open();
                        newWindow.document.write(`
                            <html>
                                <head><title>Vista previa PDF</title></head>
                                <body style="margin:0; padding:0;">
                                    <embed src="${fileData}" type="application/pdf" width="100%" height="100%" />
                                </body>
                            </html>
                        `);
                    } else if (filePath) {
                        window.open(filePath, '_blank');
                    }
                }
                
                if (button && button.classList.contains('remove-pdf-btn')) {
                    const removeType = button.dataset.type;
                    const fileArea = button.closest('.file-area');
                    const previewElement = fileArea.querySelector('.file-preview');
                    
                    if (removeType === 'file') {
                        delete item.dataset.fileData;
                        delete item.dataset.fileName;
                        delete item.dataset.filePath;
                    } else if (removeType === 'link') {
                        delete item.dataset.fileUrl;
                        delete item.dataset.linkName;
                    }
                    
                    const fileData = item.dataset.fileData;
                    const fileName = item.dataset.fileName;
                    const filePath = item.dataset.filePath;
                    const fileUrl = item.dataset.fileUrl;
                    const linkName = item.dataset.linkName;
                    
                    renderFilePreview(previewElement, fileData, fileName, filePath, fileUrl, linkName);
                    
                    saveCV();
                }
            });
        }
    };

    // === FUNCIÓN PARA FORMATEAR FECHAS AUTOMÁTICAMENTE ===
    const formatDateInput = (text) => {
        let numbers = text.replace(/\D/g, '');
        
        if (numbers.length <= 2) {
            return numbers;
        } else if (numbers.length <= 4) {
            return numbers.substring(0, 2) + '/' + numbers.substring(2);
        } else {
            return numbers.substring(0, 2) + '/' + numbers.substring(2, 4) + '/' + numbers.substring(4, 6);
        }
    };

    // === FUNCIÓN AUXILIAR PARA TÍTULOS POR DEFECTO ===
    const getDefaultTitle = (blockType) => {
        const titles = {
            'personal': 'DATOS PERSONALES',
            'education': 'FORMACIÓN ACADÉMICA',
            'experience': 'EXPERIENCIA PROFESIONAL',
            'languages': 'IDIOMAS',
            'diplomas': 'DIPLOMADOS',
            'courses': 'CURSOS',
            'academic-production': 'PRODUCCIÓN ACADÉMICA',
            'skills': 'HABILIDADES',
            'hobbies': 'PASATIEMPOS'
        };
        return titles[blockType] || 'SECCIÓN';
    };

    // === FUNCIÓN PARA FORMATEAR URLs DE MANERA LEGIBLE ===
    const formatUrlForPDF = (url) => {
        if (!url) return '';
        
        if (url.length > 60) {
            return url.substring(0, 57) + '...';
        }
        return url;
    };

    // === NUEVO: ORDEN PREDEFINIDO DE SECCIONES PARA ORGANIZACIÓN ===
    const SECTION_ORDER = [
        'personal',
        'summary',
        'education',
        'experience',
        'languages',
        'diplomas',
        'courses',
        'academic-production',
        'skills',
        'hobbies',
        'custom'
    ];

    // === NUEVO: FUNCIÓN PARA REORGANIZAR BLOQUES POR CATEGORÍA ===
    const reorganizeBlocks = () => {
        const blocks = Array.from(cvContainer.querySelectorAll('.cv-block'));
        
        // Ordenar bloques según el orden predefinido
        blocks.sort((a, b) => {
            const typeA = a.dataset.blockType;
            const typeB = b.dataset.blockType;
            const indexA = SECTION_ORDER.indexOf(typeA);
            const indexB = SECTION_ORDER.indexOf(typeB);
            return indexA - indexB;
        });

        // Reinsertar bloques en el orden correcto
        blocks.forEach(block => {
            cvContainer.appendChild(block);
        });
    };

    // === NUEVO SISTEMA: GENERAR LÍNEAS DE TEXTO A PARTIR DEL HTML ===
    const collectStructuredSections = () => {
        const structured = [];
        const blocks = Array.from(cvContainer.querySelectorAll('.cv-block'));

        blocks.forEach(block => {
            const blockType = block.dataset.blockType;
            const tituloBloque = block.querySelector('.block-title')?.textContent?.trim() || '';
            
            const lines = [];
            const subtitles = [];

            const clean = (s) => (s || '').replace(/\s+/g, ' ').trim().replace(/\n/g, ' ');

            switch (blockType) {
                case 'personal':
                    const nombre = clean(block.querySelector('.data-name')?.textContent);
                    const puesto = clean(block.querySelector('.data-position')?.textContent);
                    const email = clean(block.querySelector('.data-email')?.textContent);
                    const telefono = clean(block.querySelector('.data-phone')?.textContent);
                    const direccion = clean(block.querySelector('.data-address')?.textContent);

                    if (nombre) lines.push(nombre.toUpperCase());
                    if (puesto) lines.push(`Puesto: ${puesto}`);
                    if (email) lines.push(`Email: ${email}`);
                    if (telefono) lines.push(`Teléfono: ${telefono}`);
                    if (direccion) lines.push(`Dirección: ${direccion}`);
                    break;

                case 'education':
                    const itemsEducacion = Array.from(block.querySelectorAll('.item'));
                    itemsEducacion.forEach(item => {
                        const nivel = clean(item.querySelector('.item-title')?.textContent);
                        const grado = clean(item.querySelector('[data-field="degree"]')?.textContent);
                        const institucion = clean(item.querySelector('[data-field="institution"]')?.textContent);
                        const ubicacion = clean(item.querySelector('[data-field="location"]')?.textContent);
                        const estado = clean(item.querySelector('[data-field="status"]')?.textContent);
                        const tesis = clean(item.querySelector('[data-field="thesis"]')?.textContent);
                        const fecha = clean(item.querySelector('[data-field="graduation-date"]')?.textContent);

                        if (nivel) {
                            lines.push(nivel.toUpperCase());
                            subtitles.push(nivel);
                        }
                        if (grado) lines.push(`Título: ${grado}`);
                        if (institucion) lines.push(`Institución: ${institucion}`);
                        if (ubicacion) lines.push(`Ubicación: ${ubicacion}`);
                        if (estado) lines.push(`Estado: ${estado}`);
                        if (tesis) lines.push(`Tesis: ${tesis}`);
                        if (fecha) lines.push(`Fecha de graduación: ${fecha}`);
                        lines.push('');
                    });
                    break;

                case 'languages':
                    const itemsIdiomas = Array.from(block.querySelectorAll('.item'));
                    itemsIdiomas.forEach(item => {
                        const idioma = clean(item.querySelector('[data-field="language"]')?.textContent);
                        const year = clean(item.querySelector('.item-year')?.textContent);
                        const institucion = clean(item.querySelector('[data-field="institution"]')?.textContent);
                        const nivel = clean(item.querySelector('[data-field="level"]')?.textContent);
                        const fecha = clean(item.querySelector('[data-field="date"]')?.textContent);

                        if (idioma) {
                            lines.push(`IDIOMA: ${idioma.toUpperCase()}`);
                            subtitles.push(idioma);
                        }
                        if (year) lines.push(`Año: ${year}`);
                        if (institucion) lines.push(`Institución: ${institucion}`);
                        if (nivel) lines.push(`Nivel: ${nivel}`);
                        if (fecha) lines.push(`Fecha de certificación: ${fecha}`);
                        lines.push('');
                    });
                    break;

                case 'courses':
                    const itemsCursos = Array.from(block.querySelectorAll('.item'));
                    itemsCursos.forEach(item => {
                        const year = clean(item.querySelector('.item-year')?.textContent);
                        const institucion = clean(item.querySelector('[data-field="institution"]')?.textContent);
                        const titulo = clean(item.querySelector('[data-field="title"]')?.textContent);
                        const duracion = clean(item.querySelector('[data-field="duration"]')?.textContent);
                        const fecha = clean(item.querySelector('[data-field="date"]')?.textContent);
                        
                        const fileUrl = item.dataset.fileUrl;
                        const linkName = item.dataset.linkName;
                        const fileName = item.dataset.fileName;

                        if (year) {
                            lines.push(`AÑO: ${year}`);
                            subtitles.push(year);
                        }
                        if (institucion) lines.push(`Institución: ${institucion}`);
                        if (titulo) lines.push(`Curso: ${titulo}`);
                        if (duracion) lines.push(`Duración: ${duracion} horas`);
                        if (fecha) lines.push(`Fecha: ${fecha}`);
                        
                        if (fileUrl && linkName) {
                            lines.push(`Enlace externo: ${linkName}`);
                            lines.push(`URL: ${fileUrl}`);
                        } else if (fileUrl) {
                            lines.push(`Enlace externo: ${fileUrl}`);
                        }
                        
                        if (fileName && !fileUrl) {
                            lines.push(`Documento adjunto: ${fileName}`);
                        }
                        
                        lines.push('');
                    });
                    break;

                case 'diplomas':
                    const itemsDiplomas = Array.from(block.querySelectorAll('.item'));
                    itemsDiplomas.forEach(item => {
                        const year = clean(item.querySelector('.item-year')?.textContent);
                        const institucion = clean(item.querySelector('[data-field="institution"]')?.textContent);
                        const titulo = clean(item.querySelector('[data-field="title"]')?.textContent);
                        const duracion = clean(item.querySelector('[data-field="duration"]')?.textContent);
                        const fecha = clean(item.querySelector('[data-field="date"]')?.textContent);
                        
                        const fileUrl = item.dataset.fileUrl;
                        const linkName = item.dataset.linkName;

                        if (year) {
                            lines.push(`AÑO: ${year}`);
                            subtitles.push(year);
                        }
                        if (institucion) lines.push(`Institución: ${institucion}`);
                        if (titulo) lines.push(`Diplomado: ${titulo}`);
                        if (duracion) lines.push(`Duración: ${duracion} horas`);
                        if (fecha) lines.push(`Fecha: ${fecha}`);
                        
                        if (fileUrl && linkName) {
                            lines.push(`Enlace externo: ${linkName}`);
                            lines.push(`URL: ${fileUrl}`);
                        } else if (fileUrl) {
                            lines.push(`Enlace externo: ${fileUrl}`);
                        }
                        
                        lines.push('');
                    });
                    break;

                case 'academic-production':
                    const itemsAcademicos = Array.from(block.querySelectorAll('.item'));
                    itemsAcademicos.forEach(item => {
                        const subsection = clean(item.querySelector('.item-subsection')?.textContent);
                        const year = clean(item.querySelector('.item-year')?.textContent);
                        const titulo = clean(item.querySelector('[data-field="title"]')?.textContent);
                        const revista = clean(item.querySelector('[data-field="journal"]')?.textContent);
                        const detalles = clean(item.querySelector('[data-field="details"]')?.textContent);
                        
                        const fileUrl = item.dataset.fileUrl;
                        const linkName = item.dataset.linkName;

                        if (subsection) {
                            lines.push(subsection.toUpperCase());
                            subtitles.push(subsection);
                        }
                        if (year) lines.push(`Año: ${year}`);
                        if (titulo) lines.push(`Título: ${titulo}`);
                        if (revista) lines.push(`Revista/Editorial: ${revista}`);
                        if (detalles) lines.push(`Detalles: ${detalles}`);
                        
                        if (fileUrl && linkName) {
                            lines.push(`Enlace externo: ${linkName}`);
                            lines.push(`URL: ${fileUrl}`);
                        } else if (fileUrl) {
                            lines.push(`Enlace externo: ${fileUrl}`);
                        }
                        
                        lines.push('');
                    });
                    break;

                case 'experience':
                    const itemsExperiencia = Array.from(block.querySelectorAll('.item'));
                    itemsExperiencia.forEach((item, index) => {
                        const descripcion = clean(item.querySelector('.item-field')?.textContent);
                        if (descripcion) {
                            lines.push(`Experiencia ${index + 1}: ${descripcion}`);
                            lines.push('');
                        }
                    });
                    break;

                // === CORRECCIÓN: CASO PARA HABILIDADES ===
                case 'skills':
                    const itemsHabilidades = Array.from(block.querySelectorAll('.skill-item'));
                    itemsHabilidades.forEach(item => {
                        const nombreHabilidad = item.querySelector('.skill-name')?.value || '';
                        const nivelHabilidad = item.querySelector('.skill-level')?.value || '';
                        
                        if (nombreHabilidad && nivelHabilidad) {
                            lines.push(`${nombreHabilidad}: ${nivelHabilidad}`);
                            subtitles.push(nombreHabilidad);
                        }
                    });
                    break;

                default:
                    const contenido = block.querySelector('.block-content')?.textContent;
                    if (contenido) {
                        contenido.split('\n')
                            .map(line => clean(line))
                            .filter(line => line)
                            .forEach(line => lines.push(line));
                    }
                    break;
            }

            structured.push({
                blockElement: block,
                title: tituloBloque || getDefaultTitle(blockType),
                lines: lines.filter(line => line !== ''),
                subtitles: subtitles.filter(sub => sub !== '')
            });
        });

        return structured;
    };

    // === EXPORTACIÓN PDF MEJORADA ===
    const exportPDF = () => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const margin = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const contentWidth = pageWidth - (margin * 2);

            const styles = {
                title: { size: 16, style: 'bold', family: 'times' },
                section: { size: 12, style: 'bold', family: 'times' },
                subsection: { size: 11, style: 'bolditalic', family: 'times' },
                normal: { size: 10, style: 'normal', family: 'times' },
                small: { size: 9, style: 'normal', family: 'times' },
                url: { size: 9, style: 'normal', family: 'times', color: [0, 100, 200] }
            };

            let currentY = margin;
            let pageNumber = 1;

            const addNewPage = () => {
                doc.addPage();
                currentY = margin;
                pageNumber++;
                addPageHeader();
            };

            const checkSpace = (neededHeight) => {
                if (currentY + neededHeight > pageHeight - margin) {
                    addNewPage();
                    return true;
                }
                return false;
            };

            const addPageHeader = () => {
                doc.setFontSize(8);
                doc.setFont('times', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(`Página ${pageNumber}`, pageWidth - margin, 15);
                doc.text('Curriculum Vitae', margin, 15);
                doc.setTextColor(0, 0, 0);
            };

            const addText = (text, style = 'normal', options = {}) => {
                const config = { ...styles[style], ...options };
                doc.setFont(config.family, config.style);
                doc.setFontSize(config.size);
                
                if (config.color) {
                    doc.setTextColor(config.color[0], config.color[1], config.color[2]);
                }

                const lines = doc.splitTextToSize(text, contentWidth);
                const lineHeight = config.size * 0.3528 * 1.4;

                checkSpace(lineHeight * lines.length);

                lines.forEach(line => {
                    if (currentY + lineHeight > pageHeight - margin) {
                        addNewPage();
                    }
                    
                    const align = options.align || 'left';
                    const x = align === 'center' ? pageWidth / 2 : 
                              align === 'right' ? pageWidth - margin : margin;
                    
                    doc.text(line, x, currentY, { align });
                    currentY += lineHeight;
                });

                doc.setTextColor(0, 0, 0);
                return lines.length * lineHeight;
            };

            // PORTADA
            doc.setFillColor(10, 59, 104);
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            doc.setFontSize(20);
            doc.setFont('times', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('CURRICULUM VITAE', pageWidth / 2, 25, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text('UNIVERSIDAD AUTÓNOMA DEL ESTADO DE MÉXICO', pageWidth / 2, 32, { align: 'center' });
            
            doc.setTextColor(0, 0, 0);
            currentY = 60;

            const sections = collectStructuredSections();

            // ÍNDICE
            addText('ÍNDICE', 'title', { align: 'center' });
            currentY += 10;

            const sectionPages = [];
            let currentPage = 2;

            sections.forEach(section => {
                const sectionLines = [section.title.toUpperCase(), ''];
                section.lines.forEach(line => sectionLines.push(line));
                
                const totalLines = sectionLines.reduce((acc, line) => {
                    if (line === '') return acc + 1;
                    const lines = doc.splitTextToSize(line, contentWidth);
                    return acc + lines.length;
                }, 0);
                
                const linesPerPage = Math.floor((pageHeight - margin * 2) / (10 * 0.3528 * 1.4));
                const pagesNeeded = Math.max(1, Math.ceil(totalLines / linesPerPage));
                
                sectionPages.push({
                    title: section.title,
                    startPage: currentPage,
                    pages: pagesNeeded,
                    subtitles: section.subtitles
                });
                
                currentPage += pagesNeeded;
            });

            sectionPages.forEach(section => {
                addText(section.title.toUpperCase(), 'section');
                addText(`..................................................................... ${section.startPage}`, 'normal', { align: 'right' });
                currentY += 3;
                
                if (section.subtitles && section.subtitles.length > 0) {
                    section.subtitles.forEach((subtitle, index) => {
                        if (index < 3) {
                            const subText = `   ${subtitle}`;
                            addText(subText, 'small', { x: margin + 10 });
                            currentY += 2;
                        }
                    });
                    if (section.subtitles.length > 3) {
                        addText(`   ... y ${section.subtitles.length - 3} más`, 'small', { x: margin + 10 });
                        currentY += 2;
                    }
                }
                
                currentY += 5;
            });

            // CONTENIDO PRINCIPAL
            addNewPage();

            sections.forEach((section, sectionIndex) => {
                addText(section.title.toUpperCase(), 'section');
                currentY += 5;

                if (section.lines && section.lines.length > 0) {
                    section.lines.forEach(line => {
                        if (line.trim() === '') {
                            currentY += 5;
                        } else {
                            if (line.includes('http://') || line.includes('https://') || line.includes('URL:')) {
                                addText(line, 'url');
                            } 
                            else if (line.toUpperCase() === line && line.length < 50 && !line.includes(':')) {
                                addText(line, 'subsection');
                            } else if (line.match(/^\d+\.\s/)) {
                                addText(line, 'normal');
                            } else if (line.includes(':') && !line.match(/[a-z]:/)) {
                                const [label, value] = line.split(':');
                                addText(label + ':', 'subsection');
                                if (value) {
                                    addText(value.trim(), 'normal', { 
                                        x: margin + 30,
                                        align: 'left'
                                    });
                                }
                            } else {
                                addText(line, 'normal');
                            }
                        }
                    });
                }

                currentY += 10;
                
                if (sectionIndex < sections.length - 1) {
                    checkSpace(50);
                }
            });

            // PIE DE PÁGINA
            currentY = pageHeight - 20;
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 5;
            
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generado el ${new Date().toLocaleDateString()} - Universidad Autónoma del Estado de México`, 
                    pageWidth / 2, currentY, { align: 'center' });

            doc.save('Curriculum_Vitae_Profesional.pdf');
            alert('PDF profesional exportado exitosamente con formato de texto real e índice completo.');

        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert('Error al exportar PDF: ' + (error.message || error));
        }
    };

    // === FUNCIONES DE DATOS ===
    const getCvData = () => {
        const data = [];
        cvContainer.querySelectorAll('.cv-block').forEach(block => {
            const type = block.dataset.blockType;
            let blockData = { type };
            
            const titleEl = block.querySelector('.block-title');
            if (titleEl) blockData.title = titleEl.innerHTML;
            
            if (type === 'personal') {
                const photoSrc = block.querySelector('.profile-photo').src;
                if (photoSrc && photoSrc.startsWith('data:image')) {
                    blockData.photo = photoSrc;
                }
            }
            
            if (['education', 'languages', 'diplomas', 'experience', 'courses', 'academic-production', 'skills'].includes(type)) {
                blockData.items = Array.from(block.querySelectorAll('.item')).map(item => {
                    const itemData = {};
                    
                    if (item.querySelector('.item-year')) 
                        itemData.year = item.querySelector('.item-year').innerHTML;
                    
                    if (item.querySelector('.item-title'))
                        itemData.level = item.querySelector('.item-title').innerHTML;
                    
                    if (item.querySelector('.item-subsection'))
                        itemData.subsection = item.querySelector('.item-subsection').innerHTML;
                    
                    item.querySelectorAll('.item-field').forEach(field => {
                        const fieldName = field.dataset.field || 'content';
                        itemData[fieldName] = field.innerHTML;
                    });
                    
                    // === CORRECCIÓN: MANEJAR DATOS DE HABILIDADES ===
                    if (type === 'skills') {
                        itemData.name = item.querySelector('.skill-name')?.value || '';
                        itemData.level = item.querySelector('.skill-level')?.value || '';
                    }
                    
                    if (type === 'courses' || type === 'diplomas' || type === 'academic-production') {
                        itemData.fileData = item.dataset.fileData || '';
                        itemData.fileName = item.dataset.fileName || '';
                        itemData.filePath = item.dataset.filePath || '';
                        itemData.fileUrl = item.dataset.fileUrl || '';
                        itemData.linkName = item.dataset.linkName || '';
                    }
                    
                    return itemData;
                });
            }
            
            data.push(blockData);
        });
        
        console.log('Datos completos guardados:', data);
        return data;
    };

    const saveCV = () => {
        const data = getCvData();
        localStorage.setItem('cvData', JSON.stringify(data));
        console.log('CV Guardado Localmente!');
    };

    const loadCV = async (data) => {
        if (!data) return;
        cvContainer.innerHTML = '';
        for (const blockData of data) {
            await addBlock(blockData.type, blockData);
        }
        // Reorganizar después de cargar
        reorganizeBlocks();
    };

    // === NUEVA FUNCIÓN: CARGAR DATOS ADICIONALES CON FUSIÓN INTELIGENTE ===
    const loadAdditionalData = async (data) => {
        if (!data || !Array.isArray(data)) return;
        
        let addedCount = 0;
        let mergedCount = 0;
        
        for (const blockData of data) {
            // Verificar si ya existe un bloque del mismo tipo
            const existingBlocks = Array.from(cvContainer.querySelectorAll(`.cv-block[data-block-type="${blockData.type}"]`));
            
            if (existingBlocks.length > 0) {
                // Si existe, fusionar los items con el bloque existente
                const existingBlock = existingBlocks[0];
                const itemList = existingBlock.querySelector('.item-list');
                
                if (itemList && blockData.items) {
                    for (const itemData of blockData.items) {
                        let processedItemData = { ...itemData };
                        
                        // Cargar PDFs si es necesario
                        if ((blockData.type === 'courses' || blockData.type === 'diplomas' || blockData.type === 'academic-production') && itemData.filePath && !itemData.fileData) {
                            const pdfData = await loadPDFFromServer(itemData.filePath, itemData.fileName);
                            if (pdfData) {
                                processedItemData.fileData = pdfData.fileData;
                                processedItemData.fileName = pdfData.fileName;
                            }
                        }
                        
                        itemList.insertAdjacentHTML('beforeend', createItemHTML(blockData.type, processedItemData));
                        
                        const newItem = itemList.lastElementChild;
                        if (blockData.type === 'courses' || blockData.type === 'diplomas' || blockData.type === 'academic-production') {
                            if (processedItemData.fileData) {
                                newItem.dataset.fileData = processedItemData.fileData;
                            }
                            if (processedItemData.fileName) {
                                newItem.dataset.fileName = processedItemData.fileName;
                            }
                            if (processedItemData.filePath) {
                                newItem.dataset.filePath = processedItemData.filePath;
                            }
                            if (processedItemData.fileUrl) {
                                newItem.dataset.fileUrl = processedItemData.fileUrl;
                            }
                            if (processedItemData.linkName) {
                                newItem.dataset.linkName = processedItemData.linkName;
                            }
                        }
                        
                        setupItemEventListeners(newItem);
                        mergedCount++;
                    }
                }
            } else {
                // Si no existe, crear un nuevo bloque
                await addBlock(blockData.type, blockData);
                addedCount++;
            }
        }
        
        // Reorganizar todos los bloques después de la fusión
        reorganizeBlocks();
        
        saveCV();
        return { added: addedCount, merged: mergedCount };
    };

    // === EXPORTACIÓN E IMPORTACIÓN ===
    const exportData = async () => {
        try {
            const data = getCvData();
            const zip = new JSZip();
            const pdfFolder = zip.folder("pdfs");

            let fileIndex = 1;
            const fileMap = new Map();

            for (const block of data) {
                if ((block.type === "courses" || block.type === "diplomas" || block.type === "academic-production") && block.items) {
                    for (const item of block.items) {
                        if (item.fileData && item.fileName && !item.fileUrl) {
                            const fileKey = item.fileData.substring(0, 100);
                            
                            if (!fileMap.has(fileKey)) {
                                const safeName = `documento_${fileIndex}.pdf`;
                                try {
                                    const uint8Array = dataURLtoUint8Array(item.fileData);
                                    pdfFolder.file(safeName, uint8Array, {binary: true});
                                    fileMap.set(fileKey, safeName);
                                    item.filePath = `pdfs/${safeName}`;
                                    fileIndex++;
                                } catch (e) {
                                    console.warn("No se pudo añadir el archivo al zip", e);
                                }
                            } else {
                                item.filePath = `pdfs/${fileMap.get(fileKey)}`;
                            }
                        }
                        
                        if (item.fileUrl) {
                            if (item.fileData) {
                                delete item.fileData;
                            }
                            if (item.filePath) {
                                delete item.filePath;
                            }
                        } else {
                            delete item.fileData;
                        }
                    }
                }
            }

            zip.file("cv-data.json", JSON.stringify(data, null, 2));

            const blob = await zip.generateAsync({ type: "blob" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "curriculum-completo.zip";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(a.href);

            alert("Datos exportados con archivos PDF y enlaces");
        } catch (error) {
            console.error("Error al exportar datos:", error);
            alert("Error al exportar datos: " + error.message);
        }
    };

    const importHybridZip = async (file) => {
        try {
            const buffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(buffer);
            const dataFile = zip.file("cv-data.json");
            
            if (!dataFile) { 
                alert("El ZIP no contiene cv-data.json"); 
                return; 
            }
            
            const dataText = await dataFile.async("string");
            const data = JSON.parse(dataText);

            const pdfLoadPromises = [];
            
            for (const block of data) {
                if ((block.type === "courses" || block.type === "diplomas" || block.type === "academic-production") && block.items) {
                    for (const item of block.items) {
                        if (item.filePath && !item.fileUrl) {
                            const pdfFileName = item.filePath.split('/').pop();
                            const pdfEntry = zip.file(`pdfs/${pdfFileName}`);
                            
                            if (pdfEntry) {
                                const loadPromise = (async () => {
                                    try {
                                        const uint8Array = await pdfEntry.async("uint8array");
                                        const blob = new Blob([uint8Array], { type: 'application/pdf' });
                                        const reader = new FileReader();
                                        
                                        return new Promise((resolve) => {
                                            reader.onload = function(e) {
                                                item.fileData = e.target.result;
                                                item.fileName = pdfFileName;
                                                resolve();
                                            };
                                            reader.readAsDataURL(blob);
                                        });
                                    } catch (e) {
                                        console.warn("No se pudo cargar el PDF:", pdfFileName, e);
                                    }
                                })();
                                pdfLoadPromises.push(loadPromise);
                            }
                        }
                    }
                }
            }

            await Promise.all(pdfLoadPromises);

            cvContainer.innerHTML = '';
            for (const blockData of data) {
                await addBlock(blockData.type, blockData);
            }
            
            // Reorganizar después de importar
            reorganizeBlocks();
            
            alert("ZIP importado correctamente con archivos PDF y enlaces");

        } catch (err) {
            console.error("Error al importar ZIP:", err);
            alert("Error al importar ZIP: " + err.message);
        }
    };

    const dataURLtoUint8Array = (dataURL) => {
        const base64 = dataURL.split(',')[1] || '';
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    };

    // === FUNCIÓN PARA MANEJAR RESPONSIVE ===
    const handleResponsive = () => {
        const sidebar = document.querySelector('.sidebar');
        const cvEditor = document.querySelector('.cv-editor');
        
        if (window.innerWidth <= 1024) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
        
        if (cvEditor) {
            const sidebarHeight = sidebar?.offsetHeight || 0;
            if (window.innerWidth <= 1024) {
                cvEditor.style.minHeight = `calc(100vh - ${sidebarHeight}px)`;
            } else {
                cvEditor.style.minHeight = '100vh';
            }
        }
    };

    // === DEBUG ===
    const debugLinks = () => {
        console.log('=== DEBUG ENLACES ===');
        const blocks = Array.from(cvContainer.querySelectorAll('.cv-block'));
        
        blocks.forEach(block => {
            const blockType = block.dataset.blockType;
            const items = Array.from(block.querySelectorAll('.item'));
            
            items.forEach((item, index) => {
                const fileUrl = item.dataset.fileUrl;
                const linkName = item.dataset.linkName;
                
                if (fileUrl) {
                    console.log(`Bloque: ${blockType}, Item ${index + 1}:`, {
                        linkName: linkName,
                        fileUrl: fileUrl
                    });
                }
            });
        });
    };

    const exportPDFWithDebug = () => {
        debugLinks();
        exportPDF();
    };

    // === EVENT LISTENERS PRINCIPALES ===
    document.querySelectorAll('.add-block-btn').forEach(button => {
        button.addEventListener('click', () => {
            const t = button.dataset.blockType;
            addBlock(t);
        });
    });

    // === CONFIGURAR EVENT LISTENERS PARA TODOS LOS BOTONES ===
    
    // Botón Exportar PDF
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportPDFWithDebug);
    } else {
        console.error('Botón exportPdfBtn no encontrado');
    }

    // Botón Exportar para Compartir
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    } else {
        console.error('Botón exportDataBtn no encontrado');
    }

    // Botón Importar Datos
    if (importDataBtn) {
        importDataBtn.addEventListener('click', () => importFileInput.click());
    } else {
        console.error('Botón importDataBtn no encontrado');
    }

    // === NUEVO: BOTÓN VACIAR TODO ===
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllData);
    } else {
        console.error('Botón clearAllBtn no encontrado');
    }

    // Botón Añadir Datos desde JSON
    if (importAdditionalBtn) {
        importAdditionalBtn.addEventListener('click', () => {
            importAdditionalInput.click();
        });
    }

    // Input para importar datos adicionales
    importAdditionalInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.name.toLowerCase().endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const result = await loadAdditionalData(data);
                    alert(`Datos adicionales importados correctamente.

Bloques nuevos: ${result.added}
Items fusionados: ${result.merged}`);
                } catch (err) {
                    alert('Error al importar JSON adicional: ' + err.message);
                }
            };
            reader.readAsText(file);
        } else if (file.name.toLowerCase().endsWith('.zip')) {
            try {
                const buffer = await file.arrayBuffer();
                const zip = await JSZip.loadAsync(buffer);

                const dataFile = zip.file("cv-data.json");
                if (!dataFile) {
                    alert("El ZIP no contiene cv-data.json");
                    return;
                }

                const dataText = await dataFile.async("string");
                const data = JSON.parse(dataText);
                const result = await loadAdditionalData(data);

                alert(`ZIP adicional importado correctamente.

Bloques nuevos: ${result.added}
Items fusionados: ${result.merged}`);
            } catch (err) {
                alert("Error al importar ZIP adicional: " + err.message);
            }
        } else {
            alert("Formato no soportado. Usa .json o .zip");
        }

        event.target.value = '';
    });

    // Input para importar archivo principal
    importFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.name.endsWith('.zip')) {
            await importHybridZip(file);
        } else if (file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    loadCV(data);
                    alert('JSON importado correctamente (reemplazó todo el contenido)');
                } catch (err) {
                    alert('Error al importar JSON: ' + err.message);
                }
            };
            reader.readAsText(file);
        } else {
            alert('Formato no soportado. Use .json o .zip');
        }
        
        event.target.value = '';
    });

    // Event listeners para responsive
    window.addEventListener('resize', handleResponsive);
    window.addEventListener('load', handleResponsive);

    // Formateo automático de fechas
    cvContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('date-field')) {
            const formatted = formatDateInput(e.target.textContent);
            if (formatted !== e.target.textContent) {
                e.target.textContent = formatted;
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(e.target);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    });

    // === CORRECCIÓN: NO CARGAR DATOS AL INICIAR - INICIAR COMPLETAMENTE VACÍO ===
    window.addEventListener('load', () => {
        console.log('=== INICIANDO APLICACIÓN CON ESTADO VACÍO ===');
        
        // Limpiar cualquier contenido que pueda existir
        cvContainer.innerHTML = '';
        
        // Verificar que los botones estén configurados
        console.log('Botones configurados:', {
            exportPdfBtn: !!exportPdfBtn,
            exportDataBtn: !!exportDataBtn,
            importDataBtn: !!importDataBtn,
            clearAllBtn: !!clearAllBtn,
            importAdditionalBtn: !!importAdditionalBtn
        });
        
        // Mostrar mensaje de estado vacío
        console.log('Aplicación iniciada correctamente - Estado vacío');
    });

    // Inicializar responsive
    handleResponsive();

});
// Avila González Luis Arturo - Lógica de Exportación PDF
// Ramírez García Maria Guadalupe - Funcionalidades Avanzadas
