
// Game logic

export function checkIfCategoryComplete(categoryId, items, selectedPanels) {
    // Count all items in this category
    const totalItems = items.filter(item => item.categoryId === categoryId).length;
    return selectedPanels.length === totalItems;
}

// Function to set 'completed' to true for completed category items
export function markCategoryAsCompleted(categoryId, items) {
    items = items.map(item => {
        if (item.categoryId === categoryId) {
            return { ...item, completed: true };
        }
        return item;
    });

    return items
}


export function isGameWon(items) {
    return items.every(item => item.completed === true);
}



// Animations

export function selectPanelAnimation(panelElement) {
    return new Promise((resolve) => {
        panelElement.classList.add('correct');
        panelElement.classList.add('animate__animated', 'animate__jello');
        const onTransitionEnd = () => {
            panelElement.removeEventListener('animationend', onTransitionEnd);
            panelElement.classList.remove('animate__animated', 'animate__jello');
            resolve("select panel animation ended");
        };
        panelElement.addEventListener('animationend', onTransitionEnd);

    });

}

export function unselectPanelAnimation(panelElement) {
    return new Promise((resolve) => {
        panelElement.classList.remove('correct');
        panelElement.classList.add('incorrect', 'animate__animated', 'animate__shakeX');
        console.log(panelElement)
        const onTransitionEnd = () => {
            panelElement.removeEventListener('animationend', onTransitionEnd);
            panelElement.classList.remove('animate__animated', 'animate__shakeX');
            panelElement.classList.remove('incorrect');
            resolve("unselect panel animation ended");
        };
        panelElement.addEventListener('animationend', onTransitionEnd);

    });

}


function createImage(src) {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("animate");
    img.addEventListener("animationend", () => {
        img.remove();
    });
    return img;
}

export function animateCategoryCompletion(selectedPanels) {
    return new Promise((resolve) => {
        let completedAnimations = 0;
        selectedPanels.forEach((panel) => {
            const img = createImage('./tick.png');
            panel.appendChild(img);

            img.addEventListener("animationend", () => {
                completedAnimations++;
                if (completedAnimations === selectedPanels.length) {
                    resolve(); // Resolve the promise when all animations are done
                }
            });
        });
    });
}


// Screen rendering

export function showGameWonScreen(items, categoriesMap, container) {
    // Group items by categoryId
    const groupedItems = Object.entries(items).reduce((acc, [key, value]) => {
        // If categoryId doesn't exist in accumulator, initialize it as an empty array
        if (!acc[value.categoryId]) {
            acc[value.categoryId] = [];
        }
        // Push the item into the corresponding categoryId group
        acc[value.categoryId].push(value);
        return acc;
    }, {});


    for (const [categoryId, items] of Object.entries(groupedItems)) {
        // Create a row for the category header (h1)
        const headerRow = document.createElement("div");
        headerRow.classList.add("row", "flexed");

        const categoryHeader = document.createElement("h2");
        categoryHeader.textContent = categoriesMap[categoryId];
        headerRow.appendChild(categoryHeader);

        // Append the header row to the parent container
        container.appendChild(headerRow);

        // Create a row for the panels of this category
        const panelRow = document.createElement("div");
        panelRow.classList.add("row", "grid");
        panelRow.setAttribute("data-category-id", categoryId);

        // Create a panel for each item in the category
        items.forEach(item => {
            const panelElement = document.createElement("div");
            panelElement.classList.add("panel");
            panelElement.innerHTML = `${item.item}`;
            panelElement.style.backgroundColor = colorMap[item.categoryId];

            // Append the panel to the panel row
            panelRow.appendChild(panelElement);
        });

        // Append the panel row to the parent container
        container.appendChild(panelRow);
    }

}


// index.html utils

export const createContainer = (name) => {
    const container = document.createElement('div');
    container.id = name;
    container.classList.add('container');
    return container
}

export const createHeading = (text) => {
    const heading = document.createElement('h1');
    heading.textContent = text;
    return heading
}

