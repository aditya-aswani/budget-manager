class BudgetTracker {
    constructor() {
        this.categories = {
            'budget-total': { value: 100000, locked: false, isTotal: true },
            'staff-costs': { value: 40000, locked: false },
            'fixed-costs': { value: 25000, locked: false },
            'variable-costs': { value: 20000, locked: false },
            'scholarships': { value: 15000, locked: false }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        Object.keys(this.categories).forEach(categoryId => {
            const slider = document.getElementById(categoryId);
            const lockBtn = document.getElementById(`${categoryId}-lock`);

            slider.addEventListener('input', (e) => {
                this.handleSliderChange(categoryId, parseInt(e.target.value));
            });

            lockBtn.addEventListener('click', () => {
                this.toggleLock(categoryId);
            });
        });
    }

    handleSliderChange(changedCategoryId, newValue) {
        const oldValue = this.categories[changedCategoryId].value;
        this.categories[changedCategoryId].value = newValue;

        if (changedCategoryId === 'budget-total') {
            this.adjustNonLockedCategories(newValue - oldValue);
        } else {
            this.adjustBudgetOrOtherCategories(newValue - oldValue, changedCategoryId);
        }

        this.updateDisplay();
    }

    adjustNonLockedCategories(totalChange) {
        const nonLockedCategories = Object.keys(this.categories).filter(id =>
            id !== 'budget-total' && !this.categories[id].locked
        );

        if (nonLockedCategories.length === 0) return;

        const changePerCategory = Math.floor(totalChange / nonLockedCategories.length);
        let remainingChange = totalChange - (changePerCategory * nonLockedCategories.length);

        nonLockedCategories.forEach((categoryId, index) => {
            let adjustment = changePerCategory;
            if (index === 0) adjustment += remainingChange;

            const newValue = Math.max(0, this.categories[categoryId].value + adjustment);
            const slider = document.getElementById(categoryId);
            const maxValue = parseInt(slider.max);

            this.categories[categoryId].value = Math.min(newValue, maxValue);
        });
    }

    adjustBudgetOrOtherCategories(change, changedCategoryId) {
        if (this.categories['budget-total'].locked) {
            this.adjustOtherCategories(change, changedCategoryId);
        } else {
            this.categories['budget-total'].value = Math.max(0, this.categories['budget-total'].value + change);
            const totalSlider = document.getElementById('budget-total');
            const maxValue = parseInt(totalSlider.max);
            this.categories['budget-total'].value = Math.min(this.categories['budget-total'].value, maxValue);
        }
    }

    adjustOtherCategories(change, excludeCategoryId) {
        const adjustableCategories = Object.keys(this.categories).filter(id =>
            id !== 'budget-total' && id !== excludeCategoryId && !this.categories[id].locked
        );

        if (adjustableCategories.length === 0) return;

        const changePerCategory = Math.floor(-change / adjustableCategories.length);
        let remainingChange = -change - (changePerCategory * adjustableCategories.length);

        adjustableCategories.forEach((categoryId, index) => {
            let adjustment = changePerCategory;
            if (index === 0) adjustment += remainingChange;

            const newValue = Math.max(0, this.categories[categoryId].value + adjustment);
            const slider = document.getElementById(categoryId);
            const maxValue = parseInt(slider.max);

            this.categories[categoryId].value = Math.min(newValue, maxValue);
        });
    }

    toggleLock(categoryId) {
        this.categories[categoryId].locked = !this.categories[categoryId].locked;
        this.updateDisplay();
    }

    updateDisplay() {
        Object.keys(this.categories).forEach(categoryId => {
            const category = this.categories[categoryId];
            const slider = document.getElementById(categoryId);
            const valueSpan = document.getElementById(`${categoryId}-value`);
            const lockBtn = document.getElementById(`${categoryId}-lock`);
            const budgetItem = slider.closest('.budget-item');

            slider.value = category.value;
            valueSpan.textContent = category.value.toLocaleString();

            if (category.locked) {
                lockBtn.textContent = '🔒';
                lockBtn.classList.add('locked');
                budgetItem.classList.add('locked');
                slider.disabled = true;
            } else {
                lockBtn.textContent = '🔓';
                lockBtn.classList.remove('locked');
                budgetItem.classList.remove('locked');
                slider.disabled = false;
            }
        });

        this.updateSummary();
    }

    updateSummary() {
        const totalBudget = this.categories['budget-total'].value;
        const totalAllocated = Object.keys(this.categories)
            .filter(id => id !== 'budget-total')
            .reduce((sum, id) => sum + this.categories[id].value, 0);

        const remaining = totalBudget - totalAllocated;

        document.getElementById('total-allocated').textContent = totalAllocated.toLocaleString();
        document.getElementById('remaining').textContent = remaining.toLocaleString();

        const remainingElement = document.getElementById('remaining');
        remainingElement.className = remaining >= 0 ? 'positive' : 'negative';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BudgetTracker();
});