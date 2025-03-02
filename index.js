// rendering
import {
    createContainer, createHeading, createResponsiveGrid, createSubmitButton, createLinks
} from "./utils.js";
// logic
import {
    storeCategories, storeItems, validateData, createDataObject
} from "./utils.js"

import { sampleGameData1 } from "./utils.js";

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
        this.notifyObservers('renderScreenWithAnimation', { screenName: 'mainScreen' })
        // numberPanelsScreen
    }


    handleClick(fn, payload) {

        switch (fn) {
            case 'storeNumPanels':
                this.state.numPanels = payload.numPanels;
                console.log(this.state);
                this.notifyObservers('renderScreenWithAnimation', { screenName: 'numberCategoriesScreen' })
                break;
            // case 'storeItems':
            //     this.state.items = payload.items;
            //     console.log(this.state);
            //     this.notifyObservers('renderScreenWithAnimation', { screenName: 'numberCategoriesScreen' })
            //     break;
            case 'storeNumCategories':
                this.state.numCategories = payload.numCategories;
                console.log(this.state);
                this.notifyObservers('renderScreenWithAnimation', { screenName: 'itemsScreen' })
                break;
            // case 'storeCategoriesNames':
            //     for (let i in payload.categoriesNames) {
            //         this.state.categories[i] = payload.categoriesNames[i]
            //     }
            //     console.log(this.state);
            //     break;
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
        let container;
        let heading;
        let br;
        let horizontalPanels;
        let verticalPanels;
        let submitButton;
        switch (screen) {

            case 'mainScreen':
                container = createContainer();
                heading = createHeading('Sorting Categories Game', 4, 'SNACKID');
                container.append(heading)
                const optionOne = createLinks('I want to create a new game', () => {
                    document.body.innerHTML = '';
                    this.gameState.notifyObservers('renderScreenWithAnimation', { screenName: 'numberPanelsScreen' })

                });
                container.append(optionOne)
                const optionTwo = createLinks('I want to play with a sample game', () => {
                    localStorage.setItem("gameData", JSON.stringify(sampleGameData1));
                    window.location.href = "game.html";
                }

                );
                container.append(optionTwo)

                return container;

                break;
            case 'itemsScreen':
                // Create container div
                container = document.createElement('div');
                container.id = 'screen-wide';
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
                container = createContainer();
                // Create h1 element
                heading = createHeading(`Step 1. Choose the number of panels you want to play with`, 3, 'SNACKID');
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
                container.appendChild(horizontalPanels);

                // Return the container1 element
                return container;
                break;

            case 'numberCategoriesScreen':

                container = createContainer();
                // Create h1 element
                heading = createHeading(`Step 2. Choose the number of categories`, 3, 'SNACKID');
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
        this.container;
        switch (eventType) {
            case "startGame":
                // this.mainScreen = this.renderScreen('numberCategoriesScreen');
                // document.body.appendChild(this.mainScreen)
                // Re-render UI
                // this.result.innerHTML = '';

                break;

            case "renderScreenWithAnimation":
                if (this.oldScreen) await this.oldScreenFadeOut(this.oldScreen);
                document.body.innerHTML = '';
                this.container = this.renderScreen(payload.screenName);
                document.body.appendChild(this.container);
                await this.newScreenFadeIn(this.container);

        }

    }
}


// On Submit


document.addEventListener("DOMContentLoaded", () => {

    const gameState = new GameState();
    const gameObserver = new GameObserver(gameState);
    gameState.addObserver(gameObserver);

    gameState.startGame();

})

