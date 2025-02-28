import {
    createContainer, createHeading, createResponsiveGrid,
    createSubmitButton, storeCategories, storeItems,
    validateData, createDataObject
} from "./utils.js";

class GameState {
    constructor() {
        this.state = {
            numCategories: 0,
            categories: {},
            items: [],
            output: []

        };
        this.observers = [];

    }

    // Observers
    addObserver(observer) {
        this.observers.push(observer);
    }

    async notifyObservers(eventType, payload) {
        // Notify all observers about the event and collect their Promises
        const promises = this.observers.map(observer => observer.update(eventType, payload));
        // Wait for all Promises to resolve
        await Promise.all(promises);
    }

    startGame() {
        this.notifyObservers('renderScreen', { screenName: 'numberPanelsScreen' })
    }


    handleClick(fn, payload) {

        switch (fn) {
            case 'storeNumPanels':
                this.state.numPanels = payload.numPanels;
                console.log(this.state);
                this.notifyObservers('renderScreen', { screenName: 'numberCategoriesScreen' })
                break;
            case 'storeItems':
                this.state.items = payload.items;
                console.log(this.state);
                this.notifyObservers('renderScreen', { screenName: 'numberCategoriesScreen' })
                break;
            case 'storeNumCategories':
                this.state.numCategories = payload.numCategories;
                console.log(this.state);
                this.notifyObservers('renderScreen', { screenName: 'itemsScreen' })
                break;
            case 'storeCategoriesNames':
                for (let i in payload.categoriesNames) {
                    this.state.categories[i] = payload.categoriesNames[i]
                }
                console.log(this.state);
                break;
            case 'submitData':
                this.state.output = createDataObject(payload.categories, payload.items);
                console.log(this.state.output);
                localStorage.setItem("gameData", JSON.stringify(this.state.output));
                window.location.href = 'game.html';
                break;
        }
    }



}

class GameObserver {
    constructor(gameState) {
        // Inherit gameState
        this.gameState = gameState;
    }

    // iterates over clickables, adds event listener to hide old screen and render new screen 
    renderNextScreenOnClick(clickables, oldScreen, newScreen) {
        clickables.forEach((clickable) => {
            clickable.addEventListener('click', () => {
                this.transitionToNextScreen(oldScreen, newScreen)
            })
        })
    }

    renderScreen(screen, payload) {
        let heading;
        let br;
        let container;
        let horizontalPanels;
        let verticalPanels;
        let submitButton;
        switch (screen) {
            case 'itemsScreen':
                // Create container div
                container = createContainer('container1');
                // Create h1 element
                heading = createHeading('Step 3. Assign names and elements to each category.')
                // Create the responsive grid
                let responsiveGrid = createResponsiveGrid(this.gameState.state.numCategories, this.gameState.state.numPanels);

                submitButton = createSubmitButton();
                submitButton.addEventListener('click', (event) => {
                    let categories = storeCategories(), items = storeItems();
                    if (validateData(items, categories)) {
                        this.gameState.handleClick('submitData', {
                            categories: categories,
                            items: items
                        })
                    }

                })

                container.append(heading);
                container.append(responsiveGrid);
                container.append(submitButton);

                // // Return the container1 element
                return container;
                break;

            case 'numberPanelsScreen':
                // Create container div
                container = document.createElement('div');
                container.id = 'container1';
                container.classList.add('container');
                // Create h1 element
                heading = document.createElement('h1');
                heading.textContent = 'Step 1. Choose the number of panels you want to play with.';

                // Create a line break
                br = document.createElement('br');

                // Create the horizontal-panels div
                horizontalPanels = document.createElement('div');
                horizontalPanels.classList.add('horizontal-panels');

                // Create the buttons (2, 3, 4) and append them to horizontal-panels
                const numPanelsButtons = [12, 16];
                numPanelsButtons.forEach(value => {
                    const button = document.createElement('button');
                    button.classList.add('card', 'numPanels');
                    button.textContent = value;
                    button.addEventListener('click', (event) => {
                        this.gameState.handleClick('storeNumPanels', {
                            numPanels: event.target.textContent
                        })
                    })
                    horizontalPanels.appendChild(button);
                });
                // Append the heading, line break, and horizontal-panels to container
                container.appendChild(heading);
                container.appendChild(br);
                container.appendChild(horizontalPanels);

                // Return the container1 element
                return container;
                break;

            case 'numberCategoriesScreen':
                // Create container1 div
                container = document.createElement('div');
                container.id = 'container1';
                container.classList.add('container');
                // Create h1 element
                heading = document.createElement('h1');
                heading.textContent = 'Step 2. Choose the number of categories.';

                // Create a line break
                br = document.createElement('br');

                // Create the horizontal-panels div
                horizontalPanels = document.createElement('div');
                horizontalPanels.classList.add('horizontal-panels');

                // Create the buttons dynamically (2, 3, 4) and append them to horizontal-panels
                const numCategoriesButtons =
                    this.gameState.state.numPanels == 16 ? [2, 4, 8]
                        : [2, 3, 4];
                numCategoriesButtons.forEach(value => {
                    const button = document.createElement('button');
                    button.classList.add('card', 'numCategories');
                    button.textContent = value;
                    button.addEventListener('click', (event) => {
                        this.gameState.handleClick('storeNumCategories', {
                            numCategories: event.target.textContent
                        })
                    })
                    horizontalPanels.appendChild(button);
                });
                // Append the heading, line break, and horizontal-panels to container
                container.appendChild(heading);
                container.appendChild(br);
                container.appendChild(horizontalPanels);

                // Return the container element
                return container;
                break;


            default:
                console.log('boh')
                break;
        }
    }

