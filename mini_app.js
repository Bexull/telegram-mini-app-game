// Telegram Mini App JavaScript
class NumberGuessingGame {
    constructor() {
        this.secretNumber = this.generateSecretNumber();
        this.attempts = 0;
        this.minRange = 1;
        this.maxRange = 100;
        this.gameEnded = false;
        
        this.initializeTelegramWebApp();
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeTelegramWebApp() {
        // Инициализация Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            this.tg = window.Telegram.WebApp;
            
            // Настройка темы
            this.tg.ready();
            this.tg.expand();
            
            // Настройка главной кнопки
            this.tg.MainButton.setText("🎮 Новая игра");
            this.tg.MainButton.onClick(() => {
                this.startNewGame();
            });
            
            // Настройка кнопки "Назад"
            this.tg.BackButton.onClick(() => {
                this.tg.close();
            });
            
            // Обработка изменения темы
            this.tg.onEvent('themeChanged', () => {
                this.updateTheme();
            });
        }
    }

    initializeElements() {
        this.guessInput = document.getElementById('guess-input');
        this.guessButton = document.getElementById('guess-button');
        this.newGameButton = document.getElementById('new-game-button');
        this.hintButton = document.getElementById('hint-button');
        this.attemptsCount = document.getElementById('attempts-count');
        this.rangeDisplay = document.getElementById('range-display');
        this.resultMessage = document.getElementById('result-message');
        
        // Проверяем, что все элементы найдены
        if (!this.guessInput || !this.guessButton || !this.newGameButton || !this.hintButton) {
            console.error('Не найдены необходимые элементы!');
            return;
        }
        
        console.log('Все элементы инициализированы успешно');
    }

    setupEventListeners() {
        // Проверяем, что элементы существуют перед добавлением слушателей
        if (this.guessButton) {
            this.guessButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Кнопка "Угадать" нажата');
                this.makeGuess();
            });
        }
        
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Кнопка "Новая игра" нажата');
                this.startNewGame();
            });
        }
        
        if (this.hintButton) {
            this.hintButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Кнопка "Подсказка" нажата');
                this.showHint();
            });
        }
        
        if (this.guessInput) {
            this.guessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Enter нажат в поле ввода');
                    this.makeGuess();
                }
            });

            this.guessInput.addEventListener('input', () => {
                this.validateInput();
            });
        }
        
        console.log('Слушатели событий настроены');
    }

    generateSecretNumber() {
        return Math.floor(Math.random() * 100) + 1;
    }

    validateInput() {
        const value = parseInt(this.guessInput.value);
        const isValid = value >= this.minRange && value <= this.maxRange;
        
        this.guessButton.disabled = !isValid || this.gameEnded;
        
        if (this.guessInput.value && !isValid) {
            this.guessInput.style.borderColor = '#dc3545';
        } else {
            this.guessInput.style.borderColor = '';
        }
    }

    makeGuess() {
        if (this.gameEnded) return;

        const guess = parseInt(this.guessInput.value);
        
        if (isNaN(guess) || guess < this.minRange || guess > this.maxRange) {
            this.showResult('Пожалуйста, введите число от ' + this.minRange + ' до ' + this.maxRange + '!', 'error');
            this.shakeInput();
            return;
        }

        this.attempts++;
        this.updateDisplay();

        if (guess === this.secretNumber) {
            this.gameWon();
        } else if (guess < this.secretNumber) {
            this.minRange = guess + 1;
            this.showResult(`📈 Больше! Попытка #${this.attempts}`, 'hint');
        } else {
            this.maxRange = guess - 1;
            this.showResult(`📉 Меньше! Попытка #${this.attempts}`, 'hint');
        }

        this.guessInput.value = '';
        this.validateInput();
    }

    gameWon() {
        this.gameEnded = true;
        const message = `🎉 Поздравляю! Ты угадал число ${this.secretNumber}!\nКоличество попыток: ${this.attempts}`;
        this.showResult(message, 'success');
        
        // Вибрация при победе
        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.notificationOccurred('success');
        }
        
        // Обновление кнопки Telegram
        if (this.tg) {
            this.tg.MainButton.setText("🎮 Новая игра");
            this.tg.MainButton.show();
        }
    }

    startNewGame() {
        this.secretNumber = this.generateSecretNumber();
        this.attempts = 0;
        this.minRange = 1;
        this.maxRange = 100;
        this.gameEnded = false;
        
        this.guessInput.value = '';
        this.showResult('🎯 Новая игра началась! Я загадал число от 1 до 100.', 'hint');
        this.updateDisplay();
        this.validateInput();
        
        // Вибрация при новой игре
        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    }

    showHint() {
        if (this.gameEnded) return;
        
        const hint = this.generateHint();
        this.showResult(hint, 'hint');
        
        // Вибрация при подсказке
        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }
    }

    generateHint() {
        const hints = [
            `💡 Число ${this.secretNumber > 50 ? 'больше' : 'меньше'} 50`,
            `💡 Число ${this.secretNumber % 2 === 0 ? 'четное' : 'нечетное'}`,
            `💡 Сумма цифр: ${this.getDigitSum(this.secretNumber)}`,
            `💡 Число ${this.secretNumber > 75 ? 'больше' : this.secretNumber < 25 ? 'меньше' : 'между'} 25 и 75`
        ];
        
        return hints[Math.floor(Math.random() * hints.length)];
    }

    getDigitSum(number) {
        return number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }

    showResult(message, type) {
        this.resultMessage.textContent = message;
        this.resultMessage.className = `result-message ${type}`;
        
        // Анимация
        this.resultMessage.classList.add('pulse');
        setTimeout(() => {
            this.resultMessage.classList.remove('pulse');
        }, 300);
    }

    shakeInput() {
        this.guessInput.classList.add('shake');
        setTimeout(() => {
            this.guessInput.classList.remove('shake');
        }, 500);
    }

    updateDisplay() {
        this.attemptsCount.textContent = this.attempts;
        this.rangeDisplay.textContent = `${this.minRange} - ${this.maxRange}`;
    }

    updateTheme() {
        // Обновление темы при изменении
        document.body.style.background = this.tg.themeParams.bg_color || '#ffffff';
        document.body.style.color = this.tg.themeParams.text_color || '#000000';
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализируем игру...');
    
    // Проверяем наличие необходимых элементов
    const requiredElements = ['guess-input', 'guess-button', 'new-game-button', 'hint-button'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Отсутствуют элементы:', missingElements);
    } else {
        console.log('Все необходимые элементы найдены');
    }
    
    try {
        new NumberGuessingGame();
        console.log('Игра успешно инициализирована');
    } catch (error) {
        console.error('Ошибка при инициализации игры:', error);
    }
});

// Обработка изменения размера экрана
window.addEventListener('resize', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
    }
});
