// pdc-functions.js - Funcionalidades completas del PDC
let currentUser = null;
let products = [];
let users = [];
let clients = [];
let orders = [];
let quotes = [];
let stats = {};

// ==================== AUTENTICACIÓN ====================
function checkAuth() {
    const token = localStorage.getItem('pdcToken');
    const user = localStorage.getItem('pdcUser');
    
    if (!token || !user) {
        window.location.href = 'pdc-login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
        console.log('Usuario autenticado:', currentUser);
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'pdc-login.html';
    }
}

// ==================== API CALLS ====================
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('pdcToken');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const response = await fetch(endpoint, { ...defaultOptions, ...options });
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Error en la API');
    }
    
    return data;
}

// ==================== CARGAR DATOS ====================
async function loadDashboardData() {
    try {
        const [productsData, ordersData, quotesData, statsData] = await Promise.all([
            apiCall('/api/products'),
            apiCall('/api/orders'),
            apiCall('/api/quotes'),
            apiCall('/api/orders/stats')
        ]);

        products = productsData.data;
        orders = ordersData.data;
        quotes = quotesData.data;
        stats = statsData.data;

        updateKPIs();
        loadRecentActivity();
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        showNotification('Error cargando datos del dashboard', 'error');
    }
}

function updateKPIs() {
    document.getElementById('totalUsers').textContent = stats.totalClients || 0;
    document.getElementById('totalSales').textContent = `$${(stats.totalRevenue || 0).toLocaleString()}`;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('systemStatus').textContent = '99.9%';
}

function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;

    const recentOrders = stats.recentOrders || [];
    const recentQuotes = stats.recentQuotes || [];
    
    let html = '';
    
    recentOrders.forEach(order => {
        html += `
            <tr>
                <td>${order.clientName || 'Cliente'}</td>
                <td>Pedido #${order._id}</td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>${order.clientName || 'N/A'}</td>
                <td>${statusBadge(order.status)}</td>
            </tr>
        `;
    });
    
    recentQuotes.forEach(quote => {
        html += `
            <tr>
                <td>${quote.clientName || 'Cliente'}</td>
                <td>Cotización #${quote._id}</td>
                <td>${new Date(quote.createdAt).toLocaleDateString()}</td>
                <td>${quote.clientName || 'N/A'}</td>
                <td>${statusBadge(quote.status)}</td>
            </tr>
        `;
    });
    
    activityContainer.innerHTML = html;
}

// ==================== GESTIÓN DE USUARIOS ====================
async function loadUsers() {
    try {
        const response = await apiCall('/api/users');
        users = response.data;
        
        const usersContainer = document.getElementById('usersTable');
        if (!usersContainer) return;
        
        let html = '';
        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.userType.toUpperCase()}</td>
                    <td>${user.email}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>${statusBadge('active')}</td>
                    <td>
                        <div class="row-actions">
                            <button class="btn link" onclick="editUser('${user._id}')">Editar</button>
                            <button class="btn danger" onclick="deleteUser('${user._id}')">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        usersContainer.innerHTML = html;
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showNotification('Error cargando usuarios', 'error');
    }
}