    async oldScreenFadeOut(oldScreen) {
        return new Promise((resolve) => { // Wrap the logic in a Promise
            oldScreen.classList.add('animate__animated', 'animate__fadeOutLeft');

            const onAnimationEnd = () => {
                // Remove the animation-related classes and hide the oldScreen
                oldScreen.removeEventListener('animationend', onAnimationEnd);
                oldScreen.classList.remove('animate__animated', 'animate__fadeOutLeft');
                oldScreen.classList.add('hidden');
                resolve(); // Resolve the promise after the animation completes
            };

            // Attach the event listener for when the animation ends
            oldScreen.addEventListener('animationend', onAnimationEnd);
        });
    }

    async newScreenFadeIn(newScreen) {
        return new Promise((resolve) => { // Wrap the logic in a Promise
            newScreen.classList.add('animate__animated', 'animate__fadeInRight');

            const onAnimationEnd = () => {
                newScreen.classList.remove('animate__animated', 'animate__fadeInRight');
                oldScreen.classList.remove('hidden');
                resolve(); // Resolve the promise after the animation completes
            };

            // Attach the event listener for when the animation ends
            screen.addEventListener('animationend', onAnimationEnd);
        });

    }

    async update(eventType, payload) {
        this.oldScreen = document.querySelector('.container');
        this.mainScreen;
        switch (eventType) {
            case "startGame":
                // this.mainScreen = this.renderScreen('numberCategoriesScreen');
                // document.body.appendChild(this.mainScreen)
                // Re-render UI
                // this.result.innerHTML = '';

                break;

            case "renderScreen":
                if (this.oldScreen) await this.oldScreenFadeOut(this.oldScreen);
                document.body.innerHTML = '';
                this.mainScreen = this.renderScreen(payload.screenName);
                document.body.appendChild(this.mainScreen);
                await this.newScreenFadeIn(this.mainScreen);

        }

    }
}


// On Submit


const playPreMadeGame = (number) => {

    switch (number) {
        case 'facts':
            localStorage.setItem("gameData", JSON.stringify(this.state.output))
            sentences = facts.sentences;
            instructions = facts.instructions;
            break;
        case 'capitals':
            sentences = europeanCapitals.sentences;
            instructions = europeanCapitals.instructions;
            break;
    }
    // const { sentences, instructions } = payload;
    localStorage.setItem("sentences", JSON.stringify(sentences));
    window.location.href = "game.html";
}


document.addEventListener("DOMContentLoaded", () => {

    const gameState = new GameState();
    const gameObserver = new GameObserver(gameState);
    gameState.addObserver(gameObserver);

    gameState.startGame();

})

