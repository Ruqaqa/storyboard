// Storyboard Application - Main JavaScript

// State Management
const state = {
  parts: [],
  editMode: false,
  currentEditId: null,
  authenticated: false
};

// DOM Elements
const elements = {
  partsContainer: document.getElementById('parts-container'),
  emptyState: document.getElementById('empty-state'),
  modeToggle: document.getElementById('mode-toggle'),
  addPartBtn: document.getElementById('add-part-btn'),
  emptyAddBtn: document.getElementById('empty-add-btn'),
  modal: document.getElementById('part-modal'),
  modalTitle: document.getElementById('modal-title'),
  partForm: document.getElementById('part-form'),
  partId: document.getElementById('part-id'),
  partTitle: document.getElementById('part-title'),
  partImage: document.getElementById('part-image'),
  partImagePath: document.getElementById('part-image-path'),
  partMovement: document.getElementById('part-movement'),
  partContent: document.getElementById('part-content'),
  imageUploadBtn: document.getElementById('image-upload-btn'),
  imagePreview: document.getElementById('image-preview'),
  removeImageBtn: document.getElementById('remove-image-btn'),
  cancelBtn: document.getElementById('cancel-btn'),
  modalClose: document.querySelector('#part-modal .modal-close'),
  iconView: document.querySelector('.icon-view'),
  iconEdit: document.querySelector('.icon-edit')
};

// API Functions
const api = {
  async checkAuth() {
    const response = await fetch('/api/auth/status', {
      credentials: 'include'
    });
    if (!response.ok) return { authenticated: false };
    return response.json();
  },

  async login(username, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  async logout() {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
  },

  async getParts() {
    const response = await fetch('/api/parts', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch parts');
    return response.json();
  },

  async createPart(data) {
    const response = await fetch('/api/parts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('AUTH_REQUIRED');
      throw new Error('Failed to create part');
    }
    return response.json();
  },

  async updatePart(id, data) {
    const response = await fetch(`/api/parts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('AUTH_REQUIRED');
      throw new Error('Failed to update part');
    }
    return response.json();
  },

  async deletePart(id) {
    const response = await fetch(`/api/parts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('AUTH_REQUIRED');
      throw new Error('Failed to delete part');
    }
    return response.json();
  },

  async reorderParts(parts) {
    const response = await fetch('/api/parts/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ parts })
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('AUTH_REQUIRED');
      throw new Error('Failed to reorder parts');
    }
    return response.json();
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('AUTH_REQUIRED');
      throw new Error('Failed to upload image');
    }
    return response.json();
  }
};

// Render Functions
function renderParts() {
  if (state.parts.length === 0) {
    elements.partsContainer.style.display = 'none';
    elements.emptyState.style.display = 'flex';
    return;
  }

  elements.partsContainer.style.display = 'block';
  elements.emptyState.style.display = 'none';
  
  elements.partsContainer.innerHTML = state.parts.map((part, index) => `
    <section class="part-section ${state.editMode ? 'edit-mode' : ''}" data-part-id="${part.id}">
      <div class="part-content">
        <h1 class="part-title">${escapeHtml(part.title)}</h1>
        
        ${part.image_path ? `
          <img src="${escapeHtml(part.image_path)}" alt="${escapeHtml(part.title)}" class="part-image">
        ` : ''}
        
        ${part.movement_description ? `
          <div class="part-movement">${escapeHtml(part.movement_description)}</div>
        ` : ''}
        
        <div class="part-text">${escapeHtml(part.content)}</div>
        
        <div class="part-controls">
          <button class="btn-move" onclick="movePart(${part.id}, -1)" ${index === 0 ? 'disabled' : ''} aria-label="Move up">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          
          <button class="btn-move" onclick="movePart(${part.id}, 1)" ${index === state.parts.length - 1 ? 'disabled' : ''} aria-label="Move down">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <button class="btn-edit" onclick="editPart(${part.id})">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            تعديل
          </button>
          
          <button class="btn-delete" onclick="deletePart(${part.id})">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            حذف
          </button>
        </div>
      </div>
    </section>
  `).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Mode Toggle
async function toggleEditMode() {
  // If trying to enter edit mode, check authentication first
  if (!state.editMode && !state.authenticated) {
    showLoginModal();
    return;
  }
  
  state.editMode = !state.editMode;
  
  if (state.editMode) {
    elements.modeToggle.classList.add('edit-mode');
    elements.iconView.style.display = 'block';
    elements.iconEdit.style.display = 'none';
    elements.addPartBtn.style.display = 'flex';
    elements.modeToggle.setAttribute('aria-label', 'Exit edit mode');
  } else {
    elements.modeToggle.classList.remove('edit-mode');
    elements.iconView.style.display = 'none';
    elements.iconEdit.style.display = 'block';
    elements.addPartBtn.style.display = 'none';
    elements.modeToggle.setAttribute('aria-label', 'Enter edit mode');
  }
  
  renderParts();
}

// Modal Functions
function openModal(title = 'إضافة جزء جديد') {
  elements.modalTitle.textContent = title;
  elements.modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Focus first input
  setTimeout(() => elements.partTitle.focus(), 100);
}

function closeModal() {
  elements.modal.style.display = 'none';
  document.body.style.overflow = '';
  resetForm();
}

function resetForm() {
  elements.partForm.reset();
  elements.partId.value = '';
  elements.partImagePath.value = '';
  elements.imagePreview.style.display = 'none';
  elements.imagePreview.querySelector('img').src = '';
  state.currentEditId = null;
}

// Image Upload Handling
elements.imageUploadBtn.addEventListener('click', () => {
  elements.partImage.click();
});

elements.partImage.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.imagePreview.querySelector('img').src = e.target.result;
      elements.imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    const result = await api.uploadImage(file);
    elements.partImagePath.value = result.path;
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('فشل رفع الصورة. الرجاء المحاولة مرة أخرى.');
    elements.imagePreview.style.display = 'none';
  }
});