async function createUser() {
    try {
        const userData = {
            username: document.getElementById('userName').value,
            password: document.getElementById('userPassword').value,
            userType: document.getElementById('userType').value,
            email: document.getElementById('userEmail').value
        };

        if (!userData.username || !userData.password || !userData.userType) {
            showNotification('Todos los campos son requeridos', 'error');
            return;
        }

        await apiCall('/api/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        showNotification('Usuario creado exitosamente', 'success');
        closeModal('newUserModal');
        loadUsers();
        
        // Limpiar formulario
        document.getElementById('userName').value = '';
        document.getElementById('userPassword').value = '';
        document.getElementById('userEmail').value = '';

    } catch (error) {
        console.error('Error creando usuario:', error);
        showNotification('Error creando usuario: ' + error.message, 'error');
    }
}

async function editUser(userId) {
    try {
        const user = users.find(u => u._id === userId);
        if (!user) {
            showNotification('Usuario no encontrado', 'error');
            return;
        }

        // Llenar formulario de edición
        document.getElementById('editUserName').value = user.username;
        document.getElementById('editUserType').value = user.userType;
        document.getElementById('editUserEmail').value = user.email;
        
        // Guardar ID para la actualización
        document.getElementById('editUserForm').dataset.userId = userId;
        
        openModal('editUserModal');
    } catch (error) {
        console.error('Error editando usuario:', error);
        showNotification('Error editando usuario', 'error');
    }
}

async function updateUser() {
    try {
        const userId = document.getElementById('editUserForm').dataset.userId;
        const userData = {
            username: document.getElementById('editUserName').value,
            userType: document.getElementById('editUserType').value,
            email: document.getElementById('editUserEmail').value
        };

        await apiCall(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });

        showNotification('Usuario actualizado exitosamente', 'success');
        closeModal('editUserModal');
        loadUsers();

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        showNotification('Error actualizando usuario: ' + error.message, 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return;
    }

    try {
        await apiCall(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        showNotification('Usuario eliminado exitosamente', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        showNotification('Error eliminando usuario: ' + error.message, 'error');
    }
}

// ==================== GESTIÓN DE PRODUCTOS ====================
async function loadProducts() {
    try {
        const response = await apiCall('/api/products');
        products = response.data;
        
        const productsContainer = document.getElementById('productsTable');
        if (!productsContainer) return;
        
        let html = '';
        products.forEach(product => {
            html += `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>$${product.price}</td>
                    <td>${product.stock}</td>
                    <td>${statusBadge(product.status)}</td>
                    <td>
                        <div class="row-actions">
                            <button class="btn link" onclick="editProduct('${product._id}')">Editar</button>
                            <button class="btn danger" onclick="deleteProduct('${product._id}')">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        productsContainer.innerHTML = html;
    } catch (error) {
        console.error('Error cargando productos:', error);
        showNotification('Error cargando productos', 'error');
    }
}

async function createProduct() {
    try {
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            cost: parseFloat(document.getElementById('productCost').value) || 0,
            category: document.getElementById('productCategory').value,
            sku: document.getElementById('productSku').value || `SKU-${Date.now()}`,
            stock: parseInt(document.getElementById('productStock').value),
            minStock: parseInt(document.getElementById('productMinStock').value),
            image: 'default.png'
        };

        if (!productData.name || !productData.price || !productData.category) {
            showNotification('Los campos nombre, precio y categoría son requeridos', 'error');
            return;
        }

        await apiCall('/api/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });

        showNotification('Producto creado exitosamente', 'success');
        closeModal('newProductModal');
        loadProducts();
        
        // Limpiar formulario
        document.getElementById('productName').value = '';
        document.getElementById('productDescription').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productCost').value = '';
        document.getElementById('productCategory').value = '';
        document.getElementById('productSku').value = '';
        document.getElementById('productStock').value = '';
        document.getElementById('productMinStock').value = '';

    } catch (error) {
        console.error('Error creando producto:', error);
        showNotification('Error creando producto: ' + error.message, 'error');
    }
}

async function editProduct(productId) {
    try {
        const product = products.find(p => p._id === productId);
        if (!product) {
            showNotification('Producto no encontrado', 'error');
            return;
        }

        // Llenar formulario de edición
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductDescription').value = product.description || '';
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductCost').value = product.cost || 0;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductSku').value = product.sku || '';
        document.getElementById('editProductStock').value = product.stock;
        document.getElementById('editProductMinStock').value = product.minStock;
        
        // Guardar ID para la actualización
        document.getElementById('editProductForm').dataset.productId = productId;
        
        openModal('editProductModal');
    } catch (error) {
        console.error('Error editando producto:', error);
        showNotification('Error editando producto', 'error');
    }
}

async function updateProduct() {
    try {
        const productId = document.getElementById('editProductForm').dataset.productId;
        const productData = {
            name: document.getElementById('editProductName').value,
            description: document.getElementById('editProductDescription').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            cost: parseFloat(document.getElementById('editProductCost').value) || 0,
            category: document.getElementById('editProductCategory').value,
            sku: document.getElementById('editProductSku').value || `SKU-${Date.now()}`,
            stock: parseInt(document.getElementById('editProductStock').value),
            minStock: parseInt(document.getElementById('editProductMinStock').value)
        };

        await apiCall(`/api/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });

        showNotification('Producto actualizado exitosamente', 'success');
        closeModal('editProductModal');
        loadProducts();

    } catch (error) {
        console.error('Error actualizando producto:', error);
        showNotification('Error actualizando producto: ' + error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }

    try {
        await apiCall(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        showNotification('Producto eliminado exitosamente', 'success');
        loadProducts();
    } catch (error) {
        console.error('Error eliminando producto:', error);
        showNotification('Error eliminando producto: ' + error.message, 'error');
    }
}

// ==================== GESTIÓN DE CLIENTES ====================
async function loadClients() {
    try {
        const response = await apiCall('/api/clients');
        clients = response.data;
        
        const clientsContainer = document.getElementById('clientsTable');
        if (!clientsContainer) return;
        
        let html = '';
        clients.forEach(client => {
            html += `
                <tr>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.phone}</td>
                    <td>${client.address || 'N/A'}</td>
                    <td>${new Date(client.createdAt).toLocaleDateString()}</td>
                    <td>
                        <div class="row-actions">
                            <button class="btn link" onclick="editClient('${client._id}')">Editar</button>
                            <button class="btn danger" onclick="deleteClient('${client._id}')">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        clientsContainer.innerHTML = html;
    } catch (error) {
        console.error('Error cargando clientes:', error);
        showNotification('Error cargando clientes', 'error');
    }
}

async function createClient() {
    try {
        const clientData = {
            name: document.getElementById('clientName').value,
            email: document.getElementById('clientEmail').value,
            phone: document.getElementById('clientPhone').value,
            address: document.getElementById('clientAddress').value,
            rfc: document.getElementById('clientRfc').value
        };

        if (!clientData.name || !clientData.email || !clientData.phone) {
            showNotification('Los campos nombre, email y teléfono son requeridos', 'error');
            return;
        }

        await apiCall('/api/clients', {
            method: 'POST',
            body: JSON.stringify(clientData)
        });

        showNotification('Cliente creado exitosamente', 'success');
        closeModal('newClientModal');
        loadClients();
        
        // Limpiar formulario
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('clientRfc').value = '';

    } catch (error) {
        console.error('Error creando cliente:', error);
        showNotification('Error creando cliente: ' + error.message, 'error');
    }
}

async function editClient(clientId) {
    try {
        const client = clients.find(c => c._id === clientId);
        if (!client) {
            showNotification('Cliente no encontrado', 'error');
            return;
        }

        // Llenar formulario de edición
        document.getElementById('editClientName').value = client.name;
        document.getElementById('editClientEmail').value = client.email;
        document.getElementById('editClientPhone').value = client.phone;
        document.getElementById('editClientAddress').value = client.address || '';
        document.getElementById('editClientRfc').value = client.rfc || '';
        
        // Guardar ID para la actualización
        document.getElementById('editClientForm').dataset.clientId = clientId;
        
        openModal('editClientModal');
    } catch (error) {
        console.error('Error editando cliente:', error);
        showNotification('Error editando cliente', 'error');
    }
}

async function updateClient() {
    try {
        const clientId = document.getElementById('editClientForm').dataset.clientId;
        const clientData = {
            name: document.getElementById('editClientName').value,
            email: document.getElementById('editClientEmail').value,
            phone: document.getElementById('editClientPhone').value,
            address: document.getElementById('editClientAddress').value,
            rfc: document.getElementById('editClientRfc').value
        };

        await apiCall(`/api/clients/${clientId}`, {
            method: 'PUT',
            body: JSON.stringify(clientData)
        });

        showNotification('Cliente actualizado exitosamente', 'success');
        closeModal('editClientModal');
        loadClients();

    } catch (error) {
        console.error('Error actualizando cliente:', error);
        showNotification('Error actualizando cliente: ' + error.message, 'error');
    }
}

async function deleteClient(clientId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        return;
    }

    try {
        await apiCall(`/api/clients/${clientId}`, {
            method: 'DELETE'
        });

        showNotification('Cliente eliminado exitosamente', 'success');
        loadClients();
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        showNotification('Error eliminando cliente: ' + error.message, 'error');
    }
}

// ==================== GESTIÓN DE INVENTARIO ====================
async function loadInventory() {
    try {
        const response = await apiCall('/api/products');
        products = response.data;
        
        const inventoryContainer = document.getElementById('inventoryTable');
        if (!inventoryContainer) return;
        
        let html = '';
        products.forEach(product => {
            const stockStatus = product.stock <= product.minStock ? 'low' : 'normal';
            html += `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.sku || 'N/A'}</td>
                    <td>${product.stock}</td>
                    <td>${product.minStock}</td>
                    <td>${statusBadge(stockStatus === 'low' ? 'low_stock' : 'active')}</td>
                    <td>
                        <div class="row-actions">
                            <button class="btn link" onclick="adjustStock('${product._id}')">Ajustar</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        inventoryContainer.innerHTML = html;
    } catch (error) {
        console.error('Error cargando inventario:', error);
        showNotification('Error cargando inventario', 'error');
    }
}

async function adjustStock(productId) {
    try {
        const product = products.find(p => p._id === productId);
        if (!product) {
            showNotification('Producto no encontrado', 'error');
            return;
        }

        const newStock = prompt(`Stock actual: ${product.stock}\nNuevo stock:`, product.stock);
        if (newStock && !isNaN(newStock)) {
            const stockData = {
                name: product.name,
                description: product.description,
                price: product.price,
                cost: product.cost,
                category: product.category,
                sku: product.sku,
                stock: parseInt(newStock),
                minStock: product.minStock
            };

            await apiCall(`/api/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(stockData)
            });

            showNotification('Stock actualizado exitosamente', 'success');
            loadInventory();
        }
    } catch (error) {
        console.error('Error ajustando stock:', error);
        showNotification('Error ajustando stock: ' + error.message, 'error');
    }
}

// ==================== REPORTES ====================
async function loadReports() {
    try {
        const response = await apiCall('/api/orders/stats');
        stats = response.data;
        
        // Actualizar métricas de reportes
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalQuotes').textContent = stats.totalQuotes || 0;
        document.getElementById('totalClients').textContent = stats.totalClients || 0;
        document.getElementById('totalRevenue').textContent = `$${(stats.totalRevenue || 0).toLocaleString()}`;
        
    } catch (error) {
        console.error('Error cargando reportes:', error);
        showNotification('Error cargando reportes', 'error');
    }
}

// ==================== UTILIDADES ====================
function statusBadge(status) {
    const badges = {
        'active': '<span class="badge b-success">Activo</span>',
        'low_stock': '<span class="badge b-warning">Stock Bajo</span>',
        'out_of_stock': '<span class="badge b-danger">Sin Stock</span>',
        'pending': '<span class="badge b-warning">Pendiente</span>',
        'processing': '<span class="badge b-primary">Procesando</span>',
        'delivered': '<span class="badge b-success">Entregado</span>',
        'cancelled': '<span class="badge b-danger">Cancelado</span>'
    };
    return badges[status] || '<span class="badge b-primary">N/A</span>';
}

function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#0a84ff'};
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==================== NAVEGACIÓN ====================
function loadSection(section) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Cargar datos específicos de la sección
        switch(section) {
            case 'users':
                loadUsers();
                break;
            case 'products':
                loadProducts();
                break;
            case 'clients':
                loadClients();
                break;
            case 'inventory':
                loadInventory();
                break;
            case 'reports':
                loadReports();
                break;
        }
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboardData();
    
    // Configurar navegación
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            if (section) {
                loadSection(section);
            }
        });
    });
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('pdcToken');
            localStorage.removeItem('pdcUser');
            window.location.href = 'pdc-login.html';
        });
    }
});
