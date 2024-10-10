require("dotenv").config();
const { Bot, GrammyError, HttpError, session } = require("grammy");
const {
  commands,
  keyboard,
  menuButton,
  inlineAdminKeyboard,
  inlineKeyboardsCommands,
} = require("../constants/keyboard");
const { jobApplication } = require("./conversations");
const { hydrateApi, hydrateContext } = require("@grammyjs/hydrate");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

// Получаем токен из .env
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN не установлен");

// Инициализируем бота
const bot = new Bot(token);

// Добавляем меню для раздела FAQ
// bot.use(faqInlineMenu);

// Устанавливаем сессию для хранения данных
bot.use(session({ initial: () => ({ phone: "", name: "" }) }));

// Подключаем плагины
bot.use(hydrateContext());
bot.use(conversations());

// Добавляем команды и плагин к api
bot.api.setMyCommands(commands);
bot.api.config.use(hydrateApi());

// Инициализируем выход из диалога.
// Должен быть установлен до начала диалога.
bot.callbackQuery(
  [inlineKeyboardsCommands.submit.yes, inlineKeyboardsCommands.notFinished.yes],
  async (ctx) => {
    await ctx.conversation.exit("jobApplication");
    await bot.api.sendMessage(
      process.env.NODE_ENV === "development"
        ? process.env.ADMIN_ID
        : process.env.MAX_ID,
      `📌\nПришла заявка из бота Ток-Так.рф\n<b>Имя:</b> ${ctx.session.name}\n<b>Телефон:</b> ${ctx.session.phone}`,
      { parse_mode: "HTML", reply_markup: inlineAdminKeyboard }
    );
    await ctx.answerCallbackQuery();
    await ctx.reply(
      "🌞 Спасибо! Ваша заявка отправлена. Мы скоро вам перезвоним"
    );
  }
);

bot.callbackQuery(inlineKeyboardsCommands.notFinished.no, async (ctx) => {
  await ctx.conversation.exit("jobApplication");
  await ctx.answerCallbackQuery();
  await ctx.reply("Заявка не отправлена");
});

// Добавлям диалог
bot.use(createConversation(jobApplication));

// Добавляем слушатели событий
bot.command(["start", "help"], async (ctx) => {
  await ctx.reply(
    "<b>Добро пожаловать в Ток-Так.рф бота!</b>\nВ этом боте вы сможете заказать наши услуги",
    { parse_mode: "HTML" }
  );
  await ctx.reply("С чего начнем? 👇", {
    reply_markup: keyboard,
  });
});

/**
 * Не отображается в списке команд
 * Нужна для получения telegram id пользователя
 * Может пригодиться для добавления пользователя в админы
 */
bot.command("id", async (ctx) => {
  await ctx.reply(`Ваш telegram ID: ${ctx.from.id}`);
});

bot.hears([menuButton.zakaz, "/zakaz"], async (ctx) => {
  await ctx.conversation.enter("jobApplication");
});

// Слушатель для раздела FAQ
// bot.hears(menuButton.faq, async (ctx) => {
//   await ctx.reply("Что вы хотите узнать? 👇", {
//     reply_markup: faqInlineMenu,
//   });
// });

bot.callbackQuery("contacted", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.callbackQuery.message.editText(
    ctx.callbackQuery.message.text.replace("📌", "✅"),
    { parse_mode: "HTML" }
  );
});

// Обработка ошибок. https://grammy.dev/ru/guide/errors
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Ошибка в запросе:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Не удалось связаться с Telegram:", e);
  } else {
    console.error("Неизвестная ошибка:", e);
  }
});

bot.start();
