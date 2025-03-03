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
        if (this.sounds[event]) {
            const soundClone = this.sounds[event].cloneNode(); // ✅ Create a new instance
            soundClone.volume = this.sounds[event].volume; // ✅ Maintain the set volume
            soundClone.play(); // ✅ Ensure the sound plays
        } else {
            console.log(`No sound mapped for event: ${event}`);
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