export const createResponsiveGrid = (numCategories, numPanels) => {

    const numItemsInCategory = numPanels / numCategories;
    // Create the grid container
    let responsiveGrid = document.createElement('div');
    responsiveGrid.classList.add('responsive-grid');
    for (let i = 0; i < numCategories; i++) {
        let gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        // Small row (heading)
        let headingRow = document.createElement('div');
        headingRow.classList.add('heading-row')

        // Transparent text input for category heading
        const categoryInput = document.createElement('input');
        categoryInput.type = 'text';
        categoryInput.classList.add('category-input');
        categoryInput.placeholder = `Insert category ${i}`;
        categoryInput.setAttribute('data-category-id', i); // Store category index in a data attribute
        headingRow.appendChild(categoryInput);

        // Large row (responsive grid for panels)
        let largeRow = document.createElement('div');
        largeRow.style.backgroundColor = 'white';
        largeRow.style.padding = '0.2rem';
        largeRow.style.flex = '1';  // Takes up the remaining space (80-85%)
        largeRow.style.display = 'grid';
        largeRow.style.gridTemplateColumns = '1fr 1fr';  // 2 columns
        largeRow.style.gap = '5px';  // Space between cells
        largeRow.style.borderRadius = '0.2rem';

        // Create panels inside the large row based on the number of panels
        for (let j = 1; j <= numItemsInCategory; j++) {
            const panel = document.createElement('div');
            panel.style.backgroundColor = colorMap[i];
            panel.classList.add('panel');
            panel.setAttribute('data-category-id', i); // Store category ID for easy retrieval
            // Transparent textbox for panel items
            const itemInput = document.createElement('textarea');
            itemInput.classList.add('item-input')
            itemInput.placeholder = `Insert item ${j}`;
            // Store category and panel number in data attributes
            itemInput.setAttribute('data-category-id', i);
            itemInput.setAttribute('data-panel-id', j);
            //  Append
            panel.appendChild(itemInput);
            largeRow.appendChild(panel);
        }

        // Append the small row and large row to the grid item
        gridItem.appendChild(headingRow);
        gridItem.appendChild(largeRow);

        // Append the grid item to the grid container
        responsiveGrid.appendChild(gridItem);
    }

    return responsiveGrid;
}

export const createSubmitButton = () => {
    // Create a button to save data
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save Data';
    saveButton.style.bottom = '20px';
    saveButton.style.padding = '10px 20px';
    saveButton.style.fontSize = '16px';
    saveButton.style.cursor = 'pointer';

    // saveDataOnSubmit(saveButton);
    return saveButton;

}


// On Submit Data

// 

export const validateData = (items, categories) => {
    const errors = { missingText: false, missingCategories: false };
    items.forEach((item) => {
        // Check n.1
        if (!item.item || item.item.trim() === '') {
            errors.missingText = true;
        }
    })

    for (const [key, value] of Object.entries(categories)) {
        // Check n.2
        if (!value || value.trim() === '') {
            errors.missingCategories = true;
        }

    }

    if (errors.missingText || errors.missingCategories) {
        let errorMessage = '';
        if (errors.missingText) errorMessage += "[ERROR] Fill out all the panels!\n"
        if (errors.missingCategories) errorMessage += '[ERROR] Fill out all the categories!\n'
        alert(errorMessage)
        return false;
    }
    // All checks passed
    return true;
}

export const storeCategories = () => {
    let categories = {}
    // Get all category inputs using data attributes
    document.querySelectorAll('.category-input').forEach(input => {
        let categoryId = input.getAttribute('data-category-id');
        categories[categoryId] = input.value.trim() || undefined;
        // `Category ${Number(categoryId) + 1}`
    });
    return categories;
}

export const storeItems = () => {
    let items = []
    // Get all panel inputs using data attributes
    document.querySelectorAll('.item-input').forEach(input => {
        let categoryId = input.getAttribute('data-category-id');
        let itemValue = input.value.trim(); // Get text input
        items.push({ item: itemValue, categoryId: Number(categoryId) });

    })
    return items;
}

export const createDataObject = (categories, items) => {
    let obj = {}
    obj.categories = categories;
    obj.items = items;
    return obj
};



