import asyncio
import random
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery

# Токен бота (замените на свой)
BOT_TOKEN = "8390538420:AAEK5WxNfdX8jIXJlvvNpy5B1t65a6DYn_Y"

# Создаем бота и диспетчер
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Словарь для хранения состояния игры каждого пользователя
user_games = {}

class GameState:
    def __init__(self):
        self.secret_number = random.randint(1, 100)
        self.attempts = 0
        self.is_playing = True

@dp.message(Command("start"))
async def start_command(message: Message):
    """Обработчик команды /start"""
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🎮 Играть в чате", callback_data="play_chat")],
        [InlineKeyboardButton(
            text="📱 Мини-приложение", 
            web_app={"url": "https://telegram-mini-app-game-4rzbj4e0w-bexulls-projects.vercel.app/"}
        )]
    ])
    
    await message.answer(
        "🎮 Добро пожаловать в игру 'Угадай число'!\n\n"
        "Выберите способ игры:\n"
        "💬 В чате - простая игра в сообщениях\n"
        "📱 Мини-приложение - красивый интерфейс с анимациями",
        reply_markup=keyboard
    )

@dp.message(Command("game"))
async def start_game(message: Message):
    """Начать новую игру"""
    user_id = message.from_user.id
    user_games[user_id] = GameState()
    
    await message.answer(
        f"🎯 Новая игра началась!\n"
        f"Я загадал число от 1 до 100.\n"
        f"Попробуй угадать! Напиши число."
    )

@dp.message(Command("help"))
async def help_command(message: Message):
    """Показать помощь"""
    await message.answer(
        "🎮 Команды бота:\n"
        "/start - Начать работу с ботом\n"
        "/game - Начать новую игру\n"
        "/mini_app - Открыть мини-приложение\n"
        "/help - Показать эту справку\n\n"
        "В игре нужно угадать число от 1 до 100.\n"
        "Я буду подсказывать 'больше' или 'меньше'!\n\n"
        "💡 Попробуй мини-приложение для лучшего опыта!"
    )

@dp.message(Command("mini_app"))
async def mini_app_command(message: Message):
    """Открыть мини-приложение"""
    # Создаем кнопку для открытия мини-приложения
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🎮 Открыть игру",
            web_app={"url": "https://telegram-mini-app-game-4rzbj4e0w-bexulls-projects.vercel.app/"}
        )]
    ])
    
    await message.answer(
        "🎮 Откройте мини-приложение для игры!\n\n"
        "В мини-приложении вы получите:\n"
        "✨ Красивый интерфейс\n"
        "🎯 Подсказки и анимации\n"
        "📱 Нативную интеграцию с Telegram",
        reply_markup=keyboard
    )

@dp.message()
async def handle_message(message: Message):
    """Обработчик всех сообщений"""
    user_id = message.from_user.id
    
    # Проверяем, играет ли пользователь
    if user_id not in user_games or not user_games[user_id].is_playing:
        await message.answer(
            "Сначала начни игру командой /game!"
        )
        return
    
    try:
        # Пытаемся преобразовать сообщение в число
        guess = int(message.text)
        
        if guess < 1 or guess > 100:
            await message.answer("Число должно быть от 1 до 100!")
            return
        
        game = user_games[user_id]
        game.attempts += 1
        
        if guess == game.secret_number:
            # Пользователь угадал!
            await message.answer(
                f"🎉 Поздравляю! Ты угадал число {game.secret_number}!\n"
                f"Количество попыток: {game.attempts}\n\n"
                f"Используй /game для новой игры!"
            )
            game.is_playing = False
            
        elif guess < game.secret_number:
            await message.answer(f"📈 Больше! Попытка #{game.attempts}")
        else:
            await message.answer(f"📉 Меньше! Попытка #{game.attempts}")
            
    except ValueError:
        await message.answer("Пожалуйста, введи число от 1 до 100!")

@dp.callback_query(lambda c: c.data == "play_chat")
async def play_chat_callback(callback_query: CallbackQuery):
    """Обработчик кнопки 'Играть в чате'"""
    await callback_query.answer()
    user_id = callback_query.from_user.id
    user_games[user_id] = GameState()
    
    await callback_query.message.edit_text(
        f"🎯 Игра в чате началась!\n"
        f"Я загадал число от 1 до 100.\n"
        f"Попробуй угадать! Напиши число."
    )

async def main():
    """Главная функция"""
    print("🤖 Бот запускается...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
