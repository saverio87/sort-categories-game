export class SoundManager {
    constructor() {
        this.sounds = {
            correctAnswer: new Audio('sounds/correct-positive-answer.wav'),
            wrongAnswer: new Audio('sounds/wrong-answer-fail-notification.wav'),
            click: new Audio('sounds/hard-pop-click.wav'),
            gameOver: new Audio('sounds/')
        };

        // Set default volume, can be changed later
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.5;
        });
    }

    // Play the sound based on the event
    playSound(event) {
        switch (event) {
            case 'correctAnswer':
                this.sounds.correctAnswer.play();
                break;
            case 'wrongAnswer':
                this.sounds.wrongAnswer.play();
                break;
            case 'click':
                this.sounds.click.play();
                break;
            case 'gameOver':
                this.sounds.gameOver.play();
                break;
            default:
                console.log('No sound mapped for this event.');
        }
    }
}

export class SoundObserver {
    constructor(soundManager) {
        this.soundManager = soundManager;
    }

    // The update method that gets called when an event is triggered
    update(event) {
        this.soundManager.playSound(event);
    }
}