elements.removeImageBtn.addEventListener('click', () => {
  elements.partImage.value = '';
  elements.partImagePath.value = '';
  elements.imagePreview.style.display = 'none';
  elements.imagePreview.querySelector('img').src = '';
});

// Drag and Drop functionality
const imageUploadContainer = document.querySelector('.image-upload-container');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  imageUploadContainer.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
  imageUploadContainer.addEventListener(eventName, () => {
    elements.imageUploadBtn.classList.add('drag-over');
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  imageUploadContainer.addEventListener(eventName, () => {
    elements.imageUploadBtn.classList.remove('drag-over');
  }, false);
});

// Handle dropped files
imageUploadContainer.addEventListener('drop', handleDrop, false);

async function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length === 0) return;
  
  const file = files[0];
  
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    alert('الرجاء رفع ملف صورة فقط');
    return;
  }
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    alert('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
    return;
  }
  
  try {
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.imagePreview.querySelector('img').src = e.target.result;
      elements.imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    const result = await api.uploadImage(file);
    elements.partImagePath.value = result.path;
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error.message === 'AUTH_REQUIRED') {
      handleAuthError();
    } else {
      alert('فشل رفع الصورة. الرجاء المحاولة مرة أخرى.');
    }
    elements.imagePreview.style.display = 'none';
  }
}

// Form Submission
elements.partForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    title: elements.partTitle.value.trim(),
    image_path: elements.partImagePath.value,
    movement_description: elements.partMovement.value.trim(),
    content: elements.partContent.value.trim()
  };
  
  try {
    if (state.currentEditId) {
      await api.updatePart(state.currentEditId, data);
    } else {
      await api.createPart(data);
    }
    
    await loadParts();
    closeModal();
  } catch (error) {
    console.error('Error saving part:', error);
    if (error.message === 'AUTH_REQUIRED') {
      closeModal();
      handleAuthError();
    } else {
      alert('فشل حفظ الجزء. الرجاء المحاولة مرة أخرى.');
    }
  }
});

// Authentication Functions
function showLoginModal() {
  const loginModal = document.getElementById('login-modal');
  loginModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('login-username').focus();
}

function closeLoginModal() {
  const loginModal = document.getElementById('login-modal');
  loginModal.style.display = 'none';
  document.body.style.overflow = '';
  document.getElementById('login-form').reset();
  document.getElementById('login-error').style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  const loginButton = document.querySelector('#login-form button[type="submit"]');
  
  try {
    loginButton.disabled = true;
    loginButton.textContent = 'جاري تسجيل الدخول...';
    
    await api.login(username, password);
    state.authenticated = true;
    
    closeLoginModal();
    toggleEditMode();
  } catch (error) {
    errorElement.textContent = error.message === 'Invalid credentials' 
      ? 'اسم المستخدم أو كلمة المرور غير صحيحة' 
      : 'فشل تسجيل الدخول';
    errorElement.style.display = 'block';
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'تسجيل الدخول';
  }
}

async function handleLogout() {
  if (!confirm('هل تريد تسجيل الخروج؟')) {
    return;
  }
  
  try {
    await api.logout();
    state.authenticated = false;
    state.editMode = false;
    
    // Update UI
    elements.modeToggle.classList.remove('edit-mode');
    elements.iconView.style.display = 'none';
    elements.iconEdit.style.display = 'block';
    elements.addPartBtn.style.display = 'none';
    
    // Hide logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';
    
    renderParts();
    alert('تم تسجيل الخروج بنجاح');
  } catch (error) {
    console.error('Logout error:', error);
    alert('فشل تسجيل الخروج');
  }
}

