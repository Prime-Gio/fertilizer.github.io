document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const tableBody = document.getElementById('fertilizer-data-body');
    const addRowBtn = document.getElementById('add-row-btn');
    const sortToggle = document.getElementById('sort-toggle');

    // --- 1. Persistence Logic (Local Storage) ---

    // Save the current state of the table to browser memory
    const saveData = () => {
        const rows = Array.from(tableBody.querySelectorAll('.data-row'));
        const data = rows.map(row => {
            return {
                section: row.querySelector('.input-text').value,
                status: row.querySelector('.input-select').value,
                amount: row.querySelector('.input-number').value,
                time: row.querySelector('.input-time').value
            };
        });
        localStorage.setItem('fertilizerData', JSON.stringify(data));
    };

    // Load data from memory on startup
    const loadData = () => {
        const savedData = localStorage.getItem('fertilizerData');
        
        // Clear existing static HTML rows to prevent duplicates
        tableBody.innerHTML = ''; 

        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Re-create rows based on saved history
            parsedData.forEach(item => {
                tableBody.insertAdjacentHTML('beforeend', createRowHTML(item.section, item.status, item.amount, item.time));
            });
            
            // Re-apply visual "active" classes to loaded rows
            refreshRowStyles();
        } else {
            // If no data exists, add one empty row to start
            tableBody.insertAdjacentHTML('beforeend', createRowHTML());
        }
    };

    // --- 2. Dynamic Row Management ---

    // Updated to accept parameters for pre-filling data
    const createRowHTML = (section = '', status = 'OFF', amount = '', time = '') => {
        return `
            <tr class="data-row fade-in">
                <td class="cell-section">
                    <input type="text" 
                        class="input-field input-text" 
                        placeholder="e.g., North Field" 
                        value="${section}">
                </td>
                <td class="cell-status">
                    <div class="select-wrapper">
                        <select class="input-field input-select">
                            <option value="OFF" ${status === 'OFF' ? 'selected' : ''}>OFF</option>
                            <option value="ON" ${status === 'ON' ? 'selected' : ''}>ON</option>
                        </select>
                    </div>
                </td>
                <td class="cell-amount">
                    <input type="number" 
                        class="input-field input-number" 
                        placeholder="0" 
                        min="0" 
                        step="250" 
                        value="${amount}">
                </td>
                <td class="cell-time">
                    <input type="time" 
                        class="input-field input-time" 
                        value="${time}">
                </td>
                <td class="cell-actions">
                    <button class="btn-delete" aria-label="Delete Row">×</button>
                </td>
            </tr>
        `;
    };

    // Add Row Event
    addRowBtn.addEventListener('click', () => {
        tableBody.insertAdjacentHTML('beforeend', createRowHTML());
        saveData(); // Save immediately when a new row is added
    });

    // Delete Row Event
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const rowToDelete = e.target.closest('tr');
            rowToDelete.style.opacity = '0'; 
            setTimeout(() => {
                rowToDelete.remove();
                saveData(); // Save immediately after deletion
            }, 300);
        }
    });

    // --- 3. State Management & Auto-Saving ---

    // We listen for 'input' (typing) and 'change' (dropdowns/toggles) on the parent table
    // This ensures we capture EVERY update to save it.
    tableBody.addEventListener('input', () => {
        saveData();
    });

    tableBody.addEventListener('change', (e) => {
        const target = e.target;
        const row = target.closest('tr');

        // Handle specific logic for the dropdown
        if (target.classList.contains('input-select')) {
            handleStatusChange(row, target.value);
        }
        
        saveData(); // Save on any change (dropdowns, checkboxes, etc.)
    });

    function handleStatusChange(row, statusValue) {
        const timeInput = row.querySelector('.input-time');
        
        // 1. Visual Feedback
        updateRowVisuals(row, statusValue);

        // 2. Auto-fill time if turning ON
        if (statusValue === 'ON' && !timeInput.value) {
            const now = new Date();
            // Format time as HH:MM for the input
            const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" });
            timeInput.value = timeString;
        }

        // 3. Conditional Sorting
        if (sortToggle.checked) {
            setTimeout(sortRows, 500); 
        }
    }

    // Helper to apply green background based on current dropdown value
    function updateRowVisuals(row, statusValue) {
        if (statusValue === 'ON') {
            row.classList.add('active-row');
        } else {
            row.classList.remove('active-row');
        }
    }

    // Runs on load to make sure colors match the loaded data
    function refreshRowStyles() {
        const rows = tableBody.querySelectorAll('.data-row');
        rows.forEach(row => {
            const status = row.querySelector('.input-select').value;
            updateRowVisuals(row, status);
        });
    }

    // --- 4. Sorting Logic ---

    sortToggle.addEventListener('change', () => {
        if (sortToggle.checked) {
            sortRows();
        }
        // Note: We generally don't need to save the "sorted order" 
        // because the user might want a different order next time, 
        // but the data values are saved.
    });

    const sortRows = () => {
        const rows = Array.from(tableBody.querySelectorAll('.data-row'));

        rows.sort((rowA, rowB) => {
            const statusA = rowA.querySelector('.input-select').value;
            const statusB = rowB.querySelector('.input-select').value;

            if (statusA === 'ON' && statusB === 'OFF') return -1;
            if (statusA === 'OFF' && statusB === 'ON') return 1;
            return 0;
        });

        rows.forEach(row => tableBody.appendChild(row));
    };

    // --- Initialization ---
    loadData();
});