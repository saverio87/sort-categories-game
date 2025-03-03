import { SoundManager, SoundObserver } from "./sound.js";
import { GameObserver } from "./gameObserver.js";
import {
    // Game logic
    checkIfCategoryComplete,
    markCategoryAsCompleted,
    isGameWon
} from "./utils.js";

class GameController {
    constructor() {
        this.state = {
            items: [],
            categories: {},
            currentCategoryId: undefined,
            selectedPanels: [],
            errors: 0
        };
        this.observers = [];
        this.listeners = [];

    }

    // Observers
    addObserver(observer) {
        this.observers.push(observer);
    }
    // Listeners
    addListeners(listener) {
        this.listeners.push(listener);
    }

    async notifyObservers(eventType, payload) {
        // Notify all observers about the event and collect their Promises
        const promises = this.observers.map(observer => observer.update(eventType, payload));
        // Wait for all Promises to resolve
        await Promise.all(promises);
    }

    async notifyListeners(eventType) {
        // Notify all observers about the event and collect their Promises
        const promises = this.listeners.map(listener => listener.update(eventType));
        // Wait for all Promises to resolve
        await Promise.all(promises);
    }

    setInstructions(instructions) {
        // Set instructions
        this.state.instructions = instructions;
        this.notifyObservers('setInstructions', { instructions: this.state.instructions });
    }

    // Start / Stop Game

    startGame(gameData) {

        const { categories, items } = gameData;
        // Prepping the state
        this.state.categories = categories;
        // Generate cards
        this.state.items = this.shuffle(items);
        // Render board
        this.renderBoard();
        // Start game - UI rendering
        this.notifyObservers('updateInformationContainer', { categories: this.state.categories, categoryId: undefined });
        this.notifyObservers("startGame", this.state);

    }

    stopGame() {
        this.state.matchesFound = 0;
        this.state.errors = 0;
        // this.resetTimer();
        this.notifyObservers("stopGame", null);
    }

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    resetSelection() {
        // Empty selectedPanels array and reset currentCategoryId value
        this.state.selectedPanels = [];
        this.state.currentCategoryId = undefined;
    }

    renderBoard() {
        // Render board
        this.notifyObservers('renderBoard', { items: this.state.items })
        // Render information container with initial message
    }

    async handlePanelClick(panelElement, payload) {
        // If card  has already been clicked it cannot be clicked again.
        if (panelElement.classList.contains("clicked")) {
            return;
        }
        // Add 'clicked'
        panelElement.classList.add("clicked");

        const categoryId = parseInt(panelElement.dataset.categoryId);

        // If it is first panel in sequence being clicked,
        // set categoryId of panel clicked as current categoryId
        if (this.state.currentCategoryId === undefined) {
            this.state.currentCategoryId = categoryId;
            await this.notifyObservers('selectPanel', { panelElement });
            this.state.selectedPanels.push(panelElement);
            return;
        }
        // If it is not first panel being clicked,
        // but categoryId of panel clicked is the same as current categoryId
        if (categoryId === this.state.currentCategoryId) {
            this.state.selectedPanels.push(panelElement);
            await this.notifyObservers('selectPanel', { panelElement });
            // Check if all items in category have been found
            if (checkIfCategoryComplete(categoryId, this.state.items, this.state.selectedPanels)) {
                // update state - items array
                this.state.items = markCategoryAsCompleted(categoryId, this.state.items);
                // re-render UI
                await this.notifyObservers('categoryCompleted', { selectedPanels: this.state.selectedPanels });
                this.notifyObservers('updateInformationContainer', { categories: this.state.categories, categoryId });
                // check if game won
                if (isGameWon(this.state.items)) {
                    this.notifyObservers("gameWon", {
                        items: this.state.items
                    });
                    // stopGame resets number of errors
                    this.stopGame();
                } else {
                    this.resetSelection();
                    this.renderBoard();
                    console.log('category completed!')
                }
            }

        } else {
            // Incorrect selection
            console.log("Another category ID item was clicked!");
            // Temporarily add to selectedPanels so that it's part of the animation
            this.state.selectedPanels.push(panelElement);
            // Update errors
            this.state.errors++;
            this.notifyObservers('renderErrorCounter', { errors: this.state.errors })
            await this.notifyObservers('unselectPanels', { selectedPanels: this.state.selectedPanels })
            // empty selectedPanels
            this.resetSelection();
            this.renderBoard();
        }


    }

    // Sound effects
    // Example of game actions that trigger events
    playerCorrectAnswer() {
        this.notifyListeners('correctAnswer');
    }

}


document.addEventListener("DOMContentLoaded", () => {
    // Initializing GameController and gameObserver
    // Fetching array from localStorage
    const gameData = JSON.parse(localStorage.getItem("gameData"));
    // const instructions = localStorage.getItem("instructions");

    const gameController = new GameController();
    // import sound classes
    const soundManager = new SoundManager();
    const soundObserver = new SoundObserver(soundManager);
    const gameObserver = new GameObserver(gameController);
    // add observers (and listeners)
    gameController.addObserver(gameObserver);
    gameController.addListeners(soundObserver);
    // Fetching array from localStorage

    // const cards = JSON.parse(localStorage.getItem("cards"));
    // Grabbing button elements
    // const playAgainButton = document.getElementById("start");
    // const makeNewGameButton = document.getElementById("newgame");
    // const stopButton = document.getElementById("stop");

    // if (items) {
    gameController.startGame(gameData);
    // }


});