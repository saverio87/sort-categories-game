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
        let sound;
        switch (event) {
            case 'correctAnswer':
                sound = this.sounds.correctAnswer;
                sound.play();
                break;
            case 'wrongAnswer':
                sound = this.sounds.wrongAnswer;
                sound.play();
                break;
            case 'click':
                sound = this.sounds.click;
                sound.play();
                break;
            case 'gameOver':
                sound = this.sounds.gameOver;
                sound.play();
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