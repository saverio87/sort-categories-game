import {
    // animations
    selectPanelAnimation,
    unselectPanelAnimation,
    animateCategoryCompletion,
    colorMap,
    // Screen rendering
    showGameWonScreen
} from './utils.js'

export class GameObserver {
    constructor(gameState) {
        // Inherit gameState
        this.gameState = gameState;
        // Fetch HTML elements
        this.feedbackContainer = document.getElementById("game-won-feedback")
        this.panelContainer = document.querySelector(".panels");
        this.gameContainer = document.querySelector(".game-container");
        this.matchesTotalCounter = document.getElementById("found");
        this.errorsCounter = document.getElementById("errors");
        this.gameWonScreen = document.getElementById('game-won');
        this.informationContainer = document.getElementById("information-container");
        // Initialize empty elements
        this.panelElement;
    }

    async update(eventType, payload) {

        switch (eventType) {
            case "startGame":


                break;

            case "stopGame":
                this.gameContainer.classList.add("hide");
                break;
            case "updateInformationContainer":
                if (payload.categoryId == undefined) {
                    this.informationContainer.innerText = '';
                    this.informationContainer.innerHTML +=
                        `<p>Find items for all ${Object.keys(payload.categories).length} categories!</p>`;
                    // this.informationContainer.innerHTML += `<p><b>${categories[categoryId]}</b></p>`;
                    break;
                }
                // re-factor this adding two cases based on mode the game is being played in,
                // if mode is 'easy' the re-rendering of this container should tell the player
                // the next category for which they have to find the items
                const { categories, categoryId } = payload;
                this.informationContainer.innerText = '';
                this.informationContainer.style.backgroundColor = colorMap[categoryId];
                this.informationContainer.innerHTML += `<p>You found all the items for the category:</p>`;
                this.informationContainer.innerHTML += `<p><b>${categories[categoryId]}</b></p>`;
                // Render board
                break;
            case "renderBoard":
                // Render board
                console.log('rendering board...s')
                const { items } = payload;
                this.panelContainer.innerHTML = "";
                items.forEach((item) => {
                    const panelElement = document.createElement("div");
                    panelElement.classList.add("panel");
                    panelElement.innerHTML = `${item.item}`;
                    panelElement.dataset.categoryId = item.categoryId;
                    if (item.completed) {
                        let colorIndex = item.categoryId;
                        panelElement.style.opacity = '0.5';
                        panelElement.style.backgroundColor = colorMap[colorIndex]
                        // panelElement.style.visibility = 'hidden';
                    } else {
                        panelElement.style.opacity = '1';
                        // panelElement.style.visibility = 'visible';
                        // Attach event listener or any other logic for active panels
                        panelElement.addEventListener("click", () => {
                            this.gameState.handlePanelClick(panelElement, item)
                        })
                    }
                    this.panelContainer.appendChild(panelElement);


                })
                console.log(this.panelContainer)
                break;

            case "renderErrorCounter":
                let { errors } = payload;
                if (!errors) errors = 0;
                this.errorsCounter.innerHTML = `Errors:<br>${errors}`
                break;

            // Re-render UI in response to click events
            case "selectPanel":
                this.panelElement = payload.panelElement;
                this.panelElement.parentElement.classList.add('disable-clicks');
                this.panelElement.classList.add('correct');
                await this.gameState.notifyListeners('click');
                await selectPanelAnimation(this.panelElement);
                this.panelElement.parentElement.classList.remove('disable-clicks');
                break;

            case "unselectPanels":
                this.panelElement.parentElement.classList.add('disable-clicks');
                const { selectedPanels } = payload;
                await this.gameState.notifyListeners('wrongAnswer');
                const unselectPromises = selectedPanels.map(panel => unselectPanelAnimation(panel));
                await Promise.all(unselectPromises);
                this.panelElement.parentElement.classList.remove('disable-clicks');
                break;

            case "categoryCompleted":
                this.panelElement.parentElement.classList.add('disable-clicks');
                await this.gameState.notifyListeners('correctAnswer');
                await animateCategoryCompletion(payload.selectedPanels);
                this.panelElement.parentElement.classList.remove('disable-clicks');
                break;

            case "gameWon":
                showGameWonScreen(payload.items, this.gameState.state.categories, this.feedbackContainer)
                this.gameWonScreen.classList.remove('hide');

                const gameWonErrors = document.getElementById('gameWonErrors');
                // gameWonErrors.innerText += totalErrors;

                break;

        }

    }
}