function handleAuthError() {
  state.authenticated = false;
  state.editMode = false;
  
  // Reset UI
  elements.modeToggle.classList.remove('edit-mode');
  elements.iconView.style.display = 'none';
  elements.iconEdit.style.display = 'block';
  elements.addPartBtn.style.display = 'none';
  
  renderParts();
  alert('انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى.');
  showLoginModal();
}

// CRUD Operations
async function editPart(id) {
  const part = state.parts.find(p => p.id === id);
  if (!part) return;
  
  state.currentEditId = id;
  elements.partId.value = id;
  elements.partTitle.value = part.title;
  elements.partImagePath.value = part.image_path || '';
  elements.partMovement.value = part.movement_description || '';
  elements.partContent.value = part.content;
  
  if (part.image_path) {
    elements.imagePreview.querySelector('img').src = part.image_path;
    elements.imagePreview.style.display = 'block';
  }
  
  openModal('تعديل الجزء');
}

async function deletePart(id) {
  const part = state.parts.find(p => p.id === id);
  if (!part) return;
  
  if (!confirm(`هل أنت متأكد من حذف "${part.title}"؟`)) {
    return;
  }
  
  try {
    await api.deletePart(id);
    await loadParts();
  } catch (error) {
    console.error('Error deleting part:', error);
    if (error.message === 'AUTH_REQUIRED') {
      handleAuthError();
    } else {
      alert('فشل حذف الجزء. الرجاء المحاولة مرة أخرى.');
    }
  }
}

async function movePart(id, direction) {
  const currentIndex = state.parts.findIndex(p => p.id === id);
  if (currentIndex === -1) return;
  
  const newIndex = currentIndex + direction;
  if (newIndex < 0 || newIndex >= state.parts.length) return;
  
  // Swap parts
  const newParts = [...state.parts];
  [newParts[currentIndex], newParts[newIndex]] = [newParts[newIndex], newParts[currentIndex]];
  
  // Update order_index for all parts
  const reorderedParts = newParts.map((part, index) => ({
    id: part.id,
    order_index: index + 1
  }));
  
  try {
    await api.reorderParts(reorderedParts);
    await loadParts();
    
    // Scroll to the moved part
    setTimeout(() => {
      const partElement = document.querySelector(`[data-part-id="${id}"]`);
      if (partElement) {
        partElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  } catch (error) {
    console.error('Error reordering parts:', error);
    if (error.message === 'AUTH_REQUIRED') {
      handleAuthError();
    } else {
      alert('فشل إعادة ترتيب الأجزاء. الرجاء المحاولة مرة أخرى.');
    }
  }
}

// Load Parts
async function loadParts() {
  try {
    state.parts = await api.getParts();
    renderParts();
  } catch (error) {
    console.error('Error loading parts:', error);
    alert('فشل تحميل الأجزاء. الرجاء تحديث الصفحة.');
  }
}

// Event Listeners
elements.modeToggle.addEventListener('click', toggleEditMode);
elements.addPartBtn.addEventListener('click', () => openModal());
elements.emptyAddBtn.addEventListener('click', () => {
  if (!state.editMode) {
    toggleEditMode();
  }
  openModal();
});

elements.cancelBtn.addEventListener('click', closeModal);
elements.modalClose.addEventListener('click', closeModal);

// Close modal on outside click
elements.modal.addEventListener('click', (e) => {
  if (e.target === elements.modal) {
    closeModal();
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  // Escape key to close modal
  if (e.key === 'Escape' && elements.modal.style.display === 'flex') {
    closeModal();
  }
  
  // Arrow keys for navigation in view mode
  if (!state.editMode && elements.modal.style.display !== 'flex') {
    const currentScroll = elements.partsContainer.scrollTop;
    const windowHeight = window.innerHeight;
    
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      elements.partsContainer.scrollBy({ top: windowHeight, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      elements.partsContainer.scrollBy({ top: -windowHeight, behavior: 'smooth' });
    }
  }
});

// Make functions global for onclick handlers
window.editPart = editPart;
window.deletePart = deletePart;
window.movePart = movePart;

// Initialize
async function init() {
  try {
    // Check authentication status
    const authStatus = await api.checkAuth();
    state.authenticated = authStatus.authenticated;
    
    // Show logout button if authenticated
    if (state.authenticated) {
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) logoutBtn.style.display = 'flex';
    }
    
    // Load parts
    await loadParts();
  } catch (error) {
    console.error('Initialization error:', error);
    await loadParts(); // Try to load parts anyway
  }
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.querySelector('#login-modal .modal-close').addEventListener('click', closeLoginModal);
document.getElementById('login-cancel').addEventListener('click', closeLoginModal);

// Logout button handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', handleLogout);
}

// Close login modal on outside click
document.getElementById('login-modal').addEventListener('click', (e) => {
  if (e.target.id === 'login-modal') {
    closeLoginModal();
  }
});

init();

