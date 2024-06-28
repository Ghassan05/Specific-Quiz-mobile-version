<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", function() {
    const timerContainer = document.getElementById("timer-container");
    const timerBarLeft = document.getElementById("timer-bar-left");
    const timerBarRight = document.getElementById("timer-bar-right");
    const diamond = document.getElementById("diamond");
    const categoryMessage = document.getElementById("category-message");

    const clockAlarm = document.getElementById("clock-alarm");
    const backgroundMusic = document.getElementById("background-music");

    let countdownInterval;
    let remainingTime;
    let timeouts = [];

    // Start background music when the page loads
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // Set volume to 50%
    backgroundMusic.play().catch(error => {
        console.log('Autoplay was prevented. Click to start the music.');
        document.body.addEventListener('click', () => {
            backgroundMusic.play();
        }, { once: true });
    });

    // Categories of images
    const categories = {
        houses: {
            lose: Array.from({ length: 12 }, (_, i) => `lose/houses/lose-house${i + 1}.png`),
            win: Array.from({ length: 6 }, (_, i) => `win/houses/win-house${i + 1}.png`)
        },
        animals: {
            lose: Array.from({ length: 6 }, (_, i) => `lose/animals/lose-animal${i + 1}.png`),
            win: Array.from({ length: 3 }, (_, i) => `win/animals/win-animal${i + 1}.png`)
        },
        watches: {
            lose: Array.from({ length: 8 }, (_, i) => `lose/watches/lose-watch${i + 1}.png`),
            win: Array.from({ length: 4 }, (_, i) => `win/watches/win-watch${i + 1}.png`)
        },
        challenge: {
            lose: Array.from({ length: 2 }, (_, i) => `lose/challenge/lose-challenge${i + 1}.png`),
            win: Array.from({ length: 1 }, (_, i) => `win/challenge/win-challenge${i + 1}.png`)
        },
        bedrooms: {
            lose: Array.from({ length: 4 }, (_, i) => `lose/bedrooms/lose-bedroom${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/bedrooms/win-bedroom${i + 1}.png`)
        },
        cars: {
            lose: Array.from({ length: 4 }, (_, i) => `lose/cars/lose-car${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/cars/win-car${i + 1}.png`)
        },
        motorcycles: {
            lose: Array.from({ length: 4 }, (_, i) => `lose/motorcycles/lose-motorcycle${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/motorcycles/win-motorcycle${i + 1}.png`)
        },
        shoes: {
            lose: Array.from({ length: 3 }, (_, i) => `lose/shoes/lose-shoe${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/shoes/win-shoe${i + 1}.png`)
        },
        hair: {
            lose: Array.from({ length: 4 }, (_, i) => `lose/hair/lose-hair${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/hair/win-hair${i + 1}.png`)
        }
    };

    let availableImages = {
        houses: { ...categories.houses },
        animals: { ...categories.animals },
        watches: { ...categories.watches },
        challenge: { ...categories.challenge },
        bedrooms: { ...categories.bedrooms },
        cars: { ...categories.cars },
        motorcycles: { ...categories.motorcycles },
        shoes: { ...categories.shoes },
        hair: { ...categories.hair }
    };

    let usedCategories = [];

    function getRandomCategory() {
        if (usedCategories.length === Object.keys(categories).length) {
            usedCategories = []; // Reset used categories after all have been used
        }

        let availableCategories = Object.keys(categories).filter(cat => !usedCategories.includes(cat));
        const randomIndex = Math.floor(Math.random() * availableCategories.length);
        const selectedCategory = availableCategories[randomIndex];
        usedCategories.push(selectedCategory);

        return selectedCategory;
    }

    function generateMessage(category) {
        let categoryName;
        let emoji;
        switch (category) {
            case 'houses':
                categoryName = 'house';
                emoji = '🏠';
                break;
            case 'animals':
                categoryName = 'animal';
                emoji = '🐶';
                break;
            case 'watches':
                categoryName = 'watch';
                emoji = '⌚';
                break;
            case 'challenge':
                categoryName = 'challenge';
                emoji = '🏆';
                break;
            case 'bedrooms':
                categoryName = 'bedroom';
                emoji = '🛏️';
                break;
            case 'cars':
                categoryName = 'car';
                emoji = '🚗';
                break;
            case 'motorcycles':
                categoryName = 'motorcycle';
                emoji = '🏍️';
                break;
            case 'shoes':
                categoryName = 'shoe';
                emoji = '👟';
                break;
            case 'hair':
                categoryName = 'hair';
                emoji = '💇‍♂️';
                break;
            default:
                categoryName = '';
                emoji = '';
        }
        return `Choose your ${categoryName} ${emoji}`;
    }

    function speakMessage(message) {
        const messageWithoutEmoji = message.replace(/[^\w\s]/gi, ''); // Remove emojis
        const utterance = new SpeechSynthesisUtterance(messageWithoutEmoji.trim());
        window.speechSynthesis.speak(utterance);
    }

    function getRandomImages(category) {
        let { lose, win } = availableImages[category];

        // Ensure there are enough images to select from
        if (lose.length < 2 || win.length === 0) {
            availableImages[category] = { ...categories[category] }; // Reset category if all images have been shown
            lose = availableImages[category].lose;
            win = availableImages[category].win;
        }

        // Shuffle and select images
        const shuffledLose = lose.sort(() => 0.5 - Math.random());
        const nonWinningImages = shuffledLose.slice(0, 2);
        const winningImage = win[Math.floor(Math.random() * win.length)];

        // Remove selected images from available lists
        availableImages[category].lose = lose.filter(img => !nonWinningImages.includes(img));
        availableImages[category].win = win.filter(img => img !== winningImage);

        console.log(`Selected images from category ${category}:`, [...nonWinningImages, winningImage]);

        return [...nonWinningImages, winningImage].sort(() => 0.5 - Math.random());
    }

    function startCountdown(seconds) {
        const category = getRandomCategory();
        const message = generateMessage(category);

        // Display and speak the message
        categoryMessage.textContent = message;
        speakMessage(message);

        remainingTime = seconds;
        countdownInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                categoryMessage.textContent = ""; // Hide the message
                executeTimedActions(category);
            }
        }, 1000);

        setTimeout(() => {
            timerBarLeft.style.transform = 'scaleX(1)';
            timerBarRight.style.transform = 'scaleX(1)';
            diamond.style.animation = 'beat 1s infinite'; // Start the diamond beating animation
        }, 100); // Start the animation slightly after the page load to ensure visibility
    }

    function hideTimer() {
        timerContainer.style.display = "none"; // Hide the entire timer container
    }

    function ruptureBoxes() {
        const boxes = document.querySelectorAll(".box");
        boxes.forEach(box => {
            box.classList.add('rupture'); // Apply rupture animation
            timeouts.push(setTimeout(() => box.style.display = "none", 1000)); // Hide the box after rupture animation
        });
    }

    function displayImages(category) {
        const imageContainers = document.querySelectorAll(".image-container");
        const images = document.querySelectorAll(".image");
        const randomImages = getRandomImages(category);

        images.forEach((image, index) => {
            const imageContainer = imageContainers[index];
            image.src = randomImages[index];
            console.log(`Attempting to load image: ${image.src}`); // Log image path
            image.onload = () => {
                image.style.transform = "translateY(0)";
                image.style.opacity = "1";

                // Show win overlay if the image is a winning image
                const imageFilename = image.src.split('/').pop();
                if (imageFilename.startsWith('win')) {
                    imageContainer.querySelector('.win-overlay').style.display = 'block';
                }
            };
            image.style.display = "block";
            image.onerror = () => {
                console.error(`Failed to load image: ${image.src}`);
                // Handle failed image load, e.g., display a placeholder image or retry loading
                image.src = 'path/to/placeholder.png'; // Provide a path to a placeholder image
            };
        });
    }

    function removeImages() {
        const images = document.querySelectorAll(".image");
        const overlays = document.querySelectorAll(".win-overlay");
        images.forEach(image => {
            image.style.opacity = "0"; 
            timeouts.push(setTimeout(() => {
                image.style.display = "none";
            }, 1000)); 
        });

        overlays.forEach(overlay => {
            overlay.style.display = "none";
        });

        // Reset boxes for next iteration
        const boxes = document.querySelectorAll(".box");
        boxes.forEach(box => {
            box.style.display = "block";
            box.classList.remove('rupture');
        });

        // Reset diamond
        diamond.classList.remove('rupture');
        diamond.style.display = "block";
        diamond.style.animation = 'none'; // Stop the diamond animation to reset it
    }

    function resetProcess() {
        // Reset timer bars
        timerContainer.style.display = "block";
        timerBarLeft.style.transform = 'scaleX(0)';
        timerBarRight.style.transform = 'scaleX(0)';

        // Restart the countdown
        startCountdown(5);
    }

    function executeTimedActions(category) {
        hideTimer();
        clockAlarm.play();
        timeouts.push(setTimeout(() => clockAlarm.pause(), 500)); // Stop the clock alarm after 0.5 seconds
        timeouts.push(setTimeout(ruptureBoxes, 100)); // Delay to ensure timer is hidden before boxes rupture
        timeouts.push(setTimeout(() => displayImages(category), 1100)); // Wait for boxes to disappear before showing the images
        timeouts.push(setTimeout(removeImages, 4000)); // Images stay visible for 2.1 seconds
        timeouts.push(setTimeout(resetProcess, 5000)); // Restart the process after 3.5 seconds
    }

    startCountdown(5);
});
=======
document.addEventListener("DOMContentLoaded", function() {
    const timerContainer = document.getElementById("timer-container");
    const timerBarLeft = document.getElementById("timer-bar-left");
    const timerBarRight = document.getElementById("timer-bar-right");
    const diamond = document.getElementById("diamond");
    const categoryMessage = document.getElementById("category-message");

    const clockAlarm = document.getElementById("clock-alarm");
    const backgroundMusic = document.getElementById("background-music");

    let countdownInterval;
    let remainingTime;
    let timeouts = [];

    // Start background music when the page loads
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // Set volume to 50%
    backgroundMusic.play().catch(error => {
        console.log('Autoplay was prevented. Click to start the music.');
        document.body.addEventListener('click', () => {
            backgroundMusic.play();
        }, { once: true });
    });

    // Categories of images
    const categories = {
        houses: {
            lose: Array.from({ length: 12 }, (_, i) => `lose/houses/lose-house${i + 1}.png`),
            win: Array.from({ length: 6 }, (_, i) => `win/houses/win-house${i + 1}.png`)
        },
        animals: {
            lose: Array.from({ length: 6 }, (_, i) => `lose/animals/lose-animal${i + 1}.png`),
            win: Array.from({ length: 3 }, (_, i) => `win/animals/win-animal${i + 1}.png`)
        },
        watches: {
            lose: Array.from({ length: 8 }, (_, i) => `lose/watches/lose-watch${i + 1}.png`),
            win: Array.from({ length: 4 }, (_, i) => `win/watches/win-watch${i + 1}.png`)
        },
        challenge: {
            lose: Array.from({ length: 2 }, (_, i) => `lose/challenge/lose-challenge${i + 1}.png`),
            win: Array.from({ length: 1 }, (_, i) => `win/challenge/win-challenge${i + 1}.png`)
        },
        bedrooms: {
            lose: Array.from({ length: 4 }, (_, i) => `lose/bedrooms/lose-bedroom${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/bedrooms/win-bedroom${i + 1}.png`)
        },
        cars: {
            lose: Array.from({ length: 4 }, (_, i) => `lose/cars/lose-car${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/cars/win-car${i + 1}.png`)
        },
        motorcycles: {
            lose: Array.from({ length: 4 }, (_, i) => `lose/motorcycles/lose-motorcycle${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/motorcycles/win-motorcycle${i + 1}.png`)
        },
        shoes: {
            lose: Array.from({ length: 3 }, (_, i) => `lose/shoes/lose-shoe${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/shoes/win-shoe${i + 1}.png`)
        },
        hair: {
            lose: Array.from({ length: 4 }, (_, i) => `lose/hair/lose-hair${i + 1}.png`),
            win: Array.from({ length: 2 }, (_, i) => `win/hair/win-hair${i + 1}.png`)
        }
    };

    let availableImages = {
        houses: { ...categories.houses },
        animals: { ...categories.animals },
        watches: { ...categories.watches },
        challenge: { ...categories.challenge },
        bedrooms: { ...categories.bedrooms },
        cars: { ...categories.cars },
        motorcycles: { ...categories.motorcycles },
        shoes: { ...categories.shoes },
        hair: { ...categories.hair }
    };

    let usedCategories = [];

    function getRandomCategory() {
        if (usedCategories.length === Object.keys(categories).length) {
            usedCategories = []; // Reset used categories after all have been used
        }

        let availableCategories = Object.keys(categories).filter(cat => !usedCategories.includes(cat));
        const randomIndex = Math.floor(Math.random() * availableCategories.length);
        const selectedCategory = availableCategories[randomIndex];
        usedCategories.push(selectedCategory);

        return selectedCategory;
    }

    function generateMessage(category) {
        let categoryName;
        let emoji;
        switch (category) {
            case 'houses':
                categoryName = 'house';
                emoji = '🏠';
                break;
            case 'animals':
                categoryName = 'animal';
                emoji = '🐶';
                break;
            case 'watches':
                categoryName = 'watch';
                emoji = '⌚';
                break;
            case 'challenge':
                categoryName = 'challenge';
                emoji = '🏆';
                break;
            case 'bedrooms':
                categoryName = 'bedroom';
                emoji = '🛏️';
                break;
            case 'cars':
                categoryName = 'car';
                emoji = '🚗';
                break;
            case 'motorcycles':
                categoryName = 'motorcycle';
                emoji = '🏍️';
                break;
            case 'shoes':
                categoryName = 'shoe';
                emoji = '👟';
                break;
            case 'hair':
                categoryName = 'hair';
                emoji = '💇‍♂️';
                break;
            default:
                categoryName = '';
                emoji = '';
        }
        return `Choose your ${categoryName} ${emoji}`;
    }

    function speakMessage(message) {
        const messageWithoutEmoji = message.replace(/[^\w\s]/gi, ''); // Remove emojis
        const utterance = new SpeechSynthesisUtterance(messageWithoutEmoji.trim());
        window.speechSynthesis.speak(utterance);
    }

    function getRandomImages(category) {
        let { lose, win } = availableImages[category];

        // Ensure there are enough images to select from
        if (lose.length < 2 || win.length === 0) {
            availableImages[category] = { ...categories[category] }; // Reset category if all images have been shown
            lose = availableImages[category].lose;
            win = availableImages[category].win;
        }

        // Shuffle and select images
        const shuffledLose = lose.sort(() => 0.5 - Math.random());
        const nonWinningImages = shuffledLose.slice(0, 2);
        const winningImage = win[Math.floor(Math.random() * win.length)];

        // Remove selected images from available lists
        availableImages[category].lose = lose.filter(img => !nonWinningImages.includes(img));
        availableImages[category].win = win.filter(img => img !== winningImage);

        console.log(`Selected images from category ${category}:`, [...nonWinningImages, winningImage]);

        return [...nonWinningImages, winningImage].sort(() => 0.5 - Math.random());
    }

    function startCountdown(seconds) {
        const category = getRandomCategory();
        const message = generateMessage(category);

        // Display and speak the message
        categoryMessage.textContent = message;
        speakMessage(message);

        remainingTime = seconds;
        countdownInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                categoryMessage.textContent = ""; // Hide the message
                executeTimedActions(category);
            }
        }, 1000);

        setTimeout(() => {
            timerBarLeft.style.transform = 'scaleX(1)';
            timerBarRight.style.transform = 'scaleX(1)';
            diamond.style.animation = 'beat 1s infinite'; // Start the diamond beating animation
        }, 100); // Start the animation slightly after the page load to ensure visibility
    }

    function hideTimer() {
        timerContainer.style.display = "none"; // Hide the entire timer container
    }

    function ruptureBoxes() {
        const boxes = document.querySelectorAll(".box");
        boxes.forEach(box => {
            box.classList.add('rupture'); // Apply rupture animation
            timeouts.push(setTimeout(() => box.style.display = "none", 1000)); // Hide the box after rupture animation
        });
    }

    function displayImages(category) {
        const imageContainers = document.querySelectorAll(".image-container");
        const images = document.querySelectorAll(".image");
        const randomImages = getRandomImages(category);

        images.forEach((image, index) => {
            const imageContainer = imageContainers[index];
            image.src = randomImages[index];
            console.log(`Attempting to load image: ${image.src}`); // Log image path
            image.onload = () => {
                image.style.transform = "translateY(0)";
                image.style.opacity = "1";

                // Show win overlay if the image is a winning image
                const imageFilename = image.src.split('/').pop();
                if (imageFilename.startsWith('win')) {
                    imageContainer.querySelector('.win-overlay').style.display = 'block';
                }
            };
            image.style.display = "block";
            image.onerror = () => {
                console.error(`Failed to load image: ${image.src}`);
                // Handle failed image load, e.g., display a placeholder image or retry loading
                image.src = 'path/to/placeholder.png'; // Provide a path to a placeholder image
            };
        });
    }

    function removeImages() {
        const images = document.querySelectorAll(".image");
        const overlays = document.querySelectorAll(".win-overlay");
        images.forEach(image => {
            image.style.opacity = "0"; 
            timeouts.push(setTimeout(() => {
                image.style.display = "none";
            }, 1000)); 
        });

        overlays.forEach(overlay => {
            overlay.style.display = "none";
        });

        // Reset boxes for next iteration
        const boxes = document.querySelectorAll(".box");
        boxes.forEach(box => {
            box.style.display = "block";
            box.classList.remove('rupture');
        });

        // Reset diamond
        diamond.classList.remove('rupture');
        diamond.style.display = "block";
        diamond.style.animation = 'none'; // Stop the diamond animation to reset it
    }

    function resetProcess() {
        // Reset timer bars
        timerContainer.style.display = "block";
        timerBarLeft.style.transform = 'scaleX(0)';
        timerBarRight.style.transform = 'scaleX(0)';

        // Restart the countdown
        startCountdown(5);
    }

    function executeTimedActions(category) {
        hideTimer();
        clockAlarm.play();
        timeouts.push(setTimeout(() => clockAlarm.pause(), 500)); // Stop the clock alarm after 0.5 seconds
        timeouts.push(setTimeout(ruptureBoxes, 100)); // Delay to ensure timer is hidden before boxes rupture
        timeouts.push(setTimeout(() => displayImages(category), 1100)); // Wait for boxes to disappear before showing the images
        timeouts.push(setTimeout(removeImages, 4000)); // Images stay visible for 2.1 seconds
        timeouts.push(setTimeout(resetProcess, 5000)); // Restart the process after 3.5 seconds
    }

    startCountdown(5);
});
>>>>>>> 67d8dc1e535021f2b7edf1d588ddd42d1f4dcf02
