class RoleManager {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const buttons = document.querySelectorAll('.role-button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => this.handleRoleSelection(e));
        });
    }

    handleRoleSelection(event) {
        const role = event.target.dataset.role;
        this.navigateToRolePage(role);
    }

    navigateToRolePage(role) {
        switch(role) {
            case 'manager':
                window.location.href = 'manager.html';
                break;
            case 'seller':
                window.location.href = 'seller.html';
                break;
            case 'technician':
                window.location.href = 'technician.html';
                break;
        }
    }
}

// Инициализиране на приложението
document.addEventListener('DOMContentLoaded', () => {
    new RoleManager();
}); 