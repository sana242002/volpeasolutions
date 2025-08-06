const API_URL = 'https://reqres.in/api/users';
const API_KEY = 'reqres-free-v1';
let currentPage = 1;
let totalPages = 1;
let isEdit = false;
let userIdToDelete = null;

const loader = document.getElementById('loader');
const pageNumber = document.getElementById('pageNumber');
const tableBody = document.querySelector('#userTable tbody');
const addUserBtn = document.getElementById('addUserBtn');
const form = document.getElementById('userForm');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeForm = document.querySelector('#userForm .close');
const editModal = document.getElementById('editModal');
const editUserForm = document.getElementById('editUserForm');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const closeEditModal = document.querySelector('#editModal .close');
const successModal = document.getElementById('successModal');
const successMessage = document.getElementById('successMessage');
const successOkBtn = document.getElementById('successOkBtn');
const closeSuccessModal = document.querySelector('#successModal .close');
const confirmDeleteModal = document.getElementById('confirmDeleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const closeConfirmDeleteModal = document.querySelector('#confirmDeleteModal .close');

function generatePhoneNumber(id) {
  const baseNumber = 90000000 + (id * 12345) % 10000000;
  return `+92 ${baseNumber.toString().slice(0, 3)} ${baseNumber.toString().slice(3, 6)} ${baseNumber.toString().slice(6)}`;
}

function showSuccessModal(message) {
  successMessage.textContent = message;
  successModal.classList.remove('hidden');
}

function hideSuccessModal() {
  successModal.classList.add('hidden');
  successMessage.textContent = '';
}

function showConfirmDeleteModal(id) {
  userIdToDelete = id;
  confirmDeleteModal.classList.remove('hidden');
}

function hideConfirmDeleteModal() {
  confirmDeleteModal.classList.add('hidden');
  userIdToDelete = null;
}

successOkBtn.onclick = hideSuccessModal;
closeSuccessModal.onclick = hideSuccessModal;

cancelDeleteBtn.onclick = hideConfirmDeleteModal;
closeConfirmDeleteModal.onclick = hideConfirmDeleteModal;

confirmDeleteBtn.onclick = () => {
  if (userIdToDelete === null) return;
  loader.style.display = 'block';
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const userExists = users.find(u => u.id === userIdToDelete);
  if (!userExists) {
    errorMessage.textContent = `Error: User not found (ID: ${userIdToDelete}). Please refresh the page.`;
    loader.style.display = 'none';
    hideConfirmDeleteModal();
    return;
  }
  fetch(`${API_URL}/${userIdToDelete}`, {
    method: 'DELETE',
    headers: {
      'x-api-key': API_KEY
    }
  })
    .then(res => {
      console.log('Delete Response Status:', res.status, res.statusText);
      if (res.status === 204) {
        users = users.filter(u => u.id !== userIdToDelete);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers(users);
        showSuccessModal('User deleted!');
      } else {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
    })
    .catch(err => {
      console.error('Delete Error:', err.message);
      errorMessage.textContent = `Error deleting user: ${err.message}`;
    })
    .finally(() => {
      loader.style.display = 'none';
      hideConfirmDeleteModal();
    });
};

function fetchUsers(page = 1) {
  loader.style.display = 'block';
  errorMessage.textContent = '';
  console.log('Fetching users from:', `${API_URL}?page=${page}`);
  fetch(`${API_URL}?page=${page}`, {
    headers: {
      'x-api-key': API_KEY
    }
  })
    .then(res => {
      console.log('Response Status:', res.status, res.statusText);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      console.log('API Response:', data);
      const users = data.data.map(user => ({
        ...user,
        status: user.status || 'active',
        loggedIn: user.loggedIn || false,
        job: user.job || 'Developer',
        phone: user.phone || generatePhoneNumber(user.id)
      }));
      localStorage.setItem('users', JSON.stringify(users));
      totalPages = data.total_pages;
      renderUsers(users);
      pageNumber.textContent = `Page ${data.page} of ${data.total_pages}`;
      updatePaginationButtons();
    })
    .catch(err => {
      console.error('Fetch Error:', err.message);
      errorMessage.textContent = `Error fetching users: ${err.message}`;
      const cachedUsers = JSON.parse(localStorage.getItem('users')) || [];
      if (cachedUsers.length > 0) {
        renderUsers(cachedUsers);
        errorMessage.textContent += ' (Showing cached data)';
      } else {
        tableBody.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
      }
    })
    .finally(() => loader.style.display = 'none');
}

function renderUsers(users) {
  console.log('Users to render:', users);
  tableBody.innerHTML = '';
  if (!users || users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
    return;
  }
  users.forEach(user => {
    console.log('Rendering user:', user);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${user.avatar || 'https://via.placeholder.com/40'}" width="40" height="40"></td>
      <td>${(user.first_name || user.name || '')} ${(user.last_name || '')}</td>
      <td>${user.phone || 'N/A'}</td>
      <td>${user.email || 'N/A'}</td>
      <td>
        <button onclick="toggleStatus(${user.id}, this)" class="${user.status === 'active' ? 'active' : 'inactive'}">
          ${user.status === 'active' ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td>
        <i class="fas fa-edit action-icon" onclick="openEditForm(${user.id})"></i>
        <i class="fas fa-trash action-icon" onclick="showConfirmDeleteModal(${user.id})"></i>
      </td>
      <td>
        <button onclick="toggleLogin(${user.id}, this)" class="${user.loggedIn ? 'logout' : 'login'}">
          ${user.loggedIn ? 'Logout' : 'Login'}
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

addUserBtn.onclick = () => {
  isEdit = false;
  form.reset();
  document.getElementById('userId').value = '';
  form.classList.remove('hidden');
  addUserBtn.classList.add('hidden');
  editModal.classList.add('hidden');
};

cancelBtn.onclick = () => {
  form.classList.add('hidden');
  addUserBtn.classList.remove('hidden');
  errorMessage.textContent = '';
  form.reset();
};

closeForm.onclick = () => {
  form.classList.add('hidden');
  addUserBtn.classList.remove('hidden');
  errorMessage.textContent = '';
  form.reset();
};

form.onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const job = document.getElementById('job').value.trim();
  const avatar = document.getElementById('avatar').value.trim() || 'https://via.placeholder.com/40';

  if (!name || !job) {
    errorMessage.textContent = 'Name and Job are required!';
    return;
  }

  const userId = document.getElementById('userId').value;
  const method = isEdit ? 'PUT' : 'POST';
  const url = isEdit ? `${API_URL}/${userId}` : API_URL;

  loader.style.display = 'block';
  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({ name, job })
  })
    .then(res => {
      console.log('Save Response Status:', res.status, res.statusText);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      console.log('API Response (Save):', data);
      let users = JSON.parse(localStorage.getItem('users')) || [];
      if (isEdit) {
        const existingUser = users.find(u => u.id == userId);
        if (existingUser) {
          const updatedUser = {
            ...existingUser,
            name: name,
            first_name: name,
            last_name: existingUser.last_name || '',
            job: job,
            avatar: avatar,
            status: existingUser.status || 'active',
            loggedIn: existingUser.loggedIn || false,
            phone: existingUser.phone
          };
          users = users.map(u => (u.id == userId ? updatedUser : u));
        } else {
          errorMessage.textContent = 'User not found in localStorage! Please refresh the page.';
          return;
        }
      } else {
        const newUser = {
          id: data.id || Math.max(...users.map(u => u.id), 0) + 1,
          name,
          first_name: name,
          last_name: '',
          job,
          avatar,
          email: data.email || `${name.toLowerCase().replace(' ', '.')}@example.com`,
          status: 'active',
          loggedIn: false,
          phone: generatePhoneNumber(data.id || users.length + 1)
        };
        users.push(newUser);
      }
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Updated users in localStorage:', users);
      form.classList.add('hidden');
      addUserBtn.classList.remove('hidden');
      renderUsers(users);
      showSuccessModal(isEdit ? 'User updated!' : 'User added!');
    })
    .catch(err => {
      console.error('Save Error:', err.message);
      errorMessage.textContent = `Error saving user: ${err.message}`;
    })
    .finally(() => loader.style.display = 'none');
};

function openEditForm(id) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  let user = users.find(u => u.id === id);

  if (!user) {
    loader.style.display = 'block';
    fetch(`${API_URL}/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        user = {
          ...data.data,
          status: 'active',
          loggedIn: false,
          job: data.data.job || 'Developer',
          phone: generatePhoneNumber(data.data.id)
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        populateEditForm(user);
      })
      .catch(err => {
        console.error('Fetch User Error:', err.message);
        errorMessage.textContent = `Error: User not found (ID: ${id}). Please refresh the page.`;
      })
      .finally(() => loader.style.display = 'none');
  } else {
    populateEditForm(user);
  }
}

function populateEditForm(user) {
  isEdit = true;
  document.getElementById('editUserId').value = user.id;
  document.getElementById('editName').value = user.name || user.first_name || '';
  document.getElementById('editJob').value = user.job || 'Developer';
  document.getElementById('editAvatar').value = user.avatar || '';
  editModal.classList.remove('hidden');
  form.classList.add('hidden');
  addUserBtn.classList.remove('hidden');
  console.log('Opening edit modal for user:', user);
}

editUserForm.onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('editName').value.trim();
  const job = document.getElementById('editJob').value.trim();
  const avatar = document.getElementById('editAvatar').value.trim() || 'https://via.placeholder.com/40';

  if (!name || !job) {
    errorMessage.textContent = 'Name and Job are required!';
    return;
  }

  const userId = document.getElementById('editUserId').value;
  loader.style.display = 'block';
  fetch(`${API_URL}/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({ name, job })
  })
    .then(res => {
      console.log('Edit Response Status:', res.status, res.statusText);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      console.log('API Response (Edit):', data);
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const existingUser = users.find(u => u.id == userId);
      if (existingUser) {
        const updatedUser = {
          ...existingUser,
          name: name,
          first_name: name,
          last_name: existingUser.last_name || '',
          job: job,
          avatar: avatar,
          status: existingUser.status || 'active',
          loggedIn: existingUser.loggedIn || false,
          phone: existingUser.phone
        };
        users = users.map(u => (u.id == userId ? updatedUser : u));
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers(users);
        showSuccessModal('User updated!');
      } else {
        errorMessage.textContent = 'User not found in localStorage! Please refresh the page.';
      }
      editModal.classList.add('hidden');
    })
    .catch(err => {
      console.error('Edit Error:', err.message);
      errorMessage.textContent = `Error updating user: ${err.message}`;
    })
    .finally(() => loader.style.display = 'none');
};

modalCancelBtn.onclick = () => {
  editModal.classList.add('hidden');
  errorMessage.textContent = '';
  editUserForm.reset();
};

closeEditModal.onclick = () => {
  editModal.classList.add('hidden');
  errorMessage.textContent = '';
  editUserForm.reset();
};

function deleteUser(id) {
  showConfirmDeleteModal(id);
}

function toggleStatus(id, button) {
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.id === id);
  if (user) {
    user.status = user.status === 'active' ? 'inactive' : 'active';
    button.textContent = user.status === 'active' ? 'Active' : 'Inactive';
    button.className = user.status;
    localStorage.setItem('users', JSON.stringify(users));
    renderUsers(users);
  } else {
    errorMessage.textContent = `Error: User not found (ID: ${id}). Please refresh the page.`;
  }
}

function toggleLogin(id, button) {
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.id === id);
  if (user) {
    user.loggedIn = !user.loggedIn;
    button.textContent = user.loggedIn ? 'Logout' : 'Login';
    button.className = user.loggedIn ? 'logout' : 'login';
    localStorage.setItem('users', JSON.stringify(users));
    renderUsers(users);
  } else {
    errorMessage.textContent = `Error: User not found (ID: ${id}). Please refresh the page.`;
  }
}

function updatePaginationButtons() {
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= totalPages;
}

nextBtn.onclick = () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchUsers(currentPage);
  }
};

prevBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    fetchUsers(currentPage);
  }
};

if (searchInput) {
  searchInput.oninput = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filteredUsers = users.filter(
      user =>
        (user.name || `${user.first_name || ''} ${user.last_name || ''}`)
          .toLowerCase()
          .includes(searchTerm) ||
        (user.email || '').toLowerCase().includes(searchTerm) ||
        (user.phone || '').toLowerCase().includes(searchTerm)
    );
    renderUsers(filteredUsers);
  };
}

fetchUsers(currentPage);