export const colorMap = {
    0: 'cornflowerblue',
    1: 'lightgreen',
    2: 'darksalmon',
    3: 'burlywood',
    4: 'coral',
    5: 'bisque',
    6: 'skyblue',
    7: 'white',
}


const sampleGameData1 = {
    categories: {
        0: 'Fruits',
        1: 'Animals',
        2: 'Colors',
        3: 'Shapes'
    },
    items: [
        { item: 'Apple', categoryId: 0 },
        { item: 'Banana', categoryId: 0 },
        { item: 'Grape', categoryId: 0 },
        { item: 'Pineapple', categoryId: 0 },
        { item: 'Dog', categoryId: 1 },
        { item: 'Cat', categoryId: 1 },
        { item: 'Lion', categoryId: 1 },
        { item: 'Elephant', categoryId: 1 },
        { item: 'Red', categoryId: 2 },
        { item: 'Blue', categoryId: 2 },
        { item: 'Yellow', categoryId: 2 },
        { item: 'Green', categoryId: 2 }
    ]
}

const sampleGameData2 = {
    categories: {
        0: 'Vegetables',
        1: 'Countries',
        2: 'Sports'
    },
    items: [
        { item: 'Carrot', categoryId: 0 },
        { item: 'Potato', categoryId: 0 },
        { item: 'Tomato', categoryId: 0 },
        { item: 'Lettuce', categoryId: 0 },
        { item: 'India', categoryId: 1 },
        { item: 'Germany', categoryId: 1 },
        { item: 'Australia', categoryId: 1 },
        { item: 'Brazil', categoryId: 1 },
        { item: 'Football', categoryId: 2 },
        { item: 'Basketball', categoryId: 2 },
        { item: 'Tennis', categoryId: 2 },
        { item: 'Cricket', categoryId: 2 }
    ]
}

const sampleGameData3 = {
    categories: {
        0: 'Instruments',
        1: 'Cities',
        2: 'Flowers',
        3: 'Languages'
    },
    items: [
        { item: 'Guitar', categoryId: 0 },
        { item: 'Piano', categoryId: 0 },
        { item: 'Violin', categoryId: 0 },
        { item: 'Drums', categoryId: 0 },
        { item: 'Paris', categoryId: 1 },
        { item: 'London', categoryId: 1 },
        { item: 'New York', categoryId: 1 },
        { item: 'Tokyo', categoryId: 1 },
        { item: 'Rose', categoryId: 2 },
        { item: 'Tulip', categoryId: 2 },
        { item: 'Lily', categoryId: 2 },
        { item: 'Daisy', categoryId: 2 }
    ]
}

const sampleGameData4 = {
    categories: {
        0: 'Seasons',
        1: 'Foods',
        2: 'Movies'
    },
    items: [
        { item: 'Winter', categoryId: 0 },
        { item: 'Spring', categoryId: 0 },
        { item: 'Summer', categoryId: 0 },
        { item: 'Fall', categoryId: 0 },
        { item: 'Pizza', categoryId: 1 },
        { item: 'Sushi', categoryId: 1 },
        { item: 'Pasta', categoryId: 1 },
        { item: 'Burgers', categoryId: 1 },
        { item: 'Inception', categoryId: 2 },
        { item: 'Titanic', categoryId: 2 },
        { item: 'Avatar', categoryId: 2 },
        { item: 'The Dark Knight', categoryId: 2 }
    ]
}

const sampleGameData5 = {
    categories: {
        0: 'Vehicles',
        1: 'Musicians',
        2: 'Books'
    },
    items: [
        { item: 'Car', categoryId: 0 },
        { item: 'Bus', categoryId: 0 },
        { item: 'Bicycle', categoryId: 0 },
        { item: 'Motorcycle', categoryId: 0 },
        { item: 'Beethoven', categoryId: 1 },
        { item: 'Mozart', categoryId: 1 },
        { item: 'Bach', categoryId: 1 },
        { item: 'Chopin', categoryId: 1 },
        { item: '1984', categoryId: 2 },
        { item: 'Pride and Prejudice', categoryId: 2 },
        { item: 'Moby Dick', categoryId: 2 },
        { item: 'The Catcher in the Rye', categoryId: 2 }
    ]
}
